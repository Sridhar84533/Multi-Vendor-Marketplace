import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../services/api';
import Loader from '../components/Loader/Loader';
import { IndianRupee, ShoppingBag, Heart, User, MapPin, Award, ArrowRight, Package } from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      try {
        const [ordersRes, userRes] = await Promise.all([
          API.get('/orders'),
          API.get('/auth/me')
        ]);
        setOrders(ordersRes.data || []);
        if (userRes.data?.wishlist) {
          setWishlist(userRes.data.wishlist);
        }
      } catch (err) {
        console.error('Failed to load user dashboard details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardDetails();
  }, []);

  if (loading) return <Loader />;

  const recentOrders = orders.slice(0, 3);
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  return (
    <div className="container" style={{ maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome & Loyalty Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #232f3e 0%, #131921 100%)', 
          color: '#ffffff', 
          padding: '2.5rem', 
          borderRadius: '8px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ color: '#ccc', fontSize: '0.95rem' }}>
            Manage your account settings, trace package deliveries, and review premium offers.
          </p>
        </div>

        <div 
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.08)', 
            border: '1px solid rgba(255,255,255,0.15)', 
            padding: '1.2rem 2rem', 
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Award color="var(--primary)" size={32} />
          <div>
            <span style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', textTransform: 'uppercase' }}>Loyalty Balance</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 700 }}>
              {user?.loyaltyPoints || 0} Points
            </strong>
          </div>
        </div>
      </div>

      {/* Account Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ border: '1px solid #DDD', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#FFF8E7', padding: '1rem', borderRadius: '50%' }}>
            <Package size={24} color="var(--primary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Active Shipments</span>
            <strong style={{ fontSize: '1.3rem' }}>{activeOrdersCount} Orders</strong>
          </div>
        </div>

        <div className="card" style={{ border: '1px solid #DDD', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#F0FDF4', padding: '1rem', borderRadius: '50%' }}>
            <ShoppingBag size={24} color="var(--success)" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Total Purchases</span>
            <strong style={{ fontSize: '1.3rem' }}>{orders.length} Placed</strong>
          </div>
        </div>

        <div className="card" style={{ border: '1px solid #DDD', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#FFF5F5', padding: '1rem', borderRadius: '50%' }}>
            <Heart size={24} color="#E03E3E" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Wishlist items</span>
            <strong style={{ fontSize: '1.3rem' }}>{wishlist.length} Saved</strong>
          </div>
        </div>
      </div>

      {/* Core Split Dashboard Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '2rem' }}>
        
        {/* Recent Orders Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Recent Purchases</h2>
            <Link to="/orders" style={{ color: '#007185', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              View all orders <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="card" style={{ border: '1px solid #DDD', textAlign: 'center', padding: '3rem 1.5rem' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't ordered any items recently.</p>
              <Link to="/products">
                <button className="btn btn-primary">Start Shopping</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentOrders.map((order) => (
                <div key={order._id} style={{ border: '1px solid #DDD', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#FFF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F6F6F6', padding: '0.75rem 1rem', fontSize: '0.85rem', borderBottom: '1px solid #DDD', color: 'var(--text-muted)' }}>
                    <div>
                      <span>ORDER PLACED: </span>
                      <strong style={{ color: '#111' }}>{new Date(order.createdAt).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span>TOTAL: </span>
                      <strong style={{ color: '#111' }}>Rs. {order.total.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span>STATUS: </span>
                      <strong className={`badge ${order.status === 'Delivered' ? 'success' : 'warning'}`}>{order.status}</strong>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.items.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#007185' }}>{item.title}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(x{item.quantity})</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} 
                      onClick={() => navigate(`/tracking/${order._id}`)}
                    >
                      Track Shipment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links & Account Management Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Quick Navigation</h2>
          
          <div className="card" style={{ border: '1px solid #DDD', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link 
              to="/profile" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                border: '1px solid #EEE', 
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7F9FA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <User size={20} color="var(--primary)" />
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>Profile Details</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name, email, and security info</span>
              </div>
            </Link>

            <Link 
              to="/profile" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                border: '1px solid #EEE', 
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7F9FA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MapPin size={20} color="var(--primary)" />
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>Your Addresses</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Add, delete, or set default delivery places</span>
              </div>
            </Link>

            <Link 
              to="/wishlist" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                border: '1px solid #EEE', 
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7F9FA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Heart size={20} color="#E03E3E" />
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>Wishlist Favorites</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Track product availability and discounts</span>
              </div>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default UserDashboard;
