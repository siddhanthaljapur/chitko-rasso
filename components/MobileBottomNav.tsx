'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import { usePathname } from 'next/navigation';
import styles from './MobileBottomNav.module.css';

export default function MobileBottomNav() {
    const { isAuthenticated } = useAuth();
    const { getCartCount } = useCart();
    const pathname = usePathname();

    // Don't show on admin pages
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <div className={styles.mobileBottomNav}>
            <Link href="/" className={pathname === '/' ? styles.active : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home</span>
            </Link>

            <Link href="/menu" className={pathname === '/menu' ? styles.active : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span>Menu</span>
            </Link>

            <Link href="/cart" className={pathname === '/cart' ? styles.active : ''} style={{ position: 'relative' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {getCartCount() > 0 && <span className={styles.cartBadge}>{getCartCount()}</span>}
                <span>Cart</span>
            </Link>

            {isAuthenticated ? (
                <Link href="/profile" className={pathname === '/profile' ? styles.active : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Profile</span>
                </Link>
            ) : (
                <>
                    <Link href="/login" className={pathname === '/login' ? styles.active : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        <span>Login</span>
                    </Link>

                    <Link href="/signup" className={pathname === '/signup' ? styles.active : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        <span>Sign Up</span>
                    </Link>
                </>
            )}
        </div>
    );
}
