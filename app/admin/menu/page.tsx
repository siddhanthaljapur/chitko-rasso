'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { categories } from '@/lib/menuData'; // Keeping const lists
import LoadingSkeleton from '@/components/LoadingSkeleton';
import AdminSidebar from '@/components/admin/Sidebar';
import styles from './menu-management.module.css';
import dashboardStyles from '../dashboard/dashboard.module.css';

interface MenuItem {
    _id?: string;
    id?: string;
    name: string;
    description: string;
    category: string;
    price: number;
    image: string;
    isVeg: boolean;
    spiceLevel?: 1 | 2 | 3;
    available: boolean;
}

export default function MenuManagement() {
    const router = useRouter();
    const { isAdmin } = useAuth(); // Using context for auth check
    const { showToast } = useToast();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        if (!isAdmin) {
            // router.push('/admin/login'); // AuthContext usually handles redirect? but let's be safe
            return;
        }

        async function fetchMenu() {
            try {
                const res = await fetch('/api/menu');
                if (res.ok) {
                    const data = await res.json();
                    setMenuItems(data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to fetch menu', error);
                showToast('Failed to load menu', 'error');
                setIsLoading(false);
            }
        }
        fetchMenu();
    }, [isAdmin]);

    // Filter items based on category and search
    useEffect(() => {
        let filtered = menuItems;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredItems(filtered);
    }, [menuItems, selectedCategory, searchQuery]);


    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        const itemIndex = menuItems.findIndex(i => (i._id || i.id) === id);
        if (itemIndex === -1) return;

        const optimisticItems = [...menuItems];
        optimisticItems[itemIndex].available = !currentStatus;
        setMenuItems(optimisticItems);

        try {
            const res = await fetch('/api/menu', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, available: !currentStatus })
            });
            if (!res.ok) throw new Error('Failed to update');
            showToast('Updated availability', 'success');
        } catch (error) {
            // Revert
            optimisticItems[itemIndex].available = currentStatus;
            setMenuItems([...optimisticItems]);
            showToast('Failed to update status', 'error');
        }
    };

    const handleAddNew = () => {
        setEditingItem({
            name: '',
            description: '',
            category: 'Starters',
            price: 0,
            image: '/dishes/placeholder.png',
            isVeg: false,
            spiceLevel: 2,
            available: true,
        });
        setIsAddingNew(true);
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setIsAddingNew(false);
    };

    const handleSave = async (item: MenuItem) => {
        try {
            let res;
            if (isAddingNew) {
                res = await fetch('/api/menu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            } else {
                res = await fetch('/api/menu', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...item, _id: item._id || item.id }) // Ensure ID is passed
                });
            }

            if (res.ok) {
                const savedItem = await res.json();
                if (isAddingNew) {
                    setMenuItems([...menuItems, savedItem]);
                    showToast('Dish added successfully! 🎉', 'success');
                } else {
                    setMenuItems(menuItems.map(i => (i._id === savedItem._id || i.id === savedItem._id) ? savedItem : i));
                    showToast('Dish updated successfully! ✓', 'success');
                }
                setEditingItem(null);
                setIsAddingNew(false);
            } else {
                throw new Error('API Error');
            }
        } catch (error) {
            showToast('Failed to save dish', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMenuItems(menuItems.filter(i => (i._id || i.id) !== id));
                setShowDeleteConfirm(null);
                showToast('Dish deleted successfully', 'success');
            } else {
                throw new Error('API Error');
            }
        } catch (error) {
            showToast('Failed to delete dish', 'error');
        }
    };

    if (isLoading) {
        return <div className={dashboardStyles.loading}>Loading Menu...</div>;
    }

    return (
        <div className={dashboardStyles.dashboard}>
            <AdminSidebar />
            <main className={dashboardStyles.mainContent}>
                <div className={styles.header}>
                    <h1>Menu Management</h1>
                    <button onClick={handleAddNew} className={styles.addBtn}>
                        + Add New Dish
                    </button>
                </div>

                <div className={styles.filters}>
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={styles.categorySelect}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item._id || item.id}>
                                    <td>
                                        <img src={item.image} alt={item.name} className={styles.dishImage} />
                                    </td>
                                    <td>
                                        <div className={styles.dishName}>{item.name}</div>
                                        <div className={styles.dishDesc}>{item.description.substring(0, 50)}...</div>
                                    </td>
                                    <td>{item.category}</td>
                                    <td>₹{item.price}</td>
                                    <td>
                                        <span className={item.isVeg ? styles.vegBadge : styles.nonVegBadge}>
                                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                                        </span>
                                    </td>
                                    <td>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={item.available}
                                                onChange={() => toggleAvailability(item._id || item.id || '', item.available)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button onClick={() => handleEdit(item)} className={styles.editBtn}>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(item._id || item.id || '')}
                                                className={styles.deleteBtn}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Edit/Add Modal */}
            {editingItem && (
                <EditModal
                    item={editingItem}
                    isNew={isAddingNew}
                    onSave={handleSave}
                    onCancel={() => {
                        setEditingItem(null);
                        setIsAddingNew(false);
                    }}
                />
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete this dish?</p>
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowDeleteConfirm(null)} className={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(showDeleteConfirm)} className={styles.confirmDeleteBtn}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function EditModal({ item, isNew, onSave, onCancel }: {
    item: MenuItem;
    isNew: boolean;
    onSave: (item: MenuItem) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState(item);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                <h2>{isNew ? 'Add New Dish' : 'Edit Dish'}</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Dish Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={3}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Dish Image</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, image: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {formData.image && <img src={formData.image} alt="Preview" style={{ width: 50, height: 50 }} />}
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.filter(c => c !== 'All').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Price</label>
                            <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" className={styles.saveBtn}>Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
