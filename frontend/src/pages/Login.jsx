import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/authSlice';

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
        navigate('/seller');
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', justifyContent: 'center', padding: '1rem' }}>
      <Link to="/" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111' }}>
        Multi-Vendor Marketplace
      </Link>
      
      <div className="card" style={{ width: '100%', maxWidth: '380px', border: '1px solid #DDD', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem', textAlign: 'center' }}>Sign In</h2>
        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem', textAlign: 'center' }}>Access your vendor or customer dashboard</p>
        
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

      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
        <hr style={{ flexGrow: 1, borderColor: '#E7E7E7' }} />
        <span style={{ margin: '0 8px', fontSize: '0.75rem', color: '#767676' }}>New to the platform?</span>
        <hr style={{ flexGrow: 1, borderColor: '#E7E7E7' }} />
      </div>

      <Link to="/register" style={{ width: '100%', maxWidth: '380px' }}>
        <button className="btn btn-outline" style={{ width: '100%', padding: '0.6rem', fontWeight: 500 }}>
          Create an Account
        </button>
      </Link>
    </div>
  );
};

export default Login;
