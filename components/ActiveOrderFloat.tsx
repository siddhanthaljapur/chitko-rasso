'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import styles from './ActiveOrderFloat.module.css';

export default function ActiveOrderFloat() {
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const { user, isAuthenticated } = useAuth(); // Use Auth Context

    useEffect(() => {
        if (!isAuthenticated) {
            setActiveOrders([]);
            setIsVisible(false);
            return;
        }

        async function fetchActiveOrders() {
            try {
                const res = await fetch('/api/orders');
                if (res.ok) {
                    const allOrders = await res.json();
                    // Filter for active orders
                    const active = allOrders.filter((o: any) =>
                        o.status !== 'Delivered' && o.status !== 'Cancelled'
                    );

                    if (active.length > 0) {
                        setActiveOrders(active);
                        setIsVisible(true);
                    } else {
                        setIsVisible(false);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch active orders', error);
            }
        }

        fetchActiveOrders();
        // Constructing a simple poller (every 30s) to keep it fresh
        const interval = setInterval(fetchActiveOrders, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);


    if (!isVisible || activeOrders.length === 0) return null;

    if (isExpanded) {
        return (
            <div className={styles.container}>
                <div className={`${styles.content} ${styles.expanded}`}>
                    <div className={styles.header}>
                        <span className={styles.headerTitle}>Active Orders ({activeOrders.length})</span>
                        <button className={styles.closeBtn} onClick={() => setIsExpanded(false)}>▼</button>
                    </div>
                    <div className={styles.list}>
                        {activeOrders.map(order => (
                            <div key={order.orderNumber} className={styles.listItem}>
                                <div className={styles.listInfo}>
                                    <span className={styles.listId}>#{order.orderNumber}</span>
                                    <span className={styles.listStatus}>{order.status.toUpperCase()}</span>
                                </div>
                                <Link href={`/track?orderId=${order._id || order.id}`} className={styles.trackBtnSmall}>
                                    Track
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Default Compressed View (Shows latest + count)
    const latest = activeOrders[0];
    const othersCount = activeOrders.length - 1;

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.icon}>🛵</div>
                <div className={styles.info}>
                    <p className={styles.label}>
                        {othersCount > 0 ? `${othersCount + 1} Active Orders` : 'Order in Progress'}
                    </p>
                    <p className={styles.status}>
                        #{latest.orderNumber} • {latest.status.toUpperCase()}
                        {othersCount > 0 && <span className={styles.moreBadge} onClick={(e) => {
                            e.preventDefault();
                            setIsExpanded(true);
                        }}> +{othersCount} more</span>}
                    </p>
                </div>

                {othersCount > 0 ? (
                    <button className={styles.expandBtn} onClick={() => setIsExpanded(true)}>
                        View All
                    </button>
                ) : (
                    <Link href={`/track?orderId=${latest._id || latest.id}`} className={styles.trackBtn}>
                        Track
                    </Link>
                )}

                <button className={styles.closeBtn} onClick={() => setIsVisible(false)}>×</button>
            </div>
        </div>
    );
}
