'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
import MarketListing from '@/lib/models/marketListing.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import {
  InventoryEntry,
  findEntry,
  findFreePosition,
  migrateLegacyInventory,
  placeItem,
  removeItem,
} from '@/lib/utils/inventory/grid';
import { tickBotMarket } from '@/lib/actions/arena/botMarketTick.action';

function loadEntries(character: any): InventoryEntry[] {
  const inv = character.inventory;
  const migrated = migrateLegacyInventory(inv);
  if (migrated) return migrated;
  if (!Array.isArray(inv)) return [];
  return inv.map((e: any) => ({ item: e?.item, x: e?.x ?? 0, y: e?.y ?? 0 }));
}

async function getMyCharacter() {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return { error: { message: 'Not authenticated' } } as const;

  const userId = extractUserId(token.value);
  await connectToDB();

  const user = await User.findById(userId).populate({ path: 'character', model: Character });
  if (!user || !user.character) return { error: { message: 'Character not found' } } as const;

  return { character: user.character as any };
}

export async function listMarketAction() {
  try {
    await connectToDB();
    // Tick the bot economy so the market feels alive: bots may list items
    // and buy from real sellers each time someone opens the market.
    await tickBotMarket();
    const listings = await MarketListing.find({})
      .populate({ path: 'item', model: Item })
      .populate({ path: 'seller', model: Character, select: 'name' })
      .sort({ createdAt: -1 })
      .lean();

    const me = await getMyCharacter();
    const myId = 'character' in me ? String(me.character._id) : null;

    return {
      listings: listings.map((l: any) => ({
        _id: String(l._id),
        item: l.item ? JSON.parse(JSON.stringify(l.item)) : null,
        price: l.price,
        seller: l.seller ? { _id: String(l.seller._id), name: l.seller.name } : null,
        isMine: myId != null && l.seller && String(l.seller._id) === myId,
        createdAt: l.createdAt,
      })),
    };
  } catch (error: any) {
    console.log(`${new Date()} - listMarketAction failed - ${error}`);
    return { error: { message: error?.message || 'Failed to load market' } };
  }
}

export async function placeMarketListing({ itemId, price }: { itemId: string; price: number }) {
  if (!Number.isFinite(price) || price < 0) {
    return { error: { message: 'Price must be a positive number' } };
  }
  const me = await getMyCharacter();
  if ('error' in me) return me;
  const character = me.character;

  try {
    let entries = loadEntries(character);
    if (!findEntry(entries, itemId)) {
      return { error: { message: 'Item not in your inventory' } };
    }

    entries = removeItem(entries, itemId);

    await MarketListing.create({
      seller: character._id,
      item: itemId,
      price: Math.floor(price),
    });

    character.set('inventory', entries.map((e) => ({
      item: (e.item && typeof e.item === 'object' && '_id' in e.item) ? e.item._id : e.item,
      x: e.x,
      y: e.y,
    })));
    character.markModified('inventory');
    await character.save();

    revalidatePath('/game/market');
    revalidatePath('/game/overview');
    return { ok: true };
  } catch (error: any) {
    console.log(`${new Date()} - placeMarketListing failed - ${error}`);
    return { error: { message: error?.message || 'Failed to list item' } };
  }
}

export async function cancelMarketListing({ listingId }: { listingId: string }) {
  const me = await getMyCharacter();
  if ('error' in me) return me;
  const character = me.character;

  try {
    const listing = await MarketListing.findById(listingId);
    if (!listing) return { error: { message: 'Listing not found' } };
    if (String(listing.seller) !== String(character._id)) {
      return { error: { message: 'Not your listing' } };
    }

    const item = await Item.findById(listing.item);
    if (!item) {
      // Item somehow gone -- just delete the listing.
      await listing.deleteOne();
      return { error: { message: 'Item no longer exists; listing removed' } };
    }

    let entries = loadEntries(character);
    const free = findFreePosition(entries, item);
    if (!free) return { error: { message: 'No room in inventory' } };

    entries = placeItem(entries, item, free.x, free.y);

    character.set('inventory', entries.map((e) => ({
      item: (e.item && typeof e.item === 'object' && '_id' in e.item) ? e.item._id : e.item,
      x: e.x,
      y: e.y,
    })));
    character.markModified('inventory');
    await character.save();
    await listing.deleteOne();

    revalidatePath('/game/market');
    revalidatePath('/game/overview');
    return { ok: true };
  } catch (error: any) {
    console.log(`${new Date()} - cancelMarketListing failed - ${error}`);
    return { error: { message: error?.message || 'Failed to cancel listing' } };
  }
}

export async function buyMarketListing({ listingId }: { listingId: string }) {
  const me = await getMyCharacter();
  if ('error' in me) return me;
  const buyer = me.character;

  try {
    const listing = await MarketListing.findById(listingId);
    if (!listing) return { error: { message: 'Listing no longer available' } };
    if (String(listing.seller) === String(buyer._id)) {
      return { error: { message: "Can't buy your own listing" } };
    }

    const item = await Item.findById(listing.item);
    if (!item) {
      await listing.deleteOne();
      return { error: { message: 'Item no longer exists' } };
    }

    if ((buyer.crowns ?? 0) < listing.price) {
      return { error: { message: 'Not enough crowns' } };
    }

    let buyerEntries = loadEntries(buyer);
    const free = findFreePosition(buyerEntries, item);
    if (!free) return { error: { message: 'No room in your inventory' } };

    const seller = await Character.findById(listing.seller);
    if (!seller) {
      // Seller gone -- transfer item but no payout possible.
      buyerEntries = placeItem(buyerEntries, item, free.x, free.y);
      buyer.crowns = (buyer.crowns ?? 0) - listing.price;
    } else {
      buyerEntries = placeItem(buyerEntries, item, free.x, free.y);
      buyer.crowns = (buyer.crowns ?? 0) - listing.price;
      seller.crowns = (seller.crowns ?? 0) + listing.price;
      await seller.save();
    }

    item.owner = buyer._id;
    await item.save();

    buyer.set('inventory', buyerEntries.map((e) => ({
      item: (e.item && typeof e.item === 'object' && '_id' in e.item) ? e.item._id : e.item,
      x: e.x,
      y: e.y,
    })));
    buyer.markModified('inventory');
    await buyer.save();
    await listing.deleteOne();

    revalidatePath('/game/market');
    revalidatePath('/game/overview');
    return { ok: true };
  } catch (error: any) {
    console.log(`${new Date()} - buyMarketListing failed - ${error}`);
    return { error: { message: error?.message || 'Failed to buy item' } };
  }
}
