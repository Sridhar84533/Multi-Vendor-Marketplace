import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader/Loader';
import { LayoutDashboard, ShoppingBag, PlusCircle, Edit, Trash2 } from 'lucide-react';

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchProducts();
  }, []);

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          background: '#1E1B4B',
          color: '#fff',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.75rem', marginBottom: '1.5rem' }}>
          <ShoppingBag size={22} color="#A5B4FC" />
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
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '0.7rem 0.85rem',
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
          <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>Inventory Management</h1>

          {products.length === 0 ? (
            <p style={{ color: '#6B7280' }}>No products listed yet. Click 'Add Product' to list your first item.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', textAlign: 'left' }}>
                    {['Image', 'Product Title', 'Price', 'Stock', 'Sold Count', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '0.8rem 1rem', fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} alt="thumb" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #E5E7EB' }} />
                      </td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 600, color: '#111827' }}>{p.title}</td>
                      <td style={{ padding: '0.8rem 1rem', color: '#374151' }}>Rs. {p.price}</td>
                      <td style={{ padding: '0.8rem 1rem', color: '#374151' }}>{p.stock}</td>
                      <td style={{ padding: '0.8rem 1rem', color: '#374151' }}>{p.totalSold}</td>
                      <td style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => navigate(`/seller/edit-product/${p._id}`)}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem', color: '#007185' }}
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem', color: 'var(--danger)' }}
                          title="Deactivate Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageProducts;
