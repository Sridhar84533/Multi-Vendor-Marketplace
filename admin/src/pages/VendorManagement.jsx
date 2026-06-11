import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Loader from '../components/Loader';
import { Check, ShieldCheck, HelpCircle } from 'lucide-react';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const res = await API.get('/admin/vendors');
      setVendors(res.data || []);
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApproveVendor = async (id) => {
    if (!confirm('Are you sure you want to approve this vendor registration?')) return;
    try {
      await API.put(`/admin/vendors/${id}/approve`);
      fetchVendors();
      alert('Vendor registration approved successfully. User role promoted to vendor.');
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Vendor Management & Approvals</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verify and approve merchants, review GST details, and manage active sellers.</p>
      </div>

      <section className="card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner Name</th>
                <th>Owner Email</th>
                <th>GSTIN</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v._id}>
                  <td style={{ fontWeight: 600 }}>{v.businessName}</td>
                  <td>{v.user?.name || 'N/A'}</td>
                  <td>{v.user?.email || 'N/A'}</td>
                  <td><code>{v.gstNumber || 'Pending'}</code></td>
                  <td>
                    <span className={`badge ${v.isApproved ? 'success' : 'warning'}`}>
                      {v.isApproved ? 'Approved' : 'Awaiting Review'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!v.isApproved ? (
                      <button 
                        onClick={() => handleApproveVendor(v._id)} 
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <Check size={14} /> Approve
                      </button>
                    ) : (
                      <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 500 }}>
                        <ShieldCheck size={16} /> Verified Seller
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default VendorManagement;
