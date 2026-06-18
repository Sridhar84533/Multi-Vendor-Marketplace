const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  title: String,
  image: String,
  price: Number,
  quantity: Number,
  selectedVariant: { type: Map, of: String },
});

const trackingSchema = new mongoose.Schema({
  status: { type: String, enum: ['Order Placed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Return Approved', 'Refunded'] },
  timestamp: { type: Date, default: Date.now },
  message: String,
  location: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      type: { type: String },
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      name: String,
      phone: String,
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    loyaltyPointsUsed: { type: Number, default: 0 },
    walletAmountUsed: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'upi', 'card', 'netbanking', 'cod'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      enum: ['Order Placed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Return Approved', 'Refunded'],
      default: 'Order Placed',
    },
    trackingHistory: [trackingSchema],
    estimatedDelivery: Date,
    deliveredAt: Date,
    invoiceUrl: String,
    notes: String,
    returnReason: String,
    returnType: { type: String, enum: ['refund', 'replacement'], default: 'refund' },
    vendorReply: String,
    refurbishedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
