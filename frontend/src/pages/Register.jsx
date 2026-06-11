import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser({ name, email, password, phone, role: 'customer' }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '90vh', justifyContent: 'center', padding: '2rem 1rem' }}>
      <Link to="/" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111' }}>
        Multi-Vendor Marketplace
      </Link>
      
      <div className="card" style={{ width: '100%', maxWidth: '400px', border: '1px solid #DDD', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem', textAlign: 'center' }}>Create Account</h2>
        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem', textAlign: 'center' }}>Shop from thousands of sellers across India</p>
        
        {error && (
          <div style={{ backgroundColor: '#FCF4F4', border: '1px solid #CC0C39', color: '#CC0C39', padding: '0.8rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Your Name</label>
            <input
              type="text"
              required
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First and last name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Mobile Number (Optional)</label>
            <input
              type="text"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile number"
            />
          </div>

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
            <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
            <input
              type="password"
              required
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>



          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.65rem', fontWeight: 600 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <hr style={{ margin: '1.5rem 0', borderColor: '#E7E7E7' }} />

        <div style={{ fontSize: '0.85rem', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0066c0', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
