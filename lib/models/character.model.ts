import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
  },
  crowns: {
    type: Number,
    default: 0,
  },
  diamonds: {
    type: Number,
    default: 0,
  },
  // Rewards bookkeeping. Stores the last claim date for each cadence so
  // the next-claim window can be computed. All three are independent
  // cooldowns (1 day / 7 days / 28 days); no login streak is tracked.
  lastDailyClaim:   { type: Date, default: null },
  lastWeeklyClaim:  { type: Date, default: null },
  lastMonthlyClaim: { type: Date, default: null },
  level: {
    type: Number,
    default: 1,
  },
  experience: {
    type: Number,
    default: 0,
  },
  strength: {
    type: Number,
    default: 5,
  },
  dexterity: {
    type: Number,
    default: 5,
  },
  endurance: {
    type: Number,
    default: 5,
  },
  agility: {
    type: Number,
    default: 5,
  },
  intelligence: {
    type: Number,
    default: 5,
  },
  charisma: {
    type: Number,
    default: 5,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
  },
  journal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Journal',
  },
  battleReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BattleReport',
  },
  honor: {
    type: Number,
    default: 1000,
  },
  expeditionLastBattle: {
    type: Date,
    default: new Date(Date.now() - 10 * 60 * 1000),
  },
  arenaLastBattle: {
    type: Date,
    default: new Date(Date.now() - 10 * 60 * 1000),
  },
  isBot: {
    type: Boolean,
    default: false,
  },
  // Developer cheat flag. When true the character never dies and
  // never loses gold/items. Intended for testing only.
  godMode: {
    type: Boolean,
    default: false,
  },
  arenaTier: {
    type: String,
    default: null,
  },
  // Weekly arena counters powering the "7-day best" highscore tab.
  // weeklyWins is bumped on every arena win; the window resets when
  // the first win after `weekStartedAt + 7 days` lands.
  weeklyWins: { type: Number, default: 0 },
  weekStartedAt: { type: Date, default: () => new Date() },

  // Lifetime activity counters used by the Victories tab.
  workCount:  { type: Number, default: 0 },
  itemsFound: { type: Number, default: 0 },
  // Trade counters for the Trade victories tier.
  merchantSells: { type: Number, default: 0 },
  merchantBuys:  { type: Number, default: 0 },
  marketSells:   { type: Number, default: 0 },
  marketBuys:    { type: Number, default: 0 },
  auctionsWon:   { type: Number, default: 0 },
  // Per-stat train counters powering the Victories "Train X" tiers.
  trainCount: {
    strength:     { type: Number, default: 0 },
    dexterity:    { type: Number, default: 0 },
    agility:      { type: Number, default: 0 },
    endurance:    { type: Number, default: 0 },
    charisma:     { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
  },
  inventory: {
    // Mixed type so the schema doesn't strip any per-entry field --
    // most importantly `bag`, which a previously cached typed schema
    // would silently drop on read/write. Each entry is still the
    // same shape ({ item, x, y, bag }), just persisted as-is.
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  currentWork: {
    type: {
      _id: false,
      jobId: { type: String, required: true },
      hours: { type: Number, required: true },
      startedAt: { type: Date, required: true },
      endsAt: { type: Date, required: true },
    },
    default: null,
  },
  equipment: {
    head:     { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    chest:    { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    legs:     { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    gloves:   { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    cloak:    { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    boots:    { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    mainHand: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    offHand:  { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    necklace: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    ring1:    { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    ring2:    { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  }
}, {
  timestamps: true
});

const Character = mongoose.models.Character || mongoose.model('Character', characterSchema);

export default Character;