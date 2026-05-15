import mongoose from 'mongoose';

// One pot per arena tier. The pot accumulates passively over time while
// it sits on the tier's current #1 (the "champion"), and whoever beats
// the champion in arena claims it. Champions also get a small hourly
// salary, claimed lazily next time they fight or visit the arena.
const arenaPotSchema = new mongoose.Schema({
  tierId: {
    type: String,
    required: true,
    unique: true,
  },
  championId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    default: null,
  },
  championName: {
    type: String,
    default: null,
  },
  championBecameAt: {
    type: Date,
    default: null,
  },
  // Game gold currently sitting on the champion's head.
  potAmount: {
    type: Number,
    default: 0,
  },
  potUpdatedAt: {
    type: Date,
    default: () => new Date(),
  },
  // Last time the current champion claimed hourly salary.
  lastSalaryAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

const ArenaPot = mongoose.models.ArenaPot
  || mongoose.model('ArenaPot', arenaPotSchema);

export default ArenaPot;
