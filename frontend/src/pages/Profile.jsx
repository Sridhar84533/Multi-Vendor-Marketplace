import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Loader from '../components/Loader/Loader';
import { User, MapPin, Award, Plus, Trash2 } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Address form states
  const [type, setType] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/me');
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/address', { type, street, city, state, pincode });
      setProfile({ ...profile, addresses: res.data });
      setStreet('');
      setCity('');
      setState('');
      setPincode('');
    } catch (err) {
      alert('Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await API.delete(`/auth/address/${id}`);
      setProfile({ ...profile, addresses: res.data });
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>Your Account</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Profile Details */}
        <section className="card" style={{ border: '1px solid #DDD' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
            <User size={20} color="var(--primary)" /> Profile Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Name</span>
              <strong style={{ display: 'block', fontSize: '1.05rem' }}>{profile?.name}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</span>
              <strong style={{ display: 'block', fontSize: '1.05rem' }}>{profile?.email}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</span>
              <strong style={{ display: 'block', fontSize: '1.05rem' }}>{profile?.phone || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F3FBF9', border: '1px solid #C6EFE7', padding: '0.8rem', borderRadius: '4px', marginTop: '1rem' }}>
              <Award color="var(--success)" size={20} />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#555', display: 'block' }}>Loyalty Balance</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--success)' }}>{profile?.loyaltyPoints || 0} Points</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Addresses Box */}
        <section className="card" style={{ border: '1px solid #DDD' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
            <MapPin size={20} color="var(--primary)" /> Saved Addresses
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            {profile?.addresses?.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#777' }}>No saved addresses yet.</p>
            ) : (
              profile?.addresses?.map((addr) => (
                <div key={addr._id} style={{ border: '1px solid #EEE', padding: '0.8rem', borderRadius: '4px', position: 'relative' }}>
                  <strong style={{ fontSize: '0.85rem' }}>{addr.type}</strong>
                  <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '2px' }}>
                    {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    style={{ position: 'absolute', top: '8px', right: '8px', border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Address Form */}
          <form onSubmit={handleAddAddress} style={{ borderTop: '1px solid #EEE', paddingTop: '1.2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem' }}>Add New Address</h3>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="form-control" style={{ backgroundColor: '#FFF', padding: '0.4rem' }}>
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <input type="text" required value={street} onChange={(e) => setStreet(e.target.value)} className="form-control" placeholder="Street Address" style={{ padding: '0.4rem' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '0.8rem' }}>
              <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="form-control" placeholder="City" style={{ padding: '0.4rem' }} />
              <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className="form-control" placeholder="State" style={{ padding: '0.4rem' }} />
            </div>
            <div className="form-group">
              <input type="text" required value={pincode} onChange={(e) => setPincode(e.target.value)} className="form-control" placeholder="Pincode" style={{ padding: '0.4rem' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem' }}>
              <Plus size={16} /> Save Address
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;
