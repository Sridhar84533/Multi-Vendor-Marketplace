import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import API from '../services/api';
import { Search, RefreshCw, Package } from 'lucide-react';

const STATUS_OPTIONS = ['Order Placed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Refunded', 'Cancelled'];

const statusColor = (status) => {
  const map = {
    'Order Placed': '#f59e0b',
    Packed: '#3b82f6',
    Shipped: '#8b5cf6',
    'Out For Delivery': '#06b6d4',
    Delivered: '#10b981',
    Refunded: '#f97316',
    Cancelled: '#ef4444',
  };
  return map[status] || '#94a3b8';
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/orders');
      setOrders(res.data);
      setFiltered(res.data);
    } catch {
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let list = orders;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) => o._id.toLowerCase().includes(q) || o.user?.name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter((o) => o.status === statusFilter);
    setFiltered(list);
  }, [search, statusFilter, orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
        message: `Order status updated to ${newStatus} by admin.`,
        location: 'Admin Panel',
      });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch {
      alert('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const totalRevenue = orders.filter((o) => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.total, 0);

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9' }}>Order Management</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {filtered.length} orders · ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} total revenue
            </p>
          </div>
          <button
            onClick={fetchOrders}
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

        {/* Status Summary Strip */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            const color = statusColor(s);
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: statusFilter === s ? `${color}30` : `${color}10`,
                  border: `1px solid ${color}${statusFilter === s ? '60' : '30'}`,
                  color: color,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s',
                }}
              >
                {s} <span style={{ background: `${color}30`, padding: '1px 6px', borderRadius: '10px' }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '0.6rem 1rem',
            marginBottom: '1.5rem',
            maxWidth: '400px',
          }}
        >
          <Search size={16} color="#475569" />
          <input
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: '0.88rem' }}
          />
        </div>

        {/* Orders Table */}
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
              <Package size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <div>Loading orders...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>No orders found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                    {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Update Status'].map((h) => (
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
                  {filtered.map((order) => (
                    <tr
                      key={order._id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.9rem 1rem', color: '#6366f1', fontFamily: 'monospace', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        #{order._id?.slice(-8)}
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#e2e8f0', whiteSpace: 'nowrap' }}>
                        {order.user?.name || 'Guest'}
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#94a3b8' }}>
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#f59e0b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        ₹{order.total?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: order.paymentStatus === 'Paid' ? '#10b98120' : '#f59e0b20',
                            color: order.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b',
                            border: `1px solid ${order.paymentStatus === 'Paid' ? '#10b98140' : '#f59e0b40'}`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: `${statusColor(order.status)}20`,
                            color: statusColor(order.status),
                            border: `1px solid ${statusColor(order.status)}40`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' ? (
                          <select
                            value={order.status}
                            disabled={updating === order._id}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            style={{
                              padding: '5px 8px',
                              background: '#0f172a',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '8px',
                              color: '#e2e8f0',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              opacity: updating === order._id ? 0.5 : 1,
                            }}
                          >
                            {STATUS_OPTIONS.filter((s) => s !== 'Cancelled').map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ color: '#475569', fontSize: '0.78rem' }}>
                            {order.status === 'Delivered' ? '✓ Done' : '✗ Cancelled'}
                          </span>
                        )}
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

export default AdminOrders;
