import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/authSlice';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Customer Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Tracking from './pages/Tracking';
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import OrderSuccess from './pages/OrderSuccess';
import NotFound from './pages/NotFound';

// Seller Pages
import SellerDashboard from './seller/SellerDashboard';
import AddProduct from './seller/AddProduct';
import ManageProducts from './seller/ManageProducts';
import EditProduct from './seller/EditProduct';

import './styles/index.css';

// Guard Component for Authenticated routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Guard Component for Vendor roles
const VendorRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) return null;
  return isAuthenticated && (user?.role === 'vendor' || user?.role === 'admin') ? children : <Navigate to="/" />;
};

// Admin Redirect SSO Component
const AdminRedirect = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = `http://localhost:5174/auth-redirect?token=${token}`;
    } else {
      window.location.href = `http://localhost:5174/login`;
    }
  }, []);
  return null;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            
            <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
            <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
            <Route path="/tracking/:id" element={<PrivateRoute><Tracking /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
            <Route path="/order-success/:id" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />

            {/* Seller Routes */}
            <Route path="/seller" element={<VendorRoute><SellerDashboard /></VendorRoute>} />
            <Route path="/seller/add-product" element={<VendorRoute><AddProduct /></VendorRoute>} />
            <Route path="/seller/manage-products" element={<VendorRoute><ManageProducts /></VendorRoute>} />
            <Route path="/seller/edit-product/:id" element={<VendorRoute><EditProduct /></VendorRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRedirect />} />

            {/* fallback 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
