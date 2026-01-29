'use client';

import { useState } from 'react';
import { useSupport, SupportTicket } from '@/lib/context/SupportContext';
import AdminSidebar from '@/components/admin/Sidebar';
import styles from '../dashboard/dashboard.module.css';

export default function AdminTicketsPage() {
    const { tickets, updateTicketStatus } = useSupport();
    const [filterStatus, setFilterStatus] = useState<string>('All');

    const filteredTickets = filterStatus === 'All'
        ? tickets
        : tickets.filter(t => t.status === filterStatus);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return '#fee2e2'; // Red-100
            case 'In Progress': return '#fef3c7'; // Amber-100
            case 'Resolved': return '#d1fae5'; // Emerald-100
            case 'Closed': return '#f3f4f6'; // Gray-100
            default: return '#f3f4f6';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'Open': return '#dc2626';
            case 'In Progress': return '#d97706';
            case 'Resolved': return '#059669';
            case 'Closed': return '#4b5563';
            default: return '#4b5563';
        }
    };

    return (
        <div className={styles.dashboard}>
            <AdminSidebar />

            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h1>Support Tickets</h1>
                    <p>Manage customer inquiries and issues</p>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🎫</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Open Tickets</p>
                            <p className={styles.statValue}>
                                {tickets.filter(t => t.status === 'Open').length}
                            </p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>⏳</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>In Progress</p>
                            <p className={styles.statValue} style={{ color: '#d97706' }}>
                                {tickets.filter(t => t.status === 'In Progress').length}
                            </p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>✅</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Resolved Today</p>
                            <p className={styles.statValue} style={{ color: '#059669' }}>
                                {tickets.filter(t =>
                                    t.status === 'Resolved' &&
                                    activeToday(t.createdAt)
                                ).length}
                            </p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📂</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Total Tickets</p>
                            <p className={styles.statValue} style={{ color: '#4b5563' }}>
                                {tickets.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div style={{ margin: '2rem 0 1rem', display: 'flex', gap: '1rem' }}>
                    {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={filterStatus === status ? styles.activeChip : styles.inactiveChip}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Tickets Table */}
                <div className={styles.tableContainer}>
                    <div className={styles.ordersSection}>
                        <h2>All Tickets</h2>
                        <div className={styles.ordersTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Ticket ID</th>
                                        <th>Subject</th>
                                        <th>Category</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTickets.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                                No tickets found matching this filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTickets.map((ticket) => (
                                            <tr key={ticket.id}>
                                                <td><strong>{ticket.id}</strong></td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{ticket.subject}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {ticket.description}
                                                    </div>
                                                </td>
                                                <td>{ticket.category}</td>
                                                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '50px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            background: getStatusColor(ticket.status),
                                                            color: getStatusTextColor(ticket.status),
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <select
                                                        value={ticket.status}
                                                        onChange={(e) => updateTicketStatus(ticket.id, e.target.value as SupportTicket['status'])}
                                                        className={styles.statusSelect}
                                                    >
                                                        <option value="Open">Open</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Resolved">Resolved</option>
                                                        <option value="Closed">Closed</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function activeToday(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}
