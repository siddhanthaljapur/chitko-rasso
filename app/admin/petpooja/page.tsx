'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { useNotifications } from '@/lib/context/NotificationContext';
import { useMenu } from '@/lib/hooks/useMenu';
import { uberService } from '@/lib/services/uber'; // Correct Import
import AdminSidebar from '@/components/admin/Sidebar';
import styles from './petpooja.module.css';

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone?: string;
    items: any[];
    total: number;
    status: string;
    createdAt: string;
    paymentMethod: string;
    paymentId?: string;
}

export default function PetPoojaPage() {
    const { isAdmin } = useAuth();
    const { showToast } = useToast();
    const { sendNotification } = useNotifications();
    const { menuItems, updateDish, toggleAvailability } = useMenu();

    // State
    const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [menuSearch, setMenuSearch] = useState('');

    // Refs for Auto-Accept to avoid stale closures in intervals
    const ordersRef = useRef<Order[]>([]);
    const autoAcceptRef = useRef(false);

    // Initial Load & Settings
    useEffect(() => {
        const loadSettings = () => {
            const stored = localStorage.getItem('chitko_order_config');
            if (stored) {
                const config = JSON.parse(stored);
                autoAcceptRef.current = config.autoAccept;
            }
        };
        loadSettings();
        window.addEventListener('order-config-updated', loadSettings);
        return () => window.removeEventListener('order-config-updated', loadSettings);
    }, []);

    // Helper to save orders
    const saveOrders = (newOrders: Order[]) => {
        setOrders(newOrders);
        ordersRef.current = newOrders;
        localStorage.setItem('chitko-orders', JSON.stringify(newOrders));
    };

    // Actions
    const updateStatus = async (orderId: string, status: string) => {
        // Find Order
        const currentOrders = ordersRef.current;
        const targetOrder = currentOrders.find(o => o.id === orderId);
        if (!targetOrder) return;

        // Optimistic Update
        let updatedOrder = { ...targetOrder, status };

        let riderMsg = "";

        // Uber Auto-Assign Trigger (Only when moving to Preparing/Accepted)
        if (status === 'preparing') {
            if (uberService.isAutoAssignEnabled()) {
                showToast('Contacting Uber Direct... 🛵', 'info');
                // Async call
                try {
                    const courier = await uberService.createDelivery(updatedOrder);
                    if (courier) {
                        updatedOrder = {
                            ...updatedOrder,
                            // @ts-ignore
                            courier: courier
                        };
                        riderMsg = `Uber Rider ${courier.name} assigned!`;
                        showToast(riderMsg, 'success');
                    }
                } catch (e) {
                    console.error("Uber Error", e);
                }
            }
        }

        const newOrders = currentOrders.map(o => o.id === orderId ? updatedOrder : o);
        saveOrders(newOrders);

        if (!riderMsg) showToast(`Order #${targetOrder.orderNumber} marked as ${status}`, 'success');

        // Notify User
        if (updatedOrder.customerPhone) {
            let message = '';
            switch (status) {
                case 'preparing':
                    message = `Order #${updatedOrder.orderNumber} Accepted! Kitchen is cooking. 🔥`;
                    if (riderMsg) message += ` ${riderMsg}`;
                    break;
                case 'out_for_delivery': message = `Rider is out with Order #${updatedOrder.orderNumber}! 🛵`; break;
                case 'delivered': message = `Order #${updatedOrder.orderNumber} Completed. Thanks!`; break;
            }
            if (message) sendNotification('sms', updatedOrder.customerPhone, message);
        }
    };

    // Load Data Loop
    useEffect(() => {
        // Clock
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Load Orders
        const checkOrders = () => {
            const saved = localStorage.getItem('chitko-orders');
            if (saved) {
                const parsed: Order[] = JSON.parse(saved);
                const sorted = parsed.reverse();

                // Normal Sync
                if (JSON.stringify(sorted) !== JSON.stringify(ordersRef.current)) {
                    setOrders(sorted);
                    ordersRef.current = sorted;
                }
            }
        };

        checkOrders();
        const poller = setInterval(checkOrders, 5000);

        return () => {
            clearInterval(timer);
            clearInterval(poller);
        }
    }, []);

    const selectedOrder = orders.find(o => o.id === selectedOrderId);

    // Filter Logic
    const filteredOrders = orders.filter(o => {
        if (filter === 'all') return o.status !== 'cancelled' && o.status !== 'delivered';
        if (filter === 'pending') return o.status === 'pending';
        if (filter === 'kitchen') return o.status === 'preparing';
        if (filter === 'delivery') return o.status === 'out_for_delivery';
        return true;
    });

    // Filter Menu
    const filteredMenu = menuItems.filter(item =>
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(menuSearch.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <AdminSidebar />

            <div className={styles.mainContent}>
                {/* Header */}
                <header className={styles.header}>
                    <div>
                        <h1>🖥️ PetPooja POS Terminal</h1>
                        <span style={{ opacity: 0.7 }}>Chitko Rasso - Secunderabad</span>
                    </div>

                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', gap: '1rem', background: '#333', padding: '0.25rem', borderRadius: '8px' }}>
                        <button
                            onClick={() => setActiveTab('orders')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeTab === 'orders' ? '#ff6b35' : 'transparent',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            📦 Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('menu')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeTab === 'menu' ? '#ff6b35' : 'transparent',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            🍽️ Menu Manager
                        </button>
                    </div>

                    <div className={styles.statsBar}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Auto-Accept</span>
                            <span className={styles.statValue} style={{ color: autoAcceptRef.current ? '#4ade80' : '#f87171', fontSize: '1rem' }}>
                                {autoAcceptRef.current ? 'ON' : 'OFF'}
                            </span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Pending KOTs</span>
                            <span className={styles.statValue} style={{ color: '#f59e0b' }}>
                                {orders.filter(o => o.status === 'pending').length}
                            </span>
                        </div>
                    </div>
                </header>

                {/* ORDERS VIEW */}
                {activeTab === 'orders' && (
                    <div className={styles.posGrid}>
                        {/* Left: Order List */}
                        <div className={styles.orderListPanel}>
                            <div className={styles.filterBar}>
                                <button
                                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    Active
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
                                    onClick={() => setFilter('pending')}
                                >
                                    Pending
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${filter === 'kitchen' ? styles.active : ''}`}
                                    onClick={() => setFilter('kitchen')}
                                >
                                    Kitchen
                                </button>
                            </div>

                            <div className={styles.ordersScroll}>
                                {filteredOrders.map(order => (
                                    <div
                                        key={order.id}
                                        className={`${styles.orderCard} ${selectedOrderId === order.id ? styles.selected : ''}`}
                                        onClick={() => setSelectedOrderId(order.id)}
                                    >
                                        <div className={styles.cardHeader}>
                                            <span className={styles.orderId}>#{order.orderNumber}</span>
                                            <span className={styles.orderTime}>
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={styles.cardDetails}>
                                            <span className={styles.customerName}>{order.customerName}</span>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className={styles.orderAmount}>₹{order.total}</div>
                                                <span className={`${styles.statusTag} ${styles[order.status]}`}>
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Active Order */}
                        <div className={styles.activeOrderPanel}>
                            {selectedOrder ? (
                                <>
                                    <div className={styles.kotHeader}>
                                        <div className={styles.kotTitle}>
                                            <h2>KOT #{selectedOrder.orderNumber}</h2>
                                            <p>{selectedOrder.items.length} Items • {selectedOrder.paymentMethod.toUpperCase()}</p>
                                        </div>
                                        <div className={styles.kotMeta}>
                                            <h3>Customer</h3>
                                            <p>{selectedOrder.customerName}</p>
                                            <p>{selectedOrder.customerPhone}</p>
                                        </div>
                                    </div>

                                    <div className={styles.kotItems}>
                                        {selectedOrder.items.map((item, i) => (
                                            <div key={i} className={styles.kotItemRow}>
                                                <span className={styles.itemName}>
                                                    <span className={styles.itemQty}>{item.quantity}</span>
                                                    {item.name}
                                                </span>
                                                <span>₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.kotFooter}>
                                        <div className={styles.billSummary}>
                                            Total: ₹{selectedOrder.total ? selectedOrder.total.toFixed(2) : '0.00'}
                                        </div>

                                        <div className={styles.actionGrid}>
                                            {selectedOrder.status === 'pending' && (
                                                <button className={`${styles.actionBtn} ${styles.btnAccept}`} onClick={() => updateStatus(selectedOrder.id, 'preparing')}>
                                                    ✅ Accept KOT
                                                </button>
                                            )}

                                            {(selectedOrder.status === 'preparing') && (
                                                <button className={`${styles.actionBtn} ${styles.btnReady}`} onClick={() => updateStatus(selectedOrder.id, 'out_for_delivery')}>
                                                    🥡 Food Ready
                                                </button>
                                            )}

                                            {selectedOrder.status === 'out_for_delivery' && (
                                                <button className={`${styles.actionBtn} ${styles.btnDispatch}`} onClick={() => updateStatus(selectedOrder.id, 'delivered')}>
                                                    🏁 Mark Delivered
                                                </button>
                                            )}

                                            <button className={`${styles.actionBtn} ${styles.btnPrint}`} onClick={() => window.print()}>
                                                🖨️ Print Bill
                                            </button>

                                            {selectedOrder.status === 'pending' && (
                                                <button className={`${styles.actionBtn} ${styles.btnCancel}`} onClick={() => updateStatus(selectedOrder.id, 'cancelled')}>
                                                    ❌ Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>Select an order from the list to view KOT details</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MENU MANAGER VIEW */}
                {activeTab === 'menu' && (
                    <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                        {/* (Same Menu Code as before) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Search dishes..."
                                value={menuSearch}
                                onChange={(e) => setMenuSearch(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    width: '300px'
                                }}
                            />
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1rem'
                        }}>
                            {filteredMenu.map(dish => (
                                <div key={dish.id} style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    border: dish.available ? '1px solid #e5e5e5' : '1px solid #fee2e2',
                                    opacity: dish.available ? 1 : 0.8
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{dish.name}</span>
                                        <span style={{ fontSize: '0.9rem', color: '#666' }}>{dish.category}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <b style={{ color: '#ff6b35' }}>₹</b>
                                        <input
                                            type="number"
                                            value={dish.price}
                                            onChange={(e) => updateDish({ ...dish, price: Number(e.target.value) })}
                                            style={{
                                                width: '80px',
                                                padding: '0.25rem',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #f0f0f0' }}>
                                        <button
                                            onClick={() => toggleAvailability(dish.id)}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '20px',
                                                border: 'none',
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                background: dish.available ? '#dcfce7' : '#fee2e2',
                                                color: dish.available ? '#166534' : '#991b1b'
                                            }}
                                        >
                                            {dish.available ? '🟢 Available' : '🔴 Sold Out'}
                                        </button>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>ID: {dish.id}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
