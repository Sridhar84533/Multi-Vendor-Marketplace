import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { fetchNotifications, addLiveNotification } from '../../redux/notificationSlice';
import { ShoppingCart, Bell, LogOut } from 'lucide-react';
import SearchBar from '../SearchBar/SearchBar';
import Notifications from '../Notifications/Notifications';
import { io } from 'socket.io-client';

import logo from '../../assets/logo.png';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { unreadCount } = useSelector((state) => state.notification);
  const [showNotifications, setShowNotifications] = useState(false);
  const socketRef = useRef(null);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isVendor = user?.role === 'vendor';
  const isAdmin = user?.role === 'admin';

  /* ── Fetch initial notifications when authenticated ── */
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  /* ── Socket.io: connect on login, disconnect on logout ── */
  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      // Disconnect any existing socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', user._id);
    });

    socket.on('notification', (data) => {
      dispatch(addLiveNotification({
        _id: data._id || Date.now().toString(),
        title: data.title,
        message: data.message,
        type: data.type || 'system',
        link: data.link || '',
        isRead: false,
        createdAt: data.createdAt || new Date().toISOString(),
      }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?._id, dispatch]);

  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <nav className={`navbar ${isVendor ? 'navbar-vendor' : ''}`}>
        <Link
          to={isVendor ? '#' : '/'}
          onClick={isVendor ? (e) => e.preventDefault() : undefined}
          className="navbar-logo"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.35rem', whiteSpace: 'nowrap', cursor: isVendor ? 'default' : 'pointer' }}
        >
          <img src={logo} alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
          Multi-Vendor Marketplace
        </Link>

        {/* Hide search bar for vendors & admins */}
        {!isVendor && !isAdmin && <SearchBar />}

        <div className="navbar-nav">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <span className="nav-line-1">Hello, {user?.name}</span>
                <span className="nav-line-2">Account &amp; Lists</span>
              </Link>

              {isVendor && (
                <>
                  <Link to="/seller" className="nav-link">
                    <span className="nav-line-1">Seller</span>
                    <span className="nav-line-2">Dashboard</span>
                  </Link>
                  <Link to="/seller/refurbished-orders" className="nav-link">
                    <span className="nav-line-1">Refurbish</span>
                    <span className="nav-line-2">Returns</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link to="/admin" className="nav-link">
                  <span className="nav-line-1">Admin</span>
                  <span className="nav-line-2">Dashboard</span>
                </Link>
              )}

              {/* Returns & Orders only for customers */}
              {!isVendor && !isAdmin && (
                <>
                  <Link to="/orders" className="nav-link">
                    <span className="nav-line-1">Returns</span>
                    <span className="nav-line-2">&amp; Orders</span>
                  </Link>
                </>
              )}

              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <div
                  className="nav-link bell-toggle-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <span className="nav-line-1">Alerts</span>
                  <span className="nav-line-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ position: 'relative', display: 'inline-flex' }}>
                      <Bell size={16} />
                      {unreadCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-7px',
                          right: '-9px',
                          background: '#EF4444',
                          color: '#fff',
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          minWidth: '16px',
                          height: '16px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 3px',
                          lineHeight: 1,
                          border: '1.5px solid #131921',
                        }}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </span>
                    &nbsp;Notifications
                  </span>
                </div>
                {showNotifications && (
                  <Notifications
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              {/* Cart — customers only */}
              {!isVendor && !isAdmin && (
                <Link to="/cart" className="nav-link cart-icon-container">
                  <ShoppingCart size={22} />
                  <span className="cart-badge">{cartCount}</span>
                  <span className="nav-line-2" style={{ marginLeft: '4px' }}>Cart</span>
                </Link>
              )}

              <div className="nav-link" onClick={handleLogout}>
                <span className="nav-line-1">Sign Out</span>
                <span className="nav-line-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <LogOut size={16} /> Logout
                </span>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <span className="nav-line-1">Hello, sign in</span>
                <span className="nav-line-2">Account &amp; Lists</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
