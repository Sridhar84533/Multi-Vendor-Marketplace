const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAllUsers,
  toggleUserStatus,
  getAllVendors,
  approveVendor,
  getAllOrders,
  getAllProducts,
  deleteProduct,
} = require('../controllers/AdminController');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

router.use(verifyToken);
router.use(isAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleUserStatus);
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/approve', approveVendor);
router.get('/orders', getAllOrders);
router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProduct);

module.exports = router;
