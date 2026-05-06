import { ARENA_TIERS, BOTS_PER_TIER, ArenaTier, tierLevelRange } from '@/lib/utils/arena';
import { items as ITEM_CATALOG } from '@/constants/items';
import { EQUIPMENT_SLOTS, EquipmentSlot } from '@/lib/utils/equipment';
import { ItemInterface } from '@/lib/interfaces/item.interface';

const FIRST_NAMES = [
  'Aelius', 'Brutus', 'Cassius', 'Decimus', 'Ennius', 'Flavius', 'Galba',
  'Hostilius', 'Iulius', 'Lucanus', 'Maximus', 'Naevius', 'Octavius',
  'Publius', 'Quintus', 'Rufus', 'Servius', 'Titus', 'Ulpius', 'Varro',
  'Avitus', 'Crispus', 'Fabius', 'Gaius', 'Marcellus', 'Nero', 'Otho',
  'Pertinax', 'Regulus', 'Severus',
];

const SURNAMES = [
  'Magnus', 'Audax', 'Ferox', 'Lupus', 'Aquila', 'Tigris', 'Pugnax',
  'Vorenus', 'Crassus', 'Severus', 'Falx', 'Furor', 'Thrax', 'Murmillo',
  'Spiculus', 'Hermes', 'Verus', 'Priscus',
];

export function botName(rng: () => number): string {
  const a = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const b = SURNAMES[Math.floor(rng() * SURNAMES.length)];
  return `${a} ${b}`;
}

// Stat budget per level: each level grants ~4 trained points + ~6 baseline.
function botStats(level: number, rng: () => number): {
  strength: number; endurance: number; agility: number;
  dexterity: number; intelligence: number; charisma: number;
} {
  const base = 5;
  const trainedTotal = Math.floor(level * 4 + rng() * level);
  // Distribute roughly evenly with some spice.
  const stats = {
    strength: base, endurance: base, agility: base,
    dexterity: base, intelligence: base, charisma: base,
  } as Record<string, number>;
  const keys = Object.keys(stats);
  for (let i = 0; i < trainedTotal; i++) {
    stats[keys[Math.floor(rng() * keys.length)]] += 1;
  }
  return stats as any;
}

// Honor scales with level so bots roughly sort under stronger players in
// their bracket, with a wide spread inside the tier.
function botHonor(level: number, rng: () => number): number {
  return Math.floor(800 + level * 30 + rng() * level * 20);
}

// A small deterministic-ish RNG factory so seeding gives reproducible-ish
// bots per run.
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s >>> 0) / 0xffffffff;
  };
}

export interface BotPlan {
  name: string;
  level: number;
  arenaTier: string;
  honor: number;
  isBot: true;
  gender: 'male' | 'female';
  strength: number; endurance: number; agility: number;
  dexterity: number; intelligence: number; charisma: number;
  power: number;
  onboarded: true;
}

export function planBotsForTier(tier: ArenaTier, seedOffset = 0): BotPlan[] {
  const count = BOTS_PER_TIER[tier.id] ?? 12;
  const range = tierLevelRange(tier);
  const rng = makeRng(0xC0FFEE ^ tier.id.length ^ seedOffset);
  const plans: BotPlan[] = [];

  for (let i = 0; i < count; i++) {
    const level = Math.max(
      tier.minLevel,
      Math.min(range.max, range.min + Math.floor(rng() * (range.max - range.min + 1))),
    );
    const stats = botStats(level, rng);
    const power =
      stats.strength + stats.endurance + stats.agility +
      stats.dexterity + stats.intelligence + stats.charisma + level * 10;

    plans.push({
      name: botName(rng),
      level,
      arenaTier: tier.id,
      honor: botHonor(level, rng),
      isBot: true,
      gender: rng() < 0.55 ? 'male' : 'female',
      ...stats,
      power,
      onboarded: true,
    });
  }
  return plans;
}

export function planAllBots(): BotPlan[] {
  return ARENA_TIERS.flatMap((tier, i) => planBotsForTier(tier, i));
}

// Map slot -> item.type accepted by that slot.
const SLOT_TO_TYPE: Record<EquipmentSlot, ItemInterface['type']> = {
  head: 'head', chest: 'chest', legs: 'legs', gloves: 'gloves', cloak: 'cloak',
  boots: 'boots', mainHand: 'mainHand', offHand: 'offHand', necklace: 'necklace',
  ring1: 'ring', ring2: 'ring',
};

function templatesByType(type: ItemInterface['type']) {
  return Object.values(ITEM_CATALOG).filter((it: any) => it.type === type);
}

function pickFor(level: number, type: ItemInterface['type'], rng: () => number): any | null {
  const pool = templatesByType(type)
    .filter((it: any) => it.level <= level + 2);
  if (pool.length === 0) return null;
  // Weight toward higher-level, lower-quality items first; the catalog
  // is small enough that uniform sampling is fine.
  return pool[Math.floor(rng() * pool.length)];
}

// Pick a small but coherent equipment kit for a level. Each slot is filled
// with chance proportional to the slot priority (weapon/armor/helmet first).
export function pickBotEquipment(level: number, rng: () => number): Partial<Record<EquipmentSlot, any>> {
  const out: Partial<Record<EquipmentSlot, any>> = {};
  // Slot order + base equip chance (drops as we go down the list).
  const order: { slot: EquipmentSlot; chance: number }[] = [
    { slot: 'mainHand', chance: 0.95 },
    { slot: 'chest',    chance: 0.90 },
    { slot: 'head',     chance: 0.80 },
    { slot: 'offHand',  chance: 0.70 },
    { slot: 'boots',    chance: 0.70 },
    { slot: 'gloves',   chance: 0.60 },
    { slot: 'legs',     chance: 0.55 },
    { slot: 'necklace', chance: 0.35 },
    { slot: 'ring1',    chance: 0.30 },
    { slot: 'ring2',    chance: 0.20 },
    { slot: 'cloak',    chance: 0.20 },
  ];
  for (const { slot, chance } of order) {
    if (rng() > chance) continue;
    const tpl = pickFor(level, SLOT_TO_TYPE[slot], rng);
    if (tpl) out[slot] = tpl;
  }
  return out;
}

// A handful of inventory templates the bot can later list to the market.
export function pickBotInventory(level: number, rng: () => number, count = 3): any[] {
  const allPool = Object.values(ITEM_CATALOG).filter((it: any) => it.level <= level + 2);
  if (allPool.length === 0) return [];
  const picks: any[] = [];
  for (let i = 0; i < count; i++) {
    if (rng() < 0.35) continue; // not every slot fills
    picks.push(allPool[Math.floor(rng() * allPool.length)]);
  }
  return picks;
}

export function botRng(seed: number): () => number {
  return makeRng(seed);
}
