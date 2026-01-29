import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.icon}>🍳</div>
                <h2 className={styles.title}>Dish Not Found!</h2>
                <p className={styles.description}>
                    Oops! It looks like the page you're looking for isn't on the menu.
                    It might have been moved, deleted, or never existed in the first place.
                </p>
                <Link href="/" className={styles.homeBtn}>
                    Return Home 🏠
                </Link>
            </div>
        </div>
    );
}
