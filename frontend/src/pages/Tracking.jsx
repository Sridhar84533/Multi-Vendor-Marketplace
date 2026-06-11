import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import OrderTimeline from '../components/OrderTimeline/OrderTimeline';
import Loader from '../components/Loader/Loader';
import { Package, Truck, Compass } from 'lucide-react';

const Tracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return <div className="container"><h3>Order not found.</h3></div>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>Track Order #{order._id}</h1>

      <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid #DDD' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Delivery</span>
            <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--success)', marginTop: '4px' }}>
              {new Date(order.estimatedDelivery).toLocaleDateString()}
            </strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Carrier / Status</span>
            <strong style={{ display: 'block', fontSize: '1.2rem', marginTop: '4px' }}>
              {order.status}
            </strong>
          </div>
        </div>

        {/* Dynamic Horizontal Timeline */}
        <OrderTimeline currentStatus={order.status} />

        <hr style={{ margin: '2rem 0', borderColor: '#EEE' }} />

        {/* Tracking history log */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={18} /> Activity Log
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {order.trackingHistory?.slice().reverse().map((history, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: idx === 0 ? 'var(--primary)' : '#CCC' }}></div>
                {idx < order.trackingHistory.length - 1 && (
                  <div style={{ width: '2px', flexGrow: 1, backgroundColor: '#EEE', margin: '4px 0' }}></div>
                )}
              </div>
              <div style={{ paddingBottom: '10px' }}>
                <strong style={{ fontSize: '0.9rem', display: 'block' }}>{history.status}</strong>
                {history.location && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    Location: {history.location}
                  </span>
                )}
                <span style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginTop: '2px' }}>
                  {history.message}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#999', display: 'block', marginTop: '4px' }}>
                  {new Date(history.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tracking;
