'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import Item from '@/lib/models/item.model';
import { connectToDB } from '@/lib/mongoose';
// Import from the new file we just created
import { extractUserId } from '@/lib/utils/jwtUtils'; 
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function getUser(getInventory = false) {
  const tokenCookie = cookies().get(COOKIE_NAME); 
  
  // FIX: If no cookie exists, return null instead of throwing immediately. 
  if (!tokenCookie || !tokenCookie.value) {
    console.log('No token found');
    return null; 
  }

  try {
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

    if (!user) return null; 
    
    revalidatePath('/game/overview');
    
    return JSON.parse(JSON.stringify(user));

  } catch (error) {
    console.log(`${new Date()} - Failed to authenticate user - ${error}`);
    return null; 
  }
}
