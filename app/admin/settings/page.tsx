'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import AdminSidebar from '@/components/admin/Sidebar';
import { petPoojaService } from '@/lib/services/petpooja';
import OrderSettings from '@/components/admin/OrderSettings'; // Added
import styles from './settings.module.css';

export default function SettingsPage() {
    const { isAdmin } = useAuth();
    const { showToast } = useToast();

    const [config, setConfig] = useState({
        enabled: false,
        restaurantId: '',
        apiKey: '',
        apiSecret: ''
    });

    useEffect(() => {
        const current = petPoojaService.getConfig();
        setConfig(current);
    }, []);

    const handleSave = () => {
        petPoojaService.saveConfig(config);
        showToast('Integration settings saved! 💾', 'success');

        if (config.enabled) {
            showToast('Live Mode Activated! Connecting to PetPooja... 🌍', 'success');
        } else {
            showToast('Switched to Simulation Mode 🎮', 'info');
        }
    };

    return (
        <div className={styles.container}>
            <AdminSidebar />

            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>⚙️ Settings & Integrations</h1>
                    <p>Manage external connections and system preferences</p>
                </header>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className={styles.iconBox}>🦄</div>
                            <div>
                                <h2>PetPooja POS Integration</h2>
                                <p>Connect your website directly to your physical store</p>
                            </div>
                        </div>
                        <div className={styles.toggleWrapper}>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={config.enabled}
                                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                                />
                                <span className={styles.slider}></span>
                            </label>
                            <span className={styles.statusLabel}>
                                {config.enabled ? 'LIVE MODE ON 🟢' : 'SIMULATION MODE 🟡'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Restaurant ID</label>
                            <input
                                type="text"
                                placeholder="e.g. res_12345"
                                value={config.restaurantId}
                                onChange={(e) => setConfig({ ...config, restaurantId: e.target.value })}
                                disabled={!config.enabled}
                            />
                            <p className={styles.hint}>Found in your PetPooja Dashboard URL</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>API Key</label>
                            <input
                                type="password"
                                placeholder="Your Secret API Key"
                                value={config.apiKey}
                                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                disabled={!config.enabled}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>API Secret (Optional)</label>
                            <input
                                type="password"
                                placeholder="Secondary Secret"
                                value={config.apiSecret}
                                onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                                disabled={!config.enabled}
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.saveBtn} onClick={handleSave}>
                            Save Settings
                        </button>

                        <a href="https://petpooja.com/developers" target="_blank" className={styles.linkBtn}>
                            View API Documentation ↗
                        </a>
                    </div>

                    {config.enabled && (
                        <div className={styles.debugBox}>
                            <h3>🔌 Connection Status</h3>
                            <div className={styles.statusRow}>
                                <span>Menu Sync</span>
                                <span className={styles.badgeSuccess}>Connected</span>
                            </div>
                            <div className={styles.statusRow}>
                                <span>Order Push</span>
                                <span className={styles.badgePending}>Waiting for Order</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* UBER INTEGRATION CARD */}
                <div className={styles.card} style={{ marginTop: '2rem' }}>
                    <UberSettings />
                </div>


                {/* OLA INTEGRATION CARD */}
                <div className={styles.card} style={{ marginTop: '2rem' }}>
                    <OlaSettings />
                </div>

                {/* Chang Password */}
                <ChangePasswordSettings />

                {/* Automation Rules */}
                <OrderSettings />
            </div>
        </div>
    );
}

// Sub-component for Uber Settings to keep main clean
function UberSettings() {
    const { showToast } = useToast();
    const [config, setConfig] = useState({
        enabled: false,
        clientId: '',
        clientSecret: '',
        customerId: '',
        autoAssign: false
    });

    useEffect(() => {
        // Load from Cloud API
        fetch('/api/settings?key=chitko_uber_config')
            .then(res => res.json())
            .then(data => {
                if (data.value) setConfig(data.value);
            });
    }, []);

    const handleSave = () => {
        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'chitko_uber_config', value: config })
        }).then(() => {
            showToast('Uber configuration saved to Cloud! ☁️', 'success');
        });
    };

    return (
        <>
            <div className={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles.iconBox} style={{ background: '#eff6ff', borderColor: '#dbeafe' }}>🛵</div>
                    <div>
                        <h2>Uber Direct Delivery</h2>
                        <p>Auto-assign riders when you accept an order</p>
                    </div>
                </div>
                <div className={styles.toggleWrapper}>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                        />
                        <span className={styles.slider}></span>
                    </label>
                    <span className={styles.statusLabel} style={{ color: config.enabled ? '#2563eb' : '#6b7280', background: config.enabled ? '#dbeafe' : '#f3f4f6' }}>
                        {config.enabled ? 'ACTIVE 🔵' : 'DISABLED ⚪'}
                    </span>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={config.autoAssign}
                            onChange={(e) => setConfig({ ...config, autoAssign: e.target.checked })}
                            disabled={!config.enabled}
                            style={{ width: '20px', height: '20px' }}
                        />
                        Automatically book rider when order is Accepted (Kitchen)
                    </label>
                    <p className={styles.hint}>If unchecked, you must manually assign a rider in the Orders page.</p>
                </div>

                <div className={styles.formGroup}>
                    <label>Uber Client ID</label>
                    <input
                        type="text"
                        value={config.clientId}
                        onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                        disabled={!config.enabled}
                        placeholder="Client ID"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Client Secret</label>
                    <input
                        type="password"
                        value={config.clientSecret}
                        onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                        disabled={!config.enabled}
                        placeholder="••••••••••••"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Customer ID (Optional)</label>
                    <input
                        type="text"
                        value={config.customerId}
                        onChange={(e) => setConfig({ ...config, customerId: e.target.value })}
                        disabled={!config.enabled}
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={() => {
                    localStorage.setItem('chitko_uber_config', JSON.stringify(config));
                    showToast('Uber configuration saved! 🛵', 'success');
                }}>
                    Save Settings
                </button>
            </div>
        </>
    );
}

