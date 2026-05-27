'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import Item from '@/lib/models/item.model';
import Package from '@/lib/models/package.model';
import Mercenary from '@/lib/models/mercenary.model';
import DungeonRun from '@/lib/models/dungeonRun.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import { calculateExperience, calculatePower } from '@/lib/utils/characterUtils';
import { combatBreakdown } from '@/lib/utils/combatBreakdown';
import { rollExpeditionDrop } from '@/lib/utils/expeditionDrop';
import { mercenaryBreakdown } from '@/lib/utils/mercenaryBreakdown';
import { canFight } from '@/lib/utils';
import { DUNGEON_COOLDOWN } from '@/constants';
import {
  DUNGEONS,
  DUNGEON_ORDER,
  DungeonId,
} from '@/constants/dungeons';

const EQUIPMENT_SLOTS = [
  'head', 'chest', 'legs', 'gloves', 'cloak', 'boots',
  'mainHand', 'offHand', 'necklace', 'ring1', 'ring2',
];
type PartySlot = 'tank' | 'healer' | 'damage1' | 'damage2' | 'damage3';
const PARTY_SLOTS: PartySlot[] = ['tank', 'healer', 'damage1', 'damage2', 'damage3'];
const BOSS_POWER_COEF = 90;
const TOTAL_STEPS = 4; // 3 trash + 1 boss

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

// --- Party slots ---

export async function setDungeonPartySlot({
  slot, source,
}: { slot: string; source: string | null }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  if (!PARTY_SLOTS.includes(slot as PartySlot)) {
    return { error: { message: 'Invalid slot' } };
  }

  const party = { ...(character.dungeonParty ?? {}) };

  // Remove the proposed source from any other slot it might already
  // occupy -- a fighter can only stand in one slot.
  if (source !== null) {
    for (const s of PARTY_SLOTS) {
      if (party[s] === source) party[s] = null;
    }
  }

  // Validate ownership for mercenary sources.
  if (source !== null && source !== 'player') {
    const merc = await Mercenary.findOne({ _id: source, owner: character._id });
    if (!merc) return { error: { message: 'Mercenary not found' } };
  }

  party[slot] = source;
  character.set('dungeonParty', party);
  character.markModified('dungeonParty');
  await character.save();

  revalidatePath('/game/overview');
  revalidatePath('/game/expeditions');
  return { ok: true, party };
}

// --- Active run helpers ---

function partyMaxHp({ level, endurance }: { level: number; endurance: number }): number {
  // Mirror the player's HP formula: level * 25 + endurance * 2 + flat
  // (-10 baseline) so HP carries the same shape between fighters.
  return Math.max(1, level * 25 + (endurance ?? 0) * 2 - 10);
}

async function buildPartySnapshot(character: any) {
  const party = character.dungeonParty ?? {};
  const result: any[] = [];

  for (const slot of PARTY_SLOTS) {
    const source = party[slot];
    if (!source) continue;
    if (source === 'player') {
      const b = combatBreakdown(character);
      const maxHp = b.maxHP ?? partyMaxHp({ level: character.level ?? 1, endurance: character.endurance ?? 0 });
      result.push({
        slot,
        source: 'player',
        refId:  String(character._id),
        name:   character.name,
        role:   slot.startsWith('damage') ? 'damage' : (slot as string),
        type:   slot.startsWith('damage') ? 'damage' : (slot as string),
        level:  character.level ?? 1,
        quality: null,
        maxHp,
        hp:      maxHp,
        power:   calculatePower(character),
      });
    } else {
      const merc = await Mercenary.findOne({ _id: source, owner: character._id })
        .populate({ path: 'equipment.head equipment.chest equipment.legs equipment.gloves equipment.cloak equipment.boots equipment.mainHand equipment.offHand equipment.necklace equipment.ring1 equipment.ring2', model: Item });
      if (!merc) continue;
      const equipment: Record<string, any> = {};
      for (const s of EQUIPMENT_SLOTS) {
        const it = (merc as any).equipment?.[s];
        equipment[s] = it && typeof it === 'object' && 'name' in it ? it : null;
      }
      const b = mercenaryBreakdown({
        level: merc.level, quality: merc.quality, type: merc.type,
        stats: merc.stats, equipment,
      });
      const maxHp = Math.max(1, b.health);
      result.push({
        slot,
        source: 'mercenary',
        refId:  String(merc._id),
        name:   merc.name,
        role:   slot.startsWith('damage') ? 'damage' : (slot as string),
        type:   merc.type,
        level:  merc.level,
        quality: merc.quality,
        maxHp,
        hp:     maxHp,
        power:  b.power,
        healing: b.healing,
        threat:  b.threat,
      });
    }
  }
  return result;
}

