import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toggleWishlist } from '../redux/wishlistSlice';
import API, { getRecommendations } from '../services/api';
import ImageZoom from '../components/ImageZoom/ImageZoom';
import StarRating from '../components/StarRating/StarRating';
import Loader from '../components/Loader/Loader';
import LiveChat from '../components/LiveChat/LiveChat';
import { Heart, ShoppingCart, ShieldAlert, Award, X } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const isInWishlist = wishlistItems.includes(id);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.product?.discountPrice || item.product?.price || 0) * item.quantity, 0);
  const cartTotalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const prodRes = await API.get(`/products/${id}`);
        setProduct(prodRes.data);
        setActiveImage(prodRes.data.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500');

        // Initialise variant state
        if (prodRes.data.variants?.length > 0) {
          const initial = {};
          prodRes.data.variants.forEach((v) => {
            initial[v.name] = v.options[0];
          });
          setSelectedVariant(initial);
        }

        // Fetch Reviews
        const revRes = await API.get(`/reviews/product/${id}`);
        setReviews(revRes.data || []);

        // Fetch Similar
        const simRes = await getRecommendations({ type: 'frequently-bought-together', productId: id });
        setSimilarProducts(simRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      await dispatch(addToCart({ productId: product._id, quantity, selectedVariant })).unwrap();
      setShowAddModal(true);
    } catch (err) {
      alert(err || 'Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) return navigate('/login');
    dispatch(addToCart({ productId: product._id, quantity, selectedVariant }));
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) return navigate('/login');
    dispatch(toggleWishlist(product._id));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await API.post('/reviews', {
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      // Refresh reviews
      const revRes = await API.get(`/reviews/product/${product._id}`);
      setReviews(revRes.data || []);
      setReviewTitle('');
      setReviewComment('');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Review creation failed');
    }
  };

  if (loading) return <Loader />;
  if (!product) return <div className="container"><h3>Product not found.</h3></div>;

  return (
    <div className="container">
      <div className="product-details-container">
        {/* Images Selection & Main Zoom Box */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {product.images?.map((img) => (
              <img
                key={img.publicId}
                src={img.url}
                alt="thumb"
                onClick={() => setActiveImage(img.url)}
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain',
                  border: activeImage === img.url ? '2px solid var(--primary)' : '1px solid #DDD',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              />
            ))}
          </div>
          <div style={{ flexGrow: 1 }}>
            <ImageZoom src={activeImage} alt={product.title} />
          </div>
        </div>

        {/* Middle Core info details panel */}
        <div>
          <span style={{ fontSize: '0.85rem', color: '#007185', fontWeight: 600 }}>
            Brand:{' '}
            {product.brand ? (
              <Link to={`/products?brand=${encodeURIComponent(product.brand)}`} style={{ color: '#007185', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.textDecoration = 'underline'} onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>
                {product.brand}
              </Link>
            ) : (
              'Generic'
            )}
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600, marginTop: '0.2rem', lineHeight: '1.3' }}>{product.title}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
            <StarRating rating={product.rating} />
            <span style={{ fontSize: '0.85rem', color: '#007185' }}>{product.numReviews} ratings</span>
          </div>

          <hr style={{ margin: '1rem 0', borderColor: '#EEE' }} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 600 }}>Rs. {product.discountPrice || product.price}</span>
            {product.discountPrice && (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>M.R.P.: Rs. {product.price}</span>
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>({product.discountPercent}% off)</span>
              </>
            )}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inclusive of all taxes</span>

          {/* Offers list section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', margin: '1.5rem 0' }}>
            <div style={{ border: '1px solid #DDD', padding: '0.8rem', borderRadius: '4px' }}>
              <strong style={{ fontSize: '0.8rem', display: 'block' }}>Bank Offer</strong>
              <span style={{ fontSize: '0.75rem', color: '#555' }}>10% Instant Discount on select Credit Cards</span>
            </div>
            <div style={{ border: '1px solid #DDD', padding: '0.8rem', borderRadius: '4px' }}>
              <strong style={{ fontSize: '0.8rem', display: 'block' }}>No Cost EMI</strong>
              <span style={{ fontSize: '0.75rem', color: '#555' }}>EMI interest savings on select credit cards</span>
            </div>
            <div style={{ border: '1px solid #DDD', padding: '0.8rem', borderRadius: '4px' }}>
              <strong style={{ fontSize: '0.8rem', display: 'block' }}>Partner Offers</strong>
              <span style={{ fontSize: '0.75rem', color: '#555' }}>Earn 10% cash back up to Rs 100</span>
            </div>
          </div>

          <hr style={{ margin: '1rem 0', borderColor: '#EEE' }} />

          {/* Specifications list */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.8rem' }}>Specifications</h3>
            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
              <tbody>
                {product.specifications?.map((spec) => (
                  <tr key={spec.key} style={{ borderBottom: '1px solid #EEE' }}>
                    <td style={{ padding: '0.5rem 0', fontWeight: 600, color: 'var(--text-muted)', width: '40%' }}>{spec.key}</td>
                    <td style={{ padding: '0.5rem 0', color: 'var(--text)' }}>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Add to Cart sidebar panel */}
        <div style={{ border: '1px solid #DDD', padding: '1.5rem', borderRadius: '8px', height: 'fit-content' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Rs. {product.discountPrice || product.price}</div>

          {/* Dynamic Stock Status Badge */}
          {product.stock > 0 ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              color: 'var(--success)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginTop: '0.5rem',
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: 'var(--success)',
                display: 'inline-block',
                boxShadow: '0 0 0 3px rgba(34,197,94,0.15)',
              }} />
              In Stock
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              marginTop: '0.75rem',
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.07)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
            }}>
              <ShieldAlert size={18} color="#EF4444" strokeWidth={2} />
              <div>
                <div style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>Out of Stock</div>
                <div style={{ color: '#999', fontSize: '0.72rem', marginTop: '2px' }}>This item is currently unavailable</div>
              </div>
            </div>
          )}

          <span style={{ fontSize: '0.8rem', color: '#555', display: 'block', marginTop: '0.6rem' }}>
            Sold by: <strong>{product.vendor?.businessName || 'Marketplace Seller'}</strong>
          </span>

          {/* Variants Selector */}
          {product.variants?.map((v) => (
            <div key={v.name} style={{ marginTop: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>{v.name}</label>
              <select
                value={selectedVariant[v.name]}
                onChange={(e) => setSelectedVariant({ ...selectedVariant, [v.name]: e.target.value })}
                className="form-control"
                style={{ padding: '0.4rem', backgroundColor: '#FFF' }}
              >
                {v.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div style={{ marginTop: '1.2rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Quantity</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="form-control"
                style={{ padding: '0.4rem', backgroundColor: '#FFF' }}
              >
                {[...Array(Math.min(10, product.stock))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          )}

          {/* Action triggers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1.5rem' }}>
            <button
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.7rem', opacity: product.stock === 0 ? 0.45 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button
              disabled={product.stock === 0}
              onClick={handleBuyNow}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.7rem', opacity: product.stock === 0 ? 0.45 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
            >
              Buy Now
            </button>
            <button
              onClick={handleToggleWishlist}
              className="btn btn-outline"
              style={{ width: '100%', padding: '0.7rem', display: 'flex', justifyContent: 'center', gap: '6px' }}
            >
              <Heart size={18} fill={isInWishlist ? 'var(--danger)' : 'none'} color={isInWishlist ? 'var(--danger)' : 'currentColor'} />
              {isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Similar / Frequently bought together products */}
      {similarProducts.length > 0 && (
        <section style={{ marginTop: '3rem', backgroundColor: '#FFF', padding: '1.5rem', borderRadius: '4px', border: '1px solid #DDD' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>Customers also bought</h2>
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto' }}>
            {similarProducts.map((sim) => (
              <Link
                key={sim._id}
                to={`/products/${sim._id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  minWidth: '200px',
                  width: '200px',
                  border: '1px solid #EEE',
                  padding: '0.8rem',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  backgroundColor: '#FFF',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img src={sim.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} alt={sim.title} style={{ width: '100%', height: '140px', objectFit: 'contain' }} />
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, height: '2.5rem', overflow: 'hidden', marginTop: '0.5rem', color: '#007185' }}>{sim.title}</h4>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem', display: 'block', color: 'var(--text)' }}>Rs. {sim.price}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Customer reviews</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <StarRating 
              rating={product.rating} 
              size={20} 
              onChange={(val) => {
                setReviewRating(val);
                document.getElementById('review-form-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <strong style={{ fontSize: '1.2rem' }}>{product.rating} out of 5</strong>
          </div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{product.numReviews} global ratings</span>

          {/* Review form */}
          {isAuthenticated && (
            <form id="review-form-section" onSubmit={handleReviewSubmit} style={{ marginTop: '2rem', borderTop: '1px solid #DDD', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Review this product</h3>
              {reviewError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{reviewError}</div>}
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Rating</label>
                <div style={{ marginBottom: '1rem' }}>
                  <StarRating rating={reviewRating} size={28} onChange={setReviewRating} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Review Headline</label>
                <input type="text" required value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} className="form-control" placeholder="What's most important to know?" />
              </div>
              <div className="form-group">
                <label className="form-label">Written review</label>
                <textarea required rows={4} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="form-control" placeholder="Write your feedback here..."></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Submit</button>
            </form>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Top reviews from India</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reviews.map((rev) => (
              <div key={rev._id} style={{ borderBottom: '1px solid #EEE', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="user" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{rev.user?.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.4rem' }}>
                  <StarRating rating={rev.rating} size={14} />
                  <strong style={{ fontSize: '0.9rem' }}>{rev.title}</strong>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                  Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                </span>
                {rev.isVerifiedPurchase && (
                  <span style={{ fontSize: '0.75rem', color: '#C45500', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>
                    Verified Purchase
                  </span>
                )}
                <p style={{ fontSize: '0.9rem', marginTop: '0.6rem', color: '#111' }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer ↔ Seller Live Chat Widget */}
      {product.vendor?.user && (
        <LiveChat recipientId={product.vendor.user} recipientName={product.vendor.businessName} recipientRole="vendor" />
      )}

      {/* Added to Cart Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 3000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#FFF',
            width: '100%',
            maxWidth: '680px',
            borderRadius: '12px',
            padding: '1.8rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#666',
                padding: '4px',
              }}
            >
              <X size={22} />
            </button>

            {/* Top Success Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                backgroundColor: '#DCFCE7',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16A34A',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#16A34A', margin: 0 }}>Added to Cart</h2>
            </div>

            {/* Columns Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: '1.5rem',
            }}>
              {/* Product Info (Left) */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                  alt={product.title}
                  style={{ width: '80px', height: '80px', objectFit: 'contain', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '4px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px', color: '#111827', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.title}
                  </h4>
                  {selectedVariant && Object.keys(selectedVariant).length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#6B7280', margin: '4px 0' }}>
                      {Object.entries(selectedVariant).map(([k, v]) => (
                        <span key={k} style={{ marginRight: '8px' }}><strong>{k}:</strong> {v}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                    Qty: <strong>{quantity}</strong> · Rs. {product.discountPrice || product.price}
                  </div>
                </div>
              </div>

              {/* Cart Summary & CTA (Right) */}
              <div style={{
                backgroundColor: '#F9FAFB',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #F3F4F6',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '10px',
              }}>
                <div style={{ fontSize: '0.92rem', color: '#374151' }}>
                  Cart Subtotal ({cartTotalCount} item{cartTotalCount !== 1 ? 's' : ''}):{' '}
                  <strong style={{ fontSize: '1.05rem', color: '#111827' }}>Rs. {cartSubtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      navigate('/cart');
                    }}
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                  >
                    Go to Cart
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      navigate('/checkout');
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                  >
                    Proceed to Buy
                  </button>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007185',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    alignSelf: 'center',
                    marginTop: '4px',
                    fontWeight: 600,
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Related Products / Store Products (Bottom) */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.8rem', color: '#111827' }}>
                Related items you might like
              </h3>
              {similarProducts.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>No related items found.</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '0.8rem',
                }}>
                  {similarProducts.map((sim) => (
                    <div
                      key={sim._id}
                      onClick={() => {
                        setShowAddModal(false);
                        navigate(`/products/${sim._id}`);
                      }}
                      style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#FFF',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <img
                        src={sim.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                        alt={sim.title}
                        style={{ width: '100%', height: '80px', objectFit: 'contain', marginBottom: '6px', borderRadius: '4px' }}
                      />
                      <h4 style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        margin: '0 0 4px',
                        height: '2rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.2',
                        color: '#1F2937',
                      }}>
                        {sim.title}
                      </h4>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', marginTop: 'auto' }}>
                        Rs. {sim.price}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
