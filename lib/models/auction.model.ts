import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
    item:   { type: mongoose.Schema.Types.ObjectId, ref: 'Item',      required: true },
    // Starting bid set by the seller.
    startingPrice: { type: Number, required: true, min: 0 },
    // Current top bid (== startingPrice when nobody has bid yet).
    currentBid: { type: Number, required: true, min: 0 },
    // The currently-leading bidder (null while nobody has bid).
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', default: null },
    // When the auction will end. Phases derive from time remaining.
    endsAt: { type: Date, required: true },
    // 'open' while running, 'settled' after the item has been delivered.
    status: { type: String, enum: ['open', 'settled', 'cancelled'], default: 'open' },
  },
  { timestamps: true }
);

const Auction =
  mongoose.models.Auction || mongoose.model('Auction', auctionSchema);

export default Auction;
