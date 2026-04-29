// lib/dbConnect.ts
import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  // Check if we have a connection to the database or if it's currently connecting
  if (connection.isConnected) {
    console.log('Already connected to existing database session');
    return;
  }

  try {
    // Use MONGODB_URI as standard, fallback to MONGODB_URL if needed
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/gladiatus';
    
    const db = await mongoose.connect(uri);

    connection.isConnected = db.connections[0].readyState;
    console.log('Database connected successfully');
  } catch (error) {
    console.log('Database connection failed:', error);
    // Don't exit(1) in Next.js dev server, just log it
  }
}

export default dbConnect;
