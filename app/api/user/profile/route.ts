import { NextResponse } from 'next/server';

// FIX: Use @/ alias to point directly to root/lib/dbConnect
import dbConnect from '@/lib/dbConnect'; 

// FIX: Use @/ alias to point directly to root/lib/models/user.model
import User from '@/lib/models/user.model'; 
import Character from '@/lib/models/character.model';

export async function GET(request: Request) {
  await dbConnect();

  try {
    // Find user by name 'Artiom' (Based on your registration nickname)
    const user = await User.findOne({ name: 'Artiom' })
      .populate({
        path: 'character',
        model: Character,
      })
      .lean() as any; 

    if (!user) {
      return NextResponse.json({ error: 'User not found (Check DB for "Artiom")' }, { status: 404 });
    }

    const character = user.character || user;

    // Calculate stats for the UI bars
    const maxHealth = (character.endurance || 5) * 10 + (character.level || 1) * 5; 
    const currentHealth = maxHealth; 
    
    // Simple XP curve logic
    const maxExperience = (character.level || 1) * 100; 

    return NextResponse.json({
      name: character.name || user.name,
      level: character.level || 1,
      strength: character.strength || 5,
      endurance: character.endurance || 5,
      agility: character.agility || 5,
      dexterity: character.dexterity || 5,
      intelligence: character.intelligence || 5,
      charisma: character.charisma || 5,
      experience: character.experience || 0,
      maxExperience: maxExperience,
      health: currentHealth,
      maxHealth: maxHealth
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
