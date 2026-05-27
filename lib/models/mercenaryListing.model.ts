import mongoose from 'mongoose';

// Player-to-player mercenary marketplace. Parallels MarketListing but
// references a Mercenary instead of an Item. Mercs listed here are
// removed from the seller's roster while listed, and returned with
// the proceeds when the listing is bought or cancelled.
const mercenaryListingSchema = new mongoose.Schema(
  {
    seller:     { type: mongoose.Schema.Types.ObjectId, ref: 'Character',  required: true },
    mercenary:  { type: mongoose.Schema.Types.ObjectId, ref: 'Mercenary',  required: true },
    price:      { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

const MercenaryListing =
  mongoose.models.MercenaryListing ||
  mongoose.model('MercenaryListing', mercenaryListingSchema);

export default MercenaryListing;
