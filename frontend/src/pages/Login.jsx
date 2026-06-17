import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/authSlice';
import loginBg from '../assets/login_bg.png';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'vendor') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh', 
      justifyContent: 'center', 
      padding: '2rem',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <Link to="/" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
        Multi-Vendor Marketplace
      </Link>
      
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)', 
        padding: '2.5rem', 
        borderRadius: '16px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)' 
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem', textAlign: 'center', color: '#333' }}>Sign In</h2>
        <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '2rem', textAlign: 'center' }}>Access your vendor or customer dashboard</p>
        
        {error && (
          <div style={{ backgroundColor: '#FCF4F4', border: '1px solid #CC0C39', color: '#CC0C39', padding: '0.8rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              required
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              Password
              <Link to="/forgot-password" style={{ color: '#0066c0', fontSize: '0.8rem', fontWeight: 400 }}>Forgot Password?</Link>
            </label>
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
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem', fontWeight: 600 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', alignItems: 'center', margin: '2rem 0 1.5rem 0' }}>
        <hr style={{ flexGrow: 1, borderColor: 'rgba(255,255,255,0.4)' }} />
        <span style={{ margin: '0 12px', fontSize: '0.85rem', color: '#f8f8f8', fontWeight: 500, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>New to the platform?</span>
        <hr style={{ flexGrow: 1, borderColor: 'rgba(255,255,255,0.4)' }} />
      </div>

      <Link to="/register" style={{ width: '100%', maxWidth: '420px' }}>
        <button className="btn btn-outline" style={{ 
          width: '100%', 
          padding: '0.75rem', 
          fontWeight: 600, 
          fontSize: '1rem',
          backgroundColor: 'rgba(255,255,255,0.15)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: '8px',
          backdropFilter: 'blur(5px)',
          cursor: 'pointer'
        }}>
          Create an Account
        </button>
      </Link>
    </div>
  );
};

export default Login;
