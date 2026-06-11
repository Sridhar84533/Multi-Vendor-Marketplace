import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, updateCartItem, removeCartItem } from '../redux/cartSlice';
import Loader from '../components/Loader/Loader';
import { Trash2 } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleQtyChange = (itemId, quantity) => {
    dispatch(updateCartItem({ itemId, quantity }));
  };

  const handleRemove = (itemId) => {
    dispatch(removeCartItem(itemId));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product?.discountPrice || item.product?.price || 0) * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2>Your Shopping Cart is empty.</h2>
        <p style={{ marginTop: '0.5rem' }}>Please sign in to view your cart details.</p>
        <Link to="/login" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
          <button className="btn btn-primary" style={{ padding: '0.6rem 2rem' }}>Sign In to your account</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>Shopping Cart</h1>
      
      {items.length === 0 ? (
        <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: '4px', textAlign: 'center', border: '1px solid #DDD' }}>
          <h3>Your Amazon Cart is empty.</h3>
          <p style={{ marginTop: '0.5rem' }}>Check out our newest collections to find the best items for you.</p>
          <Link to="/products" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            <button className="btn btn-primary">Shop deals of the day</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFF', padding: '1.5rem', borderRadius: '4px', border: '1px solid #DDD' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #DDD', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Items</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Price</span>
            </div>

            {items.map((item) => {
              if (!item.product) return null;
              const imgUrl = item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
              const price = item.product.discountPrice || item.product.price;
              
              return (
                <div key={item._id} style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #EEE', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <img src={imgUrl} alt={item.product.title} style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                  <div style={{ flexGrow: 1 }}>
                    <Link to={`/products/${item.product._id}`} style={{ fontSize: '1.1rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      {item.product.title}
                    </Link>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>In Stock</span>
                    <span style={{ fontSize: '0.8rem', color: '#555', display: 'block', marginTop: '4px' }}>
                      Eligible for FREE Shipping
                    </span>

                    {/* Selected Variants */}
                    {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                      <div style={{ fontSize: '0.8rem', backgroundColor: '#F9F9F9', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '6px' }}>
                        {Object.entries(item.selectedVariant).map(([k, v]) => (
                          <span key={k} style={{ marginRight: '10px' }}><strong>{k}:</strong> {v}</span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '1rem' }}>
                      <select
                        value={item.quantity}
                        onChange={(e) => handleQtyChange(item._id, Number(e.target.value))}
                        className="form-control"
                        style={{ width: '70px', padding: '0.3rem', backgroundColor: '#FFF' }}
                      >
                        {[...Array(Math.min(10, item.product.stock || 1))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => handleRemove(item._id)}
                        style={{ border: 'none', background: 'none', color: '#007185', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.2rem' }}>
                    Rs. {(price * item.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })}

            <div style={{ textAlign: 'right', fontSize: '1.1rem' }}>
              Subtotal ({totalCount} item{totalCount > 1 ? 's' : ''}): <strong>Rs. {subtotal.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFF', padding: '1.5rem', borderRadius: '4px', border: '1px solid #DDD', height: 'fit-content' }}>
            <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
              Your order is eligible for FREE Delivery.
            </span>
            <div style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              Subtotal ({totalCount} items): <strong>Rs. {subtotal.toFixed(2)}</strong>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.6rem' }}
            >
              Proceed to Buy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
