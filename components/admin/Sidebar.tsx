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
            {/* Mobile Header - Visible only on mobile */}
            <div className={styles.mobileHeader}>
                <button className={`${styles.toggleBtn} ${isOpen ? styles.hideToggle : ''}`} onClick={toggleSidebar}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <div className={styles.mobileTitleBlock}>
                    <span className={styles.mobileBrand}>CHITKO RASSO</span>
                    <span className={styles.mobileSubtitle}>Admin</span>
                </div>
            </div>
            <div className={`${styles.mobileOverlay} ${isOpen ? styles.open : ''}`} onClick={toggleSidebar} />

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2>CHITKO RASSO</h2>
                            <p>Admin Panel</p>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
                    </div>
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
