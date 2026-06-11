import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Loader from '../components/Loader';
import { IndianRupee, Users, Award, ShoppingBag, ShieldAlert, Clock, Check } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveVendor = async (id) => {
    if (!confirm('Are you sure you want to approve this vendor registration?')) return;
    try {
      await API.put(`/admin/vendors/${id}/approve`);
      fetchDashboardData();
      alert('Vendor registration approved successfully. User role updated to vendor.');
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  if (loading) return <Loader />;

  const analytics = data?.analytics || {};
  const pendingVendors = data?.pendingVendors || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="page-container">
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Telemetry Overview</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time platform usage analytics and administrative actions.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <span className="stat-title">Platform Revenue</span>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <IndianRupee size={22} style={{ color: 'var(--text-muted)' }} />
            {analytics.revenue?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="stat-card success">
          <span className="stat-title">Total Registered Users</span>
          <div className="stat-value">{analytics.totalUsers || 0}</div>
        </div>
        <div className="stat-card warning">
          <span className="stat-title">Sellers / Vendors</span>
          <div className="stat-value">{analytics.totalVendors || 0}</div>
        </div>
        <div className="stat-card danger">
          <span className="stat-title">Total Orders</span>
          <div className="stat-value">{analytics.totalOrders || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        {/* Pending Approvals */}
        <section className="card">
          <h2 className="card-title">
            <ShieldAlert color="orange" size={20} />
            Pending Vendor Registrations
          </h2>
          
          {pendingVendors.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No vendors currently awaiting review.</p>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Owner</th>
                    <th>GSTIN</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingVendors.map((vendor) => (
                    <tr key={vendor._id}>
                      <td style={{ fontWeight: 600 }}>{vendor.businessName}</td>
                      <td>
                        <div>{vendor.user?.name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vendor.user?.email}</span>
                      </td>
                      <td><code>{vendor.gstNumber || 'N/A'}</code></td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleApproveVendor(vendor._id)} 
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          <Check size={14} /> Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section className="card">
          <h2 className="card-title">
            <Clock size={20} color="var(--primary)" />
            Recent Platform Orders
          </h2>

          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders placed yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentOrders.map((order) => (
                <div 
                  key={order._id} 
                  style={{ 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '6px', 
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: '#0066c0' }}>#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                    <span style={{ fontWeight: 700 }}>Rs. {order.total.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Customer: {order.user?.name || 'Guest'}</span>
                    <span className={`badge ${order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'warning'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
