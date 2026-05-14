import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
  },
  arena: {
    type: {
      battles: Number,
      wins: Number,
      defeats: Number,
      draws: Number,
      damageInflicted: Number,
      damageReceived: Number,
      honorEarned: Number,
    },
    default: {
      battles: 0,
      wins: 0,
      defeats: 0,
      draws: 0,
      damageInflicted: 0,
      damageReceived: 0,
      honorEarned: 0,
    },
  },
  world: {
    type: {
      battles: Number,
      wins: Number,
      defeats: Number,
      draws: Number,
      damageInflicted: Number,
      damageReceived: Number,
      honorEarned: Number,
    },
    default: {
      battles: 0,
      wins: 0,
      defeats: 0,
      draws: 0,
      damageInflicted: 0,
      damageReceived: 0,
      crownsEarned: 0,
    },
  },
  // Mixed so new expeditions/enemies can be tracked without a schema
  // migration. battleEnemy lazily initialises missing entries.
  expeditions: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

const Journal = mongoose.models.Journal || mongoose.model('Journal', journalSchema);

export default Journal;