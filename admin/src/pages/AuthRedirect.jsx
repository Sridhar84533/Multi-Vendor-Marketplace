import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No token provided. Redirection failed.');
      return;
    }

    localStorage.setItem('token', token);

    // Verify user profile and check role
    const verifyAdmin = async () => {
      try {
        const res = await API.get('/auth/me');
        if (res.data && res.data.role === 'admin') {
          navigate('/dashboard');
        } else {
          localStorage.removeItem('token');
          setError('Access Denied: This account is not an administrator.');
        }
      } catch (err) {
        localStorage.removeItem('token');
        setError('Token verification failed or server error. Please try logging in directly.');
      }
    };

    verifyAdmin();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Auth Error</h2>
          <div className="alert alert-danger">{error}</div>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ width: '100%' }}>
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-container" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-light)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
        <p style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Synchronizing administrative session...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
