import mongoose from 'mongoose';

// One quest doc per accepted-but-not-yet-claimed quest. A character
// can hold up to MAX_ACTIVE_QUESTS at once. Completed quests
// (progress >= target) sit here until the player explicitly claims
// the reward, at which point the document is deleted.
const questSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true,
  },
  templateId: { type: String, required: true },
  category:   { type: String, required: true },
  verb:       { type: String, required: true },
  title:      { type: String, required: true },
  target:     { type: Number, required: true },
  progress:   { type: Number, default: 0 },
  rewardGold: { type: Number, default: 0 },
  rewardExp:  { type: Number, default: 0 },
  acceptedAt: { type: Date,   default: () => new Date() },
}, { timestamps: true });

// Each character can only carry one copy of a given quest at a time.
questSchema.index({ owner: 1, templateId: 1 }, { unique: true });

const Quest = mongoose.models.Quest || mongoose.model('Quest', questSchema);

export default Quest;
