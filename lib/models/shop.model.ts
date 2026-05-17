import mongoose from 'mongoose';

// One document per shop type. `slots` is a fixed-length array; sold-out
// slots have `item: null` until the next refresh repopulates them.
const shopSchema = new mongoose.Schema({
  shopType: {
    type: String,
    required: true,
    unique: true,
    enum: ['goods', 'armor', 'weapons', 'alchemist'],
  },
  slots: [{
    _id: false,
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  }],
  lastRefreshAt: {
    type: Date,
    default: () => new Date(0),
  },
}, { timestamps: true });

const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);

export default Shop;
