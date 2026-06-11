const express = require('express');
const router = express.Router();
const {
  getVendorProfile,
  updateVendorProfile,
  getVendorDashboard,
  getVendorProducts,
} = require('../controllers/VendorController');
const verifyToken = require('../middleware/verifyToken');
const isVendor = require('../middleware/isVendor');

router.use(verifyToken);
router.use(isVendor);

router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);
router.get('/dashboard', getVendorDashboard);
router.get('/products', getVendorProducts);

module.exports = router;
