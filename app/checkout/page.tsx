'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { useNotifications } from '@/lib/context/NotificationContext';
import { Coupon } from '@/app/admin/coupons/page';
import styles from './checkout.module.css';

// Declare Razorpay type
declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, getCartTotal, getCartCount, clearCart } = useCart();
    const { user, isAuthenticated, addLoyaltyPoints } = useAuth();
    const { showToast } = useToast();
    const { addNotification, sendNotification } = useNotifications(); // Updated hook

    const [deliveryAddress, setDeliveryAddress] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: '',
        landmark: '',
        city: 'Secunderabad',
        pincode: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('online');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Allow time for auth context to load
        const timer = setTimeout(() => {
            if (!isAuthenticated) {
                showToast('Please login to place an order', 'error');
                router.push('/login?redirect=/checkout');
            }
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [isAuthenticated, router, showToast]);

    const deliveryCharge = cart.length > 0 ? 40 : 0;
    const gstRate = 0.05;
    const subtotal = getCartTotal();

    // Calculate discount
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discountType === 'percentage') {
            discount = (subtotal * appliedCoupon.discountValue) / 100;
            if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
                discount = appliedCoupon.maxDiscount;
            }
        } else {
            discount = appliedCoupon.discountValue;
        }
    }

    const gst = (subtotal - discount) * gstRate;
    const total = subtotal - discount + deliveryCharge + gst;

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const validateAndApplyCoupon = async () => {
        setCouponError('');

        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        try {
            const res = await fetch(`/api/coupons?code=${couponCode}`);
            const data = await res.json();

            if (!res.ok) {
                setCouponError(data.message || 'Invalid coupon');
                return;
            }

            const coupon = data;

            // Further client validations just in case, though API checked mostly
            if (subtotal < coupon.minOrderValue) {
                setCouponError(`Minimum order value is ₹${coupon.minOrderValue}`);
                return;
            }

            // Client side logic for displaying valid coupon
            setAppliedCoupon(coupon);

            // Recalculate discount for toast (same logic as main render)
            let tempDiscount = 0;
            if (coupon.discountType === 'percentage') {
                tempDiscount = (subtotal * coupon.discountValue) / 100;
                if (coupon.maxDiscount && tempDiscount > coupon.maxDiscount) {
                    tempDiscount = coupon.maxDiscount;
                }
            } else {
                tempDiscount = coupon.discountValue;
            }
            showToast(`Coupon "${coupon.code}" applied! You saved ₹${tempDiscount.toFixed(2)} 🎉`, 'success');

        } catch (error) {
            setCouponError('Failed to validate coupon');
            console.error(error);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
        showToast('Coupon removed', 'info');
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!deliveryAddress.name.trim()) newErrors.name = 'Name is required';
        if (!deliveryAddress.phone.trim()) newErrors.phone = 'Phone is required';
        if (!/^\d{10}$/.test(deliveryAddress.phone)) newErrors.phone = 'Phone must be 10 digits';
        if (!deliveryAddress.address.trim()) newErrors.address = 'Address is required';
        if (!deliveryAddress.city.trim()) newErrors.city = 'City is required';
        if (!deliveryAddress.pincode.trim()) newErrors.pincode = 'Pincode is required';
        if (!/^\d{6}$/.test(deliveryAddress.pincode)) newErrors.pincode = 'Pincode must be 6 digits';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const createOrder = async (paymentId: string, razorpayOrderId: string, signature: string) => {
        try {
            const orderPayload = {
                items: cart,
                totalAmount: total,
                paymentMethod: paymentMethod === 'cod' ? 'COD' : 'ONLINE',
                customerDetails: {
                    name: deliveryAddress.name,
                    email: user?.email || '',
                    phone: deliveryAddress.phone,
                    address: deliveryAddress
                },
                razorpayOrderId: razorpayOrderId !== 'N/A' ? razorpayOrderId : undefined,
                razorpayPaymentId: paymentId !== 'N/A' ? paymentId : undefined,
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to place order');
            }

            // Increment coupon usage count (Processed by Server in POST /orders ideally)
            // if (appliedCoupon) { ... }

            // AWARD LOYALTY POINTS (Handled by API now, but updated context locally)
            if (data.loyaltyPointsEarned > 0) {
                addLoyaltyPoints(data.loyaltyPointsEarned);
            }

            // Clear cart
            clearCart();

            // Create notification for order confirmation
            addNotification({
                type: 'order',
                title: 'Order Placed Successfully! 🎉',
                message: `Your order has been placed. You earned ${data.loyaltyPointsEarned} Chitko Coins! 🪙`,
                actionUrl: '/profile',
            });

            // Trigger Simulated Notifications
            sendNotification('email', deliveryAddress.name, `Order Confirmed! 🧾`);
            sendNotification('sms', deliveryAddress.phone, `Your order is received! 👨‍🍳`);

            showToast(`Order Placed! You earned ${data.loyaltyPointsEarned} Coins! 🪙`, 'success');

            // Redirect to success page
            router.push(`/order-success?orderId=${data.orderId}`);

        } catch (error: any) {
            console.error('Order placement failed:', error);
            showToast(error.message || 'Failed to place order', 'error');
            setIsProcessing(false);
        }
    };


    const handleRazorpayPayment = async () => {
        try {
            // Create Razorpay order
            const response = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: total }),
            });

            const data = await response.json();

            if (!data.success) {
                alert('Failed to create payment order. Please try again.');
                setIsProcessing(false);
                return;
            }

            // Razorpay options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: 'CHITKO RASSO',
                description: 'Order Payment',
                order_id: data.orderId,
                handler: async function (response: any) {
                    // Verify payment
                    const verifyResponse = await fetch('/api/razorpay/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyData.success) {
                        // Payment verified - create order
                        createOrder(
                            response.razorpay_payment_id,
                            response.razorpay_order_id,
                            response.razorpay_signature
                        );
                    } else {
                        alert('Payment verification failed. Please contact support.');
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: deliveryAddress.name,
                    contact: deliveryAddress.phone,
                },
                theme: {
                    color: '#FF6B35',
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleCODOrder = () => {
        // For COD, create order directly without payment
        createOrder('COD', 'N/A', 'N/A');
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            return;
        }

        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        setIsProcessing(true);

        if (paymentMethod === 'cod') {
            // Handle Cash on Delivery
            handleCODOrder();
        } else {
            // Handle online payment via Razorpay
            handleRazorpayPayment();
        }
    };

    if (cart.length === 0) {
        return (
            <div className={styles.checkoutPage}>
                <div className="container">
                    <div className={styles.emptyCart}>
                        <h1>🛒 Your cart is empty</h1>
                        <p>Add some delicious items to proceed with checkout</p>
                        <Link href="/menu" className={styles.btnPrimary}>
                            Browse Menu
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.checkoutPage}>
            {/* Header */}
            <header className={styles.header}>
                <div className="container">
                    <Link href="/" className={styles.logo}>
                        <Image src="/chitko-logo.jpg" alt="Chitko Rasso" width={60} height={60} style={{ objectFit: 'contain' }} priority />
                    </Link>
                </div>
            </header>

            <div className="container">
                <h1 className={styles.pageTitle}>Checkout</h1>

                <div className={styles.checkoutLayout}>
                    {/* Left Column - Forms */}
                    <div className={styles.formsColumn}>
                        {/* Delivery Address */}
                        <section className={styles.section}>
                            <h2>📍 Delivery Address</h2>
                            <div className={styles.form}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            value={deliveryAddress.name}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, name: e.target.value })}
                                            placeholder="Enter your name"
                                        />
                                        {errors.name && <span className={styles.error}>{errors.name}</span>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={deliveryAddress.phone}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                                            placeholder="10-digit mobile number"
                                        />
                                        {errors.phone && <span className={styles.error}>{errors.phone}</span>}
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Complete Address *</label>
                                    <textarea
                                        value={deliveryAddress.address}
                                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, address: e.target.value })}
                                        placeholder="House No., Building Name, Street, Area"
                                        rows={3}
                                    />
                                    {errors.address && <span className={styles.error}>{errors.address}</span>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Landmark (Optional)</label>
                                    <input
                                        type="text"
                                        value={deliveryAddress.landmark}
                                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                                        placeholder="Nearby landmark"
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>City *</label>
                                        <input
                                            type="text"
                                            value={deliveryAddress.city}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                                            placeholder="City"
                                        />
                                        {errors.city && <span className={styles.error}>{errors.city}</span>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Pincode *</label>
                                        <input
                                            type="text"
                                            value={deliveryAddress.pincode}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                                            placeholder="6-digit pincode"
                                        />
                                        {errors.pincode && <span className={styles.error}>{errors.pincode}</span>}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className={styles.section}>
                            <h2>💳 Payment Method</h2>
                            <div className={styles.paymentOptions}>
                                <label className={`${styles.paymentOption} ${paymentMethod === 'online' ? styles.selected : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="online"
                                        checked={paymentMethod === 'online'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className={styles.paymentInfo}>
                                        <strong>💳 Online Payment (Razorpay)</strong>
                                        <span>UPI, Cards, Wallets, Net Banking</span>
                                    </div>
                                </label>

                                <label className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.selected : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className={styles.paymentInfo}>
                                        <strong>💵 Cash on Delivery</strong>
                                        <span>Pay when you receive</span>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className={styles.summaryColumn}>
                        <div className={styles.orderSummary}>
                            <h2>Order Summary</h2>

                            <div className={styles.cartItems}>
                                {cart.map((item) => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={60}
                                            height={60}
                                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                        <div className={styles.itemInfo}>
                                            <h4>{item.name}</h4>
                                            <p>Qty: {item.quantity}</p>
                                        </div>
                                        <div className={styles.itemPrice}>
                                            ₹{item.price * item.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Coupon Section */}
                            <div className={styles.couponSection}>
                                {!appliedCoupon ? (
                                    <div className={styles.couponInput}>
                                        <input
                                            type="text"
                                            placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        />
                                        <button onClick={validateAndApplyCoupon}>Apply</button>
                                    </div>
                                ) : (
                                    <div className={styles.appliedCoupon}>
                                        <span>🎟️ {appliedCoupon.code}</span>
                                        <button onClick={removeCoupon}>✕</button>
                                    </div>
                                )}
                                {couponError && <div className={styles.error} style={{ marginTop: '0.5rem' }}>{couponError}</div>}
                            </div>

                            <div className={styles.summaryDivider}></div>

                            <div className={styles.summaryRow}>
                                <span>Subtotal ({getCartCount()} items)</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            {discount > 0 && (
                                <div className={styles.summaryRow} style={{ color: '#10b981', fontWeight: '600' }}>
                                    <span>💰 Discount ({appliedCoupon?.code})</span>
                                    <span>-₹{discount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className={styles.summaryRow}>
                                <span>Delivery Charge</span>
                                <span>₹{deliveryCharge.toFixed(2)}</span>
                            </div>

                            <div className={styles.summaryRow}>
                                <span>GST (5%)</span>
                                <span>₹{gst.toFixed(2)}</span>
                            </div>

                            <div className={styles.summaryDivider}></div>

                            <div className={styles.summaryTotal}>
                                <span>Total Amount</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                                className={styles.placeOrderBtn}
                            >
                                {isProcessing ? '⏳ Processing...' : `💳 Place Order - ₹${total.toFixed(2)}`}
                            </button>

                            <p className={styles.secureNote}>
                                🔒 Your payment information is secure
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
