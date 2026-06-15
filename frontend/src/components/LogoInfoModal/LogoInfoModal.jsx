import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize, X } from 'lucide-react';
import API from '../../services/api';
import logo from '../../assets/logo.png';

/* ─────────────────────────────────────────────────────────────
   Nested Zoom & Pan Lightbox Component
   ───────────────────────────────────────────────────────────── */
const LogoZoomLightbox = ({ isOpen, onClose, logoSrc }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    if (e.deltaY < 0) {
      setScale(prev => Math.min(prev + zoomFactor, 4));
    } else {
      setScale(prev => Math.max(prev - zoomFactor, 0.5));
    }
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale !== 1) {
      handleReset();
    } else {
      setScale(2);
    }
  };

  const renderLightboxContent = () => {
    const badgeStyle = {
      width: '240px',
      height: '240px',
      borderRadius: '24px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: isDragging ? 'none' : 'transform 0.1s ease-out',
      transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
      cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
      userSelect: 'none',
    };

    if (logoSrc === 'vendor-default') {
      return (
        <div
          style={{ ...badgeStyle, background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <svg viewBox="0 0 24 24" width="55%" height="55%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#E0E7FF' }}>
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="m3 9 2.44-4A2 2 0 0 1 7.18 4h9.64a2 2 0 0 1 1.74 1l2.44 4" />
            <path d="M12 9v12" />
            <path d="M9 9v12" />
            <path d="M15 9v12" />
          </svg>
        </div>
      );
    }

    if (logoSrc === 'customer-default') {
      return (
        <div
          style={{ ...badgeStyle, background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <svg viewBox="0 0 24 24" width="55%" height="55%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#CCFBF1' }}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      );
    }

    if (logoSrc === 'admin-default') {
      return (
        <div
          style={{ ...badgeStyle, background: 'linear-gradient(135deg, #E11D48 0%, #9F1239 100%)' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <svg viewBox="0 0 24 24" width="55%" height="55%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFE4E6' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <circle cx="12" cy="11" r="3" />
            <path d="m12 14 3.5 3.5" />
          </svg>
        </div>
      );
    }

    return (
      <img
        src={logoSrc}
        alt="User Logo"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{
          maxWidth: '85vw',
          maxHeight: '70vh',
          objectFit: 'contain',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          borderRadius: '12px',
          userSelect: 'none',
        }}
      />
    );
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(10, 10, 12, 0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 11000, backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
      onWheel={handleWheel}
      ref={containerRef}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Floating Toolbar */}
      <div
        style={{
          position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'rgba(30, 30, 40, 0.85)',
          padding: '8px 16px', borderRadius: '40px',
          display: 'flex', alignItems: 'center', gap: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 11002,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleZoomOut}
          style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <span style={{ color: '#A5B4FC', fontWeight: 600, fontSize: '0.85rem', minWidth: '42px', textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
        <button
          onClick={handleReset}
          style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          title="Reset Zoom"
        >
          <Maximize size={18} />
        </button>
        <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()}>
          {renderLightboxContent()}
        </div>
      </div>
      
      <div
        style={{
          position: 'absolute', bottom: '24px',
          color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem',
          pointerEvents: 'none', textAlign: 'center', width: '100%'
        }}
      >
        {scale > 1 ? 'Drag to pan around. Double click to reset.' : 'Scroll wheel or use controls to zoom. Double click to zoom.'}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main LogoInfoModal Component
   ───────────────────────────────────────────────────────────── */
const LogoInfoModal = ({ isOpen, onClose, user }) => {
  const [vendorProfile, setVendorProfile] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (isOpen && user?.role === 'vendor') {
      const fetchVendorProfile = async () => {
        try {
          const res = await API.get('/vendor/profile');
          setVendorProfile(res.data);
        } catch (err) {
          console.error('Failed to fetch vendor profile for logo', err);
        }
      };
      fetchVendorProfile();
    } else {
      setVendorProfile(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Resolve user info and specific logo source
  let logoSrc = logo;
  let displayName = 'Guest User';
  let emailText = 'Not Logged In';
  let roleName = 'Guest';

  if (user) {
    roleName = user.role || 'Guest';
    emailText = user.email || 'No email';
    displayName = user.name || 'User';

    if (user.role === 'vendor') {
      displayName = vendorProfile?.businessName || user.name + "'s Store";
      emailText = vendorProfile?.businessEmail || user.email;
      
      if (vendorProfile?.logo) {
        logoSrc = vendorProfile.logo;
      } else if (user.avatar) {
        logoSrc = user.avatar;
      } else {
        logoSrc = 'vendor-default';
      }
    } else if (user.role === 'customer') {
      if (user.avatar) {
        logoSrc = user.avatar;
      } else {
        logoSrc = 'customer-default';
      }
    } else if (user.role === 'admin') {
      if (user.avatar) {
        logoSrc = user.avatar;
      } else {
        logoSrc = 'admin-default';
      }
    }
  }

  const renderLogoBadge = (src, style) => {
    const badgeStyle = {
      ...style,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    };

    const handleMouseEnter = (e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
    };

    const handleMouseLeave = (e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    };

    if (src === 'vendor-default') {
      return (
        <div
          onClick={() => setShowLightbox(true)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ ...badgeStyle, background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)' }}
          title="Click to zoom"
        >
          <svg viewBox="0 0 24 24" width="50%" height="50%" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#E0E7FF' }}>
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="m3 9 2.44-4A2 2 0 0 1 7.18 4h9.64a2 2 0 0 1 1.74 1l2.44 4" />
            <path d="M12 9v12" />
            <path d="M9 9v12" />
            <path d="M15 9v12" />
          </svg>
        </div>
      );
    }

    if (src === 'customer-default') {
      return (
        <div
          onClick={() => setShowLightbox(true)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ ...badgeStyle, background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)' }}
          title="Click to zoom"
        >
          <svg viewBox="0 0 24 24" width="50%" height="50%" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#CCFBF1' }}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      );
    }

    if (src === 'admin-default') {
      return (
        <div
          onClick={() => setShowLightbox(true)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ ...badgeStyle, background: 'linear-gradient(135deg, #E11D48 0%, #9F1239 100%)' }}
          title="Click to zoom"
        >
          <svg viewBox="0 0 24 24" width="50%" height="50%" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFE4E6' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <circle cx="12" cy="11" r="3" />
            <path d="m12 14 3.5 3.5" />
          </svg>
        </div>
      );
    }

    return (
      <img
        src={src}
        alt="Profile Logo"
        onClick={() => setShowLightbox(true)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ ...badgeStyle, objectFit: 'cover' }}
        title="Click to zoom"
      />
    );
  };

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000, backdropFilter: 'blur(5px)', padding: '1rem'
      }} onClick={onClose}>
        <div style={{
          backgroundColor: '#FFF', borderRadius: '12px', width: '100%', maxWidth: '380px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)', overflow: 'hidden',
          color: '#111', fontFamily: "var(--font, 'Inter', sans-serif)"
        }} onClick={e => e.stopPropagation()}>
          
          {/* Header banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            padding: '1.8rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#FFF'
          }}>
            {renderLogoBadge(logoSrc, { width: '70px', height: '70px', backgroundColor: 'rgba(255,255,255,0.15)', padding: logoSrc.includes('default') ? '0' : '6px' })}
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, textAlign: 'center' }}>
              {displayName}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#C7D2FE', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {roleName} Portal
            </span>
          </div>
          
          {/* Details list */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#666', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Name</span>
              <strong style={{ fontSize: '0.95rem' }}>{user?.name || 'Guest User'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#666', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</span>
              <strong style={{ fontSize: '0.95rem' }}>{emailText}</strong>
            </div>
            {user?.role === 'vendor' && vendorProfile?.businessPhone && (
              <div>
                <span style={{ fontSize: '0.72rem', color: '#666', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Phone</span>
                <strong style={{ fontSize: '0.95rem' }}>{vendorProfile.businessPhone}</strong>
              </div>
            )}
            <div>
              <span style={{ fontSize: '0.72rem', color: '#666', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Role</span>
              <div>
                <span style={{
                  display: 'inline-block', fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
                  backgroundColor: roleName === 'admin' ? '#FEE2E2' : roleName === 'vendor' ? '#E0E7FF' : '#DCFCE7',
                  color: roleName === 'admin' ? '#991B1B' : roleName === 'vendor' ? '#3730A3' : '#166534',
                  marginTop: '4px', textTransform: 'capitalize'
                }}>
                  {roleName}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #EEE', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1.2rem', backgroundColor: '#1E1B4B', color: '#FFF', border: 'none',
                borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#312E81'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1E1B4B'}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom / Pan View */}
      <LogoZoomLightbox
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        logoSrc={logoSrc}
      />
    </>
  );
};

export default LogoInfoModal;
