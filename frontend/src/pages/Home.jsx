import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard/ProductCard';
import CompareBar from '../components/CompareBar/CompareBar';
import Loader from '../components/Loader/Loader';
import { ShoppingBag, ChevronRight, Star, X, Tag, Zap, Truck, Gift, Percent, Award } from 'lucide-react';

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
          /* Responsive height: 220px on phone, up to 380px on desktop */
          height: 'clamp(200px, 35vw, 380px)',
          backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(19,25,33,0.85)), url("https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=60")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(1rem, 4vw, 3rem)',
          color: '#FFF',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <span style={{ backgroundColor: 'var(--primary)', color: '#000', padding: '0.3rem 0.7rem', alignSelf: 'flex-start', fontWeight: 700, borderRadius: '4px', marginBottom: '0.75rem', fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)' }}>
          FESTIVAL OF OFFERS
        </span>
        <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 3rem)', fontWeight: 800, textShadow: '2px 2px 4px rgba(0,0,0,0.5)', margin: 0 }}>Upgrade Your Lifestyle</h1>
        <p style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1.2rem)', marginTop: '0.5rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', opacity: 0.9 }}>Up to 70% off on premium category items. Free delivery included.</p>
        <Link to="/products" style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>
          <button className="btn btn-primary" style={{ padding: 'clamp(0.5rem, 2vw, 0.8rem) clamp(1rem, 4vw, 2rem)', fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}>Shop Now</button>
        </Link>
      </div>

      {/* Category boxes */}
      <div
        style={{
          display: 'grid',
          /* minmax(160px) instead of 280px — fits 2 cols on mobile */
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {['Electronics', 'Fashion', 'Mobiles', 'Home Appliances'].map((cat) => (
          <div key={cat} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
            <h3 style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)', fontWeight: 700, marginBottom: '0.75rem' }}>{cat}</h3>
            <img
              src={
                cat === 'Electronics'
                  ? 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop&q=60'
                  : cat === 'Fashion'
                  ? 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=60'
                  : cat === 'Mobiles'
                  ? 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=60'
                  : 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&auto=format&fit=crop&q=60'
              }
              alt={cat}
              loading="lazy"
              style={{ width: '100%', height: 'clamp(100px, 15vw, 180px)', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.75rem', display: 'block' }}
            />
            <Link to={`/products?category=${cat}`} style={{ marginTop: 'auto', color: '#007185', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
              See more <ChevronRight size={14} />
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
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.75rem', WebkitOverflowScrolling: 'touch' }}>
            {recommendedProducts.map((p) => (
              <div key={p._id} style={{ minWidth: '160px', width: '160px', border: '1px solid #EEE', borderRadius: '4px', padding: '0.75rem', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <Link to={`/products/${p._id}`}>
                  <img
                    src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60'}
                    alt={p.title}
                    loading="lazy"
                    style={{ width: '100%', height: '120px', objectFit: 'contain', display: 'block', backgroundColor: '#f9f9f9' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'; }}
                  />
                  <h4 style={{ fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.title}</h4>
                </Link>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.4rem' }}>Rs. {p.price}</span>
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

      {/* ── Scrolling Promo Ad Ticker ── */}
      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          animation: tickerScroll 28s linear infinite;
          width: max-content;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section style={{
        marginTop: '2rem',
        marginBottom: '2rem',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #131921 0%, #1a2a3a 100%)',
        borderRadius: '10px',
        padding: '0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem 0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Zap size={18} color="#FF9900" fill="#FF9900" />
          <span style={{ color: '#FF9900', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Today's Hot Deals</span>
          <span style={{ color: '#aaa', fontSize: '0.75rem', marginLeft: '8px' }}>· Hover to pause</span>
        </div>

        {/* Scrolling Track */}
        <div style={{ overflow: 'hidden', padding: '0.75rem 0 1rem' }}>
          <div className="ticker-track">
            {[
              { icon: <Percent size={15} />, label: 'Up to 70% OFF on Electronics', color: '#FF9900' },
              { icon: <Truck size={15} />, label: 'Free Delivery on orders above ₹499', color: '#10B981' },
              { icon: <Gift size={15} />, label: 'Buy 2 Get 1 FREE on Fashion', color: '#F472B6' },
              { icon: <Tag size={15} />, label: 'New Arrivals in Mobiles — Shop Now', color: '#60A5FA' },
              { icon: <Award size={15} />, label: 'Top Rated Products — Verified Sellers', color: '#FBBF24' },
              { icon: <Percent size={15} />, label: 'Weekend Sale: Extra 10% with code SAVE10', color: '#A78BFA' },
              { icon: <Truck size={15} />, label: 'Same-Day Delivery available in select cities', color: '#34D399' },
              { icon: <Gift size={15} />, label: 'Home Appliances up to 40% OFF', color: '#F87171' },
              { icon: <Tag size={15} />, label: 'Flash Sale: Ends at Midnight 🔥', color: '#FF9900' },
              { icon: <Award size={15} />, label: '2476 Loyalty Points? Redeem on your next order!', color: '#FBBF24' },
              // duplicate for seamless loop
              { icon: <Percent size={15} />, label: 'Up to 70% OFF on Electronics', color: '#FF9900' },
              { icon: <Truck size={15} />, label: 'Free Delivery on orders above ₹499', color: '#10B981' },
              { icon: <Gift size={15} />, label: 'Buy 2 Get 1 FREE on Fashion', color: '#F472B6' },
              { icon: <Tag size={15} />, label: 'New Arrivals in Mobiles — Shop Now', color: '#60A5FA' },
              { icon: <Award size={15} />, label: 'Top Rated Products — Verified Sellers', color: '#FBBF24' },
              { icon: <Percent size={15} />, label: 'Weekend Sale: Extra 10% with code SAVE10', color: '#A78BFA' },
              { icon: <Truck size={15} />, label: 'Same-Day Delivery available in select cities', color: '#34D399' },
              { icon: <Gift size={15} />, label: 'Home Appliances up to 40% OFF', color: '#F87171' },
              { icon: <Tag size={15} />, label: 'Flash Sale: Ends at Midnight 🔥', color: '#FF9900' },
              { icon: <Award size={15} />, label: '2476 Loyalty Points? Redeem on your next order!', color: '#FBBF24' },
            ].map((ad, i) => (
              <Link
                key={i}
                to="/products"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 1.5rem',
                  padding: '0.5rem 1.2rem',
                  background: 'rgba(255,255,255,0.07)',
                  border: `1px solid ${ad.color}44`,
                  borderRadius: '20px',
                  color: ad.color,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              >
                {ad.icon} {ad.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

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
