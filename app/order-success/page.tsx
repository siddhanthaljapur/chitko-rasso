'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LiveTracker from '@/components/OrderTracking/LiveTracker';
import styles from './success.module.css';

function SuccessContent() {
    const searchParams = useSearchParams();
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
                .catch(err => console.error('Error loading order:', err));
        }
    }, [orderId]);


    if (!order) {
        return (
            <div className={styles.successPage}>
                <div className="container">
                    <div className={styles.loadingState}>
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.successPage}>
            <div className={styles.successCard}>
                <div className={styles.successIcon}>✅</div>
                <h1>Order Placed Successfully!</h1>
                <p className={styles.subtitle}>Thank you for your order</p>

                <div className={styles.orderInfo}>
                    <div className={styles.orderNumber}>
                        <span>Order Number</span>
                        <strong>{order.orderNumber || order._id}</strong>
                    </div>
                </div>

                <div className={styles.deliveryInfo}>
                    <h3>📍 Delivery Address</h3>
                    <p><strong>{order.deliveryAddress.name}</strong></p>
                    <p>{order.deliveryAddress.phone}</p>
                    <p>{order.deliveryAddress.address}</p>
                    {order.deliveryAddress.landmark && <p>Landmark: {order.deliveryAddress.landmark}</p>}
                    <p>{order.deliveryAddress.city} - {order.deliveryAddress.pincode}</p>
                </div>

                <div className={styles.orderSummary}>
                    <h3>📦 Order Summary</h3>
                    <div className={styles.items}>
                        {order.items.map((item: any) => (
                            <div key={item.id} className={styles.item}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.totalRow}>
                        <span>Total Amount</span>
                        <strong>₹{order.total.toFixed(2)}</strong>
                    </div>
                    <div className={styles.paymentMethod}>
                        <span>Payment Method: </span>
                        <strong>{order.paymentMethod.toUpperCase()}</strong>
                    </div>
                </div>

                <LiveTracker orderId={order._id || order.id} initialStatus={order.status} />

                <div className={styles.actions}>
                    <Link href="/menu" className={styles.btnPrimary}>
                        Order More
                    </Link>
                    <Link href="/" className={styles.btnSecondary}>
                        Back to Home
                    </Link>
                </div>

                <div className={styles.contactInfo}>
                    <p>Need help? Contact us at <strong>+91 XXXXX XXXXX</strong></p>
                </div>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div>Loading order details...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