// Promo Popup Settings Sub-component
function PromoSettings() {
    const { showToast } = useToast();
    const [config, setConfig] = useState({
        enabled: true,
        couponCode: 'WELCOME50',
        discountText: '50% OFF',
        title: 'Welcome to Chitko Rasso!',
        description: 'Get 50% OFF your first authentic Saoji order. Treat yourself today!'
    });

    useEffect(() => {
        fetch('/api/settings?key=chitko_promo_config')
            .then(res => res.json())
            .then(data => {
                if (data.value) setConfig(data.value);
            });
    }, []);

    const handleSave = () => {
        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'chitko_promo_config', value: config })
        }).then(() => {
            // Reset the "seen" status locally so admin can test
            localStorage.removeItem('chitko_has_seen_promo_v1');
            showToast('Promo settings saved to Cloud! ☁️', 'success');
        });
    };

    return (
        <div className={styles.card} style={{ marginTop: '2rem' }}>
            <div className={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles.iconBox} style={{ background: '#fdf2f8', borderColor: '#fbcfe8' }}>🎁</div>
                    <div>
                        <h2>Welcome Popup Settings</h2>
                        <p>Customize the first-visit promotional popup</p>
                    </div>
                </div>
                <div className={styles.toggleWrapper}>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                        />
                        <span className={styles.slider}></span>
                    </label>
                    <span className={styles.statusLabel} style={{ color: config.enabled ? '#db2777' : '#6b7280', background: config.enabled ? '#fce7f3' : '#f3f4f6' }}>
                        {config.enabled ? 'ACTIVE 🎁' : 'DISABLED ⚪'}
                    </span>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label>Coupon Code</label>
                    <input
                        type="text"
                        value={config.couponCode}
                        onChange={(e) => setConfig({ ...config, couponCode: e.target.value.toUpperCase() })}
                        disabled={!config.enabled}
                        placeholder="e.g. WELCOME50"
                        style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#db2777' }}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Discount Highlight</label>
                    <input
                        type="text"
                        value={config.discountText}
                        onChange={(e) => setConfig({ ...config, discountText: e.target.value })}
                        disabled={!config.enabled}
                        placeholder="e.g. 50% OFF"
                    />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Popup Title</label>
                    <input
                        type="text"
                        value={config.title}
                        onChange={(e) => setConfig({ ...config, title: e.target.value })}
                        disabled={!config.enabled}
                        placeholder="Main Title"
                    />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Description Message</label>
                    <textarea
                        value={config.description}
                        onChange={(e) => setConfig({ ...config, description: e.target.value })}
                        disabled={!config.enabled}
                        placeholder="Marketing message body..."
                        style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={() => {
                    localStorage.removeItem('chitko_has_seen_promo_v1'); // Reset for testing
                    handleSave();
                    showToast('Settings Saved & Viewed Reset! (Refresh Home to see)', 'success');
                }}>
                    Save & Test Popup
                </button>
            </div>
        </div>
    );
}

