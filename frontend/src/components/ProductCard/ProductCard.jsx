import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../StarRating/StarRating';
import { ArrowLeftRight } from 'lucide-react';

const ProductCard = ({ product, onCompare, isComparing }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
  const imgUrl = product.images?.[0]?.url || defaultImage;

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <img
          src={imgUrl}
          alt={product.title}
          className="product-card-img"
        />
      </Link>
      <div className="product-card-body">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {product.brand || 'Generic'}
        </span>
        <Link to={`/products/${product._id}`}>
          <h3 className="product-card-title">{product.title}</h3>
        </Link>
        
        <div className="product-card-rating">
          <StarRating rating={product.rating || 0} size={14} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <Link to={`/products/${product._id}`} style={{ flexGrow: 1 }}>
            <button className="btn btn-primary" style={{ width: '100%', padding: '0.4rem' }}>
              View Details
            </button>
          </Link>
          <button
            onClick={() => onCompare(product)}
            className={`btn btn-outline ${isComparing ? 'btn-secondary' : ''}`}
            title="Compare Product"
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
