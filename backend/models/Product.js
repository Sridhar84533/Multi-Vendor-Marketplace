const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: String, // e.g. "Color", "Size"
  options: [String],
});

const productSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    category: { type: String, required: true },
    subCategory: { type: String },
    brand: { type: String },
    images: [{ url: String, publicId: String }],
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    discountPercent: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String },
    variants: [variantSchema],
    tags: [String],
    weight: { type: Number },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    specifications: [{ key: String, value: String }],
    returnPolicy: { type: String, default: '7 days return policy' },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
