'use client';

import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import styles from '../about/about.module.css';

export default function FAQPage() {

    // Static content - FAQ array
    const faqs = [
        {
            category: "Orders & Delivery",
            questions: [
                {
                    q: "What are your delivery hours?",
                    a: "We deliver from 11:00 AM to 11:00 PM, 7 days a week."
                },
                {
                    q: "What is the delivery charge?",
                    a: "Delivery charge is ₹40 for all orders. Free delivery on orders above ₹500."
                },
                {
                    q: "How long does delivery take?",
                    a: "Typical delivery time is 30-45 minutes depending on your location in Secunderabad."
                },
                {
                    q: "Do you deliver outside Secunderabad?",
                    a: "Currently, we only deliver within Secunderabad and nearby areas in Hyderabad."
                },
                {
                    q: "Can I track my order?",
                    a: "Yes! You can track your order status in real-time from your profile page after logging in."
                }
            ]
        },
        {
            category: "Menu & Food",
            questions: [
                {
                    q: "What is Saoji cuisine?",
                    a: "Saoji cuisine originates from Nagpur and is known for its bold, spicy flavors and aromatic spices. It's a unique culinary tradition that we bring to Hyderabad."
                },
                {
                    q: "Do you have vegetarian options?",
                    a: "Yes! We have a wide range of vegetarian dishes including Saoji Veg Curry, Paneer Masala, Veg Biryani, and more."
                },
                {
                    q: "How spicy is the food?",
                    a: "Saoji food is traditionally spicy. Each dish has a spice level indicator. You can request mild spice levels in the order notes."
                },
                {
                    q: "Are your ingredients fresh?",
                    a: "Absolutely! We use only fresh, high-quality ingredients and prepare everything fresh daily."
                },
                {
                    q: "Do you cater to food allergies?",
                    a: "Please mention any allergies in the order notes, and we'll do our best to accommodate. Contact us at +91 7780552110 for specific concerns."
                }
            ]
        },
        {
            category: "Payment & Pricing",
            questions: [
                {
                    q: "What payment methods do you accept?",
                    a: "We accept UPI, Credit/Debit Cards, Net Banking through Razorpay, and Cash on Delivery (COD)."
                },
                {
                    q: "Is online payment secure?",
                    a: "Yes! All online payments are processed through Razorpay, a secure and trusted payment gateway."
                },
                {
                    q: "Do you charge GST?",
                    a: "Yes, 5% GST is applicable on all orders as per government regulations."
                },
                {
                    q: "Can I get a refund?",
                    a: "Refunds are processed for cancelled orders or in case of quality issues. Please contact us within 24 hours."
                }
            ]
        },
        {
            category: "Account & Profile",
            questions: [
                {
                    q: "Do I need to create an account to order?",
                    a: "Yes, creating an account helps us provide better service and allows you to track orders and save addresses."
                },
                {
                    q: "How do I reset my password?",
                    a: "Currently, please contact us at info@chitkrasso.com to reset your password. Self-service password reset is coming soon!"
                },
                {
                    q: "Can I save multiple delivery addresses?",
                    a: "Currently, you can update your delivery address for each order. Multiple saved addresses feature is coming soon!"
                }
            ]
        },
        {
            category: "General",
            questions: [
                {
                    q: "Are you FSSAI certified?",
                    a: "Yes! We are FSSAI certified (License No: 23625036000683) and follow all food safety standards."
                },
                {
                    q: "Do you accept bulk orders?",
                    a: "Yes! For bulk orders or catering, please call us at +91 7780552110 at least 24 hours in advance."
                },
                {
                    q: "Can I cancel my order?",
                    a: "You can cancel within 5 minutes of placing the order. After that, please contact us immediately at +91 7780552110."
                },
                {
                    q: "How can I provide feedback?",
                    a: "We love hearing from you! Email us at info@chitkrasso.com or call +91 7780552110."
                }
            ]
        }
    ];

    return (
        <div className={styles.aboutPage}>
            <Navbar />
            <Breadcrumbs />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <h1>Frequently Asked Questions</h1>
                    <p>Find answers to common questions about CHITKO RASSO</p>
                </div>
            </section>

            {/* FAQ Content */}
            <section className={styles.content}>
                <div className="container">
                    {faqs.map((category, idx) => (
                        <div key={idx} style={{ marginBottom: '3rem' }}>
                            <h2 style={{ color: '#ff6b35', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                                {category.category}
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {category.questions.map((faq, qIdx) => (
                                    <div key={qIdx} style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}>
                                        <h3 style={{ color: '#1e3c72', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                                            Q: {faq.q}
                                        </h3>
                                        <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                                            A: {faq.a}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Contact Section */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                        color: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        textAlign: 'center',
                        marginTop: '3rem'
                    }}>
                        <h2 style={{ marginBottom: '1rem' }}>Still have questions?</h2>
                        <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
                            We're here to help! Reach out to us anytime.
                        </p>
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <div>
                                <strong>📞 Phone:</strong> +91 7780552110
                            </div>
                            <div>
                                <strong>✉️ Email:</strong> info@chitkrasso.com
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
