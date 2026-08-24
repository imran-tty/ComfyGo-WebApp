"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getTouristProfile,
  updateTouristProfile,
  getTransports,
  getHotels,
  getGuides,
  getTouristBookings,
  bookTransport,
  bookHotel,
  bookGuide,
  getTouristPackages,
  getMyPackage,
  purchasePackage,
  logout,
} from "@/lib/api";

// Mock data for when API is unavailable
const MOCK_HOTELS = [
  { hotel_registration_number: "HTL001", hotel_name: "Sylhet Tea Garden Resort", hotel_division: "Sylhet", hotel_district: "Sylhet", hotel_location: "Zakiganj", hotel_rating: "4.5", hotel_price: 3500, hotel_description: "Nestled among tea gardens with panoramic hill views." },
  { hotel_registration_number: "HTL002", hotel_name: "Dhaka Heritage Inn", hotel_division: "Dhaka", hotel_district: "Dhaka", hotel_location: "Old Dhaka", hotel_rating: "4.0", hotel_price: 4200, hotel_description: "Colonial-era boutique hotel near Ahsan Manzil." },
  { hotel_registration_number: "HTL003", hotel_name: "Cox's Bazar Beach Villa", hotel_division: "Chittagong", hotel_district: "Cox's Bazar", hotel_location: "Inani Beach", hotel_rating: "5.0", hotel_price: 5500, hotel_description: "Beachfront villa with infinity pool overlooking the Bay of Bengal." },
  { hotel_registration_number: "HTL004", hotel_name: "Srimangal Forest Lodge", hotel_division: "Sylhet", hotel_district: "Moulvibazar", hotel_location: "Lawachara", hotel_rating: "4.2", hotel_price: 2800, hotel_description: "Eco-lodge surrounded by lush tropical forest." },
];
const MOCK_GUIDES = [
  { guide_nid: "G001", guide_name: "Amira Rahman", guide_division: "Sylhet", guide_district: "Sylhet", guide_mobile: "+880 1712 345678", guide_rate: 2500 },
  { guide_nid: "G002", guide_name: "Ravi Patel", guide_division: "Dhaka", guide_district: "Dhaka", guide_mobile: "+880 1812 345678", guide_rate: 3000 },
  { guide_nid: "G003", guide_name: "Sakina Begum", guide_division: "Chittagong", guide_district: "Chittagong", guide_mobile: "+880 1912 345678", guide_rate: 2800 },
];
const MOCK_TRANSPORTS = [
  { transport_id: "TR001", transport_type: "Train", transport_route: "Dhaka - Sylhet", transport_fare: 900 },
  { transport_id: "TR002", transport_type: "Bus", transport_route: "Dhaka - Chittagong", transport_fare: 1200 },
  { transport_id: "TR003", transport_type: "Airplane", transport_route: "Dhaka - Cox's Bazar", transport_fare: 5500 },
  { transport_id: "TR004", transport_type: "Train", transport_route: "Dhaka - Chittagong", transport_fare: 1100 },
];
const MOCK_PACKAGES = [
  { package_id: "PKG01", package_name: "Explorer", price: 0, transport_limit: 2, hotel_limit: 1, guide_limit: 1, discount_pct: 0, complementary_breakfast: false, complementary_lunch: false, complementary_dinner: false, features_list: ["Basic booking access"], priority: false, exclusive: false },
  { package_id: "PKG02", package_name: "Traveller", price: 2500, transport_limit: 5, hotel_limit: 3, guide_limit: 2, discount_pct: 10, complementary_breakfast: true, complementary_lunch: false, complementary_dinner: false, features_list: ["Priority booking", "Free breakfast", "10% discount"], priority: true, exclusive: false },
  { package_id: "PKG03", package_name: "Luxury", price: 8000, transport_limit: 999, hotel_limit: 999, guide_limit: 999, discount_pct: 25, complementary_breakfast: true, complementary_lunch: true, complementary_dinner: true, features_list: ["Unlimited bookings", "All meals included", "25% discount", "VIP support"], priority: false, exclusive: true },
];

