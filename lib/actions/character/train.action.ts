// lib/actions/character/train.action.ts
'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect'; // Fixed import to match default export
import User from '@/lib/models/user.model'; 
import { cookies } from 'next/headers';
import { extractUserId } from '@/lib/utils/jwtUtils'; // Assuming you have this utility

interface TrainCharacterParams {
  stat: string;
}

export async function trainCharacter({ stat }: TrainCharacterParams) {
  try {
    await dbConnect();

    // 1. Get User ID from cookie
    const tokenCookie = cookies().get('token'); // Adjust name if your cookie is different (e.g., 'jwt', 'session')
    
    let userId: string;
    if (tokenCookie) {
      userId = extractUserId(tokenCookie.value);
    } else {
        // Fallback for local testing if no auth yet - replace with actual ID or logic
        // For now, we assume the user is logged in. 
        // If you are testing without login, hardcode a valid User ID here:
        userId = 'YOUR_USER_ID_HERE'; 
    }

    // 2. Find User and update stats directly
    // This ensures Overview (which reads from User) stays in sync with Training
    const user = await User.findById(userId);

    if (!user) {
      return { error: 'User not found' };
    }

    // 3. Calculate Cost (Example logic: cost increases with level)
    const currentStatValue = user[stat as keyof typeof user] || 5;
    const cost = Math.floor(currentStatValue * 1.5); 

    if ((user as any).crowns < cost) {
      return { error: 'Not enough crowns' };
    }

    // 4. Update User Stats
    (user as any)[stat] += 1;
    (user as any).crowns -= cost;

    await user.save();

    // 5. Revalidate both pages so they show new data instantly
    revalidatePath('/game/training');
    revalidatePath('/game/overview');

    return { message: 'Stat trained successfully' };

  } catch (error) {
    console.error(`${new Date()} - Failed to train stat - ${error}`);
    throw error;
  }
}
