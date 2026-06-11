const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' },
  street: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const savedCardSchema = new mongoose.Schema({
  last4: String,
  brand: String,
  expMonth: Number,
  expYear: Number,
  razorpayTokenId: String,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    addresses: [addressSchema],
    savedCards: [savedCardSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    loyaltyPoints: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
