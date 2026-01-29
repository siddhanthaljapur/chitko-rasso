'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'user' | 'admin';
    loyaltyPoints?: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (name: string, email: string, phone: string, password?: string, otp?: string) => Promise<boolean>;
    adminLogin: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => void;
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
    addLoyaltyPoints: (amount: number) => void;
    requestOTP: (email: string, type?: 'login' | 'signup') => Promise<boolean>;
    verifyOTP: (email: string, code: string) => Promise<boolean>;
    loginWithOtp: (email: string, code: string) => Promise<boolean>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    // Sync NextAuth session with local User state
    useEffect(() => {
        if (session?.user) {
            setUser({
                id: (session.user as any).id,
                name: session.user.name || '',
                email: session.user.email || '',
                phone: (session.user as any).phone || '',
                role: (session.user as any).role || 'user',
                loyaltyPoints: 0,
            });
        } else {
            setUser(null);
        }
    }, [session]);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                // Expected auth errors (wrong password, user not found)
                if (result.error.includes("CredentialsSignin") || result.error.includes("Invalid")) {
                    console.warn("Login info:", "Invalid credentials");
                } else {
                    console.error("Login failed:", result.error);
                }
                return false;
            }
            return true;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    const signup = async (
        name: string,
        email: string,
        phone: string,
        password?: string,
        otp?: string
    ): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                const msg = data.message || "Signup failed";
                if (msg.includes("already exists")) {
                    console.warn("Signup info:", msg);
                } else {
                    console.error("Signup failed:", msg);
                }
                return false;
            }

            // Auto-login after successful signup
            if (password) {
                await login(email, password);
            } else if (otp) {
                // Auto-login for OTP users
                await loginWithOtp(email, otp);
            }
            return true;
        } catch (error) {
            console.error("Signup error:", error);
            return false;
        }
    };

    const adminLogin = async (username: string, password: string): Promise<boolean> => {
        let emailToUse = username;
        if (username === 'admin') emailToUse = 'admin@chitko.com';

        const result = await signIn('credentials', {
            redirect: false,
            email: emailToUse,
            password,
        });

        if (result?.ok) {
            return true;
        }
        return false;
    };

    const logout = async () => {
        await signOut({ redirect: false });
        setUser(null);
        router.push('/');
    };

    const updateProfile = (data: Partial<User>) => {
        if (!user) return;
        setUser({ ...user, ...data });
    };

    // Placeholder Stubs for now
    const changePassword = async (current: string, newPass: string) => true;
    const addLoyaltyPoints = (amount: number) => { };
    // OTP Methods
    const requestOTP = async (email: string, type: 'login' | 'signup' = 'login'): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/otp/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type }),
            });
            const data = await res.json();
            if (res.ok) return true;
            throw new Error(data.message);
        } catch (error: any) {
            const msg = error.message || "";
            // Don't log expected logic errors as system errors
            if (msg.includes("Account already exists") || msg.includes("Account not found")) {
                console.warn("Request OTP info:", msg);
            } else {
                console.error("Request OTP error:", error);
            }
            throw new Error(msg || "Failed to send OTP");
        }
    };

    const verifyOTP = async (email: string, code: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            if (res.ok) return data.valid;
            throw new Error(data.message);
        } catch (error: any) {
            const msg = error.message || "";
            // Don't log expected logic errors as system errors
            if (msg.includes("OTP expired") || msg.includes("Invalid OTP") || msg.includes("Account not found")) {
                console.warn("Verify OTP info:", msg);
            } else {
                console.error("Verify OTP error:", error);
            }
            return false;
        }
    };

    const loginWithOtp = async (email: string, code: string): Promise<boolean> => {
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                code,
            });

            if (result?.error) {
                console.error("OTP Login failed:", result.error);
                return false;
            }
            return true;
        } catch (error) {
            console.error("OTP Login error:", error);
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: status === 'authenticated',
                isAdmin: user?.role === 'admin',
                login,
                signup,
                adminLogin,
                logout,
                updateProfile,
                changePassword,
                addLoyaltyPoints,
                requestOTP,
                verifyOTP,
                loginWithOtp,
                loading: status === 'loading'
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
