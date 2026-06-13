import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader/Loader';
import { LayoutDashboard, ShoppingBag, PlusCircle } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  const [existingImages, setExistingImages] = useState([]);

  // Specifications
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [specifications, setSpecifications] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        const p = res.data;
        setTitle(p.title || '');
        setDescription(p.description || '');
        setShortDescription(p.shortDescription || '');
        setCategory(p.category || 'Electronics');
        setBrand(p.brand || '');
        setPrice(p.price || '');
        setDiscountPrice(p.discountPrice || '');
        setStock(p.stock || '');
        setSku(p.sku || '');
        setSpecifications(p.specifications || []);
        setExistingImages(p.images || []);
      } catch (err) {
        alert('Failed to load product for editing.');
        navigate('/seller/manage-products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddSpec = () => {
    if (specKey && specVal) {
      setSpecifications([...specifications, { key: specKey, value: specVal }]);
      setSpecKey('');
      setSpecVal('');
    }
  };

  const handleRemoveSpec = (idx) => {
    setSpecifications(specifications.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingImage = (idx) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
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
      formData.append('existingImages', JSON.stringify(existingImages));

      for (let i = 0; i < images.length; i++) {
        const compressed = await compressImage(images[i]);
        formData.append('images', compressed);
      }

      await API.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Product updated successfully!');
      navigate('/seller/manage-products');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container dashboard-layout">
      <aside className="dashboard-sidebar">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={20} /> Seller Central
        </h3>
        <ul className="dashboard-menu">
          <li className="dashboard-menu-item" onClick={() => navigate('/seller')}>
            <LayoutDashboard size={18} /> Dashboard
          </li>
          <li className="dashboard-menu-item" onClick={() => navigate('/seller/add-product')}>
            <PlusCircle size={18} /> Add Product
          </li>
          <li className="dashboard-menu-item active" onClick={() => navigate('/seller/manage-products')}>
            <ShoppingBag size={18} /> Manage Inventory
          </li>
        </ul>
      </aside>

      <main className="card" style={{ border: '1px solid #DDD' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>Edit Product</h1>

        {/* Existing product images preview */}
        {existingImages.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Current Images</label>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {existingImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                  <img
                    src={img.url}
                    alt={`Product ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', border: '1px solid #DDD', borderRadius: '4px', padding: '4px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(idx)}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      backgroundColor: 'var(--danger)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                    title="Remove Image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
                <div key={idx} style={{ backgroundColor: '#F3F3F3', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong>{s.key}:</strong> {s.value}
                  <button type="button" onClick={() => handleRemoveSpec(idx)} style={{ border: 'none', background: 'none', color: '#CC0C39', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Replace / Add Product Images (Max 5)</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="form-control" style={{ border: 'none', padding: 0 }} />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Uploading new images will be added to existing ones.</small>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '200px' }}>
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/seller/manage-products')}>
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProduct;
