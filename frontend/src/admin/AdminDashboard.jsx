import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import API from '../services/api';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div
    style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} color={color} />
      </div>
      <ArrowUpRight size={16} color="#9ca3af" />
    </div>
    <div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
      <div style={{ color: '#4b5563', fontSize: '0.82rem', marginTop: '4px' }}>{label}</div>
      {sub && <div style={{ color: color, fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{sub}</div>}
    </div>
  </div>
);

const statusColor = (status) => {
  const map = {
    'Order Placed': '#f59e0b',
    Packed: '#3b82f6',
    Shipped: '#8b5cf6',
    'Out For Delivery': '#06b6d4',
    Delivered: '#10b981',
    Cancelled: '#ef4444',
    Paid: '#10b981',
    Pending: '#f59e0b',
    Failed: '#ef4444',
  };
  return map[status] || '#94a3b8';
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/admin/dashboard');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
            Dashboard Overview
          </h1>
          <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
            Real-time metrics and platform insights
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            Loading dashboard data...
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              color: '#f87171',
              marginBottom: '2rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {data && (
          <>
            {/* Stats Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              <StatCard
                icon={Users}
                label="Total Users"
                value={data.analytics?.totalUsers?.toLocaleString() || 0}
                color="#6366f1"
                sub="Registered accounts"
              />
              <StatCard
                icon={Store}
                label="Total Vendors"
                value={data.analytics?.totalVendors?.toLocaleString() || 0}
                color="#8b5cf6"
                sub="Active sellers"
              />
              <StatCard
                icon={Package}
                label="Total Orders"
                value={data.analytics?.totalOrders?.toLocaleString() || 0}
                color="#06b6d4"
                sub="All time orders"
              />
              <StatCard
                icon={ShoppingBag}
                label="Total Products"
                value={data.analytics?.totalProducts?.toLocaleString() || 0}
                color="#10b981"
                sub="Live listings"
              />
              <StatCard
                icon={IndianRupee}
                label="Total Revenue"
                value={`₹${(data.analytics?.revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                color="#f59e0b"
                sub="From paid orders"
              />
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '1.5rem' }}>
              {/* Recent Orders */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#2563eb" /> Recent Orders
                </h2>
                {data.recentOrders?.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No orders yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          {['Order ID', 'Customer', 'Amount', 'Status'].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: '0.6rem 0.8rem',
                                textAlign: 'left',
                                color: '#4b5563',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentOrders?.map((order) => (
                          <tr
                            key={order._id}
                            style={{ borderBottom: '1px solid #f3f4f6' }}
                          >
                            <td style={{ padding: '0.75rem 0.8rem', color: '#4b5563', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                              #{order._id?.slice(-6)}
                            </td>
                            <td style={{ padding: '0.75rem 0.8rem', color: '#111827' }}>
                              {order.user?.name || 'Guest'}
                            </td>
                            <td style={{ padding: '0.75rem 0.8rem', color: '#d97706', fontWeight: 600 }}>
                              ₹{order.total?.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '0.75rem 0.8rem' }}>
                              <span
                                style={{
                                  padding: '2px 10px',
                                  borderRadius: '20px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  background: `${statusColor(order.status)}15`,
                                  color: statusColor(order.status),
                                  border: `1px solid ${statusColor(order.status)}30`,
                                }}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pending Vendors */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} color="#d97706" /> Pending Approvals
                </h2>
                {data.pendingVendors?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <CheckCircle size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>All vendors approved!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {data.pendingVendors?.map((vendor) => (
                      <div
                        key={vendor._id}
                        style={{
                          background: '#f9fafb',
                          border: '1px solid rgba(217,119,6,0.2)',
                          borderRadius: '10px',
                          padding: '0.75rem 1rem',
                        }}
                      >
                        <div style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 600 }}>
                          {vendor.user?.name}
                        </div>
                        <div style={{ color: '#4b5563', fontSize: '0.75rem' }}>{vendor.user?.email}</div>
                        <ApproveButton vendorId={vendor._id} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

const ApproveButton = ({ vendorId }) => {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await API.put(`/admin/vendors/${vendorId}/approve`);
      setDone(true);
    } catch {
      alert('Failed to approve vendor');
    } finally {
      setLoading(false);
    }
  };

  if (done) return <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>✓ Approved</span>;
  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      style={{
        marginTop: '0.5rem',
        padding: '3px 12px',
        background: 'rgba(16,185,129,0.15)',
        border: '1px solid rgba(16,185,129,0.4)',
        borderRadius: '6px',
        color: '#10b981',
        fontSize: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {loading ? 'Approving...' : 'Approve'}
    </button>
  );
};

export default AdminDashboard;
