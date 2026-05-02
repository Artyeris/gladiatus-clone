import mongoose from 'mongoose';

const marketListingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
    item:   { type: mongoose.Schema.Types.ObjectId, ref: 'Item',      required: true },
    price:  { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const MarketListing =
  mongoose.models.MarketListing ||
  mongoose.model('MarketListing', marketListingSchema);

export default MarketListing;
