// lib/utils/jwtUtils.ts
import { verify } from 'jsonwebtoken';

export function extractUserId(token: string) {
  // FIX: Add a fallback secret so it doesn't crash if .env is missing
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-testing';
  
  try {
    const decoded = verify(token, secret);
    return (decoded as any).userId;
  } catch (error) {
    console.log('Token verification failed:', error);
    throw new Error('Invalid Token');
  }
}
