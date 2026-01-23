'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { menuData, categories } from '@/lib/menuData';
import { useCart } from '@/lib/context/CartContext';
import styles from './menu.module.css';

export default function MenuPage() {
    const { addToCart, getCartCount } = useCart();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVeg, setFilterVeg] = useState<'all' | 'veg' | 'non-veg'>('all');
    const [addedItemId, setAddedItemId] = useState<string | null>(null);

    const filteredMenu = useMemo(() => {
        return menuData.filter((item) => {
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

            return true;
        });
    }, [selectedCategory, searchQuery, filterVeg]);

    return (
        <div className={styles.menuPage}>
            {/* Header */}
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <Link href="/" className={styles.logo}>
                            CHITKO RASSO
                        </Link>
                        <nav className={styles.nav}>
                            <Link href="/">Home</Link>
                            <Link href="/menu" className={styles.active}>Menu</Link>
                            <Link href="/cart" className={styles.cartLink}>
                                🛒 Cart {getCartCount() > 0 && <span className={styles.cartBadge}>{getCartCount()}</span>}
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Banner */}
            <section className={styles.heroBanner}>
                <div className="container">
                    <h1>Our Menu</h1>
                    <p>Explore authentic Saoji flavours crafted with traditional recipes</p>
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
                        <span className={styles.searchIcon}>🔍</span>
                    </div>

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
                </div>
            </section>

            {/* Menu Grid */}
            <section className={styles.menuSection}>
                <div className="container">
                    <div className={styles.resultsCount}>
                        Showing {filteredMenu.length} {filteredMenu.length === 1 ? 'dish' : 'dishes'}
                    </div>

                    {filteredMenu.length === 0 ? (
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
                    ) : (
                        <div className={styles.menuGrid}>
                            {filteredMenu.map((item) => (
                                <div key={item.id} className={styles.foodCard}>
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
                                            <button
                                                className={`${styles.addToCartBtn} ${addedItemId === item.id ? styles.added : ''}`}
                                                onClick={() => {
                                                    addToCart(item);
                                                    setAddedItemId(item.id);
                                                    setTimeout(() => setAddedItemId(null), 1000);
                                                }}
                                            >
                                                {addedItemId === item.id ? '✓ Added!' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <p>&copy; 2026 CHITKO RASSO. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
