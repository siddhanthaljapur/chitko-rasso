'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/lib/context/ToastContext';
import styles from './OrderSettings.module.css';

// Separate Config Key for general Order Automation
const ORDER_CONFIG_KEY = 'chitko_order_config';

export default function OrderSettings() {
    const { showToast } = useToast();
    const [config, setConfig] = useState({
        autoAccept: false,
        preferredPartner: 'UBER' // Default
    });

    useEffect(() => {
        const stored = localStorage.getItem(ORDER_CONFIG_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            setConfig({
                autoAccept: parsed.autoAccept || false,
                preferredPartner: parsed.preferredPartner || 'UBER'
            });
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem(ORDER_CONFIG_KEY, JSON.stringify(config));
        showToast('Order automation settings saved! 🤖', 'success');
        window.dispatchEvent(new Event('order-config-updated'));
    };

    return (
        <div className={styles.card} style={{ marginTop: '2rem' }}>
            <div className={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles.iconBox} style={{ background: '#fce7f3', borderColor: '#fbcfe8' }}>⚡</div>
                    <div>
                        <h2>Automation Rules</h2>
                        <p>Configure how orders are processed automatically</p>
                    </div>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={config.autoAccept}
                            onChange={(e) => setConfig({ ...config, autoAccept: e.target.checked })}
                            style={{ width: '24px', height: '24px', accentColor: '#ff6b35' }}
                        />
                        <strong>Auto-Accept & Auto-Assign</strong>
                    </label>
                    <p className={styles.hint} style={{ marginLeft: '2.5rem', marginBottom: '1rem' }}>
                        Automatically accepts new orders and books a rider immediately.
                    </p>

                    {/* NESTED OPTION */}
                    {config.autoAccept && (
                        <div style={{
                            marginLeft: '2rem',
                            marginTop: '0.5rem',
                            padding: '1.5rem',
                            background: '#fff7ed',
                            borderLeft: '4px solid #ff6b35',
                            borderRadius: '0 8px 8px 0'
                        }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ea580c' }}>
                                Found a new order! Who should I call? 📞
                            </label>
                            <select
                                value={config.preferredPartner}
                                onChange={(e) => setConfig({ ...config, preferredPartner: e.target.value })}
                                style={{
                                    padding: '0.75rem',
                                    border: '1px solid #fdba74',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    width: '100%',
                                    maxWidth: '300px',
                                    outline: 'none'
                                }}
                            >
                                <option value="UBER">Uber Direct (Motorcycle) 🛵</option>
                                <option value="OLA">Ola Delivery (Scooter/Bike) 🥎</option>
                            </select>
                            <p className={styles.hint}>
                                The system will instantly request a <strong>Rider</strong> from {config.preferredPartner === 'OLA' ? 'Ola' : 'Uber'}.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSave}>
                    Save Settings
                </button>
            </div>
        </div>
    );
}
