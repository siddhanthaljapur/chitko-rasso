'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/context/ToastContext';
import styles from './PromoPopup.module.css';

export default function PromoPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        // Check local storage to see if already shown
        const hasSeenPromo = localStorage.getItem('chitko_has_seen_promo_v1');

        if (!hasSeenPromo) {
            // Show after 2.5 seconds
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('chitko_has_seen_promo_v1', 'true');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText('WELCOME50');
        showToast('Code WELCOME50 copied! 🎟️', 'success');
    };

    if (!isVisible) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={handleClose}>&times;</button>

                <div className={styles.icon}>🎁</div>

                <h2 className={styles.title}>
                    Welcome to <span className={styles.highlight}>Chitko Rasso!</span>
                </h2>

                <p className={styles.description}>
                    Get <span style={{ fontWeight: 'bold', color: '#2d3436' }}>50% OFF</span> your first authentic Saoji order. Treat yourself today!
                </p>

                <div className={styles.couponBox}>
                    <span className={styles.code}>WELCOME50</span>
                    <button className={styles.copyBtn} onClick={handleCopy}>
                        Copy Code
                    </button>
                </div>

                <Link href="/menu" className={styles.ctaBtn} onClick={handleClose}>
                    Order Now & Save
                </Link>
            </div>
        </div>
    );
}
