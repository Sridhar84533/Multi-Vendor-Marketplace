import React from 'react';

const Filters = ({
  categories = [],
  brands = [],
  selectedCategory,
  selectedBrand,
  minPrice,
  maxPrice,
  selectedRating,
  onCategoryChange,
  onBrandChange,
  onPriceChange,
  onRatingChange,
  onClear,
}) => {
  return (
    <aside style={{ width: '250px', backgroundColor: '#FFF', padding: '1.5rem', borderRadius: '4px', border: '1px solid #DDD' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Filters</h3>
        <button onClick={onClear} style={{ border: 'none', background: 'none', color: '#0066c0', cursor: 'pointer', fontSize: '0.85rem' }}>
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.6rem' }}>Category</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {categories.map((cat) => (
            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="category"
                checked={selectedCategory && selectedCategory.toLowerCase() === cat.toLowerCase()}
                onChange={() => onCategoryChange(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.6rem' }}>Brand</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {brands.map((br) => (
              <label key={br} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedBrand && selectedBrand.some((b) => b.toLowerCase() === br.toLowerCase())}
                  onChange={() => onBrandChange(br)}
                />
                {br}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.6rem' }}>Price</h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onPriceChange('min', e.target.value)}
            style={{ width: '70px', padding: '0.4rem', border: '1px solid #DDD', borderRadius: '4px' }}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onPriceChange('max', e.target.value)}
            style={{ width: '70px', padding: '0.4rem', border: '1px solid #DDD', borderRadius: '4px' }}
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.6rem' }}>Customer Review</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[4, 3, 2, 1].map((stars) => (
            <label key={stars} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="rating"
                checked={selectedRating === stars}
                onChange={() => onRatingChange(stars)}
              />
              <span>{stars} & Up</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Filters;
