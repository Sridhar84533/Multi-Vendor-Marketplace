import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../StarRating/StarRating';
import { ArrowLeftRight, PackageX } from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60';

const ProductCard = ({ product, onCompare, isComparing }) => {
  // Use compressed Unsplash params if the URL is from Unsplash, otherwise use as-is
  const rawUrl = product.images?.[0]?.url || '';
  const imgUrl = rawUrl
    ? rawUrl.includes('unsplash.com') && !rawUrl.includes('auto=format')
      ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}auto=format&fit=crop&q=60&w=400`
      : rawUrl
    : FALLBACK_IMG;

  const handleImgError = (e) => {
    e.currentTarget.onerror = null; // prevent infinite loop
    e.currentTarget.src = FALLBACK_IMG;
  };

  const isOutOfStock = !product.stock || product.stock <= 0;

  return (
    <div className="product-card" style={{ opacity: isOutOfStock ? 0.85 : 1 }}>
      <Link to={`/products/${product._id}`} style={{ position: 'relative', display: 'block' }}>
        {product.isRefurbished && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.68rem',
            letterSpacing: '0.04em',
            padding: '3px 8px',
            borderRadius: '12px',
            boxShadow: '0 2px 6px rgba(13,148,136,0.3)',
            zIndex: 1,
            textTransform: 'uppercase',
          }}>
            Refurbished ({product.refurbishedCondition})
          </div>
        )}
        <img
          src={imgUrl}
          alt={product.title || 'Product'}
          className="product-card-img"
          loading="lazy"
          onError={handleImgError}
          style={{ opacity: isOutOfStock ? 0.5 : 1, transition: 'opacity 0.2s' }}
        />
        {isOutOfStock && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(30, 30, 40, 0.82)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.78rem',
            letterSpacing: '0.06em',
            padding: '6px 14px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(2px)',
            border: '1.5px solid rgba(255,80,80,0.5)',
          }}>
            <PackageX size={13} color="#FF6B6B" />
            <span style={{ color: '#FF6B6B' }}>Out of Stock</span>
          </div>
        )}
      </Link>
      <div className="product-card-body">
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {product.brand || 'Generic'}
        </span>
        <Link to={`/products/${product._id}`}>
          <h3 className="product-card-title">{product.title}</h3>
        </Link>
        
        <div className="product-card-rating">
          <StarRating rating={product.rating || 0} size={13} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ({product.numReviews || 0})
          </span>
        </div>

        <div className="product-card-price">
          <span className="price-actual">Rs. {product.discountPrice || product.price}</span>
          {product.discountPrice && (
            <>
              <span className="price-old">Rs. {product.price}</span>
              <span className="price-discount">({product.discountPercent}% off)</span>
            </>
          )}
        </div>

        {isOutOfStock && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginTop: '0.5rem',
            padding: '4px 10px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#EF4444',
            letterSpacing: '0.04em',
          }}>
            <PackageX size={12} />
            Sold Out — Currently Unavailable
          </div>
        )}
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem' }}>
          <Link to={`/products/${product._id}`} style={{ flexGrow: 1, minWidth: 0 }}>
            <button
              className={`btn ${isOutOfStock ? 'btn-outline' : 'btn-primary'}`}
              style={{ width: '100%', padding: '0.4rem 0.3rem', fontSize: '0.78rem' }}
            >
              {isOutOfStock ? 'View Product' : 'View Details'}
            </button>
          </Link>
          <button
            onClick={() => onCompare(product)}
            className={`btn btn-outline ${isComparing ? 'btn-secondary' : ''}`}
            title="Compare Product"
            style={{ padding: '0.4rem 0.5rem', flexShrink: 0 }}
          >
            <ArrowLeftRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
