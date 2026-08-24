"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      localStorage.removeItem("token");
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("admin_token", res.access_token);
      localStorage.setItem("admin_name", (res as any).user_name || (res as any).admin_name || "Admin");
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap");

        :root {
          --forest: #1a3322;
          --canopy: #244a31;
          --moss: #3a6642;
          --fern: #4e8056;
          --sage: #7aaa80;
          --mist: #b8d4bc;
          --dew: #dff0e2;
          --parchment: #f5f0e8;
          --bark: #6b4f3a;
          --earth: #c8b89a;
          --cream: #faf7f2;
          --gold: #b8982a;
          --gold-light: #e6d38a;
          --text-dark: #1a2e1e;
          --text-mid: #3a5a42;
          --text-soft: #6b8b72;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: "Jost", sans-serif;
          background-color: var(--cream);
          color: var(--text-dark);
          min-height: 100vh;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(58,102,66,0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(184,152,42,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(107,79,58,0.06) 0%, transparent 50%),
            linear-gradient(170deg, #f5f0e8 0%, #faf7f2 40%, #f0ede6 100%)
          `,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative leaf pattern - top left */}
        <div
          style={{
            position: "absolute",
            top: -60,
            left: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(78,128,86,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Decorative leaf pattern - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -40,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(184,152,42,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 18,
            padding: "52px 44px",
            width: 440,
            maxWidth: "92%",
            boxShadow:
              "0 20px 60px rgba(26,51,34,0.10), 0 4px 20px rgba(26,51,34,0.06)",
            border: "1px solid rgba(184,212,188,0.35)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Leaf icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--moss) 0%, var(--fern) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 4px 16px rgba(58,102,66,0.25)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22c-4-3-8-7-8-12a8 8 0 0 1 16 0c0 5-4 9-8 12z" />
              <path d="M12 10v6" />
              <path d="M9 13l3-3 3 3" />
            </svg>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: 600,
              color: "var(--forest)",
              marginBottom: 6,
              textAlign: "center",
              letterSpacing: "0.3px",
            }}
          >
            Admin Portal
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-soft)",
              textAlign: "center",
              marginBottom: 32,
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            Authorized personnel only
          </p>

          {error && (
            <div
              style={{
                background: "rgba(239,154,154,0.12)",
                border: "1px solid rgba(239,154,154,0.35)",
                color: "#8b3a3a",
                padding: "12px 16px",
                borderRadius: 10,
                marginBottom: 20,
                fontSize: "0.84rem",
                fontWeight: 400,
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--text-mid)",
                  marginBottom: 7,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@gmail.com"
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  border: "1.5px solid rgba(122,170,128,0.3)",
                  borderRadius: 10,
                  fontSize: "0.92rem",
                  outline: "none",
                  fontFamily: "'Jost', sans-serif",
                  background: "rgba(245,240,232,0.6)",
                  color: "var(--text-dark)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--moss)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(58,102,66,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(122,170,128,0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--text-mid)",
                  marginBottom: 7,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••"
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  border: "1.5px solid rgba(122,170,128,0.3)",
                  borderRadius: 10,
                  fontSize: "0.92rem",
                  outline: "none",
                  fontFamily: "'Jost', sans-serif",
                  background: "rgba(245,240,232,0.6)",
                  color: "var(--text-dark)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--moss)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(58,102,66,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(122,170,128,0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 24px",
                background: loading
                  ? "var(--sage)"
                  : "linear-gradient(135deg, var(--moss) 0%, var(--canopy) 100%)",
                color: "var(--dew)",
                border: "none",
                borderRadius: 10,
                fontSize: "0.92rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Jost', sans-serif",
                marginTop: 6,
                boxShadow: loading
                  ? "none"
                  : "0 4px 16px rgba(36,74,49,0.25)",
                transition: "all 0.2s",
                textTransform: "uppercase",
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: "0.76rem",
              color: "var(--text-soft)",
              fontWeight: 300,
            }}
          >
            ComfyGo Travel & Tourism
          </p>
        </div>
      </div>
    </>
  );
}
