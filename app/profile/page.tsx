'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { useCart } from '@/lib/context/CartContext';
import { useAddresses, Address } from '@/lib/context/AddressContext';
import { useToast } from '@/lib/context/ToastContext';
import { useReviews } from '@/lib/context/ReviewsContext';
import { useNotifications } from '@/lib/context/NotificationContext';
import { useMenu } from '@/lib/hooks/useMenu';
import ReviewModal from '@/components/ReviewModal';
import OrderRatingModal from '@/components/OrderRatingModal';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import styles from './profile.module.css';

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    items: any[];
    total: number;
    status: string;
    createdAt: string;
    deliveryAddress: any;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, logout, updateProfile, changePassword, addLoyaltyPoints } = useAuth();
    const { showToast } = useToast();
    const { favorites, removeFavorite } = useFavorites();
    const { addToCart } = useCart();
    const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
    const { getReviewsByUser, deleteReview, addReview, hasUserReviewed } = useReviews();
    const { preferences, updatePreferences } = useNotifications();
    const { menuItems } = useMenu(); // Fetch menu dynamically
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites' | 'addresses' | 'reviews' | 'settings'>('profile');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);

    const [ratingDishId, setRatingDishId] = useState<string | null>(null);

    // Profile Editing State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        email: '',
    });

    // Password Change State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name,
                phone: user.phone,
                email: user.email,
            });
        }
    }, [user]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Load user's orders from API
        async function fetchOrders() {
            try {
                const res = await fetch('/api/orders');
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                showToast('Failed to load orders', 'error');
            }
        }
        fetchOrders();
    }, [isAuthenticated, router, showToast]);


    const handleLogout = () => {
        logout();
        showToast('Logged out successfully. See you soon! 👋', 'success');
        router.push('/');
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile(profileData);
        setIsEditingProfile(false);
        showToast('Profile updated successfully!', 'success');
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        const success = await changePassword(passwordData.currentPassword, passwordData.newPassword);

        if (success) {
            showToast('Password changed successfully!', 'success');
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            showToast('Current password is incorrect', 'error');
        }
    };

    const handleRedeemPoints = () => {
        if ((user?.loyaltyPoints || 0) < 100) return;

        // Deduct points
        addLoyaltyPoints(-100);

        // Generate Coupon
        const code = `LOYAL${Math.floor(1000 + Math.random() * 9000)}`;
        const newCoupon = {
            id: Date.now().toString(),
            code: code,
            discountType: 'fixed',
            discountValue: 50,
            description: 'Loyalty Reward (₹50 OFF)',
            minOrderValue: 150,
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
            isActive: true,
            usageLimit: 1,
            usedCount: 0,
            maxDiscount: 50
        };

        // Create Coupon via API (Cloud)
        fetch('/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCoupon)
        }).then(res => {
            if (res.ok) {
                showToast(`Success! Coupon code ${code} generated! 🎟️`, 'success');
            } else {
                showToast('Failed to generate coupon. Please try again.', 'error');
                // Rollback points if failed? Currently too complex for this edit.
            }
        }).catch(() => {
            showToast('Network error while generating coupon.', 'error');
        });
    };

    if (!isAuthenticated) {
        return null;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return styles.pending;
            case 'preparing': return styles.preparing;
            case 'out_for_delivery': return styles.outForDelivery;
            case 'delivered': return styles.delivered;
            case 'cancelled': return styles.cancelled;
            default: return '';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'preparing': return 'Preparing';
            case 'out_for_delivery': return 'Out for Delivery';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const AddressModal = () => (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const addressData = Object.fromEntries(formData.entries()) as any;

                    if (editingAddress) {
                        updateAddress(editingAddress.id, addressData);
                        showToast('Address updated', 'success');
                    } else {
                        addAddress(addressData);
                        showToast('Address added', 'success');
                    }
                    setShowAddressModal(false);
                }}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Label (e.g., Home, Work)</label>
                            <input name="label" defaultValue={editingAddress?.label} required placeholder="Home" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Full Name</label>
                            <input name="name" defaultValue={editingAddress?.name || user?.name} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Phone</label>
                            <input name="phone" defaultValue={editingAddress?.phone || user?.phone} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Pincode</label>
                            <input name="pincode" defaultValue={editingAddress?.pincode} required />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label>Address</label>
                            <textarea name="addressLine1" defaultValue={editingAddress?.addressLine1} required rows={3} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>City</label>
                            <input name="city" defaultValue={editingAddress?.city} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Landmark</label>
                            <input name="landmark" defaultValue={editingAddress?.landmark} />
                        </div>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" onClick={() => setShowAddressModal(false)} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" className={styles.saveBtn}>Save Address</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className={styles.profilePage}>
            <Navbar />
            <Breadcrumbs />

            <div className="container">
                <div className={styles.profileLayout}>
                    {/* Sidebar */}
                    <aside className={styles.sidebar}>
                        <div className={styles.userCard}>
                            <div className={styles.avatar}>
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <h2>{user?.name}</h2>
                            <p>{user?.email}</p>
                            <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: '#B8860B' }}>
                                {user?.loyaltyPoints || 0} Coins 🪙
                            </div>
                        </div>

                        <nav className={styles.sidebarNav}>
                            <button
                                className={activeTab === 'profile' ? styles.navItemActive : styles.navItem}
                                onClick={() => setActiveTab('profile')}
                            >
                                👤 Dashboard
                            </button>
                            <button
                                className={activeTab === 'favorites' ? styles.navItemActive : styles.navItem}
                                onClick={() => setActiveTab('favorites')}
                            >
                                ❤️ Favorites
                            </button>
                            <button
                                className={activeTab === 'addresses' ? styles.navItemActive : styles.navItem}
                                onClick={() => setActiveTab('addresses')}
                            >
                                📍 Addresses
                            </button>
                            <button
                                className={activeTab === 'reviews' ? styles.navItemActive : styles.navItem}
                                onClick={() => setActiveTab('reviews')}
                            >
                                ⭐ My Reviews
                            </button>
                            <button
                                className={activeTab === 'orders' ? styles.navItemActive : styles.navItem}
                                onClick={() => setActiveTab('orders')}
                            >
                                📦 My Orders
                            </button>
                            <button
                                className={activeTab === 'settings' ? styles.navItemActive : styles.navItem}
                                onClick={() => setActiveTab('settings')}
                            >
                                ⚙️ Settings
                            </button>
                        </nav>

                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            🚪 Logout
                        </button>
                    </aside>

                    {/* Main Content */}
                    <main className={styles.mainContent}>
                        {activeTab === 'profile' && (
                            <section className={styles.section}>
                                {/* Loyalty Card */}
                                <div className={styles.loyaltyCard}>
                                    <div className={styles.loyaltyInfo}>
                                        <span className={styles.loyaltyLabel}>CHITKO REWARDS</span>
                                        <div className={styles.loyaltyPoints}>
                                            {user?.loyaltyPoints || 0}
                                            <span style={{ fontSize: '2rem' }}>🪙</span>
                                        </div>
                                        <p className={styles.loyaltyNote}>Earn 50 Coins on orders above ₹300!</p>
                                    </div>
                                    <div className={styles.redeemSection}>
                                        <button
                                            className={styles.redeemBtn}
                                            onClick={handleRedeemPoints}
                                            disabled={(user?.loyaltyPoints || 0) < 100}
                                        >
                                            Redeem 100 Coins
                                        </button>
                                        <p className={styles.loyaltyNote} style={{ marginTop: '0.5rem', color: '#333' }}>
                                            Get ₹50 Coupon
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.profileInfo}>

                                    <div className={styles.profileHeader}>
                                        <h2>Personal Information</h2>
                                        {!isEditingProfile && (
                                            <button
                                                onClick={() => setIsEditingProfile(true)}
                                                className={styles.editBtn}
                                            >
                                                ✏️ Edit
                                            </button>
                                        )}
                                    </div>

                                    {isEditingProfile ? (
                                        <form onSubmit={handleSaveProfile} className={styles.editForm}>
                                            <div className={styles.formGroup}>
                                                <label>Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Phone</label>
                                                <input
                                                    type="text"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.formActions}>
                                                <button type="submit" className={styles.saveBtn}>Save Changes</button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditingProfile(false)}
                                                    className={styles.cancelBtn}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <span className={styles.label}>Name</span>
                                                <p className={styles.value}>{user?.name}</p>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.label}>Email</span>
                                                <p className={styles.value}>{user?.email}</p>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.label}>Phone</span>
                                                <p className={styles.value}>{user?.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className={styles.passwordSection}>
                                        <h3>Security</h3>
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className={styles.changePasswordBtn}
                                        >
                                            🔒 Change Password
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'favorites' && (
                            <section className={styles.section}>
                                <h2>My Favorites</h2>
                                {favorites.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <p>No favorites yet. Go explore our menu!</p>
                                        <button onClick={() => router.push('/menu')} className={styles.browseBtn}>Browse Menu</button>
                                    </div>
                                ) : (
                                    <div className={styles.favoritesGrid}>
                                        {menuItems.filter(item => favorites.includes(item.id)).map(dish => (
                                            <div key={dish.id} className={styles.favoriteCard}>
                                                <Image src={dish.image} alt={dish.name} width={100} height={100} style={{ objectFit: 'cover', borderRadius: '8px' }} />
                                                <div className={styles.favoriteInfo}>
                                                    <h4>{dish.name}</h4>
                                                    <p>₹{dish.price}</p>
                                                    <div className={styles.favoriteActions}>
                                                        <button onClick={() => { addToCart(dish); showToast('Added to cart', 'success'); }}>🛒 Add</button>
                                                        <button onClick={() => removeFavorite(dish.id)} className={styles.removeBtn}>✕</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'addresses' && (
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>My Addresses</h2>
                                    <button onClick={() => {
                                        setEditingAddress(null);
                                        setShowAddressModal(true);
                                    }} className={styles.addBtn}>+ Add New</button>
                                </div>
                                <div className={styles.addressGrid}>
                                    {addresses.map(addr => (
                                        <div key={addr.id} className={`${styles.addressCard} ${addr.isDefault ? styles.defaultAddress : ''}`}>
                                            {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                                            <div className={styles.addressHeader}>
                                                <h4>{addr.label}</h4>
                                                <div className={styles.addressActions}>
                                                    <button onClick={() => {
                                                        setEditingAddress(addr);
                                                        setShowAddressModal(true);
                                                    }}>✏️</button>
                                                    {!addr.isDefault && (
                                                        <button onClick={() => setDeleteConfirmId(addr.id)} className={styles.deleteIcon}>🗑️</button>
                                                    )}
                                                </div>
                                            </div>
                                            <p><strong>{addr.name}</strong></p>
                                            <p>{addr.addressLine1}</p>
                                            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                                            <p>{addr.city} - {addr.pincode}</p>
                                            <p>Phone: {addr.phone}</p>
                                            {!addr.isDefault && (
                                                <button
                                                    onClick={() => setDefaultAddress(addr.id)}
                                                    className={styles.setDefaultBtn}
                                                >
                                                    Set as Default
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {deleteConfirmId && (
                                    <div className={styles.confirmModal}>
                                        <div className={styles.confirmContent}>
                                            <p>Are you sure you want to delete this address?</p>
                                            <div className={styles.confirmActions}>
                                                <button onClick={() => {
                                                    deleteAddress(deleteConfirmId);
                                                    setDeleteConfirmId(null);
                                                }} className={styles.confirmDelete}>Yes, Delete</button>
                                                <button onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'settings' && (
                            <section className={styles.section}>
                                <h2>App Settings</h2>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
                                        <h3>🔔 Notifications</h3>
                                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                            Manage how you want to receive updates about your orders.
                                        </p>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                                                <div>
                                                    <span style={{ fontWeight: 'bold', display: 'block' }}>📧 Email Notifications</span>
                                                    <span style={{ fontSize: '0.85rem', color: '#666' }}>Receive order confirmations and receipt via email</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={preferences.email}
                                                    onChange={(e) => updatePreferences({ email: e.target.checked })}
                                                    style={{ transform: 'scale(1.5)', accentColor: '#ff6b35' }}
                                                />
                                            </label>

                                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                                                <div>
                                                    <span style={{ fontWeight: 'bold', display: 'block' }}>📱 SMS Notifications</span>
                                                    <span style={{ fontSize: '0.85rem', color: '#666' }}>Receive delivery updates via SMS</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={preferences.sms}
                                                    onChange={(e) => updatePreferences({ sms: e.target.checked })}
                                                    style={{ transform: 'scale(1.5)', accentColor: '#ff6b35' }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'reviews' && (
                            <section className={styles.section}>
                                <h2>My Reviews & Ratings</h2>
                                <div className={styles.reviewsList}>
                                    {getReviewsByUser(user?.id || '').length === 0 ? (
                                        <p>You haven't posted any reviews yet.</p>
                                    ) : (
                                        getReviewsByUser(user?.id || '').map(review => {
                                            const dish = menuItems.find(d => d.id === review.dishId);
                                            return (
                                                <div key={review.id} className={styles.reviewCard}>
                                                    <div className={styles.reviewHeader}>
                                                        <h4>{dish?.name || 'Unknown Dish'}</h4>
                                                        <div className={styles.rating}>{'⭐'.repeat(review.rating)}</div>
                                                    </div>
                                                    <p className={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</p>
                                                    <p>{review.comment}</p>
                                                    <button onClick={() => deleteReview(review.id)} className={styles.deleteReviewBtn}>Delete Review</button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </section>
                        )}

                        {activeTab === 'orders' && (
                            <section className={styles.section}>
                                <h2>My Orders</h2>
                                {orders.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <p>No orders found.</p>
                                        <button onClick={() => router.push('/menu')} className={styles.browseBtn}>Order Now</button>
                                    </div>
                                ) : (
                                    <div className={styles.ordersList}>
                                        {orders.map(order => (
                                            <div key={order.id} className={styles.orderCard}>
                                                <div className={styles.orderHeader}>
                                                    <div>
                                                        <h3>Order #{order.orderNumber}</h3>
                                                        <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className={styles.orderStatus}>
                                                        <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                                                            {getStatusText(order.status)}
                                                        </span>
                                                        <span className={styles.orderTotal}>₹{order.total.toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                <div className={styles.orderItems}>
                                                    {order.items.map((item, index) => (
                                                        <div key={index} className={styles.orderItem}>
                                                            <span>{item.quantity}x {item.name}</span>
                                                            {!hasUserReviewed(user?.id || '', item.id) && order.status === 'delivered' && (
                                                                <button
                                                                    className={styles.rateItemBtn}
                                                                    onClick={() => setRatingDishId(item.id)}
                                                                >
                                                                    Rate Item
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {(order.status !== 'delivered' && order.status !== 'cancelled') && (
                                                    <div className={styles.orderActions} style={{ marginTop: '1rem' }}>
                                                        <button
                                                            className={styles.reorderBtn}
                                                            style={{ background: '#ff6b35', color: 'white', borderColor: '#ff6b35' }}
                                                            onClick={() => router.push(`/track?orderId=${order.id}`)}
                                                        >
                                                            🛵 Track Live Order
                                                        </button>
                                                    </div>
                                                )}

                                                {order.status === 'delivered' && (
                                                    <div className={styles.orderActions}>
                                                        <button
                                                            className={styles.rateOrderBtn}
                                                            onClick={() => setRatingOrderId(order.orderNumber)}
                                                        >
                                                            Rate Order Experience
                                                        </button>
                                                        <button
                                                            className={styles.reorderBtn}
                                                            onClick={() => {
                                                                order.items.forEach(item => addToCart(item));
                                                                showToast('Items added to cart', 'success');
                                                                router.push('/cart');
                                                            }}
                                                        >
                                                            🔄 Reorder
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </main>
                </div>
            </div>

            {/* Modals */}
            {showAddressModal && <AddressModal />}

            {showPasswordModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Change Password</h3>
                        <form onSubmit={handleChangePassword}>
                            <div className={styles.formGroup}>
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowPasswordModal(false)} className={styles.cancelBtn}>Cancel</button>
                                <button type="submit" className={styles.saveBtn}>Change Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {ratingDishId && (
                <ReviewModal
                    dishId={ratingDishId}
                    dishName={menuItems.find(d => d.id === ratingDishId)?.name || 'Dish'}
                    userId={user?.id || ''}
                    userName={user?.name || 'Anonymous'}
                    onCancel={() => setRatingDishId(null)}
                    onSave={(review) => {
                        addReview({
                            dishId: ratingDishId,
                            userId: user?.id || '',
                            userName: user?.name || 'Anonymous',
                            rating: review.rating,
                            comment: review.comment
                        });
                        setRatingDishId(null);
                        showToast('Review submitted!', 'success');
                    }}
                />
            )}

            {ratingOrderId && (
                <OrderRatingModal
                    orderId={orders.find(o => o.orderNumber === ratingOrderId)?.id || ''}
                    items={orders.find(o => o.orderNumber === ratingOrderId)?.items || []}
                    userName={user?.name || 'Anonymous'}
                    userId={user?.id || ''}
                    onClose={() => setRatingOrderId(null)}
                    onSubmitRating={(dishId, rating, comment) => {
                        addReview({
                            dishId,
                            userId: user?.id || '',
                            userName: user?.name || 'Anonymous',
                            rating,
                            comment
                        });
                        showToast('Rating submitted!', 'success');
                    }}
                />
            )}
        </div>
    );
}
