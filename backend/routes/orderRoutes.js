const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
  downloadInvoice,
  requestReturn,
  replyToReturn,
  approveReturn,
  rejectReturn,
  markAsRefurbished,
} = require('../controllers/OrderController');
const verifyToken = require('../middleware/verifyToken');
const isVendor = require('../middleware/isVendor');

router.use(verifyToken);

router.route('/')
  .post(createOrder)
  .get(getMyOrders);

router.get('/vendor', isVendor, getVendorOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', isVendor, updateOrderStatus);
router.get('/:id/invoice', downloadInvoice);
router.post('/:id/return', requestReturn);
router.post('/:id/vendor-reply', isVendor, replyToReturn);
router.put('/:id/approve-return', isVendor, approveReturn);
router.put('/:id/reject-return', isVendor, rejectReturn);
router.put('/:id/refurbish', isVendor, markAsRefurbished);

module.exports = router;
