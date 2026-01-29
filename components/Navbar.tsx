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
        <header className={styles.navHeader}>
            {!isOpen && (
                <div className={styles.closedBanner}>
                    <span>🌙 Kitchen is currently CLOSED and not accepting orders.</span>
                </div>
            )}
            <div className={styles.container}>
                <div className={styles.navContent}>
                    <Link href="/" className={styles.navLogo}>
                        <Image src="/logo.jpg" alt="Chitko Rasso" width={60} height={60} style={{ objectFit: 'contain' }} priority />
                    </Link>

                    <nav className={styles.navLinks}>
                        <Link href="/" className={isActive('/') ? styles.active : ''}>
                            Home
                        </Link>
                        <Link href="/menu" className={isActive('/menu') ? styles.active : ''}>
                            Menu
                        </Link>
                        <Link href="/cart" className={isActive('/cart') ? styles.active : ''}>
                            🛒 Cart
                            {getCartCount() > 0 && <span className={styles.cartBadge}>{getCartCount()}</span>}
                        </Link>



                        {isAuthenticated && (
                            <Link href="/notifications" className={`${styles.notificationBell} ${isActive('/notifications') ? styles.active : ''}`}>
                                🔔
                                {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <div className={styles.userMenu}>
                                <Link href="/profile" className={`${styles.profileLink} ${isActive('/profile') ? styles.active : ''}`}>
                                    👤 <span>{user?.name?.split(' ')[0]}</span>
                                </Link>
                                <Link href="/support" className={styles.profileLink}>
                                    ❓
                                </Link>
                                <button onClick={handleLogout} className={styles.logoutBtn}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className={styles.loginLink}>
                                    Login
                                </Link>
                                <Link href="/signup" className={styles.signupBtn}>
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
