'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import styles from './admin-login.module.css';

export default function AdminLoginPage() {
    const router = useRouter();
    const { adminLogin } = useAuth();
    const { showToast } = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await adminLogin(username, password);

        if (success) {
            showToast('Admin login successful! Welcome back! 🔐', 'success');
            setTimeout(() => router.push('/admin/dashboard'), 500);
        } else {
            setError('Invalid admin credentials');
            showToast('Invalid admin credentials', 'error');
        }

        setLoading(false);
    };

    return (
        <div className={styles.adminLoginPage}>
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <div className={styles.logoSection}>
                        <div className={styles.adminBadge}>🔐 ADMIN</div>
                        <Link href="/">
                            <Image
                                src="/chitko-logo.jpg"
                                alt="Chitko Rasso"
                                width={80}
                                height={80}
                                className={styles.logoImage}
                            />
                        </Link>
                        <Link href="/" className={styles.logo}>
                            CHITKO RASSO
                        </Link>
                        <p className={styles.tagline}>Admin Portal</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        <h1>Admin Login</h1>

                        {error && <div className={styles.error}>{error}</div>}



                        <div className={styles.formGroup}>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter admin username"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.loginBtn} disabled={loading}>
                            {loading ? 'Logging in...' : 'Admin Login'}
                        </button>

                        <div className={styles.links}>
                            <p>
                                Not an admin? <Link href="/login">Customer Login</Link>
                            </p>
                        </div>
                    </form>

                    <Link href="/" className={styles.backLink}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
