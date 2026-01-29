'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import LiveTracker from '@/components/OrderTracking/LiveTracker';
import styles from './track.module.css';

function TrackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        if (orderId) {
            fetch(`/api/orders/${orderId}`)
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Order not found');
                })
                .then(data => setOrder(data))
                .catch(err => console.error('Error fetching order:', err));
        }
    }, [orderId]);


    if (!orderId) {
        return (
            <div className={styles.errorState}>
                <h2>No Order ID provided</h2>
                <button onClick={() => router.push('/profile')} className={styles.btn}>Go to My Orders</button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Finding your feast...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div className={styles.trackHeader}>
                <button onClick={() => router.back()} className={styles.backBtn}>← Back</button>
                <h1>Order Tracking</h1>
            </div>

            <div className={styles.trackLayout}>
                <div className={styles.trackerSide}>
                    <LiveTracker orderId={order.id} initialStatus={order.status} />
                </div>

                <div className={styles.detailsSide}>
                    <div className={styles.detailsCard}>
                        <h3>Order Details</h3>
                        <div className={styles.detailRow}>
                            <span>Order Number</span>
                            <strong>{order.orderNumber}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Date</span>
                            <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Items</span>
                            <strong>{order.items.length} dishes</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Total</span>
                            <strong>₹{order.total.toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className={styles.detailsCard}>
                        <h3>📍 Delivery To</h3>
                        <p><strong>{order.customerDetails?.name || order.deliveryAddress?.name}</strong></p>
                        <p>{order.customerDetails?.address?.address || order.deliveryAddress?.address}</p>
                        <p>{order.customerDetails?.address?.city || order.deliveryAddress?.city} - {order.customerDetails?.address?.pincode || order.deliveryAddress?.pincode}</p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function TrackPage() {
    return (
        <div className={styles.trackPage}>
            <Navbar />
            <Breadcrumbs />
            <Suspense fallback={<div className={styles.loadingState}>Loading...</div>}>
                <TrackContent />
            </Suspense>
        </div>
    );
}
