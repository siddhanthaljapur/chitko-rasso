import styles from './LoadingSkeleton.module.css';

interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    className?: string;
    type?: 'text' | 'title' | 'card' | 'circle' | 'custom' | 'banner';
    style?: React.CSSProperties;
    count?: number;
}

export default function LoadingSkeleton({
    width,
    height,
    borderRadius,
    className = '',
    type = 'custom',
    count = 1
}: SkeletonProps) {

    // Determine class based on type
    const typeClass = type !== 'custom' ? styles[type] : '';

    // Inline styles override CSS classes if provided
    const style = {
        width,
        height,
        borderRadius
    };

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`${styles.skeleton} ${typeClass} ${className}`}
                    style={style}
                    aria-hidden="true"
                />
            ))}
        </>
    );
}
