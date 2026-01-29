'use client';

import { useState } from 'react';
import { useSupport, SupportTicket } from '@/lib/context/SupportContext';
import styles from './SupportTicketModal.module.css';

interface SupportTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    prefillCategory?: SupportTicket['category'];
}

export default function SupportTicketModal({ isOpen, onClose, prefillCategory }: SupportTicketModalProps) {
    const { createTicket } = useSupport();
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<SupportTicket['category']>(prefillCategory || 'Order Issue');
    const [orderId, setOrderId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            createTicket({
                subject,
                description,
                category,
                orderId: orderId.trim() || undefined
            });

            // Reset form
            setSubject('');
            setDescription('');
            setCategory('Order Issue');
            setOrderId('');

            onClose();
            // In a real app, we'd show a toast here, but the parent component usually handles success feedback
        } catch (error) {
            console.error('Error creating ticket:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    ×
                </button>

                <h2 className={styles.title}>Raise a Support Ticket</h2>
                <p className={styles.subtitle}>We're here to help! Tell us what went wrong.</p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Issue Category</label>
                        <select
                            className={styles.select}
                            value={category}
                            onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                            required
                        >
                            <option value="Order Issue">Order Issue</option>
                            <option value="Payment">Payment</option>
                            <option value="Account">Account</option>
                            <option value="Feedback">Feedback</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Subject</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief summary of the issue"
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Order ID (Optional)</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="e.g. #ORD-12345"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide details..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                </form>
            </div>
        </div>
    );
}
