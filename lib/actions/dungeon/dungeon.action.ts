'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import Item from '@/lib/models/item.model';
import Package from '@/lib/models/package.model';
import Mercenary from '@/lib/models/mercenary.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import { calculateExperience, calculatePower } from '@/lib/utils/characterUtils';
import { rollExpeditionDrop } from '@/lib/utils/expeditionDrop';
import {
  DUNGEONS,
  DUNGEON_ORDER,
  DungeonId,
} from '@/constants/dungeons';
import { mercenaryPower } from '@/constants/mercenaries';

async function getMyCharacter() {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return null;
  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    const user = await User.findById(userId).populate({ path: 'character', model: Character });
    return user?.character ?? null;
  } catch {
    return null;
  }
}

export async function listDungeons() {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const level = character.level ?? 1;
  const completed: string[] = character.completedDungeons ?? [];

  const rows = DUNGEON_ORDER.map((id) => {
    const d = DUNGEONS[id];
    return {
      id: d.id,
      name: d.name,
      country: d.country,
      parentExpedition: d.parentExpedition,
      entryLevel: d.entryLevel,
      bossName: d.bossName,
      bossLevel: d.bossLevel,
      description: d.description,
      goldReward: d.goldReward,
      xpReward: d.xpReward,
      unlocked: level >= d.entryLevel,
      cleared: completed.includes(d.id),
    };
  });
  return { ok: true, dungeons: rows };
}

// Auto-resolve combat: sum of player + owned mercenary power vs a
// boss-level-scaled difficulty. Win chance is clamped so even a
// mismatched party has a small chance, and a strong party isn't a
// guaranteed clear.
const BOSS_POWER_COEF = 90;

export async function runDungeon({ dungeonId }: { dungeonId: DungeonId }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const dungeon = DUNGEONS[dungeonId];
  if (!dungeon) return { error: { message: 'Unknown dungeon' } };
  if ((character.level ?? 1) < dungeon.entryLevel) {
    return { error: { message: `Unlocks at level ${dungeon.entryLevel}` } };
  }

  // Same "no expeditioning while at work" guard as solo combat -- a
  // dungeon run is a long fight, no different to a job.
  if (character.currentWork) {
    return { error: { message: 'You are at work right now. Claim or cancel your shift first.' } };
  }

  const mercs = await Mercenary.find({ owner: character._id });
  const playerPower = calculatePower(character);
  const mercPower = mercs.reduce((sum: number, m: any) => sum + mercenaryPower({
    level: m.level, quality: m.quality, type: m.type, stats: m.stats,
  }), 0);
  const partyPower = playerPower + mercPower;
  const bossPower = dungeon.bossLevel * BOSS_POWER_COEF;
  const winChance = Math.max(0.1, Math.min(0.95, partyPower / (partyPower + bossPower)));
  const won = Math.random() < winChance;

  let droppedItemSummary: { itemId: any; name: string; quality: string; image: string } | null = null;
  let xpGained = 0;
  let goldGained = 0;

  if (won) {
    // Guaranteed boss drop. Reuses the expedition drop roll forced
    // to boss tier + a small quality bonus so dungeons feel better
    // than equivalent-level expedition farming.
    let dropAttempts = 0;
    while (!droppedItemSummary && dropAttempts < 5) {
      const drop = rollExpeditionDrop({
        enemyLevel: dungeon.bossLevel,
        enemyType: 'boss',
        searchMode: 'thorough',
      });
      dropAttempts++;
      if (drop.dropped && drop.template) {
        const quality = drop.quality === 'green' ? 'blue' : drop.quality;
        const created = await Item.create({
          ...drop.template,
          level: drop.itemLevel ?? drop.template.level,
          quality,
          owner: character._id,
        });
        if (drop.template.itemId && created._id) {
          created.id = `${drop.template.itemId}-${created._id}`;
          await created.save();
        }
        await Package.create({
          owner: character._id,
          item: created._id,
          source: 'dungeon',
          detail: `${dungeon.name} - ${dungeon.bossName}`,
        });
        character.itemsFound = (character.itemsFound ?? 0) + 1;
        droppedItemSummary = {
          itemId: created._id,
          name: created.name,
          quality: created.quality ?? 'common',
          image: created.image,
        };
      }
    }

    goldGained = dungeon.goldReward;
    xpGained = dungeon.xpReward;
    character.crowns = (character.crowns ?? 0) + goldGained;

    // XP application -- mirrors battleEnemy: roll over the threshold
    // applies one level-up per run, the rest accumulates.
    const need = calculateExperience(character.level ?? 1);
    if ((character.experience ?? 0) + xpGained >= need) {
      character.experience = (character.experience ?? 0) + xpGained - need;
      character.level = (character.level ?? 1) + 1;
    } else {
      character.experience = (character.experience ?? 0) + xpGained;
    }

    if (!(character.completedDungeons ?? []).includes(dungeon.id)) {
      character.completedDungeons = [...(character.completedDungeons ?? []), dungeon.id];
    }
  } else {
    // Small consolation gold so a wipe isn't a pure loss.
    goldGained = Math.round(dungeon.goldReward * 0.05);
    character.crowns = (character.crowns ?? 0) + goldGained;
  }

  await character.save();

  revalidatePath('/game/dungeons');
  revalidatePath('/game/packages');

  return {
    ok: true,
    won,
    partyPower,
    bossPower,
    winChance: Math.round(winChance * 100),
    goldGained,
    xpGained: won ? xpGained : 0,
    drop: droppedItemSummary,
    dungeon: { id: dungeon.id, name: dungeon.name, bossName: dungeon.bossName },
  };
}
