'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import { items as ITEM_CATALOG } from '@/constants/items';
import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
import Shop from '@/lib/models/shop.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import type { ShopSlotView, ShopView } from '@/lib/types/shop';
import {
  BUY_PRICE_MULTIPLIER,
  SHOP_CATEGORIES,
  SHOP_FORCE_REFRESH_COST,
  SHOP_REFRESH_INTERVAL_MS,
  SHOP_SLOTS,
  ShopType,
  buyPriceFor,
  isShopType,
  msUntilNextRefresh,
} from '@/lib/utils/shopRotation';
import { scaleItemTemplate } from '@/lib/utils/itemUtils';
import {
  InventoryEntry,
  findFreePositionAnyBag,
  migrateLegacyInventory,
  placeItem,
} from '@/lib/utils/inventory/grid';

async function getMyCharacter() {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return null;
  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    const user = await User.findById(userId).populate({ path: 'character', model: Character });
    if (!user?.character) return null;
    return user.character as any;
  } catch {
    return null;
  }
}

function loadInventoryEntries(character: any): InventoryEntry[] {
  const migrated = migrateLegacyInventory(character.inventory);
  if (migrated) return migrated;
  if (!Array.isArray(character.inventory)) return [];
  return character.inventory.map((e: any) => ({
    item: e?.item, x: e?.x ?? 0, y: e?.y ?? 0, bag: e?.bag ?? 0,
  }));
}

function serializeInventory(entries: InventoryEntry[]) {
  return entries.map((e) => ({
    item: (e.item && typeof e.item === 'object' && '_id' in e.item) ? e.item._id : e.item,
    x: e.x, y: e.y, bag: e.bag ?? 0,
  }));
}

async function regenerateSlots(shop: any, characterLevel: number) {
  const oldIds = (shop.slots ?? [])
    .map((s: any) => s.item)
    .filter(Boolean);

  // Drop the previous rotation's orphan items (anything still
  // un-owned). If a player already bought one, it'll have an owner
  // and is skipped here.
  if (oldIds.length > 0) {
    await Item.deleteMany({ _id: { $in: oldIds }, owner: null });
  }

  const categories = SHOP_CATEGORIES[shop.shopType as ShopType] ?? [];
  const eligibleTemplates = Object.values(ITEM_CATALOG).filter(
    (it: any) => categories.includes(it.type),
  );

  const newSlots: { item: any }[] = [];
  for (let i = 0; i < SHOP_SLOTS; i++) {
    if (eligibleTemplates.length === 0) {
      newSlots.push({ item: null });
      continue;
    }
    const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)] as any;
    const scaled = scaleItemTemplate(template, characterLevel);
    // Shop items are not owned (owner: null) until someone buys them.
    const created = await Item.create({ ...scaled, owner: null });
    if (template.itemId && created._id) {
      created.id = `${template.itemId}-${created._id}`;
      await created.save();
    }
    newSlots.push({ item: created._id });
  }

  shop.slots = newSlots;
  shop.lastRefreshAt = new Date();
  await shop.save();
}

async function getOrCreateShop(shopType: ShopType, characterLevel: number) {
  let shop = await Shop.findOne({ shopType });
  if (!shop) {
    shop = await Shop.create({ shopType, slots: [], lastRefreshAt: new Date(0) });
  }
  const elapsed = Date.now() - new Date(shop.lastRefreshAt).getTime();
  if (elapsed >= SHOP_REFRESH_INTERVAL_MS || (shop.slots?.length ?? 0) !== SHOP_SLOTS) {
    await regenerateSlots(shop, characterLevel);
  }
  return shop;
}

