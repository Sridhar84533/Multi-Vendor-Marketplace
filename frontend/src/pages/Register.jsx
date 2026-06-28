import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/authSlice';

// ── Password validation rules ──────────────────────────────────────────────
// Password MUST contain:
//   1. At least 8 characters
//   2. The '#' symbol
//   3. At least one other special character (e.g. @, $, !, &, %, etc.)
//   4. At least one uppercase letter
//   5. At least one digit
const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (p) => p.length >= 8,
  },
  {
    id: 'hash',
    label: 'Contains the # symbol',
    test: (p) => /#/.test(p),
  },
  {
    id: 'special',
    label: 'Contains another special character (e.g. @, $, !, &)',
    test: (p) => /[!@$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p),
  },
  {
    id: 'upper',
    label: 'At least one uppercase letter',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'digit',
    label: 'At least one number',
    test: (p) => /[0-9]/.test(p),
  },
];

const isPasswordValid = (p) => PASSWORD_RULES.every((r) => r.test(p));

const Register = () => {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [phone,    setPhone]    = useState('');
  const [pwFocused, setPwFocused] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!isPasswordValid(password)) {
      setFormError('Password does not meet all the security requirements below.');
      return;
    }

    dispatch(registerUser({ name, email, password, phone, role: 'customer' }));
  };

  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      minHeight:      '90vh',
      justifyContent: 'center',
      padding:        '2rem 1rem',
    }}>
      <Link to="/" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111' }}>
        Multi-Vendor Marketplace
      </Link>

      <div className="card" style={{
        width:        '100%',
        maxWidth:     '420px',
        border:       '1px solid #DDD',
        padding:      '2rem',
        borderRadius: '8px',
        boxShadow:    '0 4px 12px rgba(0,0,0,0.05)',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem', textAlign: 'center' }}>
          Create Account
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem', textAlign: 'center' }}>
          Shop from thousands of sellers across India
        </p>

        {/* API error */}
        {error && (
          <div style={{
            backgroundColor: '#FCF4F4',
            border:          '1px solid #CC0C39',
            color:           '#CC0C39',
            padding:         '0.8rem',
            borderRadius:    '4px',
            fontSize:        '0.85rem',
            marginBottom:    '1rem',
          }}>
            {error}
          </div>
        )}

        {/* Client-side validation error */}
        {formError && (
          <div style={{
            backgroundColor: '#FFF8E1',
            border:          '1px solid #F59E0B',
            color:           '#92400E',
            padding:         '0.8rem',
            borderRadius:    '4px',
            fontSize:        '0.85rem',
            marginBottom:    '1rem',
          }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ── Your Name ── */}
          <div className="form-group">
            {/* Label hidden visually — input has placeholder */}
            <label className="form-label" style={{ display: 'none' }}>Your Name</label>
            <input
              type="text"
              required
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          {/* ── Mobile Number ── */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'none' }}>Mobile Number</label>
            <input
              type="text"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile number (optional)"
            />
          </div>

          {/* ── Email Address ── */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'none' }}>Email Address</label>
            <input
              type="email"
              required
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
            />
          </div>

          {/* ── Password ── */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'none' }}>Password</label>
            <input
              type="password"
              required
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwFocused(true)}
              placeholder="Create a strong password"
              style={{
                borderColor: pwFocused && password.length > 0
                  ? isPasswordValid(password) ? '#16a34a' : '#dc2626'
                  : undefined,
              }}
            />

            {/* Strength checklist — shown once user starts typing */}
            {(pwFocused || password.length > 0) && (
              <div style={{
                marginTop:    '0.6rem',
                padding:      '0.9rem',
                background:   '#F8FAFC',
                border:       '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize:     '0.78rem',
              }}>
                <p style={{ fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  🔒 Password must include:
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <li key={rule.id} style={{
                        display:    'flex',
                        alignItems: 'center',
                        gap:        '6px',
                        color:      passed ? '#16a34a' : '#64748b',
                        fontWeight: passed ? 600 : 400,
                        transition: 'color 0.2s',
                      }}>
                        <span style={{
                          display:        'inline-flex',
                          alignItems:     'center',
                          justifyContent: 'center',
                          width:          '16px',
                          height:         '16px',
                          borderRadius:   '50%',
                          background:     passed ? '#dcfce7' : '#F1F5F9',
                          fontSize:       '10px',
                          flexShrink:     0,
                          transition:     'background 0.2s',
                        }}>
                          {passed ? '✓' : '○'}
                        </span>
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>

                {/* Overall strength bar */}
                {password.length > 0 && (() => {
                  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
                  const pct    = (passed / PASSWORD_RULES.length) * 100;
                  const color  = pct <= 40 ? '#dc2626' : pct <= 79 ? '#f59e0b' : '#16a34a';
                  const label  = pct <= 40 ? 'Weak' : pct <= 79 ? 'Medium' : 'Strong';
                  return (
                    <div style={{ marginTop: '0.7rem' }}>
                      <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{
                          width:      `${pct}%`,
                          height:     '100%',
                          background: color,
                          borderRadius: '99px',
                          transition: 'width 0.3s ease, background 0.3s',
                        }} />
                      </div>
                      <p style={{ textAlign: 'right', fontSize: '0.72rem', color, fontWeight: 700, marginTop: '2px' }}>
                        {label}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
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
