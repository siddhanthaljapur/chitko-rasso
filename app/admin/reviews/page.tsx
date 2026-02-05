'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useReviews, Review } from '@/lib/context/ReviewsContext';
import { useToast } from '@/lib/context/ToastContext';
import { useMenu } from '@/lib/hooks/useMenu';
import AdminSidebar from '@/components/admin/Sidebar';
import styles from '../dashboard/dashboard.module.css';

export default function AdminReviewsPage() {
    const router = useRouter();
    const { isAuthenticated, logout, isAdmin } = useAuth();
    const { reviews, deleteReview } = useReviews();
    const { menuItems } = useMenu();
    const { showToast } = useToast();
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            if (!isAdmin) {
                router.push('/admin/login');
            } else {
                setIsLoading(false);
            }
        }, 100);
    }, [isAdmin, router]);

    const handleLogout = () => {
        logout();
        localStorage.removeItem('isAdmin');
        router.push('/admin/login');
    };

    const handleDeleteReview = (id: string) => {
        deleteReview(id);
        showToast('Review deleted successfully', 'success');
        setDeleteConfirmId(null);
    };

    if (isLoading || !isAdmin) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div className={styles.dashboard}>
            <AdminSidebar />

            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h1>Review Moderation</h1>
                    <p>Manage all customer reviews</p>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{reviews.length}</div>
                        <div className={styles.statLabel}>Total Reviews</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>
                            {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                        </div>
                        <div className={styles.statLabel}>Average Rating</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>
                            {reviews.filter(r => r.rating === 5).length}
                        </div>
                        <div className={styles.statLabel}>5-Star Reviews</div>
                    </div>
                </div>

                {reviews.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>⭐</div>
                        <h3>No reviews yet</h3>
                        <p>Customer reviews will appear here</p>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Dish</th>
                                    <th>Customer</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(review => {
                                    const dish = menuItems.find(d => d.id === review.dishId);
                                    return (
                                        <tr key={review.id}>
                                            <td>{dish?.name || 'Unknown'}</td>
                                            <td>{review.userName}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <span key={star} style={{ color: star <= review.rating ? '#fbbf24' : '#d1d5db', fontSize: '1.2rem' }}>
                                                            ⭐
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ maxWidth: '300px' }}>{review.comment || 'No comment'}</td>
                                            <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    onClick={() => setDeleteConfirmId(review.id)}
                                                    className={styles.deleteBtn}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirmId && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3>Delete Review?</h3>
                            <p>Are you sure you want to delete this review? This action cannot be undone.</p>
                            <div className={styles.modalActions}>
                                <button onClick={() => setDeleteConfirmId(null)} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button onClick={() => handleDeleteReview(deleteConfirmId)} className={styles.confirmBtn}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
