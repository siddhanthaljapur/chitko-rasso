'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import AdminSidebar from '@/components/admin/Sidebar';
import { isKitchenOpen, setKitchenStatus } from '@/lib/kitchenUtils';
import styles from './dashboard.module.css';

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    items: any[];
    total: number;
    status: string;
    createdAt: string;
}

interface Customer {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    phone: string;
    role: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isAdmin, logout } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [stats, setStats] = useState({
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        totalCustomers: 0,
    });
    const [kitchenStatus, setKitchenStatusLocal] = useState('open');

    useEffect(() => {
        if (!isAdmin) {
            router.push('/admin/login');
            return;
        }

        // Load kitchen status
        async function fetchStatus() {
            try {
                const res = await fetch('/api/settings?key=kitchen_status');
                if (res.ok) {
                    const data = await res.json();
                    setKitchenStatusLocal(data.value || 'open');
                }
            } catch (e) {
                console.error('Failed to fetch status');
            }
        }
        fetchStatus();

        async function fetchData() {
            try {
                // Fetch Orders
                const ordersRes = await fetch('/api/orders');
                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setOrders(ordersData);
                }

                // Fetch Users
                const usersRes = await fetch('/api/admin/users');
                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setCustomers(usersData);
                }

                // Calculate stats after fetch
                // Note: We need to wait for data to be set, or calculate here directly
                // Ideally, we calculate stats on the backend, but frontend calc is fine for now
            } catch (error) {
                console.error('Dashboard Fetch Error:', error);
                showToast('Failed to load dashboard data', 'error');
            }
        }

        fetchData();

        // Polling for live updates (Important for admin dash)
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);

    }, [isAdmin, router]);

    // Recalculate stats whenever orders/customers change
    useEffect(() => {
        const today = new Date().toDateString();
        const todayOrders = orders.filter((o: Order) =>
            new Date(o.createdAt).toDateString() === today
        );

        // Active/Pending orders
        const pendingCount = orders.filter((o: Order) =>
            ['pending', 'preparing', 'out_for_delivery'].includes(o.status)
        ).length;

        setStats({
            todayOrders: todayOrders.length,
            todayRevenue: todayOrders.reduce((sum: number, o: Order) => sum + (o.total || 0), 0),
            pendingOrders: pendingCount,
            totalCustomers: customers.length,
        });
    }, [orders, customers]);


    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        // Ideally call API to update status
        // await fetch(`/api/orders/${orderId}`, { method: 'PUT', body: ... })

        // For now, optimistic update in UI only as we haven't built PUT /api/orders/[id] yet
        // But preventing localStorage write
        const updatedOrders = orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        // localStorage.setItem('chitko-orders', JSON.stringify(updatedOrders)); // REMOVED
        showToast(`Order status updated to ${newStatus} (Local UI only)`, 'success');
    };

    const handleLogout = () => {
        logout();
        showToast('Admin logged out successfully. Goodbye! 👋', 'success');
        router.push('/admin/login');
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <div className={styles.dashboard}>
            <AdminSidebar />

            {/* Main Content */}
            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>Dashboard</h1>
                    <p>Welcome back, {user?.name}!</p>
                </header>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📦</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Today's Orders</p>
                            <p className={styles.statValue}>{stats.todayOrders}</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>💰</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Today's Revenue</p>
                            <p className={styles.statValue}>₹{stats.todayRevenue.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>⏳</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Pending Orders</p>
                            <p className={styles.statValue}>{stats.pendingOrders}</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>👥</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Total Customers</p>
                            <p className={styles.statValue}>{stats.totalCustomers}</p>
                        </div>
                    </div>
                </div>

                {/* Store Control Section */}
                <div style={{ marginBottom: '3rem', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: '#1f2937' }}>Store Control</h2>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Enable or disable ordering for all customers</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                                fontWeight: '700',
                                padding: '0.4rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                background: kitchenStatus === 'open' ? '#ecfdf5' : '#fef2f2',
                                color: kitchenStatus === 'open' ? '#10b981' : '#ef4444',
                                border: `1px solid ${kitchenStatus === 'open' ? '#10b981' : '#ef4444'}`
                            }}>
                                {kitchenStatus === 'open' ? '🟢 OPEN FOR ORDERS' : '🔴 CLOSED FOR ORDERS'}
                            </span>
                            <button
                                onClick={async () => {
                                    const newStatus = kitchenStatus === 'open' ? 'closed' : 'open';
                                    try {
                                        const res = await fetch('/api/settings', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ key: 'kitchen_status', value: newStatus })
                                        });
                                        if (res.ok) {
                                            setKitchenStatusLocal(newStatus);
                                            // Also update local for immediate feedback in other components using the utils
                                            // setKitchenStatus(newStatus); // Deprecated utility usage
                                            showToast(`Store is now ${newStatus.toUpperCase()}! 🏪`, 'success');
                                        }
                                    } catch (e) {
                                        showToast('Failed to update status', 'error');
                                    }
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: kitchenStatus === 'open' ? '#ef4444' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {kitchenStatus === 'open' ? 'Close Kitchen' : 'Open Kitchen'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <section className={styles.ordersSection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>Recent Orders</h2>
                        <Link href="/admin/orders" style={{ color: '#ff6b35', textDecoration: 'none', fontWeight: 600 }}>
                            View All →
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <div className={styles.noOrders}>
                            <p>No orders yet. Orders will appear here once customers start placing them.</p>
                        </div>
                    ) : (
                        <div className={styles.ordersTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 10).map((order) => (
                                        <tr key={order.id}>
                                            <td><strong>{order.orderNumber}</strong></td>
                                            <td>{order.customerName}</td>
                                            <td>{order.items.length} items</td>
                                            <td>₹{order.total.toFixed(2)}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Registered Customers */}
                <section className={styles.ordersSection}>
                    <h2>Registered Customers</h2>

                    {customers.length === 0 ? (
                        <div className={styles.noOrders}>
                            <p>No registered customers yet. Customers who sign up will appear here.</p>
                        </div>
                    ) : (
                        <div className={styles.ordersTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer) => (
                                        <tr key={customer._id || customer.id}>
                                            <td><strong>#{String(customer._id || customer.id).slice(-6)}</strong></td>
                                            <td>{customer.name}</td>
                                            <td>{customer.email}</td>
                                            <td>{customer.phone}</td>
                                            <td>
                                                <span className={styles.roleBadge}>
                                                    {customer.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
