"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [searchDest, setSearchDest] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(232,120,60,0.3); }
          50% { box-shadow: 0 8px 40px rgba(232,120,60,0.5); }
        }
        .anim-up { animation: fadeSlideUp 0.7s ease-out both; }
        .anim-left { animation: fadeSlideLeft 0.7s ease-out both; }
        .anim-right { animation: fadeSlideRight 0.7s ease-out both; }
        .anim-scale { animation: scaleIn 0.6s ease-out both; }
        .d1 { animation-delay: 0.1s; }
        .d2 { animation-delay: 0.2s; }
        .d3 { animation-delay: 0.3s; }
        .d4 { animation-delay: 0.4s; }
        .d5 { animation-delay: 0.5s; }
        .d6 { animation-delay: 0.6s; }
        .d7 { animation-delay: 0.7s; }
        .d8 { animation-delay: 0.8s; }

        /* ===== HERO ===== */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #0a3d35;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10,61,53,0.9) 0%, rgba(10,77,66,0.78) 40%, rgba(7,61,52,0.88) 100%);
          z-index: 1;
        }
        .hero-images {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hero-images img {
          position: absolute;
          object-fit: cover;
          width: 100%;
          height: 100%;
          opacity: 0.3;
          transition: transform 15s ease;
        }
        .hero:hover .hero-images img {
          transform: scale(1.03);
        }
        .hero-inner {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 140px 48px 100px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
        }
        .hero-content { color: #fff; }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255,255,255,0.95);
          margin-bottom: 32px;
          backdrop-filter: blur(10px);
          letter-spacing: 0.03em;
        }
        .hero-badge i { color: var(--accent); font-size: 1.05rem; }
        .hero h1 {
          font-family: var(--font-heading);
          font-size: clamp(3.2rem, 6vw, 4.5rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.15);
        }
        .hero h1 em {
          font-style: italic;
          color: var(--accent);
          position: relative;
          text-shadow: 0 2px 30px rgba(232,120,60,0.3);
        }
        .hero h1 em::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--accent);
          border-radius: 2px;
          opacity: 0.6;
        }
        .hero-desc {
          font-family: var(--font-body);
          font-size: 1.15rem;
          color: rgba(255,255,255,0.85);
          line-height: 1.8;
          max-width: 520px;
          margin-bottom: 36px;
          font-weight: 400;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
        }
        .hero-btn-primary {
          padding: 16px 36px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.35s;
          box-shadow: 0 6px 28px rgba(232,120,60,0.35);
          letter-spacing: 0.01em;
        }
        .hero-btn-primary:hover {
          background: var(--accent-dark);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 40px rgba(232,120,60,0.45);
          animation: pulseGlow 2s infinite;
        }
        .hero-btn-outline {
          padding: 16px 36px;
          background: transparent;
          color: #fff;
          border: 2px solid rgba(255,255,255,0.4);
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.35s;
        }
        .hero-btn-outline:hover {
          border-color: #fff;
          background: rgba(255,255,255,0.1);
          transform: translateY(-3px);
        }
        .hero-stats {
          display: flex;
          gap: 48px;
        }
        .hero-stat-num {
          font-family: var(--font-heading);
          font-size: 2.4rem;
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }
        .hero-stat-label {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.65);
          margin-top: 4px;
          letter-spacing: 0.02em;
          font-weight: 500;
        }

        /* Search Panel */
        .search-panel {
          background: var(--surface);
          border-radius: var(--radius);
          padding: 36px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.25);
          animation: scaleIn 0.8s ease-out 0.4s both;
        }
        .search-panel h3 {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }
        .search-panel-sub {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 24px;
          font-weight: 400;
        }
        .search-field { margin-bottom: 18px; }
        .search-field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }
        .search-field input,
        .search-field select {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid var(--line);
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text);
          background: var(--bg);
          outline: none;
          transition: all 0.3s;
        }
        .search-field input::placeholder { color: var(--text-light); }
        .search-field input:focus,
        .search-field select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(10,77,66,0.08);
          background: #fff;
        }
        .search-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .search-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.35s;
          box-shadow: 0 6px 24px rgba(10,77,66,0.3);
          margin-top: 6px;
          letter-spacing: 0.02em;
        }
        .search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(10,77,66,0.4);
        }

        /* Section headers */
        .section-header { text-align: center; margin-bottom: 56px; }
        .section-eyebrow {
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 12px;
          display: block;
        }
        .section-title {
          font-family: var(--font-heading);
          font-size: clamp(2.2rem, 3.5vw, 3rem);
          font-weight: 700;
          color: var(--text);
          line-height: 1.12;
          letter-spacing: -0.015em;
        }
        .section-subtitle {
          font-family: var(--font-body);
          font-size: 1.05rem;
          color: var(--text-muted);
          max-width: 560px;
          line-height: 1.8;
          margin: 14px auto 0;
          font-weight: 400;
        }

        /* Collage */
        .collage-section { padding: 0; margin-top: -1px; }
        .collage-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: 220px 220px;
          gap: 4px;
        }
        .collage-item {
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .collage-item:nth-child(1) { grid-column: 1 / 3; grid-row: 1 / 3; }
        .collage-item:nth-child(2) { grid-column: 3; grid-row: 1; }
        .collage-item:nth-child(3) { grid-column: 4; grid-row: 1; }
        .collage-item:nth-child(4) { grid-column: 3; grid-row: 2; }
        .collage-item:nth-child(5) { grid-column: 4; grid-row: 2; }
        .collage-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .collage-item:hover img { transform: scale(1.1); }
        .collage-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
          opacity: 0;
          transition: opacity 0.4s;
        }
        .collage-item:hover .collage-overlay { opacity: 1; }
        .collage-overlay h4 {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          color: #fff;
          font-weight: 700;
        }
        .collage-overlay span { font-size: 0.85rem; color: rgba(255,255,255,0.85); }

        /* Hotel Cards */
        .hotels-section { padding: 100px 48px; background: var(--bg); }
        .hotels-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .hotel-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: all 0.4s ease;
        }
        .hotel-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-8px);
        }
        .hotel-card-img {
          position: relative;
          height: 250px;
          overflow: hidden;
        }
        .hotel-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .hotel-card:hover .hotel-card-img img { transform: scale(1.08); }
        .hotel-card-fav {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 42px;
          height: 42px;
          background: rgba(255,255,255,0.92);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        }
        .hotel-card-fav:hover { background: var(--accent); transform: scale(1.1); }
        .hotel-card-fav i { font-size: 1.1rem; color: var(--accent); transition: color 0.3s; }
        .hotel-card-fav:hover i { color: #fff; }
        .hotel-card-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          padding: 6px 16px;
          background: var(--primary);
          color: #fff;
          border-radius: 50px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .hotel-card-body { padding: 26px; }
        .hotel-card-name {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
        }
        .hotel-card-rating { color: #F59E0B; font-size: 0.95rem; margin-bottom: 8px; letter-spacing: 3px; }
        .hotel-card-location {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 500;
        }
        .hotel-card-location i { color: var(--accent); font-size: 0.95rem; }
        .hotel-card-desc {
          font-family: var(--font-accent);
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 18px;
          font-style: italic;
        }
        .hotel-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid var(--line-light);
        }
        .hotel-card-price strong {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }
        .hotel-card-price span { font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-body); }
        .hotel-card-link {
          padding: 11px 22px;
          background: var(--primary);
          color: #fff;
          border-radius: var(--radius-xs);
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s;
          box-shadow: 0 4px 16px rgba(10,77,66,0.2);
        }
        .hotel-card-link:hover { background: var(--primary-dark); transform: translateY(-2px); }

        /* Guides */
        .guides-section { padding: 100px 48px; background: var(--surface); border-top: 1px solid var(--line-light); }
        .guides-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .guide-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 40px 28px;
          text-align: center;
          box-shadow: var(--shadow);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }
        .guide-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
        }
        .guide-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-8px);
        }
        .guide-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto 20px;
          border: 5px solid var(--line-light);
          box-shadow: 0 6px 24px rgba(0,0,0,0.1);
          transition: all 0.4s;
        }
        .guide-card:hover .guide-avatar {
          border-color: var(--accent);
          transform: scale(1.05);
        }
        .guide-name {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }
        .guide-rating { color: #F59E0B; font-size: 0.95rem; margin-bottom: 10px; letter-spacing: 3px; }
        .guide-specialty {
          font-family: var(--font-accent);
          font-size: 0.95rem;
          color: var(--accent);
          font-weight: 600;
          font-style: italic;
          margin-bottom: 16px;
        }
        .guide-meta {
          display: flex;
          justify-content: center;
          gap: 20px;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .guide-meta i { margin-right: 5px; color: var(--primary); font-size: 0.95rem; }

        /* Features */
        .features-section { padding: 100px 48px; background: var(--bg-warm); }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .feature-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-left: 5px solid var(--primary);
          border-radius: var(--radius-sm);
          padding: 36px 26px;
          transition: all 0.4s ease;
        }
        .feature-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-6px);
          border-left-color: var(--accent);
        }
        .feature-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(10,77,66,0.1), rgba(232,120,60,0.08));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--primary);
          margin-bottom: 22px;
          transition: all 0.3s;
        }
        .feature-card:hover .feature-icon {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #fff;
          transform: scale(1.05);
        }
        .feature-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 10px;
        }
        .feature-desc { font-size: 0.92rem; color: var(--text-muted); line-height: 1.7; }

        /* CTA */
        .cta-section { padding: 0 48px 100px; }
        .cta-card {
          max-width: 1280px;
          margin: 0 auto;
          border-radius: var(--radius);
          overflow: hidden;
          position: relative;
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .cta-bg {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80');
          background-size: cover;
          background-position: center;
          transition: transform 10s ease;
        }
        .cta-card:hover .cta-bg { transform: scale(1.03); }
        .cta-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10,77,66,0.93) 0%, rgba(7,61,52,0.96) 100%);
        }
        .cta-content {
          position: relative;
          z-index: 2;
          padding: 72px 48px;
          max-width: 700px;
        }
        .cta-content h2 {
          font-family: var(--font-heading);
          font-size: clamp(2.2rem, 3.5vw, 2.8rem);
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
        }
        .cta-content p {
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: rgba(255,255,255,0.8);
          margin-bottom: 36px;
          line-height: 1.8;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 18px 40px;
          background: #fff;
          color: var(--primary);
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.35s;
          box-shadow: 0 6px 24px rgba(0,0,0,0.15);
        }
        .cta-btn:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0,0,0,0.25);
        }

        /* Footer */
        .footer { background: #0B2E28; padding: 72px 48px 36px; color: rgba(184, 212, 188, 0.6); }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 48px;
          max-width: 1280px;
          margin: 0 auto 48px;
        }
        .footer-brand h3 { font-family: var(--font-heading); font-size: 1.7rem; font-weight: 700; color: #fff; margin-bottom: 14px; }
        .footer-brand h3 span { color: var(--accent); }
        .footer-brand p { font-size: 0.92rem; line-height: 1.8; max-width: 280px; }
        .footer-col h5 {
          font-family: var(--font-body); font-size: 0.75rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(184, 212, 188, 0.35); margin-bottom: 18px;
        }
        .footer-col a {
          display: block; font-size: 0.92rem; color: rgba(184, 212, 188, 0.55);
          margin-bottom: 12px; transition: all 0.25s; text-decoration: none; font-weight: 500;
        }
        .footer-col a:hover { color: #fff; transform: translateX(4px); }
        .footer-bottom {
          border-top: 1px solid rgba(184, 212, 188, 0.08);
          padding-top: 28px; max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
        }
        .footer-bottom p { font-size: 0.88rem; }

        @media (max-width: 1024px) {
          .hero-inner { grid-template-columns: 1fr; gap: 48px; padding-top: 120px; }
          .hotels-grid, .guides-grid { grid-template-columns: repeat(2, 1fr); }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .collage-grid { grid-template-columns: repeat(2, 1fr); grid-template-rows: 200px 200px 200px; }
          .collage-item:nth-child(1) { grid-column: 1 / 3; grid-row: 1 / 2; }
        }
        @media (max-width: 800px) {
          .hero-inner { padding: 100px 24px 64px; }
          .hero-stats { gap: 28px; }
          .hotels-section, .guides-section, .features-section, .cta-section { padding: 64px 24px; }
          .hotels-grid, .guides-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr; }
          .collage-grid { grid-template-columns: 1fr; grid-template-rows: auto; }
          .collage-item { height: 220px; }
          .collage-item:nth-child(1) { grid-column: 1; grid-row: auto; height: 300px; }
          .footer { padding: 56px 24px 28px; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
          .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
          .search-row { grid-template-columns: 1fr; }
          .cta-section { padding: 0 24px 64px; }
        }
        @media (max-width: 480px) {
          .hero-inner { padding: 88px 16px 48px; }
          .hero h1 { font-size: 2.4rem; }
          .hero-stats { flex-wrap: wrap; gap: 20px; }
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Navbar activePage="home" />

      {/* HERO */}
      <section className="hero">
        <div className="hero-images">
          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=85" alt="" />
        </div>
        <div className="hero-bg"></div>
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge anim-up d1">
              <i className="bi bi-compass-fill"></i>
              Luxury travel, redefined
            </div>
            <h1 className="anim-up d2">Find your<br />perfect <em>stay.</em></h1>
            <p className="hero-desc anim-up d3">
              Curated boutique hotels, expert local guides, and unforgettable experiences across South Asia — all in one place.
            </p>
            <div className="hero-actions anim-up d4">
              <Link href="/hotels" className="hero-btn-primary">
                <i className="bi bi-search"></i> Explore Stays
              </Link>
              <Link href="/destinations" className="hero-btn-outline">
                <i className="bi bi-geo-alt"></i> Destinations
              </Link>
            </div>
            <div className="hero-stats anim-up d5">
              <div>
                <div className="hero-stat-num">200+</div>
                <div className="hero-stat-label">Verified Hotels</div>
              </div>
              <div>
                <div className="hero-stat-num">50+</div>
                <div className="hero-stat-label">Local Guides</div>
              </div>
              <div>
                <div className="hero-stat-num">4.9</div>
                <div className="hero-stat-label">Guest Rating</div>
              </div>
            </div>
          </div>

          <div className="search-panel">
            <h3>Plan your stay</h3>
            <p className="search-panel-sub">Find your perfect accommodation</p>
            <div className="search-field">
              <label>Destination</label>
              <input type="text" placeholder="Where are you going?" value={searchDest} onChange={(e) => setSearchDest(e.target.value)} />
            </div>
            <div className="search-row">
              <div className="search-field">
                <label>Check-in</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div className="search-field">
                <label>Check-out</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>
            <div className="search-field">
              <label>Guests</label>
              <select value={guests} onChange={(e) => setGuests(e.target.value)}>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5+">5+ Guests</option>
              </select>
            </div>
            <button className="search-btn">
              <i className="bi bi-search" style={{ marginRight: 8 }}></i>
              Search Stays
            </button>
          </div>
        </div>
      </section>

      {/* PHOTO COLLAGE */}
      <section className="collage-section">
        <div className="collage-grid">
          {[
            { img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", label: "Boutique Hotels", sub: "Curated stays" },
            { img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", label: "Mountain Retreats", sub: "Highland escapes" },
            { img: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", label: "Coastal Paradise", sub: "Beachfront luxury" },
            { img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80", label: "Nature Trails", sub: "Wilderness awaits" },
            { img: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&q=80", label: "City Culture", sub: "Urban exploration" },
          ].map((item, i) => (
            <div className="collage-item" key={i}>
              <img src={item.img} alt={item.label} />
              <div className="collage-overlay">
                <h4>{item.label}</h4>
                <span>{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOTELS */}
      <section className="hotels-section">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="section-header">
            <span className="section-eyebrow">Featured Stays</span>
            <h2 className="section-title">Handpicked for you</h2>
            <p className="section-subtitle">Every stay is carefully selected for comfort, character, and authenticity.</p>
          </div>
          <div className="hotels-grid">
            {[
              { name: "Sylhet Tea Garden Resort", rating: 5, location: "Zakiganj, Sylhet", desc: "Nestled among rolling tea estates with panoramic hill views and authentic Bangladeshi hospitality.", price: "3,500", tag: "Eco Certified", img: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&q=80" },
              { name: "Dhaka Heritage Inn", rating: 4, location: "Old Dhaka, Dhaka", desc: "A restored colonial-era boutique hotel near Ahsan Manzil with rooftop dining and river views.", price: "4,200", tag: "Heritage", img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80" },
              { name: "Cox's Bazar Beach Villa", rating: 5, location: "Inani Beach, Cox's Bazar", desc: "Beachfront villa with infinity pool overlooking the Bay of Bengal and palm-fringed gardens.", price: "5,500", tag: "Beachfront", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80" },
            ].map((hotel, i) => (
              <div className="hotel-card" key={i}>
                <div className="hotel-card-img">
                  <img src={hotel.img} alt={hotel.name} />
                  <span className="hotel-card-tag">{hotel.tag}</span>
                  <button className="hotel-card-fav"><i className="bi bi-heart"></i></button>
                </div>
                <div className="hotel-card-body">
                  <h3 className="hotel-card-name">{hotel.name}</h3>
                  <div className="hotel-card-rating">{"★".repeat(hotel.rating)}{"☆".repeat(5 - hotel.rating)}</div>
                  <div className="hotel-card-location"><i className="bi bi-geo-alt-fill"></i>{hotel.location}</div>
                  <p className="hotel-card-desc">{hotel.desc}</p>
                  <div className="hotel-card-footer">
                    <div className="hotel-card-price"><strong>৳{hotel.price}</strong><span> / night</span></div>
                    <Link href="/hotels" className="hotel-card-link">View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GUIDES */}
      <section className="guides-section">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="section-header">
            <span className="section-eyebrow">Meet Your Guides</span>
            <h2 className="section-title">Local experts, unforgettable stories</h2>
            <p className="section-subtitle">Our certified guides bring every destination to life with insider knowledge and genuine warmth.</p>
          </div>
          <div className="guides-grid">
            {[
              { name: "Amira Rahman", rating: 5, specialty: "Heritage & Culture", languages: "Bengali, English", experience: "8 years", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
              { name: "Ravi Patel", rating: 5, specialty: "Nature & Wildlife", languages: "Hindi, English, Bengali", experience: "12 years", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
              { name: "Sakina Begum", rating: 4, specialty: "Adventure & Trekking", languages: "Bengali, English", experience: "6 years", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" },
            ].map((guide, i) => (
              <div className="guide-card" key={i}>
                <img src={guide.img} alt={guide.name} className="guide-avatar" />
                <h3 className="guide-name">{guide.name}</h3>
                <div className="guide-rating">{"★".repeat(guide.rating)} ({guide.rating}.0)</div>
                <div className="guide-specialty">{guide.specialty}</div>
                <div className="guide-meta">
                  <span><i className="bi bi-translate"></i>{guide.languages}</span>
                  <span><i className="bi bi-clock-history"></i>{guide.experience}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="section-header">
            <span className="section-eyebrow">Why ComfyGo</span>
            <h2 className="section-title">Travel with confidence</h2>
          </div>
          <div className="features-grid">
            {[
              { icon: "bi-shield-check", title: "Trusted Hotels", desc: "Every property is personally vetted for quality, safety, and comfort before listing." },
              { icon: "bi-compass", title: "Local Guides", desc: "Certified experts who know every hidden gem and story behind each destination." },
              { icon: "bi-calendar-check", title: "Easy Booking", desc: "Simple, seamless reservation process — book your perfect stay in just a few clicks." },
              { icon: "bi-lock", title: "Secure Payment", desc: "Your transactions are protected with bank-level encryption and secure processing." },
            ].map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon"><i className={`bi ${f.icon}`}></i></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-bg"></div>
          <div className="cta-overlay"></div>
          <div className="cta-content">
            <h2>Ready for your next adventure?</h2>
            <p>Let us craft the perfect stay for you. Browse our curated collection of hotels and experiences.</p>
            <Link href="/destinations" className="cta-btn">
              Explore Destinations <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Comfy<span>Go</span></h3>
            <p>Stay beautifully. Curated luxury travel experiences across South Asia and beyond.</p>
          </div>
          <div className="footer-col">
            <h5>Explore</h5>
            <Link href="/destinations">Destinations</Link>
            <Link href="/hotels">Hotels</Link>
            <Link href="/about">Local Guides</Link>
            <Link href="/about">About Us</Link>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <Link href="/about">Our Mission</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
          </div>
          <div className="footer-col">
            <h5>Support</h5>
            <Link href="/contact">Help Center</Link>
            <a href="mailto:info@comfygo.com">info@comfygo.com</a>
            <a href="tel:+8801234567890">+880 1234 567890</a>
            <Link href="/contact">Send a Message</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ComfyGo. All rights reserved.</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.5, fontStyle: "italic", fontFamily: "var(--font-accent)" }}>Stay beautifully.</p>
        </div>
      </footer>
    </>
  );
}
