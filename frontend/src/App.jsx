import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import RefurbishedOrders from './seller/RefurbishedOrders';

// Refurbished Pages
import Refurbished from './pages/Refurbished';

// Admin Pages
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminVendors from './admin/AdminVendors';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';

import './styles/index.css';

// Guard: must be logged in
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Guard: must be vendor or admin
const VendorRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) return null;
  return isAuthenticated && (user?.role === 'vendor' || user?.role === 'admin')
    ? children
    : <Navigate to="/" />;
};

// Guard: must be admin
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return children;
};

// Admin pages use their own full-screen layout (no Navbar/Footer wrapper)
const AdminShell = ({ children }) => <>{children}</>;

// Pages that should NOT show the footer
const NO_FOOTER_PATHS = ['/login', '/register'];

// Inner layout — must live inside <Router> to use useLocation
function AppLayout() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  const hideFooter = NO_FOOTER_PATHS.includes(location.pathname);

  return (
    <Routes>
      {/* ── Admin Routes (no Navbar / Footer) ── */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/vendors" element={<AdminRoute><AdminVendors /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />

      {/* ── All other routes (with Navbar + optional Footer) ── */}
      <Route
        path="*"
        element={
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/refurbished" element={<Refurbished />} />

                {/* Customer */}
                <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                <Route path="/tracking/:id" element={<PrivateRoute><Tracking /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
                <Route path="/order-success/:id" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />

                {/* Seller */}
                <Route path="/seller" element={<VendorRoute><SellerDashboard /></VendorRoute>} />
                <Route path="/seller/add-product" element={<VendorRoute><AddProduct /></VendorRoute>} />
                <Route path="/seller/manage-products" element={<VendorRoute><ManageProducts /></VendorRoute>} />
                <Route path="/seller/edit-product/:id" element={<VendorRoute><EditProduct /></VendorRoute>} />
                <Route path="/seller/refurbished-orders" element={<VendorRoute><RefurbishedOrders /></VendorRoute>} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            {!hideFooter && <Footer />}
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
