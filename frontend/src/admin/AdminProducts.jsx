import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import API from '../services/api';
import { Search, RefreshCw, Trash2, ShoppingBag } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/products');
      setProducts(res.data);
      setFiltered(res.data);
      const cats = [...new Set(res.data.map((p) => p.category).filter(Boolean))];
      setCategories(cats);
    } catch {
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let list = products;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.vendor?.shopName?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') list = list.filter((p) => p.category === categoryFilter);
    setFiltered(list);
  }, [search, categoryFilter, products]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    setDeleting(productId);
    try {
      await API.delete(`/admin/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      alert('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const outOfStock = products.filter((p) => (p.stock || 0) === 0).length;

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9' }}>Product Management</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {products.length} products · {totalStock} total stock · {outOfStock} out of stock
            </p>
          </div>
          <button
            onClick={fetchProducts}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.2rem',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '10px',
              color: '#a5b4fc',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              flex: 1,
              minWidth: '200px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '0.6rem 1rem',
            }}
          >
            <Search size={16} color="#475569" />
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: '0.88rem' }}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Products Table */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              <ShoppingBag size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <div>Loading products...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>No products found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                    {['Product', 'Category', 'Price', 'Stock', 'Vendor', 'Rating', 'Actions'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '0.9rem 1rem',
                          textAlign: 'left',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr
                      key={product._id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/40'}
                            alt={product.title}
                            style={{
                              width: '40px',
                              height: '40px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              background: '#0f172a',
                              flexShrink: 0,
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}
                          />
                          <div>
                            <div style={{ color: '#e2e8f0', fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.title}
                            </div>
                            <div style={{ color: '#475569', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                              #{product._id?.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            background: 'rgba(99,102,241,0.15)',
                            color: '#a5b4fc',
                            border: '1px solid rgba(99,102,241,0.25)',
                          }}
                        >
                          {product.category || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#f59e0b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        ₹{product.price?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                          style={{
                            color: (product.stock || 0) === 0 ? '#f87171' : (product.stock || 0) < 10 ? '#f59e0b' : '#10b981',
                            fontWeight: 600,
                          }}
                        >
                          {product.stock || 0}
                          {(product.stock || 0) === 0 && ' (Out)'}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                        {product.vendor?.shopName || 'N/A'}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#f59e0b' }}>★</span>
                          <span style={{ color: '#cbd5e1' }}>{product.rating?.toFixed(1) || '0.0'}</span>
                          <span style={{ color: '#475569', fontSize: '0.75rem' }}>({product.reviewsCount || 0})</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deleting === product._id}
                          title="Delete product"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#f87171',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            opacity: deleting === product._id ? 0.5 : 1,
                          }}
                        >
                          <Trash2 size={13} />
                          {deleting === product._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
