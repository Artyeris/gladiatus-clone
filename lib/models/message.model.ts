import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
    // High-level event type so the inbox can group/icon them.
    kind: {
      type: String,
      enum: ['auction', 'work', 'market', 'system'],
      default: 'system',
    },
    title: { type: String, required: true },
    body:  { type: String, required: true },
    read:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;
