import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AlertTriangle, X } from 'lucide-react';

export default function SessionExpiredPopup() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [visible, setVisible] = useState(false);

  // Check if session has expired (meaning sessionExpired is set to true in localStorage and user is not authenticated)
  const checkStatus = () => {
    const expired = localStorage.getItem('sessionExpired') === 'true';
    if (expired && !isAuthenticated) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  useEffect(() => {
    // Check status on component mount or auth change
    checkStatus();

    // Re-check status when user returns to the web page/tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStatus();
      }
    };

    const handleFocus = () => {
      checkStatus();
    };

    // Listen to changes in other tabs (in case logout happened in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'sessionExpired') {
        checkStatus();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

  // If user successfully logs in, clear the expired flag and hide the popup
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.removeItem('sessionExpired');
      setVisible(false);
    }
  }, [isAuthenticated]);

  const handleDismiss = () => {
    localStorage.removeItem('sessionExpired');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10005,
      width: '90%',
      maxWidth: '460px',
      background: 'rgba(15, 23, 42, 0.75)', // sleek dark slate
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(239, 68, 68, 0.45)', // glowing red border
      borderRadius: '14px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), 0 0 16px rgba(239, 68, 68, 0.15)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      color: '#fff',
      animation: 'slideDownPopup 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* Icon Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(239, 68, 68, 0.15)',
        borderRadius: '10px',
        padding: '10px',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        boxShadow: 'inset 0 0 8px rgba(239, 68, 68, 0.2)',
      }}>
        <AlertTriangle size={22} color="#f87171" style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' }} />
      </div>

      {/* Text Area */}
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#fca5a5', letterSpacing: '0.01em' }}>
          Your session got expired
        </h4>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'rgba(243, 244, 246, 0.8)', lineHeight: 1.4 }}>
          You were automatically logged out due to inactivity. Please sign in again.
        </p>
      </div>

      {/* Close button */}
      <button 
        onClick={handleDismiss}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          cursor: 'pointer',
          padding: '6px',
          color: 'rgba(255, 255, 255, 0.5)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideDownPopup {
          from {
            transform: translate(-50%, -100px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
