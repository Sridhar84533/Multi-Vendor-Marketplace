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
      walletAmountUsed,
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
    const calculatedTotal = subtotal + calculatedShippingFee - (discount || 0) - (loyaltyPointsUsed || 0) - (walletAmountUsed || 0);

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
      walletAmountUsed,
      total: calculatedTotal,
      couponCode,
      paymentMethod,
      paymentStatus: calculatedTotal === 0 ? 'Paid' : 'Pending',
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

    if (walletAmountUsed > 0) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: -walletAmountUsed } });
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

// @GET /api/orders/vendor
// Get all orders containing items from this vendor
exports.getVendorOrders = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(403).json({ message: 'Vendor profile not found' });

    const orders = await Order.find({ 'items.vendor': vendor._id })
      .populate('user', 'name email')
      .populate('items.product')
      .populate('refurbishedProductId')
      .sort({ createdAt: -1 });

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

// Helper function to generate QC Checklist dynamically based on product specifications & category
const generateQCChecklist = (product) => {
  const checklist = [];
  const specs = product.specifications || [];
  const category = (product.category || '').toLowerCase();
  const title = (product.title || '').toLowerCase();

  // 1. Check if it's an electronic device
  const isElectronic = 
    category.includes('electronic') || 
    category.includes('phone') || 
    category.includes('mobile') || 
    category.includes('laptop') || 
    category.includes('computer') || 
    category.includes('tablet') || 
    category.includes('camera') ||
    title.includes('phone') || 
    title.includes('laptop') || 
    title.includes('watch') || 
    title.includes('earphone') || 
    title.includes('headphone');

  // 2. Check if it's a racket / sports item
  const isRacket = title.includes('racket') || title.includes('bat') || category.includes('sport');

  // Let's add specification-specific checks first
  specs.forEach(spec => {
    const key = (spec.key || '').trim();
    const val = (spec.value || '').trim();
    if (!key || !val) return;

    if (key.toLowerCase().includes('battery') || key.toLowerCase().includes('capacity')) {
      checklist.push({ item: `Battery & Charging (${val})`, passed: false });
    } else if (key.toLowerCase().includes('screen') || key.toLowerCase().includes('display') || key.toLowerCase().includes('resolution')) {
      checklist.push({ item: `Display / Screen (${val})`, passed: false });
    } else if (key.toLowerCase().includes('camera') || key.toLowerCase().includes('sensor')) {
      checklist.push({ item: `Camera / Lens (${val})`, passed: false });
    } else if (key.toLowerCase().includes('material')) {
      checklist.push({ item: `Material & Structure (${val})`, passed: false });
    } else if (key.toLowerCase().includes('weight') || key.toLowerCase().includes('balance')) {
      checklist.push({ item: `Weight & Balance Verification (${val})`, passed: false });
    } else if (key.toLowerCase().includes('tension') || key.toLowerCase().includes('string')) {
      checklist.push({ item: `String / Wire Tension (${val})`, passed: false });
    } else if (key.toLowerCase().includes('grip') || key.toLowerCase().includes('handle')) {
      checklist.push({ item: `Handle & Grip Wrap (${val})`, passed: false });
    } else if (key.toLowerCase().includes('size') || key.toLowerCase().includes('dimension')) {
      checklist.push({ item: `Size / Dimensions Verification (${val})`, passed: false });
    } else {
      checklist.push({ item: `Verify ${key}: ${val}`, passed: false });
    }
  });

  const hasItem = (name) => checklist.some(c => c.item.toLowerCase().includes(name.toLowerCase()));

  // 3. Fallback / generic checks based on type if not already added
  if (isElectronic) {
    if (!hasItem('Display')) checklist.push({ item: 'Display / Screen Check', passed: false });
    if (!hasItem('Battery')) checklist.push({ item: 'Battery & Charging Diagnostics', passed: false });
    if (!hasItem('Camera')) checklist.push({ item: 'Camera (Front & Rear) Check', passed: false });
    if (!hasItem('Speaker') && !hasItem('Audio')) checklist.push({ item: 'Speakers & Microphone Check', passed: false });
    checklist.push({ item: 'All Buttons & Ports Operational', passed: false });
    checklist.push({ item: 'Software / OS Reset & Check', passed: false });
    checklist.push({ item: 'Physical Body / Frame Scratch Check', passed: false });
  } else if (isRacket) {
    if (!hasItem('Material')) checklist.push({ item: 'Frame Material structural integrity', passed: false });
    if (!hasItem('Tension')) checklist.push({ item: 'String Tension & alignment', passed: false });
    if (!hasItem('Grip')) checklist.push({ item: 'Grip Wrap & Handle check', passed: false });
    if (!hasItem('Weight')) checklist.push({ item: 'Weight & Balance alignment', passed: false });
    checklist.push({ item: 'Physical Body / Paint Scratches Check', passed: false });
  } else {
    // Generic product checks
    if (!hasItem('Material')) checklist.push({ item: 'Material structural check', passed: false });
    if (!hasItem('Size')) checklist.push({ item: 'Dimensions & Alignment check', passed: false });
    checklist.push({ item: 'Physical Body & Aesthetic integrity', passed: false });
  }

  // Always check accessories
  checklist.push({ item: 'Accessories Included Verification', passed: false });

  return checklist;
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

    // Automatically create a Refurbished listing awaiting cross-check/testing
    try {
      const sourceItem = order.items[0];
      if (sourceItem && sourceItem.product) {
        const sourceProduct = await Product.findById(sourceItem.product);
        if (sourceProduct) {
          const newProduct = await Product.create({
            vendor: sourceItem.vendor || sourceProduct.vendor,
            title: `[Refurbished] ${sourceProduct.title}`,
            description: sourceProduct.description,
            shortDescription: sourceProduct.shortDescription,
            category: sourceProduct.category,
            subCategory: sourceProduct.subCategory,
            brand: sourceProduct.brand,
            images: sourceProduct.images,
            price: sourceProduct.discountPrice || sourceProduct.price,
            discountPercent: 0,
            stock: sourceItem.quantity,
            sku: sourceProduct.sku ? `${sourceProduct.sku}-REFURB` : undefined,
            tags: [...(sourceProduct.tags || []), 'refurbished'],
            specifications: sourceProduct.specifications,
            returnPolicy: 'No return on refurbished products',
            isRefurbished: true,
            isActive: false, // Must be cross-checked / validated before being listed for sale
            refurbishedCondition: 'Good',
            refurbishedNotes: '',
            qcStatus: 'Pending',
            qcChecklist: generateQCChecklist(sourceProduct),
            sourceOrderId: order._id,
          });
          order.refurbishedProductId = newProduct._id;
        }
      }
    } catch (errCloning) {
      console.error('Failed to automatically create refurbished listing placeholder:', errCloning);
    }

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

// @PUT /api/orders/:id/refurbish
// Vendor marks a Return Approved order's product as refurbished and re-lists it
exports.markAsRefurbished = async (req, res) => {
  try {
    const { refurbishedDiscount, refurbishedCondition, refurbishedNotes, qcStatus, qcChecklist } = req.body;
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!['Return Approved', 'Refunded'].includes(order.status)) {
      return res.status(400).json({ message: 'Order must be in Return Approved or Refunded status to mark as refurbished' });
    }

    let refurbishedProduct = null;
    if (order.refurbishedProductId) {
      refurbishedProduct = await Product.findById(order.refurbishedProductId);
      if (refurbishedProduct && refurbishedProduct.isActive) {
        return res.status(400).json({ message: 'This return has already been processed and listed as a refurbished product' });
      }
    }

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(403).json({ message: 'Vendor profile not found' });

    const sourceItem = order.items[0];
    const sourceProduct = await Product.findById(sourceItem.product);
    if (!sourceProduct) return res.status(404).json({ message: 'Source product not found' });

    const originalPrice = sourceProduct.discountPrice || sourceProduct.price;
    const discountPct = Number(refurbishedDiscount) || 0;
    const refurbishedPrice = Math.round(originalPrice * (1 - discountPct / 100));

    if (!refurbishedProduct) {
      // Clone the original product as a new refurbished listing (Fallback/Legacy)
      refurbishedProduct = await Product.create({
        vendor: vendor._id,
        title: `[Refurbished] ${sourceProduct.title}`,
        description: sourceProduct.description,
        shortDescription: sourceProduct.shortDescription,
        category: sourceProduct.category,
        subCategory: sourceProduct.subCategory,
        brand: sourceProduct.brand,
        images: sourceProduct.images,
        price: originalPrice,
        discountPrice: refurbishedPrice < originalPrice ? refurbishedPrice : undefined,
        discountPercent: discountPct,
        stock: sourceItem.quantity,
        sku: sourceProduct.sku ? `${sourceProduct.sku}-REFURB` : undefined,
        tags: [...(sourceProduct.tags || []), 'refurbished'],
        specifications: sourceProduct.specifications,
        returnPolicy: 'No return on refurbished products',
        isRefurbished: true,
        refurbishedDiscount: discountPct,
        refurbishedCondition: refurbishedCondition || 'Good',
        refurbishedNotes: refurbishedNotes || '',
        qcStatus: qcStatus || 'Passed',
        qcChecklist: Array.isArray(qcChecklist) ? qcChecklist : [],
        sourceOrderId: order._id,
        isActive: qcStatus === 'Passed',
      });

      // Link the refurbished product back to the order
      order.refurbishedProductId = refurbishedProduct._id;
      await order.save();
    } else {
      // Update the automatically created placeholder
      refurbishedProduct.refurbishedDiscount = discountPct;
      refurbishedProduct.discountPercent = discountPct;
      refurbishedProduct.discountPrice = refurbishedPrice < originalPrice ? refurbishedPrice : undefined;
      refurbishedProduct.refurbishedCondition = refurbishedCondition || 'Good';
      refurbishedProduct.refurbishedNotes = refurbishedNotes || '';
      refurbishedProduct.qcStatus = qcStatus || 'Passed';
      refurbishedProduct.qcChecklist = Array.isArray(qcChecklist) ? qcChecklist : [];
      refurbishedProduct.isActive = qcStatus === 'Passed'; // List for sale only if QC passed

      await refurbishedProduct.save();
    }

    res.status(200).json({ message: 'Product listed as refurbished successfully', product: refurbishedProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

