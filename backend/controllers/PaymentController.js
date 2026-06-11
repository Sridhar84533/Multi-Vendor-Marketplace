const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @POST /api/payment/razorpay/create-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!razorpay) {
      // Mock mode for local execution/testing if variables are missing
      return res.json({
        id: 'mock_razorpay_' + Math.random().toString(36).substr(2, 9),
        amount: amount * 100,
        currency: 'INR',
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/payment/razorpay/verify
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay) {
      // Mock validation
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'Paid';
          order.razorpayOrderId = razorpay_order_id;
          order.razorpayPaymentId = razorpay_payment_id;
          await order.save();
        }
      }
      return res.json({ success: true, message: 'Mock payment verified successfully' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'Paid';
          order.razorpayOrderId = razorpay_order_id;
          order.razorpayPaymentId = razorpay_payment_id;
          await order.save();
        }
      }
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
