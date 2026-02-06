'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './FloatingOrderTracker.module.css';

export default function FloatingOrderTracker() {
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const checkActiveOrder = async () => {
            try {
                // Fetch user's orders
                const res = await fetch('/api/orders');
                if (res.ok) {
                    const orders = await res.json();
                    // Find the most recent order that's not delivered or cancelled
                    const inProgressOrder = orders.find((order: any) =>
                        order.status !== 'delivered' && order.status !== 'cancelled'
                    );
                    setActiveOrder(inProgressOrder);
                }
            } catch (error) {
                console.error('Failed to fetch active order:', error);
            }
        };

        checkActiveOrder();
        // Poll every 10 seconds for updates
        const interval = setInterval(checkActiveOrder, 10000);

        return () => clearInterval(interval);
    }, []);

    if (!activeOrder) return null;

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { icon: '📝', text: 'Order Received', color: '#3b82f6' };
            case 'preparing':
                return { icon: '👨‍🍳', text: 'Preparing', color: '#f59e0b' };
            case 'out_for_delivery':
                return { icon: '🛵', text: 'On the Way', color: '#10b981' };
            default:
                return { icon: '📦', text: 'Processing', color: '#6b7280' };
        }
    };

    const statusInfo = getStatusInfo(activeOrder.status);

    return (
        <div
            className={styles.floatingTracker}
            onClick={() => router.push(`/order-success?orderId=${activeOrder._id || activeOrder.id}`)}
        >
            <div className={styles.trackerContent}>
                <div className={styles.iconWrapper}>
                    <span className={styles.statusIcon}>{statusInfo.icon}</span>
                    <div className={styles.pulse} style={{ background: statusInfo.color }}></div>
                </div>
                <div className={styles.textContent}>
                    <div className={styles.statusText}>{statusInfo.text}</div>
                    <div className={styles.orderNumber}>Order #{activeOrder.orderNumber}</div>
                </div>
                <div className={styles.arrow}>→</div>
            </div>
        </div>
    );
}
