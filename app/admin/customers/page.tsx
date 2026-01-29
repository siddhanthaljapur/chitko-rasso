'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/Sidebar';
import styles from './customers.module.css';
import dashboardStyles from '../dashboard/dashboard.module.css';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CustomersPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session && !isAdmin) {
            router.push('/admin/login');
            return;
        }

        async function fetchCustomers() {
            try {
                const res = await fetch('/api/admin/users');
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Failed to fetch customers', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (isAdmin) {
            fetchCustomers();
        }
    }, [isAdmin, router, session]);

    if (isLoading || !isAdmin) {
        return <div className={dashboardStyles.loading}>Loading Customers...</div>;
    }

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery)
    );

    return (
        <div className={dashboardStyles.dashboard}>
            <AdminSidebar />
            <main className={dashboardStyles.mainContent}>
                <div className={styles.header}>
                    <h1>Customers ({users.length})</h1>
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Role</th>
                                <th>Loyalty Points</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user: any) => (
                                <tr key={user._id || user.id}>
                                    <td>
                                        <div className={styles.userName}>{user.name}</div>
                                        <div className={styles.userId}>ID: {(user._id || user.id).substring(0, 6)}...</div>
                                    </td>
                                    <td>
                                        <div className={styles.userEmail}>{user.email}</div>
                                        <div className={styles.userPhone}>{user.phone}</div>
                                    </td>
                                    <td>
                                        <span className={user.role === 'admin' ? styles.adminBadge : styles.userBadge}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.pointsBadge}>
                                            🪙 {user.loyaltyPoints || 0}
                                        </span>
                                    </td>
                                    <td>
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
