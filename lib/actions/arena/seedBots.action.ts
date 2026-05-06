'use server'

import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
import { connectToDB } from '@/lib/mongoose';
import { ARENA_TIERS, BOTS_PER_TIER } from '@/lib/utils/arena';
import { findFreePosition, placeItem, InventoryEntry } from '@/lib/utils/inventory/grid';
import { pickBotEquipment, pickBotInventory, planBotsForTier, botRng } from '@/lib/utils/arenaBots';
import { EquipmentSlot } from '@/lib/utils/equipment';

async function createItem(template: any, ownerId: any) {
  const created = await Item.create({ ...template, owner: ownerId });
  if (template.itemId && created._id) {
    created.id = `${template.itemId}-${created._id}`;
    await created.save();
  }
  return created;
}

async function dressBot(bot: any, level: number, seed: number) {
  const rng = botRng(seed);
  const equipPicks = pickBotEquipment(level, rng);
  const equipment: Record<string, any> = {};
  for (const [slot, template] of Object.entries(equipPicks)) {
    const it = await createItem(template, bot._id);
    equipment[slot] = it._id;
  }

  const invTemplates = pickBotInventory(level, rng, 3);
  const entries: InventoryEntry[] = [];
  for (const tpl of invTemplates) {
    const it = await createItem(tpl, bot._id);
    const free = findFreePosition(entries, it);
    if (!free) continue;
    const next = placeItem(entries, it, free.x, free.y);
    entries.length = 0;
    entries.push(...next);
  }

  bot.set('equipment', equipment);
  bot.set('inventory', entries.map((e) => ({
    item: (e.item && typeof e.item === 'object' && '_id' in e.item) ? e.item._id : e.item,
    x: e.x,
    y: e.y,
  })));
  // Generous starting purse so bots can keep buying for a while.
  bot.crowns = 10000 + level * 200;
  bot.markModified('inventory');
  bot.markModified('equipment');
  await bot.save();
}

// Find bots that were seeded before the dressing logic existed and give
// them gear in place. Their _id, name, level, honor, arenaTier all stay
// the same so the leaderboard doesn't reshuffle.
async function dressUndressedBots() {
  // A bot is "undressed" if it has no equipment fields populated AND its
  // inventory is empty / nullish.
  const candidates = await Character.find({
    isBot: true,
    $or: [
      { equipment: { $exists: false } },
      { equipment: null },
      // All slot fields are missing/nullish.
      {
        $and: [
          { 'equipment.head': null },     { 'equipment.chest': null },
          { 'equipment.mainHand': null }, { 'equipment.offHand': null },
          { 'equipment.legs': null },     { 'equipment.boots': null },
          { 'equipment.gloves': null },   { 'equipment.necklace': null },
          { 'equipment.ring1': null },    { 'equipment.ring2': null },
          { 'equipment.cloak': null },
        ],
      },
    ],
  });

  for (const bot of candidates) {
    // Skip bots that already have an inventory list -- they were dressed
    // already; the equipment-null match above can include them on first
    // run because the slots were truly null, but inventory presence is
    // the reliable "already dressed" signal.
    const hasInventoryItems =
      Array.isArray(bot.inventory) &&
      bot.inventory.length > 0 &&
      bot.inventory.some((e: any) => e && (e.item || (Array.isArray(e) && e.some(Boolean))));
    if (hasInventoryItems) continue;

    try {
      await dressBot(bot, bot.level ?? 1, (bot.level ?? 1) * 31 + (bot.honor ?? 0));
    } catch (err) {
      console.log(`${new Date()} - failed to redress bot ${bot._id} - ${err}`);
    }
  }
}

// Idempotent: tops up each tier to its target bot count, never deletes
// existing bots, and dresses any that were created before the dressing
// pass existed.
export async function ensureArenaBots() {
  await connectToDB();

  for (const tier of ARENA_TIERS) {
    const target = BOTS_PER_TIER[tier.id] ?? 12;
    let have = await Character.countDocuments({ isBot: true, arenaTier: tier.id });
    if (have >= target) continue;

    const plans = planBotsForTier(tier, have + Date.now()).slice(0, (target - have) * 2);
    for (const plan of plans) {
      try {
        const bot = await Character.create(plan);
        await dressBot(bot, plan.level, plan.level * 31 + plan.honor);
      } catch {
        // Likely a duplicate-name collision; skip and continue.
      }
      have = await Character.countDocuments({ isBot: true, arenaTier: tier.id });
      if (have >= target) break;
    }
  }

  // After top-up, retroactively dress anyone who was naked.
  await dressUndressedBots();
}
