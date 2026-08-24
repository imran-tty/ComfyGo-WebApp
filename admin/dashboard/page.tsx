"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminStats, getAdminChartData,
  getAdminUsers, getAdminGuides, getAdminManagers,
  getAdminBookings, getAdminPayments, getAdminHotels, getAdminTransports,
  getAdminSpots, getAdminMessages, getAdminPackages, getAdminSubscriptions,
  voidBooking, refundPayment, deleteAdminEntity,
  createAdminEntity, updateAdminEntity,
} from "@/lib/api";

type Tab = "stats" | "users" | "guides" | "managers" | "hotels" | "transports" | "bookings" | "payments" | "spots" | "messages" | "packages" | "subscriptions";

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "stats", label: "Dashboard", icon: "📊" },
  { key: "users", label: "Users", icon: "👤" },
  { key: "guides", label: "Guides", icon: "🧭" },
  { key: "managers", label: "Managers", icon: "👔" },
  { key: "hotels", label: "Hotels", icon: "🏨" },
  { key: "transports", label: "Transports", icon: "🚌" },
  { key: "bookings", label: "Bookings", icon: "📋" },
  { key: "payments", label: "Payments", icon: "💳" },
  { key: "spots", label: "Spots", icon: "📍" },
  { key: "messages", label: "Messages", icon: "💬" },
  { key: "packages", label: "Packages", icon: "📦" },
  { key: "subscriptions", label: "Subscriptions", icon: "🔄" },
];

const CHART_COLORS = [
  "#2d5a3d", "#c8832a", "#2980b9", "#e74c3c", "#8e44ad",
  "#16a085", "#f39c12", "#1abc9c", "#d35400", "#3498db",
  "#27ae60", "#e67e22", "#9b59b6", "#34495e", "#e91e63",
];

const deleteEntityMap: Record<string, string> = {
  users: "user_id", guides: "guide_nid", managers: "manager_id",
  hotels: "hotel_registration_number", transports: "transport_id",
  spots: "spot_id", messages: "message_id",
};

const createFields: Record<string, { key: string; label: string; type?: string; required?: boolean }[]> = {
  users: [
    { key: "user_id", label: "User ID", required: true },
    { key: "user_name", label: "Name", required: true },
    { key: "user_email", label: "Email", type: "email", required: true },
    { key: "user_phone", label: "Phone" },
    { key: "password", label: "Password", type: "password", required: true },
  ],
  guides: [
    { key: "guide_nid", label: "Guide NID", required: true },
    { key: "guide_name", label: "Name", required: true },
    { key: "guide_email", label: "Email", type: "email", required: true },
    { key: "guide_mobile", label: "Mobile" },
    { key: "guide_division", label: "Division" },
    { key: "guide_district", label: "District" },
    { key: "guide_rate", label: "Daily Rate", type: "number" },
    { key: "password", label: "Password", type: "password", required: true },
  ],
  managers: [
    { key: "manager_id", label: "Manager ID", required: true },
    { key: "manager_name", label: "Name", required: true },
    { key: "manager_email", label: "Email", type: "email", required: true },
    { key: "manager_mobile", label: "Mobile" },
    { key: "hotel_registration_number", label: "Hotel Reg#" },
    { key: "password", label: "Password", type: "password", required: true },
  ],
  hotels: [
    { key: "hotel_registration_number", label: "Registration #", required: true },
    { key: "hotel_name", label: "Name", required: true },
    { key: "hotel_division", label: "Division" },
    { key: "hotel_district", label: "District" },
    { key: "hotel_location", label: "Location" },
    { key: "hotel_rating", label: "Rating" },
    { key: "hotel_price", label: "Price", type: "number" },
    { key: "hotel_description", label: "Description" },
  ],
  transports: [
    { key: "transport_id", label: "Transport ID", required: true },
    { key: "transport_type", label: "Type (Train/Bus/Airplane)", required: true },
    { key: "transport_route", label: "Route", required: true },
    { key: "transport_fare", label: "Fare", type: "number", required: true },
  ],
  spots: [
    { key: "spot_id", label: "Spot ID", required: true },
    { key: "spot_name", label: "Name", required: true },
    { key: "city", label: "City" },
    { key: "division", label: "Division" },
    { key: "description", label: "Description" },
    { key: "best_season", label: "Best Season" },
    { key: "entry_fee", label: "Entry Fee", type: "number" },
    { key: "estimated_hours", label: "Est. Hours", type: "number" },
  ],
  packages: [
    { key: "package_name", label: "Package Name", required: true },
    { key: "price", label: "Price (৳)", type: "number", required: true },
    { key: "transport_limit", label: "Transport Bookings Limit", type: "number", required: true },
    { key: "hotel_limit", label: "Hotel Bookings Limit", type: "number", required: true },
    { key: "guide_limit", label: "Guide Bookings Limit", type: "number", required: true },
    { key: "discount_pct", label: "Discount %", type: "number" },
    { key: "priority", label: "Priority (true/false)" },
    { key: "exclusive", label: "Exclusive (true/false)" },
    { key: "complementary_breakfast", label: "Complimentary Breakfast (true/false)" },
    { key: "complementary_lunch", label: "Complimentary Lunch (true/false)" },
    { key: "complementary_dinner", label: "Complimentary Dinner (true/false)" },
    { key: "features", label: "Features (comma-separated)" },
  ],
};

