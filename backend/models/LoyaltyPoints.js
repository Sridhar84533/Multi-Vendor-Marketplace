const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['earned', 'redeemed', 'expired'], required: true },
    points: { type: Number, required: true },
    description: { type: String },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoyaltyPoints', loyaltySchema);
