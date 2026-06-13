import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { downloadInvoice } from '../services/api';
import Loader from '../components/Loader/Loader';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return request state
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState('');

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
      await API.post(`/orders/${returnOrderId}/return`, { reason: returnReason });
      setReturnOrderId(null);
      setReturnReason('');
      fetchOrders();
      alert('Return request has been submitted successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit return request.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>Your Orders</h1>

      {orders.length === 0 ? (
        <div style={{ backgroundColor: '#FFF', padding: '3rem', borderRadius: '4px', textAlign: 'center', border: '1px solid #DDD' }}>
          <h3>You haven't placed any orders yet.</h3>
          <Link to="/products" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            <button className="btn btn-primary">Start shopping</button>
          </Link>
        </div>
      ) : (
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
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <span>ORDER PLACED</span>
                    <strong style={{ display: 'block', color: 'var(--text)', marginTop: '4px' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </strong>
                  </div>
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: order.status === 'Delivered' ? 'var(--success)' : 'var(--text)' }}>
                  Status: {order.status}
                </h3>

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
                  <button className="btn btn-secondary" style={{ padding: '0.5rem 1.2rem' }} onClick={() => navigate(`/tracking/${order._id}`)}>
                    Track Package
                  </button>
                  {order.status === 'Delivered' && (
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 1.2rem', color: 'var(--danger)' }}
                      onClick={() => setReturnOrderId(order._id)}
                    >
                      <RefreshCw size={16} /> Return Items
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Return Request Modal */}
      {returnOrderId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <form onSubmit={handleReturnRequest} style={{ backgroundColor: '#FFF', width: '90%', maxWidth: '450px', borderRadius: '8px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle color="var(--danger)" /> Return Request
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1.2rem' }}>
              Please provide the reason why you wish to return these items.
            </p>
            <div className="form-group">
              <label className="form-label">Reason for Return</label>
              <textarea
                required
                rows={4}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="form-control"
                placeholder="e.g. Defective, Wrong Size, Not as pictured"
              ></textarea>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setReturnOrderId(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--danger)', color: '#FFF' }}>
                Submit Return Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Orders;
