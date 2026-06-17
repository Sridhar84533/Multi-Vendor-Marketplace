import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard/ProductCard';
import CompareBar from '../components/CompareBar/CompareBar';
import Loader from '../components/Loader/Loader';
import { ShoppingBag, ChevronRight, Star, X } from 'lucide-react';


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


      {/* ══════════════════════════════════════════════
          AMAZON-STYLE ADS SECTION
          ══════════════════════════════════════════════ */}

      {/* 1 ── Sponsored Products Row (like Amazon's "Sponsored" product carousel) */}
      {featuredProducts.length > 0 && (
        <section style={{ backgroundColor: '#FFF', border: '1px solid #DDD', borderRadius: '4px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Sponsored products related to items in your browsing history</h2>
            </div>
            <Link to="/products" style={{ color: '#007185', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>See all results →</Link>
          </div>
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {featuredProducts.slice(0, 8).map((p) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                style={{ textDecoration: 'none', color: 'inherit', minWidth: '160px', maxWidth: '180px', flex: '0 0 160px', padding: '0.75rem', borderRight: '1px solid #F0F0F0', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F7F7F7'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ position: 'relative', marginBottom: '0.6rem' }}>
                  <img
                    src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                    alt={p.title}
                    style={{ width: '100%', height: '150px', objectFit: 'contain', display: 'block', backgroundColor: '#FAFAFA' }}
                  />
                </div>
                <p style={{ fontSize: '0.82rem', margin: '0 0 4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.3', color: '#0F1111' }}>{p.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  {'★★★★☆'.split('').map((s, i) => <span key={i} style={{ color: '#F3A847', fontSize: '0.75rem' }}>{s}</span>)}
                  <span style={{ fontSize: '0.72rem', color: '#007185' }}>({p.numReviews || 0})</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#0F1111' }}>
                  <span style={{ fontSize: '0.65rem', verticalAlign: 'top', lineHeight: '1.8' }}>₹</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>{Math.floor(p.price)}</span>
                  <span style={{ fontSize: '0.65rem' }}>{String(p.price).includes('.') ? ('.' + String(p.price).split('.')[1]) : ''}</span>
                </div>
                {p.originalPrice && <div style={{ fontSize: '0.75rem', color: '#565959' }}>M.R.P.: <s>₹{p.originalPrice}</s></div>}
                <div style={{ fontSize: '0.7rem', color: '#007600', marginTop: '2px' }}>FREE Delivery</div>
                <div style={{ fontSize: '0.68rem', color: '#565959', marginTop: '4px', borderTop: '1px solid #EEE', paddingTop: '4px' }}>Sponsored</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 2 ── Auto-Scrolling Deal Banners (infinite non-stop carousel) */}
      <style>{`
        @keyframes adScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ad-scroll-track {
          display: flex;
          gap: 1rem;
          animation: adScroll 22s linear infinite;
          width: max-content;
        }
        .ad-scroll-track:hover {
          animation-play-state: paused;
        }
        .ad-card {
          flex-shrink: 0;
          width: 340px;
          min-height: 160px;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: stretch;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          text-decoration: none;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .ad-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
          animation-play-state: paused;
        }
      `}</style>

      <div style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div className="ad-scroll-track">
          {[
            { bg: 'linear-gradient(135deg, #0a3d62 0%, #1a5276 100%)', tag: '⚡ LIMITED TIME DEAL', title: 'Up to 70% OFF on Electronics', sub: 'Headphones, Laptops, Cameras & more', cta: 'Shop Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&auto=format&fit=crop&q=60', cat: 'Electronics', tagColor: '#FF9900' },
            { bg: 'linear-gradient(135deg, #5b0d91 0%, #7d3cad 100%)', tag: '🔥 BESTSELLER', title: 'Fashion Flash Sale', sub: 'Clothing, Shoes, Accessories & more', cta: 'Shop Fashion', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&auto=format&fit=crop&q=60', cat: 'Fashion', tagColor: '#F472B6' },
            { bg: 'linear-gradient(135deg, #014d2f 0%, #1e8449 100%)', tag: '🎁 SPECIAL OFFER', title: 'Home & Living Deals', sub: 'Furniture, Decor, Appliances & more', cta: 'Shop Home', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&auto=format&fit=crop&q=60', cat: 'Home Appliances', tagColor: '#34D399' },
            { bg: 'linear-gradient(135deg, #7b1e00 0%, #c0392b 100%)', tag: '📱 NEW ARRIVALS', title: 'Latest Mobiles & Gadgets', sub: 'Smartphones, Tablets, Wearables', cta: 'Shop Mobiles', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=60', cat: 'Mobiles', tagColor: '#FCA5A5' },
            { bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', tag: '💄 BEAUTY PICKS', title: 'Skincare & Beauty Deals', sub: 'Serums, Moisturizers, Makeup & more', cta: 'Shop Beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&auto=format&fit=crop&q=60', cat: 'Beauty', tagColor: '#F9A8D4' },
            { bg: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', tag: '🏋️ SPORTS ZONE', title: 'Sports & Fitness Gear', sub: 'Equipment, Apparel, Supplements', cta: 'Shop Sports', img: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=300&auto=format&fit=crop&q=60', cat: 'Sports', tagColor: '#6EE7B7' },
            // Duplicates for seamless infinite loop
            { bg: 'linear-gradient(135deg, #0a3d62 0%, #1a5276 100%)', tag: '⚡ LIMITED TIME DEAL', title: 'Up to 70% OFF on Electronics', sub: 'Headphones, Laptops, Cameras & more', cta: 'Shop Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&auto=format&fit=crop&q=60', cat: 'Electronics', tagColor: '#FF9900' },
            { bg: 'linear-gradient(135deg, #5b0d91 0%, #7d3cad 100%)', tag: '🔥 BESTSELLER', title: 'Fashion Flash Sale', sub: 'Clothing, Shoes, Accessories & more', cta: 'Shop Fashion', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&auto=format&fit=crop&q=60', cat: 'Fashion', tagColor: '#F472B6' },
            { bg: 'linear-gradient(135deg, #014d2f 0%, #1e8449 100%)', tag: '🎁 SPECIAL OFFER', title: 'Home & Living Deals', sub: 'Furniture, Decor, Appliances & more', cta: 'Shop Home', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&auto=format&fit=crop&q=60', cat: 'Home Appliances', tagColor: '#34D399' },
            { bg: 'linear-gradient(135deg, #7b1e00 0%, #c0392b 100%)', tag: '📱 NEW ARRIVALS', title: 'Latest Mobiles & Gadgets', sub: 'Smartphones, Tablets, Wearables', cta: 'Shop Mobiles', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=60', cat: 'Mobiles', tagColor: '#FCA5A5' },
            { bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', tag: '💄 BEAUTY PICKS', title: 'Skincare & Beauty Deals', sub: 'Serums, Moisturizers, Makeup & more', cta: 'Shop Beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&auto=format&fit=crop&q=60', cat: 'Beauty', tagColor: '#F9A8D4' },
            { bg: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', tag: '🏋️ SPORTS ZONE', title: 'Sports & Fitness Gear', sub: 'Equipment, Apparel, Supplements', cta: 'Shop Sports', img: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=300&auto=format&fit=crop&q=60', cat: 'Sports', tagColor: '#6EE7B7' },
          ].map((ad, i) => (
            <Link key={i} to={`/products?category=${ad.cat}`} className="ad-card" style={{ background: ad.bg }}>
              <div style={{ flex: 1, padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: ad.tagColor, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>{ad.tag}</span>
                <h3 style={{ color: '#FFF', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px', lineHeight: 1.2 }}>{ad.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', margin: '0 0 12px' }}>{ad.sub}</p>
                <span style={{ display: 'inline-block', backgroundColor: '#FF9900', color: '#111', fontSize: '0.78rem', fontWeight: 700, padding: '5px 14px', borderRadius: '3px', alignSelf: 'flex-start' }}>{ad.cta}</span>
              </div>
              <div style={{ width: '120px', flexShrink: 0, overflow: 'hidden' }}>
                <img src={ad.img} alt={ad.cat} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
              </div>
            </Link>
          ))}
        </div>
      </div>



      {/* 3 ── Amazon-style "Shop by Brand" wide banner */}
      <section style={{ backgroundColor: '#FFF', border: '1px solid #DDD', borderRadius: '4px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Deals in top categories</h2>
          <Link to="/products" style={{ color: '#007185', fontSize: '0.85rem' }}>See all deals →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '1px', backgroundColor: '#EEE', border: '1px solid #EEE', borderRadius: '4px', overflow: 'hidden' }}>
          {[
            { label: 'Electronics', discount: 'Up to 70% off', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&auto=format&fit=crop&q=60', cat: 'Electronics' },
            { label: 'Fashion', discount: 'Up to 60% off', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&auto=format&fit=crop&q=60', cat: 'Fashion' },
            { label: 'Mobiles', discount: 'Up to 40% off', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=60', cat: 'Mobiles' },
            { label: 'Home & Living', discount: 'Up to 50% off', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=200&auto=format&fit=crop&q=60', cat: 'Home Appliances' },
            { label: 'Beauty', discount: 'Up to 35% off', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=60', cat: 'Beauty' },
            { label: 'Sports', discount: 'Up to 45% off', img: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&auto=format&fit=crop&q=60', cat: 'Sports' },
          ].map((item, i) => (
            <Link key={i} to={`/products?category=${item.cat}`} style={{ textDecoration: 'none', background: '#FFF', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0.5rem', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F7F7F7'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFF'}
            >
              <img src={item.img} alt={item.label} style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem', color: '#0F1111', textAlign: 'center' }}>{item.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#CC0C39', fontWeight: 600, textAlign: 'center' }}>{item.discount}</p>
            </Link>
          ))}
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
