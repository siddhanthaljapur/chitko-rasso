'use client';

import { useState } from 'react';
import { Review } from '@/lib/context/ReviewsContext';
import styles from './ReviewModal.module.css';

interface ReviewModalProps {
    dishId: string;
    dishName: string;
    userId: string;
    userName: string;
    existingReview?: Review;
    onSave: (review: { rating: 1 | 2 | 3 | 4 | 5; comment: string }) => void;
    onCancel: () => void;
}

export default function ReviewModal({ dishId, dishName, userId, userName, existingReview, onSave, onCancel }: ReviewModalProps) {
    const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(existingReview?.rating || 5);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ rating, comment });
    };

    return (
        <div className={styles.modal} onClick={onCancel}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3>{existingReview ? 'Edit Review' : 'Write a Review'}</h3>
                <p className={styles.dishName}>{dishName}</p>

                <form onSubmit={handleSubmit}>
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
                                        fontSize: '2rem',
                                        color: (hoveredStar !== null ? star <= hoveredStar : star <= rating) ? '#fbbf24' : '#d1d5db',
                                        transition: 'color 0.2s'
                                    }}>
                                        ⭐
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className={styles.ratingLabel}>
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                        </p>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Your Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this dish..."
                            rows={4}
                            className={styles.textarea}
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onCancel} className={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                            {existingReview ? 'Update Review' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
