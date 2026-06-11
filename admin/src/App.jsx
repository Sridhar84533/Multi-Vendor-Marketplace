import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import API from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Loader from './components/Loader';

// Pages
import Login from './pages/Login';
import AuthRedirect from './pages/AuthRedirect';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import VendorManagement from './pages/VendorManagement';

// Guard Component for Admin Protected Routes
const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/me');
        if (res.data && res.data.role === 'admin') {
          setIsAuthenticated(true);
          setAdminUser(res.data);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      } catch (err) {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <Loader />;

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header admin={adminUser} />
        <main style={{ flexGrow: 1, overflowY: 'auto' }}>
          {React.cloneElement(children, { admin: adminUser })}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth-redirect" element={<AuthRedirect />} />

        {/* Protected Admin Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/vendors" element={<PrivateRoute><VendorManagement /></PrivateRoute>} />

        {/* Fallback routing */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
