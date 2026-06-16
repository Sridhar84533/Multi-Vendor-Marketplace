import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import API, { validateCoupon, createRazorpayOrder, verifyRazorpayPayment } from '../services/api';
import { CreditCard, Truck, Award, X, Smartphone, Lock } from 'lucide-react';

/* ─── Inline styles for the mock payment modal ─── */
const modalOverlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
  zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '1rem',
};
const modalBoxStyle = {
  background: '#fff', borderRadius: '8px', width: '100%', maxWidth: '440px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)', overflow: 'hidden',
};
const modalHeaderStyle = {
  background: '#0d1b2a', color: '#fff', padding: '1rem 1.2rem',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};
const tabStyle = (active) => ({
  flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer',
  background: active ? '#fff' : '#f0f0f0',
  borderBottom: active ? '2px solid #0d1b2a' : '2px solid transparent',
  fontWeight: active ? 700 : 500, fontSize: '0.9rem',
  transition: 'all 0.2s',
});
const inputStyle = {
  width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #ccc',
  borderRadius: '4px', fontSize: '0.9rem', boxSizing: 'border-box',
  marginTop: '4px',
};
const payBtnStyle = (processing) => ({
  width: '100%', padding: '0.8rem', marginTop: '1.2rem',
  background: processing ? '#555' : '#0d1b2a', color: '#fff',
  border: 'none', borderRadius: '4px', cursor: processing ? 'not-allowed' : 'pointer',
  fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: '8px',
});

