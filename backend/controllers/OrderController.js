const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const LoyaltyPoints = require('../models/LoyaltyPoints');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');
const { generateInvoicePDF } = require('../utils/generateInvoice');
const { sendEmail } = require('../utils/sendEmail');

// @POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      subtotal,
      shippingFee,
      tax,
      discount,
      loyaltyPointsUsed,
      total,
      couponCode,
      paymentMethod,
    } = req.body;

    // Verify stock and update product totalSold and stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product ${item.title} not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${item.title}` });
      }
      product.stock -= item.quantity;
      product.totalSold += item.quantity;
      await product.save();
    }

    // Server-side delivery charge enforcement
    // Free delivery for orders Rs. 1000 and above; Rs. 49 otherwise
    const FREE_DELIVERY_THRESHOLD = 1000;
    const DELIVERY_CHARGE = 49;
    const calculatedShippingFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const calculatedTotal = subtotal + calculatedShippingFee - (discount || 0) - (loyaltyPointsUsed || 0);

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 days delivery

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      subtotal,
      shippingFee: calculatedShippingFee,
      tax: 0,
      discount,
      loyaltyPointsUsed,
      total: calculatedTotal,
      couponCode,
      paymentMethod,
      estimatedDelivery,
      trackingHistory: [{ status: 'Order Placed', message: 'Your order has been placed successfully.' }],
    });

    // Handle loyalty points reduction if used
    if (loyaltyPointsUsed > 0) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: -loyaltyPointsUsed } });
      await LoyaltyPoints.create({
        user: req.user._id,
        type: 'redeemed',
        points: loyaltyPointsUsed,
        description: `Redeemed points on order #${order._id}`,
        order: order._id,
      });
    }

    // Earn loyalty points (e.g. 1 point for every 100 Rs spent)
    const pointsEarned = Math.floor(total / 100);
    if (pointsEarned > 0) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: pointsEarned } });
      await LoyaltyPoints.create({
        user: req.user._id,
        type: 'earned',
        points: pointsEarned,
        description: `Earned points on order #${order._id}`,
        order: order._id,
      });
    }

    // Update vendor total sales/revenue metrics
    for (const item of items) {
      await Vendor.findByIdAndUpdate(item.vendor, {
        $inc: { totalSales: item.quantity, totalRevenue: item.price * item.quantity },
      });
    }

    // Clear user's cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Respond immediately — do NOT await email/PDF (fire-and-forget)
    res.status(201).json(order);

    // Generate Invoice PDF and Send to Customer Email in background
    setImmediate(async () => {
      try {
        const invoiceDir = path.join(__dirname, '../uploads/invoices');
        if (!fs.existsSync(invoiceDir)) {
          fs.mkdirSync(invoiceDir, { recursive: true });
        }
        const invoicePath = path.join(invoiceDir, `invoice-${order._id}.pdf`);
        await generateInvoicePDF(order, invoicePath);

        await sendEmail({
          to: req.user.email,
          subject: `Order Invoice - INV-${order._id.toString().toUpperCase()}`,
          text: `Hello ${req.user.name},\n\nThank you for your order! Your order receipt is attached.\n\nTotal: Rs. ${order.total.toFixed(2)}\n\nThank you,\nMulti-Vendor Marketplace`,
          html: `<p>Hello ${req.user.name},</p><p>Thank you for your order! Your order receipt is attached.</p><p>Total: <strong>Rs. ${order.total.toFixed(2)}</strong></p><p>Thank you,<br/>Multi-Vendor Marketplace</p>`,
          attachments: [
            {
              filename: `Invoice-${order._id}.pdf`,
              path: invoicePath,
            },
          ],
        });
        console.log(`✅ Invoice email sent for order ${order._id}`);
      } catch (emailErr) {
        console.error('❌ Failed to generate or send PDF invoice email:', emailErr);
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'title images price discountPrice');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, message, location } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.trackingHistory.push({ status, message, location });

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'Paid';
    }

    await order.save();

    // Trigger Notification
    const io = req.app.get('socketio');
    if (io) {
      io.to(order.user.toString()).emit('notification', {
        title: `Order Status: ${status}`,
        message: message || `Your order status has been updated to ${status}.`,
        type: 'order',
        link: `/orders/${order._id}`,
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/:id/invoice
exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const invoiceDir = path.join(__dirname, '../uploads/invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const invoicePath = path.join(invoiceDir, `invoice-${order._id}.pdf`);
    await generateInvoicePDF(order, invoicePath);

    res.download(invoicePath, `Invoice-${order._id}.pdf`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/orders/:id/return
exports.requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'Return Requested';
    order.returnReason = reason;
    order.trackingHistory.push({
      status: 'Return Requested',
      message: `Return requested. Reason: ${reason}`,
    });

    await order.save();
    res.json(order);

    // Notify each unique vendor involved in this order (fire and forget)
    setImmediate(async () => {
      try {
        const io = req.app.get('socketio');
        // Get unique vendor IDs from order items
        const vendorIds = [...new Set(order.items.map(i => i.vendor?.toString()).filter(Boolean))];

        for (const vendorId of vendorIds) {
          const vendor = await Vendor.findById(vendorId);
          if (!vendor) continue;

          // Save a persistent notification for the vendor's user account
          const notification = await Notification.create({
            user: vendor.user,
            title: '⚠️ Return/Replacement Requested',
            message: `Customer ${order.user?.name || 'A customer'} has requested a return for Order #${order._id}. Reason: ${reason}`,
            type: 'order',
            link: '/seller',
          });

          // Real-time push to vendor via Socket.io
          if (io) {
            io.to(vendor.user.toString()).emit('notification', {
              title: notification.title,
              message: notification.message,
              type: 'order',
              link: '/seller',
            });
          }
        }
      } catch (notifErr) {
        console.error('Failed to send return notification to vendor:', notifErr);
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/orders/:id/vendor-reply
exports.replyToReturn = async (req, res) => {
  try {
    const { reply } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.vendorReply = reply;
    await order.save();
    res.json({ message: 'Reply sent', vendorReply: reply });

    // Notify the customer (fire and forget)
    setImmediate(async () => {
      try {
        const io = req.app.get('socketio');
        const notif = await Notification.create({
          user: order.user._id,
          title: '📦 Seller Replied to Your Return Request',
          message: reply,
          type: 'order',
          link: '/orders',
        });
        if (io) {
          io.to(order.user._id.toString()).emit('notification', {
            title: notif.title,
            message: notif.message,
            type: 'order',
            link: '/orders',
          });
        }
      } catch (e) { console.error(e); }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
