"use client";

import { useEffect } from "react";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/styles/about.css";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .pp h1 { font-family: "Playfair Display", serif; font-size: 2.5rem; color: #1b3a2a; margin-bottom: 30px; border-bottom: 3px solid #3a7d44; padding-bottom: 15px; }
        .pp h2 { font-family: "Playfair Display", serif; font-size: 1.5rem; color: #1b3a2a; margin-top: 40px; margin-bottom: 15px; }
        .pp p { font-size: 1rem; color: #4a7060; line-height: 1.8; margin-bottom: 15px; }
        .pp ul { margin-left: 20px; margin-bottom: 20px; }
        .pp li { color: #4a7060; line-height: 1.8; margin-bottom: 8px; }
        .pp .updated { font-size: 0.875rem; color: #6b8b75; font-style: italic; margin-bottom: 30px; }
      `}</style>
      <div className="pp">
        <h1>Privacy Policy</h1>
        <p className="updated">Last updated: April 29, 2026</p>
        <p>At ComfyGo, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.</p>
        <h2>1. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li><strong>Personal Information:</strong> Name, email address, phone number, and payment details when you create an account or make a booking.</li>
          <li><strong>Usage Data:</strong> Pages visited, time spent on the site, and interaction patterns to improve our services.</li>
          <li><strong>Device Information:</strong> Browser type, operating system, and IP address for security and analytics purposes.</li>
        </ul>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To process bookings and payments</li>
          <li>To communicate with you about your reservations</li>
          <li>To improve our website and services</li>
          <li>To send promotional communications (with your consent)</li>
          <li>To ensure platform security and prevent fraud</li>
        </ul>
        <h2>3. Data Sharing</h2>
        <p>We do not sell your personal information. We may share your data with:</p>
        <ul>
          <li>Hotels, guides, and transport providers to fulfil your bookings</li>
          <li>Payment processors for secure transaction handling</li>
          <li>Legal authorities when required by law</li>
        </ul>
        <h2>4. Data Security</h2>
        <p>We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data.</p>
        <h2>5. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. Contact us at privacy@comfygo.com to exercise these rights.</p>
        <h2>6. Contact Us</h2>
        <p>For questions about this Privacy Policy, contact us at privacy@comfygo.com or call +880 1234 567890.</p>
      </div>
    </div>
  );
}
