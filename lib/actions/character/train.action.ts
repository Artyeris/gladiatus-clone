// lib/actions/character/train.action.ts
'use server'

import { revalidatePath } from 'next/cache';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/dbConnect'; // Use the fixed dbConnect
import { extractUserId } from '@/lib/utils/jwtUtils'; // Use the fixed jwtUtils

interface TrainCharacterParams {
  stat: string;
}

export async function trainCharacter({ stat }: TrainCharacterParams) {
  try {
    await connectToDB();

    // Get user ID from cookie (assuming you have a way to get this, e.g., via cookies().get(COOKIE_NAME))
    // For now, let's assume we pass userId or get it from session. 
    // If your train action is called with just stat, we need the userId first.
    
    // NOTE: You likely need to import { cookies } from 'next/headers' and get the ID here like in getUser.action.ts
    
    const tokenCookie = cookies().get(COOKIE_NAME);
    if (!tokenCookie || !tokenCookie.value) throw new Error('Unauthorized');
    const userId = extractUserId(tokenCookie.value);

    // FIX: Use strictPopulate: false to avoid the error
    const user = await User.findById(userId).populate({ 
      path: 'character', 
      model: Character,
      strictPopulate: false 
    });

    if (!user) throw new Error('User not found');
    
    // Ensure character exists before training
    if (!user.character) {
        // Create a default character if none exists
        const newCharacter = await Character.create({
            userId: user._id,
            strength: 5,
            endurance: 5,
            agility: 5,
            dexterity: 5,
            intelligence: 5,
            charisma: 5,
            // ... other default fields
        });
        user.character = newCharacter;
    }

    const character = user.character;

    // Check if user has enough crowns (example logic)
    const cost = Math.floor(character[stat as keyof typeof character] * 1.5);
    
    if ((user as any).crowns < cost) {
        return { error: 'Not enough crowns' };
    }

    // Update Character Model
    character[stat as keyof typeof character] += 1;
    await character.save();

    // FIX: Update User Model so Overview reflects the change
    user[stat as keyof typeof user] = character[stat as keyof typeof character];
    
    // Decrease crowns
    (user as any).crowns -= cost;
    
    await user.save();

    revalidatePath('/game/training');
    revalidatePath('/game/overview'); // Revalidate overview so it shows new stats

    return { message: 'Stat trained successfully' };

  } catch (error) {
    console.log(`${new Date()} - Failed to train stat - ${error}`);
    throw error;
  }
}
