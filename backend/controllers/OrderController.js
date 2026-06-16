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

// ─── Helper: persist + push a notification ───────────────────────────────────
const pushNotification = async (io, userId, { title, message, type = 'order', link = '' }) => {
  const notif = await Notification.create({ user: userId, title, message, type, link });
  if (io) {
    io.to(userId.toString()).emit('notification', {
      _id: notif._id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      link: notif.link,
      isRead: false,
      createdAt: notif.createdAt,
    });
  }
  return notif;
};

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
    const FREE_DELIVERY_THRESHOLD = 1000;
    const DELIVERY_CHARGE = 49;
    const calculatedShippingFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const calculatedTotal = subtotal + calculatedShippingFee - (discount || 0) - (loyaltyPointsUsed || 0);

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

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
      trackingHistory: [{ status: 'Order Placed', message: `Your order has been placed successfully on ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}.`, timestamp: new Date() }],
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

    // Earn loyalty points (1 point per Rs. 100 spent)
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

    // Respond immediately — fire-and-forget notifications + email/PDF
    res.status(201).json(order);

    setImmediate(async () => {
      try {
        const io = req.app.get('socketio');

        // 1. Notify the customer — order placed
        await pushNotification(io, req.user._id, {
          title: '🛍️ Order Placed Successfully!',
          message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been placed. Estimated delivery in 5 days.`,
          type: 'order',
          link: `/orders`,
        });

        // 2. Notify each unique vendor — new order received
        const vendorIds = [...new Set(items.map(i => i.vendor?.toString()).filter(Boolean))];
        for (const vendorId of vendorIds) {
          const vendor = await Vendor.findById(vendorId);
          if (!vendor) continue;
          const vendorItems = items.filter(i => i.vendor?.toString() === vendorId);
          const itemSummary = vendorItems.map(i => `${i.title} (x${i.quantity})`).join(', ');
          await pushNotification(io, vendor.user, {
            title: '🛒 New Order Received!',
            message: `A new order has been placed for: ${itemSummary}. Total: Rs. ${calculatedTotal.toFixed(2)}`,
            type: 'order',
            link: '/seller',
          });
        }

        // 3. Generate Invoice PDF and send email
        const invoiceDir = path.join(__dirname, '../uploads/invoices');
        if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });
        const invoicePath = path.join(invoiceDir, `invoice-${order._id}.pdf`);
        await generateInvoicePDF(order, invoicePath);
        await sendEmail({
          to: req.user.email,
          subject: `Order Invoice - INV-${order._id.toString().toUpperCase()}`,
          text: `Hello ${req.user.name},\n\nThank you for your order! Your order receipt is attached.\n\nTotal: Rs. ${order.total.toFixed(2)}\n\nThank you,\nMulti-Vendor Marketplace`,
          html: `<p>Hello ${req.user.name},</p><p>Thank you for your order! Your order receipt is attached.</p><p>Total: <strong>Rs. ${order.total.toFixed(2)}</strong></p><p>Thank you,<br/>Multi-Vendor Marketplace</p>`,
          attachments: [{ filename: `Invoice-${order._id}.pdf`, path: invoicePath }],
        });
        console.log(`✅ Invoice email sent for order ${order._id}`);
      } catch (err) {
        console.error('❌ Background tasks failed for order:', err);
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
      const deliveredAt = new Date();
      order.deliveredAt = deliveredAt;
      order.paymentStatus = 'Paid';
      order.trackingHistory[order.trackingHistory.length - 1].message =
        message || `Your order was delivered on ${deliveredAt.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}.`;
      order.trackingHistory[order.trackingHistory.length - 1].timestamp = deliveredAt;
    } else if (status === 'Refunded') {
      order.paymentStatus = 'Refunded';
      // Add amount to customer's wallet
      await User.findByIdAndUpdate(order.user, {
        $inc: { walletBalance: order.total }
      });
      order.trackingHistory[order.trackingHistory.length - 1].message =
        message || `Your order has been refunded. Rs. ${order.total.toFixed(2)} has been added to your wallet.`;
    }

    await order.save();

    // Persist + push notification to customer
    const io = req.app.get('socketio');
    const statusEmojis = {
      'Packed': '📦',
      'Shipped': '🚚',
      'Out For Delivery': '🛵',
      'Delivered': '✅',
      'Cancelled': '❌',
    };
    const emoji = statusEmojis[status] || '🔔';
    await pushNotification(io, order.user, {
      title: `${emoji} Order ${status}`,
      message: message || `Your order status has been updated to "${status}".`,
      type: status === 'Delivered' ? 'shipping' : 'order',
      link: `/orders`,
    });

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
    if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

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
    const { reason, returnType = 'refund' } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'Return Requested';
    order.returnReason = reason;
    order.returnType = returnType;
    order.trackingHistory.push({
      status: 'Return Requested',
      message: `Return requested (${returnType}). Reason: ${reason}`,
    });

    await order.save();
    res.json(order);

    // Notify each unique vendor (fire and forget)
    setImmediate(async () => {
      try {
        const io = req.app.get('socketio');
        const vendorIds = [...new Set(order.items.map(i => i.vendor?.toString()).filter(Boolean))];
        for (const vendorId of vendorIds) {
          const vendor = await Vendor.findById(vendorId);
          if (!vendor) continue;
          await pushNotification(io, vendor.user, {
            title: '↩️ Return/Replacement Requested',
            message: `Customer ${order.user?.name || 'A customer'} requested a ${returnType} for Order #${order._id.toString().slice(-6).toUpperCase()}. Reason: ${reason}`,
            type: 'order',
            link: '/seller',
          });
        }
      } catch (e) {
        console.error('Failed to notify vendor on return:', e);
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
        await pushNotification(io, order.user._id, {
          title: '💬 Seller Replied to Your Return Request',
          message: reply,
          type: 'order',
          link: '/orders',
        });
      } catch (e) {
        console.error('Failed to notify customer on vendor reply:', e);
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/orders/:id/approve-return
exports.approveReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isRefund = order.returnType === 'refund';
    const newStatus = isRefund ? 'Refunded' : 'Return Approved';

    order.status = newStatus;
    if (isRefund) {
      order.paymentStatus = 'Refunded';
      // Add amount to customer's wallet
      await User.findByIdAndUpdate(order.user._id, {
        $inc: { walletBalance: order.total }
      });
    }
    order.trackingHistory.push({
      status: newStatus,
      message: isRefund
        ? `Your return has been approved. A refund of Rs. ${order.total.toFixed(2)} has been added to your wallet.`
        : `Your replacement request has been approved. A replacement product will be shipped soon.`,
    });

    await order.save();
    res.json(order);

    // Notify customer (fire and forget)
    setImmediate(async () => {
      try {
        const io = req.app.get('socketio');
        await pushNotification(io, order.user._id, {
          title: isRefund ? '💰 Refund Approved!' : '🔄 Replacement Approved!',
          message: isRefund
            ? `Your refund of Rs. ${order.total.toFixed(2)} has been approved and will be credited within 5-7 business days.`
            : `Your replacement for Order #${order._id.toString().slice(-6).toUpperCase()} has been approved. Replacement will be shipped soon.`,
          type: 'payment',
          link: '/orders',
        });
      } catch (e) {
        console.error('Failed to notify customer on approve return:', e);
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/orders/:id/reject-return
exports.rejectReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'Delivered'; // revert to delivered
    order.vendorReply = reason || order.vendorReply;
    order.trackingHistory.push({
      status: 'Delivered',
      message: `Return request rejected. ${reason ? 'Reason: ' + reason : ''}`,
    });

    await order.save();
    res.json(order);

    // Notify customer (fire and forget)
    setImmediate(async () => {
      try {
        const io = req.app.get('socketio');
        await pushNotification(io, order.user._id, {
          title: '❌ Return Request Rejected',
          message: reason
            ? `Your return request was rejected. Reason: ${reason}`
            : `Your return request for Order #${order._id.toString().slice(-6).toUpperCase()} was rejected by the seller.`,
          type: 'order',
          link: '/orders',
        });
      } catch (e) {
        console.error('Failed to notify customer on reject return:', e);
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
