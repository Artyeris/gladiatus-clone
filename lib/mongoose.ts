import mongoose from 'mongoose';

let isConnected = false;

// Disable Mongoose's query buffering globally. Without this, calls
// to a model when no connection is open queue for 10 seconds before
// timing out with the cryptic "Operation `users.findOne()` buffering
// timed out after 10000ms" message. Failing fast lets callers
// (getUser, sign-in action) catch the error and render a graceful
// "MongoDB is unavailable" state instead.
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', true);

export const connectToDB = async () => {
  const MONGODB_URL = process.env.MONGODB_URL;

  if (!MONGODB_URL) {
    console.log('MONGODB_URL not found');
    throw new Error('MONGODB_URL not configured');
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URL, {
      // Fail fast (3s) instead of the 30s default so a downed mongod
      // doesn't make the whole page sit waiting.
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    isConnected = false;
    console.log(`${new Date()} - MongoDB connection failed - ${error}`);
    // Re-throw so callers know the DB is down and can render a friendly
    // fallback (the auth pages already have a .catch path).
    throw error;
  }
};