import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If token exists, check if they are already logged in
    const checkLogged = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data && res.data.role === 'admin') {
            navigate('/dashboard');
          }
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
    };
    checkLogged();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user } = res.data;

      if (user.role !== 'admin') {
        setError('Access Denied: Only administrators can sign in here.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111', textAlign: 'center' }}>
        Multi-Vendor Marketplace
        <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Admin Panel</span>
      </div>

      <div className="login-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '1.5rem', textAlign: 'center' }}>Admin Sign In</h2>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              required
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <a href="http://localhost:5173" style={{ color: '#0066c0', textDecoration: 'underline' }}>Back to Storefront</a>
      </div>
    </div>
  );
};

export default Login;
