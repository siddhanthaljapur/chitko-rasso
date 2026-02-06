'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import { useNotifications } from '@/lib/context/NotificationContext';
import { useToast } from '@/lib/context/ToastContext';
import { isKitchenOpen, getKitchenHoursString } from '@/lib/kitchenUtils';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { getCartCount } = useCart();
    const { unreadCount } = useNotifications();
    const { showToast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Scroll Direction Detection
    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 100) {
                    // Scrolling DOWN -> Hide
                    setIsVisible(false);
                } else {
                    // Scrolling UP -> Show
                    setIsVisible(true);
                }
                setLastScrollY(window.scrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    useEffect(() => {
        const checkStatus = async () => {
            const status = await isKitchenOpen();
            setIsOpen(status);
        };
        checkStatus();

        // Listen for storage changes to sync across tabs
        const handleStorageChange = async () => {
            const status = await isKitchenOpen();
            setIsOpen(status);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = () => {
        logout();
        showToast('Logged out successfully. See you soon! 👋', 'success');
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <header className={`${styles.navHeader} ${!isVisible ? styles.hidden : ''}`}>
            {!isOpen && (
                <div className={styles.closedBanner}>
                    <span>🌙 Kitchen is currently CLOSED and not accepting orders.</span>
                </div>
            )}
            <div className={styles.container}>
                <div className={styles.navContent}>
                    {/* Mobile Hamburger Menu Trigger (Left) */}
                    <div className={styles.mobileMenuTrigger} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </div>

                    <Link href="/" className={styles.navLogo}>
                        <Image src="/logo.jpg" alt="Chitko Rasso" width={60} height={60} style={{ objectFit: 'contain' }} priority />
                    </Link>

                    {/* Mobile Header Actions (Cart + Notifications) - Right */}
                    <div className={styles.mobileHeaderActions}>
                        <Link href="/cart" className={styles.notificationBell}>
                            🛒
                            {getCartCount() > 0 && <span className={styles.cartBadge}>{getCartCount()}</span>}
                        </Link>

                        {/* Notification Bell */}
                        <Link href="/notifications" className={styles.notificationBell}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            {unreadCount > 0 && <span className={styles.cartBadge}>{unreadCount}</span>}
                        </Link>

                        {isAuthenticated ? (
                            <Link href="/profile" className={styles.notificationBell}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </Link>
                        ) : (
                            <Link href="/login" className={styles.notificationBell}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                    <polyline points="10 17 15 12 10 7"></polyline>
                                    <line x1="15" y1="12" x2="3" y2="12"></line>
                                </svg>
                            </Link>
                        )}
                    </div>


                    <nav className={`${styles.navLinks} ${isMobileMenuOpen ? styles.active : ''}`}>
                        <Link href="/" className={isActive('/') ? styles.active : ''} onClick={() => setIsMobileMenuOpen(false)}>
                            Home
                        </Link>
                        <Link href="/menu" className={isActive('/menu') ? styles.active : ''} onClick={() => setIsMobileMenuOpen(false)}>
                            Menu
                        </Link>
                        <Link href="/cart" className={`${isActive('/cart') ? styles.active : ''} ${styles.navCart}`} onClick={() => setIsMobileMenuOpen(false)}>
                            🛒 Cart
                            {getCartCount() > 0 && <span className={styles.cartBadge}>{getCartCount()}</span>}
                        </Link>

                        {isAuthenticated && (
                            <Link href="/notifications" className={`${styles.notificationBell} ${styles.navBell} ${isActive('/notifications') ? styles.active : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                                🔔
                                {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <div className={styles.userMenu}>
                                <Link href="/profile" className={`${styles.profileLink} ${isActive('/profile') ? styles.active : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                                    👤 <span>{user?.name?.split(' ')[0]}</span>
                                </Link>
                                <Link href="/support" className={styles.profileLink} onClick={() => setIsMobileMenuOpen(false)}>
                                    ❓ Support
                                </Link>
                                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className={styles.logoutBtn}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className={styles.loginLink} onClick={() => setIsMobileMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link href="/signup" className={styles.signupBtn} onClick={() => setIsMobileMenuOpen(false)}>
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div >
        </header >
    );
}
