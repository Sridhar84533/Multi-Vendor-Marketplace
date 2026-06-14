import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { LayoutDashboard, ShoppingBag, PlusCircle } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import logo from '../assets/logo.png';

const AddProduct = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Specifications
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [specifications, setSpecifications] = useState([]);

  const handleAddSpec = () => {
    if (specKey && specVal) {
      setSpecifications([...specifications, { key: specKey, value: specVal }]);
      setSpecKey('');
      setSpecVal('');
    }
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('shortDescription', shortDescription);
      formData.append('category', category);
      formData.append('brand', brand);
      formData.append('price', price);
      if (discountPrice) formData.append('discountPrice', discountPrice);
      formData.append('stock', stock);
      formData.append('sku', sku);
      formData.append('specifications', JSON.stringify(specifications));

      // Compress and append files
      for (let i = 0; i < images.length; i++) {
        const compressed = await compressImage(images[i]);
        formData.append('images', compressed);
      }

      await API.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Product created successfully');
      navigate('/seller/manage-products');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          background: '#1E1B4B',
          color: '#fff',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.75rem', marginBottom: '1.5rem' }}>
          <img src={logo} alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#C7D2FE' }}>Seller Central</span>
        </div>

        {[
          { icon: <LayoutDashboard size={17} />, label: 'Dashboard', path: '/seller' },
          { icon: <PlusCircle size={17} />, label: 'Add Product', path: '/seller/add-product' },
          { icon: <ShoppingBag size={17} />, label: 'Manage Inventory', path: '/seller/manage-products' },
        ].map(({ icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '0.7rem 0.85rem',
              background: window.location.pathname === path ? 'rgba(165,180,252,0.25)' : 'transparent',
              border: 'none', borderRadius: '8px', color: '#E0E7FF',
              fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'background 0.15s',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#F9FAFB' }}>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1.5rem', color: '#111827' }}>Add New Product</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="form-control" placeholder="e.g. iPhone 15 Pro Max (256 GB)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-control" style={{ backgroundColor: '#FFF' }}>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Books">Books</option>
                <option value="Groceries">Groceries</option>
                <option value="Home Appliances">Home Appliances</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input type="text" required value={brand} onChange={(e) => setBrand(e.target.value)} className="form-control" placeholder="e.g. Apple" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price (Rs.)</label>
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="form-control" />
            </div>
            <div className="form-group">
              <label className="form-label">Discount Price (Optional)</label>
              <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="form-control" />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Inventory</label>
              <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="form-control" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description</label>
            <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="form-control" placeholder="A single line summary" />
          </div>

          <div className="form-group">
            <label className="form-label">Product Full Description</label>
            <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" placeholder="Detailed product specifications and details"></textarea>
          </div>

          {/* Specifications Builder */}
          <div style={{ border: '1px solid #EEE', padding: '1rem', borderRadius: '4px', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem' }}>Specifications</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" value={specKey} onChange={(e) => setSpecKey(e.target.value)} className="form-control" placeholder="Label (e.g. RAM)" style={{ padding: '0.4rem' }} />
              <input type="text" value={specVal} onChange={(e) => setSpecVal(e.target.value)} className="form-control" placeholder="Value (e.g. 8 GB)" style={{ padding: '0.4rem' }} />
              <button type="button" className="btn btn-outline" onClick={handleAddSpec} style={{ padding: '0.4rem 1rem' }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {specifications.map((s, idx) => (
                <div key={idx} style={{ backgroundColor: '#F3F3F3', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                  <strong>{s.key}:</strong> {s.value}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Images (Max 5)</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="form-control" style={{ border: 'none', padding: 0 }} />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '200px', marginTop: '1rem' }}>
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
        </div>
      </main>
    </div>
  );
};

export default AddProduct;
