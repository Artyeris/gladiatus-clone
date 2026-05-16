'use server'

import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
import { connectToDB } from '@/lib/mongoose';
import { ARENA_TIERS, BOTS_PER_TIER } from '@/lib/utils/arena';
import { findFreePosition, placeItem, InventoryEntry } from '@/lib/utils/inventory/grid';
import { pickBotEquipment, pickBotInventory, planBotsForTier, botRng } from '@/lib/utils/arenaBots';
import { scaleItemTemplate } from '@/lib/utils/itemUtils';
import { EquipmentSlot } from '@/lib/utils/equipment';

async function createItem(template: any, ownerId: any, level: number) {
  const scaled = scaleItemTemplate(template, level);
  const created = await Item.create({ ...scaled, owner: ownerId });
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
    const it = await createItem(template, bot._id, level);
    equipment[slot] = it._id;
  }

  const invTemplates = pickBotInventory(level, rng, 3);
  const entries: InventoryEntry[] = [];
  for (const tpl of invTemplates) {
    const it = await createItem(tpl, bot._id, level);
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
    bag: e.bag ?? 0,
  })));
  // Generous starting purse so bots can keep buying for a while.
  bot.crowns = 10000 + level * 200;
  bot.markModified('inventory');
  bot.markModified('equipment');
  await bot.save();
}

// Detect bots whose equipped weapon is much weaker than their level (left
// over from before the level-scaling pass). Strip + rebuild their gear so
// a level-120 bot stops fighting with a level-2 sword. Identity stays the
// same -- only items move.
async function rebalanceBotGear() {
  const candidates = await Character.find({ isBot: true });
  for (const bot of candidates) {
    const level: number = bot.level ?? 1;
    let needsRebuild = false;

    // No inventory list at all -> never been dressed.
    const hasInventoryItems =
      Array.isArray(bot.inventory) &&
      bot.inventory.length > 0 &&
      bot.inventory.some((e: any) => e && (e.item || (Array.isArray(e) && e.some(Boolean))));
    if (!hasInventoryItems) needsRebuild = true;

    // Or: any equipped item is more than ~5 levels below the bot.
    if (!needsRebuild && bot.equipment) {
      for (const slot of Object.keys(bot.equipment.toObject?.() ?? bot.equipment)) {
        const ref = (bot.equipment as any)[slot];
        if (!ref) continue;
        const item = await Item.findById(ref);
        if (!item) continue;
        if ((item.level ?? 1) + 5 < level) {
          needsRebuild = true;
          break;
        }
      }
    }

    if (!needsRebuild) continue;

    try {
      // Wipe the existing item documents so we don't leak orphans.
      const oldItemIds: any[] = [];
      if (bot.equipment) {
        for (const slot of Object.keys(bot.equipment.toObject?.() ?? bot.equipment)) {
          const ref = (bot.equipment as any)[slot];
          if (ref) oldItemIds.push(ref);
        }
      }
      if (Array.isArray(bot.inventory)) {
        for (const entry of bot.inventory) {
          if (entry?.item) oldItemIds.push(entry.item);
        }
      }
      if (oldItemIds.length) {
        await Item.deleteMany({ _id: { $in: oldItemIds } });
      }

      await dressBot(bot, level, level * 31 + (bot.honor ?? 0));
    } catch (err) {
      console.log(`${new Date()} - failed to rebalance bot ${bot._id} - ${err}`);
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

  // After top-up, retroactively re-dress anyone whose gear is mismatched
  // with their level (e.g. legacy bots seeded before scaleItemTemplate).
  await rebalanceBotGear();
}
