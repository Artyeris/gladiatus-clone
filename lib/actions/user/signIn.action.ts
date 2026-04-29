'use server'

import { COOKIE_NAME, MAX_TOKEN_AGE } from '@/constants';
import User from '@/lib/models/user.model';
// Ensure this path matches your file structure (screenshot showed mongoose.ts in lib)
import { connectToDB } from '@/lib/mongoose'; 
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

interface signInUserParams {
  email: string,
  password: string,
}

export async function signInUser({ email, password }: signInUserParams) {
  if (!email || !password) return { error: { message: 'All fields must be completed' } };
  
  try {
    // Ensure DB connection is established
    await connectToDB(); 
    
    const user = await User.findOne({ email }).select('password _id');

    if (!user) return { error: { message: 'Invalid E-Mail or password' } };

    // Check password
    const isValidPassword = await compare(password, user.password);

    if (isValidPassword) {
      // FIX: Ensure JWT_SECRET is defined. If not, use a fallback to prevent "Illegal arguments"
      const secret = process.env.JWT_SECRET || 'your-fallback-secret-key-here'; 
      
      console.log('JWT Secret loaded:', secret ? 'Yes' : 'No'); // Debug log

      const token = sign({ userId: user._id }, secret, { expiresIn: MAX_TOKEN_AGE });
      
      cookies().set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        maxAge: MAX_TOKEN_AGE,
        path: '/',
      });

      return { message: 'User logged in' };
    }

    return { error: { message: 'Invalid E-Mail or password' } };

  } catch (error) {
    console.log(`${new Date()} - Failed to sign in user - ${error}`);
    // Return a generic error so the frontend doesn't hang
    return { error: { message: 'Server Error during login' } };
  }
}
