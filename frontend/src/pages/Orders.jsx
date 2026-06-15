import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { downloadInvoice } from '../services/api';
import Loader from '../components/Loader/Loader';
import { FileText, RefreshCw, AlertCircle, Box, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

/* ── View toggle icons (inline SVG to avoid extra deps) ── */
const IconList = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="2" width="16" height="3" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="1" y="7.5" width="16" height="3" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="1" y="13" width="16" height="3" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
  </svg>
);
const IconGrid = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="7" height="7" rx="1.5" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="10" y="1" width="7" height="7" rx="1.5" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="1" y="10" width="7" height="7" rx="1.5" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="10" y="10" width="7" height="7" rx="1.5" fill={active ? '#fff' : 'var(--primary)'} />
  </svg>
);
const IconCompact = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="4" height="4" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="7" y="1" width="4" height="4" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="13" y="1" width="4" height="4" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="1" y="7" width="4" height="4" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="7" y="7" width="4" height="4" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="13" y="7" width="4" height="4" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="1" y="13" width="4" height="4" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="7" y="13" width="4" height="4" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
    <rect x="13" y="13" width="4" height="4" rx="1" fill={active ? '#fff' : 'var(--primary)'} />
  </svg>
);

/* Format date with time e.g. "15 Jun 2026, 01:33 PM" */
const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid' | 'compact'

  // Return request state
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnType, setReturnType] = useState('refund'); // 'refund' | 'replacement'

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleInvoiceDownload = async (orderId) => {
    try {
      const res = await downloadInvoice(orderId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Invoice download failed. Try again.');
    }
  };

  const handleReturnRequest = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) return;

    try {
      await API.post(`/orders/${returnOrderId}/return`, { reason: returnReason, returnType });
      setReturnOrderId(null);
      setReturnReason('');
      setReturnType('refund');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit return request.');
    }
  };

  if (loading) return <Loader />;

  const viewBtnStyle = (mode) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '6px',
    border: '1px solid #E5E7EB',
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: viewMode === mode ? 'var(--primary)' : '#FFF',
  });

  return (
    <div className="container" style={{ maxWidth: viewMode === 'grid' ? '1100px' : '900px', transition: 'max-width 0.2s' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 500, margin: 0 }}>Your Orders</h1>

        {/* View Toggle Buttons */}
        {orders.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
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
        )}
      </div>

      {orders.length === 0 ? (
        <div style={{ backgroundColor: '#FFF', padding: '3rem', borderRadius: '4px', textAlign: 'center', border: '1px solid #DDD' }}>
          <h3>You haven't placed any orders yet.</h3>
          <Link to="/products" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            <button className="btn btn-primary">Start shopping</button>
          </Link>
        </div>
      ) : (
        
        /* ── LIST VIEW ── */
        viewMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order) => (
              <div key={order._id} style={{ backgroundColor: '#FFF', border: '1px solid #DDD', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Card Header */}
                <div
                  style={{
                    backgroundColor: '#F6F6F6',
                    padding: '1rem',
                    borderBottom: '1px solid #DDD',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                      <span>ORDER PLACED</span>
                      <strong style={{ display: 'block', color: 'var(--text)', marginTop: '4px' }}>
                        {formatDateTime(order.createdAt)}
                      </strong>
                    </div>
                    {order.status === 'Delivered' && order.deliveredAt && (
                      <div>
                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>✅ DELIVERED ON</span>
                        <strong style={{ display: 'block', color: 'var(--success)', marginTop: '4px' }}>
                          {formatDateTime(order.deliveredAt)}
                        </strong>
                      </div>
                    )}
                    <div>
                      <span>TOTAL</span>
                      <strong style={{ display: 'block', color: 'var(--text)', marginTop: '4px' }}>
                        Rs. {order.total.toFixed(2)}
                      </strong>
                    </div>
                    <div>
                      <span>SHIP TO</span>
                      <strong style={{ display: 'block', color: 'var(--text)', marginTop: '4px' }}>
                        {order.shippingAddress?.name || 'Customer'}
                      </strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span>ORDER # {order._id}</span>
                    <div style={{ marginTop: '4px', display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleInvoiceDownload(order._id)}
                        style={{ border: 'none', background: 'none', color: '#007185', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={14} /> Invoice
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                 <div style={{ padding: '1.5rem' }}>
                   {/* Status badge */}
                   <div style={{ marginBottom: '1rem' }}>
                     <span style={{
                       display: 'inline-flex', alignItems: 'center', gap: '6px',
                       fontWeight: 700, fontSize: '0.9rem',
                       padding: '4px 12px', borderRadius: '20px',
                       backgroundColor:
                         order.status === 'Delivered' ? '#DCFCE7' :
                         order.status === 'Return Approved' ? '#D1FAE5' :
                         order.status === 'Return Requested' ? '#FEF3C7' :
                         order.status === 'Cancelled' ? '#FEE2E2' : '#EFF6FF',
                       color:
                         order.status === 'Delivered' ? '#166534' :
                         order.status === 'Return Approved' ? '#065F46' :
                         order.status === 'Return Requested' ? '#92400E' :
                         order.status === 'Cancelled' ? '#991B1B' : '#1D4ED8',
                     }}>
                       {order.status === 'Delivered' && <CheckCircle size={14} />}
                       {order.status === 'Return Approved' && <CheckCircle size={14} />}
                       {order.status === 'Return Requested' && <RefreshCw size={14} />}
                       {order.status === 'Cancelled' && <XCircle size={14} />}
                       {order.status}
                     </span>
                   </div>

                   {/* Vendor reply (if any) */}
                   {order.vendorReply && (
                     <div style={{
                       display: 'flex', gap: '10px', alignItems: 'flex-start',
                       padding: '0.85rem 1rem',
                       backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0',
                       borderRadius: '8px', marginBottom: '1rem',
                     }}>
                       <MessageSquare size={16} color='#059669' style={{ flexShrink: 0, marginTop: '2px' }} />
                       <div>
                         <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', display: 'block', marginBottom: '3px' }}>SELLER REPLY</span>
                         <span style={{ fontSize: '0.875rem', color: '#374151' }}>{order.vendorReply}</span>
                       </div>
                     </div>
                   )}

                   {/* Return type badge */}
                   {order.returnReason && (
                     <div style={{ fontSize: '0.82rem', color: '#92400E', background: '#FEF3C7', borderRadius: '6px', padding: '6px 10px', marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                       <RefreshCw size={13} />
                       <strong>{order.returnType === 'replacement' ? 'Replacement' : 'Refund'} Request:</strong>&nbsp;{order.returnReason}
                     </div>
                   )}

                   {order.items.map((item, idx) => {
                     const imgUrl = item.product?.images?.[0]?.url || item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
                     return (
                       <div key={idx} style={{ display: 'flex', gap: '1.5rem', marginBottom: idx < order.items.length - 1 ? '1.5rem' : 0 }}>
                         <img src={imgUrl} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                         <div style={{ flexGrow: 1 }}>
                           <Link to={`/products/${item.product}`} style={{ fontWeight: 600, color: '#007185' }}>
                             {item.title}
                           </Link>
                           <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                             Price: Rs. {item.price} | Qty: {item.quantity}
                           </span>
                           {order.status === 'Delivered' && (
                             <Link to={`/products/${item.product}`} style={{ display: 'inline-block', marginTop: '8px' }}>
                               <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                                 Write a product review
                               </button>
                             </Link>
                           )}
                         </div>
                       </div>
                     );
                   })}

                   <hr style={{ margin: '1.5rem 0', borderColor: '#EEE' }} />

                   <div style={{ display: 'flex', gap: '12px' }}>
                     <button className="btn btn-secondary" style={{ padding: '0.5rem 1.2rem' }} onClick={() => navigate(`/tracking/${order._id}`)}>Track Package</button>
                     {order.status === 'Delivered' && (
                       <button
                         className="btn btn-outline"
                         style={{ padding: '0.5rem 1.2rem', color: 'var(--danger)' }}
                         onClick={() => setReturnOrderId(order._id)}
                       >
                         <RefreshCw size={16} /> Return / Replace
                       </button>
                     )}
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )

        /* ── GRID VIEW ── */
        : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {orders.map((order) => (
              <div key={order._id} style={{
                backgroundColor: '#FFF', border: '1px solid #DDD', borderRadius: '8px', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.15s, box-shadow 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
              >
                <div>
                  {/* Header */}
                  <div style={{ backgroundColor: '#F6F6F6', padding: '0.8rem 1rem', borderBottom: '1px solid #DDD', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Order #{order._id.slice(-8).toUpperCase()}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>Rs. {order.total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span>📅 Placed: {formatDateTime(order.createdAt)}</span>
                        {order.status === 'Delivered' && order.deliveredAt && (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Delivered: {formatDateTime(order.deliveredAt)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleInvoiceDownload(order._id)}
                        style={{ border: 'none', background: 'none', color: '#007185', cursor: 'pointer', fontSize: '0.78rem', padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <FileText size={12} /> Invoice
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '1rem' }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                        backgroundColor: order.status === 'Delivered' ? '#DCFCE7' : '#FEF3C7',
                        color: order.status === 'Delivered' ? '#166534' : '#B45309'
                      }}>
                        {order.status}
                      </span>
                    </div>

                    {/* Product list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <img src={item.product?.images?.[0]?.url || item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                            alt={item.title} style={{ width: '38px', height: '38px', objectFit: 'contain', border: '1px solid #EEE', borderRadius: '4px' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.title}
                            </p>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} · Rs. {item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ padding: '1rem', borderTop: '1px solid #EEE', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }} onClick={() => navigate(`/tracking/${order._id}`)}>
                    Track Package
                  </button>
                  {order.status === 'Delivered' && (
                    <button className="btn btn-outline" style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setReturnOrderId(order._id)}>
                      Return
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )

        /* ── COMPACT VIEW ── */
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {orders.map((order) => (
              <div key={order._id} style={{
                backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '0.8rem 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
                transition: 'background-color 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFF'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: '280px' }}>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Ordered</span>
                    <strong style={{ fontSize: '0.83rem' }}>{formatDateTime(order.createdAt)}</strong>
                    {order.status === 'Delivered' && order.deliveredAt && (
                      <div style={{ marginTop: '2px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700 }}>✅ Delivered</span>
                        <strong style={{ display: 'block', fontSize: '0.83rem', color: 'var(--success)' }}>{formatDateTime(order.deliveredAt)}</strong>
                      </div>
                    )}
                  </div>
                  <div style={{ width: '100px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Order ID</span>
                    <strong style={{ fontSize: '0.83rem', fontFamily: 'monospace' }}>#{order._id.slice(-8).toUpperCase()}</strong>
                  </div>
                  <div style={{ width: '90px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Total</span>
                    <strong style={{ fontSize: '0.83rem', color: 'var(--text)' }}>Rs. {order.total.toFixed(2)}</strong>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Items</span>
                    <strong style={{ fontSize: '0.83rem', color: '#007185', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                      {order.items.map(item => item.title).join(', ')}
                    </strong>
                  </div>
                  <div style={{ width: '110px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                      backgroundColor: order.status === 'Delivered' ? '#DCFCE7' : '#FEF3C7',
                      color: order.status === 'Delivered' ? '#166534' : '#B45309'
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => navigate(`/tracking/${order._id}`)}>
                    Track
                  </button>
                  <button
                    onClick={() => handleInvoiceDownload(order._id)}
                    style={{ border: '1px solid #DDD', background: '#FFF', borderRadius: '4px', padding: '0.35rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Download Invoice"
                  >
                    <FileText size={15} color="#555" />
                  </button>
                  {order.status === 'Delivered' && (
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      onClick={() => setReturnOrderId(order._id)}
                    >
                      Return
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Return / Replacement Modal */}
      {returnOrderId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(2px)' }}>
          <form onSubmit={handleReturnRequest} style={{ backgroundColor: '#FFF', width: '90%', maxWidth: '480px', borderRadius: '12px', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={22} color="var(--danger)" /> Return / Replacement Request
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', marginBottom: '1.5rem' }}>
              Choose what you'd like and explain why.
            </p>

            {/* Return Type Toggle */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem' }}>
              {[{ value: 'refund', label: '💰 Refund', desc: 'Get your money back' }, { value: 'replacement', label: '🔄 Replacement', desc: 'Get a new product' }].map(opt => (
                <label
                  key={opt.value}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', gap: '3px',
                    padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer',
                    border: returnType === opt.value ? '2px solid var(--primary)' : '2px solid #E5E7EB',
                    backgroundColor: returnType === opt.value ? '#F5F3FF' : '#FAFAFA',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="returnType"
                    value={opt.value}
                    checked={returnType === opt.value}
                    onChange={() => setReturnType(opt.value)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: returnType === opt.value ? 'var(--primary)' : '#374151' }}>{opt.label}</span>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{opt.desc}</span>
                </label>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                required
                rows={4}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="form-control"
                placeholder="e.g. Defective, Wrong Size, Not as pictured…"
              ></textarea>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => { setReturnOrderId(null); setReturnReason(''); setReturnType('refund'); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--danger)', color: '#FFF' }}>
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Orders;
