import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader/Loader';
import { LayoutDashboard, ShoppingBag, PlusCircle, IndianRupee, AlertTriangle, CheckCircle, XCircle, Package, TrendingUp } from 'lucide-react';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status,
        message: `Your package status has been updated to ${status}.`,
        location: 'Seller Sorting Hub',
      });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <Loader />;

  // Separate return requests from active orders
  const returnRequests = data?.recentOrders?.filter(o => o.status === 'Return Requested') || [];
  const activeOrders = data?.recentOrders?.filter(o => o.status !== 'Return Requested') || [];

  return (
    <div className="container dashboard-layout">
      {/* Sidebar */}
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

        {/* ── Return/Replacement Request Alert ── */}
        {returnRequests.length > 0 && (
          <div
            style={{
              backgroundColor: '#FFF5F5',
              border: '2px solid #CC0C39',
              borderRadius: '8px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <AlertTriangle size={22} color="#CC0C39" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#CC0C39' }}>
                Action Required — {returnRequests.length} Return/Replacement Request{returnRequests.length > 1 ? 's' : ''}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {returnRequests.map((order) => (
                <div
                  key={order._id}
                  style={{
                    backgroundColor: '#FFF',
                    border: '1px solid #F8C3BF',
                    borderRadius: '6px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#888', display: 'block' }}>ORDER #{order._id}</span>
                      <strong style={{ fontSize: '0.95rem' }}>
                        Customer: {order.user?.name || 'Unknown'} — Rs. {order.total}
                      </strong>
                      <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {order.items.map((item, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.8rem',
                              backgroundColor: '#F7ECEC',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '20px',
                              color: '#CC0C39',
                            }}
                          >
                            {item.title} ×{item.quantity}
                          </span>
                        ))}
                      </div>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginTop: '0.4rem' }}>
                        Return reason is stored in the order tracking history.
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <button
                        className="btn"
                        style={{ backgroundColor: '#28a745', color: '#FFF', padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => handleUpdateStatus(order._id, 'Return Approved')}
                      >
                        <CheckCircle size={15} /> Approve Return
                      </button>
                      <button
                        className="btn"
                        style={{ backgroundColor: '#CC0C39', color: '#FFF', padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => handleUpdateStatus(order._id, 'Cancelled')}
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Analytics Stats ── */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
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

        {/* ── Active Orders Table ── */}
        <section className="card" style={{ border: '1px solid #DDD' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} color="var(--primary)" /> Recent Orders
          </h2>
          {activeOrders.length === 0 ? (
            <p style={{ color: '#666', fontSize: '0.9rem' }}>No orders placed for your products yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #EEE', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem' }}>Order ID</th>
                    <th style={{ padding: '0.8rem' }}>Customer</th>
                    <th style={{ padding: '0.8rem' }}>Amount</th>
                    <th style={{ padding: '0.8rem' }}>Payment</th>
                    <th style={{ padding: '0.8rem' }}>Status</th>
                    <th style={{ padding: '0.8rem', textAlign: 'right' }}>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '0.8rem', fontSize: '0.78rem', color: '#555' }}>
                        ...{order._id.slice(-8)}
                      </td>
                      <td style={{ padding: '0.8rem' }}>{order.user?.name}</td>
                      <td style={{ padding: '0.8rem' }}>Rs. {order.total}</td>
                      <td style={{ padding: '0.8rem' }}>
                        <span style={{ color: order.paymentStatus === 'Paid' ? 'var(--success)' : 'orange', fontWeight: 600 }}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: order.status === 'Delivered' ? 'var(--success)' : order.status === 'Cancelled' ? 'var(--danger)' : 'var(--accent)',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Refunded' && (
                          <select
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            value={order.status}
                            style={{ padding: '0.3rem', border: '1px solid #DDD', borderRadius: '4px', fontSize: '0.85rem' }}
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
