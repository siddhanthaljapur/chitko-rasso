'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import OTPInput from '@/components/OTPInput';
import styles from '../login/login.module.css';

export default function SignupPage() {
    const router = useRouter();
    const { signup, requestOTP, verifyOTP } = useAuth();
    const { showToast } = useToast();

    // Method State
    const [signupMethod, setSignupMethod] = useState<'password' | 'otp'>('password');

    // Common State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Password State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // OTP State
    const [step, setStep] = useState<'details' | 'verify'>('details');
    const [isVerifying, setIsVerifying] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);

        const success = await signup(name, email, phone, password);

        if (success) {
            showToast('Account created successfully! Welcome to CHITKO RASSO! 🎉', 'success');
            setTimeout(() => router.push('/'), 500);
        } else {
            setError('Email already exists');
            showToast('Email already exists. Please use a different email.', 'error');
        }

        setLoading(false);
    };

    const handleOtpSignupRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Step 1: Request OTP
        try {
            setLoading(true);
            const success = await requestOTP(email, 'signup');
            setLoading(false);

            if (success) {
                setStep('verify');
                showToast(`OTP sent to ${email}`, 'success');
            }
        } catch (err: any) {
            setLoading(false);
            setError(err.message || 'Failed to send OTP');
        }
    };

    const handleOtpSignupVerify = async (code: string) => {
        setIsVerifying(true);
        setError('');

        // Verify OTP (Check validity before submitting)
        const isPhoneVerified = await verifyOTP(email, code);

        if (!isPhoneVerified) {
            setError('Invalid verification code');
            showToast('Invalid verification code', 'error');
            setIsVerifying(false);
            return;
        }

        // Proceed to Signup (Pass undefined for password, and code for OTP)
        const success = await signup(name, email, phone, undefined, code);

        if (success) {
            showToast('Account created successfully! Welcome to CHITKO RASSO! 🎉', 'success');
            setTimeout(() => router.push('/'), 500);
        } else {
            setError('User already exists');
            showToast('User already exists. Please try logging in.', 'error');
            setIsVerifying(false);
            setStep('details'); // Go back if email fails
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
                        <p className={styles.tagline}>Create your account</p>
                    </div>

                    <div className={styles.methodToggle}>
                        <button
                            className={signupMethod === 'password' ? styles.activeMethod : styles.method}
                            onClick={() => setSignupMethod('password')}
                        >
                            Create Password
                        </button>
                        <button
                            className={signupMethod === 'otp' ? styles.activeMethod : styles.method}
                            onClick={() => setSignupMethod('otp')}
                        >
                            Or Signup with OTP
                        </button>
                    </div>

                    {signupMethod === 'password' ? (
                        <form onSubmit={handlePasswordSignup} className={styles.loginForm}>
                            <h1>Sign Up</h1>

                            {error && <div className={styles.error}>{error}</div>}

                            <div className={styles.formGroup}>
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

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
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter your phone number"
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
                                    placeholder="Create a password (min 6 characters)"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.loginBtn} disabled={loading}>
                                {loading ? 'Creating account...' : 'Sign Up'}
                            </button>
                        </form>
                    ) : (
                        <div className={styles.loginForm}>
                            <h1>OTP Signup</h1>

                            {error && <div className={styles.error}>{error}</div>}

                            {step === 'details' ? (
                                <form onSubmit={handleOtpSignupRequest}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="name">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>

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
                                        <label htmlFor="phone">Phone Number (For Contact)</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Enter your phone number"
                                            pattern="[0-9]{10}"
                                            maxLength={10}
                                            required
                                        />
                                    </div>

                                    <button type="submit" className={styles.loginBtn} disabled={loading}>
                                        {loading ? 'Sending to Email...' : 'Get OTP & Sign Up'}
                                    </button>
                                </form>
                            ) : (
                                <div>
                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                        <p>Enter the code sent to</p>
                                        <strong>{email}</strong>
                                        <button
                                            onClick={() => setStep('details')}
                                            type="button"
                                            style={{ display: 'block', margin: '0.5rem auto', color: '#ff6b35', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            Change Details
                                        </button>
                                    </div>

                                    <OTPInput
                                        phone={email} // Reusing prop name
                                        onVerify={handleOtpSignupVerify}
                                        onResend={() => requestOTP(email, 'signup').then(success => success && showToast(`OTP resent to ${email}`, 'success'))}
                                        isVerifying={isVerifying}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.links}>
                        <p>
                            Already have an account? <Link href="/login">Login</Link>
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
