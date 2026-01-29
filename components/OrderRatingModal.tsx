'use client';

import { useState } from 'react';
import styles from './OrderRatingModal.module.css';

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface OrderRatingModalProps {
    orderId: string;
    items: OrderItem[];
    userName: string;
    userId: string;
    onClose: () => void;
    onSubmitRating: (dishId: string, rating: 1 | 2 | 3 | 4 | 5, comment: string) => void;
}

export default function OrderRatingModal({ orderId, items, userName, userId, onClose, onSubmitRating }: OrderRatingModalProps) {
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    if (!items || items.length === 0) return null;

    const currentItem = items[currentItemIndex];

    const handleSubmit = () => {
        onSubmitRating(currentItem.id, rating, comment);

        if (currentItemIndex < items.length - 1) {
            // Move to next item
            setCurrentItemIndex(currentItemIndex + 1);
            setRating(5);
            setComment('');
        } else {
            // All items rated
            onClose();
        }
    };

    const handleSkip = () => {
        if (currentItemIndex < items.length - 1) {
            setCurrentItemIndex(currentItemIndex + 1);
            setRating(5);
            setComment('');
        } else {
            onClose();
        }
    };

    return (
        <div className={styles.modal} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3>Rate Your Order Items</h3>
                <p className={styles.progress}>
                    Item {currentItemIndex + 1} of {items.length}
                </p>
                <p className={styles.dishName}>{currentItem.name}</p>

                <div className={styles.formGroup}>
                    <label>Your Rating *</label>
                    <div className={styles.starRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={styles.starBtn}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(null)}
                                onClick={() => setRating(star as 1 | 2 | 3 | 4 | 5)}
                            >
                                <span style={{
                                    fontSize: '2.5rem',
                                    color: (hoveredStar !== null ? star <= hoveredStar : star <= rating) ? '#fbbf24' : '#d1d5db',
                                    transition: 'color 0.2s'
                                }}>
                                    ⭐
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className={styles.ratingLabel}>
                        {rating === 1 && '⭐ Poor'}
                        {rating === 2 && '⭐⭐ Fair'}
                        {rating === 3 && '⭐⭐⭐ Good'}
                        {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                        {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                    </p>
                </div>

                <div className={styles.formGroup}>
                    <label>Your Review (Optional)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this dish..."
                        rows={4}
                        className={styles.textarea}
                    />
                </div>

                <div className={styles.modalActions}>
                    <button onClick={handleSkip} className={styles.skipBtn}>
                        {currentItemIndex < items.length - 1 ? 'Skip This Item' : 'Close'}
                    </button>
                    <button onClick={handleSubmit} className={styles.submitBtn}>
                        {currentItemIndex < items.length - 1 ? 'Next Item →' : 'Submit All'}
                    </button>
                </div>
            </div>
        </div>
    );
}
