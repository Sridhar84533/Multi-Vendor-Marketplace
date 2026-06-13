import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, ArrowLeftRight, ExternalLink } from 'lucide-react';

const Sidebar = () => {
  const storefrontUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5173'
    : window.location.origin.replace('admin.', '').replace('-admin', '');

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutDashboard size={20} color="var(--primary)" />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Marketplace</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Admin Portal</span>
      </div>
      
      <ul className="sidebar-menu">
        <li className="sidebar-menu-item">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <LayoutDashboard size={18} />
            Overview
          </NavLink>
        </li>
        <li className="sidebar-menu-item">
          <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
            <Users size={18} />
            User Management
          </NavLink>
        </li>
        <li className="sidebar-menu-item">
          <NavLink to="/vendors" className={({ isActive }) => isActive ? 'active' : ''}>
            <ShieldAlert size={18} />
            Vendor Approvals
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <a 
          href={storefrontUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}
        >
          <ExternalLink size={14} />
          Storefront Site
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
