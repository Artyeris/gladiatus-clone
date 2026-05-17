'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import Quest from '@/lib/models/quest.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import { calculateExperience } from '@/lib/utils/characterUtils';
import { sendMessageToCharacter } from '@/lib/actions/message/message.action';
import {
  MAX_ACTIVE_QUESTS,
  QUEST_TEMPLATES,
  QuestVerb,
  findQuestTemplate,
} from '@/constants/quests';
import type { QuestView } from '@/lib/types/quest';

async function getMyCharacter() {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return null;
  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    const user = await User.findById(userId).populate({ path: 'character', model: Character });
    if (!user?.character) return null;
    return user.character as any;
  } catch {
    return null;
  }
}

function viewOf(doc: any): QuestView {
  return {
    _id: String(doc._id),
    templateId: doc.templateId,
    category: doc.category,
    verb: doc.verb,
    title: doc.title,
    target: doc.target,
    progress: doc.progress ?? 0,
    rewardGold: doc.rewardGold ?? 0,
    rewardExp: doc.rewardExp ?? 0,
    ready: (doc.progress ?? 0) >= doc.target,
  };
}

export async function listMyQuests(): Promise<{
  quests: QuestView[];
  max: number;
  availableTemplateIds: string[];
}> {
  const character = await getMyCharacter();
  if (!character) return { quests: [], max: MAX_ACTIVE_QUESTS, availableTemplateIds: [] };

  const docs = await Quest.find({ owner: character._id }).sort({ acceptedAt: 1 }).lean();
  const activeIds = new Set(docs.map((d: any) => d.templateId));
  const availableTemplateIds = QUEST_TEMPLATES
    .filter((t) => !activeIds.has(t.id))
    .map((t) => t.id);

  return {
    quests: docs.map(viewOf),
    max: MAX_ACTIVE_QUESTS,
    availableTemplateIds,
  };
}

// Accept a random quest the character doesn't already have. Mirrors
// the "New quest" button on the Gladiatus quests panel -- the player
// can't cherry-pick which one drops.
export async function acceptRandomQuest() {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  await connectToDB();
  const activeCount = await Quest.countDocuments({ owner: character._id });
  if (activeCount >= MAX_ACTIVE_QUESTS) {
    return { error: { message: `Already at the ${MAX_ACTIVE_QUESTS}-quest limit` } };
  }

  const activeDocs = await Quest.find({ owner: character._id }, { templateId: 1 }).lean();
  const activeIds = new Set(activeDocs.map((d: any) => d.templateId));
  const eligible = QUEST_TEMPLATES.filter((t) => !activeIds.has(t.id));
  if (eligible.length === 0) {
    return { error: { message: 'No new quests available right now' } };
  }

  const pick = eligible[Math.floor(Math.random() * eligible.length)];
  try {
    await Quest.create({
      owner: character._id,
      templateId: pick.id,
      category: pick.category,
      verb: pick.verb,
      title: pick.title,
      target: pick.target,
      rewardGold: pick.rewardGold,
      rewardExp: pick.rewardExp,
    });
    revalidatePath('/game/quests');
    return { ok: true, accepted: pick.title };
  } catch (err: any) {
    console.log(`${new Date()} - acceptRandomQuest failed - ${err}`);
    return { error: { message: err?.message || 'Failed to accept quest' } };
  }
}

export async function abandonQuest({ id }: { id: string }) {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  try {
    await connectToDB();
    await Quest.deleteOne({ _id: id, owner: character._id });
    revalidatePath('/game/quests');
    return { ok: true };
  } catch (err: any) {
    console.log(`${new Date()} - abandonQuest failed - ${err}`);
    return { error: { message: err?.message || 'Failed to abandon' } };
  }
}

export async function claimQuest({ id }: { id: string }) {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  try {
    await connectToDB();
    const quest = await Quest.findOne({ _id: id, owner: character._id });
    if (!quest) return { error: { message: 'Quest not found' } };
    if ((quest.progress ?? 0) < quest.target) {
      return { error: { message: 'Quest is not complete yet' } };
    }

    const gold = quest.rewardGold ?? 0;
    const exp  = quest.rewardExp  ?? 0;

    character.crowns = (character.crowns ?? 0) + gold;
    let charExp = (character.experience ?? 0) + exp;
    let level = character.level ?? 1;
    let leveledUp = false;
    while (charExp >= calculateExperience(level)) {
      charExp -= calculateExperience(level);
      level += 1;
      leveledUp = true;
    }
    character.experience = charExp;
    if (leveledUp) character.level = level;
    await character.save();

    await Quest.deleteOne({ _id: id, owner: character._id });

    try {
      await sendMessageToCharacter(
        String(character._id),
        'system',
        `Quest reward: ${quest.title}`,
        `You claimed +${gold} crowns and +${exp} XP for completing "${quest.title}".`
          + (leveledUp ? `\n\nYou levelled up to ${character.level}!` : ''),
      );
    } catch {}

    revalidatePath('/game/quests');
    revalidatePath('/game/overview');
    return { ok: true, gold, exp, leveledUp };
  } catch (err: any) {
    console.log(`${new Date()} - claimQuest failed - ${err}`);
    return { error: { message: err?.message || 'Failed to claim' } };
  }
}

// Internal hook: gameplay actions call this whenever a quest-relevant
// event happens (arena fight, expedition kill, work shift, item
// drop). Increments matching active quests and caps at target so a
// 20-kill bonus doesn't overshoot a 5-kill quest. Safe to call with
// missing character / unknown verb -- no-ops in that case.
export async function trackQuestProgress({
  characterId, verb, amount = 1,
}: { characterId: string | any; verb: QuestVerb; amount?: number }) {
  if (!characterId || !verb || amount <= 0) return;
  try {
    await connectToDB();
    const active = await Quest.find({ owner: characterId, verb }).lean();
    for (const q of active as any[]) {
      const next = Math.min((q.progress ?? 0) + amount, q.target);
      if (next === q.progress) continue;
      await Quest.updateOne({ _id: q._id }, { $set: { progress: next } });
    }
  } catch (err) {
    console.log(`${new Date()} - trackQuestProgress(${verb}) failed - ${err}`);
  }
}
