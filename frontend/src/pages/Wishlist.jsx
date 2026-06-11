import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlist } from '../redux/wishlistSlice';
import API from '../services/api';
import Loader from '../components/Loader/Loader';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items: wishlistIds, loading: wishlistLoading } = useSelector((state) => state.wishlist);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch details of each wishlist product concurrently
        const requests = wishlistIds.map((id) => API.get(`/products/${id}`));
        const responses = await Promise.all(requests);
        setProducts(responses.map((res) => res.data));
      } catch (err) {
        console.error('Failed to load wishlist items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlistIds]);

  const handleRemove = (productId) => {
    dispatch(toggleWishlist(productId));
  };

  if (loading || wishlistLoading) return <Loader />;

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
        <Heart size={24} fill="var(--danger)" color="var(--danger)" />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 500 }}>Your Wish List</h1>
      </div>

      {products.length === 0 ? (
        <div style={{ backgroundColor: '#FFF', padding: '3rem', borderRadius: '4px', textAlign: 'center', border: '1px solid #DDD' }}>
          <h3>Your Wish List is empty.</h3>
          <p style={{ marginTop: '0.5rem', color: '#555' }}>Add items you want to buy later to save them here.</p>
          <Link to="/products" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            <button className="btn btn-primary">Start shopping now</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {products.map((p) => {
            const imgUrl = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
            return (
              <div key={p._id} className="product-card" style={{ padding: '1rem' }}>
                <Link to={`/products/${p._id}`}>
                  <img src={imgUrl} alt={p.title} style={{ width: '100%', height: '160px', objectFit: 'contain' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, height: '2.5rem', overflow: 'hidden', marginTop: '0.5rem' }}>{p.title}</h3>
                </Link>
                <div style={{ fontWeight: 700, margin: '0.5rem 0' }}>Rs. {p.price}</div>
                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                  <Link to={`/products/${p._id}`} style={{ flexGrow: 1 }}>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }}>
                      <ShoppingCart size={14} /> Buy Now
                    </button>
                  </Link>
                  <button
                    onClick={() => handleRemove(p._id)}
                    className="btn btn-outline"
                    style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)' }}
                    title="Remove from list"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