const editFields: Record<string, { key: string; label: string; type?: string }[]> = {
  users: [
    { key: "user_name", label: "Name" },
    { key: "user_email", label: "Email", type: "email" },
    { key: "user_phone", label: "Phone" },
  ],
  guides: [
    { key: "guide_name", label: "Name" },
    { key: "guide_email", label: "Email", type: "email" },
    { key: "guide_mobile", label: "Mobile" },
    { key: "guide_division", label: "Division" },
    { key: "guide_district", label: "District" },
    { key: "guide_rate", label: "Daily Rate", type: "number" },
  ],
  managers: [
    { key: "manager_name", label: "Name" },
    { key: "manager_email", label: "Email", type: "email" },
    { key: "manager_mobile", label: "Mobile" },
    { key: "hotel_registration_number", label: "Hotel Reg#" },
  ],
  hotels: [
    { key: "hotel_name", label: "Name" },
    { key: "hotel_division", label: "Division" },
    { key: "hotel_district", label: "District" },
    { key: "hotel_location", label: "Location" },
    { key: "hotel_rating", label: "Rating" },
    { key: "hotel_price", label: "Price", type: "number" },
    { key: "hotel_description", label: "Description" },
  ],
  transports: [
    { key: "transport_type", label: "Type" },
    { key: "transport_route", label: "Route" },
    { key: "transport_fare", label: "Fare", type: "number" },
  ],
  spots: [
    { key: "spot_name", label: "Name" },
    { key: "city", label: "City" },
    { key: "division", label: "Division" },
    { key: "description", label: "Description" },
    { key: "best_season", label: "Best Season" },
    { key: "entry_fee", label: "Entry Fee", type: "number" },
    { key: "estimated_hours", label: "Est. Hours", type: "number" },
  ],
  packages: [
    { key: "package_name", label: "Package Name" },
    { key: "price", label: "Price (৳)", type: "number" },
    { key: "transport_limit", label: "Transport Bookings Limit", type: "number" },
    { key: "hotel_limit", label: "Hotel Bookings Limit", type: "number" },
    { key: "guide_limit", label: "Guide Bookings Limit", type: "number" },
    { key: "discount_pct", label: "Discount %", type: "number" },
    { key: "priority", label: "Priority (true/false)" },
    { key: "exclusive", label: "Exclusive (true/false)" },
    { key: "complementary_breakfast", label: "Complimentary Breakfast (true/false)" },
    { key: "complementary_lunch", label: "Complimentary Lunch (true/false)" },
    { key: "complementary_dinner", label: "Complimentary Dinner (true/false)" },
    { key: "features", label: "Features (comma-separated)" },
  ],
};

