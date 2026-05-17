import mongoose from 'mongoose';

// A "package" is an item the player has been awarded but hasn't pulled
// out yet. All shop/auction/market/expedition drops land here first;
// the player ferries them into bag inventory from the Packages screen.
// `source` is a short label used by the UI to badge each entry.
// Packages do not expire -- the player decides when to claim or drop.
const packageSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true, index: true },
  item:  { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  source: {
    type: String,
    enum: ['shop', 'auction', 'market', 'expedition', 'arena', 'quest', 'dungeon', 'other'],
    default: 'other',
  },
  // Optional human readable subtitle (e.g. "Bandit Camp", "Auction win").
  detail: { type: String, default: '' },
}, { timestamps: true });

const Package = mongoose.models.Package || mongoose.model('Package', packageSchema);

export default Package;
