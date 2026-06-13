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
      admin: { bg: '#2563eb15', color: '#2563eb', border: '#2563eb30', label: 'Admin' },
      vendor: { bg: '#7c3aed15', color: '#7c3aed', border: '#7c3aed30', label: 'Vendor' },
      customer: { bg: '#0891b215', color: '#0891b2', border: '#0891b230', label: 'Customer' },
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
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827' }}>User Management</h1>
            <p style={{ color: '#4b5563', fontSize: '0.9rem', marginTop: '0.25rem' }}>
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
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              color: '#2563eb',
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
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '0.6rem 1rem',
            }}
          >
            <Search size={16} color="#9ca3af" />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#111827',
                fontSize: '0.88rem',
              }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              color: '#111827',
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
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#4b5563' }}>Loading users...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#4b5563' }}>No users found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '0.9rem 1rem',
                          textAlign: 'left',
                          color: '#4b5563',
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
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
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
                          <span style={{ color: '#111827', fontWeight: 500 }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#4b5563' }}>{user.email}</td>
                      <td style={{ padding: '0.9rem 1rem' }}>{roleBadge(user.role)}</td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                           style={{
                            padding: '2px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: user.isActive ? '#10b98120' : '#ef444420',
                            color: user.isActive ? '#10b981' : '#ef4444',
                            border: `1px solid ${user.isActive ? '#10b98140' : '#ef444440'}`,
                          }}
                        >
                          {user.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#4b5563', fontSize: '0.8rem' }}>
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
                              color: user.isActive ? '#ef4444' : '#10b981',
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
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', fontSize: '0.78rem' }}>
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
