// lib/dbConnect.ts
import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

export default async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    // Fallback URI in case .env is missing
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gladiatus';
    
    await mongoose.connect(uri);
    connection.isConnected = 1;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}
