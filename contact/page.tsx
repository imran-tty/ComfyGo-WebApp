"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { submitContact } from "@/lib/api";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await submitContact({ name, email, phone, message });
      setSuccess(res.message);
      setName(""); setEmail(""); setPhone(""); setMessage("");
    } catch (err: any) {
      setError(err.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

        .contact-page { padding-top: 72px; }

        /* ========== HERO ========== */
        .contact-hero {
          position: relative;
          height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .contact-hero-bg {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=85') center/cover no-repeat;
        }
        .contact-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10,77,66,0.88) 0%, rgba(13,92,80,0.75) 50%, rgba(232,120,60,0.3) 100%);
        }
        .contact-hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 24px;
          animation: fadeSlideUp 0.8s ease-out;
        }
        .contact-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 50px;
          padding: 8px 20px;
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .contact-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 14px;
        }
        .contact-hero h1 span { color: #E8783C; }
        .contact-hero p {
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          color: rgba(255,255,255,0.8);
          max-width: 500px;
          margin: 0 auto;
        }

        /* ========== INFO CARDS ========== */
        .contact-info-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1000px;
          margin: -50px auto 0;
          padding: 0 24px;
          position: relative;
          z-index: 3;
        }
        .contact-info-card {
          background: #fff;
          border: 1px solid #E4E8E4;
          border-radius: 16px;
          padding: 28px 24px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(10,77,66,0.06);
          transition: all 0.35s ease;
        }
        .contact-info-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(10,77,66,0.12);
        }
        .contact-info-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, #0A4D42, #0D5C50);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          color: #fff;
        }
        .contact-info-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 6px;
        }
        .contact-info-card p {
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          color: #6B7280;
          margin: 0;
        }
        .contact-info-card a {
          color: #0A4D42;
          text-decoration: none;
          font-weight: 600;
        }

        /* ========== MAIN CONTENT ========== */
        .contact-body {
          max-width: 1100px;
          margin: 0 auto;
          padding: 72px 24px;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 48px;
          align-items: start;
        }

        /* Left: Map + Hours */
        .contact-left h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 8px;
        }
        .contact-left > p {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          color: #6B7280;
          margin-bottom: 28px;
          line-height: 1.6;
        }
        .contact-map {
          width: 100%;
          height: 260px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #E4E8E4;
          box-shadow: 0 4px 20px rgba(10,77,66,0.06);
          margin-bottom: 28px;
        }
        .contact-map iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
        .contact-hours {
          background: #F6F8F7;
          border: 1px solid #E4E8E4;
          border-radius: 14px;
          padding: 24px;
        }
        .contact-hours h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .contact-hours h3 i { color: #E8783C; }
        .contact-hours-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #E4E8E4;
          font-family: 'Inter', sans-serif;
        }
        .contact-hours-row:last-child { border-bottom: none; }
        .contact-hours-day {
          font-size: 0.88rem;
          font-weight: 500;
          color: #1A1A1A;
        }
        .contact-hours-time {
          font-size: 0.88rem;
          color: #6B7280;
        }

        /* Right: Form */
        .contact-form-wrap {
          background: #fff;
          border: 1px solid #E4E8E4;
          border-radius: 18px;
          padding: 36px;
          box-shadow: 0 4px 24px rgba(10,77,66,0.06);
        }
        .contact-form-header {
          margin-bottom: 28px;
        }
        .contact-form-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 6px;
        }
        .contact-form-header p {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          color: #6B7280;
        }
        .contact-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .contact-field {
          margin-bottom: 4px;
        }
        .contact-field.full { grid-column: 1 / -1; }
        .contact-field label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }
        .contact-field label i {
          color: #0A4D42;
          font-size: 0.85rem;
        }
        .contact-field input,
        .contact-field textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E4E8E4;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.92rem;
          font-weight: 500;
          color: #1A1A1A;
          background: #FAFAFA;
          outline: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .contact-field textarea {
          resize: vertical;
          min-height: 130px;
        }
        .contact-field input:focus,
        .contact-field textarea:focus {
          border-color: #0A4D42;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(10,77,66,0.08);
        }
        .contact-field input::placeholder,
        .contact-field textarea::placeholder {
          color: #9CA3AF;
          font-weight: 400;
        }
        .contact-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #0A4D42, #0D5C50);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }
        .contact-submit:hover {
          background: linear-gradient(135deg, #083D34, #0A4D42);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(10,77,66,0.2);
        }
        .contact-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .alert-error {
          background: #FEF2F2;
          color: #A63B20;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #FECACA;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .alert-success {
          background: #F0FDF4;
          color: #0A4D42;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #BBF7D0;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ========== TEAM SECTION ========== */
        .contact-team {
          background: #F6F8F7;
          padding: 72px 24px;
        }
        .contact-team-inner {
          max-width: 1000px;
          margin: 0 auto;
        }
        .section-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .section-header .eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #E8783C;
          margin-bottom: 10px;
        }
        .section-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 12px;
        }
        .section-header p {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: #6B7280;
          max-width: 500px;
          margin: 0 auto;
        }
        .contact-team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .contact-team-card {
          background: #fff;
          border: 1px solid #E4E8E4;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.35s ease;
        }
        .contact-team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(10,77,66,0.1);
        }
        .contact-team-img {
          height: 200px;
          overflow: hidden;
        }
        .contact-team-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .contact-team-card:hover .contact-team-img img {
          transform: scale(1.06);
        }
        .contact-team-body {
          padding: 20px;
          text-align: center;
        }
        .contact-team-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 4px;
        }
        .contact-team-role {
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #E8783C;
          margin-bottom: 8px;
        }
        .contact-team-desc {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: #6B7280;
          line-height: 1.6;
        }

        /* ========== FOOTER ========== */
        .contact-footer {
          background: #102C27;
          padding: 56px 24px 32px;
          color: rgba(255,255,255,0.6);
        }
        .contact-footer-inner {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
        }
        .contact-footer-brand h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
        }
        .contact-footer-brand p {
          font-size: 0.85rem;
          line-height: 1.7;
        }
        .contact-footer-col h4 {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }
        .contact-footer-col a {
          display: block;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          font-size: 0.88rem;
          margin-bottom: 10px;
          transition: color 0.2s;
        }
        .contact-footer-col a:hover { color: #E8783C; }
        .contact-footer-bottom {
          max-width: 1000px;
          margin: 32px auto 0;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
          text-align: center;
          font-size: 0.82rem;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 800px) {
          .contact-hero { height: 340px; }
          .contact-info-cards { grid-template-columns: 1fr; margin-top: -30px; }
          .contact-body { grid-template-columns: 1fr; gap: 32px; padding: 48px 24px; }
          .contact-team-grid { grid-template-columns: 1fr; }
          .contact-form-grid { grid-template-columns: 1fr; }
          .contact-field.full { grid-column: auto; }
          .contact-footer-inner { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <Navbar activePage="contact" />

      <div className="contact-page">
        {/* Hero */}
        <div className="contact-hero">
          <div className="contact-hero-bg" />
          <div className="contact-hero-overlay" />
          <div className="contact-hero-content">
            <div className="contact-hero-badge">
              <i className="bi bi-chat-dots"></i>
              We&apos;re Here to Help
            </div>
            <h1>Get in <span>touch</span></h1>
            <p>Have questions or feedback? Our team in Bangladesh is ready to help you plan the perfect trip.</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="contact-info-cards">
          {[
            { icon: "bi-geo-alt", title: "Visit Us", value: "Sylhet, Bangladesh", sub: "Zindabazar, Sylhet 3100" },
            { icon: "bi-telephone", title: "Call Us", value: "+880 1234 567890", sub: "Sat–Thu, 9 AM – 8 PM" },
            { icon: "bi-envelope", title: "Email Us", value: "info@comfygo.com", sub: "We reply within 24 hours" },
          ].map((item) => (
            <div className="contact-info-card" key={item.title}>
              <div className="contact-info-icon"><i className={`bi ${item.icon}`}></i></div>
              <h3>{item.title}</h3>
              <p><a href="#">{item.value}</a></p>
              <p style={{fontSize:'0.8rem', marginTop:'4px'}}>{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="contact-body">
          {/* Left: Map + Hours */}
          <div className="contact-left">
            <h2>Find us in Sylhet</h2>
            <p>Our office is located in the heart of Sylhet city, easily accessible from all major hotels and landmarks.</p>

            <div className="contact-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58078.45355237899!2d91.8687576!3d24.8949296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3751122bc0936efb%3A0x836a1a53b6d63277!2sSylhet!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                allowFullScreen
                loading="lazy"
                title="ComfyGo Office Location"
              />
            </div>

            <div className="contact-hours">
              <h3><i className="bi bi-clock"></i> Business Hours</h3>
              {[
                { day: "Saturday – Wednesday", time: "9:00 AM – 8:00 PM" },
                { day: "Thursday", time: "9:00 AM – 6:00 PM" },
                { day: "Friday", time: "Closed" },
              ].map((h) => (
                <div className="contact-hours-row" key={h.day}>
                  <span className="contact-hours-day">{h.day}</span>
                  <span className="contact-hours-time">{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="contact-form-wrap">
            <div className="contact-form-header">
              <h2>Send a message</h2>
              <p>Fill out the form below and we&apos;ll get back to you shortly.</p>
            </div>

            {error && <div className="alert-error"><i className="bi bi-exclamation-circle"></i> {error}</div>}
            {success && <div className="alert-success"><i className="bi bi-check-circle"></i> {success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="contact-form-grid">
                <div className="contact-field">
                  <label><i className="bi bi-person"></i> Your Name</label>
                  <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="contact-field">
                  <label><i className="bi bi-envelope"></i> Email Address</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="contact-field">
                  <label><i className="bi bi-telephone"></i> Phone (optional)</label>
                  <input type="tel" placeholder="+880 1XXX XXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="contact-field">
                  <label><i className="bi bi-tag"></i> Subject</label>
                  <input type="text" placeholder="How can we help?" value="" onChange={() => {}} />
                </div>
                <div className="contact-field full">
                  <label><i className="bi bi-chat-left-text"></i> Message</label>
                  <textarea placeholder="Tell us about your travel plans, questions, or feedback..." value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="contact-submit" disabled={loading}>
                {loading ? (
                  <><i className="bi bi-hourglass-split"></i> Sending...</>
                ) : (
                  <><i className="bi bi-send"></i> Send Message</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Team Section */}
        <div className="contact-team">
          <div className="contact-team-inner">
            <div className="section-header">
              <div className="eyebrow">Our Team</div>
              <h2>Meet the people behind ComfyGo</h2>
              <p>Passionate travel experts dedicated to making your journey extraordinary.</p>
            </div>
            <div className="contact-team-grid">
              {[
                {
                  name: "Aminul Islam",
                  role: "Founder & CEO",
                  desc: "10+ years in the travel industry. Passionate about showcasing Bangladesh to the world.",
                  img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
                },
                {
                  name: "Fatima Rahman",
                  role: "Head of Operations",
                  desc: "Ensures every trip runs smoothly. Expert in logistics and partner management.",
                  img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
                },
                {
                  name: "Karim Hassan",
                  role: "Lead Guide Coordinator",
                  desc: "Manages our network of 30+ certified local guides across Bangladesh.",
                  img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80"
                },
              ].map((member) => (
                <div className="contact-team-card" key={member.name}>
                  <div className="contact-team-img">
                    <img src={member.img} alt={member.name} />
                  </div>
                  <div className="contact-team-body">
                    <h3 className="contact-team-name">{member.name}</h3>
                    <div className="contact-team-role">{member.role}</div>
                    <p className="contact-team-desc">{member.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="contact-footer">
          <div className="contact-footer-inner">
            <div className="contact-footer-brand">
              <h3>ComfyGo</h3>
              <p>Stay beautifully. A premium travel booking platform for Bangladesh and South Asia.</p>
            </div>
            <div className="contact-footer-col">
              <h4>Explore</h4>
              <a href="/hotels">Hotels</a>
              <a href="/destinations">Destinations</a>
              <a href="/about">About Us</a>
            </div>
            <div className="contact-footer-col">
              <h4>Company</h4>
              <a href="/about">Our Story</a>
              <a href="/contact">Contact</a>
              <a href="#">Careers</a>
            </div>
            <div className="contact-footer-col">
              <h4>Support</h4>
              <a href="/contact">Help Center</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
          <div className="contact-footer-bottom">
            &copy; 2024 ComfyGo. All rights reserved. Made with <i className="bi bi-heart-fill" style={{color:'#E8783C'}}></i> in Bangladesh.
          </div>
        </div>
      </div>
    </>
  );
}
