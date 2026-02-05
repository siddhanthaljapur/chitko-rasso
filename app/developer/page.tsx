'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './developer.module.css';

export default function DeveloperPage() {
    const [imageError, setImageError] = useState(false);

    const socialLinks = [
        {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/in/siddhanth-aljapur-687a57284',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
            )
        },
        {
            name: 'GitHub',
            url: 'https://github.com/siddhanthaljapur',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
            )
        },
        {
            name: 'Instagram',
            url: 'https://www.instagram.com/siddhanth.aljapur?igsh=Z3M0MDVhbnhkZzFi',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
            )
        },
        {
            name: 'Email',
            url: 'mailto:siddhanth.aljapur13@gmail.com',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
            )
        },
        {
            name: 'Portfolio',
            url: 'https://siddhanthaljapur.in',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            )
        }
    ];

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <Link href="/" className={styles.backButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Home
                </Link>

                <div className={styles.heroContent}>
                    <div className={styles.profileImageContainer}>
                        {!imageError ? (
                            <Image
                                src="/developer-photo.jpg"
                                alt="Siddhanth Aljapur - Software Development Engineer"
                                width={250}
                                height={250}
                                className={styles.heroImage}
                                onError={() => setImageError(true)}
                                priority
                            />
                        ) : (
                            <div className={styles.heroImagePlaceholder}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className={styles.heroText}>
                        <h1 className={styles.heroName}>Siddhanth Aljapur</h1>
                        <p className={styles.heroTitle}>Software Development Engineer</p>
                        <p className={styles.heroTagline}>Building scalable solutions, one line at a time</p>

                        <div className={styles.heroSocial}>
                            {socialLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.heroSocialLink}
                                    title={link.name}
                                >
                                    <span className={styles.socialIcon}>{link.icon}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.scrollIndicator}>
                    <span>Scroll to explore</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <polyline points="19 12 12 19 5 12"></polyline>
                    </svg>
                </div>
            </section>

            {/* About Section */}
            <section className={styles.section}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>About Me</h2>
                    <div className={styles.aboutContent}>
                        <p className={styles.aboutText}>
                            Multi-skilled Software Development Engineer with experience building scalable full-stack
                            applications using modern frontend, backend systems, and PostgreSQL/MongoDB. Skilled in
                            designing low-latency REST APIs, secure authentication/payment workflows, and optimized
                            system architectures.
                        </p>
                        <p className={styles.aboutText}>
                            Delivered end-to-end products including hyperlocal delivery platforms, social systems,
                            and e-commerce solutions with production-grade code.
                        </p>
                    </div>
                </div>
            </section>


            {/* Project Showcase */}
            <section className={styles.section}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Featured Project: Chitko Rasso</h2>
                    <div className={styles.projectCard}>
                        <div className={styles.projectHeader}>
                            <h3>Hyperlocal Food Delivery Platform</h3>
                            <p className={styles.projectCredit}>
                                Designed, Developed & Maintained by <strong>Siddhanth Aljapur</strong>
                            </p>
                        </div>

                        <p className={styles.projectDescription}>
                            A comprehensive food delivery ecosystem built from scratch, featuring a customer-facing app,
                            admin dashboard, POS integration, and real-time order tracking. This platform demonstrates
                            enterprise-level architecture and integration capabilities.
                        </p>

                        <div className={styles.featuresGrid}>
                            <div className={styles.featureCard}>
                                <span className={styles.featureIcon}>🔐</span>
                                <h4>Secure Authentication</h4>
                                <p>NextAuth with OTP verification and role-based access control</p>
                            </div>
                            <div className={styles.featureCard}>
                                <span className={styles.featureIcon}>💳</span>
                                <h4>Payment Gateway</h4>
                                <p>Razorpay integration with webhook handling and refunds</p>
                            </div>
                            <div className={styles.featureCard}>
                                <span className={styles.featureIcon}>🚚</span>
                                <h4>Logistics Automation</h4>
                                <p>Uber Direct & Ola API integration for delivery dispatch</p>
                            </div>
                            <div className={styles.featureCard}>
                                <span className={styles.featureIcon}>📊</span>
                                <h4>Real-time Analytics</h4>
                                <p>Live dashboard with sales tracking and insights</p>
                            </div>
                            <div className={styles.featureCard}>
                                <span className={styles.featureIcon}>📱</span>
                                <h4>Mobile-First Design</h4>
                                <p>Responsive UI optimized for all screen sizes</p>
                            </div>
                            <div className={styles.featureCard}>
                                <span className={styles.featureIcon}>⚡</span>
                                <h4>Performance Optimized</h4>
                                <p>SSR, caching, and sub-150ms API responses</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className={`${styles.section} ${styles.ctaSection}`}>
                <div className={styles.container}>
                    <h2 className={styles.ctaTitle}>Let's Connect</h2>
                    <p className={styles.ctaText}>
                        Interested in collaboration or have a project in mind? Feel free to reach out!
                    </p>
                    <div className={styles.ctaButtons}>
                        <a href="mailto:siddhanth.aljapur13@gmail.com" className={styles.ctaButton}>
                            Send Email
                        </a>
                        <a href="https://siddhanthaljapur.in" target="_blank" rel="noopener noreferrer" className={`${styles.ctaButton} ${styles.ctaButtonSecondary}`}>
                            View Portfolio
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
