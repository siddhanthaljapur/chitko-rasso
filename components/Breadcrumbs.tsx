'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

const routeLabels: { [key: string]: string } = {
    'menu': 'Our Menu',
    'cart': 'Shopping Cart',
    'profile': 'My Profile',
    'admin': 'Admin Dashboard',
    'coupons': 'Manage Coupons',
    'orders': 'Orders',
    'users': 'Users',
    'checkout': 'Checkout',
    'favorites': 'My Favorites',
    'login': 'Login',
    'signup': 'Sign Up',
    'order-success': 'Order Confirmed'
};

export default function Breadcrumbs() {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(segment => segment !== '');

    // Don't show on home page
    if (pathSegments.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <div className="container">
                <ol className={styles.list}>
                    <li className={styles.item}>
                        <Link href="/" className={styles.link}>Home</Link>
                    </li>
                    {pathSegments.map((segment, index) => {
                        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                        const isLast = index === pathSegments.length - 1;
                        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

                        return (
                            <li key={href} className={styles.item}>
                                <span className={styles.separator}>/</span>
                                {isLast ? (
                                    <span className={styles.current} aria-current="page">
                                        {label}
                                    </span>
                                ) : (
                                    <Link href={href} className={styles.link}>
                                        {label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </div>
        </nav>
    );
}
