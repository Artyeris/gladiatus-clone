import { NextResponse } from 'next/server';

// FIX: Use @/ alias to point directly to root/lib/dbConnect
import dbConnect from '@/lib/dbConnect'; 

// FIX: Use @/ alias to point directly to root/lib/models/user.model
import User from '@/lib/models/user.model'; 

export async function GET(request: Request) {
  await dbConnect();

  try {
    // Find user by name 'Artiom' (Based on your registration nickname)
    const user = await User.findOne({ name: 'Artiom' }).lean(); 

    if (!user) {
      return NextResponse.json({ error: 'User not found (Check DB for "Artiom")' }, { status: 404 });
    }

    // Calculate stats for the UI bars
    const maxHealth = (user.endurance || 5) * 10 + (user.level || 1) * 5; 
    const currentHealth = maxHealth; 
    
    // Simple XP curve logic
    const maxExperience = (user.level || 1) * 100; 

    return NextResponse.json({
      name: user.name,
      level: user.level || 1,
      strength: user.strength || 5,
      endurance: user.endurance || 5,
      agility: user.agility || 5,
      dexterity: user.dexterity || 5,
      intelligence: user.intelligence || 5,
      charisma: user.charisma || 5,
      experience: user.experience || 0,
      maxExperience: maxExperience,
      health: currentHealth,
      maxHealth: maxHealth
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
