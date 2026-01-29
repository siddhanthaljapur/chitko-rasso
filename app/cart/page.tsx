
import { Suspense } from 'react';
import CartContent from './CartContent';
import styles from './cart.module.css';

export default function CartPage() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '2rem' }}>Loading cart...</div>}>
            <CartContent />
        </Suspense>
    );
}
