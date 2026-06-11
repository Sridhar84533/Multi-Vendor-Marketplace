const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  createCoupon,
  getAllCoupons,
} = require('../controllers/CouponController');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

router.post('/validate', verifyToken, validateCoupon);
router.post('/', verifyToken, isAdmin, createCoupon);
router.get('/', verifyToken, getAllCoupons);

module.exports = router;
