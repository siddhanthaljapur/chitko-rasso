'use client';

import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import styles from '../about/about.module.css';

export default function TermsPage() {
    return (
        <div className={styles.aboutPage}>
            <Navbar />
            <Breadcrumbs />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <h1>Terms & Conditions</h1>
                    <p>Last updated: January 24, 2026</p>
                </div>
            </section>

            {/* Terms Content */}
            <section className={styles.content}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <div style={{ lineHeight: '1.8', color: '#333' }}>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using CHITKO RASSO's website and services, you accept and agree to be bound by these
                            Terms and Conditions. If you do not agree to these terms, please do not use our services.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>2. Services</h2>
                        <p>
                            CHITKO RASSO operates as a cloud kitchen providing online food ordering and delivery services in
                            Secunderabad and nearby areas in Hyderabad. We reserve the right to modify, suspend, or discontinue
                            any part of our services at any time.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>3. User Accounts</h2>
                        <ul>
                            <li>You must be at least 18 years old to create an account and place orders</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                            <li>You agree to provide accurate, current, and complete information</li>
                            <li>You are responsible for all activities under your account</li>
                            <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                        </ul>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>4. Orders and Payments</h2>
                        <p><strong>Order Placement:</strong></p>
                        <ul>
                            <li>All orders are subject to acceptance and availability</li>
                            <li>We reserve the right to refuse or cancel any order</li>
                            <li>Prices are subject to change without notice</li>
                            <li>Menu items and availability may vary</li>
                        </ul>
                        <p><strong>Payment:</strong></p>
                        <ul>
                            <li>Payment must be made at the time of order placement (online) or delivery (COD)</li>
                            <li>All prices include applicable GST (5%)</li>
                            <li>Delivery charges apply as per current rates</li>
                            <li>Online payments are processed through Razorpay's secure gateway</li>
                        </ul>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>5. Delivery</h2>
                        <ul>
                            <li>Delivery times are estimates and may vary based on location and demand</li>
                            <li>Delivery is available only within our service areas</li>
                            <li>You must provide accurate delivery address and contact information</li>
                            <li>We are not responsible for delays due to incorrect address or unavailability at delivery location</li>
                            <li>Delivery personnel have the right to refuse delivery if customer behavior is inappropriate</li>
                        </ul>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>6. Cancellations and Refunds</h2>
                        <p><strong>Cancellation Policy:</strong></p>
                        <ul>
                            <li>Orders can be cancelled within 5 minutes of placement</li>
                            <li>After 5 minutes, cancellation is subject to approval</li>
                            <li>We reserve the right to cancel orders due to unavailability or other reasons</li>
                        </ul>
                        <p><strong>Refund Policy:</strong></p>
                        <ul>
                            <li>Refunds for cancelled orders will be processed within 5-7 business days</li>
                            <li>Refunds for quality issues must be reported within 24 hours</li>
                            <li>Refunds will be issued to the original payment method</li>
                            <li>COD orders are not eligible for refunds unless there's a quality issue</li>
                        </ul>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>7. Food Safety and Quality</h2>
                        <ul>
                            <li>We maintain FSSAI certification (License No: 23625036000683)</li>
                            <li>All food is prepared following strict hygiene and safety standards</li>
                            <li>We use fresh, quality ingredients</li>
                            <li>Please inform us of any food allergies or dietary restrictions before ordering</li>
                            <li>We are not liable for allergic reactions if allergens were not disclosed</li>
                        </ul>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>8. Intellectual Property</h2>
                        <p>
                            All content on our website, including text, graphics, logos, images, and software, is the property of
                            CHITKO RASSO and protected by copyright laws. You may not reproduce, distribute, or use any content
                            without our written permission.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>9. User Conduct</h2>
                        <p>You agree NOT to:</p>
                        <ul>
                            <li>Use our services for any illegal or unauthorized purpose</li>
                            <li>Harass, abuse, or harm our staff or delivery personnel</li>
                            <li>Provide false or misleading information</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with the proper functioning of our services</li>
                        </ul>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>10. Limitation of Liability</h2>
                        <p>
                            CHITKO RASSO shall not be liable for any indirect, incidental, special, or consequential damages
                            arising from the use of our services. Our total liability shall not exceed the amount paid for the
                            order in question.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>11. Indemnification</h2>
                        <p>
                            You agree to indemnify and hold CHITKO RASSO harmless from any claims, damages, or expenses arising
                            from your use of our services or violation of these terms.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>12. Governing Law</h2>
                        <p>
                            These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the
                            exclusive jurisdiction of courts in Hyderabad, Telangana.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>13. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms and Conditions at any time. Changes will be effective
                            immediately upon posting. Your continued use of our services constitutes acceptance of the modified terms.
                        </p>

                        <h2 style={{ color: '#ff6b35', marginTop: '2rem', marginBottom: '1rem' }}>14. Contact Information</h2>
                        <p>For questions about these Terms and Conditions, please contact us:</p>
                        <ul>
                            <li><strong>Email:</strong> info@chitkrasso.com</li>
                            <li><strong>Phone:</strong> +91 7780552110</li>
                            <li><strong>Address:</strong> Secunderabad, Hyderabad</li>
                            <li><strong>FSSAI License:</strong> 23625036000683</li>
                        </ul>

                        <div style={{
                            background: '#f8f9fa',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            marginTop: '2rem',
                            borderLeft: '4px solid #ff6b35'
                        }}>
                            <p style={{ margin: 0, fontWeight: 600 }}>
                                By placing an order, you acknowledge that you have read, understood, and agree to be bound by
                                these Terms and Conditions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
