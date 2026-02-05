'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { categories } from '@/lib/categories';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { useReviews } from '@/lib/context/ReviewsContext';
import { useNotifications } from '@/lib/context/NotificationContext';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { isKitchenOpen } from '@/lib/kitchenUtils';
import styles from './menu.module.css';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    image: string;
    isVeg: boolean;
    spiceLevel?: 1 | 2 | 3;
    available: boolean;
}

function MenuContent() {
    // Safety check for isKitchenOpen function
    const isKitchenOpenNow = typeof isKitchenOpen === 'function' ? isKitchenOpen() : true;
    const { addToCart, getCartCount } = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const { showToast } = useToast();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { getAverageRating, getReviewCount } = useReviews();
    const { unreadCount } = useNotifications();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVeg, setFilterVeg] = useState<'all' | 'veg' | 'non-veg'>('all');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [sortBy, setSortBy] = useState<'none' | 'price-low' | 'price-high'>('none');
    const [addedItemId, setAddedItemId] = useState<string | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [reviewDishId, setReviewDishId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [highlightedDishId, setHighlightedDishId] = useState<string | null>(null);
    const searchParams = useSearchParams();

    // Load menu from API
    useEffect(() => {
        async function fetchMenu() {
            try {
                const res = await fetch('/api/menu');
                if (res.ok) {
                    const data = await res.json();
                    setMenuItems(data);
                } else {
                    console.error('Failed to fetch menu');
                    showToast('Failed to load menu. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error fetching menu:', error);
                showToast('Error loading menu', 'error');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMenu();

        // Check for shared dish ID and scroll/highlight
        const sharedDishId = searchParams.get('dishId');
        if (sharedDishId) {
            setHighlightedDishId(sharedDishId);
            setTimeout(() => {
                const element = document.getElementById(`dish-${sharedDishId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Remove highlight after 3 seconds
                    setTimeout(() => setHighlightedDishId(null), 3000);
                }
            }, 500); // Wait for rendering
        }
    }, [searchParams]);


    const handleShare = async (dish: MenuItem) => {
        const shareData = {
            title: `Try ${dish.name} at Chitko Rasso!`,
            text: `Check out this delicious ${dish.name} I found on Chitko Rasso!`,
            url: `${window.location.origin}/menu?dishId=${dish.id}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                showToast('Link shared successfully! 🔗', 'success');
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback for browsers without Web Share API
            navigator.clipboard.writeText(shareData.url).then(() => {
                showToast('Link copied to clipboard! 📋', 'success');
            }).catch(() => {
                showToast('Failed to copy link', 'error');
            });
        }
    };

    const filteredMenu = useMemo(() => {
        return menuItems.filter((item) => {
            // Filter out unavailable items
            if (!item.available) {
                return false;
            }

            // Category filter
            if (selectedCategory !== 'All' && item.category !== selectedCategory) {
                return false;
            }

            // Search filter
            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Veg/Non-veg filter
            if (filterVeg === 'veg' && !item.isVeg) return false;
            if (filterVeg === 'non-veg' && item.isVeg) return false;

            // Price range filter
            if (item.price < priceRange[0] || item.price > priceRange[1]) return false;

            return true;
        }).sort((a, b) => {
            // Sort logic
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            return 0;
        });
    }, [menuItems, selectedCategory, searchQuery, filterVeg, priceRange, sortBy]);

    return (
        <div className={styles.menuPage}>
            <Navbar />
            <Breadcrumbs />

            {/* Hero Banner - Compact */}
            <section className={styles.heroBanner} style={{ padding: '2rem 0 1.5rem' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>Our Menu</h1>
                    <p style={{ fontSize: '0.95rem', margin: 0, opacity: 0.9 }}>Explore authentic Saoji flavours crafted with traditional recipes</p>
                </div>
            </section>

            {/* Filters Section */}
            <section className={styles.filtersSection}>
                <div className="container">
                    {/* Search Bar */}
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Search for dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={styles.filterToggleBtn}
                        >
                            {showFilters ? '✕ Hide Filters' : '⚙️ Show Filters'}
                        </button>
                    </div>

                    {/* Collapsible Filters */}
                    <div className={`${styles.filtersContainer} ${showFilters ? styles.filtersOpen : ''}`}>

                        {/* Category Filters */}
                        <div className={styles.categoryFilters}>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`${styles.categoryChip} ${selectedCategory === category ? styles.active : ''
                                        }`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Veg/Non-Veg Filter */}
                        <div className={styles.vegFilter}>
                            <button
                                className={`${styles.vegChip} ${filterVeg === 'all' ? styles.active : ''}`}
                                onClick={() => setFilterVeg('all')}
                            >
                                All
                            </button>
                            <button
                                className={`${styles.vegChip} ${filterVeg === 'veg' ? styles.active : ''}`}
                                onClick={() => setFilterVeg('veg')}
                            >
                                <span className={styles.vegIndicator}>🟢</span> Veg
                            </button>
                            <button
                                className={`${styles.vegChip} ${filterVeg === 'non-veg' ? styles.active : ''}`}
                                onClick={() => setFilterVeg('non-veg')}
                            >
                                <span className={styles.nonVegIndicator}>🔴</span> Non-Veg
                            </button>
                        </div>

                        {/* Price Range & Sort - Compact Layout */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: '1', minWidth: '180px' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                                    Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    step="50"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                                    style={{ width: '100%', height: '6px' }}
                                />
                            </div>
                            <div style={{ flex: '1', minWidth: '150px' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '0.875rem' }}
                                >
                                    <option value="none">Default</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedCategory('All');
                                    setSearchQuery('');
                                    setFilterVeg('all');
                                    setPriceRange([0, 1000]);
                                    setSortBy('none');
                                }}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    background: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dish Grid */}
            <section className={styles.dishGrid}>
                {isLoading ? (
                    <div className="container">
                        <div className={styles.menuGrid}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className={styles.menuItem}>
                                    <LoadingSkeleton
                                        height="200px"
                                        borderRadius="16px"
                                        style={{ marginBottom: '1rem' }}
                                    />
                                    <div style={{ padding: '0 1rem 1rem' }}>
                                        <LoadingSkeleton type="title" width="80%" />
                                        <LoadingSkeleton type="text" width="60%" />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                            <LoadingSkeleton width="60px" height="24px" />
                                            <LoadingSkeleton width="80px" height="36px" borderRadius="18px" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : filteredMenu.length > 0 ? (
                    <div className="container">
                        <div className={styles.resultsCount}>
                            Showing {filteredMenu.length} {filteredMenu.length === 1 ? 'dish' : 'dishes'}
                        </div>

                        <div className={styles.menuGrid}>
                            {filteredMenu.map((item) => (
                                <div
                                    key={item.id}
                                    id={`dish-${item.id}`}
                                    className={`${styles.foodCard} ${highlightedDishId === item.id ? styles.highlighted : ''}`}
                                >
                                    <div className={styles.foodImage}>
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={400}
                                            height={300}
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <div className={styles.vegBadge}>
                                            {item.isVeg ? (
                                                <span className={styles.vegIcon}>🟢</span>
                                            ) : (
                                                <span className={styles.nonVegIcon}>🔴</span>
                                            )}
                                        </div>
                                        {item.spiceLevel && item.spiceLevel >= 3 && (
                                            <div className={styles.spiceBadge}>
                                                🌶️ Spicy
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.foodContent}>
                                        <h3>{item.name}</h3>
                                        <p className={styles.description}>{item.description}</p>

                                        <div className={styles.foodFooter}>
                                            <div className={styles.price}>₹{item.price}</div>
                                            <div className={styles.cardActions}>
                                                <button
                                                    className={`${styles.addToCartBtn} ${addedItemId === item.id ? styles.added : ''}`}
                                                    disabled={!isKitchenOpenNow}
                                                    onClick={() => {
                                                        addToCart(item);
                                                        setAddedItemId(item.id);
                                                        showToast(`${item.name} added to cart! 🛒`, 'success');
                                                        setTimeout(() => setAddedItemId(null), 1000);
                                                    }}
                                                >
                                                    {!isKitchenOpenNow ? '🌙 Closed' : (addedItemId === item.id ? '✓ Added!' : 'Add to Cart')}
                                                </button>

                                                <button
                                                    className={styles.favoriteIconBtn}
                                                    onClick={() => handleShare(item)}
                                                    aria-label="Share dish"
                                                    title="Share dish"
                                                >
                                                    🔗
                                                </button>

                                                <button
                                                    className={styles.favoriteIconBtn}
                                                    onClick={() => {
                                                        toggleFavorite(item.id);
                                                        showToast(
                                                            isFavorite(item.id) ? `Removed ${item.name} from favorites` : `Added ${item.name} to favorites! ❤️`,
                                                            'success'
                                                        );
                                                    }}
                                                    aria-label={isFavorite(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                                                    title={isFavorite(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                                                >
                                                    {isFavorite(item.id) ? '❤️' : '🤍'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="container">
                        <div className={styles.noResults}>
                            <p>No dishes found matching your criteria.</p>
                            <button onClick={() => {
                                setSelectedCategory('All');
                                setSearchQuery('');
                                setFilterVeg('all');
                            }} className={styles.resetBtn}>
                                Reset Filters
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Footer */}
            <Footer />
        </div >
    );
}

export default function MenuPage() {
    return (
        <Suspense fallback={<div>Loading menu...</div>}>
            <MenuContent />
        </Suspense>
    );
}
