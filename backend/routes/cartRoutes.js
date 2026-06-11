const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/CartController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .put(updateCartItem)
  .delete(clearCart);

router.delete('/:itemId', removeCartItem);

module.exports = router;
