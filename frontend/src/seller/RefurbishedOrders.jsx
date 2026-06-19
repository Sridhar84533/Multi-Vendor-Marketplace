import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API, { markOrderAsRefurbished } from '../services/api';
import {
  RefreshCcw, CheckCircle2, XCircle, ClipboardList,
  PackageCheck, ChevronDown, ChevronUp, Star, AlertTriangle,
} from 'lucide-react';

const QC_ITEMS = [
  'Display / Screen',
  'Battery & Charging',
  'Camera (Front & Rear)',
  'Speakers & Microphone',
  'Physical Body / Frame',
  'All Buttons & Ports',
  'Software / OS',
  'Accessories Included',
];

const CONDITION_COLORS = {
  'Like New': '#16a34a',
  'Good': '#ca8a04',
  'Fair': '#dc2626',
};

const QC_STATUS_COLORS = {
  'Pending': '#94a3b8',
  'Testing': '#f59e0b',
  'Passed': '#16a34a',
  'Failed': '#dc2626',
};

const badge = (label, color) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    background: color + '18', color, border: `1px solid ${color}40`,
    borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700,
  }}>
    {label}
  </span>
);

export default function RefurbishedOrders() {
  const [returnOrders, setReturnOrders] = useState([]);
  const [refurbishedProducts, setRefurbishedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [forms, setForms] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [success, setSuccess] = useState({});
  const [errors, setErrors] = useState({});

  // Editing state for already refurbished products
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          API.get('/orders/vendor'),
          API.get('/vendor/products'),
        ]);

        const allOrders = ordersRes.data || [];
        const allProducts = productsRes.data || [];

        setReturnOrders(allOrders.filter(o => {
          if (!['Return Approved', 'Refunded'].includes(o.status)) return false;
          const p = o.refurbishedProductId;
          if (!p) return true;
          if (typeof p === 'object' && (p.qcStatus === 'Pending' || p.isActive === false)) return true;
          return false;
        }));

        setRefurbishedProducts(allProducts.filter(p => p.isRefurbished && p.isActive));
      } catch (err) {
        console.error('Error fetching data:', err);
        setReturnOrders([]);
        setRefurbishedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleStartEdit = (product) => {
    setEditingProductId(product._id);
    setEditError('');
    setEditForm({
      refurbishedDiscount: product.refurbishedDiscount || 0,
      refurbishedCondition: product.refurbishedCondition || 'Good',
      refurbishedNotes: product.refurbishedNotes || '',
      qcChecklist: product.qcChecklist || [],
    });
  };

  const updateEditForm = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleEditQC = (index) => {
    setEditForm(prev => {
      const updated = prev.qcChecklist.map((c, i) =>
        i === index ? { ...c, passed: !c.passed } : c
      );
      return { ...prev, qcChecklist: updated };
    });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditForm(null);
    setEditError('');
  };

  const handleSaveEdit = async (product) => {
    setEditSubmitting(true);
    setEditError('');
    try {
      const allPassed = editForm.qcChecklist.every(c => c.passed);
      const payload = {
        ...editForm,
        qcStatus: allPassed ? 'Passed' : 'Failed',
      };
      await API.put(`/products/${product._id}`, payload);
      
      // Update local state so UI updates
      if (allPassed) {
        setRefurbishedProducts(prev => prev.map(p => {
          if (p._id === product._id) {
            return { ...p, ...payload, isActive: true };
          }
          return p;
        }));
      } else {
        // QC Failed - remove from refurbishedProducts
        setRefurbishedProducts(prev => prev.filter(p => p._id !== product._id));
        // Re-load returnOrders to get the returned order back in the queue
        const ordersRes = await API.get('/orders/vendor');
        const allOrders = ordersRes.data || [];
        setReturnOrders(allOrders.filter(o => {
          if (!['Return Approved', 'Refunded'].includes(o.status)) return false;
          const p = o.refurbishedProductId;
          if (!p) return true;
          if (typeof p === 'object' && (p.qcStatus === 'Pending' || p.isActive === false)) return true;
          return false;
        }));
      }

      setEditingProductId(null);
      setEditForm(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update refurbished product.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteRefurbished = async (product) => {
    if (!window.confirm('Are you sure you want to delete this refurbished product listing? This will deactivate the listing and return the order to the refurbishment queue.')) {
      return;
    }
    try {
      await API.delete(`/products/${product._id}`);
      
      // Remove from refurbishedProducts
      setRefurbishedProducts(prev => prev.filter(p => p._id !== product._id));
      
      // Re-load returnOrders to get the returned order back in the queue
      const ordersRes = await API.get('/orders/vendor');
      const allOrders = ordersRes.data || [];
      setReturnOrders(allOrders.filter(o => {
        if (!['Return Approved', 'Refunded'].includes(o.status)) return false;
        const p = o.refurbishedProductId;
        if (!p) return true;
        if (typeof p === 'object' && (p.qcStatus === 'Pending' || p.isActive === false)) return true;
        return false;
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete refurbished product.');
    }
  };

  const generateFrontendChecklist = (product) => {
    if (!product) return [];
    const checklist = [];
    const specs = product.specifications || [];
    const category = (product.category || '').toLowerCase();
    const title = (product.title || '').toLowerCase();

    const isElectronic = 
      category.includes('electronic') || 
      category.includes('phone') || 
      category.includes('mobile') || 
      category.includes('laptop') || 
      category.includes('computer') || 
      category.includes('tablet') || 
      category.includes('camera') ||
      title.includes('phone') || 
      title.includes('laptop') || 
      title.includes('watch') || 
      title.includes('earphone') || 
      title.includes('headphone');

    const isRacket = title.includes('racket') || title.includes('bat') || category.includes('sport');

    specs.forEach(spec => {
      const key = (spec.key || '').trim();
      const val = (spec.value || '').trim();
      if (!key || !val) return;

      if (key.toLowerCase().includes('battery') || key.toLowerCase().includes('capacity')) {
        checklist.push(`Battery & Charging (${val})`);
      } else if (key.toLowerCase().includes('screen') || key.toLowerCase().includes('display') || key.toLowerCase().includes('resolution')) {
        checklist.push(`Display / Screen (${val})`);
      } else if (key.toLowerCase().includes('camera') || key.toLowerCase().includes('sensor')) {
        checklist.push(`Camera / Lens (${val})`);
      } else if (key.toLowerCase().includes('material')) {
        checklist.push(`Material & Structure (${val})`);
      } else if (key.toLowerCase().includes('weight') || key.toLowerCase().includes('balance')) {
        checklist.push(`Weight & Balance Verification (${val})`);
      } else if (key.toLowerCase().includes('tension') || key.toLowerCase().includes('string')) {
        checklist.push(`String / Wire Tension (${val})`);
      } else if (key.toLowerCase().includes('grip') || key.toLowerCase().includes('handle')) {
        checklist.push(`Handle & Grip Wrap (${val})`);
      } else if (key.toLowerCase().includes('size') || key.toLowerCase().includes('dimension')) {
        checklist.push(`Size / Dimensions Verification (${val})`);
      } else {
        checklist.push(`Verify ${key}: ${val}`);
      }
    });

    const hasItem = (name) => checklist.some(item => item.toLowerCase().includes(name.toLowerCase()));

    if (isElectronic) {
      if (!hasItem('Display')) checklist.push('Display / Screen Check');
      if (!hasItem('Battery')) checklist.push('Battery & Charging Diagnostics');
      if (!hasItem('Camera')) checklist.push('Camera (Front & Rear) Check');
      if (!hasItem('Speaker') && !hasItem('Audio')) checklist.push('Speakers & Microphone Check');
      checklist.push('All Buttons & Ports Operational');
      checklist.push('Software / OS Reset & Check');
      checklist.push('Physical Body / Frame Scratch Check');
    } else if (isRacket) {
      if (!hasItem('Material')) checklist.push('Frame Material structural integrity');
      if (!hasItem('Tension')) checklist.push('String Tension & alignment');
      if (!hasItem('Grip')) checklist.push('Grip Wrap & Handle check');
      if (!hasItem('Weight')) checklist.push('Weight & Balance alignment');
      checklist.push('Physical Body / Paint Scratches Check');
    } else {
      if (!hasItem('Material')) checklist.push('Material structural check');
      if (!hasItem('Size')) checklist.push('Dimensions & Alignment check');
      checklist.push('Physical Body & Aesthetic integrity');
    }

    checklist.push('Accessories Included Verification');
    return checklist;
  };

  const getForm = (id) => {
    if (forms[id]) return forms[id];

    const order = returnOrders.find(o => o._id === id) || doneOrders.find(o => o._id === id);
    const placeholderList = order?.refurbishedProductId?.qcChecklist;

    if (placeholderList && placeholderList.length > 0) {
      return {
        refurbishedDiscount: 20,
        refurbishedCondition: 'Good',
        refurbishedNotes: '',
        qcStatus: 'Passed',
        qcChecklist: placeholderList.map(c => ({ item: c.item, passed: true })),
      };
    }

    // Generate checklist from order product specifications!
    const product = order?.items?.[0]?.product;
    if (product) {
      const generatedList = generateFrontendChecklist(product);
      if (generatedList.length > 0) {
        return {
          refurbishedDiscount: 20,
          refurbishedCondition: 'Good',
          refurbishedNotes: '',
          qcStatus: 'Passed',
          qcChecklist: generatedList.map(item => ({ item, passed: true })),
        };
      }
    }

    return {
      refurbishedDiscount: 20,
      refurbishedCondition: 'Good',
      refurbishedNotes: '',
      qcStatus: 'Passed',
      qcChecklist: QC_ITEMS.map(item => ({ item, passed: true })),
    };
  };

  const updateForm = (id, field, value) =>
    setForms(prev => ({ ...prev, [id]: { ...getForm(id), [field]: value } }));

  const toggleQC = (orderId, index) => {
    const form = getForm(orderId);
    const updated = form.qcChecklist.map((c, i) =>
      i === index ? { ...c, passed: !c.passed } : c
    );
    updateForm(orderId, 'qcChecklist', updated);
  };

  const handleSubmit = async (orderId) => {
    setSubmitting(prev => ({ ...prev, [orderId]: true }));
    setErrors(prev => ({ ...prev, [orderId]: '' }));
    try {
      const form = getForm(orderId);
      const allPassed = form.qcChecklist.every(c => c.passed);
      await markOrderAsRefurbished(orderId, {
        ...form,
        qcStatus: allPassed ? 'Passed' : 'Failed',
      });
      setSuccess(prev => ({ ...prev, [orderId]: true }));
      setReturnOrders(prev => prev.filter(o => o._id !== orderId));

      const productsRes = await API.get('/vendor/products');
      const allProducts = productsRes.data || [];
      setRefurbishedProducts(allProducts.filter(p => p.isRefurbished && p.isActive));
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        [orderId]: err.response?.data?.message || 'Failed to list as refurbished.',
      }));
    } finally {
      setSubmitting(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <RefreshCcw size={32} style={{ animation: 'spin 1s linear infinite', color: '#0d9488' }} />
        <p style={{ marginTop: '1rem', color: '#666' }}>Loading returned orders…</p>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        borderRadius: '16px', padding: '2rem', marginBottom: '2rem', color: '#fff',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <RefreshCcw size={26} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>Refurbished Products</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '0.9rem' }}>
            Mark returned items as certified refurbished, set discounts & QC status, then re-list them.
          </p>
        </div>
      </div>

      {/* Pending — returned orders awaiting refurbishment */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={18} color="#f59e0b" /> Returned Orders — Ready to Refurbish ({returnOrders.length})
      </h2>

      {returnOrders.length === 0 && (
        <div style={{
          background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px',
          padding: '2.5rem', textAlign: 'center', color: '#94a3b8', marginBottom: '2rem',
        }}>
          <PackageCheck size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <p style={{ margin: 0 }}>No returned orders are waiting to be refurbished.</p>
        </div>
      )}

      {returnOrders.map(order => {
        const item = order.items?.[0];
        const form = getForm(order._id);
        const isOpen = expanded[order._id];
        const passedCount = form.qcChecklist.filter(c => c.passed).length;
        const discountedPrice = item
          ? Math.round((item.price || 0) * (1 - form.refurbishedDiscount / 100))
          : 0;

        return (
          <div key={order._id} style={{
            background: '#fff', borderRadius: '12px', marginBottom: '1rem',
            border: '1px solid #e2e8f0', overflow: 'hidden',
            boxShadow: isOpen ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.2s',
          }}>
            {/* Order card header */}
            <div
              onClick={() => toggleExpand(order._id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem', cursor: 'pointer',
                background: isOpen ? '#f0fdf4' : '#fff',
              }}
            >
              <img
                src={item?.image || 'https://via.placeholder.com/56'}
                alt={item?.title}
                style={{ width: 56, height: 56, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                onError={e => { e.target.src = 'https://via.placeholder.com/56'; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item?.title || 'Product'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Order #{order._id.slice(-8).toUpperCase()} &nbsp;·&nbsp; Qty: {item?.quantity} &nbsp;·&nbsp; Rs. {item?.price}
                </p>
                <div style={{ marginTop: '4px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {badge(order.status, '#16a34a')}
                  {badge(`Return: ${order.returnType}`, '#7c3aed')}
                </div>
              </div>
              <div style={{ flexShrink: 0, color: '#64748b' }}>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {/* Expandable form */}
            {isOpen && (
              <div style={{ padding: '1.25rem', borderTop: '1px solid #e2e8f0', background: '#fafafa' }}>
                {success[order._id] ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#16a34a' }}>
                    <CheckCircle2 size={36} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 700, margin: 0 }}>Successfully listed as Refurbished! 🎉</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      {/* Discount */}
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                          Refurbished Discount (%)
                        </label>
                        <input
                          type="number" min={0} max={80}
                          value={form.refurbishedDiscount}
                          onChange={e => updateForm(order._id, 'refurbishedDiscount', Number(e.target.value))}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#0d9488', fontWeight: 600 }}>
                          New Price: Rs. {discountedPrice} &nbsp;(was Rs. {item?.price})
                        </p>
                      </div>

                      {/* Condition */}
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                          Product Condition
                        </label>
                        <select
                          value={form.refurbishedCondition}
                          onChange={e => updateForm(order._id, 'refurbishedCondition', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}
                        >
                          {['Like New', 'Good', 'Fair'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', fontWeight: 600, color: CONDITION_COLORS[form.refurbishedCondition] }}>
                          ● {form.refurbishedCondition}
                        </p>
                      </div>
                    </div>

                    {/* QC Checklist */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <ClipboardList size={15} /> QC / Testing Checklist
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: passedCount === QC_ITEMS.length ? '#16a34a' : '#f59e0b', fontWeight: 700 }}>
                          {passedCount}/{QC_ITEMS.length} passed
                        </span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {form.qcChecklist.map((c, i) => (
                          <label key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                            background: c.passed ? '#f0fdf4' : '#fef2f2',
                            border: `1px solid ${c.passed ? '#bbf7d0' : '#fecaca'}`,
                            fontSize: '0.8rem', fontWeight: 500,
                            transition: 'all 0.15s',
                          }}>
                            <input type="checkbox" checked={c.passed} onChange={() => toggleQC(order._id, i)} style={{ accentColor: '#0d9488' }} />
                            {c.passed
                              ? <CheckCircle2 size={13} color="#16a34a" />
                              : <XCircle size={13} color="#dc2626" />
                            }
                            {c.item}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Refurbishment Notes (optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Screen replaced, battery health 92%, cosmetic scratches on back cover"
                        value={form.refurbishedNotes}
                        onChange={e => updateForm(order._id, 'refurbishedNotes', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
                      />
                    </div>

                    {errors[order._id] && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.6rem 0.8rem', marginBottom: '1rem', fontSize: '0.83rem', color: '#dc2626' }}>
                        ⚠️ {errors[order._id]}
                      </div>
                    )}

                    <button
                      onClick={() => handleSubmit(order._id)}
                      disabled={submitting[order._id]}
                      style={{
                        width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none',
                        background: submitting[order._id] ? '#94a3b8' : 'linear-gradient(135deg, #0d9488, #0f766e)',
                        color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: submitting[order._id] ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {submitting[order._id] ? (
                        <><RefreshCcw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                      ) : (
                        <><RefreshCcw size={16} /> List as Certified Refurbished</>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Already refurbished section */}
      {refurbishedProducts.length > 0 && (() => {
        const groupedRefurbished = refurbishedProducts.reduce((acc, prod) => {
          const cat = prod.category || 'Other';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(prod);
          return acc;
        }, {});

        return (
          <>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '2rem 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#16a34a" /> Already Refurbished ({refurbishedProducts.length})
            </h2>
            {Object.entries(groupedRefurbished).map(([categoryName, products]) => (
              <div key={categoryName} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '0.82rem', fontWeight: 700, color: '#0f766e',
                  background: '#f0fdf4', border: '1px solid #ccfbf1',
                  padding: '6px 12px', borderRadius: '8px', display: 'inline-flex',
                  alignItems: 'center', gap: '6px',
                  marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  📂 {categoryName} ({products.length})
                </h3>
                {products.map(product => {
                  const isEditing = editingProductId === product._id;
                  return (
                    <div key={product._id} style={{
                      background: '#fff', borderRadius: '12px', marginBottom: '0.75rem',
                      border: isEditing ? '1px solid #2563eb' : '1px solid #bbf7d0',
                      boxShadow: isEditing ? '0 4px 20px rgba(37,99,235,0.08)' : '0 1px 4px rgba(0,0,0,0.02)',
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        borderBottom: isEditing ? '1px solid #e2e8f0' : 'none',
                        background: isEditing ? '#f8fafc' : '#fff',
                      }}>
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/48'}
                          alt={product.title}
                          style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                          onError={e => { e.target.src = 'https://via.placeholder.com/48'; }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>{product.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {product.sku && (
                              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                SKU: {product.sku}
                              </span>
                            )}
                            <span style={{
                              fontSize: '0.74rem', background: '#f1f5f9', color: '#475569',
                              padding: '1px 8px', borderRadius: '12px', fontWeight: 600
                            }}>
                              Category: {product.category || 'Other'}
                            </span>
                          </div>
                        </div>
                        {badge('✓ Refurbished', '#0d9488')}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                          <Link
                            to={`/products/${product._id}`}
                            style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                          >
                            View Listing →
                          </Link>
                          {!isEditing && (
                            <>
                              <button
                                onClick={() => handleStartEdit(product)}
                                style={{
                                  background: 'none', border: 'none', padding: '4px 8px',
                                  color: '#2563eb', fontWeight: 600, fontSize: '0.78rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRefurbished(product)}
                                style={{
                                  background: 'none', border: 'none', padding: '4px 8px',
                                  color: '#dc2626', fontWeight: 600, fontSize: '0.78rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditing && (
                        <div style={{ padding: '1.25rem', background: '#fafafa' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            {/* Discount */}
                            <div>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                                Refurbished Discount (%)
                              </label>
                              <input
                                type="number" min={0} max={80}
                                value={editForm.refurbishedDiscount}
                                onChange={e => updateEditForm('refurbishedDiscount', Number(e.target.value))}
                                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                              />
                              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#0d9488', fontWeight: 600 }}>
                                New Price: Rs. {Math.round((product.price || 0) * (1 - editForm.refurbishedDiscount / 100))} &nbsp;(was Rs. {product.price})
                              </p>
                            </div>

                            {/* Condition */}
                            <div>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                                Product Condition
                              </label>
                              <select
                                value={editForm.refurbishedCondition}
                                onChange={e => updateEditForm('refurbishedCondition', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}
                              >
                                {['Like New', 'Good', 'Fair'].map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', fontWeight: 600, color: CONDITION_COLORS[editForm.refurbishedCondition] }}>
                                ● {editForm.refurbishedCondition}
                              </p>
                            </div>
                          </div>

                          {/* QC Checklist */}
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                              <ClipboardList size={15} /> QC / Testing Checklist
                              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: editForm.qcChecklist.filter(c => c.passed).length === editForm.qcChecklist.length ? '#16a34a' : '#f59e0b', fontWeight: 700 }}>
                                {editForm.qcChecklist.filter(c => c.passed).length}/{editForm.qcChecklist.length} passed
                              </span>
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                              {editForm.qcChecklist.map((c, i) => (
                                <label key={i} style={{
                                  display: 'flex', alignItems: 'center', gap: '8px',
                                  padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                                  background: c.passed ? '#f0fdf4' : '#fef2f2',
                                  border: `1px solid ${c.passed ? '#bbf7d0' : '#fecaca'}`,
                                  fontSize: '0.8rem', fontWeight: 500,
                                  transition: 'all 0.15s',
                                }}>
                                  <input type="checkbox" checked={c.passed} onChange={() => toggleEditQC(i)} style={{ accentColor: '#0d9488' }} />
                                  {c.passed
                                    ? <CheckCircle2 size={13} color="#16a34a" />
                                    : <XCircle size={13} color="#dc2626" />
                                  }
                                  {c.item}
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                              Refurbishment Notes (optional)
                            </label>
                            <textarea
                              rows={2}
                              placeholder="e.g. Screen replaced, battery health 92%, cosmetic scratches on back cover"
                              value={editForm.refurbishedNotes}
                              onChange={e => updateEditForm('refurbishedNotes', e.target.value)}
                              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
                            />
                          </div>

                          {editError && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.6rem 0.8rem', marginBottom: '1rem', fontSize: '0.83rem', color: '#dc2626' }}>
                              ⚠️ {editError}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={handleCancelEdit}
                              style={{
                                flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1',
                                background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(product)}
                              disabled={editSubmitting}
                              style={{
                                flex: 2, padding: '0.6rem', borderRadius: '8px', border: 'none',
                                background: editSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #0d9488, #0f766e)',
                                color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: editSubmitting ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                              }}
                            >
                              {editSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        );
      })()}
    </div>
  );
}
