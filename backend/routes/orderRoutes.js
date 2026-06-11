const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  downloadInvoice,
  requestReturn,
} = require('../controllers/OrderController');
const verifyToken = require('../middleware/verifyToken');
const isVendor = require('../middleware/isVendor');

router.use(verifyToken);

router.route('/')
  .post(createOrder)
  .get(getMyOrders);

router.get('/:id', getOrderById);
router.put('/:id/status', isVendor, updateOrderStatus);
router.get('/:id/invoice', downloadInvoice);
router.post('/:id/return', requestReturn);

module.exports = router;
