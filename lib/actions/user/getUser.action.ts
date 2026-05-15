'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import Item from '@/lib/models/item.model';
import Journal from '@/lib/models/journal.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import { migrateLegacyInventory } from '@/lib/utils/inventory/grid';
import { tickChampionSalary } from '@/lib/actions/arena/arenaPot.action';
import { cookies } from 'next/headers';

const EQUIPMENT_SLOT_NAMES = [
  'head', 'chest', 'legs', 'gloves', 'cloak', 'boots',
  'mainHand', 'offHand', 'necklace', 'ring1', 'ring2',
];

export async function getUser(getInventory = false) {
  const tokenCookie = cookies().get(COOKIE_NAME);

  if (!tokenCookie || !tokenCookie.value) {
    return null;
  }

  try {
    const userId = extractUserId(tokenCookie.value);

    await connectToDB();

    const user = await User.findById(userId).populate({
      path: 'character',
      model: Character,
      populate: {
        path: 'journal',
        model: Journal,
      },
    });

    if (!user) return null;

    const character = user.character as any;
    let dirty = false;

    // Migrate legacy 2-D inventory grid into the new flat-list schema.
    if (character?.inventory) {
      const migrated = migrateLegacyInventory(character.inventory);
      if (migrated) {
        character.set('inventory', migrated);
        character.markModified('inventory');
        dirty = true;
      }
    }

    if (getInventory && Array.isArray(character?.inventory)) {
      // Populate each entry's referenced Item, dropping dead refs.
      const populated: any[] = [];
      for (const entry of character.inventory as any[]) {
        if (!entry?.item) continue;
        if (typeof entry.item === 'object' && 'name' in entry.item) {
          populated.push(entry);
          continue;
        }
        const item = await Item.findById(entry.item);
        if (item) {
          populated.push({ item, x: entry.x ?? 0, y: entry.y ?? 0 });
        } else {
          dirty = true;
        }
      }
      character.set('inventory', populated);
    }

    if (character?.equipment) {
      for (const slot of EQUIPMENT_SLOT_NAMES) {
        const ref = character.equipment[slot];
        if (ref && typeof ref === 'object' && !('name' in ref)) {
          const item = await Item.findById(ref);
          if (item) {
            character.equipment[slot] = item;
          } else {
            character.equipment[slot] = null;
            dirty = true;
          }
        }
      }
    }

    // Background champion-salary tick. Runs on every page load so the
    // gold/exp accrues without the player needing to visit /game/arena.
    // tickChampionSalary mutates the doc in-place when there's a real
    // payment to apply; everything else is a cheap no-op.
    let salaryDirty = false;
    try {
      const paid = await tickChampionSalary(character);
      if (paid && (paid.gold > 0 || paid.exp > 0)) {
        salaryDirty = true;
      }
    } catch (err) {
      console.log(`${new Date()} - champion salary tick failed - ${err}`);
    }

    if ((dirty || salaryDirty) && character) {
      if (dirty) {
        character.markModified('inventory');
        character.markModified('equipment');
      }
      try {
        await character.save();
      } catch (err) {
        console.log(`${new Date()} - Failed to persist inventory cleanup - ${err}`);
      }
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.log(`${new Date()} - Failed to authenticate user - ${error}`);
    return null;
  }
}
