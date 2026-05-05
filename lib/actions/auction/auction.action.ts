'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Auction from '@/lib/models/auction.model';
import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
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
import {
  AUCTION_TOTAL_SECONDS,
  auctionPhase,
  minNextBid,
  newAuctionEndsAt,
} from '@/lib/utils/auction';

function loadEntries(character: any): InventoryEntry[] {
  const inv = character.inventory;
  const migrated = migrateLegacyInventory(inv);
  if (migrated) return migrated;
  if (!Array.isArray(inv)) return [];
  return inv.map((e: any) => ({ item: e?.item, x: e?.x ?? 0, y: e?.y ?? 0 }));
}

function entryItemId(it: any): string | null {
  if (!it) return null;
  if (typeof it === 'string') return it;
  if (it._id) return String(it._id);
  return null;
}

function serializeInventory(entries: InventoryEntry[]) {
  return entries.map((e) => ({
    item: (e.item && typeof e.item === 'object' && '_id' in e.item) ? e.item._id : e.item,
    x: e.x,
    y: e.y,
  }));
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

// Settle any auctions whose timer has expired. Winner gets the item, seller
// gets the gold (already withheld at bid time), losing bidders were already
// refunded by placeBid. Idempotent.
async function settleExpiredAuctions() {
  const now = new Date();
  const expired = await Auction.find({ status: 'open', endsAt: { $lte: now } });
  for (const auction of expired) {
    if (auction.highestBidder) {
      // Winner -> deliver item.
      const winner = await Character.findById(auction.highestBidder);
      const item = await Item.findById(auction.item);
      if (winner && item) {
        const winnerEntries = loadEntries(winner);
        const free = findFreePosition(winnerEntries, item);
        if (free) {
          const next = placeItem(winnerEntries, item, free.x, free.y);
          winner.set('inventory', serializeInventory(next));
          winner.markModified('inventory');
          item.owner = winner._id;
          await item.save();
          await winner.save();
        }
        // Pay seller.
        const seller = await Character.findById(auction.seller);
        if (seller) {
          seller.crowns = (seller.crowns ?? 0) + auction.currentBid;
          await seller.save();
        }
      }
    } else {
      // Nobody bid -> return item to seller.
      const seller = await Character.findById(auction.seller);
      const item = await Item.findById(auction.item);
      if (seller && item) {
        const sellerEntries = loadEntries(seller);
        const free = findFreePosition(sellerEntries, item);
        if (free) {
          const next = placeItem(sellerEntries, item, free.x, free.y);
          seller.set('inventory', serializeInventory(next));
          seller.markModified('inventory');
          await seller.save();
        }
      }
    }
    auction.status = 'settled';
    await auction.save();
  }
}

export async function listAuctionsAction() {
  try {
    await connectToDB();
    await settleExpiredAuctions();

    const auctions = await Auction.find({ status: 'open' })
      .populate({ path: 'item', model: Item })
      .populate({ path: 'seller', model: Character, select: 'name' })
      .populate({ path: 'highestBidder', model: Character, select: 'name' })
      .sort({ endsAt: 1 })
      .lean();

    const me = await getMyCharacter();
    const myId = 'character' in me ? String(me.character._id) : null;

    return {
      auctions: auctions.map((a: any) => ({
        _id: String(a._id),
        item: a.item ? JSON.parse(JSON.stringify(a.item)) : null,
        startingPrice: a.startingPrice,
        currentBid: a.currentBid,
        hasBids: !!a.highestBidder,
        seller: a.seller ? { _id: String(a.seller._id), name: a.seller.name } : null,
        highestBidder: a.highestBidder ? { _id: String(a.highestBidder._id), name: a.highestBidder.name } : null,
        endsAt: a.endsAt,
        phase: auctionPhase(a.endsAt),
        isMine: myId != null && a.seller && String(a.seller._id) === myId,
        isLeading: myId != null && a.highestBidder && String(a.highestBidder._id) === myId,
      })),
    };
  } catch (error: any) {
    console.log(`${new Date()} - listAuctionsAction failed - ${error}`);
    return { error: { message: error?.message || 'Failed to load auctions' } };
  }
}

export async function placeAuctionAction({
  itemId,
  startingPrice,
}: { itemId: string; startingPrice: number }) {
  if (!Number.isFinite(startingPrice) || startingPrice <= 0) {
    return { error: { message: 'Starting price must be positive' } };
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

    await Auction.create({
      seller: character._id,
      item: itemId,
      startingPrice: Math.floor(startingPrice),
      currentBid: Math.floor(startingPrice),
      highestBidder: null,
      endsAt: newAuctionEndsAt(),
      status: 'open',
    });

    character.set('inventory', serializeInventory(entries));
    character.markModified('inventory');
    await character.save();

    revalidatePath('/game/auction');
    revalidatePath('/game/overview');
    return { ok: true };
  } catch (error: any) {
    console.log(`${new Date()} - placeAuctionAction failed - ${error}`);
    return { error: { message: error?.message || 'Failed to list auction' } };
  }
}

export async function placeAuctionBid({
  auctionId,
  amount,
}: { auctionId: string; amount: number }) {
  const me = await getMyCharacter();
  if ('error' in me) return me;
  const bidder = me.character;

  try {
    await connectToDB();
    await settleExpiredAuctions();

    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== 'open') {
      return { error: { message: 'Auction is not open' } };
    }
    if (auction.endsAt.getTime() <= Date.now()) {
      return { error: { message: 'Auction already ended' } };
    }
    if (String(auction.seller) === String(bidder._id)) {
      return { error: { message: "Can't bid on your own auction" } };
    }

    const required = minNextBid(auction.currentBid, !!auction.highestBidder);
    if (!Number.isFinite(amount) || amount < required) {
      return { error: { message: `Bid must be at least ${required}` } };
    }
    if ((bidder.crowns ?? 0) < amount) {
      return { error: { message: 'Not enough crowns' } };
    }

    // Refund the previous bidder, if any.
    if (auction.highestBidder && String(auction.highestBidder) !== String(bidder._id)) {
      const previous = await Character.findById(auction.highestBidder);
      if (previous) {
        previous.crowns = (previous.crowns ?? 0) + auction.currentBid;
        await previous.save();
      }
    } else if (auction.highestBidder && String(auction.highestBidder) === String(bidder._id)) {
      // Same bidder raises their own bid -- refund their previous lock.
      bidder.crowns = (bidder.crowns ?? 0) + auction.currentBid;
    }

    bidder.crowns = (bidder.crowns ?? 0) - amount;
    auction.currentBid = Math.floor(amount);
    auction.highestBidder = bidder._id as any;

    await bidder.save();
    await auction.save();

    revalidatePath('/game/auction');
    return { ok: true };
  } catch (error: any) {
    console.log(`${new Date()} - placeAuctionBid failed - ${error}`);
    return { error: { message: error?.message || 'Failed to place bid' } };
  }
}

export async function cancelAuctionAction({ auctionId }: { auctionId: string }) {
  const me = await getMyCharacter();
  if ('error' in me) return me;
  const character = me.character;

  try {
    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== 'open') {
      return { error: { message: 'Auction not found' } };
    }
    if (String(auction.seller) !== String(character._id)) {
      return { error: { message: 'Not your auction' } };
    }
    if (auction.highestBidder) {
      return { error: { message: 'Cannot cancel after a bid has been placed' } };
    }

    const item = await Item.findById(auction.item);
    if (item) {
      let entries = loadEntries(character);
      const free = findFreePosition(entries, item);
      if (!free) return { error: { message: 'No room in inventory' } };
      entries = placeItem(entries, item, free.x, free.y);
      character.set('inventory', serializeInventory(entries));
      character.markModified('inventory');
      await character.save();
    }

    auction.status = 'cancelled';
    await auction.save();

    revalidatePath('/game/auction');
    revalidatePath('/game/overview');
    return { ok: true };
  } catch (error: any) {
    console.log(`${new Date()} - cancelAuctionAction failed - ${error}`);
    return { error: { message: error?.message || 'Failed to cancel auction' } };
  }
}

// Re-export for convenience.
export { AUCTION_TOTAL_SECONDS };