const entityApiMap: Record<string, string> = {
  users: "users",
  guides: "guides",
  managers: "managers",
  hotels: "hotels",
  transports: "transports",
  spots: "spots",
  packages: "packages",
};

const idFieldMap: Record<string, string> = {
  users: "user_id",
  guides: "guide_nid",
  managers: "manager_id",
  hotels: "hotel_registration_number",
  transports: "transport_id",
  spots: "spot_id",
  packages: "package_id",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Create/Edit modal
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [modalEntity, setModalEntity] = useState("");
  const [modalEditId, setModalEditId] = useState("");
  const [modalForm, setModalForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) { router.push("/admin/login"); return; }
    loadTab("stats");
  }, []);

  const loadTab = async (t: Tab) => {
    setTab(t);
    setMsg("");
    setLoading(true);
    try {
      if (t === "stats") {
        const [s, c] = await Promise.all([getAdminStats(), getAdminChartData()]);
        setStats(s);
        setChartData(c);
      } else if (t === "users") setData(await getAdminUsers());
      else if (t === "guides") setData(await getAdminGuides());
      else if (t === "managers") setData(await getAdminManagers());
      else if (t === "hotels") setData(await getAdminHotels());
      else if (t === "transports") setData(await getAdminTransports());
      else if (t === "bookings") setData(await getAdminBookings());
      else if (t === "payments") setData(await getAdminPayments());
      else if (t === "spots") setData(await getAdminSpots());
      else if (t === "messages") setData(await getAdminMessages());
      else if (t === "packages") setData(await getAdminPackages());
      else if (t === "subscriptions") setData(await getAdminSubscriptions());
    } catch (err: any) {
      if (err.message?.includes("401") || err.message?.includes("Admin")) {
        router.push("/admin/login");
      }
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVoidBooking = async (id: string) => {
    try { await voidBooking(id); setMsg("Booking voided."); loadTab("bookings"); } catch (err: any) { setMsg(err.message); }
  };

  const handleRefund = async (id: string) => {
    try { await refundPayment(id); setMsg("Payment refunded."); loadTab("payments"); } catch (err: any) { setMsg(err.message); }
  };

  const handleDelete = async (entity: string, id: string) => {
    if (!confirm("Delete this record?")) return;
    try { await deleteAdminEntity(entity, id); setMsg("Deleted."); loadTab(tab); } catch (err: any) { setMsg(err.message); }
  };

  const openCreate = (entity: string) => {
    setModalMode("create");
    setModalEntity(entity);
    setModalEditId("");
    const fields = createFields[entity] || [];
    const form: Record<string, string> = {};
    fields.forEach((f) => { form[f.key] = ""; });
    setModalForm(form);
  };

  const openEdit = (entity: string, row: any) => {
    setModalMode("edit");
    setModalEntity(entity);
    const idKey = idFieldMap[entity] || "";
    setModalEditId(row[idKey] || "");
    const fields = editFields[entity] || [];
    const form: Record<string, string> = {};
    fields.forEach((f) => { form[f.key] = row[f.key] !== null && row[f.key] !== undefined ? String(row[f.key]) : ""; });
    setModalForm(form);
  };

  const closeModal = () => {
    setModalMode(null);
    setModalEntity("");
    setModalEditId("");
    setModalForm({});
  };

  const handleModalSubmit = async () => {
    try {
      // Convert numeric fields
      const payload: any = { ...modalForm };
      const numFields = ["price", "booking_limit", "transport_limit", "hotel_limit", "guide_limit", "discount_pct", "guide_rate", "hotel_price", "transport_fare", "entry_fee", "estimated_hours"];
      numFields.forEach((f) => {
        if (payload[f] !== undefined && payload[f] !== "") payload[f] = Number(payload[f]);
      });
      // Convert boolean fields
      ["priority", "exclusive", "complementary_breakfast", "complementary_lunch", "complementary_dinner"].forEach((f) => {
        if (payload[f] !== undefined) payload[f] = payload[f] === "true" || payload[f] === "1";
      });

      const apiEntity = entityApiMap[modalEntity] || modalEntity;

      if (modalMode === "create") {
        await createAdminEntity(apiEntity, payload);
        setMsg(`${modalEntity.slice(0, -1)} created successfully.`);
      } else {
        await updateAdminEntity(apiEntity, modalEditId, payload);
        setMsg(`${modalEntity.slice(0, -1)} updated successfully.`);
      }
      closeModal();
      loadTab(tab);
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  const isError = msg.includes("Error") || msg.includes("failed") || msg.includes("Not Found") || msg.includes("401") || msg.includes("403") || msg.includes("404") || msg.includes("400") || msg.includes("500") || msg.includes("already");
  const msgBg = isError ? "rgba(239,154,154,0.12)" : "rgba(184,212,188,0.18)";
  const msgColor = isError ? "#8b3a3a" : "var(--forest)";
  const msgBorder = isError ? "rgba(239,154,154,0.35)" : "rgba(184,212,188,0.4)";

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Jost', sans-serif", background: "var(--cream, #faf7f2)" }}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap");
        :root {
          --forest: #1a3322; --canopy: #244a31; --moss: #3a6642; --fern: #4e8056;
          --sage: #7aaa80; --mist: #b8d4bc; --dew: #dff0e2; --parchment: #f5f0e8;
          --bark: #6b4f3a; --earth: #c8b89a; --cream: #faf7f2; --gold: #b8982a;
          --gold-light: #e6d38a; --text-dark: #1a2e1e; --text-mid: #3a5a42; --text-soft: #6b8b72;
          --serif: 'Cormorant Garamond', Georgia, serif; --sans: 'Jost', sans-serif;
          --shadow-sm: 0 2px 12px rgba(26,51,34,0.08);
          --shadow-md: 0 6px 30px rgba(26,51,34,0.12);
        }
        .chart-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .chart-bar-label { width: 100px; font-size: 12px; font-weight: 500; text-align: right; color: var(--text-mid); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .chart-bar-track { flex: 1; height: 24px; background: rgba(184,212,188,0.2); border-radius: 6px; overflow: hidden; }
        .chart-bar-fill { height: 100%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px; color: #fff; font-size: 11px; font-weight: 600; transition: width .5s ease; min-width: 20px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(26,51,34,0.4); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-box { background: var(--cream); border-radius: 18px; padding: 32px; width: 520px; max-width: 95vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(26,51,34,0.18); border: 1px solid rgba(184,212,188,0.3); }
        .modal-field { margin-bottom: 14px; }
        .modal-field label { display: block; font-size: 0.72rem; font-weight: 600; color: var(--text-mid); margin-bottom: 4px; text-transform: uppercase; letter-spacing: .06em; }
        .modal-field input { width: 100%; padding: 10px 14px; border: 1.5px solid rgba(122,170,128,0.3); border-radius: 8; font-size: 0.9rem; font-family: var(--sans); outline: none; background: rgba(245,240,232,0.6); color: var(--text-dark); }
        .modal-field input:focus { border-color: var(--moss); box-shadow: 0 0 0 3px rgba(58,102,66,0.1); }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
        .btn-modal { padding: 10px 24px; border-radius: 8; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: var(--sans); border: none; transition: all 0.2s; }
        .btn-modal-primary { background: linear-gradient(135deg, var(--moss) 0%, var(--canopy) 100%); color: var(--dew); box-shadow: 0 4px 12px rgba(36,74,49,0.2); }
        .btn-modal-primary:hover { box-shadow: 0 6px 20px rgba(36,74,49,0.3); }
        .btn-modal-cancel { background: var(--parchment); color: var(--text-soft); border: 1px solid rgba(184,212,188,0.3); }
        .btn-modal-cancel:hover { background: rgba(184,212,188,0.2); }
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: 240, background: "linear-gradient(180deg, var(--forest) 0%, var(--canopy) 100%)", color: "var(--dew)", padding: "24px 0", position: "sticky", top: 0, height: "100vh", overflowY: "auto" as const, flexShrink: 0, borderRight: "2px solid var(--moss)" }}>
        <div style={{ padding: "0 20px", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(184,212,188,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mist)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c-4-3-8-7-8-12a8 8 0 0 1 16 0c0 5-4 9-8 12z" />
                <path d="M12 10v6" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.25rem", fontWeight: 600, color: "var(--dew)", margin: 0, letterSpacing: "0.3px" }}>
              Admin Panel
            </h2>
          </div>
          <p style={{ fontSize: "0.68rem", color: "var(--sage)", fontWeight: 300, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ComfyGo Management
          </p>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {tabs.map((t) => (
            <a
              key={t.key}
              onClick={() => loadTab(t.key)}
              style={{
                padding: "10px 20px",
                color: tab === t.key ? "var(--dew)" : "var(--sage)",
                background: tab === t.key ? "rgba(184,212,188,0.12)" : "transparent",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 400,
                borderLeft: tab === t.key ? "3px solid var(--gold)" : "3px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "all 0.15s ease",
                letterSpacing: "0.01em",
              }}
            >
              <span style={{ fontSize: "0.95rem", width: 22, textAlign: "center" }}>{t.icon}</span>
              <span>{t.label}</span>
            </a>
          ))}
        </nav>
        <div style={{ margin: "28px 20px 0", borderTop: "1px solid rgba(184,212,188,0.15)", paddingTop: 16 }}>
          <button
            onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("admin_token"); localStorage.removeItem("admin_name"); router.push("/admin/login"); }}
            style={{ width: "100%", padding: "10px 16px", background: "rgba(239,154,154,0.1)", color: "#e8a0a0", border: "1px solid rgba(239,154,154,0.2)", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", fontFamily: "var(--sans)", fontWeight: 400, transition: "all 0.2s", letterSpacing: "0.03em" }}
          >
            ↩ Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 32, background: "var(--cream, #faf7f2)" }}>
        {msg && (
          <div style={{ padding: "12px 16px", borderRadius: 8, marginBottom: 16, background: msgBg, color: msgColor, border: "1px solid " + msgBorder }}>
            {msg}
          </div>
        )}

        {loading ? (
          <p style={{ color: "#888" }}>Loading...</p>
        ) : (
          <>
            {/* ─── Stats + Charts ─── */}
            {tab === "stats" && stats && (
              <div>
                <h1 style={{ fontFamily: "var(--serif, 'Cormorant Garamond', Georgia, serif)", fontSize: "1.8rem", fontWeight: 600, color: "var(--forest)", marginBottom: 24 }}>
                  Dashboard Overview
                </h1>

                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14, marginBottom: 36 }}>
                  {[
                    ["Users", "users", "#2d5a3d"], ["Guides", "guides", "#c8832a"], ["Managers", "managers", "#2980b9"],
                    ["Hotels", "hotels", "#8e44ad"], ["Transports", "transports", "#e74c3c"], ["Bookings", "bookings", "#16a085"],
                    ["Payments", "payments", "#f39c12"], ["Spots", "spots", "#3498db"], ["Messages", "messages", "#e91e63"],
                    ["Packages", "packages", "#27ae60"], ["Subscriptions", "subscriptions", "#9b59b6"],
                  ].map(([label, key, color]) => (
                    <div key={label} style={{ background: "rgba(255,255,255,0.8)", borderRadius: 12, padding: "18px 14px", border: "1px solid rgba(184,212,188,0.3)", borderLeft: `4px solid ${color}`, boxShadow: "var(--shadow-sm, 0 2px 12px rgba(26,51,34,0.08))" }}>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-soft, #6b8b72)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>{label}</p>
                      <p style={{ fontSize: "1.6rem", fontFamily: "var(--serif, 'Cormorant Garamond', Georgia, serif)", fontWeight: 700, color }}>{stats[key] ?? 0}</p>
                    </div>
                  ))}
                  <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 12, padding: "18px 14px", border: "1px solid rgba(184,212,188,0.3)", borderLeft: "4px solid var(--gold, #b8982a)", boxShadow: "var(--shadow-sm, 0 2px 12px rgba(26,51,34,0.08))" }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-soft, #6b8b72)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>Revenue</p>
                    <p style={{ fontSize: "1.6rem", fontFamily: "var(--serif, 'Cormorant Garamond', Georgia, serif)", fontWeight: 700, color: "var(--forest, #1a3322)" }}>৳{(stats.total_revenue || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Charts */}
                {chartData && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 24 }}>
                    {/* Pie Chart - Booking Types */}
                    <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 12, padding: 24, border: "1px solid rgba(184,212,188,0.3)", boxShadow: "var(--shadow-sm, 0 2px 12px rgba(26,51,34,0.08))" }}>
                      <h3 style={{ fontSize: "0.9rem", fontFamily: "var(--serif, 'Cormorant Garamond', Georgia, serif)", fontWeight: 600, color: "var(--forest, #1a3322)", marginBottom: 16 }}>Bookings by Type</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <PieChart data={chartData.booking_types || {}} />
                      </div>
                    </div>

                    {/* Pie Chart - Booking Status */}
                    <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 12, padding: 24, border: "1px solid rgba(184,212,188,0.3)", boxShadow: "var(--shadow-sm, 0 2px 12px rgba(26,51,34,0.08))" }}>
                      <h3 style={{ fontSize: "0.9rem", fontFamily: "var(--serif, 'Cormorant Garamond', Georgia, serif)", fontWeight: 600, color: "var(--forest, #1a3322)", marginBottom: 16 }}>Booking Status</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <PieChart data={chartData.booking_status || {}} />
                      </div>
                    </div>

                    {/* Bar Chart - Revenue by Type */}
                    <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 12, padding: 24, border: "1px solid rgba(184,212,188,0.3)", boxShadow: "var(--shadow-sm, 0 2px 12px rgba(26,51,34,0.08))" }}>
                      <h3 style={{ fontSize: "0.9rem", fontFamily: "var(--serif, 'Cormorant Garamond', Georgia, serif)", fontWeight: 600, color: "var(--forest, #1a3322)", marginBottom: 16 }}>Revenue by Booking Type</h3>
                      <BarChart data={chartData.top_revenue_sources || {}} prefix="৳" />
                    </div>

                    {/* Bar Chart - Package Popularity */}
                    <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 12, padding: 24, border: "1px solid rgba(184,212,188,0.3)", boxShadow: "var(--shadow-sm, 0 2px 12px rgba(26,51,34,0.08))" }}>
                      <h3 style={{ fontSize: "0.9rem", fontFamily: "var(--serif, 'Cormorant Garamond', Georgia, serif)", fontWeight: 600, color: "var(--forest, #1a3322)", marginBottom: 16 }}>Package Popularity</h3>
                      <BarChart data={chartData.package_popularity || {}} />
                    </div>

                    {/* Bar Chart - Division Bookings */}
                    <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 12, padding: 24, border: "1px solid rgba(184,212,188,0.3)", boxShadow: "var(--shadow-sm, 0 2px 12px rgba(26,51,34,0.08))" }}>
                      <h3 style={{ fontSize: "0.9rem", fontFamily: "var(--serif, 'Cormorant Garamond', Georgia, serif)", fontWeight: 600, color: "var(--forest, #1a3322)", marginBottom: 16 }}>Bookings by Division</h3>
                      <BarChart data={chartData.division_bookings || {}} />
                    </div>

                    {/* Recent Activity */}
                    <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 12, padding: 24, border: "1px solid rgba(184,212,188,0.3)", boxShadow: "var(--shadow-sm, 0 2px 12px rgba(26,51,34,0.08))" }}>
                      <h3 style={{ fontSize: "0.9rem", fontFamily: "var(--serif, 'Cormorant Garamond', Georgia, serif)", fontWeight: 600, color: "var(--forest, #1a3322)", marginBottom: 16 }}>Recent Activity</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(chartData.recent_activity || []).map((a: any, i: number) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(184,212,188,0.08)", borderRadius: 8, fontSize: "0.82rem" }}>
                            <div>
                              <span style={{ fontWeight: 600 }}>{a.type}</span>
                              <span style={{ color: "#888", marginLeft: 8 }}>{a.message}</span>
                            </div>
                            <span style={{
                              padding: "2px 10px", borderRadius: 50, fontSize: "0.7rem", fontWeight: 500,
                              background: a.status === "Confirmed" ? "rgba(184,212,188,0.2)" : a.status === "Pending" ? "rgba(230,211,138,0.25)" : "rgba(200,184,154,0.2)",
                              color: a.status === "Confirmed" ? "var(--forest)" : a.status === "Pending" ? "var(--bark)" : "var(--text-soft)",
                            }}>{a.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Data Tables ─── */}
            {tab !== "stats" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h1 style={{ fontFamily: "var(--serif, 'Cormorant Garamond', Georgia, serif)", fontSize: "1.6rem", fontWeight: 600, color: "var(--forest)", letterSpacing: "0.3px" }}>
                    {tabs.find((t) => t.key === tab)?.icon} {tabs.find((t) => t.key === tab)?.label}
                  </h1>
                  {createFields[tab] && (
                    <button
                      onClick={() => openCreate(tab)}
                      style={{ padding: "8px 20px", background: "linear-gradient(135deg, var(--moss, #3a6642) 0%, var(--canopy, #244a31) 100%)", color: "var(--dew, #dff0e2)", border: "none", borderRadius: 8, fontSize: "0.85rem", fontWeight: 500, cursor: "pointer", fontFamily: "var(--sans, 'Jost', sans-serif)", boxShadow: "0 4px 12px rgba(36,74,49,0.2)", letterSpacing: "0.03em" }}
                    >
                      + Add New
                    </button>
                  )}
                </div>
                {data.length === 0 ? (
                  <p style={{ color: "#888" }}>No data found.</p>
                ) : (
                  <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 12, border: "1px solid rgba(184,212,188,0.3)", overflow: "auto", boxShadow: "var(--shadow-sm, 0 2px 12px rgba(26,51,34,0.08))" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ background: "rgba(245,240,232,0.8)" }}>
                          {Object.keys(data[0])
                            .filter((k) => !k.includes("password"))
                            .map((k) => (
                              <th key={k} style={{ padding: "12px 14px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--text-soft, #6b8b72)", borderBottom: "1px solid rgba(184,212,188,0.3)" }}>
                                {k.replace(/_/g, " ")}
                              </th>
                            ))}
                          <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" as const, color: "var(--text-soft, #6b8b72)" }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(184,212,188,0.15)" }}>
                            {Object.entries(row)
                              .filter(([k]) => !k.includes("password"))
                              .map(([k, v]) => (
                                <td key={k} style={{ padding: "12px 14px", color: "#333", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {String(v ?? "—")}
                                </td>
                              ))}
                            <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                              {tab === "bookings" && row.booking_confirmation === "Pending" && (
                                <button onClick={() => handleVoidBooking(row.booking_id)} style={{ padding: "4px 12px", background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", marginRight: 6 }}>
                                  Void
                                </button>
                              )}
                              {tab === "payments" && (
                                <button onClick={() => handleRefund(row.payment_id)} style={{ padding: "4px 12px", background: "#2980b9", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", marginRight: 6 }}>
                                  Refund
                                </button>
                              )}
                              {editFields[tab] && (
                                <button
                                  onClick={() => openEdit(tab, row)}
                                  style={{ padding: "4px 12px", background: "#f39c12", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", marginRight: 6 }}
                                >
                                  Edit
                                </button>
                              )}
                              {Object.keys(deleteEntityMap).includes(tab) && (
                                <button
                                  onClick={() => {
                                    const idKey = deleteEntityMap[tab];
                                    if (idKey && row[idKey]) handleDelete(tab, row[idKey]);
                                  }}
                                  style={{ padding: "4px 12px", background: "transparent", color: "#c0392b", border: "1px solid #ef9a9a", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem" }}
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── Create/Edit Modal ─── */}
      {modalMode && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", marginBottom: 20 }}>
              {modalMode === "create" ? "Create" : "Edit"} {modalEntity.slice(0, -1)}
            </h2>
            {(modalMode === "create" ? createFields[modalEntity] : editFields[modalEntity])?.map((field) => (
              <div key={field.key} className="modal-field">
                <label>{field.label}</label>
                <input
                  type={field.type || "text"}
                  value={modalForm[field.key] || ""}
                  onChange={(e) => setModalForm({ ...modalForm, [field.key]: e.target.value })}
                  placeholder={field.label}
                  required={(field as any).required && modalMode === "create"}
                  readOnly={modalMode === "edit" && (field.key === "user_id" || field.key === "guide_nid" || field.key === "manager_id" || field.key === "hotel_registration_number" || field.key === "transport_id" || field.key === "spot_id" || field.key === "package_id")}
                />
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-modal btn-modal-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-modal btn-modal-primary" onClick={handleModalSubmit}>
                {modalMode === "create" ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CSS Pie Chart Component ───

function PieChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  if (total === 0) return <p style={{ color: "var(--text-soft, #6b8b72)", fontSize: 13 }}>No data</p>;

  let cumulativePercent = 0;
  const gradientParts: string[] = [];
  entries.forEach(([key, value], i) => {
    const percent = (value / total) * 100;
    const color = CHART_COLORS[i % CHART_COLORS.length];
    gradientParts.push(`${color} ${cumulativePercent}% ${cumulativePercent + percent}%`);
    cumulativePercent += percent;
  });

  const gradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div>
      <div style={{ width: 160, height: 160, borderRadius: "50%", background: gradient, position: "relative" }}>
        <div style={{ position: "absolute", inset: "25%", background: "var(--cream, #faf7f2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--serif, 'Cormorant Garamond', Georgia, serif)", color: "var(--forest, #1a3322)" }}>{total}</span>
          <span style={{ fontSize: 10, color: "var(--text-soft, #6b8b72)", letterSpacing: "0.08em", textTransform: "uppercase" }}>TOTAL</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
        {entries.map(([key, value], i) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
            <span style={{ flex: 1, color: "var(--text-mid, #3a5a42)" }}>{key}</span>
            <span style={{ fontWeight: 600, color: "var(--text-dark, #1a2e1e)" }}>{value}</span>
            <span style={{ color: "var(--text-soft, #6b8b72)", fontSize: 11 }}>({((value / total) * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CSS Bar Chart Component ───

function BarChart({ data, prefix = "" }: { data: Record<string, number>; prefix?: string }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) return <p style={{ color: "var(--text-soft, #6b8b72)", fontSize: 13 }}>No data</p>;

  return (
    <div>
      {entries.map(([key, value], i) => (
        <div key={key} className="chart-bar-row">
          <div className="chart-bar-label" title={key}>{key}</div>
          <div className="chart-bar-track">
            <div
              className="chart-bar-fill"
              style={{
                width: `${Math.max((value / maxVal) * 100, 5)}%`,
                background: CHART_COLORS[i % CHART_COLORS.length],
              }}
            >
              {prefix}{value.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
