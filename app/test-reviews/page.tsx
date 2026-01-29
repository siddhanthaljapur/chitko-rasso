'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReviews } from '@/lib/context/ReviewsContext';
import { useToast } from '@/lib/context/ToastContext';

export default function TestReviewsPage() {
    const router = useRouter();
    const { addReview, reviews } = useReviews();
    const { showToast } = useToast();
    const [isCreating, setIsCreating] = useState(false);

    const createTestReviews = () => {
        setIsCreating(true);

        const testReviews = [
            {
                dishId: 'butter-chicken',
                userId: 'customer1@test.com',
                userName: 'Rajesh Kumar',
                rating: 5 as 1 | 2 | 3 | 4 | 5,
                comment: 'Absolutely delicious! Best butter chicken I have ever had. The gravy was rich and creamy.'
            },
            {
                dishId: 'paneer-tikka',
                userId: 'customer2@test.com',
                userName: 'Priya Sharma',
                rating: 4 as 1 | 2 | 3 | 4 | 5,
                comment: 'Great taste and perfectly spiced. The paneer was soft and well-marinated.'
            },
            {
                dishId: 'dal-makhani',
                userId: 'customer1@test.com',
                userName: 'Rajesh Kumar',
                rating: 5 as 1 | 2 | 3 | 4 | 5,
                comment: 'Creamy and rich! Reminded me of home-cooked food. Highly recommended!'
            },
            {
                dishId: 'chicken-biryani',
                userId: 'customer3@test.com',
                userName: 'Amit Patel',
                rating: 5 as 1 | 2 | 3 | 4 | 5,
                comment: 'Amazing biryani! The rice was perfectly cooked and the chicken was tender.'
            },
            {
                dishId: 'naan',
                userId: 'customer2@test.com',
                userName: 'Priya Sharma',
                rating: 4 as 1 | 2 | 3 | 4 | 5,
                comment: 'Fresh and soft naan. Goes perfectly with the curries.'
            },
            {
                dishId: 'gulab-jamun',
                userId: 'customer3@test.com',
                userName: 'Amit Patel',
                rating: 5 as 1 | 2 | 3 | 4 | 5,
                comment: 'Sweet perfection! Not too sugary, just right. Best dessert ever!'
            },
            {
                dishId: 'tandoori-chicken',
                userId: 'customer4@test.com',
                userName: 'Sneha Reddy',
                rating: 4 as 1 | 2 | 3 | 4 | 5,
                comment: 'Smoky and flavorful. The marinade was excellent!'
            },
            {
                dishId: 'palak-paneer',
                userId: 'customer4@test.com',
                userName: 'Sneha Reddy',
                rating: 5 as 1 | 2 | 3 | 4 | 5,
                comment: 'Healthy and delicious! The spinach gravy was smooth and the paneer was fresh.'
            }
        ];

        testReviews.forEach(review => {
            addReview(review);
        });

        showToast(`✅ Created ${testReviews.length} test reviews successfully!`, 'success');
        setIsCreating(false);
    };

    const clearAllReviews = () => {
        localStorage.removeItem('chitko_reviews');
        showToast('🗑️ All reviews cleared!', 'success');
        window.location.reload();
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '3rem',
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    marginBottom: '1rem',
                    color: '#1f2937',
                    textAlign: 'center'
                }}>
                    🧪 Test Reviews Generator
                </h1>

                <p style={{
                    color: '#6b7280',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    lineHeight: '1.6'
                }}>
                    Click the button below to create 8 sample reviews with different customers and ratings.
                    These will immediately appear in the admin reviews page.
                </p>

                <div style={{
                    background: '#f3f4f6',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: '0.75rem',
                        color: '#374151'
                    }}>
                        📊 Current Status:
                    </h3>
                    <p style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#ff6b35',
                        margin: 0
                    }}>
                        {reviews.length} Reviews in Database
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <button
                        onClick={createTestReviews}
                        disabled={isCreating}
                        style={{
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #ff6b35 0%, #e55a28 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: isCreating ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
                            opacity: isCreating ? 0.6 : 1
                        }}
                    >
                        {isCreating ? '⏳ Creating...' : '✨ Create 8 Test Reviews'}
                    </button>

                    <button
                        onClick={() => router.push('/admin/reviews')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        👀 View Admin Reviews Page
                    </button>

                    <button
                        onClick={clearAllReviews}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'transparent',
                            color: '#dc2626',
                            border: '2px solid #dc2626',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        🗑️ Clear All Reviews
                    </button>
                </div>

                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: '#fef3c7',
                    borderRadius: '8px',
                    borderLeft: '4px solid #f59e0b'
                }}>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#92400e',
                        margin: 0,
                        lineHeight: '1.5'
                    }}>
                        <strong>💡 Tip:</strong> After creating reviews, click "View Admin Reviews Page" to see them in the admin panel. You can also navigate to <code>/admin/reviews</code> manually.
                    </p>
                </div>
            </div>
        </div>
    );
}
