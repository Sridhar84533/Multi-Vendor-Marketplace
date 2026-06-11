const Coupon = require('../models/Coupon');

// @POST /api/coupons/validate
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, category } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon code not found or expired' });
    }

    if (new Date() > coupon.validUntil) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon limit reached' });
    }

    if (coupon.usedBy.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already used this coupon' });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of Rs. ${coupon.minOrderAmount} required for this coupon`,
      });
    }

    // Discount Calculation
    let discount = 0;
    if (coupon.type === 'flat') {
      discount = coupon.value;
    } else {
      discount = Math.round((orderAmount * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    res.json({
      valid: true,
      discount,
      code: coupon.code,
      message: 'Coupon applied successfully!',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/coupons
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
