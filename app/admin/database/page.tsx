'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/Sidebar';
import styles from '../settings/settings.module.css'; // Reusing settings styles for consistency

export default function DatabasePage() {
    const { isAdmin } = useAuth();
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

    if (!isAdmin) return null;

    return (
        <div className={styles.container}>
            <AdminSidebar />

            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>💾 Database Health</h1>
                    <p>Live connection status and statistics</p>
                </header>

                <div className={styles.card} style={{ borderColor: '#bfdbfe', background: '#eff6ff' }}>
                    <div className={styles.cardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className={styles.iconBox} style={{ background: '#dbeafe', color: '#1d4ed8' }}>⚡</div>
                            <div>
                                <h2 style={{ color: '#1e3a8a' }}>System Status</h2>
                                <p style={{ color: '#1d4ed8' }}>Real-time metrics from MongoDB Atlas</p>
                            </div>
                        </div>
                        <div className={styles.toggleWrapper}>
                            {loading ? (
                                <span className={styles.statusLabel}>Checking...</span>
                            ) : (
                                <span className={styles.statusLabel} style={{ background: '#dcfce7', color: '#15803d' }}>
                                    {stats?.status || 'Unknown'} 🟢
                                </span>
                            )}
                        </div>
                    </div>

                    {!loading && stats && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                                <StatBox label="Total Orders" value={stats.counts?.orders} icon="📦" color="#3b82f6" />
                                <StatBox label="Customers" value={stats.counts?.users} icon="👥" color="#8b5cf6" />
                                <StatBox label="Menu Items" value={stats.counts?.menuItems} icon="🍔" color="#f59e0b" />
                                <StatBox label="Active Coupons" value={stats.counts?.coupons} icon="🎟️" color="#10b981" />
                                <StatBox label="Settings Docs" value={stats.counts?.settings} icon="⚙️" color="#64748b" />
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#1e40af' }}>Connection Details</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                    <strong style={{ color: '#6b7280' }}>Cluster Host:</strong>
                                    <span style={{ fontFamily: 'monospace' }}>{stats.host}</span>

                                    <strong style={{ color: '#6b7280' }}>Database Name:</strong>
                                    <span style={{ fontFamily: 'monospace' }}>{stats.name}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, icon, color }: any) {
    return (
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            borderTop: `4px solid ${color}`
        }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
            <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#1f2937', lineHeight: 1 }}>{value || 0}</h3>
            <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontWeight: 500 }}>{label}</p>
        </div>
    );
}
