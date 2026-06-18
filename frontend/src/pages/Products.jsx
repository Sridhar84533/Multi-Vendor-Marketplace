import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard/ProductCard';
import Filters from '../components/Filters/Filters';
import Loader from '../components/Loader/Loader';
import CompareBar from '../components/CompareBar/CompareBar';
import { X } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter states derived directly from searchParams (single source of truth)
  const category = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand')
    ? searchParams.get('brand').split(',').map((b) => b.trim()).filter(Boolean)
    : [];
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  // Compare States
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = searchParams.get('search') || '';
        const categoryQuery = category ? `&category=${encodeURIComponent(category)}` : '';
        const brandQuery = selectedBrand.length > 0 ? `&brand=${encodeURIComponent(selectedBrand.join(','))}` : '';
        const priceQuery = `${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}`;
        const ratingQuery = rating ? `&rating=${rating}` : '';
        const sortQuery = sort ? `&sort=${sort}` : '';

        const res = await API.get(
          `/products?search=${encodeURIComponent(query)}${categoryQuery}${brandQuery}${priceQuery}${ratingQuery}${sortQuery}&page=${page}&limit=12`
        );
        
        setProducts(res.data.products || []);
        setCategories(res.data.categories || []);
        setBrands(res.data.brands || []);
        setTotalPages(res.data.pages || 1);
        setTotalProducts(res.data.total || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams, category, selectedBrand, minPrice, maxPrice, rating, sort, page]);

  const handleCategoryChange = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleBrandChange = (br) => {
    const params = new URLSearchParams(searchParams);
    let brands = params.get('brand')
      ? params.get('brand').split(',').map((b) => b.trim()).filter(Boolean)
      : [];
    const index = brands.indexOf(br);
    if (index > -1) {
      brands = brands.filter((item) => item !== br);
    } else {
      brands = [...brands, br];
    }
    if (brands.length > 0) {
      params.set('brand', brands.join(','));
    } else {
      params.delete('brand');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePriceChange = (type, val) => {
    const params = new URLSearchParams(searchParams);
    if (type === 'min') {
      if (val) params.set('minPrice', val);
      else params.delete('minPrice');
    }
    if (type === 'max') {
      if (val) params.set('maxPrice', val);
      else params.delete('maxPrice');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleRatingChange = (stars) => {
    const params = new URLSearchParams(searchParams);
    if (stars) {
      params.set('rating', String(stars));
    } else {
      params.delete('rating');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams);
    if (newSort && newSort !== 'newest') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  const handleClear = () => {
    setSearchParams({});
  };

  const handleCompare = (product) => {
    if (compareList.find((p) => p._id === product._id)) {
      setCompareList(compareList.filter((p) => p._id !== product._id));
    } else if (compareList.length < 4) {
      setCompareList([...compareList, product]);
    } else {
      alert('You can compare a maximum of 4 products.');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing 1-{products.length} of {totalProducts} results for{' '}
            <strong style={{ color: 'var(--text)' }}>"{searchParams.get('search') || 'All Products'}"</strong>
          </span>
        </div>
        <div>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', border: '1px solid #DDD', borderRadius: '4px', outline: 'none' }}
          >
            <option value="newest">Sort by: Newest Arrivals</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="rating">Avg. Customer Review</option>
            <option value="sold">Best Sellers</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Filters
          categories={categories}
          brands={brands}
          selectedCategory={category}
          selectedBrand={selectedBrand}
          minPrice={minPrice}
          maxPrice={maxPrice}
          selectedRating={rating ? Number(rating) : ''}
          onCategoryChange={handleCategoryChange}
          onBrandChange={handleBrandChange}
          onPriceChange={handlePriceChange}
          onRatingChange={handleRatingChange}
          onClear={handleClear}
        />

        <main style={{ flexGrow: 1 }}>
          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#FFF', border: '1px solid #DDD', borderRadius: '4px' }}>
              <h3>No results found.</h3>
              <p style={{ color: '#555', marginTop: '0.5rem' }}>Try checking your spelling or use more general terms.</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onCompare={handleCompare}
                    isComparing={!!compareList.find((item) => item._id === p._id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '2rem' }}>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(idx + 1)}
                      className={`btn ${page === idx + 1 ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.4rem 0.8rem' }}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <CompareBar
        products={compareList}
        onRemove={(id) => setCompareList(compareList.filter((p) => p._id !== id))}
        onClear={() => setCompareList([])}
        onOpenCompareModal={() => setShowCompareModal(true)}
      />

      {/* Compare Modal */}
      {showCompareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#FFF', width: '90%', maxWidth: '1000px', borderRadius: '8px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Compare Products</h2>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowCompareModal(false)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareList.length}, 1fr)`, gap: '1.5rem' }}>
              {compareList.map((p) => (
                <div key={p._id} style={{ border: '1px solid #DDD', borderRadius: '4px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} alt={p.title} style={{ width: '100%', height: '150px', objectFit: 'contain' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{p.title}</h3>
                  <div style={{ borderTop: '1px solid #EEE', paddingTop: '0.5rem' }}>
                    <strong>Price:</strong> Rs. {p.price}
                  </div>
                  <div>
                    <strong>Category:</strong> {p.category}
                  </div>
                  <div>
                    <strong>Rating:</strong> {p.rating} ⭐ ({p.numReviews} reviews)
                  </div>
                  <div>
                    <strong>Brand:</strong> {p.brand}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>
                    <strong>Description:</strong> {p.description?.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
