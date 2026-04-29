// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  level: number;
  strength: number;
  endurance: number;
  agility: number;
  dexterity: number;
  intelligence: number;
  charisma: number;
  experience: number;
  crowns: number;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String },
  level: { type: Number, default: 1 },
  strength: { type: Number, default: 5 },
  endurance: { type: Number, default: 5 },
  agility: { type: Number, default: 5 },
  dexterity: { type: Number, default: 5 },
  intelligence: { type: Number, default: 5 },
  charisma: { type: Number, default: 5 },
  experience: { type: Number, default: 0 },
  crowns: { type: Number, default: 100 } // Added currency field
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
