import React, { useState, useEffect } from 'react';
import { getRefurbishedProducts } from '../services/api';
import ProductCard from '../components/ProductCard/ProductCard';
import Loader from '../components/Loader/Loader';
import CompareBar from '../components/CompareBar/CompareBar';
import { ShieldCheck, Sparkles, AlertCircle, X } from 'lucide-react';

export default function Refurbished() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    const fetchRefurbished = async () => {
      try {
        const res = await getRefurbishedProducts();
        setProducts(res.data || []);
      } catch (err) {
        console.error('Error fetching refurbished products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRefurbished();
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

  if (loading) return <Loader />;

  /* ── Group products by category ── */
  const grouped = products.reduce((acc, p) => {
    const cat = p.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const groupEntries = Object.entries(grouped);

  /* ── Category accent colors (cycles) ── */
  const CATEGORY_PALETTES = [
    { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', bar: '#16a34a', icon: '📱' },
    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', bar: '#3b82f6', icon: '💻' },
    { bg: '#fdf4ff', border: '#e9d5ff', text: '#6b21a8', bar: '#a855f7', icon: '🎮' },
    { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', bar: '#f97316', icon: '⚙️' },
    { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', bar: '#ef4444', icon: '🏋️' },
    { bg: '#f0f9ff', border: '#bae6fd', text: '#075985', bar: '#0ea5e9', icon: '🏠' },
    { bg: '#fffbeb', border: '#fde68a', text: '#92400e', bar: '#f59e0b', icon: '🎾' },
    { bg: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6', bar: '#8b5cf6', icon: '📸' },
  ];

  const catColorMap = {};
  Object.keys(grouped).forEach((cat, i) => {
    catColorMap[cat] = CATEGORY_PALETTES[i % CATEGORY_PALETTES.length];
  });

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #115e59 50%, #134e4a 100%)',
        borderRadius: '20px',
        padding: '3rem 2rem',
        color: '#fff',
        marginBottom: '2.5rem',
        boxShadow: '0 10px 30px rgba(13,148,136,0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(20,184,166,0.15)', filter: 'blur(50px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', left: '5%',
          width: '250px', height: '250px', borderRadius: '50%',
          background: 'rgba(4,120,87,0.1)', filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '650px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', padding: '6px 14px', borderRadius: '30px', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Sparkles size={14} color="#2dd4bf" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Smart Choice, Premium Value</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: '1.2', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            Antigravity Certified Refurbished
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#ccfbf1', margin: '0 0 2rem' }}>
            Get verified, fully functional products returned by users at discounts of up to 60%.
            Every product goes through our professional multi-point diagnostics check and is fully certified by our quality team.
          </p>

          {/* Core Program Promises */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px', color: '#fff', flexShrink: 0 }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px', fontSize: '0.9rem', fontWeight: 700 }}>Rigorous QC Testing</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#99f6e4' }}>Tested display, battery, hardware, and cosmetics</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px', color: '#fff', flexShrink: 0 }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px', fontSize: '0.9rem', fontWeight: 700 }}>Unbeatable Discounts</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#99f6e4' }}>Major savings over brand new original retail price</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary heading */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>
        Refurbished Offers Available ({products.length})
      </h2>

      {products.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          backgroundColor: '#fff', border: '1px solid #e2e8f0',
          borderRadius: '16px', color: '#64748b',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}>
          <AlertCircle size={48} style={{ color: '#0d9488', margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#1e293b' }}>No Refurbished Products Currently Listed</h3>
          <p style={{ margin: 0, fontSize: '0.92rem' }}>
            Check back later! When customers return products, sellers test them and re-list them here immediately.
          </p>
        </div>
      ) : (
        /* ── Category-grouped sections ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {groupEntries.map(([catName, items]) => {
            const palette = catColorMap[catName];
            return (
              <div key={catName}>
                {/* Category Section Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: '1.25rem', padding: '14px 20px',
                  background: palette.bg, border: `1.5px solid ${palette.border}`,
                  borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{palette.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: palette.text, letterSpacing: '-0.01em' }}>
                      {catName}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: palette.text, opacity: 0.7 }}>
                      {items.length} certified refurbished item{items.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <span style={{
                    background: palette.bar, color: '#fff',
                    borderRadius: '20px', padding: '4px 14px',
                    fontSize: '0.82rem', fontWeight: 700,
                    boxShadow: `0 2px 8px ${palette.bar}55`,
                  }}>
                    {items.length} items
                  </span>
                </div>

                {/* Products grid */}
                <div className="product-grid">
                  {items.map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      onCompare={handleCompare}
                      isComparing={!!compareList.find((item) => item._id === p._id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compare Widget */}
      <CompareBar
        products={compareList}
        onRemove={(id) => setCompareList(compareList.filter((p) => p._id !== id))}
        onClear={() => setCompareList([])}
        onOpenCompareModal={() => setShowCompareModal(true)}
      />

      {/* Compare Modal */}
      {showCompareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}>
          <div style={{ backgroundColor: '#FFF', width: '90%', maxWidth: '1000px', borderRadius: '12px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Compare Products</h2>
              <X size={24} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowCompareModal(false)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareList.length}, 1fr)`, gap: '1.5rem' }}>
              {compareList.map((p) => (
                <div key={p._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#fff' }}>
                  <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} alt={p.title} style={{ width: '100%', height: '150px', objectFit: 'contain' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{p.title}</h3>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    <strong>Price:</strong> Rs. {p.price}
                  </div>
                  <div><strong>Category:</strong> {p.category}</div>
                  <div><strong>Rating:</strong> {p.rating} ⭐ ({p.numReviews} reviews)</div>
                  <div><strong>Brand:</strong> {p.brand}</div>
                  <div>
                    <strong>Condition:</strong> <span style={{ color: '#0d9488', fontWeight: 700 }}>{p.refurbishedCondition || 'Good'}</span>
                  </div>
                  {p.refurbishedNotes && (
                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                      <strong>Notes:</strong> {p.refurbishedNotes}
                    </div>
                  )}
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
}
