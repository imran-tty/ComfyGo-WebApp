"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { forgotPassword, resetPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/styles/login.css";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setResetToken(res.token);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "No account found with this email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await resetPassword(resetToken, newPassword, confirmPassword);
      setSuccess(res.message);
      setStep(1);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div id="login_page_bg">
        <div id="login_wrapper">
          <div id="login_card">
            {success ? (
              <>
                <div
                  style={{
                    background: "#d4edda",
                    color: "#155724",
                    padding: 15,
                    borderRadius: 4,
                    marginBottom: 20,
                    borderLeft: "4px solid #28a745",
                  }}
                >
                  {success}
                </div>
                <p style={{ textAlign: "center", margin: "20px 0" }}>
                  <Link
                    href="/login"
                    style={{ color: "#3a7d44", fontWeight: 500 }}
                  >
                    Go to Login
                  </Link>
                </p>
              </>
            ) : (
              <>
                <h1 id="login_title">
                  {step === 1 ? "Reset Your Password" : "Set New Password"}
                </h1>
                <p id="login_sub">
                  {step === 1
                    ? "Enter your email address and we'll verify it exists."
                    : "Enter a new password for your account."}
                </p>

                {error && <div id="login_error">{error}</div>}

                {step === 1 ? (
                  <form onSubmit={handleVerifyEmail} id="login_form">
                    <div id="field_email" className="login_field">
                      <label htmlFor="email">Email Address</label>
                      <div className="field_wrap">
                        <i className="fa-regular fa-envelope field_icon"></i>
                        <input
                          type="email"
                          id="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoFocus
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <button type="submit" id="login_submit" disabled={loading}>
                      {loading ? "Verifying..." : "Verify Email"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} id="login_form">
                    <div id="field_password" className="login_field">
                      <label htmlFor="new_password">New Password</label>
                      <div className="field_wrap">
                        <i className="fa-solid fa-lock field_icon"></i>
                        <input
                          type="password"
                          id="new_password"
                          placeholder="Enter new password (min. 6 chars)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                    <div id="field_password" className="login_field">
                      <label htmlFor="confirm_password">
                        Confirm New Password
                      </label>
                      <div className="field_wrap">
                        <i className="fa-solid fa-lock field_icon"></i>
                        <input
                          type="password"
                          id="confirm_password"
                          placeholder="Repeat new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                    <button type="submit" id="login_submit" disabled={loading}>
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}

                <p style={{ textAlign: "center", marginTop: 15 }}>
                  <Link
                    href="/login"
                    style={{ color: "#6c757d", fontSize: "0.9rem" }}
                  >
                    Cancel
                  </Link>
                </p>
              </>
            )}

            <p id="signup_text">
              Remember your password?{" "}
              <Link href="/login" id="signup_link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
