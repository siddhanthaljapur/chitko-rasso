'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    description: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    createdAt: string;
    orderId?: string;
    category: 'Order Issue' | 'Payment' | 'Account' | 'Feedback' | 'Other';
}

interface SupportContextType {
    tickets: SupportTicket[];
    createTicket: (ticket: Omit<SupportTicket, 'id' | 'userId' | 'status' | 'createdAt'>) => void;
    updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
    getTicketById: (id: string) => SupportTicket | undefined;
    getUserTickets: () => SupportTicket[];
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export function SupportProvider({ children }: { children: React.ReactNode }) {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const { user } = useAuth();

    // Load tickets from localStorage on mount
    useEffect(() => {
        const savedTickets = localStorage.getItem('chitko_support_tickets');
        if (savedTickets) {
            try {
                setTickets(JSON.parse(savedTickets));
            } catch (error) {
                console.error('Failed to parse support tickets:', error);
            }
        }
    }, []);

    // Save tickets to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('chitko_support_tickets', JSON.stringify(tickets));
    }, [tickets]);

    const createTicket = (ticketData: Omit<SupportTicket, 'id' | 'userId' | 'status' | 'createdAt'>) => {
        const newTicket: SupportTicket = {
            id: `TKT-${Date.now().toString().slice(-6)}`,
            userId: user?.id || 'guest', // Allow guests or use actual user ID
            status: 'Open',
            createdAt: new Date().toISOString(),
            ...ticketData
        };

        setTickets(prev => [newTicket, ...prev]);

        // Simulate a system response or auto-assignment if needed in future
    };

    const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, status } : t
        ));
    };

    const getTicketById = (id: string) => tickets.find(t => t.id === id);

    const getUserTickets = () => {
        if (!user) return [];
        return tickets.filter(t => t.userId === user.id);
    };

    return (
        <SupportContext.Provider value={{
            tickets,
            createTicket,
            updateTicketStatus,
            getTicketById,
            getUserTickets
        }}>
            {children}
        </SupportContext.Provider>
    );
}

export function useSupport() {
    const context = useContext(SupportContext);
    if (context === undefined) {
        throw new Error('useSupport must be used within a SupportProvider');
    }
    return context;
}
