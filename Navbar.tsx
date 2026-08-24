"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface NavbarProps {
  activePage?: string;
}

export default function Navbar({ activePage = "home" }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    setScrolled(window.scrollY > 10);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", key: "home" },
    { href: "/destinations", label: "Destinations", key: "destinations" },
    { href: "/hotels", label: "Stays", key: "hotels" },
    { href: "/about", label: "About", key: "about" },
    { href: "/contact", label: "Contact", key: "contact" },
  ];

  return (
    <>
      <style>{`
        .cg-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          transition: all 0.3s ease;
          background: rgba(251, 250, 247, 0.97);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--line);
          box-shadow: 0 1px 12px rgba(0, 0, 0, 0.04);
        }
        .cg-nav.scrolled {
          box-shadow: 0 2px 24px rgba(0, 0, 0, 0.08);
        }
        .cg-nav-brand {
          font-family: var(--font-heading);
          font-size: 1.65rem;
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
        }
        .cg-nav-brand span {
          color: var(--accent);
        }
        .cg-nav-center {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .cg-nav-link {
          padding: 8px 18px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: var(--radius-xs);
          transition: all 0.2s ease;
          position: relative;
        }
        .cg-nav-link:hover {
          color: var(--primary);
          background: rgba(10, 77, 66, 0.05);
        }
        .cg-nav-link.active {
          color: var(--primary);
          font-weight: 600;
        }
        .cg-nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 18px;
          right: 18px;
          height: 2px;
          background: var(--primary);
          border-radius: 2px;
        }
        .cg-nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cg-nav-login {
          padding: 8px 20px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--primary);
          border: 1.5px solid var(--line);
          border-radius: var(--radius-xs);
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .cg-nav-login:hover {
          border-color: var(--primary);
          background: rgba(10, 77, 66, 0.04);
        }
        .cg-nav-signup {
          padding: 9px 24px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
          background: var(--primary);
          border-radius: var(--radius-xs);
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 2px 12px rgba(10, 77, 66, 0.2);
        }
        .cg-nav-signup:hover {
          background: var(--primary-dark);
          box-shadow: 0 4px 18px rgba(10, 77, 66, 0.3);
          transform: translateY(-1px);
        }
        .cg-nav-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--text);
          cursor: pointer;
          padding: 6px;
        }
        .cg-nav-mobile {
          display: none;
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          background: var(--surface);
          border-bottom: 1px solid var(--line);
          box-shadow: var(--shadow-md);
          padding: 20px 24px;
          z-index: 9998;
        }
        .cg-nav-mobile.open {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cg-nav-mobile .cg-nav-link {
          padding: 14px 16px;
          font-size: 0.95rem;
          border-bottom: 1px solid var(--line-light);
        }
        .cg-nav-mobile .cg-nav-link.active::after { display: none; }
        .cg-nav-mobile .cg-nav-right {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--line);
          gap: 12px;
        }
        .cg-nav-mobile .cg-nav-login,
        .cg-nav-mobile .cg-nav-signup {
          flex: 1;
          text-align: center;
          padding: 12px;
        }
        @media (max-width: 800px) {
          .cg-nav { padding: 0 20px; }
          .cg-nav-center, .cg-nav-right { display: none; }
          .cg-nav-toggle { display: block; }
        }
      `}</style>

      <nav className={`cg-nav ${scrolled ? "scrolled" : ""}`}>
        <Link href="/" className="cg-nav-brand">
          Comfy<span>Go</span>
        </Link>

        <div className="cg-nav-center">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`cg-nav-link ${activePage === link.key ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="cg-nav-right">
          <Link href="/login" className="cg-nav-login">Sign in</Link>
          <Link href="/signup" className="cg-nav-signup">Get Started</Link>
        </div>

        <button
          className="cg-nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          <i className={`bi ${open ? "bi-x-lg" : "bi-list"}`}></i>
        </button>
      </nav>

      <div className={`cg-nav-mobile ${open ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={`cg-nav-link ${activePage === link.key ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="cg-nav-right">
          <Link href="/login" className="cg-nav-login" onClick={() => setOpen(false)}>Sign in</Link>
          <Link href="/signup" className="cg-nav-signup" onClick={() => setOpen(false)}>Get Started</Link>
        </div>
      </div>
    </>
  );
}
