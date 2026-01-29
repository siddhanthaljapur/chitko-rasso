'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useAddresses, Address } from '@/lib/context/AddressContext';
import { useToast } from '@/lib/context/ToastContext';
import { useCart } from '@/lib/context/CartContext';
import { useNotifications } from '@/lib/context/NotificationContext';
import styles from './addresses.module.css';

export default function AddressesPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
    const { showToast } = useToast();
    const { getCartCount } = useCart();
    const { unreadCount } = useNotifications();
    const router = useRouter();

    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        label: 'Home',
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        pincode: '',
        isDefault: false,
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const handleOpenModal = (address?: Address) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                label: address.label,
                name: address.name,
                phone: address.phone,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2 || '',
                landmark: address.landmark || '',
                city: address.city,
                pincode: address.pincode,
                isDefault: address.isDefault,
            });
        } else {
            setEditingAddress(null);
            setFormData({
                label: 'Home',
                name: user?.name || '',
                phone: user?.phone || '',
                addressLine1: '',
                addressLine2: '',
                landmark: '',
                city: 'Secunderabad',
                pincode: '',
                isDefault: addresses.length === 0,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingAddress(null);
        setFormData({
            label: 'Home',
            name: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            landmark: '',
            city: '',
            pincode: '',
            isDefault: false,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.phone || !formData.addressLine1 || !formData.city || !formData.pincode) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        if (formData.phone.length !== 10) {
            showToast('Phone number must be 10 digits', 'error');
            return;
        }

        if (formData.pincode.length !== 6) {
            showToast('Pincode must be 6 digits', 'error');
            return;
        }

        if (editingAddress) {
            updateAddress(editingAddress.id, formData);
            showToast('Address updated successfully!', 'success');
        } else {
            addAddress(formData);
            showToast('Address added successfully!', 'success');
        }

        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        deleteAddress(id);
        showToast('Address deleted', 'success');
        setDeleteConfirmId(null);
    };

    const handleSetDefault = (id: string) => {
        setDefaultAddress(id);
        showToast('Default address updated!', 'success');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className={styles.page}>
            {/* Navigation Header */}
            <header className={styles.navHeader}>
                <div className="container">
                    <div className={styles.navContent}>
                        <Link href="/" className={styles.navLogo}>
                            <Image src="/logo.jpg" alt="Chitko Rasso" width={70} height={70} style={{ objectFit: 'contain' }} priority />
                        </Link>
                        <nav className={styles.navLinks}>
                            <Link href="/">Home</Link>
                            <Link href="/menu">Menu</Link>
                            <Link href="/cart">
                                🛒 Cart {getCartCount() > 0 && <span className={styles.cartBadge}>{getCartCount()}</span>}
                            </Link>
                            <Link href="/notifications" className={styles.notificationBell}>
                                🔔
                                {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
                            </Link>
                            <div className={styles.userMenu}>
                                <Link href="/profile" className={styles.profileLink}>👤 {user?.name}</Link>
                                <button onClick={() => { logout(); router.push('/'); showToast('Logged out successfully. See you soon! 👋', 'success'); }} className={styles.logoutBtn}>Logout</button>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            <main className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1>📍 Saved Addresses</h1>
                        <p className={styles.count}>{addresses.length} {addresses.length === 1 ? 'address' : 'addresses'}</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className={styles.addBtn}>
                        ➕ Add New Address
                    </button>
                </div>

                {addresses.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>📍</div>
                        <h2>No saved addresses</h2>
                        <p>Add your delivery addresses for faster checkout</p>
                        <button onClick={() => handleOpenModal()} className={styles.addFirstBtn}>
                            Add Your First Address
                        </button>
                    </div>
                ) : (
                    <div className={styles.addressGrid}>
                        {addresses.map(address => (
                            <div key={address.id} className={`${styles.addressCard} ${address.isDefault ? styles.default : ''}`}>
                                {address.isDefault && (
                                    <div className={styles.defaultBadge}>✓ Default</div>
                                )}
                                <div className={styles.addressHeader}>
                                    <span className={styles.label}>{address.label}</span>
                                    <div className={styles.actions}>
                                        <button onClick={() => handleOpenModal(address)} className={styles.editBtn} title="Edit">
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmId(address.id)}
                                            className={styles.deleteBtn}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.addressContent}>
                                    <p className={styles.name}>{address.name}</p>
                                    <p className={styles.phone}>{address.phone}</p>
                                    <p className={styles.addressText}>
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                        {address.landmark && `, ${address.landmark}`}
                                    </p>
                                    <p className={styles.cityPincode}>
                                        {address.city} - {address.pincode}
                                    </p>
                                </div>
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className={styles.setDefaultBtn}
                                    >
                                        Set as Default
                                    </button>
                                )}

                                {/* Delete Confirmation */}
                                {deleteConfirmId === address.id && (
                                    <div className={styles.deleteConfirm}>
                                        <p>Delete this address?</p>
                                        <div className={styles.confirmActions}>
                                            <button onClick={() => handleDelete(address.id)} className={styles.confirmYes}>
                                                Yes, Delete
                                            </button>
                                            <button onClick={() => setDeleteConfirmId(null)} className={styles.confirmNo}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                            <button onClick={handleCloseModal} className={styles.closeBtn}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Address Label *</label>
                                <select
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    required
                                >
                                    <option value="Home">🏠 Home</option>
                                    <option value="Work">💼 Work</option>
                                    <option value="Other">📍 Other</option>
                                </select>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Address Line 1 *</label>
                                <input
                                    type="text"
                                    value={formData.addressLine1}
                                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                                    placeholder="House/Flat No, Building Name"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.addressLine2}
                                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                                    placeholder="Street, Area"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Landmark (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.landmark}
                                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Pincode *</label>
                                    <input
                                        type="text"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={handleCloseModal} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    {editingAddress ? 'Update Address' : 'Add Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
