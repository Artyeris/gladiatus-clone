import mongoose from 'mongoose';

// Plain-nested counters (no `type: { ... }` wrapper) so Mongoose treats
// each field as a real path and tracks mutations like
// `journal.arena.battles++`. The previous "single nested subdocument"
// shape silently dropped some increments on save, which is why the
// Statistics page stayed pinned at 0 even after dozens of fights.
const COUNTER_DEFAULTS = {
  battles: 0,
  wins: 0,
  defeats: 0,
  draws: 0,
  damageInflicted: 0,
  damageReceived: 0,
  honorEarned: 0,
  crownsEarned: 0,
};

const counterSchema = {
  battles:         { type: Number, default: 0 },
  wins:            { type: Number, default: 0 },
  defeats:         { type: Number, default: 0 },
  draws:           { type: Number, default: 0 },
  damageInflicted: { type: Number, default: 0 },
  damageReceived:  { type: Number, default: 0 },
  honorEarned:     { type: Number, default: 0 },
  crownsEarned:    { type: Number, default: 0 },
};

const journalSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
  },
  arena: counterSchema,
  world: counterSchema,
  // Mixed so new expeditions/enemies can be tracked without a schema
  // migration. battleEnemy lazily initialises missing entries.
  expeditions: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Make sure freshly-created journals start with zeroed counters even
// when the caller doesn't pass them in (Journal.create({owner})).
journalSchema.pre('save', function (this: any, next: () => void) {
  const doc = this;
  if (!doc.arena || typeof doc.arena !== 'object') doc.arena = { ...COUNTER_DEFAULTS };
  if (!doc.world || typeof doc.world !== 'object') doc.world = { ...COUNTER_DEFAULTS };
  next();
});

const Journal = mongoose.models.Journal || mongoose.model('Journal', journalSchema);

export default Journal;
