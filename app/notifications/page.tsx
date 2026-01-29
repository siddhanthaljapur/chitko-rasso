'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useNotifications } from '@/lib/context/NotificationContext';
import { useToast } from '@/lib/context/ToastContext';
import Navbar from '@/components/Navbar';
import styles from './notifications.module.css';

export default function NotificationsPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll, preferences, updatePreferences } = useNotifications();
    const [showSettings, setShowSettings] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const handleNotificationClick = (notification: any) => {
        markAsRead(notification.id);
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'order': return '📦';
            case 'promotion': return '🎉';
            case 'system': return '🔔';
            default: return '📬';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1>🔔 Notifications</h1>
                        {unreadCount > 0 && (
                            <p className={styles.unreadText}>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
                        )}
                    </div>
                    <div className={styles.actions}>
                        <button onClick={() => setShowSettings(true)} className={styles.settingsBtn}>
                            ⚙️ Settings
                        </button>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className={styles.markAllBtn}>
                                ✓ Mark All as Read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button onClick={clearAll} className={styles.clearAllBtn}>
                                🗑️ Clear All
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.notificationsList}>
                    {notifications.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>📭</div>
                            <h2>No notifications yet</h2>
                            <p>We'll notify you when there's something new!</p>
                            <Link href="/menu" className={styles.browseBtn}>
                                Browse Menu
                            </Link>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`${styles.notificationCard} ${!notification.read ? styles.unread : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className={styles.iconWrapper}>
                                    <span className={styles.icon}>{getNotificationIcon(notification.type)}</span>
                                    {!notification.read && <span className={styles.unreadDot}></span>}
                                </div>
                                <div className={styles.content}>
                                    <h3>{notification.title}</h3>
                                    <p>{notification.message}</p>
                                    <span className={styles.timestamp}>
                                        {formatTimestamp(notification.timestamp)}
                                    </span>
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                        showToast('Notification deleted', 'success');
                                    }}
                                    title="Delete notification"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Settings Modal */}
            {showSettings && (
                <div className={styles.modalOverlay} onClick={() => setShowSettings(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Notification Preferences</h3>
                            <button onClick={() => setShowSettings(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <h4>Order Updates</h4>
                                    <p>Get notified about your order status</p>
                                </div>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={preferences?.order ?? true}
                                        onChange={(e) => updatePreferences({ order: e.target.checked })}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>

                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <h4>Promotional Offers</h4>
                                    <p>Receive updates about discounts and deals</p>
                                </div>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={preferences?.promotion ?? true}
                                        onChange={(e) => updatePreferences({ promotion: e.target.checked })}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>

                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <h4>System Alerts</h4>
                                    <p>Important account and system notifications</p>
                                </div>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={preferences?.system ?? true}
                                        onChange={(e) => updatePreferences({ system: e.target.checked })}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
