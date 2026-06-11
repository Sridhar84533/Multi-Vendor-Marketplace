const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
  toggleWishlist,
} = require('../controllers/AuthController');
const verifyToken = require('../middleware/verifyToken');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);
router.post('/address', verifyToken, addAddress);
router.delete('/address/:id', verifyToken, deleteAddress);
router.post('/wishlist/:productId', verifyToken, toggleWishlist);

module.exports = router;
