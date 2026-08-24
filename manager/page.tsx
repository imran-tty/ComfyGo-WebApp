"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getManagerProfile, updateManagerProfile, updateManagerHotel,
  getManagerPendingBookings, getManagerBookingHistory,
  approveManagerBooking, rejectManagerBooking, logout,
} from "@/lib/api";

export default function ManagerDashboard() {
  const router = useRouter();
  const [mgr, setMgr] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [profileForm, setProfileForm] = useState({ manager_name: "", manager_email: "", manager_mobile: "" });
  const [hotelForm, setHotelForm] = useState({
    hotel_name: "", hotel_division: "", hotel_district: "", hotel_location: "",
    hotel_rating: "", hotel_price: 0, hotel_description: "",
  });

  const loadData = async () => {
    try {
      const role = localStorage.getItem("role");
      if (!localStorage.getItem("token") || role !== "manager") { router.push("/login"); return; }
      const m = await getManagerProfile();
      setMgr(m);
      setProfileForm({ manager_name: m.manager_name, manager_email: m.manager_email, manager_mobile: m.manager_mobile });
      setHotelForm({
        hotel_name: m.hotel_name || "", hotel_division: m.hotel_division || "",
        hotel_district: m.hotel_district || "", hotel_location: m.hotel_location || "",
        hotel_rating: m.hotel_rating || "", hotel_price: m.hotel_price || 0,
        hotel_description: m.hotel_description || "",
      });
      const [p, h] = await Promise.all([getManagerPendingBookings(), getManagerBookingHistory()]);
      setPending(p); setHistory(h);
    } catch { router.push("/login"); }
  };

  useEffect(() => { loadData(); }, []);

  const handleLogout = async () => { await logout(); localStorage.clear(); router.push("/login"); };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    try { await updateManagerProfile(profileForm); setSuccess("Profile updated successfully."); loadData(); }
    catch (err: any) { setError(err.message); }
  };

  const handleHotelSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    try { await updateManagerHotel(hotelForm); setSuccess("Hotel details updated successfully."); loadData(); }
    catch (err: any) { setError(err.message); }
  };

  const handleApprove = async (id: string) => {
    setError(""); setSuccess("");
    try { await approveManagerBooking(id); setSuccess("Booking approved and confirmed."); loadData(); }
    catch (err: any) { setError(err.message); }
  };

  const handleReject = async (id: string) => {
    setError(""); setSuccess("");
    try { await rejectManagerBooking(id); setSuccess("Booking has been rejected."); loadData(); }
    catch (err: any) { setError(err.message); }
  };

  if (!mgr) return <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-body)" }}>Loading...</div>;

  return (
    <div>
      <style>{`
        .mgr-layout { display: flex; min-height: 100vh; font-family: var(--font-body); background: #F6F8F7; }
        .mgr-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #123832 0%, #0e2e29 100%);
          color: #fff;
          padding: 28px 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .mgr-sidebar-brand {
          padding: 0 24px;
          margin-bottom: 32px;
        }
        .mgr-sidebar-brand h2 {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 2px;
        }
        .mgr-sidebar-brand h2 span { color: var(--accent); }
        .mgr-sidebar-brand p {
          font-size: 0.72rem;
          color: rgba(184, 212, 188, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .mgr-nav { display: flex; flex-direction: column; gap: 2px; padding: 0 12px; flex: 1; }
        .mgr-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          border-radius: var(--radius-xs);
          font-size: 0.88rem;
          font-weight: 500;
          color: rgba(184, 212, 188, 0.6);
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: none;
          text-align: left;
          width: 100%;
        }
        .mgr-nav-link:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        .mgr-nav-link.active {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .mgr-nav-link i { font-size: 1.1rem; width: 20px; text-align: center; }
        .mgr-nav-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 12px 16px; }
        .mgr-nav-bottom { padding: 0 12px; }
        .mgr-logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          border-radius: var(--radius-xs);
          font-size: 0.88rem;
          font-weight: 500;
          color: #E8783C;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .mgr-logout-btn:hover { background: rgba(232,120,60,0.1); }
        .mgr-main { flex: 1; display: flex; flex-direction: column; }
        .mgr-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 36px;
          background: var(--surface);
          border-bottom: 1px solid var(--line);
        }
        .mgr-greeting { font-family: var(--font-heading); font-size: 1.6rem; font-weight: 700; color: var(--text); }
        .mgr-role-badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(13,92,80,0.08);
          color: var(--primary);
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-top: 4px;
        }
        .mgr-topbar-right { display: flex; align-items: center; gap: 16px; }
        .mgr-notification {
          width: 40px;
          height: 40px;
          background: var(--bg);
          border: 1px solid var(--line);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 1.1rem;
        }
        .mgr-content { padding: 32px 36px; flex: 1; }
        .mgr-alert {
          padding: 12px 16px;
          border-radius: var(--radius-xs);
          font-size: 0.88rem;
          font-weight: 500;
          margin-bottom: 24px;
        }
        .mgr-alert-error { background: var(--danger-bg); color: var(--danger); border: 1px solid #FCA5A5; }
        .mgr-alert-success { background: var(--success-bg); color: var(--success); border: 1px solid #86EFAC; }
        .mgr-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        .mgr-stat-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
        }
        .mgr-stat-icon {
          width: 44px;
          height: 44px;
          background: rgba(13,92,80,0.08);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: var(--primary);
          margin-bottom: 14px;
        }
        .mgr-stat-num {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
          margin-bottom: 4px;
        }
        .mgr-stat-label {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .mgr-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .mgr-panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
        }
        .mgr-panel-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 16px;
        }
        .mgr-booking-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--line-light);
        }
        .mgr-booking-item:last-child { border-bottom: none; }
        .mgr-booking-name { font-weight: 500; font-size: 0.9rem; color: var(--text); }
        .mgr-booking-date { font-size: 0.82rem; color: var(--text-muted); }
        .mgr-section {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 28px;
          box-shadow: var(--shadow);
          margin-bottom: 24px;
        }
        .mgr-section-title {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }
        .mgr-section-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }
        .mgr-table-wrap { overflow-x: auto; border-radius: var(--radius-sm); border: 1px solid var(--line); }
        .mgr-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .mgr-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted);
          background: var(--bg);
          border-bottom: 1px solid var(--line);
        }
        .mgr-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--line-light);
          color: var(--text);
        }
        .mgr-table tr:last-child td { border-bottom: none; }
        .mgr-btn-approve {
          padding: 6px 14px;
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: var(--radius-xs);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }
        .mgr-btn-reject {
          padding: 6px 14px;
          background: var(--danger);
          color: #fff;
          border: none;
          border-radius: var(--radius-xs);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          margin-left: 6px;
        }
        .mgr-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; max-width: 480px; }
        .mgr-field label { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); }
        .mgr-field input, .mgr-field textarea {
          padding: 10px 14px;
          border: 1.5px solid var(--line);
          border-radius: var(--radius-xs);
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--text);
          background: var(--bg);
          outline: none;
        }
        .mgr-field input:focus, .mgr-field textarea:focus { border-color: var(--primary); background: #fff; }
        .mgr-save-btn {
          margin-top: 8px;
          padding: 12px 28px;
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: var(--radius-xs);
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mgr-save-btn:hover { background: var(--primary-dark); }
        .mgr-empty { font-size: 0.9rem; color: var(--text-light); padding: 16px 0; }
        @media (max-width: 800px) {
          .mgr-sidebar { display: none; }
          .mgr-stats { grid-template-columns: 1fr 1fr; }
          .mgr-panels { grid-template-columns: 1fr; }
          .mgr-content { padding: 20px; }
          .mgr-topbar { padding: 20px; }
        }
      `}</style>

      <div className="mgr-layout">
        <aside className="mgr-sidebar">
          <div className="mgr-sidebar-brand">
            <h2>Comfy<span>Go</span></h2>
            <p>Manager Panel</p>
          </div>
          <nav className="mgr-nav">
            {[
              { key: "overview", icon: "bi-grid", label: "Overview" },
              { key: "bookings", icon: "bi-calendar-check", label: "Bookings" },
              { key: "hotel", icon: "bi-building", label: "Hotel Details" },
              { key: "profile", icon: "bi-person", label: "My Profile" },
            ].map((item) => (
              <button
                key={item.key}
                className={`mgr-nav-link ${activeTab === item.key ? "active" : ""}`}
                onClick={() => setActiveTab(item.key)}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mgr-nav-divider"></div>
          <div className="mgr-nav-bottom">
            <a href="/" className="mgr-nav-link" style={{ marginBottom: 4 }}>
              <i className="bi bi-arrow-left"></i> Back to Site
            </a>
            <button className="mgr-logout-btn" onClick={handleLogout}>
              <i className="bi bi-box-arrow-left"></i> Log out
            </button>
          </div>
        </aside>

        <div className="mgr-main">
          <div className="mgr-topbar">
            <div>
              <h1 className="mgr-greeting">Welcome, {mgr.manager_name}</h1>
              <span className="mgr-role-badge">Hotel Manager</span>
            </div>
            <div className="mgr-topbar-right">
              <div className="mgr-notification">
                <i className="bi bi-bell"></i>
              </div>
            </div>
          </div>

          <div className="mgr-content">
            {error && <div className="mgr-alert mgr-alert-error">{error}</div>}
            {success && <div className="mgr-alert mgr-alert-success">{success}</div>}

            {activeTab === "overview" && (
              <>
                <div className="mgr-stats">
                  {[
                    { icon: "bi-calendar-check", num: pending.length + history.length, label: "Total Bookings" },
                    { icon: "bi-building", num: 1, label: "Hotels" },
                    { icon: "bi-people", num: history.length, label: "Guests" },
                    { icon: "bi-clock-history", num: pending.length, label: "Pending" },
                  ].map((s, i) => (
                    <div className="mgr-stat-card" key={i}>
                      <div className="mgr-stat-icon"><i className={`bi ${s.icon}`}></i></div>
                      <div className="mgr-stat-num">{s.num}</div>
                      <div className="mgr-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mgr-panels">
                  <div className="mgr-panel">
                    <h3 className="mgr-panel-title">Recent Bookings</h3>
                    {history.length === 0 && pending.length === 0 ? (
                      <p className="mgr-empty">No bookings yet.</p>
                    ) : (
                      [...pending.slice(0, 3), ...history.slice(0, 3)].map((b, i) => (
                        <div className="mgr-booking-item" key={i}>
                          <div>
                            <div className="mgr-booking-name">{b.user_name || "Guest"}</div>
                            <div className="mgr-booking-date">{b.booking_date}</div>
                          </div>
                          <span className={`badge ${b.booking_confirmation === "Confirmed" ? "badge-success" : "badge-warning"}`}>
                            {b.booking_confirmation || "Pending"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mgr-panel">
                    <h3 className="mgr-panel-title">Hotel Info</h3>
                    {[
                      ["Hotel Name", mgr.hotel_name],
                      ["Division", mgr.hotel_division],
                      ["District", mgr.hotel_district],
                      ["Price", `৳${(mgr.hotel_price || 0).toLocaleString()} / night`],
                    ].map(([l, v]) => (
                      <div className="mgr-booking-item" key={l}>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</span>
                        <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{v || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "bookings" && (
              <section className="mgr-section">
                <h2 className="mgr-section-title">Hotel Bookings</h2>
                <p className="mgr-section-sub">All tourist bookings for your hotel.</p>
                {pending.length > 0 && (
                  <>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", fontWeight: 600, color: "var(--accent)", marginBottom: 12 }}>Pending Approvals</h3>
                    <div className="mgr-table-wrap">
                      <table className="mgr-table">
                        <thead><tr><th>Booking ID</th><th>Tourist</th><th>Phone</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                          {pending.map((b) => (
                            <tr key={b.booking_id}>
                              <td>{b.booking_id}</td><td>{b.user_name}</td><td>{b.user_phone}</td><td>{b.booking_date}</td>
                              <td>
                                <button className="mgr-btn-approve" onClick={() => handleApprove(b.booking_id)}>Approve</button>
                                <button className="mgr-btn-reject" onClick={() => { if (confirm("Reject this booking?")) handleReject(b.booking_id); }}>Reject</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                {pending.length === 0 && history.length === 0 ? (
                  <p className="mgr-empty">No bookings yet.</p>
                ) : history.length > 0 && (
                  <>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", fontWeight: 600, color: "var(--text)", marginTop: 28, marginBottom: 12 }}>Booking History</h3>
                    <div className="mgr-table-wrap">
                      <table className="mgr-table">
                        <thead><tr><th>Booking ID</th><th>Tourist</th><th>Phone</th><th>Email</th><th>Date</th><th>Status</th></tr></thead>
                        <tbody>
                          {history.map((b) => (
                            <tr key={b.booking_id}>
                              <td>{b.booking_id}</td><td>{b.user_name}</td><td>{b.user_phone}</td><td>{b.user_email}</td><td>{b.booking_date}</td>
                              <td>
                                <span className={`badge ${b.booking_confirmation === "Confirmed" ? "badge-success" : b.booking_confirmation === "Pending" ? "badge-warning" : "badge-danger"}`}>
                                  {b.booking_confirmation}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            )}

            {activeTab === "hotel" && (
              <section className="mgr-section">
                <h2 className="mgr-section-title">Hotel Details</h2>
                <p className="mgr-section-sub">Update your hotel information.</p>
                <form onSubmit={handleHotelSave}>
                  {[
                    ["hotel_name", "Hotel Name", "text"],
                    ["hotel_division", "Division", "text"],
                    ["hotel_district", "District", "text"],
                    ["hotel_location", "Location", "text"],
                    ["hotel_rating", "Rating", "text"],
                    ["hotel_price", "Price per Night (৳)", "number"],
                  ].map(([k, l, t]) => (
                    <div className="mgr-field" key={k}>
                      <label>{l}</label>
                      <input type={t} value={(hotelForm as any)[k]} onChange={(e) => setHotelForm({ ...hotelForm, [k]: t === "number" ? Number(e.target.value) : e.target.value })} required />
                    </div>
                  ))}
                  <div className="mgr-field" style={{ maxWidth: "100%" }}>
                    <label>Description</label>
                    <textarea value={hotelForm.hotel_description} onChange={(e) => setHotelForm({ ...hotelForm, hotel_description: e.target.value })} style={{ minHeight: 100 }} />
                  </div>
                  <button type="submit" className="mgr-save-btn">Save Hotel</button>
                </form>
              </section>
            )}

            {activeTab === "profile" && (
              <section className="mgr-section">
                <h2 className="mgr-section-title">My Profile</h2>
                <p className="mgr-section-sub">Update your personal information.</p>
                <form onSubmit={handleProfileSave}>
                  {[
                    ["manager_name", "Full Name", "text"],
                    ["manager_email", "Email Address", "email"],
                    ["manager_mobile", "Mobile Number", "tel"],
                  ].map(([k, l, t]) => (
                    <div className="mgr-field" key={k}>
                      <label>{l}</label>
                      <input type={t} value={(profileForm as any)[k]} onChange={(e) => setProfileForm({ ...profileForm, [k]: e.target.value })} required />
                    </div>
                  ))}
                  <button type="submit" className="mgr-save-btn">Save Changes</button>
                </form>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
