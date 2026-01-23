import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={`${styles.heroTitle} animate-fadeInUp`}>
              CHITKO RASSO
            </h1>
            <p className={`${styles.heroTagline} animate-fadeInUp`}>
              Authentic Saoji Flavours from Hyderabad
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
          </div>
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
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerSection}>
              <h3 className={styles.footerBrand}>CHITKO RASSO</h3>
              <p>Authentic Saoji Flavours from the Heart of Nagpur</p>
              <div className={styles.socialLinks}>
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="Instagram">📷</a>
                <a href="#" aria-label="Twitter">🐦</a>
              </div>
            </div>

            <div className={styles.footerSection}>
              <h4>Quick Links</h4>
              <ul>
                <li><Link href="/menu">Menu</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4>Contact Us</h4>
              <p>📍 Secunderabad, Hyderabad</p>
              <p>📞 +91 XXXXX XXXXX</p>
              <p>✉️ info@chitkrasso.com</p>
              <p>🏅 FSSAI Lic: XXXXXXXXXXXXX</p>
            </div>

            <div className={styles.footerSection}>
              <h4>Opening Hours</h4>
              <p>Monday - Sunday</p>
              <p>11:00 AM - 11:00 PM</p>
              <Link href="/menu" className={styles.btnPrimary} style={{ marginTop: '1rem', display: 'inline-block' }}>
                Order Now
              </Link>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>&copy; 2026 CHITKO RASSO. All rights reserved.</p>
            <div className={styles.footerLinks}>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
