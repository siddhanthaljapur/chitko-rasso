'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './ToastContext';

export interface Notification {
    id: string;
    type: 'order' | 'promotion' | 'system';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
    icon?: string;
}

export interface NotificationPreferences {
    order: boolean;
    promotion: boolean;
    system: boolean;
    email: boolean; // Simulation
    sms: boolean;   // Simulation
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    preferences: NotificationPreferences;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    sendNotification: (type: 'email' | 'sms', to: string, subject: string) => Promise<void>; // New simulation function
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
    updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { showToast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        order: true,
        promotion: true,
        system: true,
        email: true,
        sms: true
    });
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedNotifs = localStorage.getItem('chitko-notifications');
            const savedPrefs = localStorage.getItem('chitko-notification-prefs');

            if (savedNotifs) {
                setNotifications(JSON.parse(savedNotifs));
            }
            if (savedPrefs) {
                setPreferences(JSON.parse(savedPrefs));
            }
        } catch (error) {
            console.error('Error loading notification data:', error);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('chitko-notifications', JSON.stringify(notifications));
        }
    }, [notifications, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('chitko-notification-prefs', JSON.stringify(preferences));
        }
    }, [preferences, isLoaded]);

    const addNotification = (data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        // Check if notification type is enabled in preferences
        if (!preferences[data.type]) {
            return;
        }

        const newNotification: Notification = {
            ...data,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);

        // Show in-app toast for new notification
        showToast(data.title, 'info');
    };

    // Simulated Send Logic
    const sendNotification = async (type: 'email' | 'sms', to: string, subject: string) => {
        if (!preferences[type]) return; // Don't send if disabled

        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (type === 'email') {
            showToast(`📧 Email sent to ${to}: "${subject}"`, 'success');
        } else {
            showToast(`📱 SMS sent to ${to}: "${subject}"`, 'success');
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            setNotifications([]);
        }
    };

    const updatePreferences = (prefs: Partial<NotificationPreferences>) => {
        setPreferences(prev => ({ ...prev, ...prefs }));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                preferences,
                addNotification,
                sendNotification,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                clearAll,
                updatePreferences,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}
