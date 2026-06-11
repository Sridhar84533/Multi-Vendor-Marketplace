import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, markAsRead } from '../../redux/notificationSlice';
import { X, Bell } from 'lucide-react';

const Notifications = ({ onClose }) => {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.notification);
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

  const handleMarkRead = (id) => {
    dispatch(markAsRead(id));
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: '#FFF',
        color: '#000',
        width: '320px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderRadius: '4px',
        zIndex: 1001,
        border: '1px solid #DDD',
        maxHeight: '400px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '0.8rem 1rem',
          borderBottom: '1px solid #EEE',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem',
        }}
      >
        <span>Notifications</span>
        <X size={16} style={{ cursor: 'pointer' }} onClick={onClose} />
      </div>

      <div style={{ padding: '0.5rem' }}>
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#888', fontSize: '0.9rem' }}>
            No notifications yet
          </div>
        ) : (
          list.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkRead(n._id)}
              style={{
                padding: '0.8rem',
                borderBottom: '1px solid #F5F5F5',
                cursor: 'pointer',
                backgroundColor: n.isRead ? '#FFF' : '#F7FAFC',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <Bell size={16} color={n.isRead ? '#888' : 'var(--primary)'} style={{ marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.85rem' }}>{n.title}</span>
                <span style={{ fontSize: '0.8rem', color: '#555', marginTop: '2px' }}>{n.message}</span>
                <span style={{ fontSize: '0.7rem', color: '#999', marginTop: '4px' }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
