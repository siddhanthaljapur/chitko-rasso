import LoadingSkeleton from '@/components/LoadingSkeleton';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function Loading() {
    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
            <Navbar />
            <Breadcrumbs />
            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <LoadingSkeleton type="title" width="200px" />
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <LoadingSkeleton type="banner" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <LoadingSkeleton count={6} type="card" />
                </div>
            </div>
        </div>
    );
}
