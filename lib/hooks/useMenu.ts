import { useState, useEffect } from 'react';
import { MenuItem } from '@/lib/types';
import { petPoojaService } from '@/lib/services/petpooja';

const STORAGE_KEY = 'chitko_menu_items';

export function useMenu() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize and Load
    useEffect(() => {
        const loadMenu = async () => {
            try {
                // Fetch from API endpoint (works on both localhost and production)
                const response = await fetch('/api/menu');
                if (response.ok) {
                    const data = await response.json();
                    setMenuItems(data);
                    // Cache to localStorage for offline fallback
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                } else {
                    // Fallback to localStorage if API fails
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        setMenuItems(JSON.parse(stored));
                    }
                }
            } catch (error) {
                console.error('Failed to load menu:', error);
                // Fallback to localStorage
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setMenuItems(JSON.parse(stored));
                }
            }
            setLoading(false);
        };

        loadMenu();

        // Optional: Listen for storage events to sync across tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadMenu();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // CRUD Operations
    const updateDish = (updatedDish: MenuItem) => {
        const newItems = menuItems.map(item =>
            item.id === updatedDish.id ? updatedDish : item
        );
        setMenuItems(newItems);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));

        // Dispatch custom event for same-tab updates if needed
        window.dispatchEvent(new Event('menu-updated'));
    };

    const addDish = (newDish: MenuItem) => {
        const newItems = [newDish, ...menuItems];
        setMenuItems(newItems);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        window.dispatchEvent(new Event('menu-updated'));
    };

    const deleteDish = (dishId: string) => {
        const newItems = menuItems.filter(item => item.id !== dishId);
        setMenuItems(newItems);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        window.dispatchEvent(new Event('menu-updated'));
    };

    // Toggle Availability Helper
    const toggleAvailability = (dishId: string) => {
        const dish = menuItems.find(i => i.id === dishId);
        if (dish) {
            updateDish({ ...dish, available: !dish.available });
        }
    };

    return {
        menuItems,
        loading,
        updateDish,
        addDish,
        deleteDish,
        toggleAvailability
    };
}
