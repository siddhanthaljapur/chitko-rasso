'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { useCart } from '@/lib/context/CartContext';
import { useToast } from '@/lib/context/ToastContext';
import { useMenu } from '@/lib/hooks/useMenu';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import styles from './favorites.module.css';

export default function FavoritesPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const { favorites, removeFavorite } = useFavorites();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const router = useRouter();
    const [sortBy, setSortBy] = useState<'recent' | 'name' | 'price'>('recent');
    const { menuItems } = useMenu(); // Fetch menu from API/Storage

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const favoriteDishes = menuItems.filter(dish => favorites.includes(dish.id));

    const sortedDishes = [...favoriteDishes].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price':
                return a.price - b.price;
            default:
                return 0; // Keep original order for 'recent'
        }
    });

    const handleAddToCart = (dish: any) => {
        addToCart(dish);
        showToast(`${dish.name} added to cart! 🛒`, 'success');
    };

    const handleRemoveFavorite = (dishId: string, dishName: string) => {
        removeFavorite(dishId);
        showToast(`${dishName} removed from favorites`, 'success');
    };

    const handleShare = () => {
        const shareText = `Check out my favorite dishes at Chitko Rasso!\n${favoriteDishes.map(d => d.name).join(', ')}`;

        if (navigator.share) {
            navigator.share({
                title: 'My Favorite Dishes - Chitko Rasso',
                text: shareText,
                url: window.location.origin + '/menu',
            }).catch(() => {
                // Fallback to clipboard
                navigator.clipboard.writeText(shareText);
                showToast('Favorites copied to clipboard!', 'success');
            });
        } else {
            navigator.clipboard.writeText(shareText);
            showToast('Favorites copied to clipboard!', 'success');
        }
    };

    if (!isAuthenticated) {
        return null; // Or a loading spinner
    }

    return (
        <div className={styles.page}>
            <Navbar />
            <Breadcrumbs />

            <main className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1>❤️ My Favorites</h1>
                        <p className={styles.count}>{favoriteDishes.length} {favoriteDishes.length === 1 ? 'dish' : 'dishes'}</p>
                    </div>
                    {favoriteDishes.length > 0 && (
                        <div className={styles.controls}>
                            <div className={styles.sortControls}>
                                <label>Sort by:</label>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                                    <option value="recent">Recently Added</option>
                                    <option value="name">Name (A-Z)</option>
                                    <option value="price">Price (Low to High)</option>
                                </select>
                            </div>
                            <button onClick={handleShare} className={styles.shareBtn}>
                                📤 Share
                            </button>
                        </div>
                    )}
                </div>

                {favoriteDishes.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>💔</div>
                        <h2>No favorites yet</h2>
                        <p>Start adding dishes you love!</p>
                        <Link href="/menu" className={styles.browseBtn}>
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {sortedDishes.map(dish => (
                            <div key={dish.id} className={styles.card}>
                                <div className={styles.imageWrapper}>
                                    <Image
                                        src={dish.image}
                                        alt={dish.name}
                                        width={300}
                                        height={200}
                                        style={{ objectFit: 'cover', width: '100%', height: '200px' }}
                                    />
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => handleRemoveFavorite(dish.id, dish.name)}
                                        title="Remove from favorites"
                                    >
                                        ❤️
                                    </button>
                                    {dish.isVeg ? (
                                        <span className={styles.vegBadge}>🟢 Veg</span>
                                    ) : (
                                        <span className={styles.nonVegBadge}>🔴 Non-Veg</span>
                                    )}
                                </div>

                                <div className={styles.content}>
                                    <h3>{dish.name}</h3>
                                    <p className={styles.description}>{dish.description}</p>

                                    <div className={styles.footer}>
                                        <span className={styles.price}>₹{dish.price}</span>
                                        <button
                                            onClick={() => handleAddToCart(dish)}
                                            className={styles.addToCartBtn}
                                        >
                                            🛒 Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
