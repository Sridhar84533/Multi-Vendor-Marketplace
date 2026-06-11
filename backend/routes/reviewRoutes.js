const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  markHelpful,
} = require('../controllers/ReviewController');
const verifyToken = require('../middleware/verifyToken');

router.get('/product/:productId', getProductReviews);
router.post('/', verifyToken, createReview);
router.post('/:id/helpful', verifyToken, markHelpful);

module.exports = router;
