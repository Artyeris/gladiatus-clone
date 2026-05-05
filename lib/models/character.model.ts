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
  inventory: {
    type: [
      {
        _id: false,
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
      },
    ],
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