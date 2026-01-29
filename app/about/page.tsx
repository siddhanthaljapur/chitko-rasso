'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { useCart } from '@/lib/context/CartContext';
import Footer from '@/components/Footer';
import styles from './about.module.css';

export default function AboutPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const { showToast } = useToast();
    const { getCartCount } = useCart();

    return (
        <div className={styles.aboutPage}>
            {/* Navigation Header */}
            <header className={styles.navHeader}>
                <div className="container">
                    <div className={styles.navContent}>
                        <Link href="/" className={styles.navLogo}>
                            <Image src="/chitko-logo.jpg" alt="Chitko Rasso" width={70} height={70} style={{ objectFit: 'contain' }} priority />
                        </Link>
                        <nav className={styles.navLinks}>
                            <Link href="/menu">Menu</Link>
                            <Link href="/cart">
                                🛒 Cart {getCartCount() > 0 && <span className={styles.cartBadge}>{getCartCount()}</span>}
                            </Link>
                            {isAuthenticated ? (
                                <div className={styles.userMenu}>
                                    <Link href="/profile" className={styles.profileLink}>👤 {user?.name}</Link>
                                    <button onClick={() => { logout(); showToast('Logged out successfully. See you soon! 👋', 'success'); }} className={styles.logoutBtn}>Logout</button>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" className={styles.loginLink}>Login</Link>
                                    <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>Our Story</h1>
                    <p className={styles.heroSubtitle}>The Journey of Authentic Saoji Flavours</p>
                </div>
            </section>

            {/* Story Section */}
            <section className={styles.storySection}>
                <div className="container">
                    <div className={styles.storyLayout}>
                        <div className={styles.storyImage}>
                            <Image
                                src="/chitko-logo.jpg"
                                alt="Chitko Rasso Logo"
                                width={600}
                                height={600}
                                style={{ objectFit: 'contain', borderRadius: '20px', background: '#000' }}
                                priority
                            />
                        </div>

                        <div className={styles.storyContent}>
                            <h2>OUR STORY:</h2>

                            <p>
                                Saoji cuisine is not gentle food. It is bold, smoky, and unapologetically spicy—
                                made for those who believe flavour should hit hard and stay with you.
                            </p>

                            <p>
                                At its core lies the Saoji masala: a dark red, fiery blend of slow-roasted red
                                chillies, black pepper, cloves, coriander seeds, coconut, and poppy seeds.
                                Ground patiently and cooked low and slow, this masala gives Saoji dishes
                                their signature deep colour, intense aroma, and raw home-made character.
                            </p>

                            <p>
                                For the people of Telangana, Saoji feels like a familiar fire with a different
                                accent. Just like our love for powerful gravies and real heat, Saoji delivers
                                spice with purpose—not only, not artificial, but layered and honest.
                            </p>

                            <p>
                                At Chitko Rasso, we bring this age-old home tradition into a refined cloud-
                                kitchen experience. Every dish is cooked fresh, roasted in authenticity, and
                                finished with care—keeping the rustic soul intact while elevating the craft.
                            </p>

                            <p className={styles.tagline}>
                                This is food for true spice lovers.<br />
                                Dark gravies. Roasted masalas. No shortcuts.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Concept Section */}
            <section className={styles.conceptSection}>
                <div className="container">
                    <h2>The Concept</h2>
                    <div className={styles.conceptGrid}>
                        <div className={styles.conceptCard}>
                            <div className={styles.conceptIcon}>🔥</div>
                            <h3>Authentic Saoji Masala</h3>
                            <p>Slow-roasted spices ground fresh daily for that signature deep, smoky flavor</p>
                        </div>

                        <div className={styles.conceptCard}>
                            <div className={styles.conceptIcon}>🍲</div>
                            <h3>Traditional Recipes</h3>
                            <p>Age-old recipes from Nagpur, perfected for the Hyderabad palate</p>
                        </div>

                        <div className={styles.conceptCard}>
                            <div className={styles.conceptIcon}>👨‍🍳</div>
                            <h3>Cloud Kitchen Excellence</h3>
                            <p>Fresh, hygienic preparation with modern efficiency and traditional soul</p>
                        </div>

                        <div className={styles.conceptCard}>
                            <div className={styles.conceptIcon}>🌶️</div>
                            <h3>For Spice Lovers</h3>
                            <p>Bold, unapologetic heat that stays with you—no shortcuts, just honest spice</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className={styles.valuesSection}>
                <div className="container">
                    <h2>Our Values</h2>
                    <div className={styles.valuesList}>
                        <div className={styles.valueItem}>
                            <span className={styles.valueIcon}>✓</span>
                            <div>
                                <h4>Authenticity First</h4>
                                <p>No artificial colors, no shortcuts—just real, traditional Saoji cooking</p>
                            </div>
                        </div>

                        <div className={styles.valueItem}>
                            <span className={styles.valueIcon}>✓</span>
                            <div>
                                <h4>Fresh & Hygienic</h4>
                                <p>FSSAI certified kitchen with strict quality and hygiene standards</p>
                            </div>
                        </div>

                        <div className={styles.valueItem}>
                            <span className={styles.valueIcon}>✓</span>
                            <div>
                                <h4>Made with Care</h4>
                                <p>Every dish cooked fresh to order, finished with attention to detail</p>
                            </div>
                        </div>

                        <div className={styles.valueItem}>
                            <span className={styles.valueIcon}>✓</span>
                            <div>
                                <h4>Customer Satisfaction</h4>
                                <p>Delivering not just food, but an authentic Saoji experience</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <h2>Ready to Experience Authentic Saoji?</h2>
                    <p>Order now and taste the bold flavors of tradition</p>
                    <div className={styles.ctaButtons}>
                        <Link href="/menu" className={styles.btnPrimary}>
                            View Menu
                        </Link>
                        <Link href="/cart" className={styles.btnSecondary}>
                            Order Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
