'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import LiveTracker from '@/components/OrderTracking/LiveTracker';
import styles from '../app/support/support.module.css';

interface Order {
    _id?: string;
    id: string;
    orderNumber: string;
    customerName: string;
    items: any[];
    total: number;
    status: string;
    createdAt: string;
    deliveryAddress: any;
}

interface SupportOrderTrackerProps {
    onClose: () => void;
}

export default function SupportOrderTracker({ onClose }: SupportOrderTrackerProps) {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (user) {
            const loadData = async () => {
                try {
                    const res = await fetch('/api/orders');
                    if (!res.ok) return;
                    const allOrders = await res.json();

                    const userOrders = allOrders.filter((order: any) =>
                        order.customerName === user.name ||
                        (order.deliveryAddress && order.deliveryAddress.phone === user.phone)
                    );
                    setOrders(userOrders.reverse());
                } catch (e) { console.error(e); }
            };
            loadData();
        }
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Placed':
            case 'Confirmed': return '#fee2e2';
            case 'Preparation': return '#fef3c7';
            case 'Out for Delivery': return '#d1fae5';
            case 'Delivered': return '#f3f4f6';
            case 'Cancelled': return '#fce4ec';
            default: return '#f3f4f6';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'Placed':
            case 'Confirmed': return '#dc2626';
            case 'Preparation': return '#d97706';
            case 'Out for Delivery': return '#059669';
            case 'Delivered': return '#4b5563';
            case 'Cancelled': return '#c2185b';
            default: return '#4b5563';
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                <button className={styles.closeButton} onClick={onClose}>×</button>

                {!selectedOrder ? (
                    <>
                        <h2 className={styles.title}>Track Your Order</h2>
                        <p className={styles.subtitle}>Select an order to view live tracking.</p>

                        <div className={styles.ticketsList} style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {orders.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>No recent orders found.</p>
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div
                                        key={order.id}
                                        className={styles.ticketItem}
                                        onClick={() => setSelectedOrder(order)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={styles.ticketInfo}>
                                            <h4 style={{ fontWeight: 'bold' }}>Order #{order.orderNumber}</h4>
                                            <div className={styles.ticketMeta}>
                                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{order.items.length} Items</span>
                                                <span>•</span>
                                                <span style={{ color: '#1f2937', fontWeight: '600' }}>₹{order.total ? order.total.toFixed(2) : '0.00'}</span>
                                            </div>
                                        </div>
                                        <div
                                            className={styles.statusBadge}
                                            style={{
                                                backgroundColor: getStatusColor(order.status),
                                                color: getStatusTextColor(order.status)
                                            }}
                                        >
                                            {order.status.replace(/_/g, ' ')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    marginRight: '0.5rem',
                                    fontSize: '1.2rem',
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ←
                            </button>
                            <h2 className={styles.title} style={{ margin: 0 }}>Order #{selectedOrder.orderNumber}</h2>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {/* LIVE TRACKER INTEGRATION */}
                            <div style={{ marginBottom: '2rem' }}>
                                <LiveTracker orderId={selectedOrder.id} initialStatus={selectedOrder.status} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>Order Items</h4>
                                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} style={{
                                                padding: '0.75rem 1rem',
                                                borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #f3f4f6' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: '0.95rem'
                                            }}>
                                                <span>{item.quantity}x {item.name}</span>
                                                <span style={{ color: '#6b7280' }}>₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            background: '#f9fafb',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontWeight: 'bold',
                                            borderTop: '1px solid #e5e7eb'
                                        }}>
                                            <span>Total</span>
                                            <span>₹{selectedOrder.total ? selectedOrder.total.toFixed(2) : '0.00'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>Delivery Details</h4>
                                    <div style={{
                                        padding: '1rem',
                                        background: '#f9fafb',
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                        color: '#4b5563',
                                        lineHeight: '1.5'
                                    }}>
                                        <p><strong>{selectedOrder.deliveryAddress.name}</strong></p>
                                        <p>{selectedOrder.deliveryAddress.addressLine1}</p>
                                        <p>{selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}</p>
                                        <p>Phone: {selectedOrder.deliveryAddress.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