export default function TouristDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transports, setTransports] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [myPackage, setMyPackage] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [guideDivFilter, setGuideDivFilter] = useState("");
  const [pkgTab, setPkgTab] = useState<"current" | "browse">("current");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [apiOnline, setApiOnline] = useState(true);

  const activeFeatures: string[] = myPackage?.features_list || [];

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token || role !== "tourist") { router.push("/login"); return; }

      // Try to get profile from API, fall back to localStorage
      let profile;
      try {
        profile = await getTouristProfile();
      } catch {
        // API unavailable — use localStorage data
        profile = {
          user_id: localStorage.getItem("user_id") || "guest",
          user_name: localStorage.getItem("user_name") || "Traveller",
          user_email: "traveller@comfygo.com",
          user_phone: "+880 1234 567890",
        };
        setApiOnline(false);
      }
      setUser(profile);
      setProfileName(profile.user_name);
      setProfileEmail(profile.user_email);
      setProfilePhone(profile.user_phone);

      // Try API calls, fall back to mock data
      if (apiOnline) {
        try {
          const [t, h, g, b, pkgs, mp] = await Promise.all([
            getTransports(routeFilter || undefined),
            getHotels(divisionFilter || undefined),
            getGuides(guideDivFilter || undefined),
            getTouristBookings(),
            getTouristPackages(),
            getMyPackage(),
          ]);
          setTransports(t);
          setHotels(h);
          setGuides(g);
          setBookings(b);
          setPackages(pkgs);
          setMyPackage(mp);
        } catch {
          setTransports(MOCK_TRANSPORTS);
          setHotels(MOCK_HOTELS);
          setGuides(MOCK_GUIDES);
          setBookings([]);
          setPackages(MOCK_PACKAGES);
          setApiOnline(false);
        }
      } else {
        setTransports(MOCK_TRANSPORTS);
        setHotels(MOCK_HOTELS);
        setGuides(MOCK_GUIDES);
        setBookings([]);
        setPackages(MOCK_PACKAGES);
      }
    } catch (err: any) {
      if (err.message?.includes("Not authenticated") || err.message?.includes("401")) router.push("/login");
    }
  }, [routeFilter, divisionFilter, guideDivFilter, router, apiOnline]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    localStorage.clear();
    router.push("/login");
  };

  const handleBookTransport = async (transportId: string, travelDate: string) => {
    setError(""); setSuccess("");
    try {
      if (myPackage && myPackage.transport_remaining <= 0) { setError("Transport booking limit reached. Upgrade your package."); return; }
      if (!apiOnline) { setSuccess("Booking demo — connect to backend to confirm."); return; }
      const res = await bookTransport(transportId, travelDate);
      setSuccess(res.message); loadData();
    } catch (err: any) { setError(err.message); }
  };

  const handleBookHotel = async (hotelReg: string, checkin: string) => {
    setError(""); setSuccess("");
    try {
      if (myPackage && myPackage.hotel_remaining <= 0) { setError("Hotel booking limit reached. Upgrade your package."); return; }
      if (!apiOnline) { setSuccess("Booking demo — connect to backend to confirm."); return; }
      const res = await bookHotel(hotelReg, checkin);
      setSuccess(res.message); loadData();
    } catch (err: any) { setError(err.message); }
  };

  const handleBookGuide = async (guideNid: string, guideDate: string) => {
    setError(""); setSuccess("");
    try {
      if (myPackage && myPackage.guide_remaining <= 0) { setError("Guide booking limit reached. Upgrade your package."); return; }
      if (!apiOnline) { setSuccess("Booking demo — connect to backend to confirm."); return; }
      const res = await bookGuide(guideNid, guideDate);
      setSuccess(res.message); loadData();
    } catch (err: any) { setError(err.message); }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      if (!apiOnline) { setSuccess("Profile updated locally."); return; }
      await updateTouristProfile({ user_name: profileName, user_email: profileEmail, user_phone: profilePhone });
      setSuccess("Profile updated successfully."); loadData();
    } catch (err: any) { setError(err.message); }
  };

  const handlePurchase = async (pkgId: string) => {
    setError(""); setSuccess("");
    try {
      if (!apiOnline) { setSuccess("Package activated (demo mode)."); setMyPackage(packages.find(p => p.package_id === pkgId)); setPkgTab("current"); return; }
      const res = await purchasePackage(pkgId);
      setSuccess(res.message); loadData(); setPkgTab("current");
    } catch (err: any) { setError(err.message); }
  };

  if (!user) return (
    <div style={{ padding: 60, textAlign: "center", fontFamily: "var(--font-body)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, border: "4px solid var(--line)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Loading your dashboard...</p>
    </div>
  );

  return (
    <div>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        body { background: var(--bg); font-family: 'Inter', sans-serif; color: var(--text); font-size: 15px; line-height: 1.6; }
        .t-topbar { background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 72px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 16px rgba(0,0,0,.18); }
        .t-topbar-brand { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: #fff; }
        .t-topbar-brand span { color: var(--accent); }
        .t-topbar-right { display: flex; align-items: center; gap: 16px; }
        .t-topbar-user { font-size: 0.82rem; opacity: .8; }
        .t-topbar-user strong { display: block; font-size: 0.95rem; opacity: 1; color: #fff; }
        .t-logout { background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.3); color: #fff; padding: 8px 20px; border-radius: 50px; cursor: pointer; font-size: 0.82rem; font-family: var(--font-body); font-weight: 600; transition: all .2s; }
        .t-logout:hover { background: rgba(255,255,255,.25); }
        .t-layout { display: flex; min-height: calc(100vh - 72px); }
        .t-sidebar { width: 240px; flex-shrink: 0; background: var(--surface); border-right: 1px solid var(--line); padding: 28px 0; position: sticky; top: 72px; height: calc(100vh - 72px); overflow-y: auto; }
        .t-sidebar-label { font-size: 0.68rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--text-muted); padding: 0 20px 10px; }
        .t-nav-link { display: flex; align-items: center; gap: 10px; padding: 11px 20px; color: var(--text-muted); text-decoration: none; font-size: 0.88rem; font-weight: 500; border-left: 3px solid transparent; transition: all .2s; }
        .t-nav-link:hover { color: var(--primary); background: rgba(10,77,66,.05); border-left-color: var(--primary); }
        .t-nav-icon { font-size: 1rem; width: 22px; text-align: center; }
        .t-nav-divider { height: 1px; background: var(--line); margin: 12px 20px; }
        .t-main { flex: 1; padding: 36px 32px; max-width: 1100px; }
        .t-alert { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: var(--radius-sm); margin-bottom: 24px; font-size: 0.9rem; font-weight: 500; animation: fadeUp .3s ease; }
        .t-alert-error { background: var(--danger-bg); color: var(--danger); border: 1px solid #FECACA; }
        .t-alert-success { background: var(--success-bg); color: var(--success); border: 1px solid #A7F3D0; }
        .t-section { margin-bottom: 56px; animation: fadeUp .5s ease both; }
        .t-section:nth-child(2) { animation-delay: .1s; }
        .t-section:nth-child(3) { animation-delay: .15s; }
        .t-section-title { font-family: var(--font-heading); font-size: 1.6rem; font-weight: 700; color: var(--text); }
        .t-section-sub { color: var(--text-muted); font-size: 0.88rem; margin-top: 4px; }
        .t-filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .t-filter-pill { padding: 8px 20px; border-radius: 50px; border: 2px solid var(--line); background: var(--surface); color: var(--text-muted); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all .25s; font-family: var(--font-body); }
        .t-filter-pill:hover { border-color: var(--primary); color: var(--primary); }
        .t-filter-pill.active { background: var(--primary); border-color: var(--primary); color: #fff; }
        .t-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .t-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 14px; transition: all .3s; }
        .t-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
        .t-card-header { display: flex; align-items: center; gap: 12px; }
        .t-card-icon { width: 48px; height: 48px; background: rgba(10,77,66,.08); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
        .t-card-name { font-weight: 700; font-size: 1rem; color: var(--text); }
        .t-card-meta { display: flex; flex-wrap: wrap; gap: 6px; font-size: 0.78rem; }
        .t-tag { background: rgba(10,77,66,.06); color: var(--primary); padding: 4px 12px; border-radius: 50px; border: 1px solid rgba(10,77,66,.15); font-weight: 600; }
        .t-tag.amber { background: rgba(232,120,60,.08); color: var(--accent); border-color: rgba(232,120,60,.2); }
        .t-card-price { font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--primary); }
        .t-card-price small { font-size: 0.82rem; font-family: var(--font-body); color: var(--text-muted); font-weight: 400; }
        .t-card-rating { color: #F59E0B; font-size: 0.9rem; letter-spacing: 2px; }
        .t-card-divider { height: 1px; background: var(--line); }
        .t-card-form { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .t-date-input { border: 2px solid var(--line); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.85rem; font-family: var(--font-body); color: var(--text); background: var(--bg); outline: none; flex: 1; min-width: 140px; transition: border-color .2s; }
        .t-date-input:focus { border-color: var(--primary); }
        .t-btn-book { background: var(--primary); color: #fff; border: none; padding: 10px 20px; border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all .25s; white-space: nowrap; box-shadow: 0 4px 12px rgba(10,77,66,.2); }
        .t-btn-book:hover { background: var(--primary-dark); transform: translateY(-1px); }
        .t-btn-book:disabled { background: #aaa; cursor: not-allowed; transform: none; box-shadow: none; }
        .t-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 28px; border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all .25s; }
        .t-btn-primary:hover { background: var(--primary-dark); }
        .t-booking-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 18px 22px; box-shadow: var(--shadow); display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
        .t-booking-card:nth-child(odd) { border-left: 4px solid var(--primary); }
        .t-booking-card:nth-child(even) { border-left: 4px solid var(--accent); }
        .t-booking-id { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; letter-spacing: .04em; }
        .t-booking-type { font-weight: 700; font-size: 1rem; }
        .t-booking-date { font-size: 0.82rem; color: var(--text-muted); }
        .t-booking-price { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: var(--primary); }
        .t-badge { display: inline-block; padding: 4px 14px; border-radius: 50px; font-size: 0.72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
        .t-badge-confirmed { background: var(--success-bg); color: var(--success); }
        .t-badge-pending { background: var(--warning-bg); color: var(--warning); }
        .t-badge-other { background: var(--line-light); color: var(--text-muted); }
        .t-profile-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 32px; max-width: 520px; box-shadow: var(--shadow-md); }
        .t-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .t-field label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); letter-spacing: .06em; text-transform: uppercase; }
        .t-field input { border: 2px solid var(--line); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 0.92rem; font-family: var(--font-body); color: var(--text); background: var(--bg); outline: none; transition: border-color .2s; }
        .t-field input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(10,77,66,.08); }
        .t-empty { text-align: center; padding: 48px 20px; color: var(--text-muted); }
        .t-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .t-dest-promo { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); border-radius: var(--radius); padding: 32px; color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .t-dest-promo h3 { font-family: var(--font-heading); font-size: 1.5rem; }
        .t-dest-promo p { opacity: .8; font-size: 0.9rem; margin-top: 6px; }
        .t-btn-outline-white { border: 2px solid rgba(255,255,255,.7); color: #fff; background: transparent; padding: 12px 24px; border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 0.88rem; font-weight: 700; text-decoration: none; transition: all .2s; }
        .t-btn-outline-white:hover { background: rgba(255,255,255,.15); }
        .t-pkg-tabs { display: flex; gap: 0; margin-bottom: 20px; }
        .t-pkg-tab { padding: 10px 24px; border: 2px solid var(--line); background: var(--surface); color: var(--text-muted); cursor: pointer; font-size: 0.85rem; font-weight: 700; font-family: var(--font-body); transition: all .2s; }
        .t-pkg-tab:first-child { border-radius: var(--radius-sm) 0 0 var(--radius-sm); }
        .t-pkg-tab:last-child { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; border-left: none; }
        .t-pkg-tab.active { background: var(--primary); border-color: var(--primary); color: #fff; }
        .t-pkg-card { background: var(--surface); border: 2px solid var(--line); border-radius: var(--radius); padding: 28px; text-align: center; display: flex; flex-direction: column; gap: 14px; transition: all .3s; position: relative; }
        .t-pkg-card.popular { border-color: var(--accent); }
        .t-pkg-card.popular::before { content: 'POPULAR'; position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--accent); color: #fff; padding: 4px 16px; border-radius: 50px; font-size: 0.68rem; font-weight: 700; letter-spacing: .1em; }
        .t-pkg-card.exclusive { border-color: var(--primary); }
        .t-pkg-card.exclusive::before { content: 'EXCLUSIVE'; position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--primary); color: #fff; padding: 4px 16px; border-radius: 50px; font-size: 0.68rem; font-weight: 700; letter-spacing: .1em; }
        .t-pkg-card:hover { box-shadow: var(--shadow-md); transform: translateY(-4px); }
        .t-pkg-name { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; }
        .t-pkg-price { font-family: var(--font-heading); font-size: 2rem; font-weight: 700; color: var(--primary); }
        .t-pkg-price small { font-size: 0.85rem; font-family: var(--font-body); color: var(--text-muted); }
        .t-pkg-limit-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--line-light); font-size: 0.88rem; }
        .t-pkg-limit-row:last-child { border-bottom: none; }
        .t-pkg-limit-row .feat-name { color: var(--text-secondary); }
        .t-pkg-limit-row .feat-val { font-weight: 700; color: var(--primary); }
        .t-limit-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px; }
        .t-limit-item { background: rgba(255,255,255,.15); border-radius: 12px; padding: 16px; text-align: center; }
        .t-limit-item .limit-icon { font-size: 1.5rem; margin-bottom: 4px; }
        .t-limit-item .limit-label { font-size: 0.68rem; opacity: .7; text-transform: uppercase; letter-spacing: .06em; }
        .t-limit-item .limit-value { font-size: 1.3rem; font-weight: 700; font-family: var(--font-heading); }
        .t-limit-item .limit-used { font-size: 0.68rem; opacity: .6; }
        .t-meal-badges { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
        .t-meal-badge { background: rgba(255,255,255,.2); padding: 5px 14px; border-radius: 50px; font-size: 0.78rem; font-weight: 600; }
        .t-meal-badge.disabled { background: rgba(255,255,255,.05); opacity: .4; text-decoration: line-through; }
        .t-lock-notice { background: var(--warning-bg); border: 1px solid #FDE68A; color: var(--warning); padding: 12px 18px; border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .t-locked { position: relative; opacity: .6; pointer-events: none; }
        .t-pkg-features { text-align: left; list-style: none; padding: 0; margin: 8px 0 0; }
        .t-pkg-features li { padding: 5px 0; font-size: 0.82rem; border-bottom: 1px solid var(--line-light); display: flex; align-items: center; gap: 8px; }
        .t-pkg-features li::before { content: '\\2713'; color: var(--primary); font-weight: 700; }
        .t-pkg-features li:last-child { border-bottom: none; }
        @media (max-width: 800px) {
          .t-sidebar { display: none; }
          .t-card-grid { grid-template-columns: 1fr; }
          .t-main { padding: 20px; }
          .t-topbar { padding: 0 16px; }
          .t-limit-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="t-topbar">
        <Link href="/" className="t-topbar-brand">Comfy<span>Go</span></Link>
        <div className="t-topbar-right">
          <div className="t-topbar-user"><strong>{user.user_name}</strong>{user.user_id}</div>
          <button className="t-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="t-layout">
        <aside className="t-sidebar">
          <div className="t-sidebar-label">Navigate</div>
          <a href="#packages" className="t-nav-link"><span className="t-nav-icon"><i className="bi bi-box-seam"></i></span> My Package</a>
          <div className="t-nav-divider"></div>
          <a href="#transport" className="t-nav-link"><span className="t-nav-icon"><i className="bi bi-bus-front"></i></span> Transport</a>
          <a href="#hotels" className="t-nav-link"><span className="t-nav-icon"><i className="bi bi-building"></i></span> Hotels</a>
          <a href="#guides" className="t-nav-link"><span className="t-nav-icon"><i className="bi bi-compass"></i></span> Guides</a>
          <div className="t-nav-divider"></div>
          <a href="#bookings" className="t-nav-link"><span className="t-nav-icon"><i className="bi bi-calendar-check"></i></span> My Bookings</a>
          <Link href="/destinations" className="t-nav-link"><span className="t-nav-icon"><i className="bi bi-geo-alt"></i></span> Destinations</Link>
          <div className="t-nav-divider"></div>
          <a href="#profile" className="t-nav-link"><span className="t-nav-icon"><i className="bi bi-person"></i></span> Profile</a>
        </aside>

        <main className="t-main">
          {!apiOnline && (
            <div className="t-alert" style={{ background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid #FDE68A" }}>
              <i className="bi bi-wifi-off"></i> Running in demo mode — backend API not available. Showing sample data.
            </div>
          )}
          {error && <div className="t-alert t-alert-error"><i className="bi bi-exclamation-circle"></i> {error}</div>}
          {success && <div className="t-alert t-alert-success"><i className="bi bi-check-circle"></i> {success}</div>}

          {/* Package Section */}
          <section className="t-section" id="packages">
            <div style={{ marginBottom: 22 }}>
              <h2 className="t-section-title">My Package</h2>
              <p className="t-section-sub">Manage your subscription and booking limits.</p>
            </div>
            <div className="t-pkg-tabs">
              <button className={`t-pkg-tab ${pkgTab === "current" ? "active" : ""}`} onClick={() => setPkgTab("current")}>Current Plan</button>
              <button className={`t-pkg-tab ${pkgTab === "browse" ? "active" : ""}`} onClick={() => setPkgTab("browse")}>Browse Packages</button>
            </div>

            {pkgTab === "current" && (
              <>
                {myPackage ? (
                  <div style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", borderRadius: "var(--radius)", padding: 32, color: "#fff" }}>
                    <div style={{ fontSize: "0.72rem", opacity: .7, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Your Active Plan</div>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", marginBottom: 8 }}>{myPackage.package_name}</h3>
                    {myPackage.discount_pct > 0 && <span style={{ background: "rgba(255,255,255,.2)", padding: "4px 14px", borderRadius: 50, fontSize: "0.78rem", fontWeight: 600 }}>{myPackage.discount_pct}% discount on bookings</span>}
                    <div className="t-limit-grid">
                      {[
                        { icon: <i className="bi bi-bus-front"></i>, label: "Transport", val: `${myPackage.transport_used}/${myPackage.transport_limit}`, rem: `${myPackage.transport_remaining} remaining` },
                        { icon: <i className="bi bi-building"></i>, label: "Hotel", val: `${myPackage.hotel_used}/${myPackage.hotel_limit}`, rem: `${myPackage.hotel_remaining} remaining` },
                        { icon: <i className="bi bi-compass"></i>, label: "Guide", val: `${myPackage.guide_used}/${myPackage.guide_limit}`, rem: `${myPackage.guide_remaining} remaining` },
                      ].map((item, i) => (
                        <div className="t-limit-item" key={i}>
                          <div className="limit-icon">{item.icon}</div>
                          <div className="limit-label">{item.label}</div>
                          <div className="limit-value">{item.val}</div>
                          <div className="limit-used">{item.rem}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "var(--line-light)", borderRadius: "var(--radius)", padding: 40, textAlign: "center" }}>
                    <i className="bi bi-box-seam" style={{ fontSize: 40, color: "var(--text-light)", marginBottom: 12, display: "block" }}></i>
                    <p style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 4 }}>No Active Package</p>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 16 }}>Choose a package to set booking limits and unlock features.</p>
                    <button className="t-btn-primary" onClick={() => setPkgTab("browse")}>Browse Packages</button>
                  </div>
                )}
              </>
            )}

            {pkgTab === "browse" && (
              <div className="t-card-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {packages.map((pkg: any) => (
                  <div key={pkg.package_id} className={`t-pkg-card ${pkg.priority && !pkg.exclusive ? "popular" : ""} ${pkg.exclusive ? "exclusive" : ""}`}>
                    <div className="t-pkg-name">{pkg.package_name}</div>
                    <div className="t-pkg-price">{pkg.price === 0 ? "Free" : `৳${pkg.price.toLocaleString()}`}{pkg.price > 0 && <small>/mo</small>}</div>
                    <div style={{ textAlign: "left" }}>
                      <div className="t-pkg-limit-row"><span className="feat-name"><i className="bi bi-bus-front" style={{ marginRight: 6 }}></i>Transport Bookings</span><span className="feat-val">{pkg.transport_limit === 999 ? "Unlimited" : pkg.transport_limit}</span></div>
                      <div className="t-pkg-limit-row"><span className="feat-name"><i className="bi bi-building" style={{ marginRight: 6 }}></i>Hotel Bookings</span><span className="feat-val">{pkg.hotel_limit === 999 ? "Unlimited" : pkg.hotel_limit}</span></div>
                      <div className="t-pkg-limit-row"><span className="feat-name"><i className="bi bi-compass" style={{ marginRight: 6 }}></i>Guide Bookings</span><span className="feat-val">{pkg.guide_limit === 999 ? "Unlimited" : pkg.guide_limit}</span></div>
                      {pkg.discount_pct > 0 && <div className="t-pkg-limit-row"><span className="feat-name"><i className="bi bi-percent" style={{ marginRight: 6 }}></i>Discount</span><span className="feat-val">{pkg.discount_pct}%</span></div>}
                    </div>
                    <button className="t-btn-book" style={{ width: "100%", padding: "12px 0", fontSize: "0.9rem" }}
                      onClick={() => handlePurchase(pkg.package_id)}
                      disabled={myPackage?.package_id === pkg.package_id}>
                      {myPackage?.package_id === pkg.package_id ? "Current Plan" : pkg.price === 0 ? "Activate Free" : "Purchase"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Transport Section */}
          <section className="t-section" id="transport">
            <div style={{ marginBottom: 22 }}>
              <h2 className="t-section-title">Book Transport</h2>
              <p className="t-section-sub">
                {myPackage ? `${myPackage.transport_remaining} of ${myPackage.transport_limit} bookings remaining` : "Select your route and preferred travel type."}
              </p>
            </div>
            {myPackage && myPackage.transport_remaining <= 0 && (
              <div className="t-lock-notice"><i className="bi bi-lock"></i> Transport booking limit reached. <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setPkgTab("browse")}>Upgrade package</span></div>
            )}
            <div className="t-filter-bar">
              {["", "Dhaka", "Sylhet", "Chittagong"].map((r) => (
                <button key={r} className={`t-filter-pill ${routeFilter === r ? "active" : ""}`} onClick={() => setRouteFilter(r)}>{r || "All Routes"}</button>
              ))}
            </div>
            {transports.length === 0 ? <div className="t-empty"><div className="t-empty-icon"><i className="bi bi-bus-front"></i></div><p>No transport options for this route.</p></div> : (
              <div className="t-card-grid">
                {transports.map((t) => <TransportCard key={t.transport_id} transport={t} onBook={handleBookTransport} locked={myPackage ? myPackage.transport_remaining <= 0 : false} />)}
              </div>
            )}
          </section>

          {/* Hotels Section */}
          <section className="t-section" id="hotels">
            <div style={{ marginBottom: 22 }}>
              <h2 className="t-section-title">Book a Hotel</h2>
              <p className="t-section-sub">
                {myPackage ? `${myPackage.hotel_remaining} of ${myPackage.hotel_limit} bookings remaining` : "Filter by division to find certified stays."}
              </p>
            </div>
            {myPackage && myPackage.hotel_remaining <= 0 && (
              <div className="t-lock-notice"><i className="bi bi-lock"></i> Hotel booking limit reached. <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setPkgTab("browse")}>Upgrade package</span></div>
            )}
            <div className="t-filter-bar">
              {["", "Dhaka", "Sylhet", "Chittagong"].map((d) => (
                <button key={d} className={`t-filter-pill ${divisionFilter === d ? "active" : ""}`} onClick={() => setDivisionFilter(d)}>{d || "All Divisions"}</button>
              ))}
            </div>
            {hotels.length === 0 ? <div className="t-empty"><div className="t-empty-icon"><i className="bi bi-building"></i></div><p>No hotels found for this division.</p></div> : (
              <div className="t-card-grid">
                {hotels.map((h) => <HotelCard key={h.hotel_registration_number} hotel={h} onBook={handleBookHotel} locked={myPackage ? myPackage.hotel_remaining <= 0 : false} />)}
              </div>
            )}
          </section>

          {/* Guides Section */}
          <section className="t-section" id="guides">
            <div style={{ marginBottom: 22 }}>
              <h2 className="t-section-title">Book a Guide</h2>
              <p className="t-section-sub">
                {myPackage ? `${myPackage.guide_remaining} of ${myPackage.guide_limit} bookings remaining` : "Certified local guides available by division."}
              </p>
            </div>
            {myPackage && myPackage.guide_remaining <= 0 && (
              <div className="t-lock-notice"><i className="bi bi-lock"></i> Guide booking limit reached. <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setPkgTab("browse")}>Upgrade package</span></div>
            )}
            <div className="t-filter-bar">
              {["", "Dhaka", "Sylhet", "Chittagong"].map((d) => (
                <button key={d} className={`t-filter-pill ${guideDivFilter === d ? "active" : ""}`} onClick={() => setGuideDivFilter(d)}>{d || "All Divisions"}</button>
              ))}
            </div>
            {guides.length === 0 ? <div className="t-empty"><div className="t-empty-icon"><i className="bi bi-compass"></i></div><p>No guides found for this division.</p></div> : (
              <div className="t-card-grid">
                {guides.map((g) => <GuideCard key={g.guide_nid} guide={g} onBook={handleBookGuide} locked={myPackage ? myPackage.guide_remaining <= 0 : false} />)}
              </div>
            )}
          </section>

          {/* Bookings Section */}
          <section className="t-section" id="bookings">
            <div style={{ marginBottom: 22 }}>
              <h2 className="t-section-title">My Bookings</h2>
              <p className="t-section-sub">Your past and upcoming travel bookings.</p>
            </div>
            {bookings.length === 0 ? <div className="t-empty"><div className="t-empty-icon"><i className="bi bi-calendar-check"></i></div><p>You have no bookings yet. Start planning your trip!</p></div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {bookings.map((b) => {
                  const conf = (b.booking_confirmation || "").toLowerCase();
                  const badgeClass = conf === "confirmed" ? "t-badge-confirmed" : conf === "pending" ? "t-badge-pending" : "t-badge-other";
                  const typeIcon: Record<string, string> = { transport: "bi-bus-front", hotel: "bi-building", guide: "bi-compass" };
                  return (
                    <div className="t-booking-card" key={b.booking_id}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div className="t-card-icon"><i className={`bi ${typeIcon[b.booking_type?.toLowerCase()] || "bi-file"}`}></i></div>
                        <div>
                          <div className="t-booking-id">{b.booking_id}</div>
                          <div className="t-booking-type">{b.booking_type}</div>
                          <div className="t-booking-date"><i className="bi bi-calendar3" style={{ marginRight: 4 }}></i>{b.booking_date}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                        <span className={`t-badge ${badgeClass}`}>{b.booking_confirmation}</span>
                        <div className="t-booking-price">{b.price ? `৳${b.price.toLocaleString()}` : <span style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>—</span>}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Destinations Promo */}
          <section className="t-section" id="destinations">
            <div className="t-dest-promo">
              <div>
                <h3>Explore Bangladesh</h3>
                <p>Curated destinations, trip cost estimator, and travel guides across Sylhet, Dhaka, and Chittagong.</p>
              </div>
              <Link href="/destinations" className="t-btn-outline-white">Browse Destinations →</Link>
            </div>
          </section>

          {/* Profile Section */}
          <section className="t-section" id="profile">
            <div style={{ marginBottom: 22 }}>
              <h2 className="t-section-title">Update Profile</h2>
              <p className="t-section-sub">Edit your account information.</p>
            </div>
            <div className="t-profile-card">
              <form onSubmit={handleProfileUpdate}>
                <div className="t-field"><label>Full Name</label><input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} required /></div>
                <div className="t-field"><label>Email Address</label><input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} required /></div>
                <div className="t-field"><label>Phone Number</label><input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} required /></div>
                <button type="submit" className="t-btn-primary">Save Changes</button>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function TransportCard({ transport, onBook, locked }: { transport: any; onBook: (id: string, date: string) => void; locked: boolean }) {
  const [date, setDate] = useState("");
  const icon = (() => { const t = (transport.transport_type || "").toLowerCase(); if (t.includes("bus")) return "bi-bus-front"; if (t.includes("train")) return "bi-train-front"; if (t.includes("launch")) return "bi-water"; if (t.includes("air")) return "bi-airplane"; return "bi-car-front"; })();
  return (
    <div className={`t-card ${locked ? "t-locked" : ""}`}>
      <div className="t-card-header">
        <div className="t-card-icon"><i className={`bi ${icon}`}></i></div>
        <div>
          <div className="t-card-name">{transport.transport_type}</div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{transport.transport_route}</div>
        </div>
      </div>
      <div className="t-card-meta"><span className="t-tag">{transport.transport_route}</span></div>
      <div className="t-card-price">৳{transport.transport_fare?.toLocaleString()} <small>/ person</small></div>
      <div className="t-card-divider"></div>
      <div className="t-card-form">
        <input type="date" className="t-date-input" value={date} onChange={(e) => setDate(e.target.value)} required disabled={locked} />
        <button className="t-btn-book" onClick={() => onBook(transport.transport_id, date)} disabled={locked}>{locked ? <><i className="bi bi-lock"></i> Limit</> : "Book"}</button>
      </div>
    </div>
  );
}

function HotelCard({ hotel, onBook, locked }: { hotel: any; onBook: (reg: string, date: string) => void; locked: boolean }) {
  const [date, setDate] = useState("");
  const rating = parseFloat(hotel.hotel_rating || "0");
  const full = Math.floor(rating); const half = rating - full >= 0.5 ? 1 : 0; const empty = 5 - full - half;
  return (
    <div className={`t-card ${locked ? "t-locked" : ""}`}>
      <div className="t-card-header">
        <div className="t-card-icon"><i className="bi bi-building"></i></div>
        <div>
          <div className="t-card-name">{hotel.hotel_name}</div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{hotel.hotel_district}</div>
        </div>
      </div>
      <div className="t-card-meta"><span className="t-tag">{hotel.hotel_division}</span><span className="t-tag amber">{hotel.hotel_district}</span></div>
      <div className="t-card-rating">{"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(empty)} <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: 4 }}>{hotel.hotel_rating}</span></div>
      <div className="t-card-price">৳{hotel.hotel_price?.toLocaleString()} <small>/ night</small></div>
      <div className="t-card-divider"></div>
      <div className="t-card-form">
        <input type="date" className="t-date-input" value={date} onChange={(e) => setDate(e.target.value)} required disabled={locked} />
        <button className="t-btn-book" onClick={() => onBook(hotel.hotel_registration_number, date)} disabled={locked}>{locked ? <><i className="bi bi-lock"></i> Limit</> : "Book"}</button>
      </div>
    </div>
  );
}

function GuideCard({ guide, onBook, locked }: { guide: any; onBook: (nid: string, date: string) => void; locked: boolean }) {
  const [date, setDate] = useState("");
  return (
    <div className={`t-card ${locked ? "t-locked" : ""}`}>
      <div className="t-card-header">
        <div className="t-card-icon" style={{ background: "rgba(232,120,60,.08)" }}><i className="bi bi-compass" style={{ color: "var(--accent)" }}></i></div>
        <div>
          <div className="t-card-name">{guide.guide_name}</div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{guide.guide_district}</div>
        </div>
      </div>
      <div className="t-card-meta"><span className="t-tag">{guide.guide_division}</span><span className="t-tag amber">Certified</span></div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}><i className="bi bi-telephone" style={{ marginRight: 4 }}></i>{guide.guide_mobile}</div>
      <div className="t-card-price">৳{guide.guide_rate?.toLocaleString()} <small>/ day</small></div>
      <div className="t-card-divider"></div>
      <div className="t-card-form">
        <input type="date" className="t-date-input" value={date} onChange={(e) => setDate(e.target.value)} required disabled={locked} />
        <button className="t-btn-book" onClick={() => onBook(guide.guide_nid, date)} disabled={locked}>{locked ? <><i className="bi bi-lock"></i> Limit</> : "Book"}</button>
      </div>
    </div>
  );
}
