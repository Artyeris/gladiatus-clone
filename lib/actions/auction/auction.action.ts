'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import { items as ITEM_CATALOG } from '@/constants/items';
import Auction from '@/lib/models/auction.model';
import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import {
  InventoryEntry,
  findFreePosition,
  migrateLegacyInventory,
  placeItem,
} from '@/lib/utils/inventory/grid';
import {
  auctionPhase,
  minNextBid,
  newAuctionEndsAt,
} from '@/lib/utils/auction';
import { sendMessageToCharacter } from '@/lib/actions/message/message.action';

const POOL_SIZE = 12;

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

// Spawn a fresh Item document and a matching Auction. The item's owner is
// null while the auction runs; on settlement the winner becomes the owner.
async function spawnOneAuction(): Promise<void> {
  const catalog = Object.values(ITEM_CATALOG);
  if (catalog.length === 0) return;
  const template = catalog[Math.floor(Math.random() * catalog.length)] as any;

  const created = await Item.create({
    ...template,
    owner: null,
  });
  if (template.itemId && created._id) {
    created.id = `${template.itemId}-${created._id}`;
    await created.save();
  }

  const baseValue = Math.max(1, template.sellPrice ?? template.power * 10 ?? 50);
  // Markup 0% .. 100%, mirroring the original "Value + X (100%-200%)" line.
  const markup = Math.floor(baseValue * Math.random());
  const startingPrice = baseValue + markup;
  const buyoutPrice = startingPrice * 2;

  await Auction.create({
    item: created._id,
    startingPrice,
    currentBid: startingPrice,
    buyoutPrice,
    highestBidder: null,
    endsAt: newAuctionEndsAt(),
    status: 'open',
  });
}

async function refillAuctionPool() {
  const openCount = await Auction.countDocuments({ status: 'open' });
  const missing = POOL_SIZE - openCount;
  for (let i = 0; i < missing; i++) {
    await spawnOneAuction();
  }
}

async function settleExpiredAuctions() {
  const now = new Date();
  const expired = await Auction.find({ status: 'open', endsAt: { $lte: now } });

  for (const auction of expired) {
    if (auction.highestBidder) {
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
          await sendMessageToCharacter(
            String(winner._id),
            'auction',
            'You won an auction.',
            `You won the auction for ${item.name} (level ${item.level}) for ${auction.currentBid} crowns. The item has been delivered to your inventory.`,
          );
        }
      }
    } else {
      // Nobody bid -> item disappears (the auction house keeps it).
      await Item.findByIdAndDelete(auction.item);
    }
    auction.status = 'settled';
    await auction.save();
  }
}

export async function listAuctionsAction() {
  try {
    await connectToDB();
    await settleExpiredAuctions();
    await refillAuctionPool();

    const auctions = await Auction.find({ status: 'open' })
      .populate({ path: 'item', model: Item })
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
        buyoutPrice: a.buyoutPrice,
        hasBids: !!a.highestBidder,
        highestBidder: a.highestBidder
          ? { _id: String(a.highestBidder._id), name: a.highestBidder.name }
          : null,
        endsAt: a.endsAt,
        phase: auctionPhase(a.endsAt),
        isLeading: myId != null && a.highestBidder && String(a.highestBidder._id) === myId,
      })),
    };
  } catch (error: any) {
    console.log(`${new Date()} - listAuctionsAction failed - ${error}`);
    return { error: { message: error?.message || 'Failed to load auctions' } };
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
        await sendMessageToCharacter(
          String(previous._id),
          'auction',
          'Your bid was raised.',
          `Someone outbid you on an auction. Your previous bid of ${auction.currentBid} crowns has been refunded.`,
        );
      }
    } else if (auction.highestBidder && String(auction.highestBidder) === String(bidder._id)) {
      // Same bidder raises -> refund their previous lock first.
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

export async function buyoutAuctionAction({ auctionId }: { auctionId: string }) {
  const me = await getMyCharacter();
  if ('error' in me) return me;
  const buyer = me.character;

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
    if ((buyer.crowns ?? 0) < auction.buyoutPrice) {
      return { error: { message: 'Not enough crowns to buy out' } };
    }

    const item = await Item.findById(auction.item);
    if (!item) {
      await auction.deleteOne();
      return { error: { message: 'Item no longer exists' } };
    }

    const buyerEntries = loadEntries(buyer);
    const free = findFreePosition(buyerEntries, item);
    if (!free) return { error: { message: 'No room in your inventory' } };

    // Refund the prior leading bidder if it isn't the buyer themselves.
    if (auction.highestBidder && String(auction.highestBidder) !== String(buyer._id)) {
      const prior = await Character.findById(auction.highestBidder);
      if (prior) {
        prior.crowns = (prior.crowns ?? 0) + auction.currentBid;
        await prior.save();
      }
    } else if (auction.highestBidder && String(auction.highestBidder) === String(buyer._id)) {
      // Buyer was the leading bidder — refund their lock first.
      buyer.crowns = (buyer.crowns ?? 0) + auction.currentBid;
    }

    buyer.crowns = (buyer.crowns ?? 0) - auction.buyoutPrice;
    const next = placeItem(buyerEntries, item, free.x, free.y);
    buyer.set('inventory', serializeInventory(next));
    buyer.markModified('inventory');

    item.owner = buyer._id;
    await item.save();
    await buyer.save();

    auction.status = 'settled';
    auction.currentBid = auction.buyoutPrice;
    auction.highestBidder = buyer._id as any;
    await auction.save();

    revalidatePath('/game/auction');
    revalidatePath('/game/overview');
    return { ok: true };
  } catch (error: any) {
    console.log(`${new Date()} - buyoutAuctionAction failed - ${error}`);
    return { error: { message: error?.message || 'Failed to buy out' } };
  }
}
