'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './OTPInput.module.css';

interface OTPInputProps {
    length?: number;
    phone: string;
    onVerify: (code: string) => void;
    onResend: () => void;
    isVerifying: boolean;
}

export default function OTPInput({
    length = 4,
    phone,
    onVerify,
    onResend,
    isVerifying
}: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    const [timeLeft, setTimeLeft] = useState(30); // 30s cooldown
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }

        // Timer for resend
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1); // Only take last char
        setOtp(newOtp);

        // Move to next input
        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto verify if complete
        const code = newOtp.join('');
        if (code.length === length && index === length - 1) {
            onVerify(code);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle Backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        onResend();
        setTimeLeft(30);
        setOtp(new Array(length).fill(''));
        inputRefs.current[0]?.focus();
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputGroup}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={styles.digitInput}
                        disabled={isVerifying}
                    />
                ))}
            </div>

            <div className={styles.timer}>
                {timeLeft > 0 ? (
                    <span>Resend OTP in 00:{timeLeft.toString().padStart(2, '0')}</span>
                ) : (
                    <button
                        onClick={handleResend}
                        className={styles.resendBtn}
                        type="button"
                    >
                        Resend OTP
                    </button>
                )}
            </div>

            <button
                onClick={() => onVerify(otp.join(''))}
                disabled={otp.join('').length !== length || isVerifying}
                className={styles.verifyBtn}
            >
                {isVerifying ? 'Verifying...' : 'Verify & Proceed'}
            </button>
        </div>
    );
}
