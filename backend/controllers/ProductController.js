const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

const getOrCreateVendor = async (user) => {
  let vendor = await Vendor.findOne({ user: user._id });
  if (!vendor) {
    vendor = await Vendor.create({
      user: user._id,
      businessName: user.name + "'s Store",
      businessEmail: user.email,
      businessPhone: user.phone || '',
      isApproved: true,
    });
  }
  return vendor;
};

// @GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (brand) {
      query.brand = brand;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    let sortOption = { createdAt: -1 };
    if (sort) {
      if (sort === 'price-low-high') sortOption = { price: 1 };
      else if (sort === 'price-high-low') sortOption = { price: -1 };
      else if (sort === 'rating') sortOption = { rating: -1 };
      else if (sort === 'sold') sortOption = { totalSold: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('vendor', 'businessName logo');

    const total = await Product.countDocuments(query);

    // Get unique categories and brands for filters
    const categories = await Product.distinct('category', { isActive: true });
    const brands = await Product.distinct('brand', { isActive: true });

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      categories,
      brands,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor');
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const vendor = await getOrCreateVendor(req.user);
    if (!vendor.isApproved) return res.status(403).json({ message: 'Vendor not approved' });

    const {
      title,
      description,
      shortDescription,
      category,
      subCategory,
      brand,
      price,
      discountPrice,
      stock,
      sku,
      variants,
      tags,
      specifications,
    } = req.body;

    const discountPercent = discountPrice
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0;

    let images = [];
    if (req.files) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      images = req.files.map((file) => {
        if (file.buffer) {
          const url = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          return {
            url,
            publicId: file.originalname || 'image',
          };
        }
        const pathStr = file.path || '';
        const isLocal = !pathStr.startsWith('http');
        const url = isLocal 
          ? `${baseUrl}/${pathStr.replace(/\\/g, '/')}`
          : pathStr;
        return {
          url,
          publicId: file.filename || file.public_id,
        };
      });
    }

    const product = await Product.create({
      vendor: vendor._id,
      title,
      description,
      shortDescription,
      category,
      subCategory,
      brand,
      price,
      discountPrice,
      discountPercent,
      stock,
      sku,
      variants: variants ? JSON.parse(variants) : [],
      tags: tags ? JSON.parse(tags) : [],
      specifications: specifications ? JSON.parse(specifications) : [],
      images,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const vendor = await getOrCreateVendor(req.user);
    if (product.vendor.toString() !== vendor._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const {
      title,
      description,
      shortDescription,
      category,
      subCategory,
      brand,
      price,
      discountPrice,
      stock,
      sku,
      variants,
      tags,
      specifications,
      existingImages,
    } = req.body;

    if (price) product.price = price;
    if (discountPrice) {
      product.discountPrice = discountPrice;
      product.discountPercent = Math.round(((product.price - discountPrice) / product.price) * 100);
    }
    if (title) product.title = title;
    if (description) product.description = description;
    if (shortDescription) product.shortDescription = shortDescription;
    if (category) product.category = category;
    if (subCategory) product.subCategory = subCategory;
    if (brand) product.brand = brand;
    if (stock !== undefined) product.stock = stock;
    if (sku) product.sku = sku;
    if (variants) product.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    if (tags) product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (specifications) product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
    if (existingImages) {
      product.images = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
    }

    if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const newImages = req.files.map((file) => {
        if (file.buffer) {
          const url = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          return {
            url,
            publicId: file.originalname || 'image',
          };
        }
        const pathStr = file.path || '';
        const isLocal = !pathStr.startsWith('http');
        const url = isLocal 
          ? `${baseUrl}/${pathStr.replace(/\\/g, '/')}`
          : pathStr;
        return {
          url,
          publicId: file.filename || file.public_id,
        };
      });
      product.images = [...product.images, ...newImages];
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const vendor = await getOrCreateVendor(req.user);
    if (product.vendor.toString() !== vendor._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    product.isActive = false;
    await product.save();
    res.json({ message: 'Product deactivated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/products/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const { type, productId, category } = req.query;
    let products = [];

    if (type === 'recommended-for-you') {
      // General recommendations or user behavioral based (we grab some popular/featured ones)
      products = await Product.find({ isActive: true }).limit(6).sort({ rating: -1 });
    } else if (type === 'frequently-bought-together' && productId) {
      const baseProduct = await Product.findById(productId);
      if (baseProduct) {
        products = await Product.find({
          isActive: true,
          category: baseProduct.category,
          _id: { $ne: baseProduct._id },
        }).limit(3);
      }
    } else if (type === 'customers-also-bought' && productId) {
      const baseProduct = await Product.findById(productId);
      if (baseProduct) {
        products = await Product.find({
          isActive: true,
          _id: { $ne: baseProduct._id },
        }).limit(6).sort({ totalSold: -1 });
      }
    } else if (category) {
      products = await Product.find({ isActive: true, category }).limit(6);
    } else {
      products = await Product.find({ isActive: true, isFeatured: true }).limit(6);
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
