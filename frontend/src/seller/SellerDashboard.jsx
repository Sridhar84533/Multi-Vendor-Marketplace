import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader/Loader';
import { LayoutDashboard, ShoppingBag, PlusCircle, IndianRupee, CreditCard, ChevronRight } from 'lucide-react';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await API.get('/vendor/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to load seller dashboard details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status,
        message: `Your package status has been updated to ${status}.`,
        location: 'Seller Sorting Hub',
      });
      // Refresh
      const res = await API.get('/vendor/dashboard');
      setData(res.data);
    } catch (err) {
      alert('Failed to update status');
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
          <li className="dashboard-menu-item active" onClick={() => navigate('/seller')}>
            <LayoutDashboard size={18} /> Dashboard
          </li>
          <li className="dashboard-menu-item" onClick={() => navigate('/seller/add-product')}>
            <PlusCircle size={18} /> Add Product
          </li>
          <li className="dashboard-menu-item" onClick={() => navigate('/seller/manage-products')}>
            <ShoppingBag size={18} /> Manage Inventory
          </li>
        </ul>
      </aside>

      <main>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>Dashboard Overview</h1>

        {/* Analytics Section */}
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeftColor: 'var(--primary)' }}>
            <span className="stat-title">Total Revenue</span>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center' }}>
              <IndianRupee size={24} /> {data?.analytics?.revenue?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--success)' }}>
            <span className="stat-title">Items Sold</span>
            <div className="stat-value">{data?.analytics?.itemsSold || 0}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
            <span className="stat-title">Total Products</span>
            <div className="stat-value">{data?.analytics?.productsCount || 0}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
            <span className="stat-title">Total Orders</span>
            <div className="stat-value">{data?.analytics?.ordersCount || 0}</div>
          </div>
        </div>

        {/* Orders List Section */}
        <section className="card" style={{ border: '1px solid #DDD' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Orders</h2>
          {data?.recentOrders?.length === 0 ? (
            <p style={{ color: '#666', fontSize: '0.9rem' }}>No orders placed for your products yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #EEE', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem' }}>Order ID</th>
                    <th style={{ padding: '0.8rem' }}>Customer</th>
                    <th style={{ padding: '0.8rem' }}>Total Amount</th>
                    <th style={{ padding: '0.8rem' }}>Payment Status</th>
                    <th style={{ padding: '0.8rem' }}>Order Status</th>
                    <th style={{ padding: '0.8rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentOrders?.map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '0.8rem' }}>{order._id}</td>
                      <td style={{ padding: '0.8rem' }}>{order.user?.name}</td>
                      <td style={{ padding: '0.8rem' }}>Rs. {order.total}</td>
                      <td style={{ padding: '0.8rem' }}>
                        <span style={{ color: order.paymentStatus === 'Paid' ? 'var(--success)' : 'orange', fontWeight: 600 }}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem' }}>
                        <span style={{ fontWeight: 600 }}>{order.status}</span>
                      </td>
                      <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <select
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            value={order.status}
                            style={{ padding: '0.3rem', border: '1px solid #DDD', borderRadius: '4px' }}
                          >
                            <option value="Order Placed">Placed</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out For Delivery">Out For Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SellerDashboard;
