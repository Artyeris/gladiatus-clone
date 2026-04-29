'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import Item from '@/lib/models/item.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils'; 
import { cookies } from 'next/headers';

export async function getUser(getInventory = false) {
  const tokenCookie = cookies().get(COOKIE_NAME); 
  
  if (!tokenCookie || !tokenCookie.value) {
    return null; 
  }

  try {
    const userId = extractUserId(tokenCookie); 
    
    await connectToDB();

    const user = await User.findById(userId).populate([
      { 
        path: 'character', 
        model: Character,
      }
    ]);

    if (!user) return null; 

    const character = user.character as any;

    if (getInventory && character?.inventory) {
      const inventory = character.inventory;
      for (let i = 0; i < inventory.length; i++) {
        for (let j = 0; j < inventory[i].length; j++) {
          if (inventory[i][j] && typeof inventory[i][j] === 'object' && !('name' in inventory[i][j])) {
            const item = await Item.findById(inventory[i][j]);
            inventory[i][j] = item;
          }
        }
      }
    }

    return JSON.parse(JSON.stringify(user));

  } catch (error) {
    console.log(`${new Date()} - Failed to authenticate user - ${error}`);
    return null; 
  }
}
