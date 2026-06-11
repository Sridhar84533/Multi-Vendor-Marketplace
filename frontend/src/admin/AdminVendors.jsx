import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import API from '../services/api';
import { Search, CheckCircle, XCircle, RefreshCw, Store } from 'lucide-react';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approving, setApproving] = useState(null);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/vendors');
      setVendors(res.data);
      setFiltered(res.data);
    } catch {
      alert('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    let list = vendors;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.user?.name?.toLowerCase().includes(q) ||
          v.user?.email?.toLowerCase().includes(q) ||
          v.shopName?.toLowerCase().includes(q)
      );
    }
    if (statusFilter === 'approved') list = list.filter((v) => v.isApproved);
    if (statusFilter === 'pending') list = list.filter((v) => !v.isApproved);
    setFiltered(list);
  }, [search, statusFilter, vendors]);

  const handleApprove = async (vendorId) => {
    setApproving(vendorId);
    try {
      await API.put(`/admin/vendors/${vendorId}/approve`);
      setVendors((prev) =>
        prev.map((v) => (v._id === vendorId ? { ...v, isApproved: true } : v))
      );
    } catch {
      alert('Failed to approve vendor');
    } finally {
      setApproving(null);
    }
  };

  const pendingCount = vendors.filter((v) => !v.isApproved).length;
  const approvedCount = vendors.filter((v) => v.isApproved).length;

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9' }}>Vendor Management</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {approvedCount} approved · {pendingCount} pending
            </p>
          </div>
          <button
            onClick={fetchVendors}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.2rem',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '10px',
              color: '#a5b4fc',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Vendors', value: vendors.length, color: '#6366f1' },
            { label: 'Approved', value: approvedCount, color: '#10b981' },
            { label: 'Pending Approval', value: pendingCount, color: '#f59e0b' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              flex: 1,
              minWidth: '200px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '0.6rem 1rem',
            }}
          >
            <Search size={16} color="#475569" />
            <input
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: '0.88rem' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Vendor Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading vendors...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>No vendors found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filtered.map((vendor) => (
              <div
                key={vendor._id}
                style={{
                  background: '#1e293b',
                  border: `1px solid ${vendor.isApproved ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                  borderRadius: '14px',
                  padding: '1.25rem',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Store size={20} color="#fff" />
                    </div>
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>
                        {vendor.shopName || 'Unnamed Shop'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{vendor.user?.email}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: vendor.isApproved ? '#10b98120' : '#f59e0b20',
                      color: vendor.isApproved ? '#10b981' : '#f59e0b',
                      border: `1px solid ${vendor.isApproved ? '#10b98140' : '#f59e0b40'}`,
                    }}
                  >
                    {vendor.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#475569' }}>Owner</span>
                    <span style={{ color: '#cbd5e1' }}>{vendor.user?.name}</span>
                  </div>
                  {vendor.category && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: '#475569' }}>Category</span>
                      <span style={{ color: '#cbd5e1' }}>{vendor.category}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#475569' }}>User Status</span>
                    <span style={{ color: vendor.user?.isActive ? '#10b981' : '#f87171', fontWeight: 600 }}>
                      {vendor.user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Action */}
                {!vendor.isApproved && (
                  <button
                    onClick={() => handleApprove(vendor._id)}
                    disabled={approving === vendor._id}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'rgba(16,185,129,0.15)',
                      border: '1px solid rgba(16,185,129,0.4)',
                      borderRadius: '8px',
                      color: '#10b981',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      opacity: approving === vendor._id ? 0.6 : 1,
                    }}
                  >
                    <CheckCircle size={15} />
                    {approving === vendor._id ? 'Approving...' : 'Approve Vendor'}
                  </button>
                )}
                {vendor.isApproved && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#10b981', fontSize: '0.82rem', fontWeight: 600, padding: '0.5rem' }}>
                    <CheckCircle size={15} /> Vendor Active
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminVendors;
