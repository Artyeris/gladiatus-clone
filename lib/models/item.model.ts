import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['head', 'chest', 'gloves', 'cloak', 'legs', 'boots', 'mainHand', 'offHand', 'necklace', 'ring']
  },
  level: {
    type: Number,
    required: true,
  },
  damage: {
    type: [Number],
  },
  armor: {
    type: Number,
  },
  strength: {
    type: Number,
  },
  endurance: {
    type: Number,
  },
  agility: {
    type: Number,
  },
  dexterity: {
    type: Number,
  },
  intelligence: {
    type: Number,
  },
  charisma: {
    type: Number,
  },
  power: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: 'Character',
  },
  sellPrice: {
    type: Number,
    required: true,
  },
  id: {
    type: String,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  quality: {
    type: String,
    enum: ['common', 'common_plus', 'green', 'green_plus', 'blue', 'blue_plus', 'purple', 'purple_plus', 'orange', 'orange_plus', 'red'],
    default: 'common',
  },
  prefix: { type: String },
  suffix: { type: String },
  durability: { type: Number },
  durabilityMax: { type: Number },
  conditioning: { type: Number },
  conditioningMax: { type: Number },

  // Affix-derived bonuses (rolled at drop time -- see constants/affixes).
  // Defaults are intentionally omitted so the field is absent on items
  // that didn't roll the bonus; combat code falls back to 0 with `?? 0`.
  damageBonus:     { type: Number },
  health:          { type: Number },
  strengthPct:     { type: Number },
  dexterityPct:    { type: Number },
  agilityPct:      { type: Number },
  endurancePct:    { type: Number },
  charismaPct:     { type: Number },
  intelligencePct: { type: Number },
  blockChanceBonus: { type: Number },
  critChanceBonus:  { type: Number },

  // Dungeon-only -- stored but ignored by combat for now.
  threat:               { type: Number },
  hardeningValue:       { type: Number },
  healing:              { type: Number },
  criticalHealingValue: { type: Number },
}, {
  timestamps: true
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

export default Item;