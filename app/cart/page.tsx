'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import styles from './cart.module.css';

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount, clearCart } = useCart();

    const deliveryCharge = cart.length > 0 ? 40 : 0;
    const gstRate = 0.05; // 5% GST
    const subtotal = getCartTotal();
    const gst = subtotal * gstRate;
    const total = subtotal + deliveryCharge + gst;

    return (
        <div className={styles.cartPage}>
            {/* Header */}
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <Link href="/" className={styles.logo}>
                            CHITKO RASSO
                        </Link>
                        <nav className={styles.nav}>
                            <Link href="/">Home</Link>
                            <Link href="/menu">Menu</Link>
                            <Link href="/cart" className={styles.active}>
                                🛒 Cart {getCartCount() > 0 && <span className={styles.cartBadge}>{getCartCount()}</span>}
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Cart Content */}
            <section className={styles.cartSection}>
                <div className="container">
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
                                <h2>Order Summary</h2>

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

                                <Link href="/checkout" className={styles.checkoutBtn}>
                                    Proceed to Checkout
                                </Link>

                                <Link href="/menu" className={styles.continueShoppingBtn}>
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <p>&copy; 2026 CHITKO RASSO. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
