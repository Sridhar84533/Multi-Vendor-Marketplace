import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import API from '../services/api';
import { Search, UserCheck, UserX, ShieldCheck, RefreshCw } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [toggling, setToggling] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
      setFiltered(res.data);
    } catch {
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') list = list.filter((u) => u.role === roleFilter);
    setFiltered(list);
  }, [search, roleFilter, users]);

  const handleToggle = async (userId) => {
    setToggling(userId);
    try {
      await API.put(`/admin/users/${userId}/block`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u))
      );
    } catch {
      alert('Failed to update user status');
    } finally {
      setToggling(null);
    }
  };

  const roleBadge = (role) => {
    const map = {
      admin: { bg: '#6366f120', color: '#a5b4fc', border: '#6366f140', label: 'Admin' },
      vendor: { bg: '#8b5cf620', color: '#c4b5fd', border: '#8b5cf640', label: 'Vendor' },
      customer: { bg: '#06b6d420', color: '#67e8f9', border: '#06b6d440', label: 'Customer' },
    };
    const s = map[role] || { bg: '#94a3b820', color: '#94a3b8', border: '#94a3b840', label: role };
    return (
      <span
        style={{
          padding: '2px 10px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
        }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9' }}>User Management</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {filtered.length} of {users.length} users
            </p>
          </div>
          <button
            onClick={fetchUsers}
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
            <RefreshCw size={14} />
            Refresh
          </button>
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
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#e2e8f0',
                fontSize: '0.88rem',
              }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
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
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Table */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading users...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>No users found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '0.9rem 1rem',
                          textAlign: 'left',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user._id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              flexShrink: 0,
                            }}
                          >
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#94a3b8' }}>{user.email}</td>
                      <td style={{ padding: '0.9rem 1rem' }}>{roleBadge(user.role)}</td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                          style={{
                            padding: '2px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: user.isActive ? '#10b98120' : '#ef444420',
                            color: user.isActive ? '#10b981' : '#f87171',
                            border: `1px solid ${user.isActive ? '#10b98140' : '#ef444440'}`,
                          }}
                        >
                          {user.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggle(user._id)}
                            disabled={toggling === user._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              background: user.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                              border: `1px solid ${user.isActive ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                              color: user.isActive ? '#f87171' : '#10b981',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              opacity: toggling === user._id ? 0.6 : 1,
                            }}
                          >
                            {user.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                            {user.isActive ? 'Block' : 'Unblock'}
                          </button>
                        )}
                        {user.role === 'admin' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6366f1', fontSize: '0.78rem' }}>
                            <ShieldCheck size={14} /> Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
