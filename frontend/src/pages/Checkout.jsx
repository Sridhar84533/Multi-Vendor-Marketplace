import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import API, { validateCoupon, createRazorpayOrder, verifyRazorpayPayment } from '../services/api';
import Loader from '../components/Loader/Loader';
import { CreditCard, Truck, Award } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  // Loyalty points
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
  const shippingFee = subtotal > 500 ? 0 : 40;
  const tax = Math.round(subtotal * 0.18); // 18% GST

  // Loyalty Points Deduction (1 point = 1 rupee)
  const loyaltyPointsAvailable = user?.loyaltyPoints || 0;
  const loyaltyPointsUsed = useLoyalty ? Math.min(loyaltyPointsAvailable, subtotal) : 0;

  const total = subtotal + shippingFee + tax - discount - loyaltyPointsUsed;

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

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select or add a shipping address.');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
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
        total,
        couponCode,
        paymentMethod,
      };

      if (paymentMethod === 'razorpay') {
        // Razorpay Payment flow
        const orderRes = await createRazorpayOrder(total);
        const options = {
          key: 'rzp_test_placeholder', // replaced by actual key
          amount: orderRes.data.amount,
          currency: orderRes.data.currency,
          name: 'Multi-Vendor Marketplace',
          description: 'Payment for your order',
          order_id: orderRes.data.id,
          handler: async (response) => {
            try {
              // Create the order first
              const res = await API.post('/orders', orderData);
              const verifyRes = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: res.data._id,
              });
              dispatch(clearCart());
              navigate(`/order-success/${res.data._id}`);
            } catch (err) {
              alert('Payment Verification Failed');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: '#131921',
          },
        };

        // Open mock payment box
        const rzpMock = window.Razorpay ? new window.Razorpay(options) : {
          open: async () => {
            // Simulator Mode
            const res = await API.post('/orders', orderData);
            await verifyRazorpayPayment({
              razorpay_order_id: orderRes.data.id,
              razorpay_payment_id: 'mock_pay_id_' + Math.random().toString(36).substr(2, 9),
              orderId: res.data._id,
            });
            dispatch(clearCart());
            navigate(`/order-success/${res.data._id}`);
          }
        };
        rzpMock.open();
      } else {
        // COD / Direct flow
        const res = await API.post('/orders', orderData);
        dispatch(clearCart());
        navigate(`/order-success/${res.data._id}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>Checkout</h1>

        {/* Shipping Address Panel */}
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
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    border: selectedAddress?._id === addr._id ? '1px solid var(--primary)' : '1px solid #DDD',
                    backgroundColor: selectedAddress?._id === addr._id ? '#FDF8F2' : '#FFF',
                    padding: '1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
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
              { id: 'cod', label: 'Cash on Delivery (COD)' },
              { id: 'razorpay', label: 'Online Payment (Razorpay/Cards/UPI)' },
            ].map((method) => (
              <label
                key={method.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0.8rem',
                  border: '1px solid #DDD',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span style={{ fontSize: '0.95rem' }}>{method.label}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* Summary Box */}
      <div>
        <div className="card" style={{ border: '1px solid #DDD' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', borderBottom: '1px solid #EEE', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items Subtotal:</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping & handling:</span>
              <span>Rs. {shippingFee.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estimated Tax (18% GST):</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)', fontWeight: 600 }}>
                <span>Coupon Discount:</span>
                <span>- Rs. {discount.toFixed(2)}</span>
              </div>
            )}
            {loyaltyPointsUsed > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                <span>Loyalty Points Redeemed:</span>
                <span>- Rs. {loyaltyPointsUsed.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, margin: '1rem 0' }}>
            <span style={{ color: '#B12704' }}>Order Total:</span>
            <span style={{ color: '#B12704' }}>Rs. {total.toFixed(2)}</span>
          </div>

          {/* Loyalty Section */}
          {loyaltyPointsAvailable > 0 && (
            <div style={{ margin: '1rem 0', backgroundColor: '#F4FBF9', border: '1px solid #A3E2D5', padding: '0.8rem', borderRadius: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={useLoyalty}
                  onChange={(e) => setUseLoyalty(e.target.checked)}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={16} color="var(--success)" /> Use {loyaltyPointsAvailable} Loyalty Points (Rs. {loyaltyPointsAvailable} saved)
                </span>
              </label>
            </div>
          )}

          {/* Coupons input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Promo Code</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="form-control"
                style={{ padding: '0.4rem', textTransform: 'uppercase' }}
              />
              <button className="btn btn-outline" onClick={handleApplyCoupon} style={{ padding: '0.4rem 0.8rem' }}>
                Apply
              </button>
            </div>
            {couponMsg && (
              <span style={{ fontSize: '0.75rem', color: couponMsg.includes('success') ? 'var(--success)' : 'var(--danger)', display: 'block', marginTop: '4px' }}>
                {couponMsg}
              </span>
            )}
          </div>

          <button
            onClick={handlePlaceOrder}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.7rem', fontSize: '0.95rem' }}
          >
            Place your order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
