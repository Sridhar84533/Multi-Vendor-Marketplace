import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { ShoppingCart, User, Bell, MessageSquare, LogOut, ArrowLeftRight } from 'lucide-react';
import SearchBar from '../SearchBar/SearchBar';
import Notifications from '../Notifications/Notifications';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [showNotifications, setShowNotifications] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" style={{ fontSize: '1.35rem', whiteSpace: 'nowrap' }}>
        Multi-Vendor Marketplace
      </Link>

      <SearchBar />

      <div className="navbar-nav">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="nav-link">
              <span className="nav-line-1">Hello, {user?.name}</span>
              <span className="nav-line-2">Account & Lists</span>
            </Link>

            {user?.role === 'vendor' && (
              <Link to="/seller" className="nav-link">
                <span className="nav-line-1">Seller</span>
                <span className="nav-line-2">Dashboard</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link to="/admin" className="nav-link">
                <span className="nav-line-1">Admin</span>
                <span className="nav-line-2">Dashboard</span>
              </Link>
            )}

            <Link to="/orders" className="nav-link">
              <span className="nav-line-1">Returns</span>
              <span className="nav-line-2">& Orders</span>
            </Link>

            <div className="nav-link" style={{ position: 'relative' }} onClick={() => setShowNotifications(!showNotifications)}>
              <span className="nav-line-1">Alerts</span>
              <span className="nav-line-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bell size={16} /> Notifications
              </span>
              {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
            </div>

            <div className="nav-link" onClick={handleLogout}>
              <span className="nav-line-1">Sign Out</span>
              <span className="nav-line-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogOut size={16} /> Logout
              </span>
            </div>
          </>
        ) : (
          <Link to="/login" className="nav-link">
            <span className="nav-line-1">Hello, sign in</span>
            <span className="nav-line-2">Account & Lists</span>
          </Link>
        )}

        <Link to="/cart" className="nav-link cart-icon-container">
          <ShoppingCart size={22} />
          <span className="cart-badge">{cartCount}</span>
          <span className="nav-line-2" style={{ marginLeft: '4px' }}>Cart</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
