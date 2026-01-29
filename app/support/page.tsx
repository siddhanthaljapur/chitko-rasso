'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useSupport } from '@/lib/context/SupportContext';
import { useAuth } from '@/lib/context/AuthContext';
import SupportTicketModal from '@/components/SupportTicketModal';
import SupportOrderTracker from '@/components/SupportOrderTracker';
import styles from './support.module.css';

export default function SupportPage() {
    const { getUserTickets } = useSupport();
    const { isAuthenticated } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTrackerOpen, setIsTrackerOpen] = useState(false);

    const tickets = getUserTickets();
    const activeTickets = tickets.filter(t => t.status !== 'Closed');

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Open': return styles.statusOpen;
            case 'In Progress': return styles.statusInProgress;
            case 'Resolved': return styles.statusResolved;
            case 'Closed': return styles.statusClosed;
            default: return styles.statusClosed;
        }
    };

    return (
        <div className={styles.supportPage}>
            <Navbar />
            <Breadcrumbs />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>How can we help you?</h1>
                    <p>Search for help topics, view FAQs, or contact our support team.</p>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="🔍  Search for questions keyworkds..."
                            className={styles.searchInput}
                        />
                    </div>
                </div>
            </section>

            <main className={`container ${styles.mainContent}`}>
                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    <div onClick={() => setIsTrackerOpen(true)} className={styles.actionCard}>
                        <div className={styles.actionIcon}>📦</div>
                        <h3 className={styles.actionTitle}>Track Order</h3>
                        <p className={styles.actionDesc}>Check status of your current order</p>
                    </div>
                    <Link href="/faq" className={styles.actionCard}>
                        <div className={styles.actionIcon}>❓</div>
                        <h3 className={styles.actionTitle}>FAQs</h3>
                        <p className={styles.actionDesc}>Find answers to common questions</p>
                    </Link>
                    <div onClick={() => setIsModalOpen(true)} className={styles.actionCard}>
                        <div className={styles.actionIcon}>🎫</div>
                        <h3 className={styles.actionTitle}>Raise Ticket</h3>
                        <p className={styles.actionDesc}>Report an issue with your order</p>
                    </div>
                </div>

                {/* My Tickets Section */}
                {isAuthenticated && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>My Support Tickets</h2>
                            <button onClick={() => setIsModalOpen(true)} className={styles.createTicketBtn}>
                                + New Ticket
                            </button>
                        </div>

                        <div className={styles.ticketsList}>
                            {tickets.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>You haven't raised any support tickets yet.</p>
                                </div>
                            ) : (
                                tickets.map((ticket) => (
                                    <div key={ticket.id} className={styles.ticketItem}>
                                        <div className={styles.ticketInfo}>
                                            <h4>{ticket.subject}</h4>
                                            <div className={styles.ticketMeta}>
                                                <span>#{ticket.id}</span>
                                                <span>•</span>
                                                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{ticket.category}</span>
                                            </div>
                                        </div>
                                        <div className={`${styles.statusBadge} ${getStatusClass(ticket.status)}`}>
                                            {ticket.status}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* Contact Options */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Contact Us Directly</h2>
                    <div className={styles.contactGrid}>
                        <div className={styles.contactCard}>
                            <div className={styles.contactIcon}>📞</div>
                            <div className={styles.contactContent}>
                                <h4>Phone Support</h4>
                                <p>Available 11:00 AM - 11:00 PM</p>
                                <a href="tel:+917780552110" className={styles.link}>+91 7780552110</a>
                            </div>
                        </div>
                        <div className={styles.contactCard}>
                            <div className={styles.contactIcon}>✉️</div>
                            <div className={styles.contactContent}>
                                <h4>Email Us</h4>
                                <p>We surely reply within 24 hours</p>
                                <a href="mailto:info@chitkrasso.com" className={styles.link}>info@chitkrasso.com</a>
                            </div>
                        </div>
                        <div className={styles.contactCard}>
                            <div className={styles.contactIcon}>📍</div>
                            <div className={styles.contactContent}>
                                <h4>Visit Us</h4>
                                <p>Secunderabad, Hyderabad</p>
                                <a href="https://maps.google.com" target="_blank" className={styles.link}>View on Map</a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />

            <SupportTicketModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {isTrackerOpen && (
                <SupportOrderTracker
                    onClose={() => setIsTrackerOpen(false)}
                />
            )}
        </div>
    );
}
