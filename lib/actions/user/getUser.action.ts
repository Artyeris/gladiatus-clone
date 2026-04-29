'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import Item from '@/lib/models/item.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// extracts the user id from the jwt and returns the user object if it is valid
export async function getUser(getInventory = false) {
  const tokenCookie = cookies().get(COOKIE_NAME); // Get the cookie object
  
  // FIX: Check if cookie exists AND has a value
  if (!tokenCookie || !tokenCookie.value) throw new Error('Unauthorized');

  try {
    // FIX: Pass only the string value (tokenCookie.value) to extractUserId
    const userId = extractUserId(tokenCookie.value); 
    
    await connectToDB();

    // Use 'userId' and combine populate options into one call
    const user = await User.findById(userId).populate([
      { 
        path: 'character', 
        model: Character,
        strictPopulate: false // This handles the missing schema field gracefully
      }
    ]);

    // If "getInventory" is true, populate the entire inventory with the items.
    if (getInventory && user.character) {
      const inventory = user.character.inventory;
      for (let i = 0; i < inventory.length; i++) {
        for (let j = 0; j < inventory[i].length; j++) {
          if (inventory[i][j] && typeof inventory[i][j] === 'object') {
            const item = await Item.findById(inventory[i][j]);
            inventory[i][j] = item;
          }
        }
      }
    }

    if (!user) throw new Error('Unauthorized');
    
    revalidatePath('/game/overview');
    
    return JSON.parse(JSON.stringify(user));

  } catch (error) {
    console.log(`${new Date()} - Failed to authenticate user - ${error}`);
    throw error;
  }
}
