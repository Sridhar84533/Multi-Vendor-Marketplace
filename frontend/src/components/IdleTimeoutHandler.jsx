import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';

// ─── Configuration ────────────────────────────────────────────────────────────
const ACTIVITY_EVENTS  = [
  'mousemove', 'mousedown', 'keypress',
  'scroll',    'touchstart', 'click',
];

// ─────────────────────────────────────────────────────────────────────────────
export default function IdleTimeoutHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);

  // Dynamic configuration calculation (defaults to 5 minutes)
  const getTimeoutConfig = () => {
    let timeoutSec = null;
    const sessionVal = sessionStorage.getItem('active_idle_timeout_sec');
    if (sessionVal) {
      timeoutSec = parseInt(sessionVal, 10);
    }

    if (!timeoutSec) {
      const urlParams = new URLSearchParams(window.location.search);
      const param = urlParams.get('timeout');
      if (param) {
        const parsed = parseInt(param, 10);
        if (!isNaN(parsed) && parsed > 0) {
          timeoutSec = parsed;
          sessionStorage.setItem('active_idle_timeout_sec', timeoutSec.toString());
        }
      }
    }

    if (!timeoutSec || isNaN(timeoutSec)) {
      timeoutSec = 5 * 60; // 5 minutes default
    }

    const idleTimeoutMs = timeoutSec * 1000;
    
    let warningSecs = 30;
    if (timeoutSec <= 10) {
      warningSecs = 0; // No warning for ultra-short testing timeouts
    } else if (timeoutSec <= 40) {
      warningSecs = 5; // 5 seconds warning
    } else if (timeoutSec <= 90) {
      warningSecs = 10; // 10 seconds warning
    }

    const warnBeforeMs = warningSecs * 1000;

    return {
      idleTimeoutMs,
      warnBeforeMs,
      warningSecs
    };
  };

  const { idleTimeoutMs, warnBeforeMs, warningSecs } = getTimeoutConfig();

  const [showWarning, setShowWarning] = useState(false);
  const [countdown,   setCountdown]   = useState(warningSecs);

  // Refs — mutations here never cause re-renders, so no stale-closure issues
  const lastActivityRef  = useRef(Date.now());
  const warningShownRef  = useRef(false);
  const tickRef          = useRef(null);   // setInterval handle
  const countdownRef     = useRef(null);   // setInterval handle for countdown
  const dispatchRef      = useRef(dispatch);
  const navigateRef      = useRef(navigate);

  // Keep dispatchRef / navigateRef up-to-date without re-running effects
  useEffect(() => { dispatchRef.current = dispatch; },  [dispatch]);
  useEffect(() => { navigateRef.current = navigate; },  [navigate]);

  // ── Core logout helper (uses refs → never stale) ──────────────────────
  const performLogout = () => {
    clearInterval(tickRef.current);
    clearInterval(countdownRef.current);
    warningShownRef.current = false;
    setShowWarning(false);
    
    // Set the session expired flag in localStorage so the popup shows
    localStorage.setItem('sessionExpired', 'true');
    
    dispatchRef.current(logout());
    navigateRef.current('/login?reason=inactivity');
  };

  // ── Activity handler — reset last-activity timestamp ──────────────────
  const onActivity = () => {
    lastActivityRef.current = Date.now();

    // If warning is currently showing, dismiss it when user acts
    if (warningShownRef.current) {
      warningShownRef.current = false;
      clearInterval(countdownRef.current);
      setShowWarning(false);
      setCountdown(warningSecs);
    }
  };

  // ── Main effect — starts/stops the idle watcher ───────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up everything if user logs out manually
      clearInterval(tickRef.current);
      clearInterval(countdownRef.current);
      warningShownRef.current = false;
      setShowWarning(false);
      setCountdown(warningSecs);
      return;
    }

    // Reset activity stamp when effect runs (login / page refresh)
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;

    // Register activity listeners
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true })
    );

    // Poll every second to check idle duration
    tickRef.current = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;

      // ── Hard logout ──
      if (idleMs >= idleTimeoutMs) {
        performLogout();
        return;
      }

      // ── Show warning ──
      if (warningSecs > 0 && idleMs >= idleTimeoutMs - warnBeforeMs && !warningShownRef.current) {
        warningShownRef.current = true;
        setCountdown(warningSecs);
        setShowWarning(true);

        // Start per-second countdown display
        clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 1000); // tick every second

    return () => {
      clearInterval(tickRef.current);
      clearInterval(countdownRef.current);
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, onActivity)
      );
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── "Stay Logged In" button ───────────────────────────────────────────
  const handleStayLoggedIn = () => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    clearInterval(countdownRef.current);
    setShowWarning(false);
    setCountdown(warningSecs);
  };

  // ── "Sign Out Now" button ─────────────────────────────────────────────
  const handleSignOutNow = () => performLogout();

  // Nothing to render when no warning is active
  if (!isAuthenticated || !showWarning) return null;

  // ── Warning Modal ─────────────────────────────────────────────────────
  const pct = warningSecs > 0 ? (countdown / warningSecs) * 360 : 0;

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position:        'fixed',
        inset:           0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        zIndex:          9998,
        backdropFilter:  'blur(4px)',
      }} />

      {/* Modal */}
      <div style={{
        position:      'fixed',
        top:           '50%',
        left:          '50%',
        transform:     'translate(-50%, -50%)',
        zIndex:        9999,
        background:    'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
        border:        '1px solid rgba(255,255,255,0.12)',
        borderRadius:  '20px',
        padding:       '2.5rem',
        maxWidth:      '420px',
        width:         '90%',
        boxShadow:     '0 25px 60px rgba(0,0,0,0.5)',
        textAlign:     'center',
        color:         '#fff',
        fontFamily:    "'Inter','Segoe UI',sans-serif",
        animation:     'idleFadeIn 0.3s ease',
      }}>

        {/* Icon */}
        <div style={{
          width:          '72px',
          height:         '72px',
          borderRadius:   '50%',
          background:     'rgba(255,160,0,0.15)',
          border:         '2px solid rgba(255,160,0,0.4)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          margin:         '0 auto 1.25rem',
          fontSize:       '2rem',
        }}>
          ⏱️
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          Session Expiring Soon
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          No activity detected. You will be signed out in:
        </p>

        {/* Countdown Ring */}
        <div style={{
          width:          '90px',
          height:         '90px',
          borderRadius:   '50%',
          background:     `conic-gradient(#f97316 ${pct}deg, rgba(255,255,255,0.08) 0deg)`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          margin:         '0 auto 1.75rem',
          boxShadow:      '0 0 22px rgba(249,115,22,0.35)',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleStayLoggedIn}
            style={{
              padding:      '0.8rem 1.5rem',
              borderRadius: '10px',
              border:       'none',
              background:   'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color:        '#fff',
              fontWeight:   700,
              fontSize:     '0.95rem',
              cursor:       'pointer',
              boxShadow:    '0 4px 15px rgba(99,102,241,0.4)',
              transition:   'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.55)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(99,102,241,0.4)';
            }}
          >
            ✓ Stay Logged In
          </button>

          <button
            onClick={handleSignOutNow}
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
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; }}
            onMouseOut={(e)  => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            Sign Out Now
          </button>
        </div>

        <p style={{ marginTop: '1.2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
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
