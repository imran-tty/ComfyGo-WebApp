"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getGuideProfile,
  updateGuideProfile,
  getGuidePendingBookings,
  getGuideBookingHistory,
  approveGuideBooking,
  rejectGuideBooking,
  logout,
} from "@/lib/api";

export default function GuideDashboard() {
  const router = useRouter();
  const [guide, setGuide] = useState<any>(null);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Profile form
  const [form, setForm] = useState({
    guide_name: "", guide_email: "", guide_mobile: "",
    guide_division: "", guide_district: "", guide_rate: 0,
  });

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token || role !== "guide") { router.push("/login"); return; }
      const g = await getGuideProfile();
      setGuide(g);
      setForm({
        guide_name: g.guide_name, guide_email: g.guide_email,
        guide_mobile: g.guide_mobile, guide_division: g.guide_division,
        guide_district: g.guide_district, guide_rate: g.guide_rate,
      });
      const [p, h] = await Promise.all([getGuidePendingBookings(), getGuideBookingHistory()]);
      setPendingBookings(p);
      setHistory(h);
    } catch { router.push("/login"); }
  };

  useEffect(() => { loadData(); }, []);

  const handleLogout = async () => { await logout(); localStorage.clear(); router.push("/login"); };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    try { await updateGuideProfile(form); setSuccess("Profile updated successfully."); loadData(); }
    catch (err: any) { setError(err.message); }
  };

  const handleApprove = async (bookingId: string) => {
    setError(""); setSuccess("");
    try { await approveGuideBooking(bookingId); setSuccess("Booking has been approved and confirmed."); loadData(); }
    catch (err: any) { setError(err.message); }
  };

  const handleReject = async (bookingId: string) => {
    setError(""); setSuccess("");
    try { await rejectGuideBooking(bookingId); setSuccess("Booking has been rejected."); loadData(); }
    catch (err: any) { setError(err.message); }
  };

  if (!guide) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: linear-gradient(160deg, #f0faf2 0%, #e8f8f0 50%, #f5fde8 100%); color: #1b3a2a; min-height: 100vh; }
        #guide_page { min-height: 100vh; }
        #guide_topbar { background: rgba(255,255,255,0.92); border-bottom: 1px solid #c8e6c9; padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 100; }
        #guide_welcome_tag { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.13em; text-transform: uppercase; color: #2e7d32; margin-bottom: 3px; }
        #guide_welcome_name { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 700; color: #1b3a2a; }
        #guide_welcome_id { font-size: 0.78rem; color: #6a8f72; margin-top: 2px; }
        #guide_logout_btn { font-family: 'DM Sans', sans-serif; font-size: 0.83rem; font-weight: 600; padding: 9px 20px; background: transparent; color: #c62828; border: 1.5px solid #ef9a9a; border-radius: 8px; cursor: pointer; }
        #guide_logout_btn:hover { background: #fef2f2; border-color: #c62828; }
        .g_alert { margin: 16px 40px 0; padding: 12px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 500; }
        .g_alert_error { background: #fef2f2; border: 1px solid #fca5a5; color: #b91c1c; }
        .g_alert_success { background: #f0fdf4; border: 1px solid #86efac; color: #15803d; }
        #guide_body { display: grid; grid-template-columns: 220px 1fr; min-height: calc(100vh - 72px); }
        #guide_sidebar { background: rgba(255,255,255,0.7); border-right: 1px solid #c8e6c9; padding: 28px 12px; }
        #guide_nav { display: flex; flex-direction: column; gap: 2px; }
        .g_nav_link { font-size: 0.87rem; font-weight: 500; color: #4a7060; text-decoration: none; padding: 11px 16px; border-radius: 8px; cursor: pointer; transition: background 0.18s, color 0.18s; }
        .g_nav_link:hover, .g_nav_link.active { background: #eaf7ec; color: #1b3a2a; }
        #guide_content { padding: 36px 40px; display: flex; flex-direction: column; gap: 40px; }
        .g_section { background: rgba(255,255,255,0.75); border: 1px solid #c8e6c9; border-top: 3px solid #43a856; border-radius: 16px; padding: 28px 30px; backdrop-filter: blur(8px); }
        .g_section_title { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; color: #1b3a2a; padding-bottom: 14px; border-bottom: 1px solid #d8eed8; margin-bottom: 6px; }
        .g_section_sub { font-size: 0.86rem; color: #4a7060; margin-top: 10px; margin-bottom: 22px; }
        #guide_info_grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .g_info_card { background: #f0faf2; border: 1px solid #c8e6c9; border-radius: 10px; padding: 16px 18px; }
        .g_info_label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #5a7a60; margin-bottom: 6px; }
        .g_info_value { font-size: 0.95rem; font-weight: 600; color: #1b3a2a; }
        .g_booking_cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 8px; }
        .g_booking_card { background: #ffffff; border: 1px solid #c8e6c9; border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; }
        .g_booking_card_header { display: flex; justify-content: space-between; align-items: center; }
        .g_booking_id { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #5a7a60; }
        .g_booking_card_body { display: flex; flex-direction: column; gap: 6px; }
        .g_booking_row { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #1b3a2a; }
        .g_booking_row span.label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #5a7a60; min-width: 52px; }
        .g_booking_card_actions { display: flex; gap: 8px; margin-top: 4px; }
        .g_btn_approve { flex: 1; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600; padding: 8px 0; background: #2e7d32; color: #fff; border: none; border-radius: 7px; cursor: pointer; }
        .g_btn_approve:hover { background: #1b5e20; }
        .g_btn_reject { flex: 1; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600; padding: 8px 0; background: transparent; color: #c62828; border: 1.5px solid #ef9a9a; border-radius: 7px; cursor: pointer; }
        .g_btn_reject:hover { background: #fef2f2; border-color: #c62828; }
        .g_badge { font-size: 0.74rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
        .g_badge_confirmed { background: #e8f5e9; color: #2e7d32; }
        .g_badge_rejected { background: #fef2f2; color: #b91c1c; }
        .g_badge_pending { background: #fff7ed; color: #c2410c; }
        .g_section_label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #4a7060; margin: 20px 0 10px; }
        .g_profile_grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 24px; }
        .g_field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .g_field label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #3a6648; }
        .g_field input { width: 100%; padding: 10px 14px; border: 1.5px solid #c8e6c9; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: #1b3a2a; background: #f4faf4; outline: none; }
        .g_field input:focus { border-color: #43a856; background: #ffffff; box-shadow: 0 0 0 3px rgba(67,168,86,0.1); }
        .g_btn_primary { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600; padding: 11px 28px; background: #2e7d32; color: #ffffff; border: none; border-radius: 8px; cursor: pointer; margin-top: 4px; }
        .g_btn_primary:hover { background: #1b5e20; }
        .g_empty { font-size: 0.88rem; color: #6a8f72; padding: 16px 0; }
      `}</style>

      <div id="guide_page">
        <div id="guide_topbar">
          <div>
            <p id="guide_welcome_tag">Guide Dashboard</p>
            <h1 id="guide_welcome_name">Welcome, {guide.guide_name}</h1>
            <p id="guide_welcome_id">NID: {guide.guide_nid}</p>
          </div>
          <button id="guide_logout_btn" onClick={handleLogout}>Logout</button>
        </div>

        {error && <div className="g_alert g_alert_error">{error}</div>}
        {success && <div className="g_alert g_alert_success">{success}</div>}

        <div id="guide_body">
          <div id="guide_sidebar">
            <nav id="guide_nav">
              {["overview", "bookings", "profile"].map((tab) => (
                <a key={tab} className={`g_nav_link ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                  {tab === "overview" ? "Overview" : tab === "bookings" ? "My Bookings" : "Profile"}
                </a>
              ))}
            </nav>
          </div>

          <div id="guide_content">
            {/* Overview */}
            {activeTab === "overview" && (
              <section className="g_section">
                <h2 className="g_section_title">Overview</h2>
                <p className="g_section_sub">Your current profile information at a glance.</p>
                <div id="guide_info_grid">
                  {[
                    ["Full Name", guide.guide_name], ["Email", guide.guide_email],
                    ["Mobile", guide.guide_mobile], ["Division", guide.guide_division],
                    ["District", guide.guide_district], ["Rate per Day (৳)", `৳${guide.guide_rate?.toLocaleString()}`],
                  ].map(([label, value]) => (
                    <div className="g_info_card" key={label}>
                      <p className="g_info_label">{label}</p>
                      <p className="g_info_value">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bookings */}
            {activeTab === "bookings" && (
              <section className="g_section">
                <h2 className="g_section_title">My Bookings</h2>
                <p className="g_section_sub">Tourists who have booked you as their guide.</p>
                {pendingBookings.length === 0 && history.length === 0 ? (
                  <p className="g_empty">No bookings yet. Your profile will appear to tourists once you set your rate.</p>
                ) : (
                  <>
                    {pendingBookings.length > 0 && (
                      <>
                        <p className="g_section_label">Pending Approvals</p>
                        <div className="g_booking_cards">
                          {pendingBookings.map((b) => (
                            <div className="g_booking_card" key={b.booking_id}>
                              <div className="g_booking_card_header">
                                <span className="g_booking_id">#{b.booking_id}</span>
                                <span className="g_badge g_badge_pending">Pending</span>
                              </div>
                              <div className="g_booking_card_body">
                                <div className="g_booking_row"><span className="label">Tourist</span> {b.user_name}</div>
                                <div className="g_booking_row"><span className="label">Phone</span> {b.user_phone}</div>
                                <div className="g_booking_row"><span className="label">Date</span> {b.booking_date}</div>
                              </div>
                              <div className="g_booking_card_actions">
                                <button className="g_btn_approve" onClick={() => handleApprove(b.booking_id)}>Approve</button>
                                <button className="g_btn_reject" onClick={() => { if (confirm("Reject this booking?")) handleReject(b.booking_id); }}>Reject</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {history.length > 0 && (
                      <>
                        <p className="g_section_label" style={{ marginTop: 28 }}>Booking History</p>
                        <div className="g_booking_cards">
                          {history.map((b) => (
                            <div className="g_booking_card" key={b.booking_id}>
                              <div className="g_booking_card_header">
                                <span className="g_booking_id">#{b.booking_id}</span>
                                <span className={`g_badge ${b.booking_confirmation === "Confirmed" ? "g_badge_confirmed" : "g_badge_rejected"}`}>
                                  {b.booking_confirmation}
                                </span>
                              </div>
                              <div className="g_booking_card_body">
                                <div className="g_booking_row"><span className="label">Tourist</span> {b.user_name}</div>
                                <div className="g_booking_row"><span className="label">Phone</span> {b.user_phone}</div>
                                <div className="g_booking_row"><span className="label">Date</span> {b.booking_date}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </section>
            )}

            {/* Profile */}
            {activeTab === "profile" && (
              <section className="g_section">
                <h2 className="g_section_title">Update Profile</h2>
                <p className="g_section_sub">Keep your information up to date so tourists can find you.</p>
                <form onSubmit={handleProfileSave}>
                  <div className="g_profile_grid">
                    {[
                      ["guide_name", "Full Name", "text"],
                      ["guide_email", "Email Address", "email"],
                      ["guide_mobile", "Mobile Number", "tel"],
                      ["guide_division", "Division", "text"],
                      ["guide_district", "District", "text"],
                      ["guide_rate", "Rate per Day (৳)", "number"],
                    ].map(([key, label, type]) => (
                      <div className="g_field" key={key}>
                        <label>{label}</label>
                        <input
                          type={type}
                          value={(form as any)[key]}
                          onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="g_btn_primary">Save Changes</button>
                </form>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
