import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect'; 
import User from '../../lib/models/user.model'; 

// Import getServerSession to check who is logged in
// Note: If your auth config file is named differently, adjust the import path
import { getServerSession } from 'next-auth/next';

export async function GET(request: Request) {
  await dbConnect();

  try {
    // 1. Get the current session to find the logged-in user ID
    const session = await getServerSession({ 
      req: request as any, // Next.js types sometimes need casting here
      cookieName: '__next-auth', // Default NextAuth cookie name
      secret: process.env.NEXTAUTH_SECRET || 'secret' 
    });

    if (!session) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    // 2. Find the user by their ID (not name!)
    const userId = session.user.id; 
    
    const user = await User.findById(userId).lean(); 

    if (!user) {
      return NextResponse.json({ error: 'User not found in DB' }, { status: 404 });
    }

    // 3. Calculate stats for the UI bars
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
