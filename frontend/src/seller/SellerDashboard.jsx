import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../services/api';
import Loader from '../components/Loader/Loader';
import logo from '../assets/logo.png';
import LogoInfoModal from '../components/LogoInfoModal/LogoInfoModal';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  Send,
  MessageSquare,
  RotateCcw,
  TrendingUp,
  Box,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Helper: resolve the best image URL from an order item
───────────────────────────────────────────────────────────── */
const getItemImg = (item) =>
  item?.product?.images?.[0]?.url || item?.image || null;

/* ─────────────────────────────────────────────────────────────
   Return Request Card
───────────────────────────────────────────────────────────── */
const ReturnCard = ({ order, onAction, onReply }) => {
  const [reply, setReply] = useState(order.vendorReply || '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(!!order.vendorReply);

  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true);
    await onReply(order._id, reply);
    setSending(false);
    setSent(true);
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #FBBF24',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
          padding: '0.85rem 1.2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RotateCcw size={16} color="#B45309" />
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400E' }}>
            Return Request · Order #{order._id.slice(-8).toUpperCase()}
          </span>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#78350F' }}>
          Customer: <strong>{order.user?.name || 'Unknown'}</strong>
        </span>
      </div>

      <div style={{ padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Product items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {order.items.map((item, idx) => {
            const imgUrl = getItemImg(item);
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '0.7rem',
                  background: '#FAFAFA',
                  borderRadius: '8px',
                  border: '1px solid #EEE',
                }}
              >
                {/* Product image */}
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={item.title}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'contain',
                      borderRadius: '6px',
                      border: '1px solid #E5E7EB',
                      background: '#fff',
                      flexShrink: 0,
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '6px',
                      background: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Box size={22} color="#9CA3AF" />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0' }}>
                    Qty: {item.quantity} &nbsp;·&nbsp; Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Return reason */}
        {order.returnReason && (
          <div
            style={{
              background: '#FFF5F5',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
            }}
          >
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B91C1C', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customer's Return Reason
              {order.returnType && (
                <span style={{ marginLeft: '8px', background: order.returnType === 'replacement' ? '#DBEAFE' : '#D1FAE5', color: order.returnType === 'replacement' ? '#1D4ED8' : '#065F46', padding: '1px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                  {order.returnType === 'replacement' ? '🔄 Replacement' : '💰 Refund'}
                </span>
              )}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#374151', margin: 0 }}>{order.returnReason}</p>
          </div>
        )}

        {/* Vendor reply box */}
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
            <MessageSquare size={14} color="#6366F1" /> Your Reply to Customer
          </label>
          <textarea
            value={reply}
            onChange={(e) => { setReply(e.target.value); setSent(false); }}
            rows={3}
            placeholder="e.g. Thank you for reaching out. We have approved your return. Please ship the product to our address…"
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              border: '1.5px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              color: '#111',
              lineHeight: 1.5,
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSend}
              disabled={sending || !reply.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 1rem',
                background: sent ? '#059669' : '#6366F1',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                opacity: (sending || !reply.trim()) ? 0.6 : 1,
                transition: 'background 0.2s',
              }}
            >
              {sent ? <CheckCircle size={15} /> : <Send size={15} />}
              {sent ? 'Reply Sent ✓' : sending ? 'Sending…' : 'Send Reply'}
            </button>
            <button
              onClick={() => onAction(order._id, 'approve')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0.45rem 1rem',
                background: '#10B981', color: '#fff',
                border: 'none', borderRadius: '6px',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              <CheckCircle size={15} /> Approve {order.returnType === 'replacement' ? 'Replacement' : 'Refund'}
            </button>
            <button
              onClick={() => onAction(order._id, 'reject')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0.45rem 1rem',
                background: '#EF4444', color: '#fff',
                border: 'none', borderRadius: '6px',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              <XCircle size={15} /> Reject Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

/* ─────────────────────────────────────────────────────────────
   Main SellerDashboard
───────────────────────────────────────────────────────────── */
const SellerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid' | 'compact'

  const fetchData = async () => {
    try {
      const res = await API.get('/vendor/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status,
        message: `Order status updated to ${status}.`,
        location: 'Seller Hub',
      });
      fetchData();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleReturnAction = async (orderId, action) => {
    try {
      if (action === 'approve') {
        await API.put(`/orders/${orderId}/approve-return`);
        alert('Return approved. Customer has been notified.');
      } else if (action === 'reject') {
        const reason = window.prompt('Enter rejection reason (optional):');
        await API.put(`/orders/${orderId}/reject-return`, { reason: reason || '' });
        alert('Return rejected. Customer has been notified.');
      }
      fetchData();
    } catch (err) {
      alert('Action failed. Please try again.');
    }
  };

  const handleVendorReply = async (orderId, reply) => {
    try {
      await API.post(`/orders/${orderId}/vendor-reply`, { reply });
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  if (loading) return <Loader />;

  const returnRequests = data?.recentOrders?.filter((o) => o.status === 'Return Requested') || [];
  const activeOrders = data?.recentOrders?.filter((o) => o.status !== 'Return Requested') || [];

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
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>
          Dashboard Overview
        </h1>

        {/* ── Stats ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {[
            { label: 'Total Revenue', value: `₹${(data?.analytics?.revenue || 0).toFixed(2)}`, color: '#6366F1', icon: <IndianRupee size={20} /> },
            { label: 'Items Sold', value: data?.analytics?.itemsSold || 0, color: '#10B981', icon: <TrendingUp size={20} /> },
            { label: 'Products Listed', value: data?.analytics?.productsCount || 0, color: '#F59E0B', icon: <Package size={20} /> },
            { label: 'Total Orders', value: data?.analytics?.ordersCount || 0, color: '#3B82F6', icon: <ShoppingBag size={20} /> },
            { label: 'Pending Returns', value: returnRequests.length, color: '#EF4444', icon: <RotateCcw size={20} /> },
          ].map(({ label, value, color, icon }) => (
            <div
              key={label}
              style={{
                background: '#fff',
                borderRadius: '10px',
                padding: '1.1rem 1.25rem',
                boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
                borderLeft: `4px solid ${color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color, marginBottom: '6px' }}>
                {icon}
                <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>{value}</div>
            </div>
          ))}
        </div>


        {/* ── Return Requests Section ── */}
        {returnRequests.length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#92400E', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#F59E0B" />
              {returnRequests.length} Return/Replacement Request{returnRequests.length > 1 ? 's' : ''} Pending
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {returnRequests.map((order) => (
                <ReturnCard
                  key={order._id}
                  order={order}
                  onAction={handleReturnAction}
                  onReply={handleVendorReply}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Active Orders Table ── */}
        <section
          style={{
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Package size={18} color="#6366F1" /> Recent Orders
            </h2>
            
            {/* View Toggle Buttons */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: '#EEF2FF', padding: '4px', borderRadius: '10px' }}>
              <button
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '34px', height: '34px', borderRadius: '7px', border: 'none',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: viewMode === 'list' ? '#6366F1' : '#EEF2FF',
                }}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <IconList active={viewMode === 'list'} />
              </button>
              <button
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '34px', height: '34px', borderRadius: '7px', border: 'none',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: viewMode === 'grid' ? '#6366F1' : '#EEF2FF',
                }}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <IconGrid active={viewMode === 'grid'} />
              </button>
              <button
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '34px', height: '34px', borderRadius: '7px', border: 'none',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: viewMode === 'compact' ? '#6366F1' : '#EEF2FF',
                }}
                onClick={() => setViewMode('compact')}
                title="Compact View"
              >
                <IconCompact active={viewMode === 'compact'} />
              </button>
            </div>
          </div>

          {activeOrders.length === 0 ? (
            <div style={{ padding: '1.5rem', color: '#6B7280', fontSize: '0.9rem' }}>
              No orders placed for your products yet.
            </div>
          ) : (
            viewMode === 'list' ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB', textAlign: 'left' }}>
                      {['Order ID', 'Customer', 'Products', 'Amount', 'Payment', 'Status', 'Update'].map((h) => (
                        <th key={h} style={{ padding: '0.8rem 1rem', fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap', borderBottom: '1px solid #E5E7EB' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeOrders.map((order) => (
                      <tr key={order._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '0.85rem 1rem', color: '#6B7280', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>{order.user?.name || '—'}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {order.items.map((item, idx) => {
                              const imgUrl = getItemImg(item);
                              return imgUrl ? (
                                <img
                                  key={idx}
                                  src={imgUrl}
                                  alt={item.title}
                                  title={`${item.title} ×${item.quantity}`}
                                  style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #E5E7EB', background: '#fff' }}
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <span key={idx} style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.title}</span>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>₹{order.total?.toLocaleString()}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              color: order.paymentStatus === 'Paid' ? '#059669' : '#D97706',
                            }}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background:
                                order.status === 'Delivered' ? '#DCFCE7' :
                                order.status === 'Cancelled' ? '#FEE2E2' :
                                '#EEF2FF',
                              color:
                                order.status === 'Delivered' ? '#166534' :
                                order.status === 'Cancelled' ? '#991B1B' :
                                '#4338CA',
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Refunded' && (
                            <select
                              onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                              value={order.status}
                              style={{
                                padding: '0.3rem 0.5rem',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                background: '#fff',
                                cursor: 'pointer',
                              }}
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
            ) : viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', padding: '1.25rem' }}>
                {activeOrders.map((order) => (
                  <div
                    key={order._id}
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#6B7280' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background:
                            order.status === 'Delivered' ? '#DCFCE7' :
                            order.status === 'Cancelled' ? '#FEE2E2' :
                            '#EEF2FF',
                          color:
                            order.status === 'Delivered' ? '#166534' :
                            order.status === 'Cancelled' ? '#991B1B' :
                            '#4338CA',
                        }}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>Customer:</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>{order.user?.name || '—'}</span>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '6px' }}>Products:</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {order.items.map((item, idx) => {
                            const imgUrl = getItemImg(item);
                            return imgUrl ? (
                              <img
                                key={idx}
                                src={imgUrl}
                                alt={item.title}
                                title={`${item.title} ×${item.quantity}`}
                                style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#fff' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <span key={idx} style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.title}</span>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #F3F4F6' }}>
                        <div>
                          <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>Total:</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>₹{order.total?.toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>Payment:</div>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: order.paymentStatus === 'Paid' ? '#059669' : '#D97706' }}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Refunded' && (
                      <div style={{ padding: '0.75rem 1rem', background: '#FAFAFA', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 500 }}>Update Status:</span>
                        <select
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          value={order.status}
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: '1px solid #D1D5DB',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            background: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="Order Placed">Placed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out For Delivery">Out For Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.6rem', padding: '1rem' }}>
                {activeOrders.map((order) => (
                  <div
                    key={order._id}
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(99,102,241,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', color: '#6B7280' }}>
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background:
                            order.status === 'Delivered' ? '#DCFCE7' :
                            order.status === 'Cancelled' ? '#FEE2E2' :
                            '#EEF2FF',
                          color:
                            order.status === 'Delivered' ? '#166534' :
                            order.status === 'Cancelled' ? '#991B1B' :
                            '#4338CA',
                        }}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{order.user?.name || '—'}</span>
                      <span style={{ color: '#6366F1' }}>₹{order.total?.toLocaleString()}</span>
                    </div>

                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Refunded' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', borderTop: '1px solid #F3F4F6', paddingTop: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>Update:</span>
                        <select
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          value={order.status}
                          style={{
                            padding: '1px 3px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            background: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="Order Placed">Placed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out For Delivery">Out For Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </section>
      </main>
      <LogoInfoModal isOpen={showLogoModal} onClose={() => setShowLogoModal(false)} user={user} />
    </div>
  );
};

export default SellerDashboard;