export async function getActiveDungeonRun() {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const run = await DungeonRun.findOne({ owner: character._id }).sort({ createdAt: -1 });
  if (!run) return { ok: true, run: null };

  const dungeon = DUNGEONS[run.dungeonId as DungeonId];
  return {
    ok: true,
    run: {
      _id:         String(run._id),
      dungeonId:   run.dungeonId,
      dungeonName: dungeon?.name ?? run.dungeonId,
      bossName:    dungeon?.bossName,
      bossLevel:   dungeon?.bossLevel,
      currentStep: run.currentStep,
      totalSteps:  run.totalSteps,
      party:       run.party,
      lastFight:   run.lastFight,
    },
  };
}

export async function enterDungeon({ dungeonId }: { dungeonId: DungeonId }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const dungeon = DUNGEONS[dungeonId];
  if (!dungeon) return { error: { message: 'Unknown dungeon' } };
  if ((character.level ?? 1) < dungeon.entryLevel) {
    return { error: { message: `Unlocks at level ${dungeon.entryLevel}` } };
  }
  if (character.currentWork) {
    return { error: { message: 'You are at work right now. Claim or cancel your shift first.' } };
  }

  // One active run at a time. If a stale run exists, return it.
  const existing = await DungeonRun.findOne({ owner: character._id });
  if (existing) {
    return { error: { message: 'You already have an active dungeon run -- finish or abandon it first.' } };
  }

  const party = await buildPartySnapshot(character);
  if (party.length === 0) {
    return { error: { message: 'Assign at least one party slot in your Overview first.' } };
  }

  const run = await DungeonRun.create({
    owner: character._id,
    dungeonId,
    currentStep: 0,
    totalSteps:  TOTAL_STEPS,
    party,
    lastFight: null,
  });

  revalidatePath('/game/expeditions');
  return { ok: true, runId: String(run._id) };
}

export async function abandonDungeonRun() {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  const run = await DungeonRun.findOne({ owner: character._id });
  if (!run) return { ok: true };
  await run.deleteOne();
  revalidatePath('/game/expeditions');
  return { ok: true };
}

// --- One-step combat ---

function partyTotalPower(party: any[]): number {
  return party.reduce((sum, m) => sum + (m.hp > 0 ? m.power : 0), 0);
}
function partyAlive(party: any[]): boolean {
  return party.some((m) => m.hp > 0);
}
function applyDamageToParty(party: any[], totalDamage: number, dungeon: any) {
  // Damage prefers tanks (taunting) but spills over once tank is down.
  const order = [...party].sort((a, b) => {
    const rank = (m: any) =>
      m.hp <= 0 ? 99 :
      m.role === 'tank' ? 0 :
      m.role === 'healer' ? 2 : 1;
    return rank(a) - rank(b);
  });
  let remaining = totalDamage;
  for (const m of order) {
    if (m.hp <= 0) continue;
    const take = Math.min(m.hp, Math.max(1, Math.floor(remaining * (m.role === 'tank' ? 0.6 : 0.35))));
    m.hp = Math.max(0, m.hp - take);
    remaining = Math.max(0, remaining - take);
    if (remaining <= 0) break;
  }
}
function applyHealing(party: any[]) {
  const healers = party.filter((m) => m.type === 'healer' && m.hp > 0 && (m.healing ?? 0) > 0);
  if (healers.length === 0) return 0;
  let healed = 0;
  const targets = party
    .filter((m) => m.hp > 0 && m.hp < m.maxHp)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
  for (const t of targets) {
    let pool = healers.reduce((sum, h) => sum + (h.healing ?? 0) * 3, 0);
    if (pool <= 0) break;
    const heal = Math.min(t.maxHp - t.hp, pool);
    t.hp += heal;
    healed += heal;
  }
  return healed;
}

