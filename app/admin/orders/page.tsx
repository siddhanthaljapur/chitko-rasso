'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { useNotifications } from '@/lib/context/NotificationContext';
import AdminSidebar from '@/components/admin/Sidebar';
import styles from './orders.module.css';
import dashboardStyles from '../dashboard/dashboard.module.css';

interface Order {
    _id?: string;
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone?: string; // Added field
    items: any[];
    total: number;
    status: string;
    createdAt: string;
}

export default function AdminOrdersPage() {
    const { isAdmin } = useAuth();
    const { showToast } = useToast();
    const { sendNotification } = useNotifications();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All'); // Today, Week, Month, All, Custom
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        async function fetchOrders() {
            try {
                // Fetch ALL orders
                setIsLoading(true);
                const res = await fetch('/api/orders');
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch orders');
                setIsLoading(false);
            }
        }
        fetchOrders();
    }, []);

    // Apply Filters
    useEffect(() => {
        // ... filtering logic (no api call needed here as we filter loaded data)
        let result = [...orders];

        // 1. Search (ID or Name)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.orderNumber.toLowerCase().includes(lowerQuery) ||
                o.customerName.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Status
        if (statusFilter !== 'All') {
            result = result.filter(o => o.status === statusFilter);
        }

        // 3. Date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === 'Today') {
            result = result.filter(o => {
                const orderDate = new Date(o.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime();
            });
        } else if (dateFilter === 'Week') {
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);
            result = result.filter(o => new Date(o.createdAt) >= lastWeek);
        } else if (dateFilter === 'Month') {
            const lastMonth = new Date(today);
            lastMonth.setDate(today.getDate() - 30);
            result = result.filter(o => new Date(o.createdAt) >= lastMonth);
        } else if (dateFilter === 'Custom' && customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999); // Include full end day

            result = result.filter(o => {
                const d = new Date(o.createdAt);
                return d >= start && d <= end;
            });
        }

        setFilteredOrders(result);
    }, [orders, searchQuery, statusFilter, dateFilter, customStartDate, customEndDate]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        // Optimistic UI Update
        const previousOrders = [...orders];
        const updatedOrders = orders.map(order =>
            (order.id === orderId || (order as any)._id === orderId) ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);

        try {
            const orderToUpdate = orders.find(o => o.id === orderId || (o as any)._id === orderId);
            const idToUse = (orderToUpdate as any)?._id || orderId;

            const res = await fetch(`/api/orders/${idToUse}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Failed to update');

            showToast(`Order status updated to ${newStatus}`, 'success');

            // Notify Customer (Optional: API might do this, but for now we also do it client side if needed?)
            // Actually, AutoPilot or Backend should handle notifications on status change.
        } catch (error) {
            setOrders(previousOrders); // Revert
            showToast('Failed to update status', 'error');
        }
    };

    // Derived Stats
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
    const pendingCount = filteredOrders.filter(o => o.status === 'pending').length;

    if (!isAdmin) {
        return <div className={dashboardStyles.dashboard}><p style={{ padding: '2rem' }}>Access Denied</p></div>;
    }

    return (
        <div className={dashboardStyles.dashboard}>
            <AdminSidebar />

            <main className={dashboardStyles.mainContent}>
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1>Order Management</h1>
                        <p>Track and manage customer orders</p>
                    </div>

                    <div className={styles.controls}>
                        {/* Quick Date Filters */}
                        <button
                            className={`${styles.filterBtn} ${dateFilter === 'All' ? styles.active : ''}`}
                            onClick={() => setDateFilter('All')}
                        >
                            All Time
                        </button>
                        <button
                            className={`${styles.filterBtn} ${dateFilter === 'Today' ? styles.active : ''}`}
                            onClick={() => setDateFilter('Today')}
                        >
                            Today
                        </button>
                        <button
                            className={`${styles.filterBtn} ${dateFilter === 'Week' ? styles.active : ''}`}
                            onClick={() => setDateFilter('Week')}
                        >
                            Last 7 Days
                        </button>
                        <button
                            className={`${styles.filterBtn} ${dateFilter === 'Month' ? styles.active : ''}`}
                            onClick={() => setDateFilter('Month')}
                        >
                            Last 30 Days
                        </button>
                    </div>
                </div>

                {/* Custom Date Range Picker - Only show if we want to add custom filter logic or always show it? 
                    For now keeping it simple: if user wants custom, we can add a toggle. 
                    Let's just show it if 'Date' filter is not one of the presets, or just added below.
                */}
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className={styles.dateFilter}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Custom Range:</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={customStartDate}
                            onChange={(e) => { setCustomStartDate(e.target.value); setDateFilter('Custom'); }}
                        />
                        <span>to</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={customEndDate}
                            onChange={(e) => { setCustomEndDate(e.target.value); setDateFilter('Custom'); }}
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>📦</div>
                        <div>
                            <div className={styles.statLabel}>Total Orders</div>
                            <div className={styles.statValue}>{filteredOrders.length}</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>💰</div>
                        <div>
                            <div className={styles.statLabel}>Total Revenue</div>
                            <div className={styles.statValue}>₹{totalRevenue.toFixed(2)}</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>📈</div>
                        <div>
                            <div className={styles.statLabel}>Avg. Order Value</div>
                            <div className={styles.statValue}>₹{averageOrderValue.toFixed(0)}</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>⏳</div>
                        <div>
                            <div className={styles.statLabel}>Pending</div>
                            <div className={styles.statValue}>{pendingCount}</div>
                        </div>
                    </div>
                </div>

                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <div className={styles.searchBox}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search by Order ID or Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>

                        <select
                            className={styles.statusSelect}
                            style={{ padding: '0.6rem', minWidth: '150px' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                                            <td style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                                <br />
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td>{order.customerName}</td>
                                            <td>
                                                <span title={order.items.map(i => i.name).join(', ')}>
                                                    {order.items.length} items
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>₹{order.total ? order.total.toFixed(2) : '0.00'}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles['status_' + order.status.toLowerCase().replace(/\s+/g, '_')]}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    className={styles.statusSelect}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="preparing">Preparing</option>
                                                    <option value="out_for_delivery">Out for Delivery</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className={styles.noResults}>
                                                <p>No orders found matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
