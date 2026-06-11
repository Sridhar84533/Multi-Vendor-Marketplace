const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @GET /api/admin/dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    const orders = await Order.find({ paymentStatus: 'Paid' });
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);

    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const pendingVendors = await Vendor.find({ isApproved: false })
      .populate('user', 'name email');

    res.json({
      analytics: {
        totalUsers,
        totalVendors,
        totalOrders,
        totalProducts,
        revenue,
      },
      recentOrders,
      pendingVendors,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/users/:id/block
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User status changed to ${user.isActive ? 'Active' : 'Blocked'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('user', 'name email isActive');
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/vendors/:id/approve
exports.approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    vendor.isApproved = true;
    await vendor.save();

    // Promote User role to vendor officially if not done
    await User.findByIdAndUpdate(vendor.user, { role: 'vendor' });

    res.json({ message: 'Vendor approved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
