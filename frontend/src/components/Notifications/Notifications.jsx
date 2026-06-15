import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markAsRead, markAllRead } from '../../redux/notificationSlice';
import {
  X, Bell, ShoppingBag, Truck, RefreshCw, CreditCard, Info, CheckCheck,
} from 'lucide-react';

/* ── time-ago helper ── */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

/* ── icon by type ── */
const typeIcon = (type, isRead) => {
  const color = isRead ? '#9CA3AF' : 'var(--primary)';
  switch (type) {
    case 'shipping': return <Truck size={16} color={color} />;
    case 'payment': return <CreditCard size={16} color={color} />;
    case 'product': return <ShoppingBag size={16} color={color} />;
    case 'order': return <ShoppingBag size={16} color={color} />;
    default: return <Info size={16} color={color} />;
  }
};

/* ── type accent color ── */
const typeAccent = (type) => {
  switch (type) {
    case 'shipping': return '#3B82F6';
    case 'payment': return '#10B981';
    case 'order': return 'var(--primary)';
    default: return '#6B7280';
  }
};

const Notifications = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, unreadCount } = useSelector((state) => state.notification);
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [onClose]);

  const handleClick = (n) => {
    if (!n.isRead) dispatch(markAsRead(n._id));
    if (n.link) {
      onClose();
      navigate(n.link);
    }
  };

  const handleMarkAll = () => {
    dispatch(markAllRead());
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        backgroundColor: '#FFF',
        color: '#111',
        width: '360px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        borderRadius: '12px',
        zIndex: 1001,
        border: '1px solid #E5E7EB',
        maxHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.2rem 0.75rem',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={17} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '20px',
              lineHeight: 1.4,
            }}>
              {unreadCount} new
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              title="Mark all as read"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 6px',
                borderRadius: '4px',
              }}
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          <X size={16} style={{ cursor: 'pointer', color: '#6B7280' }} onClick={onClose} />
        </div>
      </div>

      {/* Body */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Bell size={36} color="#D1D5DB" style={{ marginBottom: '10px' }} />
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem', margin: 0 }}>No notifications yet</p>
          </div>
        ) : (
          list.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClick(n)}
              style={{
                padding: '0.85rem 1.2rem',
                borderBottom: '1px solid #F9FAFB',
                cursor: n.link ? 'pointer' : 'default',
                backgroundColor: n.isRead ? '#FFF' : '#F5F3FF',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                transition: 'background 0.15s',
                borderLeft: n.isRead ? '3px solid transparent' : `3px solid ${typeAccent(n.type)}`,
              }}
              onMouseEnter={(e) => { if (n.link) e.currentTarget.style.backgroundColor = n.isRead ? '#F9FAFB' : '#EDE9FE'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = n.isRead ? '#FFF' : '#F5F3FF'; }}
            >
              {/* Icon circle */}
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: n.isRead ? '#F3F4F6' : '#EDE9FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px',
              }}>
                {typeIcon(n.type, n.isRead)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.85rem', color: '#111', lineHeight: 1.3 }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '3px', lineHeight: 1.45 }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '5px' }}>
                  {timeAgo(n.createdAt)}
                </div>
              </div>

              {/* Unread dot */}
              {!n.isRead && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  flexShrink: 0,
                  marginTop: '6px',
                }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
