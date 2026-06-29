import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';

const ACTIVITY_EVENTS  = [
  'mousemove', 'mousedown', 'keypress',
  'scroll',    'touchstart', 'click',
];

export default function IdleTimeoutHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);

  // Dynamic configuration calculation (defaults to 5 minutes)
  const getTimeoutMs = () => {
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

    return timeoutSec * 1000;
  };

  const idleTimeoutMs = getTimeoutMs();

  // Refs — mutations here never cause re-renders, so no stale-closure issues
  const lastActivityRef  = useRef(Date.now());
  const tickRef          = useRef(null);   // setInterval handle
  const dispatchRef      = useRef(dispatch);
  const navigateRef      = useRef(navigate);

  // Keep dispatchRef / navigateRef up-to-date without re-running effects
  useEffect(() => { dispatchRef.current = dispatch; },  [dispatch]);
  useEffect(() => { navigateRef.current = navigate; },  [navigate]);

  // ── Core logout helper (uses refs → never stale) ──────────────────────
  const performLogout = () => {
    clearInterval(tickRef.current);
    
    // Set the session expired flag in localStorage so the popup shows
    localStorage.setItem('sessionExpired', 'true');
    
    dispatchRef.current(logout());
    navigateRef.current('/login?reason=inactivity');
  };

  // ── Activity handler — reset last-activity timestamp ──────────────────
  const onActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // ── Main effect — starts/stops the idle watcher ───────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      clearInterval(tickRef.current);
      return;
    }

    // Reset activity stamp when effect runs (login / page refresh)
    lastActivityRef.current = Date.now();

    // Register activity listeners
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true })
    );

    // Poll every second to check idle duration
    tickRef.current = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;

      // ── Hard logout (no warnings, direct logout) ──
      if (idleMs >= idleTimeoutMs) {
        performLogout();
      }
    }, 1000); // tick every second

    return () => {
      clearInterval(tickRef.current);
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, onActivity)
      );
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, idleTimeoutMs]);

  // Nothing to render — warning modal is removed
  return null;
}
