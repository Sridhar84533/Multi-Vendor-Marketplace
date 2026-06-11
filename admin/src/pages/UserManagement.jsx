import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Loader from '../components/Loader';
import { UserCheck, UserX, Shield, ShieldAlert, Award } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (id, currentStatus) => {
    const action = currentStatus ? 'block' : 'unblock';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await API.put(`/admin/users/${id}/block`);
      fetchUsers();
      alert(`User account has been successfully ${action}ed.`);
    } catch (err) {
      alert('Failed to modify user status.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>User Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>View, block, unblock and supervise all customer and vendor registrations.</p>
      </div>

      <section className="card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Points</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: u.role === 'admin' ? '#e8f0fe' : u.role === 'vendor' ? '#e6f4ea' : '#f1f3f4',
                        color: u.role === 'admin' ? '#1a73e8' : u.role === 'vendor' ? '#137333' : '#3c4043',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: u.role === 'admin' ? '#d2e3fc' : u.role === 'vendor' ? '#ceead6' : '#dadce0'
                      }}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                      <Award size={14} color="var(--success)" />
                      {u.loyaltyPoints || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'success' : 'danger'}`}>
                      {u.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u.role !== 'admin' && (
                      <button 
                        onClick={() => handleToggleBlock(u._id, u.isActive)}
                        className={`btn ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        {u.isActive ? (
                          <>
                            <UserX size={14} /> Block
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} /> Unblock
                          </>
                        )}
                      </button>
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

export default UserManagement;
