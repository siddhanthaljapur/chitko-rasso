'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PromoPopup from '@/components/PromoPopup';
import ActiveOrderFloat from '@/components/ActiveOrderFloat';
import VideoShowcase from '@/components/VideoShowcase';
import styles from './page.module.css';

export default function Home() {
  // Navbar handles auth state display
  // Keeping context hooks if needed for future features

  return (
    <main className={styles.main}>
      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={`${styles.heroTitle} animate-fadeInUp`}>
              CHITKO RASSO
            </h1>
            <p className={`${styles.heroTagline} animate-fadeInUp`}>
              Authentic Saoji Flavours from the Heart of Hyderabad
            </p>
            <div className={`${styles.heroCta} animate-fadeInUp`}>
              <Link href="/menu" className={styles.btnPrimary}>
                Order Now
              </Link>
              <Link href="/menu" className={styles.btnSecondary}>
                View Menu
              </Link>
            </div>
          </div>
          <div className={`${styles.heroImage} animate-float`}>
            <Image
              src="/hero-food.png"
              alt="Authentic Saoji Cuisine"
              width={600}
              height={600}
              priority
            />
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className={styles.highlights}>
        <div className="container">
          <div className={styles.highlightsGrid}>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>⭐</div>
              <h3>4.0 Rating</h3>
              <p>Loved by customers</p>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>🚚</div>
              <h3>Delivery Only</h3>
              <p>Fresh to your door</p>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>✓</div>
              <h3>FSSAI Licensed</h3>
              <p>Safe & hygienic</p>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>🌶️</div>
              <h3>Authentic Saoji</h3>
              <p>Traditional recipes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className={styles.categories}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Popular Categories</h2>
          <p className={styles.sectionSubtitle}>
            Explore our signature dishes crafted with authentic Saoji spices
          </p>

          <div className={styles.categoriesGrid}>
            <Link href="/menu?category=starters" className={styles.categoryCard}>
              <div className={styles.categoryImage}>
                <Image
                  src="/starters.png"
                  alt="Starters"
                  width={400}
                  height={300}
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.categoryOverlay}></div>
              </div>
              <div className={styles.categoryContent}>
                <h3>Starters</h3>
                <p>Spicy kababs & appetizers</p>
              </div>
            </Link>

            <Link href="/menu?category=biryanis" className={styles.categoryCard}>
              <div className={styles.categoryImage}>
                <Image
                  src="/biryani.png"
                  alt="Biryanis"
                  width={400}
                  height={300}
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.categoryOverlay}></div>
              </div>
              <div className={styles.categoryContent}>
                <h3>Biryanis</h3>
                <p>Aromatic Saoji-style biryanis</p>
              </div>
            </Link>

            <Link href="/menu?category=thalis" className={styles.categoryCard}>
              <div className={styles.categoryImage}>
                <Image
                  src="/thali.png"
                  alt="Saoji Thalis"
                  width={400}
                  height={300}
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.categoryOverlay}></div>
              </div>
              <div className={styles.categoryContent}>
                <h3>Saoji Thalis</h3>
                <p>Complete traditional meals</p>
              </div>
            </Link>

            <Link href="/menu?category=rice-bowls" className={styles.categoryCard}>
              <div className={styles.categoryImage}>
                <Image
                  src="/rice-bowl.png"
                  alt="Rice Bowls"
                  width={400}
                  height={300}
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.categoryOverlay}></div>
              </div>
              <div className={styles.categoryContent}>
                <h3>Rice Bowls</h3>
                <p>Quick & delicious meals</p>
              </div>
            </Link>

            <Link href="/menu?category=chinese" className={styles.categoryCard}>
              <div className={styles.categoryImage}>
                <Image
                  src="/chinese_category.png"
                  alt="Chinese"
                  width={400}
                  height={300}
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.categoryOverlay}></div>
              </div>
              <div className={styles.categoryContent}>
                <h3>Chinese</h3>
                <p>Noodles, Manchurian & more</p>
              </div>
            </Link>

            <Link href="/menu?category=tandoori" className={styles.categoryCard}>
              <div className={styles.categoryImage}>
                <Image
                  src="/tandoori_category.png"
                  alt="Tandoori"
                  width={400}
                  height={300}
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.categoryOverlay}></div>
              </div>
              <div className={styles.categoryContent}>
                <h3>Tandoori</h3>
                <p>Smoky clay oven specials</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <VideoShowcase />

      {/* Track Order Widget */}
      <section className={styles.trackSection} style={{ background: '#f8f9fa', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Track Your Order 🛵</h2>
          <p className={styles.sectionSubtitle}>Enter your Order ID to see live delivery status</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('orderId') as HTMLInputElement;
              if (input.value) window.location.href = `/track?orderId=${input.value}`;
            }}
            style={{ maxWidth: '500px', margin: '2rem auto', display: 'flex', gap: '1rem' }}
          >
            <input
              name="orderId"
              type="text"
              placeholder="e.g. ORD-123456789"
              required
              style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
            <button
              type="submit"
              style={{ background: '#ff6b35', color: 'white', border: 'none', padding: '0 2rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
            >
              Track
            </button>
          </form>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What Our Customers Say</h2>

          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialStars}>⭐⭐⭐⭐⭐</div>
              <p className={styles.testimonialText}>
                "The authentic Saoji flavors are incredible! Best biryani I've had in Hyderabad."
              </p>
              <div className={styles.testimonialAuthor}>
                <strong>Rajesh Kumar</strong>
                <span>Secunderabad</span>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.testimonialStars}>⭐⭐⭐⭐⭐</div>
              <p className={styles.testimonialText}>
                "Spice level is perfect! The mutton curry reminds me of home-cooked meals."
              </p>
              <div className={styles.testimonialAuthor}>
                <strong>Priya Sharma</strong>
                <span>Begumpet</span>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.testimonialStars}>⭐⭐⭐⭐</div>
              <p className={styles.testimonialText}>
                "Fast delivery and amazing packaging. The food arrived hot and fresh!"
              </p>
              <div className={styles.testimonialAuthor}>
                <strong>Amit Patel</strong>
                <span>Banjara Hills</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Promo Popup */}
      <PromoPopup />

      {/* Floating Active Order Widget */}
      <ActiveOrderFloat />
    </main>
  );
}
