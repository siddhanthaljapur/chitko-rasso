'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { useCart } from '@/lib/context/CartContext';
import styles from '../about/about.module.css';

export default function PrivacyPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const { showToast } = useToast();
    const { getCartCount } = useCart();

    return (
        <div className={styles.aboutPage}>
            {/* Header */}
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <Link href="/" className={styles.logo}>
                            <Image src="/logo.jpg" alt="Chitko Rasso" width={60} height={60} style={{ objectFit: 'contain' }} priority />
                        </Link>
                        <nav className={styles.nav}>
                            <Link href="/">Home</Link>
                            <Link href="/menu">Menu</Link>
                            <Link href="/about">About</Link>
                            <Link href="/cart">Cart ({getCartCount()})</Link>
                            {isAuthenticated ? (
                                <div className={styles.userMenu}>
                                    <Link href="/profile" className={styles.profileLink}>👤 {user?.name}</Link>
                                    <button onClick={() => { logout(); showToast('Logged out successfully. See you soon! 👋', 'success'); }} className={styles.logoutBtn}>Logout</button>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login">Login</Link>
                                    <Link href="/signup">Sign Up</Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <h1>Privacy Policy</h1>
                    <p>Last updated: January 24, 2026</p>
                </div>
            </section>

            {/* Privacy Content */}
            <section className={styles.content}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <div style={{ lineHeight: '1.8', color: '#333' }}>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>1. Introduction</h2>
                        <p>
                            Welcome to CHITKO RASSO. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you about how we look after your personal data when you visit our website
                            and use our services, and tell you about your privacy rights.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>2. Information We Collect</h2>
                        <p><strong>Personal Information:</strong></p>
                        <ul>
                            <li>Name, email address, and phone number</li>
                            <li>Delivery address</li>
                            <li>Payment information (processed securely through Razorpay)</li>
                            <li>Order history and preferences</li>
                        </ul>
                        <p><strong>Automatically Collected Information:</strong></p>
                        <ul>
                            <li>Browser type and version</li>
                            <li>Device information</li>
                            <li>IP address</li>
                            <li>Usage data and analytics</li>
                        </ul>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>3. How We Use Your Information</h2>
                        <p>We use your personal data to:</p>
                        <ul>
                            <li>Process and deliver your food orders</li>
                            <li>Communicate with you about your orders</li>
                            <li>Send promotional offers and updates (with your consent)</li>
                            <li>Improve our services and website</li>
                            <li>Comply with legal obligations</li>
                            <li>Prevent fraud and ensure security</li>
                        </ul>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>4. Data Security</h2>
                        <p>
                            We implement appropriate security measures to protect your personal data against unauthorized access,
                            alteration, disclosure, or destruction. All payment transactions are processed through Razorpay's
                            secure payment gateway using industry-standard encryption.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>5. Data Sharing</h2>
                        <p>We may share your information with:</p>
                        <ul>
                            <li><strong>Delivery Partners:</strong> To fulfill your orders</li>
                            <li><strong>Payment Processors:</strong> Razorpay for secure payment processing</li>
                            <li><strong>Service Providers:</strong> Who help us operate our business</li>
                            <li><strong>Legal Authorities:</strong> When required by law</li>
                        </ul>
                        <p>We do NOT sell your personal data to third parties.</p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Object to processing of your data</li>
                            <li>Withdraw consent at any time</li>
                            <li>Lodge a complaint with a supervisory authority</li>
                        </ul>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>7. Cookies</h2>
                        <p>
                            We use cookies and similar technologies to enhance your experience, analyze usage, and deliver
                            personalized content. You can control cookies through your browser settings.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>8. Data Retention</h2>
                        <p>
                            We retain your personal data only for as long as necessary to fulfill the purposes outlined in this
                            policy, comply with legal obligations, resolve disputes, and enforce our agreements.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>9. Children's Privacy</h2>
                        <p>
                            Our services are not directed to individuals under 18 years of age. We do not knowingly collect
                            personal information from children.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>10. Changes to This Policy</h2>
                        <p>
                            We may update this privacy policy from time to time. We will notify you of any changes by posting
                            the new policy on this page and updating the "Last updated" date.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>11. Contact Us</h2>
                        <p>
                            If you have any questions about this privacy policy or our data practices, please contact us:
                        </p>
                        <ul>
                            <li><strong>Email:</strong> info@chitkrasso.com</li>
                            <li><strong>Phone:</strong> +91 7780552110</li>
                            <li><strong>Address:</strong> Secunderabad, Hyderabad</li>
                        </ul>

                        <div style={{
                            background: '#f8f9fa',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            marginTop: '2rem',
                            borderLeft: '4px solid #ff6b35'
                        }}>
                            <p style={{ margin: 0, fontWeight: 600 }}>
                                By using our services, you acknowledge that you have read and understood this Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <div className={styles.footerContent}>
                        <div className={styles.footerSection}>
                            <h4>CHITKO RASSO</h4>
                            <p>Authentic Saoji flavours from Nagpur, now in Hyderabad</p>
                        </div>
                        <div className={styles.footerSection}>
                            <h4>Quick Links</h4>
                            <Link href="/faq">FAQ</Link>
                            <Link href="/privacy">Privacy Policy</Link>
                            <Link href="/terms">Terms & Conditions</Link>
                        </div>
                        <div className={styles.footerSection}>
                            <h4>Contact</h4>
                            <p>📞 +91 7780552110</p>
                            <p>✉️ info@chitkrasso.com</p>
                        </div>
                    </div>
                    <div className={styles.footerBottom}>
                        <p>&copy; 2026 CHITKO RASSO. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
