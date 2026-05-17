'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
import Package from '@/lib/models/package.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import {
  InventoryEntry,
  findFreePositionAnyBag,
  migrateLegacyInventory,
  placeItem,
} from '@/lib/utils/inventory/grid';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import { PackageSource, PackageView } from './package.types';

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

// Server-only helper for other actions to drop an awarded item into the
// player's package mailbox. Returns the created package id.
export async function createPackageFor(
  ownerId: string,
  itemId: string,
  source: PackageSource,
  detail: string = '',
): Promise<string | null> {
  try {
    await connectToDB();
    const pkg = await Package.create({ owner: ownerId, item: itemId, source, detail });
    return String(pkg._id);
  } catch (err) {
    console.log(`${new Date()} - createPackageFor failed - ${err}`);
    return null;
  }
}

export async function listPackages(): Promise<{ packages?: PackageView[]; error?: { message: string } }> {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  try {
    const docs = await Package.find({ owner: character._id })
      .populate({ path: 'item', model: Item })
      .sort({ createdAt: -1 })
      .lean();

    const packages: PackageView[] = (docs as any[]).map((p) => ({
      _id: String(p._id),
      source: p.source,
      detail: p.detail ?? '',
      item: p.item ? (JSON.parse(JSON.stringify(p.item)) as ItemInterface) : null,
    }));

    return { packages };
  } catch (err: any) {
    console.log(`${new Date()} - listPackages failed - ${err}`);
    return { error: { message: err?.message || 'Failed to load packages' } };
  }
}

export async function claimPackage({ packageId }: { packageId: string }) {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  try {
    await connectToDB();
    const pkg = await Package.findOne({ _id: packageId, owner: character._id });
    if (!pkg) return { error: { message: 'Package not found' } };

    const item = await Item.findById(pkg.item);
    if (!item) {
      await pkg.deleteOne();
      return { error: { message: 'Item no longer exists' } };
    }

    const entries = loadInventoryEntries(character);
    const spot = findFreePositionAnyBag(entries, item);
    if (!spot) return { error: { message: 'Inventory full -- no room across any bag' } };

    item.owner = character._id;
    await item.save();
    const next = placeItem(entries, item, spot.x, spot.y, spot.bag);
    character.inventory = serializeInventory(next);
    character.markModified('inventory');
    await character.save();
    await pkg.deleteOne();

    revalidatePath('/game/packages');
    revalidatePath('/game/overview');
    return { ok: true, bag: spot.bag };
  } catch (err: any) {
    console.log(`${new Date()} - claimPackage failed - ${err}`);
    return { error: { message: err?.message || 'Claim failed' } };
  }
}

export async function discardPackage({ packageId }: { packageId: string }) {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  try {
    await connectToDB();
    const pkg = await Package.findOne({ _id: packageId, owner: character._id });
    if (!pkg) return { error: { message: 'Package not found' } };

    await Item.deleteOne({ _id: pkg.item, owner: null });
    await pkg.deleteOne();

    revalidatePath('/game/packages');
    return { ok: true };
  } catch (err: any) {
    console.log(`${new Date()} - discardPackage failed - ${err}`);
    return { error: { message: err?.message || 'Discard failed' } };
  }
}

export async function getPackageCount(): Promise<number> {
  const character = await getMyCharacter();
  if (!character) return 0;
  try {
    await connectToDB();
    return await Package.countDocuments({ owner: character._id });
  } catch {
    return 0;
  }
}
