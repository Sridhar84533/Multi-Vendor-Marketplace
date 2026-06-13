import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../StarRating/StarRating';
import { ArrowLeftRight } from 'lucide-react';

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

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <img
          src={imgUrl}
          alt={product.title || 'Product'}
          className="product-card-img"
          loading="lazy"
          onError={handleImgError}
        />
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

        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem' }}>
          <Link to={`/products/${product._id}`} style={{ flexGrow: 1, minWidth: 0 }}>
            <button className="btn btn-primary" style={{ width: '100%', padding: '0.4rem 0.3rem', fontSize: '0.78rem' }}>
              View Details
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
