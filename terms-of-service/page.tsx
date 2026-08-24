"use client";

export default function TermsOfServicePage() {
  return (
    <div className="terms-container" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .terms-container h1 { font-family: "Playfair Display", serif; font-size: 2.5rem; color: #1b3a2a; margin-bottom: 30px; border-bottom: 3px solid #3a7d44; padding-bottom: 15px; }
        .terms-container h2 { font-family: "Playfair Display", serif; font-size: 1.5rem; color: #1b3a2a; margin-top: 40px; margin-bottom: 15px; }
        .terms-container p { font-size: 1rem; color: #4a7060; line-height: 1.8; margin-bottom: 15px; }
        .terms-container ul { margin-left: 20px; margin-bottom: 20px; }
        .terms-container li { color: #4a7060; line-height: 1.8; margin-bottom: 8px; }
        .last-updated { font-size: 0.875rem; color: #6b8b75; font-style: italic; margin-bottom: 30px; }
      `}</style>
      <h1>Terms of Service</h1>
      <p className="last-updated">Last updated: April 29, 2026</p>
      <p>Welcome to ComfyGo. By accessing or using our website and services, you agree to be bound by these Terms of Service.</p>
      <h2>1. Acceptance of Terms</h2>
      <p>By creating an account or using ComfyGo services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, our Privacy Policy, and any additional guidelines we may publish.</p>
      <h2>2. User Accounts</h2>
      <p>When you create an account, you agree to:</p>
      <ul><li>Provide accurate, current, and complete information</li><li>Maintain the security of your password and account</li><li>Notify us immediately of any unauthorized use</li><li>Be responsible for all activities under your account</li></ul>
      <h2>3. Booking and Cancellations</h2>
      <p>All bookings are subject to availability and confirmation by the respective service providers.</p>
      <ul><li>Prices are subject to change without notice until booking is confirmed</li><li>Cancellation policies vary by service provider</li><li>Refunds are processed according to the cancellation policy of each provider</li><li>No-shows may forfeit refunds</li></ul>
      <h2>4. User Conduct</h2>
      <p>You agree not to:</p>
      <ul><li>Use the platform for any illegal purpose</li><li>Attempt to gain unauthorized access to our systems</li><li>Submit false or misleading information</li><li>Interfere with other users' enjoyment of the service</li></ul>
      <h2>5. Payment and Fees</h2>
      <p>By making a booking, you agree to pay all applicable fees and charges and provide valid payment information.</p>
      <h2>6. Intellectual Property</h2>
      <p>All content on this website is owned by ComfyGo or its licensors and is protected by intellectual property laws.</p>
      <h2>7. Limitation of Liability</h2>
      <p>ComfyGo and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.</p>
      <h2>8. Governing Law</h2>
      <p>These terms are governed by the laws of Bangladesh. Any disputes shall be resolved in the courts of Sylhet, Bangladesh.</p>
      <h2>9. Contact Information</h2>
      <p>If you have any questions about these Terms of Service, please contact us at legal@comfygo.com or +880 1234 567890.</p>
    </div>
  );
}
