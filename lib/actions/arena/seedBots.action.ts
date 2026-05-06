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

// Idempotent: tops up each tier to its target bot count and never deletes
// existing bots. Safe to call on every page load.
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
}
