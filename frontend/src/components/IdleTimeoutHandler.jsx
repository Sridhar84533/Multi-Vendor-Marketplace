import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/authSlice';

// Thresholds (in milliseconds)
const IDLE_WARNING_MS = 4.5 * 60 * 1000; // 4 min 30 sec
const IDLE_LOGOUT_MS  = 5   * 60 * 1000; // 5 min exactly
const WARNING_DURATION_SEC = 30;          // countdown seconds shown in modal

const TRACKED_EVENTS = [
  'mousemove', 'mousedown', 'keypress',
  'scroll',    'touchstart', 'click',
];

export default function IdleTimeoutHandler() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [showWarning, setShowWarning]     = useState(false);
  const [countdown,   setCountdown]       = useState(WARNING_DURATION_SEC);

  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef(null);
  const logoutTimerRef  = useRef(null);
  const countdownRef    = useRef(null);

  // ── Reset all timers ──────────────────────────────────────────────────
  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setCountdown(WARNING_DURATION_SEC);

    clearTimeout(warningTimerRef.current);
    clearTimeout(logoutTimerRef.current);
    clearInterval(countdownRef.current);

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(WARNING_DURATION_SEC);

      // Tick countdown every second
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, IDLE_WARNING_MS);

    logoutTimerRef.current = setTimeout(() => {
      handleAutoLogout();
    }, IDLE_LOGOUT_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto logout ───────────────────────────────────────────────────────
  const handleAutoLogout = useCallback(() => {
    clearTimeout(warningTimerRef.current);
    clearTimeout(logoutTimerRef.current);
    clearInterval(countdownRef.current);
    setShowWarning(false);
    dispatch(logout());
    navigate('/login?reason=inactivity');
  }, [dispatch, navigate]);

  // ── Extend session (user clicked "Stay Logged In") ────────────────────
  const handleExtend = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  // ── Mount / unmount ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    resetTimers();

    TRACKED_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetTimers, { passive: true })
    );

    return () => {
      clearTimeout(warningTimerRef.current);
      clearTimeout(logoutTimerRef.current);
      clearInterval(countdownRef.current);
      TRACKED_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, resetTimers)
      );
    };
  }, [isAuthenticated, resetTimers]);

  // Don't render anything for guests or when no warning
  if (!isAuthenticated || !showWarning) return null;

  // ── Warning Modal ─────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div style={{
        position:        'fixed',
        inset:           0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex:          9998,
        backdropFilter:  'blur(3px)',
      }} />

      {/* Modal Card */}
      <div style={{
        position:        'fixed',
        top:             '50%',
        left:            '50%',
        transform:       'translate(-50%, -50%)',
        zIndex:          9999,
        background:      'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
        border:          '1px solid rgba(255,255,255,0.12)',
        borderRadius:    '20px',
        padding:         '2.5rem',
        maxWidth:        '420px',
        width:           '90%',
        boxShadow:       '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        textAlign:       'center',
        color:           '#fff',
        fontFamily:      "'Inter', 'Segoe UI', sans-serif",
        animation:       'idleFadeIn 0.3s ease',
      }}>
        {/* Icon */}
        <div style={{
          width:        '72px',
          height:       '72px',
          borderRadius: '50%',
          background:   'rgba(255, 160, 0, 0.15)',
          border:       '2px solid rgba(255, 160, 0, 0.4)',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          margin:       '0 auto 1.5rem',
          fontSize:     '2rem',
        }}>
          ⏱️
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
          Session Expiring Soon
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          You have been inactive for a while. You will be automatically signed out in:
        </p>

        {/* Countdown Ring */}
        <div style={{
          width:          '90px',
          height:         '90px',
          borderRadius:   '50%',
          background:     `conic-gradient(
            #f97316 ${(countdown / WARNING_DURATION_SEC) * 360}deg,
            rgba(255,255,255,0.1) 0deg
          )`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          margin:         '0 auto 2rem',
          boxShadow:      '0 0 20px rgba(249, 115, 22, 0.3)',
        }}>
          <div style={{
            width:          '72px',
            height:         '72px',
            borderRadius:   '50%',
            background:     '#16213e',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '1.6rem',
            fontWeight:     800,
            color:          '#f97316',
          }}>
            {countdown}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={handleExtend}
            style={{
              padding:         '0.8rem 1.5rem',
              borderRadius:    '10px',
              border:          'none',
              background:      'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color:           '#fff',
              fontWeight:      700,
              fontSize:        '0.95rem',
              cursor:          'pointer',
              boxShadow:       '0 4px 15px rgba(99, 102, 241, 0.4)',
              transition:      'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(99,102,241,0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
            }}
          >
            ✓ Stay Logged In
          </button>
          <button
            onClick={handleAutoLogout}
            style={{
              padding:      '0.7rem 1.5rem',
              borderRadius: '10px',
              border:       '1px solid rgba(255,255,255,0.18)',
              background:   'rgba(255,255,255,0.06)',
              color:        'rgba(255,255,255,0.7)',
              fontWeight:   600,
              fontSize:     '0.85rem',
              cursor:       'pointer',
              transition:   'background 0.15s',
            }}
            onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseOut={(e)  => { e.target.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            Sign Out Now
          </button>
        </div>

        <p style={{ marginTop: '1.2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          🔒 Your session is protected for your security
        </p>
      </div>

      <style>{`
        @keyframes idleFadeIn {
          from { opacity: 0; transform: translate(-50%, -54%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