export async function getShop(shopType: string): Promise<{ shop?: ShopView; error?: { message: string } }> {
  if (!isShopType(shopType)) return { error: { message: 'Unknown shop' } };
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  try {
    const shop = await getOrCreateShop(shopType, character.level ?? 1);

    // Populate each slot's Item document for display.
    const slots: ShopSlotView[] = [];
    for (let i = 0; i < SHOP_SLOTS; i++) {
      const slot = shop.slots[i];
      if (!slot?.item) {
        slots.push({ index: i, item: null, price: 0, soldOut: true });
        continue;
      }
      const itemDoc = await Item.findById(slot.item);
      if (!itemDoc) {
        slots.push({ index: i, item: null, price: 0, soldOut: true });
        continue;
      }
      const itemPlain = JSON.parse(JSON.stringify(itemDoc));
      slots.push({
        index: i,
        item: itemPlain as ItemInterface,
        price: buyPriceFor(itemPlain),
        soldOut: false,
      });
    }

    return {
      shop: {
        shopType,
        slots,
        msUntilRefresh: msUntilNextRefresh(shop.lastRefreshAt),
      },
    };
  } catch (err: any) {
    console.log(`${new Date()} - getShop(${shopType}) failed - ${err}`);
    return { error: { message: err?.message || 'Failed to load shop' } };
  }
}

export async function buyFromShop({
  shopType, slotIndex,
}: { shopType: string; slotIndex: number }) {
  if (!isShopType(shopType)) return { error: { message: 'Unknown shop' } };

  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  try {
    await connectToDB();
    const shop = await Shop.findOne({ shopType });
    if (!shop) return { error: { message: 'Shop not stocked yet -- refresh the page' } };

    const slot = shop.slots[slotIndex];
    if (!slot?.item) return { error: { message: 'That slot is empty' } };

    const item = await Item.findById(slot.item);
    if (!item) {
      shop.slots[slotIndex] = { item: null };
      shop.markModified('slots');
      await shop.save();
      return { error: { message: 'Item no longer available' } };
    }

    // Affirm the item really is still shelf stock (owner==null) and
    // nobody else races us to buy it.
    if (item.owner) {
      shop.slots[slotIndex] = { item: null };
      shop.markModified('slots');
      await shop.save();
      return { error: { message: 'Item just sold' } };
    }

    const price = buyPriceFor(item);
    if ((character.crowns ?? 0) < price) {
      return { error: { message: `Need ${price} crowns to buy this` } };
    }

    // Find a spot in the player's bags first; bail before deducting
    // gold if there's no room anywhere.
    const entries = loadInventoryEntries(character);
    const spot = findFreePositionAnyBag(entries, item);
    if (!spot) return { error: { message: 'Inventory full -- no room across any bag' } };

    character.crowns = (character.crowns ?? 0) - price;
    item.owner = character._id;
    await item.save();

    const next = placeItem(entries, item, spot.x, spot.y, spot.bag);
    character.inventory = serializeInventory(next);
    character.markModified('inventory');
    await character.save();

    shop.slots[slotIndex] = { item: null };
    shop.markModified('slots');
    await shop.save();

    revalidatePath(`/game/shop/${shopType}`);
    revalidatePath('/game/overview');
    return { ok: true, price, itemName: item.name, bag: spot.bag };
  } catch (err: any) {
    console.log(`${new Date()} - buyFromShop(${shopType}) failed - ${err}`);
    return { error: { message: err?.message || 'Purchase failed' } };
  }
}

// Force-refresh a shop. Costs SHOP_FORCE_REFRESH_COST crowns --
// matches Gladiatus's "new goods" button.
export async function forceRefreshShop(shopType: string) {
  if (!isShopType(shopType)) return { error: { message: 'Unknown shop' } };
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  if ((character.crowns ?? 0) < SHOP_FORCE_REFRESH_COST) {
    return { error: { message: `Refreshing costs ${SHOP_FORCE_REFRESH_COST} crowns` } };
  }

  try {
    await connectToDB();
    let shop = await Shop.findOne({ shopType });
    if (!shop) shop = await Shop.create({ shopType, slots: [], lastRefreshAt: new Date(0) });
    await regenerateSlots(shop, character.level ?? 1);
    character.crowns = (character.crowns ?? 0) - SHOP_FORCE_REFRESH_COST;
    await character.save();
    revalidatePath(`/game/shop/${shopType}`);
    return { ok: true };
  } catch (err: any) {
    console.log(`${new Date()} - forceRefreshShop(${shopType}) failed - ${err}`);
    return { error: { message: err?.message || 'Refresh failed' } };
  }
}
