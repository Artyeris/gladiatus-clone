import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  username?: string;
  email?: string;
  password?: string;
  character?: mongoose.Types.ObjectId;
  level?: number;
  strength?: number;
  endurance?: number;
  agility?: number;
  dexterity?: number;
  intelligence?: number;
  charisma?: number;
  experience?: number;
  crowns?: number;
  language?: 'en' | 'lt';
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    select: false,
  },
  character: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    default: null,
  },

  // Legacy fields keep older local test users readable while Character owns game stats.
  level: { type: Number, default: 1 },
  strength: { type: Number, default: 5 },
  endurance: { type: Number, default: 5 },
  agility: { type: Number, default: 5 },
  dexterity: { type: Number, default: 5 },
  intelligence: { type: Number, default: 5 },
  charisma: { type: Number, default: 5 },
  experience: { type: Number, default: 0 },
  crowns: { type: Number, default: 100 },
  language: { type: String, enum: ['en', 'lt'], default: 'en' },
}, {
  timestamps: true,
});

const User: any = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

const missingCachedPaths: Record<string, any> = {};

if (!User.schema.path('username')) {
  missingCachedPaths.username = {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  };
}

if (!User.schema.path('email')) {
  missingCachedPaths.email = {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  };
}

if (!User.schema.path('password')) {
  missingCachedPaths.password = {
    type: String,
    select: false,
  };
}

if (!User.schema.path('character')) {
  missingCachedPaths.character = {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    default: null,
  };
}

if (Object.keys(missingCachedPaths).length > 0) {
  User.schema.add(missingCachedPaths);
}

export default User;
