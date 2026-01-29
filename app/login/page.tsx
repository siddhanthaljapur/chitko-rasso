'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import OTPInput from '@/components/OTPInput';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login, requestOTP, verifyOTP, loginWithOtp } = useAuth();
    const { showToast } = useToast();
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

    // Password State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // OTP State
    // OTP State
    const [otpEmail, setOtpEmail] = useState('');
    const [step, setStep] = useState<'phone' | 'verify'>('phone');
    const [isVerifying, setIsVerifying] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Get redirect URL from query params
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const redirectUrl = searchParams?.get('redirect') || '/';

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await login(email, password);

        if (success) {
            showToast('Login successful! Welcome back! 🎉', 'success');
            setTimeout(() => router.push(redirectUrl), 500);
        } else {
            setError('Invalid email or password');
            showToast('Invalid email or password', 'error');
        }

        setLoading(false);
    };

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!otpEmail || !otpEmail.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const success = await requestOTP(otpEmail, 'login');
            setLoading(false);

            if (success) {
                setStep('verify');
                showToast(`OTP sent to ${otpEmail}`, 'success');
            }
        } catch (err: any) {
            setLoading(false);
            setError(err.message || 'Failed to send OTP');
        }
    };

    const handleVerifyOTP = async (code: string) => {
        setIsVerifying(true);
        setError('');

        const success = await loginWithOtp(otpEmail, code);

        if (success) {
            showToast('Login successful! Welcome back! 🎉', 'success');
            setTimeout(() => router.push(redirectUrl), 500);
        } else {
            setError('Invalid OTP or User not found');
            showToast('Login failed. Please check code or signup first.', 'error');
            setIsVerifying(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <div className={styles.logoSection}>
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
                        <p className={styles.tagline}>Welcome back!</p>
                    </div>

                    <div className={styles.methodToggle}>
                        <button
                            className={loginMethod === 'password' ? styles.activeMethod : styles.method}
                            onClick={() => setLoginMethod('password')}
                        >
                            Email & Password
                        </button>
                        <button
                            className={loginMethod === 'otp' ? styles.activeMethod : styles.method}
                            onClick={() => setLoginMethod('otp')}
                        >
                            Email & OTP
                        </button>
                    </div>

                    {loginMethod === 'password' ? (
                        <form onSubmit={handlePasswordLogin} className={styles.loginForm}>
                            <h1>Customer Login</h1>

                            {error && <div className={styles.error}>{error}</div>}

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
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
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.loginBtn} disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    ) : (
                        <div className={styles.loginForm}>
                            <h1>Login with Email OTP</h1>

                            {error && <div className={styles.error}>{error}</div>}

                            {step === 'phone' ? (
                                <form onSubmit={handleRequestOTP}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="otpEmail">Email Address</label>
                                        <input
                                            type="email"
                                            id="otpEmail"
                                            value={otpEmail}
                                            onChange={(e) => setOtpEmail(e.target.value)}
                                            placeholder="Enter your email address"
                                            required
                                        />
                                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                            We'll send you a 4-digit code.
                                        </p>
                                    </div>
                                    <button type="submit" className={styles.loginBtn} disabled={loading}>
                                        {loading ? 'Sending OTP...' : 'Get OTP'}
                                    </button>
                                </form>
                            ) : (
                                <div>
                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                        <p>Enter the code sent to</p>
                                        <strong>{otpEmail}</strong>
                                        <button
                                            onClick={() => setStep('phone')}
                                            style={{ display: 'block', margin: '0.5rem auto', color: '#ff6b35', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            Change Email
                                        </button>
                                    </div>

                                    <OTPInput
                                        phone={otpEmail} // Reusing prop name for now, logic internal handles string
                                        onVerify={handleVerifyOTP}
                                        onResend={() => requestOTP(otpEmail, 'login').then(success => success && showToast(`OTP resent to ${otpEmail}`, 'success'))}
                                        isVerifying={isVerifying}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.links}>
                        <p>
                            Don't have an account? <Link href="/signup">Sign up</Link>
                        </p>
                        <p>
                            Are you an admin? <Link href="/admin/login">Admin Login</Link>
                        </p>
                    </div>

                    <Link href="/" className={styles.backLink}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