export async function runNextStep() {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  // Same cooldown gate as expedition / arena -- enforced server-side
  // so a rapid clicker can't tunnel past the timer.
  if (!canFight({ time: new Date(character.dungeonLastBattle ?? 0).getTime(), fight: 'dungeon' })) {
    const remaining = Math.max(0, Math.ceil(
      DUNGEON_COOLDOWN - (Date.now() - new Date(character.dungeonLastBattle ?? 0).getTime()) / 1000,
    ));
    return { error: { message: `Dungeon cooldown -- wait ${remaining}s` } };
  }

  const run = await DungeonRun.findOne({ owner: character._id });
  if (!run) return { error: { message: 'No active dungeon run' } };

  const dungeon = DUNGEONS[run.dungeonId as DungeonId];
  if (!dungeon) {
    await run.deleteOne();
    return { error: { message: 'Dungeon definition missing' } };
  }

  const stepIdx = run.currentStep;
  const isBoss = stepIdx >= run.totalSteps - 1;
  const party: any[] = JSON.parse(JSON.stringify(run.party ?? []));
  if (!partyAlive(party)) {
    await run.deleteOne();
    return { error: { message: 'Party was already wiped' } };
  }

  // Step enemy: trash steps scale to the boss level - offset; boss
  // gets the full boss level. Power is level * coef with a 1.4x
  // multiplier on the boss like the expedition seed generator.
  const stepLevel = isBoss ? dungeon.bossLevel : Math.max(1, dungeon.bossLevel - 4 + stepIdx * 2);
  const stepPower = Math.round(stepLevel * BOSS_POWER_COEF * (isBoss ? 1.4 : 1));
  const enemyName = isBoss ? dungeon.bossName : `${dungeon.name} guard ${stepIdx + 1}`;

  const partyPower = partyTotalPower(party);
  const winChance = Math.max(0.1, Math.min(0.95, partyPower / (partyPower + stepPower)));
  const won = Math.random() < winChance;

  // Damage taken proportional to opposition power -- a one-sided
  // fight still hits the party, but the survivors recover via heals.
  const damage = Math.max(10, Math.floor(stepPower * (won ? 0.18 : 0.55)));
  applyDamageToParty(party, damage, dungeon);
  const healed = applyHealing(party);

  let droppedItemSummary: any = null;
  let goldGained = 0;
  let xpGained = 0;
  let runFinished = false;
  let cleared = false;

  if (!won && !partyAlive(party)) {
    // Party wipe -- end run with consolation gold.
    goldGained = Math.round(dungeon.goldReward * 0.05);
    character.crowns = (character.crowns ?? 0) + goldGained;
    character.dungeonLastBattle = new Date();
    await character.save();
    await run.deleteOne();
    revalidatePath('/game/expeditions');
    return {
      ok: true,
      won: false,
      step: stepIdx,
      isBoss,
      enemyName,
      damage,
      healed,
      goldGained,
      xpGained: 0,
      drop: null,
      runFinished: true,
      cleared: false,
      party,
    };
  }

  if (won && isBoss) {
    // Guaranteed boss drop. Reuses the expedition drop roll forced to
    // boss tier with a quality bonus.
    let attempts = 0;
    while (!droppedItemSummary && attempts < 5) {
      const drop = rollExpeditionDrop({
        enemyLevel: dungeon.bossLevel,
        enemyType: 'boss',
        searchMode: 'thorough',
      });
      attempts++;
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
    character.dungeonLastBattle = new Date();
    await character.save();
    await run.deleteOne();
    runFinished = true;
    cleared = true;
  } else if (won) {
    // Trash step cleared -- advance.
    goldGained = Math.round(dungeon.goldReward * 0.1);
    character.crowns = (character.crowns ?? 0) + goldGained;
    character.dungeonLastBattle = new Date();
    await character.save();
    run.currentStep = stepIdx + 1;
    run.party = party;
    run.lastFight = { step: stepIdx, enemyName, won: true, damage, healed };
    run.markModified('party');
    run.markModified('lastFight');
    await run.save();
  } else {
    // Step lost but party still alive -- they recover and try again.
    character.dungeonLastBattle = new Date();
    await character.save();
    run.party = party;
    run.lastFight = { step: stepIdx, enemyName, won: false, damage, healed };
    run.markModified('party');
    run.markModified('lastFight');
    await run.save();
  }

  revalidatePath('/game/expeditions');
  revalidatePath('/game/packages');
  return {
    ok: true,
    won,
    step: stepIdx,
    isBoss,
    enemyName,
    damage,
    healed,
    goldGained,
    xpGained,
    drop: droppedItemSummary,
    runFinished,
    cleared,
    party,
  };
}
