'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import Item from '@/lib/models/item.model';
import Journal from '@/lib/models/journal.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import { migrateLegacyInventory } from '@/lib/utils/inventory/grid';
// tickChampionSalary import dropped: salary is now claimed
// explicitly via the Arena pot panel rather than auto-paid on every
// page load.
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

    // Belt-and-braces: read the inventory straight from the underlying
    // MongoDB collection so the `bag` field is preserved even when a
    // cached Mongoose schema (e.g. surviving across Next.js hot reloads)
    // would have stripped it on the populated `user.character` doc.
    if (character?._id) {
      try {
        const raw = await Character.collection.findOne(
          { _id: character._id },
          { projection: { inventory: 1 } },
        );
        if (raw && Array.isArray((raw as any).inventory)) {
          const rawInv = (raw as any).inventory as any[];
          // Splice raw bag/x/y back onto the Mongoose entries by index.
          // Both arrays come from the same source order, so positions
          // line up. If the lengths diverge for any reason, fall back
          // to the Mongoose entries untouched.
          if (Array.isArray(character.inventory) && character.inventory.length === rawInv.length) {
            for (let i = 0; i < rawInv.length; i++) {
              const r = rawInv[i] ?? {};
              const e: any = character.inventory[i];
              if (e) {
                e.x = r.x ?? e.x ?? 0;
                e.y = r.y ?? e.y ?? 0;
                e.bag = r.bag ?? e.bag ?? 0;
              }
            }
          }
        }
      } catch {}
    }

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
      // Preserve x / y / bag so the active inventory tab stays correct
      // (a previous version dropped bag here, which is why items
      // appeared to "snap back" to tab I).
      const populated: any[] = [];
      for (const entry of character.inventory as any[]) {
        if (!entry?.item) continue;
        const x   = entry.x ?? 0;
        const y   = entry.y ?? 0;
        const bag = entry.bag ?? 0;
        if (typeof entry.item === 'object' && 'name' in entry.item) {
          populated.push({ ...entry, x, y, bag });
          continue;
        }
        const item = await Item.findById(entry.item);
        if (item) {
          populated.push({ item, x, y, bag });
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

    // Champion-salary accrual is no longer auto-paid here: players
    // press the explicit "Claim salary" button in the Arena pot
    // panel. The pot keeps growing on the server regardless.

    if (dirty && character) {
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
