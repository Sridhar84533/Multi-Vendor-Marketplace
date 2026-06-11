const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations,
} = require('../controllers/ProductController');
const verifyToken = require('../middleware/verifyToken');
const isVendor = require('../middleware/isVendor');

router.get('/', getProducts);
router.get('/recommendations', getRecommendations);
router.get('/:id', getProductById);

router.post('/', verifyToken, isVendor, upload.array('images', 5), createProduct);
router.put('/:id', verifyToken, isVendor, upload.array('images', 5), updateProduct);
router.delete('/:id', verifyToken, isVendor, deleteProduct);

module.exports = router;
