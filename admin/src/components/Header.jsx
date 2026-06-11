import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Header = ({ admin }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="header-title">
        Control Panel Dashboard
      </div>

      <div className="user-profile">
        <div style={{ textAlign: 'right' }}>
          <div className="user-profile-name">{admin?.name || 'Administrator'}</div>
          <span className="user-profile-role">System Admin</span>
        </div>

        <button 
          onClick={handleLogout} 
          className="btn btn-outline" 
          style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          title="Sign Out"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
