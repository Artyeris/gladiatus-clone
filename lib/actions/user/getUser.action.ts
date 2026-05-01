'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import Item from '@/lib/models/item.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils'; 
import { cookies } from 'next/headers';

export async function getUser(getInventory = false) {
  const tokenCookie = cookies().get(COOKIE_NAME); 
  
  if (!tokenCookie || !tokenCookie.value) {
    return null; 
  }

  try {
    const userId = extractUserId(tokenCookie.value); 
    
    await connectToDB();

    const user = await User.findById(userId).populate([
      { 
        path: 'character', 
        model: Character,
      }
    ]);

    if (!user) return null; 

    const character = user.character as any;

    let dirty = false;

    if (getInventory && character?.inventory) {
      const inventory = character.inventory;
      // Track ids that are still alive so non-anchor string cells from dead
      // multi-cell items can be cleared too.
      const liveItemIds = new Set<string>();
      for (let i = 0; i < inventory.length; i++) {
        for (let j = 0; j < inventory[i].length; j++) {
          const cell = inventory[i][j];
          if (cell && typeof cell === 'object' && !('name' in cell)) {
            const item = await Item.findById(cell);
            if (item) {
              inventory[i][j] = item;
              if (item.id) liveItemIds.add(item.id);
            } else {
              // Dead reference -> blank it.
              inventory[i][j] = null;
              dirty = true;
            }
          } else if (cell && typeof cell === 'object' && 'id' in cell && cell.id) {
            liveItemIds.add(cell.id);
          }
        }
      }
      // Clear non-anchor (string) cells whose anchor is gone.
      for (let i = 0; i < inventory.length; i++) {
        for (let j = 0; j < inventory[i].length; j++) {
          const cell = inventory[i][j];
          if (typeof cell === 'string' && !liveItemIds.has(cell)) {
            inventory[i][j] = null;
            dirty = true;
          }
        }
      }
    }

    if (character?.equipment) {
      const slots: string[] = [
        'head', 'chest', 'legs', 'gloves', 'cloak', 'boots',
        'mainHand', 'offHand', 'necklace', 'ring1', 'ring2',
      ];
      for (const slot of slots) {
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

    if (dirty && character) {
      // Persist the cleanup so future writes (moveItem, etc.) load a clean
      // baseline. Mark Mixed paths so Mongoose actually serializes.
      character.markModified('inventory');
      character.markModified('equipment');
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
