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
            // Use Service to get Data (Simulated or Real)
            const serviceData = await petPoojaService.getMenu();

            if (serviceData.length > 0) {
                setMenuItems(serviceData);
                // Sync to local storage for persistence/fallback
                localStorage.setItem(STORAGE_KEY, JSON.stringify(serviceData));
            } else {
                // If service returns empty (e.g. first load), check local
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setMenuItems(JSON.parse(stored));
                } else {
                    // No local data, start empty
                    setMenuItems([]);
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
