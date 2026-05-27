import mongoose from 'mongoose';

// One Mongoose doc per *owned* mercenary instance. The vendor pool
// itself lives in constants/mercenaries.ts -- this collection only
// stores rolled mercs that belong to a character.
const mercenarySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
  },
  // Foreign id into ITALY_MERCENARIES (templateId -- e.g. 'samnit').
  templateId: { type: String, required: true },
  name:       { type: String, required: true },
  type:       { type: String, enum: ['tank', 'healer', 'damage'], required: true },
  level:      { type: Number, required: true, default: 1 },
  quality:    { type: String, enum: ['green', 'blue', 'purple', 'orange', 'red'], default: 'green' },

  // Frozen stat block at purchase time. Recomputed if the merc levels
  // up. Stored as Mixed so adding new stat keys (heal crit, hardening
  // etc.) doesn't require a schema migration.
  stats: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const Mercenary = mongoose.models.Mercenary || mongoose.model('Mercenary', mercenarySchema);
export default Mercenary;
