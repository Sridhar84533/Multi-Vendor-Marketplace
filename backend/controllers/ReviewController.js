const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, orderId } = req.body;

    // Check if user has already reviewed the product
    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Verify purchase
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
        'items.product': productId,
        status: 'Delivered',
      });
      if (order) isVerifiedPurchase = true;
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: orderId,
      rating: Number(rating),
      title,
      comment,
      isVerifiedPurchase,
      isApproved: true,
    });

    // Recalculate Product rating
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: reviews.length,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/reviews/product/:productId
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/reviews/:id/helpful
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.helpful += 1;
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
