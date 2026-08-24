"use client";

import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

        .about-page { padding-top: 72px; }

        /* ========== HERO ========== */
        .about-hero {
          position: relative;
          height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .about-hero-bg {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=85') center/cover no-repeat;
        }
        .about-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10,77,66,0.88) 0%, rgba(13,92,80,0.75) 50%, rgba(232,120,60,0.3) 100%);
        }
        .about-hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 700px;
          padding: 0 24px;
          animation: fadeSlideUp 0.8s ease-out;
        }
        .about-hero-badge {
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
        .about-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.4rem, 5vw, 3.4rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .about-hero h1 span { color: #E8783C; }
        .about-hero p {
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          font-weight: 400;
          color: rgba(255,255,255,0.8);
          line-height: 1.7;
          max-width: 560px;
          margin: 0 auto;
        }

        /* ========== PHOTO COLLAGE ========== */
        .about-collage {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-rows: 180px 180px;
          gap: 8px;
          max-width: 1100px;
          margin: -60px auto 0;
          padding: 0 24px;
          position: relative;
          z-index: 3;
        }
        .about-collage-item {
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .about-collage-item:hover {
          transform: scale(1.03);
          box-shadow: 0 12px 40px rgba(10,77,66,0.25);
          z-index: 2;
        }
        .about-collage-item:first-child {
          grid-row: 1 / 3;
        }
        .about-collage-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .about-collage-label {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(10,77,66,0.85);
          backdrop-filter: blur(6px);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 8px;
          letter-spacing: 0.04em;
        }

        /* ========== STATS ========== */
        .about-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 900px;
          margin: 64px auto;
          padding: 0 24px;
        }
        .about-stat {
          text-align: center;
          padding: 28px 16px;
          background: #fff;
          border: 1px solid #E4E8E4;
          border-radius: 14px;
          box-shadow: 0 2px 12px rgba(10,77,66,0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .about-stat:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(10,77,66,0.1);
        }
        .about-stat-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 14px;
          background: linear-gradient(135deg, rgba(10,77,66,0.1), rgba(232,120,60,0.1));
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          color: #0A4D42;
        }
        .about-stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #0A4D42;
          margin-bottom: 4px;
        }
        .about-stat-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          color: #6B7280;
          letter-spacing: 0.04em;
        }

        /* ========== MISSION ========== */
        .about-mission {
          max-width: 1000px;
          margin: 0 auto;
          padding: 80px 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .about-mission-img {
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(10,77,66,0.12);
        }
        .about-mission-img img {
          width: 100%;
          height: 400px;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .about-mission-img:hover img {
          transform: scale(1.04);
        }
        .about-mission-text .eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #E8783C;
          margin-bottom: 12px;
        }
        .about-mission-text h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 700;
          color: #1A1A1A;
          line-height: 1.25;
          margin-bottom: 20px;
        }
        .about-mission-text p {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          color: #4B5563;
          line-height: 1.8;
          margin-bottom: 16px;
        }
        .about-mission-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 24px;
        }
        .about-mission-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(10,77,66,0.04);
          border-radius: 10px;
          border-left: 3px solid #0A4D42;
        }
        .about-mission-feature i {
          font-size: 1.1rem;
          color: #0A4D42;
        }
        .about-mission-feature span {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: #1A1A1A;
        }

        /* ========== VALUES ========== */
        .about-values {
          background: #F6F8F7;
          padding: 80px 24px;
        }
        .about-values-inner {
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
          max-width: 560px;
          margin: 0 auto;
        }
        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .about-value-card {
          background: #fff;
          border: 1px solid #E4E8E4;
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          transition: all 0.35s ease;
          position: relative;
          overflow: hidden;
        }
        .about-value-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0A4D42, #E8783C);
          transform: scaleX(0);
          transition: transform 0.35s ease;
        }
        .about-value-card:hover::before { transform: scaleX(1); }
        .about-value-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(10,77,66,0.1);
        }
        .about-value-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 18px;
          background: linear-gradient(135deg, #0A4D42, #0D5C50);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          color: #fff;
        }
        .about-value-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 10px;
        }
        .about-value-card p {
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          color: #6B7280;
          line-height: 1.65;
        }

        /* ========== CERTIFIED CITIES ========== */
        .about-cities {
          max-width: 1000px;
          margin: 0 auto;
          padding: 80px 24px;
        }
        .about-city-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        .about-city-card {
          background: #fff;
          border: 1px solid #E4E8E4;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(10,77,66,0.06);
          transition: all 0.4s ease;
        }
        .about-city-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(10,77,66,0.15);
        }
        .about-city-img-wrap {
          position: relative;
          height: 220px;
          overflow: hidden;
        }
        .about-city-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .about-city-card:hover .about-city-img-wrap img {
          transform: scale(1.08);
        }
        .about-city-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(232,120,60,0.9);
          backdrop-filter: blur(6px);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 6px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .about-city-body {
          padding: 24px;
        }
        .about-city-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 8px;
        }
        .about-city-desc {
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          color: #6B7280;
          line-height: 1.65;
          margin-bottom: 16px;
        }
        .about-city-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .about-city-tag {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          color: #0A4D42;
          background: rgba(10,77,66,0.08);
          padding: 4px 10px;
          border-radius: 6px;
        }

        /* ========== PARTNERS ========== */
        .about-partners {
          background: linear-gradient(135deg, #0A4D42, #0D5C50);
          padding: 80px 24px;
          text-align: center;
        }
        .about-partners h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
        }
        .about-partners p {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: rgba(255,255,255,0.75);
          max-width: 560px;
          margin: 0 auto 40px;
          line-height: 1.7;
        }
        .about-partner-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }
        .about-partner-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 16px;
          padding: 28px 20px;
          transition: all 0.3s ease;
        }
        .about-partner-card:hover {
          background: rgba(255,255,255,0.18);
          transform: translateY(-4px);
        }
        .about-partner-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 16px;
          background: rgba(255,255,255,0.15);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          color: #E8783C;
        }
        .about-partner-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
        }
        .about-partner-card p {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.7);
          margin: 0;
          line-height: 1.6;
        }

        /* ========== CTA ========== */
        .about-cta {
          position: relative;
          height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .about-cta-bg {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80') center/cover no-repeat;
        }
        .about-cta-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10,77,66,0.9), rgba(13,92,80,0.85));
        }
        .about-cta-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 24px;
        }
        .about-cta-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
        }
        .about-cta-content p {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: rgba(255,255,255,0.8);
          margin-bottom: 28px;
        }
        .about-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 36px;
          background: #E8783C;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .about-cta-btn:hover {
          background: #d46a30;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(232,120,60,0.35);
        }

        /* ========== ANIMATIONS ========== */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ========== FOOTER ========== */
        .about-footer {
          background: #102C27;
          padding: 56px 24px 32px;
          color: rgba(255,255,255,0.6);
        }
        .about-footer-inner {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
        }
        .about-footer-brand h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
        }
        .about-footer-brand p {
          font-size: 0.85rem;
          line-height: 1.7;
        }
        .about-footer-col h4 {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }
        .about-footer-col a {
          display: block;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          font-size: 0.88rem;
          margin-bottom: 10px;
          transition: color 0.2s;
        }
        .about-footer-col a:hover { color: #E8783C; }
        .about-footer-bottom {
          max-width: 1000px;
          margin: 32px auto 0;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
          text-align: center;
          font-size: 0.82rem;
        }

        @media (max-width: 800px) {
          .about-hero { height: 380px; }
          .about-collage { grid-template-columns: 1fr 1fr; grid-template-rows: 160px 160px; margin-top: -40px; }
          .about-collage-item:first-child { grid-row: auto; }
          .about-stats { grid-template-columns: repeat(2, 1fr); }
          .about-mission { grid-template-columns: 1fr; gap: 32px; padding: 48px 24px; }
          .about-mission-img img { height: 260px; }
          .about-values-grid { grid-template-columns: 1fr; }
          .about-city-grid { grid-template-columns: 1fr; }
          .about-partner-cards { grid-template-columns: 1fr; }
          .about-footer-inner { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <Navbar activePage="about" />

      <div className="about-page">
        {/* Hero */}
        <div className="about-hero">
          <div className="about-hero-bg" />
          <div className="about-hero-overlay" />
          <div className="about-hero-content">
            <div className="about-hero-badge">
              <i className="bi bi-gem"></i>
              Est. 2024 — Bangladesh
            </div>
            <h1>Travel made with <span>comfort</span></h1>
            <p>ComfyGo is a travel agency dedicated to crafting comfortable, memorable, and stress-free journeys across Bangladesh and South Asia.</p>
          </div>
        </div>

        {/* Photo Collage */}
        <div className="about-collage">
          <div className="about-collage-item">
            <img src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80" alt="Sylhet tea gardens" />
            <div className="about-collage-label"><i className="bi bi-geo-alt"></i> Sylhet Tea Gardens</div>
          </div>
          <div className="about-collage-item">
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80" alt="Mountain vista" />
            <div className="about-collage-label"><i className="bi bi-cloud"></i> Hill Tracts</div>
          </div>
          <div className="about-collage-item">
            <img src="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80" alt="Cox's Bazar beach" />
            <div className="about-collage-label"><i className="bi bi-water"></i> Cox&apos;s Bazar</div>
          </div>
          <div className="about-collage-item">
            <img src="https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600&q=80" alt="Tropical resort" />
            <div className="about-collage-label"><i className="bi bi-tree"></i> Sundarbans</div>
          </div>
          <div className="about-collage-item">
            <img src="https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&q=80" alt="Dhaka city" />
            <div className="about-collage-label"><i className="bi bi-building"></i> Dhaka City</div>
          </div>
        </div>

        {/* Stats */}
        <div className="about-stats">
          {[
            { icon: "bi-building", number: "50+", label: "Certified Hotels" },
            { icon: "bi-people", number: "200+", label: "Happy Travelers" },
            { icon: "bi-compass", number: "30+", label: "Expert Guides" },
            { icon: "bi-star", number: "4.9", label: "Average Rating" },
          ].map((stat) => (
            <div className="about-stat" key={stat.label}>
              <div className="about-stat-icon"><i className={`bi ${stat.icon}`}></i></div>
              <div className="about-stat-number">{stat.number}</div>
              <div className="about-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="about-mission">
          <div className="about-mission-img">
            <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80" alt="Luxury resort" />
          </div>
          <div className="about-mission-text">
            <div className="eyebrow">Our Mission</div>
            <h2>Making every journey effortless</h2>
            <p>
              At ComfyGo, our mission is simple — to make every journey feel effortless and extraordinary. We believe travel should be a source of joy, not stress.
            </p>
            <p>
              We work with verified local partners, certified guides, and carefully selected hotels to ensure your safety and comfort at every step.
            </p>
            <div className="about-mission-features">
              {[
                { icon: "bi-shield-check", label: "Verified Partners" },
                { icon: "bi-headset", label: "24/7 Support" },
                { icon: "bi-cash-stack", label: "Best Price Guarantee" },
                { icon: "bi-arrow-repeat", label: "Easy Cancellation" },
              ].map((f) => (
                <div className="about-mission-feature" key={f.label}>
                  <i className={`bi ${f.icon}`}></i>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="about-values">
          <div className="about-values-inner">
            <div className="section-header">
              <div className="eyebrow">Why Choose Us</div>
              <h2>What makes us different</h2>
              <p>We combine local expertise with modern comfort to create journeys you&apos;ll treasure forever.</p>
            </div>
            <div className="about-values-grid">
              {[
                { icon: "bi-compass", title: "Local Expertise", desc: "Our guides are locals who know every hidden gem, shortcut, and secret spot in Bangladesh." },
                { icon: "bi-shield-lock", title: "Trusted & Safe", desc: "Every hotel, guide, and transport partner is verified through our rigorous certification process." },
                { icon: "bi-cash-stack", title: "Best Value", desc: "Transparent pricing in BDT with no hidden fees. You get premium experiences at honest prices." },
                { icon: "bi-headset", title: "24/7 Support", desc: "From booking to checkout, our team is available around the clock to assist you." },
                { icon: "bi-calendar-check", title: "Easy Booking", desc: "Book hotels, guides, and transport in minutes with our simple, intuitive platform." },
                { icon: "bi-heart", title: "Sustainable Travel", desc: "We support local communities and preserve the natural beauty of our destinations." },
              ].map((v) => (
                <div className="about-value-card" key={v.title}>
                  <div className="about-value-icon"><i className={`bi ${v.icon}`}></i></div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certified Cities */}
        <div className="about-cities">
          <div className="section-header">
            <div className="eyebrow">Destinations</div>
            <h2>Places we&apos;ve certified</h2>
            <p>Handpicked destinations across Bangladesh, each vetted for quality, safety, and unforgettable experiences.</p>
          </div>
          <div className="about-city-grid">
            {[
              {
                name: "Sylhet",
                img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=80",
                badge: "Popular",
                desc: "Nestled in the northeast, Sylhet enchants visitors with rolling tea estates, crystal-clear rivers, and ancient shrines.",
                tags: ["Tea Gardens", "Waterfalls", "Shrine City"]
              },
              {
                name: "Dhaka",
                img: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=700&q=80",
                badge: "Capital",
                desc: "Bangladesh's vibrant capital pulses with history, culture, and relentless energy — a destination that rewards every curious traveller.",
                tags: ["Heritage", "Markets", "Architecture"]
              },
              {
                name: "Chittagong",
                img: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=700&q=80",
                badge: "Coastal",
                desc: "Bangladesh's port city blends sea breeze, hills, and heritage into one unforgettable destination.",
                tags: ["Beaches", "Hills", "Port City"]
              },
            ].map((city) => (
              <div className="about-city-card" key={city.name}>
                <div className="about-city-img-wrap">
                  <img src={city.img} alt={city.name} />
                  <div className="about-city-badge">{city.badge}</div>
                </div>
                <div className="about-city-body">
                  <h3 className="about-city-name">{city.name}</h3>
                  <p className="about-city-desc">{city.desc}</p>
                  <div className="about-city-tags">
                    {city.tags.map((t) => (
                      <span className="about-city-tag" key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="about-partners">
          <h2>Certified Partners</h2>
          <p>Every hotel, guide, and transport partner goes through our rigorous certification process before we recommend them.</p>
          <div className="about-partner-cards">
            {[
              { icon: "bi-building", title: "Hotels & Resorts", desc: "Curated boutique hotels, eco-lodges, and resorts across Bangladesh with verified quality standards." },
              { icon: "bi-compass", title: "Local Guides", desc: "Handpicked local guides who bring each destination to life with deep cultural knowledge and genuine hospitality." },
              { icon: "bi-bus-front", title: "Transport", desc: "Safe, comfortable transport options — trains, buses, flights, and launches — all verified for reliability." },
            ].map((p) => (
              <div className="about-partner-card" key={p.title}>
                <div className="about-partner-icon"><i className={`bi ${p.icon}`}></i></div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="about-cta">
          <div className="about-cta-bg" />
          <div className="about-cta-overlay" />
          <div className="about-cta-content">
            <h2>Ready for your next adventure?</h2>
            <p>Explore our curated collection of hotels, guides, and experiences across Bangladesh.</p>
            <a href="/hotels" className="about-cta-btn">
              Explore Stays <i className="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="about-footer">
          <div className="about-footer-inner">
            <div className="about-footer-brand">
              <h3>ComfyGo</h3>
              <p>Stay beautifully. A premium travel booking platform for Bangladesh and South Asia.</p>
            </div>
            <div className="about-footer-col">
              <h4>Explore</h4>
              <a href="/hotels">Hotels</a>
              <a href="/destinations">Destinations</a>
              <a href="/about">About Us</a>
            </div>
            <div className="about-footer-col">
              <h4>Company</h4>
              <a href="/about">Our Story</a>
              <a href="/contact">Contact</a>
              <a href="#">Careers</a>
            </div>
            <div className="about-footer-col">
              <h4>Support</h4>
              <a href="/contact">Help Center</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
          <div className="about-footer-bottom">
            &copy; 2024 ComfyGo. All rights reserved. Made with <i className="bi bi-heart-fill" style={{color:'#E8783C'}}></i> in Bangladesh.
          </div>
        </div>
      </div>
    </>
  );
}
