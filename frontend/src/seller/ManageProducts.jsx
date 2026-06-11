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
    <div className="container dashboard-layout">
      <aside className="dashboard-sidebar">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={20} /> Seller Central
        </h3>
        <ul className="dashboard-menu">
          <li className="dashboard-menu-item" onClick={() => navigate('/seller')}>
            <LayoutDashboard size={18} /> Dashboard
          </li>
          <li className="dashboard-menu-item" onClick={() => navigate('/seller/add-product')}>
            <PlusCircle size={18} /> Add Product
          </li>
          <li className="dashboard-menu-item active" onClick={() => navigate('/seller/manage-products')}>
            <ShoppingBag size={18} /> Manage Inventory
          </li>
        </ul>
      </aside>

      <main className="card" style={{ border: '1px solid #DDD' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>Inventory Management</h1>

        {products.length === 0 ? (
          <p>No products listed yet. Click 'Add Product' to list your first item.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #EEE', textAlign: 'left' }}>
                  <th style={{ padding: '0.8rem' }}>Image</th>
                  <th style={{ padding: '0.8rem' }}>Product Title</th>
                  <th style={{ padding: '0.8rem' }}>Price</th>
                  <th style={{ padding: '0.8rem' }}>Stock</th>
                  <th style={{ padding: '0.8rem' }}>Sold Count</th>
                  <th style={{ padding: '0.8rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #EEE' }}>
                    <td style={{ padding: '0.8rem' }}>
                      <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} alt="thumb" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    </td>
                    <td style={{ padding: '0.8rem', fontWeight: 600 }}>{p.title}</td>
                    <td style={{ padding: '0.8rem' }}>Rs. {p.price}</td>
                    <td style={{ padding: '0.8rem' }}>{p.stock}</td>
                    <td style={{ padding: '0.8rem' }}>{p.totalSold}</td>
                    <td style={{ padding: '0.8rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
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
      </main>
    </div>
  );
};

export default ManageProducts;
