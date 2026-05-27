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

  // Equipment slots mirror the player's so the same Item documents
  // can shuttle between player and mercenary kit. Items remain owned
  // by the Character; the slot ref tracks which fighter is using it.
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
  },
}, { timestamps: true });

const Mercenary = mongoose.models.Mercenary || mongoose.model('Mercenary', mercenarySchema);
export default Mercenary;
