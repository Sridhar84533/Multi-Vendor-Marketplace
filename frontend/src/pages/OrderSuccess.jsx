import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API, { downloadInvoice } from '../services/api';
import Loader from '../components/Loader/Loader';
import { CheckCircle, Download, FileText, ArrowRight, ShoppingBag } from 'lucide-react';

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to load order info', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleDownload = async () => {
    try {
      const res = await downloadInvoice(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Invoice download failed. Try again.');
    }
  };

  if (loading) return <Loader />;
  if (!order) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 style={{ color: 'var(--danger)' }}>Order Not Found</h2>
        <Link to="/" style={{ color: '#0066c0', textDecoration: 'underline' }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '600px', padding: '2rem 1rem' }}>
      <div className="card" style={{ textAlign: 'center', border: '1px solid #DDD', padding: '3rem 2rem', borderRadius: '8px' }}>
        <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--success)' }}>Payment Successful!</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>
          Thank you for your purchase. Your order <strong>#{id.substring(id.length - 8).toUpperCase()}</strong> has been placed.
        </p>

        <div style={{ backgroundColor: '#F9F9F9', border: '1px solid #E7E7E7', borderRadius: '6px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.8rem' }}>Order Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            {/* Order Placed Timestamp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f7ff', border: '1px solid #bde0ff', borderRadius: '6px', padding: '8px 12px' }}>
              <span style={{ color: '#005A9E', fontWeight: 600 }}>📅 Order Placed</span>
              <span style={{ fontWeight: 700, color: '#005A9E' }}>{formatDateTime(order.createdAt)}</span>
            </div>

            {/* Estimated Delivery */}
            {order.estimatedDelivery && order.status !== 'Delivered' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '6px', padding: '8px 12px' }}>
                <span style={{ color: '#856404', fontWeight: 600 }}>🚚 Estimated Delivery</span>
                <span style={{ fontWeight: 700, color: '#856404' }}>{formatDate(order.estimatedDelivery)}</span>
              </div>
            )}

            {/* Actual Delivery */}
            {order.status === 'Delivered' && order.deliveredAt && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f5e9', border: '1px solid #66bb6a', borderRadius: '6px', padding: '8px 12px' }}>
                <span style={{ color: '#2e7d32', fontWeight: 600 }}>✅ Delivered On</span>
                <span style={{ fontWeight: 700, color: '#2e7d32' }}>{formatDateTime(order.deliveredAt)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
              <span style={{ fontWeight: 600 }}>{order.paymentMethod.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount Paid:</span>
              <span style={{ fontWeight: 700, color: '#B12704' }}>Rs. {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#E7F4F9', border: '1px solid #97D1E6', borderRadius: '6px', padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#005A70' }}>
          <FileText size={18} />
          <span>A copy of your order receipt has been sent to your email.</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={handleDownload} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 600 }}
          >
            <Download size={18} /> Download Receipt / Invoice
          </button>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              onClick={() => navigate('/orders')} 
              className="btn btn-outline" 
              style={{ flex: 1, padding: '0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
            >
              <ShoppingBag size={16} /> View Orders
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-outline" 
              style={{ flex: 1, padding: '0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
            >
              Continue Shopping <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
