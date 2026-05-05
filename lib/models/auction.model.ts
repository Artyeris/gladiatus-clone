import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema(
  {
    // No `seller` field: auction items are spawned by the auction house itself
    // and rotate every cycle.
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    startingPrice: { type: Number, required: true, min: 0 },
    currentBid:    { type: Number, required: true, min: 0 },
    buyoutPrice:   { type: Number, required: true, min: 0 },
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', default: null },
    endsAt: { type: Date, required: true },
    status: { type: String, enum: ['open', 'settled'], default: 'open' },
  },
  { timestamps: true }
);

const Auction =
  mongoose.models.Auction || mongoose.model('Auction', auctionSchema);

export default Auction;
