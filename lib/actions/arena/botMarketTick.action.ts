'use server'

import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
import MarketListing from '@/lib/models/marketListing.model';
import { connectToDB } from '@/lib/mongoose';
import {
  InventoryEntry,
  findFreePosition,
  migrateLegacyInventory,
  placeItem,
  removeItem,
} from '@/lib/utils/inventory/grid';

const BOTS_PER_TICK = 18;
const LIST_CHANCE   = 0.18;  // Per ticked bot.
const BUY_CHANCE    = 0.55;  // Per ticked bot. Tuned high so player
                             // listings actually drain.
const PLAYER_BUY_BIAS = 0.80; // Probability a buy targets a real-player
                              // seller when both pools have candidates.

function loadEntries(character: any): InventoryEntry[] {
  const inv = character.inventory;
  const migrated = migrateLegacyInventory(inv);
  if (migrated) return migrated;
  if (!Array.isArray(inv)) return [];
  return inv.map((e: any) => ({ item: e?.item, x: e?.x ?? 0, y: e?.y ?? 0 }));
}

function serializeInventory(entries: InventoryEntry[]) {
  return entries.map((e) => ({
    item: (e.item && typeof e.item === 'object' && '_id' in e.item) ? e.item._id : e.item,
    x: e.x,
    y: e.y,
    bag: e.bag ?? 0,
  }));
}

async function botListsItem(bot: any) {
  const entries = loadEntries(bot);
  if (entries.length === 0) return false;

  // Need to read the actual Item to know sellPrice for fair pricing.
  const populated: { entry: InventoryEntry; item: any }[] = [];
  for (const entry of entries) {
    const ref = entry.item;
    if (!ref) continue;
    if (typeof ref === 'object' && 'name' in ref) {
      populated.push({ entry, item: ref });
      continue;
    }
    const fetched = await Item.findById(ref);
    if (fetched) populated.push({ entry, item: fetched });
  }
  if (populated.length === 0) return false;

  const pick = populated[Math.floor(Math.random() * populated.length)];
  const base = pick.item.sellPrice ?? 50;
  const price = Math.max(1, Math.floor(base * (1.2 + Math.random() * 0.8))); // 120-200%

  const itemId = pick.item._id;
  const next = removeItem(entries, String(itemId));

  await MarketListing.create({
    seller: bot._id,
    item: itemId,
    price,
  });

  bot.set('inventory', serializeInventory(next));
  bot.markModified('inventory');
  await bot.save();
  return true;
}

async function botBuysListing(bot: any) {
  // Pull two pools: listings posted by real players vs. by other bots.
  // Picking from the player pool with high bias means a fresh player
  // listing usually gets snapped up within the next few market ticks.
  const baseFilter = {
    seller: { $ne: bot._id },
    price: { $lte: bot.crowns ?? 0 },
  };

  const playerSellerIds = await Character.find(
    { isBot: { $ne: true } },
    { _id: 1 },
  ).lean();
  const playerIds = playerSellerIds.map((c: any) => c._id);

  const [playerListings, anyListings] = await Promise.all([
    playerIds.length > 0
      ? MarketListing.find({ ...baseFilter, seller: { $in: playerIds } })
          .limit(20)
          .lean()
      : Promise.resolve([] as any[]),
    MarketListing.find(baseFilter).limit(20).lean(),
  ]);

  let candidates: any[] = anyListings as any[];
  if (playerListings.length > 0 && Math.random() < PLAYER_BUY_BIAS) {
    candidates = playerListings as any[];
  }
  if (candidates.length === 0) return false;

  const listing = candidates[Math.floor(Math.random() * candidates.length)] as any;
  const item = await Item.findById(listing.item);
  if (!item) {
    await MarketListing.findByIdAndDelete(listing._id);
    return false;
  }

  const entries = loadEntries(bot);
  const free = findFreePosition(entries, item);
  if (!free) return false;

  const seller = await Character.findById(listing.seller);

  bot.crowns = (bot.crowns ?? 0) - listing.price;
  if (seller) {
    seller.crowns = (seller.crowns ?? 0) + listing.price;
    await seller.save();
  }

  const next = placeItem(entries, item, free.x, free.y);
  bot.set('inventory', serializeInventory(next));
  bot.markModified('inventory');
  item.owner = bot._id;
  await item.save();
  await bot.save();
  await MarketListing.findByIdAndDelete(listing._id);
  return true;
}

// Cheap, opportunistic: each call samples a small number of bots and rolls
// a chance for each to either list a random inventory item or buy a random
// affordable listing. Designed to be called from listMarketAction so the
// ecosystem ticks whenever a real player visits the market.
export async function tickBotMarket() {
  try {
    await connectToDB();

    const bots = await Character.aggregate([
      { $match: { isBot: true } },
      { $sample: { size: BOTS_PER_TICK } },
    ]);

    for (const lean of bots) {
      const bot = await Character.findById(lean._id);
      if (!bot) continue;

      try {
        if (Math.random() < LIST_CHANCE) {
          await botListsItem(bot);
        }
        if (Math.random() < BUY_CHANCE) {
          await botBuysListing(bot);
        }
      } catch (err) {
        console.log(`${new Date()} - bot market action failed for ${bot._id} - ${err}`);
      }
    }
  } catch (err) {
    console.log(`${new Date()} - tickBotMarket failed - ${err}`);
  }
}