// Ola Settings Sub-component
function OlaSettings() {
    const { showToast } = useToast();
    const [config, setConfig] = useState({
        enabled: false,
        clientId: '',
        clientSecret: '',
        autoAssign: false
    });

    useEffect(() => {
        fetch('/api/settings?key=chitko_ola_config')
            .then(res => res.json())
            .then(data => {
                if (data.value) setConfig(data.value);
            });
    }, []);

    const handleSave = () => {
        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'chitko_ola_config', value: config })
        }).then(() => {
            showToast('Ola configuration saved to Cloud! ☁️', 'success');
        });
    };

    return (
        <>
            <div className={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles.iconBox} style={{ background: '#ecfccb', borderColor: '#d9f99d' }}>🥎</div>
                    <div>
                        <h2>Ola Delivery</h2>
                        <p>Electric scooters and bike delivery</p>
                    </div>
                </div>
                <div className={styles.toggleWrapper}>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                        />
                        <span className={styles.slider}></span>
                    </label>
                    <span className={styles.statusLabel} style={{ color: config.enabled ? '#65a30d' : '#6b7280', background: config.enabled ? '#ecfccb' : '#f3f4f6' }}>
                        {config.enabled ? 'ACTIVE 🟢' : 'DISABLED ⚪'}
                    </span>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={config.autoAssign}
                            onChange={(e) => setConfig({ ...config, autoAssign: e.target.checked })}
                            disabled={!config.enabled}
                            style={{ width: '20px', height: '20px' }}
                        />
                        Automatically book Ola Rider when order is Accepted (Kitchen)
                    </label>
                    <p className={styles.hint}>If unchecked, you must manually assign a rider in the Orders page.</p>
                </div>

                <div className={styles.formGroup}>
                    <label>Client ID</label>
                    <input
                        type="text"
                        value={config.clientId}
                        onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                        disabled={!config.enabled}
                        placeholder="Ola Client ID"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Client Secret</label>
                    <input
                        type="password"
                        value={config.clientSecret}
                        onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                        disabled={!config.enabled}
                        placeholder="••••••••••••"
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSave}>
                    Save Ola Settings
                </button>
            </div>
        </>
    );
}

// Change Password Sub-component
function ChangePasswordSettings() {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const checkPassword = async () => {
        if (!formData.currentPassword || !formData.newPassword) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        // Remove length validation here if causing issues, but backend checks it
        if (formData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                showToast('Password updated successfully! 🔒', 'success');
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showToast(data.message || 'Failed to update password', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.card} style={{ marginTop: '2rem', borderColor: '#e5e7eb' }}>
            <div className={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles.iconBox} style={{ background: '#f3f4f6', borderColor: '#e5e7eb', color: '#374151' }}>🔑</div>
                    <div>
                        <h2>Security</h2>
                        <p>Update your administrator password</p>
                    </div>
                </div>
                <div className={styles.toggleWrapper}>
                    <button
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            borderRadius: '6px'
                        }}
                    >
                        {showPassword ? '🐵 Hide Passwords' : '🙈 Show Passwords'}
                    </button>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label>Current Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        placeholder="••••••"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>New Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="New strong password"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Confirm New Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.saveBtn}
                    onClick={checkPassword}
                    disabled={loading}
                    style={{ background: '#374151' }}
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </div>
        </div>
    );
}

// Database Info Sub-component
function DatabaseInfo() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/database')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div className={styles.card}><p>Loading database stats...</p></div>;
    if (!stats) return null;

    return (
        <div className={styles.card} style={{ marginTop: '2rem', borderColor: '#bfdbfe', background: '#eff6ff' }}>
            <div className={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles.iconBox} style={{ background: '#dbeafe', color: '#1d4ed8' }}>💾</div>
                    <div>
                        <h2 style={{ color: '#1e3a8a' }}>Database Information</h2>
                        <p style={{ color: '#1d4ed8' }}>Live status from MongoDB Atlas</p>
                    </div>
                </div>
                <div className={styles.toggleWrapper}>
                    <span className={styles.statusLabel} style={{ background: '#dcfce7', color: '#15803d' }}>
                        {stats.status} 🟢
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#2563eb' }}>{stats.counts?.orders || 0}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Total Orders</p>
                </div>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#2563eb' }}>{stats.counts?.users || 0}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Customers</p>
                </div>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#2563eb' }}>{stats.counts?.menuItems || 0}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Menu Items</p>
                </div>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#2563eb' }}>{stats.counts?.coupons || 0}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Coupons</p>
                </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#93c5fd', textAlign: 'right' }}>
                Connected to: {stats.name} @ {stats.host}
            </div>
        </div>
    );
}
