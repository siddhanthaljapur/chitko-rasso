'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { isKitchenOpen } from '@/lib/kitchenUtils';
import { useMenu } from '@/lib/hooks/useMenu';
import styles from './cart.module.css';

export default function CartContent() {
    const { cart, addToCart, updateQuantity, removeFromCart, getCartTotal, getCartCount, clearCart } = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { menuItems } = useMenu();

    // Load shared cart if param exists
    useEffect(() => {
        const shareParam = searchParams.get('share');
        if (shareParam && menuItems.length > 0) {
            try {
                // Format: id:qty,id:qty
                const items = shareParam.split(',');

                // Parse valid items first
                const newItems: any[] = [];
                items.forEach(itemStr => {
                    const [id, qtyStr] = itemStr.split(':');
                    const qty = parseInt(qtyStr);
                    const dish = menuItems.find(m => m.id === id);

                    if (dish && !isNaN(qty) && qty > 0) {
                        newItems.push({ dish, qty });
                    }
                });

                if (newItems.length > 0 && cart.length === 0) {
                    clearCart();
                    newItems.forEach(({ dish, qty }) => {
                        addToCart(dish);
                    });

                    // Re-adjustment with timeout for quantities
                    setTimeout(() => {
                        newItems.forEach(({ dish, qty }) => {
                            if (qty > 1) updateQuantity(dish.id, qty);
                        });
                        showToast(`Loaded ${newItems.length} items from shared cart!`, 'success');
                        router.replace('/cart'); // Remove query param
                    }, 100);
                }
            } catch (e) {
                console.error("Failed to parse shared cart", e);
            }
        }
    }, [searchParams, menuItems]);

    const handleShareCart = async () => {
        if (cart.length === 0) {
            showToast('Your cart is empty!', 'error');
            return;
        }

        // Create share string: id:qty,id:qty
        const shareString = cart.map(item => `${item.id}:${item.quantity}`).join(',');
        const shareData = {
            title: 'My Chitko Rasso Order 🛒',
            text: 'Check out my order list! Want the same?',
            url: `${window.location.origin}/cart?share=${shareString}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                showToast('Cart link shared! 🛒', 'success');
            } catch (err) {
                console.log(err);
            }
        } else {
            navigator.clipboard.writeText(shareData.url).then(() => {
                showToast('Cart link copied to clipboard! 📋', 'success');
            }).catch(() => showToast('Failed to copy', 'error'));
        }
    };

    const isOpen = isKitchenOpen();

    const deliveryCharge = cart.length > 0 ? 40 : 0;
    const gstRate = 0.05; // 5% GST
    const subtotal = getCartTotal();
    const gst = subtotal * gstRate;
    const total = subtotal + deliveryCharge + gst;


    // ...
    // Smart Recommendation Logic
    const getRecommendations = () => {
        const cartIds = new Set(cart.map(i => i.id));
        const recommendations: any[] = [];
        const cartCategories = new Set(cart.map(i => i.category));

        // 1. MANDATORY: Add 1 Sweet
        // We prioritize Sweets NOT in the cart
        const sweet = menuItems.find(m => m.category === 'Sweets' && !cartIds.has(m.id)); // Use menuItems
        if (sweet) {
            recommendations.push(sweet);
        }

        // 2. CONTEXTUAL PAIRINGS (Need 2 slots)
        let candidates: any[] = [];

        if (cartCategories.has('Biryanis')) {
            candidates = menuItems.filter(m => m.category === 'Starters' || m.category === 'Tandoori');
        } else if (cartCategories.has('Main Course')) {
            candidates = menuItems.filter(m => m.category === 'Rice & Roti');
        } else if (cartCategories.has('Rice & Roti')) {
            candidates = menuItems.filter(m => m.category === 'Main Course');
        } else if (cartCategories.has('Starters') || cartCategories.has('Tandoori')) {
            // Starters need a Main
            candidates = menuItems.filter(m => m.category === 'Biryanis' || m.category === 'Main Course');
        } else {
            // Fallback: Popular categories
            candidates = menuItems.filter(m => m.category === 'Starters' || m.category === 'Biryanis' || m.category === 'Chinese');
        }

        // Filter out items already in cart
        candidates = candidates.filter(m => !cartIds.has(m.id) && !recommendations.find(r => r.id === m.id));
        // ...

        // Shuffle candidates to get "random dishes"
        const shuffled = candidates.sort(() => 0.5 - Math.random());

        // Fill remaining slots
        const slotsNeeded = 7 - recommendations.length;
        recommendations.push(...shuffled.slice(0, slotsNeeded));

        // If we still don't have 7 (e.g. very small menu), fill with anything unique
        if (recommendations.length < 7) {
            const filler = menuItems.filter(m => !cartIds.has(m.id) && !recommendations.find(r => r.id === m.id));
            const shuffledFiller = filler.sort(() => 0.5 - Math.random());
            recommendations.push(...shuffledFiller.slice(0, 7 - recommendations.length));
        }

        return recommendations;
    };

    // Compute recommendations once
    const recommendations = cart.length > 0 && menuItems.length > 0 ? getRecommendations() : [];

    return (
        <div className={styles.cartPage}>
            <Navbar />
            <Breadcrumbs />

            <div className="container">
                <section className={styles.cartSection}>
                    <h1 className={styles.pageTitle}>Your Cart</h1>

                    {cart.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <div className={styles.emptyIcon}>🛒</div>
                            <h2>Your cart is empty</h2>
                            <p>Add some delicious dishes from our menu!</p>
                            <Link href="/menu" className={styles.btnPrimary}>
                                Browse Menu
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className={styles.cartLayout}>
                                {/* Cart Items */}
                                <div className={styles.cartItems}>
                                    {cart.map((item) => (
                                        <div key={item.id} className={styles.cartItem}>
                                            <div className={styles.itemImage}>
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    width={120}
                                                    height={90}
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <div className={styles.vegBadge}>
                                                    {item.isVeg ? '🟢' : '🔴'}
                                                </div>
                                            </div>

                                            <div className={styles.itemDetails}>
                                                <h3>{item.name}</h3>
                                                <p className={styles.itemDescription}>{item.description}</p>
                                                <div className={styles.itemPrice}>₹{item.price}</div>
                                            </div>

                                            <div className={styles.itemActions}>
                                                <div className={styles.quantityControl}>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className={styles.quantityBtn}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        −
                                                    </button>
                                                    <span className={styles.quantity}>{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className={styles.quantityBtn}
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <div className={styles.itemTotal}>
                                                    ₹{item.price * item.quantity}
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className={styles.removeBtn}
                                                    aria-label="Remove item"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button onClick={clearCart} className={styles.clearCartBtn}>
                                        Clear Cart
                                    </button>
                                </div>

                                {/* Order Summary */}
                                <div className={styles.orderSummary}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h2 style={{ margin: 0 }}>Order Summary</h2>
                                        <button
                                            onClick={handleShareCart}
                                            style={{
                                                background: 'none',
                                                border: '1px solid #ff6b35',
                                                color: '#ff6b35',
                                                borderRadius: '8px',
                                                padding: '0.4rem 0.8rem',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3rem'
                                            }}
                                        >
                                            🔗 Share
                                        </button>
                                    </div>

                                    <div className={styles.summaryRow}>
                                        <span>Subtotal ({getCartCount()} items)</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>

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
                                        <span>Total</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (!isOpen) return;
                                            if (isAuthenticated) {
                                                window.location.href = '/checkout';
                                            } else {
                                                showToast('Please login to checkout', 'error');
                                                window.location.href = '/login?redirect=/checkout';
                                            }
                                        }}
                                        className={`${styles.checkoutBtn} ${!isOpen ? styles.disabled : ''}`}
                                        disabled={!isOpen}
                                    >
                                        {!isOpen ? 'Kitchen Closed' : 'Proceed to Checkout'}
                                    </button>

                                    {!isOpen && (
                                        <p className={styles.closedNotice}>
                                            Order placement is currently disabled by the Admin.
                                        </p>
                                    )}

                                    <Link href="/menu" className={styles.continueShoppingBtn}>
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>

                            {/* Recommendations Section */}
                            {recommendations.length > 0 && (
                                <div className={styles.recommendations}>
                                    <div className={styles.recommendationsHeader}>
                                        <h2>✨ Add-ons / Complete Your Meal</h2>
                                    </div>
                                    <div className={styles.recommendationGrid}>
                                        {recommendations.map(item => (
                                            <div key={item.id} className={styles.recommendationCard}>
                                                <div className={styles.recImageWrapper}>
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                    <div className={styles.vegBadge} style={{ top: '4px', left: '4px', transform: 'scale(0.8)' }}>
                                                        {item.isVeg ? '🟢' : '🔴'}
                                                    </div>
                                                </div>
                                                <div className={styles.recContent}>
                                                    <h4>{item.name}</h4>
                                                    <div className={styles.recPrice}>₹{item.price}</div>
                                                    <button
                                                        className={styles.addRecBtn}
                                                        onClick={() => {
                                                            addToCart(item);
                                                            showToast(`${item.name} added!`, 'success');
                                                        }}
                                                    >
                                                        <span>➕</span> Add
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div >

            <Footer />
        </div >
    );
}
