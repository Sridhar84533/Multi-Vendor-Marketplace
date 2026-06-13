import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Store,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/vendors', label: 'Vendors', icon: Store },
  { path: '/admin/orders', label: 'Orders', icon: Package },
  { path: '/admin/products', label: 'Products', icon: ShoppingBag },
];

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? '260px' : '72px',
          minHeight: '100vh',
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '1.5rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Shield size={18} color="#fff" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ color: '#111827', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                Admin Panel
              </div>
              <div style={{ color: '#4b5563', fontSize: '0.72rem' }}>Multi-Vendor Marketplace</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#4b5563',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  background: active
                    ? '#eff6ff'
                    : 'transparent',
                  border: active ? '1px solid #bfdbfe' : '1px solid transparent',
                  color: active ? '#2563eb' : '#4b5563',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#4b5563';
                  }
                }}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div
          style={{
            padding: '1rem 0.75rem',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.75rem',
              borderRadius: '10px',
              background: '#f3f4f6',
              marginBottom: '0.5rem',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.8rem',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            {sidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name}
                </div>
                <div style={{ color: '#2563eb', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Administrator</div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              background: 'none',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Topbar */}
        <header
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ color: '#4b5563', fontSize: '0.85rem' }}>
            <span style={{ color: '#2563eb', fontWeight: 500 }}>Admin</span>
            {location.pathname !== '/admin' && (
              <>
                <span style={{ margin: '0 6px' }}>/</span>
                <span style={{ color: '#111827', textTransform: 'capitalize', fontWeight: 500 }}>
                  {location.pathname.split('/').pop()}
                </span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '4px 12px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '20px',
                color: '#10b981',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              🟢 Live
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '2rem', color: '#111827' }}>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
