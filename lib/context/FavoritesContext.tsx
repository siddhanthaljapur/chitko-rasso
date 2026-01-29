'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoritesContextType {
    favorites: string[];
    addFavorite: (dishId: string) => void;
    removeFavorite: (dishId: string) => void;
    isFavorite: (dishId: string) => boolean;
    toggleFavorite: (dishId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);

    // Load favorites from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('chitko_favorites');
        if (stored) {
            setFavorites(JSON.parse(stored));
        }
    }, []);

    // Save to localStorage whenever favorites change
    useEffect(() => {
        localStorage.setItem('chitko_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addFavorite = (dishId: string) => {
        setFavorites(prev => [...prev, dishId]);
    };

    const removeFavorite = (dishId: string) => {
        setFavorites(prev => prev.filter(id => id !== dishId));
    };

    const isFavorite = (dishId: string) => {
        return favorites.includes(dishId);
    };

    const toggleFavorite = (dishId: string) => {
        if (isFavorite(dishId)) {
            removeFavorite(dishId);
        } else {
            addFavorite(dishId);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
}
