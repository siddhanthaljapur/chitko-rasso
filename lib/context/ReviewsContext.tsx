'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Review {
    id: string;
    dishId: string;
    userId: string;
    userName: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    createdAt: string;
}

interface ReviewsContextType {
    reviews: Review[];
    addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
    updateReview: (id: string, updates: Partial<Review>) => void;
    deleteReview: (id: string) => void;
    getReviewsByDish: (dishId: string) => Review[];
    getReviewsByUser: (userId: string) => Review[];
    getAverageRating: (dishId: string) => number;
    getReviewCount: (dishId: string) => number;
    hasUserReviewed: (dishId: string, userId: string) => boolean;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: ReactNode }) {
    const [reviews, setReviews] = useState<Review[]>([]);

    // Load reviews from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('chitko_reviews');
        if (stored) {
            setReviews(JSON.parse(stored));
        }
    }, []);

    // Save to localStorage whenever reviews change
    useEffect(() => {
        if (reviews.length > 0 || localStorage.getItem('chitko_reviews')) {
            localStorage.setItem('chitko_reviews', JSON.stringify(reviews));
        }
    }, [reviews]);

    const addReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
        const newReview: Review = {
            ...review,
            id: `review-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        setReviews(prev => [newReview, ...prev]);
    };

    const updateReview = (id: string, updates: Partial<Review>) => {
        setReviews(prev => prev.map(review =>
            review.id === id ? { ...review, ...updates } : review
        ));
    };

    const deleteReview = (id: string) => {
        setReviews(prev => prev.filter(review => review.id !== id));
    };

    const getReviewsByDish = (dishId: string) => {
        return reviews.filter(review => review.dishId === dishId);
    };

    const getReviewsByUser = (userId: string) => {
        return reviews.filter(review => review.userId === userId);
    };

    const getAverageRating = (dishId: string) => {
        const dishReviews = getReviewsByDish(dishId);
        if (dishReviews.length === 0) return 0;
        const sum = dishReviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / dishReviews.length;
    };

    const getReviewCount = (dishId: string) => {
        return getReviewsByDish(dishId).length;
    };

    const hasUserReviewed = (dishId: string, userId: string) => {
        return reviews.some(review => review.dishId === dishId && review.userId === userId);
    };

    return (
        <ReviewsContext.Provider value={{
            reviews,
            addReview,
            updateReview,
            deleteReview,
            getReviewsByDish,
            getReviewsByUser,
            getAverageRating,
            getReviewCount,
            hasUserReviewed,
        }}>
            {children}
        </ReviewsContext.Provider>
    );
}

export function useReviews() {
    const context = useContext(ReviewsContext);
    if (!context) {
        throw new Error('useReviews must be used within ReviewsProvider');
    }
    return context;
}
