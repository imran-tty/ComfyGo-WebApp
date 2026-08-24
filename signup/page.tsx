"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupTourist, signupGuide, signupManager } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState("tourist");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [guideNid, setGuideNid] = useState("");
  const [guideName, setGuideName] = useState("");
  const [guideEmail, setGuideEmail] = useState("");
  const [guideMobile, setGuideMobile] = useState("");
  const [guideDivision, setGuideDivision] = useState("");
  const [guideDistrict, setGuideDistrict] = useState("");
  const [guidePassword, setGuidePassword] = useState("");
  const [guideConfirm, setGuideConfirm] = useState("");

  const [managerId, setManagerId] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerMobile, setManagerMobile] = useState("");
  const [hotelReg, setHotelReg] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [managerConfirm, setManagerConfirm] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let res;
      if (role === "tourist") {
        res = await signupTourist({ user_id: userId, user_name: userName, user_email: userEmail, user_phone: userPhone, password, confirm_password: confirmPassword });
        localStorage.setItem("token", res.access_token);
        localStorage.setItem("role", "tourist");
        localStorage.setItem("user_id", res.user_id);
        localStorage.setItem("user_name", res.user_name);
        router.push("/tourist");
      } else if (role === "guide") {
        res = await signupGuide({ guide_nid: guideNid, guide_name: guideName, guide_email: guideEmail, guide_mobile: guideMobile, guide_division: guideDivision, guide_district: guideDistrict, password: guidePassword, confirm_password: guideConfirm });
        localStorage.setItem("token", res.access_token);
        localStorage.setItem("role", "guide");
        localStorage.setItem("user_id", res.user_id);
        localStorage.setItem("user_name", res.user_name);
        router.push("/guide");
      } else if (role === "manager") {
        res = await signupManager({ manager_id: managerId, manager_name: managerName, manager_email: managerEmail, manager_mobile: managerMobile, hotel_registration_number: hotelReg, password: managerPassword, confirm_password: managerConfirm });
        localStorage.setItem("token", res.access_token);
        localStorage.setItem("role", "manager");
        localStorage.setItem("user_id", res.user_id);
        localStorage.setItem("user_name", res.user_name);
        router.push("/manager");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(10,77,66,0.3); }
          50% { box-shadow: 0 0 20px 4px rgba(10,77,66,0.15); }
        }

        .signup-split { display: flex; min-height: 100vh; }
        .signup-left {
          width: 50%; position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: flex-end; padding: 48px;
          animation: fadeSlideRight 0.8s ease-out;
        }
        .signup-left-bg {
          position: absolute; inset: 0;
          background-image: url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80');
          background-size: cover; background-position: center;
          transition: transform 8s ease;
        }
        .signup-left:hover .signup-left-bg { transform: scale(1.05); }
        .signup-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(10,77,66,0.15) 0%, rgba(10,77,66,0.6) 50%, rgba(10,77,66,0.75) 100%);
        }
        .signup-left-content { position: relative; z-index: 2; color: #fff; }
        .signup-left-brand {
          font-family: var(--font-heading); font-size: 2rem; font-weight: 700;
          color: #fff; margin-bottom: 48px;
          animation: fadeSlideUp 0.6s ease-out 0.2s both;
        }
        .signup-left-brand span { color: var(--accent); }
        .signup-left h1 {
          font-family: var(--font-heading); font-size: clamp(2.2rem, 4vw, 3rem);
          font-weight: 700; color: #fff; line-height: 1.1; margin-bottom: 18px;
          animation: fadeSlideUp 0.6s ease-out 0.3s both;
        }
        .signup-left p {
          font-family: var(--font-body); font-size: 1.1rem;
          color: rgba(255,255,255,0.85); line-height: 1.8; max-width: 440px;
          animation: fadeSlideUp 0.6s ease-out 0.4s both;
        }


        .signup-right {
          width: 50%; display: flex; align-items: center; justify-content: center;
          padding: 40px 60px; background: var(--bg); overflow-y: auto;
          animation: fadeSlideLeft 0.8s ease-out;
        }
        .signup-form-wrap {
          width: 100%; max-width: 500px;
          animation: scaleIn 0.6s ease-out 0.3s both;
        }
        .signup-form-header { margin-bottom: 28px; }
        .signup-form-header h2 {
          font-family: var(--font-heading); font-size: 2.2rem; font-weight: 700;
          color: var(--text); margin-bottom: 8px;
        }
        .signup-form-header p { font-family: var(--font-body); font-size: 1rem; color: var(--text-muted); }

        .role-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
        .role-option {
          padding: 18px 12px; background: var(--surface); border: 2px solid var(--line);
          border-radius: var(--radius-sm); text-align: center; cursor: pointer;
          transition: all 0.3s ease; animation: fadeSlideUp 0.5s ease-out both;
        }
        .role-option:nth-child(1) { animation-delay: 0.35s; }
        .role-option:nth-child(2) { animation-delay: 0.4s; }
        .role-option:nth-child(3) { animation-delay: 0.45s; }
        .role-option:hover {
          border-color: var(--primary); background: rgba(10,77,66,0.03);
          transform: translateY(-3px); box-shadow: 0 6px 20px rgba(10,77,66,0.1);
        }
        .role-option.active {
          border-color: var(--primary); background: rgba(10,77,66,0.06);
          box-shadow: 0 0 0 4px rgba(10,77,66,0.1);
        }
        .role-option input { display: none; }
        .role-option-title {
          font-size: 0.95rem; font-weight: 700; color: var(--text); display: block;
          margin-bottom: 2px;
        }
        .role-option-desc { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }

        .reg-field {
          margin-bottom: 18px;
          animation: fadeSlideUp 0.5s ease-out both;
        }
        .reg-field label {
          display: block; font-size: 0.82rem; font-weight: 700; color: var(--text);
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;
        }
        .reg-field input {
          width: 100%; padding: 13px 16px; border: 2px solid var(--line);
          border-radius: var(--radius-sm); font-family: var(--font-body);
          font-size: 0.95rem; font-weight: 500; color: var(--text);
          background: var(--surface); outline: none; transition: all 0.3s ease;
        }
        .reg-field input::placeholder { color: var(--text-light); font-weight: 400; }
        .reg-field input:focus {
          border-color: var(--primary); box-shadow: 0 0 0 4px rgba(10,77,66,0.1);
          background: #fff;
        }
        .reg-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .signup-submit {
          width: 100%; padding: 16px; margin-top: 8px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: #fff; border: none; border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 1rem; font-weight: 700;
          cursor: pointer; transition: all 0.35s ease;
          box-shadow: 0 6px 24px rgba(10,77,66,0.3); letter-spacing: 0.02em;
          animation: fadeSlideUp 0.5s ease-out 0.6s both;
        }
        .signup-submit:hover {
          transform: translateY(-3px); box-shadow: 0 10px 36px rgba(10,77,66,0.4);
          animation: pulseGlow 2s infinite;
        }
        .signup-submit:active { transform: translateY(0); }
        .signup-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .signup-signin-link {
          text-align: center; margin-top: 24px; font-size: 0.92rem;
          color: var(--text-secondary); font-weight: 500;
          animation: fadeSlideUp 0.5s ease-out 0.7s both;
        }
        .signup-signin-link a { color: var(--primary); font-weight: 700; text-decoration: none; }
        .signup-signin-link a:hover { color: var(--accent); text-decoration: underline; }
        .signup-back {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 16px;
          font-size: 0.9rem; color: var(--text-muted); text-decoration: none;
          font-weight: 500; transition: all 0.25s;
          animation: fadeSlideUp 0.5s ease-out 0.8s both;
        }
        .signup-back:hover { color: var(--primary); transform: translateX(-4px); }
        .signup-error {
          padding: 16px 20px; background: var(--danger-bg); border: 1.5px solid #FECACA;
          color: var(--danger); border-radius: var(--radius-sm); font-size: 0.92rem;
          font-weight: 600; margin-bottom: 20px; display: flex; align-items: center;
          gap: 10px; animation: scaleIn 0.3s ease-out;
        }
        .signup-error i { font-size: 1.1rem; }
        @media (max-width: 800px) {
          .signup-split { flex-direction: column; }
          .signup-left { display: none; }
          .signup-right { width: 100%; padding: 100px 24px 60px; }
          .role-selector { grid-template-columns: 1fr; }
          .reg-field-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="signup-split">
        <div className="signup-left">
          <div className="signup-left-bg"></div>
          <div className="signup-left-overlay"></div>
          <div className="signup-left-content">
            <div className="signup-left-brand">Comfy<span>Go</span></div>
            <h1>Join ComfyGo</h1>
            <p>Create your account and start discovering beautiful stays, expert local guides, and curated travel experiences.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 28 }}>
              {[
                { img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80", label: "Heritage Hotels" },
                { img: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&q=80", label: "Tea Gardens" },
                { img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80", label: "Beach Resorts" },
              ].map((item, i) => (
                <div key={i} style={{ borderRadius: 10, overflow: "hidden", position: "relative", height: 100, border: "2px solid rgba(255,255,255,0.25)" }}>
                  <img src={item.img} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 10px", background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", color: "#fff", fontSize: "0.72rem", fontWeight: 600 }}>{item.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        <div className="signup-right">
          <div className="signup-form-wrap">
            <div className="signup-form-header">
              <h2>Create account</h2>
              <p>Tell us who you are to get started</p>
            </div>

            <div className="role-selector">
              {[
                { value: "tourist", title: "Customer", desc: "I want to explore" },
                { value: "guide", title: "Guide", desc: "I lead tours" },
                { value: "manager", title: "Hotel Manager", desc: "I manage a hotel" },
              ].map((r) => (
                <label key={r.value} className={`role-option ${role === r.value ? "active" : ""}`}>
                  <input type="radio" name="role_toggle" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} />
                  <span className="role-option-title">{r.title}</span>
                  <span className="role-option-desc">{r.desc}</span>
                </label>
              ))}
            </div>

            {error && (
              <div className="signup-error">
                <i className="bi bi-exclamation-circle-fill"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input type="hidden" name="role" value={role} />

              {role === "tourist" && (
                <>
                  <div className="reg-field" style={{ animationDelay: "0.4s" }}><label>User ID</label><input type="text" placeholder="Choose a unique user ID" value={userId} onChange={(e) => setUserId(e.target.value)} required /></div>
                  <div className="reg-field" style={{ animationDelay: "0.45s" }}><label>Full Name</label><input type="text" placeholder="Your full name" value={userName} onChange={(e) => setUserName(e.target.value)} required /></div>
                  <div className="reg-field-row">
                    <div className="reg-field" style={{ animationDelay: "0.5s" }}><label>Email Address</label><input type="email" placeholder="you@example.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required /></div>
                    <div className="reg-field" style={{ animationDelay: "0.55s" }}><label>Phone Number</label><input type="tel" placeholder="+880 1XXX XXXXXX" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} /></div>
                  </div>
                  <div className="reg-field-row">
                    <div className="reg-field" style={{ animationDelay: "0.6s" }}><label>Password</label><input type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                    <div className="reg-field" style={{ animationDelay: "0.65s" }}><label>Confirm Password</label><input type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
                  </div>
                </>
              )}

              {role === "guide" && (
                <>
                  <div className="reg-field" style={{ animationDelay: "0.4s" }}><label>National ID (NID)</label><input type="text" placeholder="Your NID number" value={guideNid} onChange={(e) => setGuideNid(e.target.value)} required /></div>
                  <div className="reg-field" style={{ animationDelay: "0.45s" }}><label>Full Name</label><input type="text" placeholder="Your full name" value={guideName} onChange={(e) => setGuideName(e.target.value)} required /></div>
                  <div className="reg-field-row">
                    <div className="reg-field" style={{ animationDelay: "0.5s" }}><label>Email Address</label><input type="email" placeholder="you@example.com" value={guideEmail} onChange={(e) => setGuideEmail(e.target.value)} required /></div>
                    <div className="reg-field" style={{ animationDelay: "0.55s" }}><label>Mobile Number</label><input type="tel" placeholder="+880 1XXX XXXXXX" value={guideMobile} onChange={(e) => setGuideMobile(e.target.value)} /></div>
                  </div>
                  <div className="reg-field-row">
                    <div className="reg-field" style={{ animationDelay: "0.6s" }}><label>Division</label><input type="text" placeholder="e.g. Sylhet" value={guideDivision} onChange={(e) => setGuideDivision(e.target.value)} /></div>
                    <div className="reg-field" style={{ animationDelay: "0.65s" }}><label>District</label><input type="text" placeholder="e.g. Moulvibazar" value={guideDistrict} onChange={(e) => setGuideDistrict(e.target.value)} /></div>
                  </div>
                  <div className="reg-field-row">
                    <div className="reg-field" style={{ animationDelay: "0.7s" }}><label>Password</label><input type="password" placeholder="Min. 6 characters" value={guidePassword} onChange={(e) => setGuidePassword(e.target.value)} required /></div>
                    <div className="reg-field" style={{ animationDelay: "0.75s" }}><label>Confirm Password</label><input type="password" placeholder="Repeat password" value={guideConfirm} onChange={(e) => setGuideConfirm(e.target.value)} required /></div>
                  </div>
                </>
              )}

              {role === "manager" && (
                <>
                  <div className="reg-field" style={{ animationDelay: "0.4s" }}><label>Manager ID</label><input type="text" placeholder="Choose a unique manager ID" value={managerId} onChange={(e) => setManagerId(e.target.value)} required /></div>
                  <div className="reg-field" style={{ animationDelay: "0.45s" }}><label>Full Name</label><input type="text" placeholder="Your full name" value={managerName} onChange={(e) => setManagerName(e.target.value)} required /></div>
                  <div className="reg-field-row">
                    <div className="reg-field" style={{ animationDelay: "0.5s" }}><label>Email Address</label><input type="email" placeholder="you@example.com" value={managerEmail} onChange={(e) => setManagerEmail(e.target.value)} required /></div>
                    <div className="reg-field" style={{ animationDelay: "0.55s" }}><label>Mobile Number</label><input type="tel" placeholder="+880 1XXX XXXXXX" value={managerMobile} onChange={(e) => setManagerMobile(e.target.value)} /></div>
                  </div>
                  <div className="reg-field" style={{ animationDelay: "0.6s" }}><label>Hotel Registration Number</label><input type="text" placeholder="Official hotel reg. number" value={hotelReg} onChange={(e) => setHotelReg(e.target.value)} required /></div>
                  <div className="reg-field-row">
                    <div className="reg-field" style={{ animationDelay: "0.65s" }}><label>Password</label><input type="password" placeholder="Min. 6 characters" value={managerPassword} onChange={(e) => setManagerPassword(e.target.value)} required /></div>
                    <div className="reg-field" style={{ animationDelay: "0.7s" }}><label>Confirm Password</label><input type="password" placeholder="Repeat password" value={managerConfirm} onChange={(e) => setManagerConfirm(e.target.value)} required /></div>
                  </div>
                </>
              )}

              <button type="submit" className="signup-submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="signup-signin-link">
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
            <Link href="/" className="signup-back">
              <i className="bi bi-arrow-left"></i> Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
