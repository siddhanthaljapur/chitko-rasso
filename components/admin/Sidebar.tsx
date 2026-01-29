'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import styles from './Sidebar.module.css';
import AutoPilot from './AutoPilot'; // Added

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        showToast('Admin logged out successfully. Goodbye! 👋', 'success');
        router.push('/admin/login');
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const navItems = [
        { href: '/admin/dashboard', label: '📊 Dashboard' },
        { href: '/admin/petpooja', label: '🖥️ PetPooja POS' }, // New POS Link
        { href: '/admin/orders', label: '📦 Orders' },
        { href: '/admin/analytics', label: '📈 Analytics' }, // Activated Link
        { href: '/admin/menu', label: '🍽️ Menu Management' },
        { href: '/admin/customers', label: '👥 Customers' },
        { href: '/admin/coupons', label: '🎟️ Coupons' },
        { href: '/admin/reviews', label: '⭐ Reviews' },
        { href: '/admin/tickets', label: '🎫 Support Tickets' },
        { href: '/admin/database', label: '🗄️ Database' }, // Added Database Viewer
        { href: '/admin/settings', label: '⚙️ Settings' },
    ];

    return (
        <>
            <button className={styles.toggleBtn} onClick={toggleSidebar}>
                ☰
            </button>
            <div className={`${styles.mobileOverlay} ${isOpen ? styles.open : ''}`} onClick={toggleSidebar} />

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <h2>CHITKO RASSO</h2>
                    <p>Admin Panel</p>
                </div>

                <nav className={styles.sidebarNav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={pathname === item.href ? styles.navItemActive : styles.navItem}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <AutoPilot />

                <div className={styles.sidebarFooter}>
                    <div className={styles.adminInfo}>
                        <p><strong>{user?.name}</strong></p>
                        <p>{user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        🚪 Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
