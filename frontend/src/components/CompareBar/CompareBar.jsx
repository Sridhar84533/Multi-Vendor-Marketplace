import React from 'react';
import { X, ArrowLeftRight } from 'lucide-react';

const CompareBar = ({ products = [], onRemove, onClear, onOpenCompareModal }) => {
  if (products.length === 0) return null;

  return (
    <div className="compare-bar open">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600 }}>
          <ArrowLeftRight size={18} /> Compare Products ({products.length}/4)
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          {products.map((p) => (
            <div
              key={p._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--accent)',
                padding: '0.4rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                border: '1px solid #444',
                gap: '6px',
              }}
            >
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.title}
              </span>
              <X size={14} style={{ cursor: 'pointer', color: '#AAA' }} onClick={() => onRemove(p._id)} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            color: '#AAA',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Clear All
        </button>
        <button
          disabled={products.length < 2}
          onClick={onOpenCompareModal}
          className="btn btn-primary"
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
        >
          Compare Now
        </button>
      </div>
    </div>
  );
};

export default CompareBar;
