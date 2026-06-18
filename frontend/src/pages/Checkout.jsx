import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import API, { validateCoupon, createRazorpayOrder, verifyRazorpayPayment } from '../services/api';
import { CreditCard, Truck, Award, Smartphone, Lock } from 'lucide-react';

const inlineInputStyle = {
  width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #ddd',
  borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box',
  outline: 'none', transition: 'border 0.2s',
};

/* ─── Inline Online Payment Form ─── */
const InlinePaymentForm = ({ payTab, setPayTab, card, setCard, upiId, setUpiId, payError }) => {
  const formatCard = (val) =>
    val.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').substring(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
  };

  const tabBtnStyle = (active) => ({
    flex: 1, padding: '0.55rem 0.5rem', border: 'none', cursor: 'pointer',
    background: active ? '#0d1b2a' : '#f4f4f4',
    color: active ? '#fff' : '#555',
    borderRadius: active ? '6px' : '6px',
    fontWeight: active ? 700 : 500, fontSize: '0.85rem',
    transition: 'all 0.2s', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '6px',
  });

  return (
    <div style={{ marginTop: '1rem', background: '#f9f9fb', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', animation: 'fadeSlideIn 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.8rem', fontSize: '0.82rem', color: '#555' }}>
        <Lock size={13} color="#27ae60" />
        <span>Secured — Visa, Mastercard, RuPay, UPI</span>
      </div>

      {/* Sub-tabs: Card / UPI */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', background: '#eee', borderRadius: '8px', padding: '4px' }}>
        <button style={tabBtnStyle(payTab === 'card')} onClick={() => setPayTab('card')}>
          <CreditCard size={14} /> Card
        </button>
        <button style={tabBtnStyle(payTab === 'upi')} onClick={() => setPayTab('upi')}>
          <Smartphone size={14} /> UPI
        </button>
      </div>

      {payTab === 'card' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '3px' }}>Card Number</label>
            <input
              style={inlineInputStyle}
              type="text"
              placeholder="4242 4242 4242 4242"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
              maxLength={19}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '3px' }}>Expiry (MM/YY)</label>
              <input
                style={inlineInputStyle}
                type="text"
                placeholder="12/27"
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                maxLength={5}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '3px' }}>CVV</label>
              <input
                style={inlineInputStyle}
                type="password"
                placeholder="•••"
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                maxLength={4}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '3px' }}>Name on Card</label>
            <input
              style={inlineInputStyle}
              type="text"
              placeholder="Your Name"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
            />
          </div>
        </div>
      ) : (
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '3px' }}>UPI ID</label>
          <input
            style={inlineInputStyle}
            type="text"
            placeholder="yourname@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
          <p style={{ fontSize: '0.74rem', color: '#888', marginTop: '5px' }}>
            e.g. yourname@okaxis, yourname@paytm, yourname@ybl
          </p>
        </div>
      )}

      {payError && (
        <p style={{ color: '#c0392b', fontSize: '0.8rem', marginTop: '0.5rem', padding: '0.45rem 0.6rem', background: '#fdf0ed', borderRadius: '4px' }}>
          ⚠️ {payError}
        </p>
      )}

      <p style={{ fontSize: '0.72rem', color: '#27ae60', marginTop: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
        🔒 Test mode — no real money is charged
      </p>
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

  // Inline payment form state
  const [payTab, setPayTab] = useState('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [payError, setPayError] = useState('');
  const [orderError, setOrderError] = useState('');

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

  const baseTotal = subtotal + shippingFee + tax - discount;
  const loyaltyPointsUsed = useLoyalty ? Math.min(loyaltyPointsAvailable, baseTotal) : 0;
  const total = baseTotal - loyaltyPointsUsed;

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
    walletAmountUsed: 0,
    total,
    couponCode,
    paymentMethod,
  }), [items, user, selectedAddress, subtotal, shippingFee, tax, discount, loyaltyPointsUsed, total, couponCode, paymentMethod]);

  /* Validate inline payment form before submitting */
  const validateInlinePayment = () => {
    setPayError('');
    if (payTab === 'card') {
      const digits = card.number.replace(/\s/g, '');
      if (digits.length < 16) { setPayError('Enter a valid 16-digit card number.'); return false; }
      if (!card.expiry || card.expiry.length < 5) { setPayError('Enter a valid expiry (MM/YY).'); return false; }
      if (!card.cvv || card.cvv.length < 3) { setPayError('Enter a valid CVV.'); return false; }
      if (!card.name.trim()) { setPayError('Enter the name on card.'); return false; }
    } else {
      if (!upiId.includes('@')) { setPayError('Enter a valid UPI ID (e.g. name@upi).'); return false; }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setOrderError('Please select or add a shipping address.');
      return;
    }
    if (items.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }
    // Validate inline card/UPI details before hitting the API
    if (paymentMethod === 'razorpay' && !validateInlinePayment()) return;

    setPlacing(true);
    setOrderError('');
    setPayError('');

    try {
      const orderData = buildOrderData();

      if (paymentMethod === 'razorpay' && total > 0) {
        // ── Step 1: Create Razorpay order on backend ──────────────────────
        let rzpData;
        try {
          const orderRes = await createRazorpayOrder(total);
          rzpData = orderRes.data;
        } catch (err) {
          setPayError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
          setPlacing(false);
          return;
        }

        const rzpOrderId = rzpData?.id;
        // isMock = true when backend has no real Razorpay keys (returns mock_... ID)
        const isMock = !rzpOrderId || rzpOrderId.startsWith('mock_');
        // Only open real Razorpay modal when key starts with 'rzp_'
        const hasRealKey = typeof import.meta.env.VITE_RAZORPAY_KEY_ID === 'string'
          && import.meta.env.VITE_RAZORPAY_KEY_ID.startsWith('rzp_');

        if (!isMock && window.Razorpay && hasRealKey) {
          // ── Real Razorpay checkout ───────────────────────────────────────
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: rzpData.amount,
            currency: rzpData.currency || 'INR',
            name: 'Multi-Vendor Marketplace',
            description: 'Payment for your order',
            order_id: rzpOrderId,
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
                setOrderError('Payment verification failed. Please contact support.');
                setPlacing(false);
              }
            },
            prefill: { name: user.name, email: user.email },
            theme: { color: '#0d1b2a' },
            modal: { ondismiss: () => setPlacing(false) },
          };
          setPlacing(false);
          new window.Razorpay(options).open();
        } else {
          // ── Mock / test mode (no real Razorpay keys configured) ──────────
          await new Promise((r) => setTimeout(r, 1200)); // simulate gateway delay
          const res = await API.post('/orders', orderData);
          // Verification is non-blocking in mock mode — order succeeds regardless
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: rzpOrderId || 'mock_order',
              razorpay_payment_id: 'mock_pay_' + Math.random().toString(36).substr(2, 9),
              razorpay_signature: 'mock_sig',
              orderId: res.data._id,
            });
          } catch (verifyErr) {
            // Non-critical: order is already placed; payment status will remain Pending
            console.warn('Mock payment verification skipped:', verifyErr.message);
          }
          dispatch(clearCart());
          navigate(`/order-success/${res.data._id}`);
        }
      } else {
        // ── COD flow (or total fully covered by wallet) ──────────────────
        const res = await API.post('/orders', orderData);
        dispatch(clearCart());
        navigate(`/order-success/${res.data._id}`);
      }
    } catch (err) {
      console.error(err);
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <>

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
                <div key={method.id}>
                  <label
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
                      onChange={(e) => { setPaymentMethod(e.target.value); setPayError(''); }}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{method.label}</span>
                      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>{method.desc}</p>
                    </div>
                  </label>

                  {/* Inline Card / UPI form — shown immediately when Pay Online is selected */}
                  {method.id === 'razorpay' && paymentMethod === 'razorpay' && (
                    <InlinePaymentForm
                      payTab={payTab}
                      setPayTab={setPayTab}
                      card={card}
                      setCard={setCard}
                      upiId={upiId}
                      setUpiId={setUpiId}
                      payError={payError}
                    />
                  )}
                </div>
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

            {/* Inline order-level error banner */}
            {orderError && (
              <div style={{
                background: '#fdf0ed', border: '1px solid #e74c3c', borderRadius: '6px',
                padding: '0.65rem 0.8rem', marginBottom: '0.8rem',
                fontSize: '0.83rem', color: '#c0392b',
                display: 'flex', alignItems: 'flex-start', gap: '6px',
              }}>
                ⚠️ {orderError}
              </div>
            )}

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
                paymentMethod === 'razorpay' ? '🔒 Pay & Place Order' : 'Place your order'
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
