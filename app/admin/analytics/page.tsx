'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import RevenueChart from '@/components/admin/charts/RevenueChart';
import PopularItemsChart from '@/components/admin/charts/PopularItemsChart';
import OrderStatusChart from '@/components/admin/charts/OrderStatusChart';
import styles from '../dashboard/dashboard.module.css';

interface Order {
    id: string;
    total: number;
    status: string;
    items: any[];
    createdAt: string;
}

export default function AnalyticsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [timeRange, setTimeRange] = useState<string>('7d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    // Data for Charts
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [popularItems, setPopularItems] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                let query = `?range=${timeRange}`;
                if (timeRange === 'custom' && customStart && customEnd) {
                    query += `&start=${customStart}&end=${customEnd}`;
                }

                const res = await fetch(`/api/admin/analytics${query}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            }
        };

        fetchAnalytics();
    }, [timeRange, customStart, customEnd]); // Re-fetch when range changes

    // Remove client-side processing derived from effect, merge logic if needed or keep it separate.
    // Ideally, keeping the processing function is fine if the API returns raw orders.
    // The previous code had a separate effect for 'processAnalytics'. 
    // We can chain it or keep observing 'orders'.
    // Let's keep observing 'orders' to update charts.

    const processAnalytics = (allOrders: Order[], range: string) => {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        // Calculate Date Range
        switch (range) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case 'ytd':
                startDate = new Date(now.getFullYear(), 0, 1); // Jan 1st
                break;
            case 'custom':
                if (!customStart || !customEnd) return; // Wait for both inputs
                startDate = new Date(customStart);
                endDate = new Date(customEnd);
                endDate.setHours(23, 59, 59); // End of the day
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        const filteredOrders = allOrders.filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= startDate && orderDate <= endDate && o.status !== 'cancelled';
        });

        // 1. Revenue Data
        const revenueMap: Record<string, number> = {};

        // Helper: Format date as DD/MM
        const formatDate = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}`;

        // Initialize revenue map based on range length
        const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        // Limit points for very long ranges (e.g. over 60 days) to avoid overcrowding
        // For simplicity, we'll show daily for < 90 days, or maybe filter? 
        // Recharts handles crowding okay on XAxis usually, but let's just do daily for now.

        for (let i = 0; i <= dayDiff; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            if (d <= endDate) {
                revenueMap[formatDate(d)] = 0;
            }
        }

        filteredOrders.forEach(order => {
            const d = new Date(order.createdAt);
            const dateStr = formatDate(d);
            // Only add if it falls within our generated keys (it should, but safety check)
            if (revenueMap[dateStr] !== undefined) {
                revenueMap[dateStr] += order.total;
            }
        });

        const revData = Object.keys(revenueMap).map(date => ({
            date,
            revenue: revenueMap[date]
        }));
        // Sort by date components if needed, but the loop generation order preserves it mostly?
        // Actually object keys iteration order isn't guaranteed to be insertion order for non-integer keys, 
        // but typically is. Safer to re-sort or use array. Let's fix generation:

        // Better approach for ordered array:
        const revDataArray = [];
        for (let i = 0; i <= dayDiff; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);

            if (d > endDate) break;

            const dateKey = formatDate(d);
            // Find orders for this specific day
            const dailyTotal = filteredOrders
                .filter(o => formatDate(new Date(o.createdAt)) === dateKey)
                .reduce((sum, o) => sum + o.total, 0);

            revDataArray.push({
                date: dateKey,
                revenue: dailyTotal
            });
        }
        setRevenueData(revDataArray);

        // 2. Popular Items
        const itemCounts: Record<string, number> = {};
        filteredOrders.forEach(order => {
            order.items.forEach((item: any) => {
                itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
            });
        });

        const sortedItems = Object.entries(itemCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));
        setPopularItems(sortedItems);

        // 3. Order Status (All time or Filtered? Ideally Filtered for analytics consistency)
        // User might expect "All Time" for status normally, but in an analytics dashboard with a date filter,
        // it usually implies "Status of orders within this period". Let's stick to filtered.
        const statusCounts: Record<string, number> = {};
        filteredOrders.forEach(order => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });
        const statData = Object.entries(statusCounts).map(([name, value]) => ({
            name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value
        }));
        setStatusData(statData);

        // 4. Summary
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
        setSummary({
            totalRevenue,
            totalOrders: filteredOrders.length,
            avgOrderValue: filteredOrders.length ? totalRevenue / filteredOrders.length : 0
        });
    };

    return (
        <div className={styles.dashboard}>
            <AdminSidebar />

            <main className={styles.mainContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 className={styles.headerTitle}>Analytics Dashboard</h1>
                        <p className={styles.headerDesc}>Insights into your business performance</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            style={{
                                padding: '0.5rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                color: '#374151',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 3 Months</option>
                            <option value="ytd">Year to Date (YTD)</option>
                            <option value="custom">Custom Range</option>
                        </select>

                        {timeRange === 'custom' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className={styles.dateInput}
                                    style={{ padding: '0.4rem', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                                />
                                <span style={{ color: '#6b7280' }}>to</span>
                                <input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className={styles.dateInput}
                                    style={{ padding: '0.4rem', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#ecfdf5', color: '#10b981' }}>💰</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Total Revenue</p>
                            <p className={styles.statValue}>₹{summary.totalRevenue.toFixed(0)}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#fff7ed', color: '#f59e0b' }}>📦</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Total Orders</p>
                            <p className={styles.statValue}>{summary.totalOrders}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>📈</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Avg. Order Value</p>
                            <p className={styles.statValue}>₹{summary.avgOrderValue.toFixed(0)}</p>
                        </div>
                    </div>
                </div>

                {/* Main Charts */}
                <div style={{ marginBottom: '2rem' }}>
                    <RevenueChart data={revenueData} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                    <PopularItemsChart data={popularItems} />
                    <OrderStatusChart data={statusData} />
                </div>
            </main>
        </div>
    );
}
