import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../services/api';
import Loader from '../components/Loader/Loader';
import { LayoutDashboard, ShoppingBag, PlusCircle, Edit, Trash2 } from 'lucide-react';
import logo from '../assets/logo.png';
import LogoInfoModal from '../components/LogoInfoModal/LogoInfoModal';

/* ── View toggle icons (inline SVG to avoid extra deps) ── */
const IconList = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="2" width="16" height="3" rx="1" fill={active ? '#fff' : '#6366F1'} />
    <rect x="1" y="7.5" width="16" height="3" rx="1" fill={active ? '#fff' : '#6366F1'} />
    <rect x="1" y="13" width="16" height="3" rx="1" fill={active ? '#fff' : '#6366F1'} />
  </svg>
);
const IconGrid = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="7" height="7" rx="1.5" fill={active ? '#fff' : '#6366F1'} />
    <rect x="10" y="1" width="7" height="7" rx="1.5" fill={active ? '#fff' : '#6366F1'} />
    <rect x="1" y="10" width="7" height="7" rx="1.5" fill={active ? '#fff' : '#6366F1'} />
    <rect x="10" y="10" width="7" height="7" rx="1.5" fill={active ? '#fff' : '#6366F1'} />
  </svg>
);
const IconCompact = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="4" height="4" rx="1" fill={active ? '#fff' : '#6366F1'} />
    <rect x="7" y="1" width="4" height="4" rx="1" fill={active ? '#fff' : '#6366F1'} />
    <rect x="13" y="1" width="4" height="4" rx="1" fill={active ? '#fff' : '#6366F1'} />
    <rect x="1" y="7" width="4" height="4" rx="1" fill={active ? '#fff' : '#6366F1'} />
    <rect x="7" y="7" width="4" height="4" rx="1" fill={active ? '#fff' : '#6366F1'} />
    <rect x="13" y="7" width="4" height="4" rx="1" fill={active ? '#fff' : '#6366F1'} />
    <rect x="1" y="13" width="4" height="4" rx="1" fill={active ? '#fff' : '#6366F1'} />
    <rect x="7" y="13" width="4" height="4" rx="1" fill={active ? '#fff' : '#6366F1'} />
    <rect x="13" y="13" width="4" height="4" rx="1" fill={active ? '#fff' : '#6366F1'} />
  </svg>
);

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid' | 'compact'
  const [showLogoModal, setShowLogoModal] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/vendor/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate/delete this product?')) {
      try {
        await API.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  if (loading) return <Loader />;

  const viewBtnStyle = (mode) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '34px', height: '34px', borderRadius: '7px', border: 'none',
    cursor: 'pointer', transition: 'all 0.15s',
    background: viewMode === mode ? '#6366F1' : '#EEF2FF',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: '220px', flexShrink: 0, background: '#1E1B4B', color: '#fff',
          padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}
      >
        <div 
          onClick={() => setShowLogoModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.75rem', marginBottom: '1.5rem', cursor: 'pointer' }}
        >
          <img src={logo} alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#C7D2FE' }}>Seller Central</span>
        </div>
        {[
          { icon: <LayoutDashboard size={17} />, label: 'Dashboard', path: '/seller' },
          { icon: <PlusCircle size={17} />, label: 'Add Product', path: '/seller/add-product' },
          { icon: <ShoppingBag size={17} />, label: 'Manage Inventory', path: '/seller/manage-products' },
        ].map(({ icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '0.7rem 0.85rem',
              background: window.location.pathname === path ? 'rgba(165,180,252,0.25)' : 'transparent',
              border: 'none', borderRadius: '8px', color: '#E0E7FF',
              fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'background 0.15s',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#F9FAFB' }}>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>

          {/* Header row with title + view toggles */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              Inventory Management
              <span style={{ marginLeft: '10px', fontSize: '0.95rem', fontWeight: 500, color: '#6B7280' }}>
                ({products.length} items)
              </span>
            </h1>

            {/* View Toggle Buttons */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: '#EEF2FF', padding: '4px', borderRadius: '10px' }}>
              <button
                style={viewBtnStyle('list')}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <IconList active={viewMode === 'list'} />
              </button>
              <button
                style={viewBtnStyle('grid')}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <IconGrid active={viewMode === 'grid'} />
              </button>
              <button
                style={viewBtnStyle('compact')}
                onClick={() => setViewMode('compact')}
                title="Compact View"
              >
                <IconCompact active={viewMode === 'compact'} />
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
              <ShoppingBag size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '1rem' }}>No products listed yet.</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
                onClick={() => navigate('/seller/add-product')}
              >
                Add Your First Product
              </button>
            </div>
          ) : (

            /* ── LIST VIEW ── */
            viewMode === 'list' ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB', textAlign: 'left' }}>
                      {['Image', 'Product Title', 'Price', 'Stock', 'Sold', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '0.8rem 1rem', fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.8rem 1rem' }}>
                          <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} alt="thumb"
                            style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#FAFAFA' }} />
                        </td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 600, color: '#111827', maxWidth: '260px' }}>
                          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</span>
                        </td>
                        <td style={{ padding: '0.8rem 1rem', color: '#374151', whiteSpace: 'nowrap' }}>
                          Rs. {p.discountPrice || p.price}
                          {p.discountPrice && <span style={{ marginLeft: '6px', textDecoration: 'line-through', color: '#9CA3AF', fontSize: '0.8rem' }}>Rs. {p.price}</span>}
                        </td>
                        <td style={{ padding: '0.8rem 1rem' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                            background: p.stock <= 5 ? '#FEE2E2' : '#DCFCE7',
                            color: p.stock <= 5 ? '#DC2626' : '#16A34A',
                          }}>{p.stock}</span>
                        </td>
                        <td style={{ padding: '0.8rem 1rem', color: '#374151' }}>{p.totalSold}</td>
                        <td style={{ padding: '0.8rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => navigate(`/seller/edit-product/${p._id}`)}
                              className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', color: '#6366F1', borderColor: '#6366F1' }} title="Edit">
                              <Edit size={15} />
                            </button>
                            <button onClick={() => handleDelete(p._id)}
                              className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', color: '#EF4444', borderColor: '#EF4444' }} title="Delete">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

            /* ── GRID VIEW ── */
            : viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {products.map((p) => (
                  <div key={p._id} style={{
                    border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden',
                    background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s, transform 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', padding: '0.75rem' }}>
                      <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} alt={p.title}
                        style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ padding: '0.85rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827', margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.4em' }}>
                        {p.title}
                      </p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6366F1', margin: '0 0 4px' }}>
                        Rs. {p.discountPrice || p.price}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6B7280', marginBottom: '10px' }}>
                        <span>Stock: <b style={{ color: p.stock <= 5 ? '#DC2626' : '#16A34A' }}>{p.stock}</b></span>
                        <span>Sold: <b>{p.totalSold}</b></span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => navigate(`/seller/edit-product/${p._id}`)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '0.4rem', background: '#EEF2FF', border: 'none', borderRadius: '6px', color: '#6366F1', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                          <Edit size={13} /> Edit
                        </button>
                        <button onClick={() => handleDelete(p._id)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '0.4rem', background: '#FEF2F2', border: 'none', borderRadius: '6px', color: '#EF4444', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )

            /* ── COMPACT VIEW ── */
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
                {products.map((p) => (
                  <div key={p._id} style={{
                    border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden',
                    background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer',
                    transition: 'box-shadow 0.15s, border-color 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(99,102,241,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                  >
                    <div style={{ background: '#F9FAFB', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem' }}>
                      <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} alt={p.title}
                        style={{ maxHeight: '64px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ padding: '0.5rem 0.6rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.75rem', color: '#111827', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6366F1', margin: '0 0 6px' }}>Rs. {p.discountPrice || p.price}</p>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => navigate(`/seller/edit-product/${p._id}`)}
                          style={{ flex: 1, padding: '3px 0', background: '#EEF2FF', border: 'none', borderRadius: '4px', color: '#6366F1', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Edit">
                          <Edit size={11} />
                        </button>
                        <button onClick={() => handleDelete(p._id)}
                          style={{ flex: 1, padding: '3px 0', background: '#FEF2F2', border: 'none', borderRadius: '4px', color: '#EF4444', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Delete">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
      <LogoInfoModal isOpen={showLogoModal} onClose={() => setShowLogoModal(false)} user={user} />
    </div>
  );
};

export default ManageProducts;
