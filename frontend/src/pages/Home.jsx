import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard/ProductCard';
import CompareBar from '../components/CompareBar/CompareBar';
import Loader from '../components/Loader/Loader';
import { ShoppingBag, ChevronRight, Star } from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const featRes = await API.get('/products?limit=8');
        const recRes = await API.get('/products/recommendations?type=recommended-for-you');
        setFeaturedProducts(featRes.data.products || []);
        setRecommendedProducts(recRes.data || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleCompare = (product) => {
    if (compareList.find((p) => p._id === product._id)) {
      setCompareList(compareList.filter((p) => p._id !== product._id));
    } else if (compareList.length < 4) {
      setCompareList([...compareList, product]);
    } else {
      alert('You can compare a maximum of 4 products.');
    }
  };

  const removeCompare = (id) => {
    setCompareList(compareList.filter((p) => p._id !== id));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  if (loading) return <Loader />;

  return (
    <div className="container">
      {/* Banner Section */}
      <div
        style={{
          position: 'relative',
          height: '380px',
          backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(234,237,237,1)), url("https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem',
          color: '#FFF',
          marginBottom: '2rem',
        }}
      >
        <span style={{ backgroundColor: 'var(--primary)', color: '#000', padding: '0.4rem 0.8rem', alignSelf: 'flex-start', fontWeight: 700, borderRadius: '4px', marginBottom: '1rem' }}>
          FESTIVAL OF OFFERS
        </span>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Upgrade Your Lifestyle</h1>
        <p style={{ fontSize: '1.2rem', marginTop: '0.5rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Up to 70% off on premium category items. Free delivery included.</p>
        <Link to="/products" style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}>
          <button className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>Shop Now</button>
        </Link>
      </div>

      {/* Category boxes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginTop: '-80px',
          position: 'relative',
          zIndex: 5,
          marginBottom: '3rem',
        }}
      >
        {['Electronics', 'Fashion', 'Mobiles', 'Home Appliances'].map((cat) => (
          <div key={cat} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>{cat}</h3>
            <img
              src={
                cat === 'Electronics'
                  ? 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'
                  : cat === 'Fashion'
                  ? 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400'
                  : cat === 'Mobiles'
                  ? 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
                  : 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400'
              }
              alt={cat}
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }}
            />
            <Link to={`/products?category=${cat}`} style={{ marginTop: 'auto', color: '#007185', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              See more <ChevronRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      {/* Featured Products */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <ShoppingBag color="var(--primary)" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Featured Products</h2>
        </div>
        <div className="product-grid">
          {featuredProducts.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onCompare={handleCompare}
              isComparing={!!compareList.find((item) => item._id === p._id)}
            />
          ))}
        </div>
      </section>

      {/* Recommended For You Section */}
      {recommendedProducts.length > 0 && (
        <section style={{ marginBottom: '3rem', backgroundColor: '#FFF', padding: '1.5rem', borderRadius: '4px', border: '1px solid #DDD' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <Star color="var(--primary)" fill="var(--primary)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Recommended For You</h2>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {recommendedProducts.map((p) => (
              <div key={p._id} style={{ minWidth: '220px', width: '220px', border: '1px solid #EEE', borderRadius: '4px', padding: '0.8rem', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/products/${p._id}`}>
                  <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} alt={p.title} style={{ width: '100%', height: '140px', objectFit: 'contain' }} />
                  <h4 style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600, height: '2.5rem', overflow: 'hidden' }}>{p.title}</h4>
                </Link>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem' }}>Rs. {p.price}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Floating Compare Bar */}
      <CompareBar
        products={compareList}
        onRemove={removeCompare}
        onClear={clearCompare}
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

export default Home;
