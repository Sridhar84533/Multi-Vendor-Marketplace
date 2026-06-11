const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @GET /api/vendor/profile
exports.getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/vendor/profile
exports.updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
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
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

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
      order.items.forEach((item) => {
        if (item.vendor.toString() === vendor._id.toString()) {
          vendorRevenue += item.price * item.quantity;
          itemsSold += item.quantity;
        }
      });
    });

    res.json({
      profile: vendor,
      analytics: {
        productsCount,
        ordersCount: totalOrdersCount,
        revenue: vendorRevenue,
        itemsSold,
      },
      recentOrders: orders.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/vendor/products
exports.getVendorProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const products = await Product.find({ vendor: vendor._id, isActive: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
