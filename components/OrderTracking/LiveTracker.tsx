'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './LiveTracker.module.css';

interface LiveTrackerProps {
    orderId: string;
    initialStatus: string;
}

const statusMap: Record<string, number> = {
    'pending': 0,
    'preparing': 1,
    'out_for_delivery': 2,
    'delivered': 3,
    'cancelled': -1
};

const stages = [
    { label: 'Received', icon: '📝', status: 'pending' },
    { label: 'Preparing', icon: '👨‍🍳', status: 'preparing' },
    { label: 'On the Way', icon: '🛵', status: 'out_for_delivery' },
    { label: 'Delivered', icon: '🎁', status: 'delivered' }
];

import { petPoojaService } from '@/lib/services/petpooja';

// ... (imports)

export default function LiveTracker({ orderId, initialStatus }: LiveTrackerProps) {
    const [status, setStatus] = useState(initialStatus);
    const [courier, setCourier] = useState<any>(null); // Store courier info
    const [progress, setProgress] = useState(0);

    // Listen for storage changes AND Live API updates
    useEffect(() => {
        const checkStatus = async () => {
            // 1. Try Real API first (skip for specific props for now, assuming local simulation mainly)
            // const apiStatus = await petPoojaService.getOrderStatus(orderId);
            // if (apiStatus && apiStatus !== status) {
            //     setStatus(apiStatus);
            //     return;
            // }

            // 2. Main Source: Cloud API
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                if (res.ok) {
                    const currentOrder = await res.json();

                    if (currentOrder.status !== status) {
                        setStatus(currentOrder.status);
                    }

                    // Always sync courier
                    if (currentOrder.courier) {
                        const currentCourierStr = JSON.stringify(currentOrder.courier);
                        const stateCourierStr = JSON.stringify(courier);
                        if (currentCourierStr !== stateCourierStr) {
                            console.log("🛵 LiveTracker: New Courier Info Detected!", currentOrder.courier);
                            setCourier(currentOrder.courier);
                        }
                    }
                }
            } catch (e) { console.error("Tracker poll failed"); }
        };

        const handleStorageChange = () => checkStatus();

        window.addEventListener('storage', handleStorageChange);
        // Poll frequently for low-latency updates
        const interval = setInterval(checkStatus, 3000);

        // Initial check
        checkStatus();

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [orderId, status, courier]); // Dependencies

    useEffect(() => {
        const currentIdx = statusMap[status] ?? 0;
        if (currentIdx === -1) {
            setProgress(0);
        } else {
            // Calculate percentage: 0 -> 0%, 1 -> 33%, 2 -> 66%, 3 -> 100%
            setProgress((currentIdx / (stages.length - 1)) * 100);
        }
    }, [status]);

    const statusInfo = useMemo(() => {
        switch (status) {
            case 'pending':
                return { title: 'Order Received', desc: 'The kitchen is reviewing your Saoji feast!', icon: '📝' };
            case 'preparing':
                return { title: 'Chef is Cooking', desc: 'Adding the special hand-ground spices right now...', icon: '🔥' };
            case 'out_for_delivery':
                return { title: 'Out for Delivery', desc: 'Our partner is zooming your way with hot food!', icon: '🛵' };
            case 'delivered':
                return { title: 'Enjoy your Meal!', desc: 'Hope you love the authentic taste of Chitko Rasso.', icon: '🍽️' };
            case 'cancelled':
                return { title: 'Order Cancelled', desc: 'This order was cancelled. Please contact support.', icon: '❌' };
            default:
                return { title: 'Tracking Order', desc: 'Updating status...', icon: '📦' };
        }
    }, [status]);

    // Simulated Map Points for Animation
    // We'll move the vehicle along a path based on progress
    const vehiclePos = useMemo(() => {
        const pathLength = 100;
        const currentIdx = statusMap[status] ?? 0;

        if (currentIdx <= 1) return { x: 20, y: 80 }; // At Restaurant
        if (currentIdx >= 3) return { x: 80, y: 20 }; // At Customer

        // Mid-way (Out for delivery)
        return { x: 50, y: 50 };
    }, [status]);

    if (status === 'cancelled') {
        return (
            <div className={styles.trackerContainer}>
                <div className={styles.statusHeader} style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💔</div>
                    <h2>Order Cancelled</h2>
                    <p>We're sorry, this order couldn't be fulfilled.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.trackerContainer}>
            <div className={styles.statusHeader}>
                <h2>Track Your Feast</h2>
                <p>Order #{orderId.slice(-6).toUpperCase()}</p>
            </div>

            <div className={styles.progressSteps}>
                <div className={styles.progressBar} style={{ width: `calc(${progress}% - 2rem)` }} />
                {stages.map((stage, idx) => {
                    const stageIdx = statusMap[stage.status];
                    const currentIdx = statusMap[status];
                    const isCompleted = currentIdx > stageIdx;
                    const isActive = currentIdx === stageIdx;

                    return (
                        <div key={idx} className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                            <div className={styles.stepIcon}>
                                {isCompleted ? '✓' : stage.icon}
                            </div>
                            <span className={styles.stepLabel}>{stage.label}</span>
                        </div>
                    );
                })}
            </div>

            <div className={styles.mapSection}>
                <svg className={styles.mapSvg} viewBox="0 0 100 100">
                    {/* Background Paths */}
                    <path className={styles.road} d="M20 80 Q 40 80, 50 50 T 80 20" />

                    {/* Active Path (only if out for delivery or delivered) */}
                    <path
                        className={styles.roadActive}
                        d="M20 80 Q 40 80, 50 50 T 80 20"
                        style={{ strokeDashoffset: progress >= 66 ? 0 : (progress >= 33 ? 500 : 1000) }}
                    />

                    {/* Restaurant marker */}
                    <g className={styles.locationPin}>
                        <circle cx="20" cy="80" r="4" fill="#1f2937" />
                        <text x="15" y="92" fontSize="5" fontWeight="bold">CHITKO</text>
                    </g>

                    {/* Customer marker */}
                    <g className={styles.locationPin}>
                        <circle cx="80" cy="20" r="4" fill="#10b981" />
                        <text x="75" y="12" fontSize="5" fontWeight="bold">HOME</text>
                    </g>

                    {/* Delivery Vehicle (Simulated) */}
                    {status === 'out_for_delivery' && (
                        <g className={styles.vehicle} transform={`translate(${vehiclePos.x}, ${vehiclePos.y})`}>
                            <circle r="6" fill="#ff6b35" className={styles.pulse} />
                            <text x="-4" y="2" fontSize="8">🛵</text>
                        </g>
                    )}
                </svg>
            </div>

            <div className={styles.messageBox}>
                <div className={styles.messageIcon}>{statusInfo.icon}</div>
                <div className={styles.messageText}>
                    <div className={styles.messageTitle}>{statusInfo.title}</div>
                    <div className={styles.messageDesc}>{statusInfo.desc}</div>
                </div>
            </div>

            {/* RIDER DETAILS - Professional Zomato/Swiggy Style */}
            {courier && (status === 'preparing' || status === 'out_for_delivery') && (
                <div className={styles.riderCard}>
                    <div className={styles.riderAvatar}>
                        {courier.provider === 'OLA' ? '🥎' : '🛵'}
                    </div>
                    <div className={styles.riderInfo}>
                        <h4>{courier.name}</h4>
                        <p>{courier.provider === 'OLA' ? 'Ola Rider' : 'Uber Partner'} • {courier.vehicleType}</p>
                        <div className={styles.riderMeta}>
                            <span>⭐ 4.8</span>
                            <span>•</span>
                            <span>{courier.phone}</span>
                        </div>
                    </div>
                    <a href={courier.trackingUrl} target="_blank" className={styles.trackBtn}>
                        Track
                    </a>
                </div>
            )}
        </div>
    );
}