/* ─── Mock Payment Modal Component ─── */
const MockPaymentModal = ({ amount, onSuccess, onClose }) => {
  const [tab, setTab] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');

  const formatCard = (val) =>
    val.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').substring(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
  };

  const handlePay = async () => {
    setError('');
    if (tab === 'card') {
      const digits = card.number.replace(/\s/g, '');
      if (digits.length < 16) return setError('Enter a valid 16-digit card number.');
      if (!card.expiry || card.expiry.length < 5) return setError('Enter a valid expiry date (MM/YY).');
      if (!card.cvv || card.cvv.length < 3) return setError('Enter a valid CVV.');
      if (!card.name.trim()) return setError('Enter the name on card.');
    } else {
      if (!upiId.includes('@')) return setError('Enter a valid UPI ID (e.g. name@upi).');
    }
    setProcessing(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    onSuccess();
  };

  return (
    <div style={modalOverlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalBoxStyle}>
        {/* Header */}
        <div style={modalHeaderStyle}>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Secure Payment</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Rs. {amount.toFixed(2)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Lock size={16} color="#aaa" />
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
          <button style={tabStyle(tab === 'card')} onClick={() => setTab('card')}>
            <CreditCard size={14} style={{ marginRight: 4 }} /> Card
          </button>
          <button style={tabStyle(tab === 'upi')} onClick={() => setTab('upi')}>
            <Smartphone size={14} style={{ marginRight: 4 }} /> UPI
          </button>
        </div>

        <div style={{ padding: '1.2rem' }}>
          {tab === 'card' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444' }}>Card Number</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                  maxLength={19}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444' }}>Expiry (MM/YY)</label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="12/27"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                    maxLength={5}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444' }}>CVV</label>
                  <input
                    style={inputStyle}
                    type="password"
                    placeholder="•••"
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                    maxLength={4}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444' }}>Name on Card</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Your Name"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444' }}>UPI ID</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px' }}>
                e.g. yourname@okaxis, yourname@paytm, yourname@ybl
              </p>
            </div>
          )}

          {error && (
            <p style={{ color: '#c0392b', fontSize: '0.8rem', marginTop: '0.5rem', padding: '0.5rem', background: '#fdf0ed', borderRadius: '4px' }}>
              ⚠️ {error}
            </p>
          )}

          <button style={payBtnStyle(processing)} onClick={handlePay} disabled={processing}>
            {processing ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Processing…
              </>
            ) : (
              <>Pay Rs. {amount.toFixed(2)}</>
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#999', marginTop: '0.8rem' }}>
            🔒 Test mode — no real money is charged
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Checkout Page ─── */
const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showMockModal, setShowMockModal] = useState(false);
  // Use refs so the modal callback always reads the latest value (avoids stale closure)
  const pendingOrderDataRef = useRef(null);
  const pendingRzpOrderIdRef = useRef(null);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  const [useLoyalty, setUseLoyalty] = useState(false);

  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        const res = await API.get('/auth/me');
        setAddresses(res.data.addresses || []);
        if (res.data.addresses?.length > 0) {
          setSelectedAddress(res.data.addresses.find((a) => a.isDefault) || res.data.addresses[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserAddresses();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.product?.discountPrice || item.product?.price || 0) * item.quantity, 0);
  const FREE_DELIVERY_THRESHOLD = 1000;
  const DELIVERY_CHARGE = 49;
  const shippingFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const tax = 0;
  const loyaltyPointsAvailable = user?.loyaltyPoints || 0;
  const walletBalanceAvailable = user?.walletBalance || 0;

  const baseTotal = subtotal + shippingFee + tax - discount;
  const loyaltyPointsUsed = useLoyalty ? Math.min(loyaltyPointsAvailable, baseTotal) : 0;
  const walletAmountUsed = Math.min(walletBalanceAvailable, baseTotal - loyaltyPointsUsed);
  const total = baseTotal - loyaltyPointsUsed - walletAmountUsed;

  const handleApplyCoupon = async () => {
    setCouponMsg('');
    try {
      const res = await validateCoupon({ code: couponCode, orderAmount: subtotal });
      setDiscount(res.data.discount);
      setCouponMsg(res.data.message);
    } catch (err) {
      setCouponMsg(err.response?.data?.message || 'Invalid coupon code');
      setDiscount(0);
    }
  };

  const buildOrderData = useCallback(() => ({
    items: items.map((item) => ({
      product: item.product._id,
      vendor: item.product.vendor,
      title: item.product.title,
      image: item.product.images?.[0]?.url || '',
      price: item.product.discountPrice || item.product.price,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant,
    })),
    shippingAddress: {
      name: user.name,
      phone: user.phone || '9999999999',
      ...selectedAddress,
    },
    subtotal,
    shippingFee,
    tax,
    discount,
    loyaltyPointsUsed,
    walletAmountUsed,
    total,
    couponCode,
    paymentMethod,
  }), [items, user, selectedAddress, subtotal, shippingFee, tax, discount, loyaltyPointsUsed, walletAmountUsed, total, couponCode, paymentMethod]);

  /* Called after successful mock payment */
  const handleMockPaymentSuccess = async () => {
    setShowMockModal(false);
    setPlacing(true);
    try {
      const orderData = pendingOrderDataRef.current;
      const rzpOrderId = pendingRzpOrderIdRef.current;
      if (!orderData) throw new Error('Order data missing. Please try again.');
      const res = await API.post('/orders', orderData);
      // Verify with mock payment IDs
      await verifyRazorpayPayment({
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: 'mock_pay_' + Math.random().toString(36).substr(2, 9),
        razorpay_signature: 'mock_sig',
        orderId: res.data._id,
      });
      dispatch(clearCart());
      navigate(`/order-success/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select or add a shipping address.');
      return;
    }
    if (items.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setPlacing(true);
    try {
      const orderData = buildOrderData();

      if (paymentMethod === 'razorpay' && total > 0) {
        // Create Razorpay order on backend
        const orderRes = await createRazorpayOrder(total);
        // Store in refs (synchronous, no stale-closure issue)
        pendingRzpOrderIdRef.current = orderRes.data.id;
        pendingOrderDataRef.current = orderData;

        if (window.Razorpay && !orderRes.data.id?.startsWith('mock_')) {
          // Real Razorpay flow
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
            amount: orderRes.data.amount,
            currency: orderRes.data.currency,
            name: 'Multi-Vendor Marketplace',
            description: 'Payment for your order',
            order_id: orderRes.data.id,
            handler: async (response) => {
              try {
                const res = await API.post('/orders', orderData);
                await verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: res.data._id,
                });
                dispatch(clearCart());
                navigate(`/order-success/${res.data._id}`);
              } catch (err) {
                alert('Payment verification failed. Please contact support.');
              }
            },
            prefill: { name: user.name, email: user.email },
            theme: { color: '#0d1b2a' },
            modal: {
              ondismiss: () => setPlacing(false),
            },
          };
          setPlacing(false);
          new window.Razorpay(options).open();
        } else {
          // Mock payment modal (test/dev mode)
          setPlacing(false);
          setShowMockModal(true);
        }
      } else {
        // COD flow
        const res = await API.post('/orders', orderData);
        dispatch(clearCart());
        navigate(`/order-success/${res.data._id}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <>
      {showMockModal && (
        <MockPaymentModal
          amount={total}
          onSuccess={handleMockPaymentSuccess}
          onClose={() => { setShowMockModal(false); setPlacing(false); }}
        />
      )}

      <div className="container checkout-grid">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>Checkout</h1>

          {/* Shipping Address */}
          <section className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Truck size={20} color="var(--primary)" /> 1. Select Delivery Address
            </h2>
            {addresses.length === 0 ? (
              <div>
                <p style={{ fontSize: '0.9rem', color: '#555' }}>No addresses found. Please add a shipping address in your profile.</p>
                <button className="btn btn-outline" style={{ marginTop: '0.5rem' }} onClick={() => navigate('/profile')}>
                  Add Address
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      border: selectedAddress?._id === addr._id ? '1px solid var(--primary)' : '1px solid #DDD',
                      backgroundColor: selectedAddress?._id === addr._id ? '#FDF8F2' : '#FFF',
                      padding: '1rem', borderRadius: '4px', cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?._id === addr._id}
                      onChange={() => setSelectedAddress(addr)}
                      style={{ marginTop: '4px' }}
                    />
                    <div>
                      <strong>{addr.type} Address</strong>
                      <p style={{ fontSize: '0.9rem', color: '#333', marginTop: '4px' }}>
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Payment Methods */}
          <section className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <CreditCard size={20} color="var(--primary)" /> 2. Select Payment Method
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay when you receive your order' },
                { id: 'razorpay', label: 'Pay Online (Card / UPI / Net Banking)', desc: 'Secured by Razorpay — Visa, Mastercard, RuPay, UPI' },
              ].map((method) => (
                <label
                  key={method.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.9rem',
                    border: paymentMethod === method.id ? '1px solid var(--primary)' : '1px solid #DDD',
                    backgroundColor: paymentMethod === method.id ? '#FDF8F2' : '#FFF',
                    borderRadius: '4px', cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{method.label}</span>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card" style={{ border: '1px solid #DDD', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', borderBottom: '1px solid #EEE', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Items Subtotal:</span><span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping &amp; handling:</span>
                <span>{shippingFee === 0 ? <span style={{ color: 'green', fontWeight: 600 }}>FREE</span> : `Rs. ${shippingFee.toFixed(2)}`}</span>
              </div>
              {/* Free delivery progress banner */}
              {shippingFee > 0 ? (
                <div style={{ background: 'linear-gradient(135deg, #fff8e1, #fff3cd)', border: '1px solid #ffc107', borderRadius: '8px', padding: '10px 12px', marginTop: '4px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 600, color: '#856404' }}>
                    🚚 Add <strong>Rs. {(1000 - subtotal).toFixed(2)}</strong> more to get <span style={{ color: 'green' }}>FREE Delivery!</span>
                  </p>
                  <div style={{ background: '#e0e0e0', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((subtotal / 1000) * 100, 100)}%`, background: 'linear-gradient(90deg, #ffc107, #ff9800)', height: '100%', borderRadius: '999px', transition: 'width 0.4s ease' }} />
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#856404' }}>Rs. {subtotal.toFixed(2)} / Rs. 1,000 for free delivery</p>
                </div>
              ) : (
                <div style={{ background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)', border: '1px solid #66bb6a', borderRadius: '8px', padding: '8px 12px', marginTop: '4px', fontSize: '0.8rem', color: '#2e7d32', fontWeight: 600 }}>
                  🎉 You've unlocked <span style={{ color: 'green' }}>FREE Delivery!</span>
                </div>
              )}
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)', fontWeight: 600 }}>
                  <span>Coupon Discount:</span><span>- Rs. {discount.toFixed(2)}</span>
                </div>
              )}
              {loyaltyPointsUsed > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                  <span>Loyalty Points:</span><span>- Rs. {loyaltyPointsUsed.toFixed(2)}</span>
                </div>
              )}
              {walletAmountUsed > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                  <span>Wallet Balance:</span><span>- Rs. {walletAmountUsed.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, margin: '1rem 0' }}>
              <span style={{ color: '#B12704' }}>Order Total:</span>
              <span style={{ color: '#B12704' }}>Rs. {total.toFixed(2)}</span>
            </div>

            {loyaltyPointsAvailable > 0 && (
              <div style={{ margin: '0 0 1rem', backgroundColor: '#F4FBF9', border: '1px solid #A3E2D5', padding: '0.8rem', borderRadius: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={useLoyalty} onChange={(e) => setUseLoyalty(e.target.checked)} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={16} color="var(--success)" />
                    Use {loyaltyPointsAvailable} Loyalty Points (Rs. {loyaltyPointsAvailable} saved)
                  </span>
                </label>
              </div>
            )}

            {/* Wallet Section */}
            {walletAmountUsed > 0 && (
              <div style={{ margin: '0 0 1rem', backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', padding: '0.8rem', borderRadius: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                  Rs. {walletAmountUsed.toFixed(2)} automatically deducted from Wallet (Balance: Rs. {walletBalanceAvailable.toFixed(2)})
                </span>
              </div>
            )}

            {/* Coupon */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Promo Code</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="form-control"
                  style={{ padding: '0.4rem', textTransform: 'uppercase', flex: 1, minWidth: 0 }}
                />
                <button className="btn btn-outline" onClick={handleApplyCoupon} style={{ padding: '0.4rem 0.8rem', whiteSpace: 'nowrap' }}>
                  Apply
                </button>
              </div>
              {couponMsg && (
                <span style={{ fontSize: '0.75rem', color: couponMsg.toLowerCase().includes('success') ? 'var(--success)' : 'var(--danger)', display: 'block', marginTop: '4px' }}>
                  {couponMsg}
                </span>
              )}
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: placing ? 0.75 : 1, cursor: placing ? 'not-allowed' : 'pointer' }}
            >
              {placing ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Processing…
                </>
              ) : (
                'Place your order'
              )}
            </button>

            <p style={{ fontSize: '0.72rem', color: '#888', textAlign: 'center', marginTop: '0.5rem' }}>
              🔒 Secure checkout
            </p>
          </div>
        </div>
      </div>

    </>
  );
};

export default Checkout;
