const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Helper to get or create a vendor profile if the user has vendor/admin role
const getOrCreateVendor = async (user) => {
  let vendor = await Vendor.findOne({ user: user._id });
  if (!vendor) {
    vendor = await Vendor.create({
      user: user._id,
      businessName: user.name + "'s Store",
      businessEmail: user.email,
      businessPhone: user.phone || '',
      isApproved: true, // Auto approve manually promoted vendors/admins so they can use vendor dashboard immediately
    });
  }
  return vendor;
};

// @GET /api/vendor/profile
exports.getVendorProfile = async (req, res) => {
  try {
    const vendor = await getOrCreateVendor(req.user);
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/vendor/profile
exports.updateVendorProfile = async (req, res) => {
  try {
    let vendor = await getOrCreateVendor(req.user);
    vendor = await Vendor.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true }
    );
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/vendor/dashboard
exports.getVendorDashboard = async (req, res) => {
  try {
    const vendor = await getOrCreateVendor(req.user);

    const productsCount = await Product.countDocuments({ vendor: vendor._id });
    
    // Find orders containing vendor items
    const orders = await Order.find({ 'items.vendor': vendor._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const totalOrdersCount = orders.length;

    // Calculate revenue & items sold for this specific vendor
    let vendorRevenue = 0;
    let itemsSold = 0;
    orders.forEach((order) => {
      if (order.status === 'Cancelled' || order.status === 'Refunded' || order.paymentStatus === 'Refunded') {
        return; // Exclude these from revenue and sales
      }
      order.items.forEach((item) => {
        if (item.vendor.toString() === vendor._id.toString()) {
          vendorRevenue += item.price * item.quantity;
          itemsSold += item.quantity;
        }
      });
    });

    const returnOrders = orders.filter(o => o.status === 'Return Requested');
    const normalOrders = orders.filter(o => o.status !== 'Return Requested').slice(0, 5);

    res.json({
      profile: vendor,
      analytics: {
        productsCount,
        ordersCount: totalOrdersCount,
        revenue: vendorRevenue,
        itemsSold,
      },
      recentOrders: [...returnOrders, ...normalOrders],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/vendor/products
exports.getVendorProducts = async (req, res) => {
  try {
    const vendor = await getOrCreateVendor(req.user);

    const products = await Product.find({ vendor: vendor._id, isActive: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
