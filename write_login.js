"use strict";
const fs = require('fs');

const loginPage = `"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState("name");
  const [formData, setFormData] = useState({ name: "", division: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) checkProfileStatus();
  }, [status, session]);

  const checkProfileStatus = async () => {
    try {
      const res = await fetch("/api/auth/profile");
      const data = await res.json();
      if (data.exists) {
        if (data.profile.status === "approved") router.push("/dashboard");
        else if (data.profile.status === "pending") router.push("/login/pending");
        else if (data.profile.status === "rejected") router.push("/login/rejected");
      } else {
        setFormData((prev) => ({ ...prev, name: session?.user?.name || "" }));
        setShowSetup(true);
      }
    } catch { setShowSetup(true); }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/login" });
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim().length < 2) { setError("Nama minimal 2 karakter"); return; }
    setError(""); setSetupStep("division");
  };

  const handleDivisionSubmit = async (e) => {
    e.preventDefault();
    if (formData.division.trim().length < 2) { setError("Divisi minimal 2 karakter"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, division: formData.division }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error();
      router.push(d.needsApproval ? "/login/pending" : "/dashboard");
    } catch { setError("Terjadi kesalahan"); setIsLoading(false); }
  };

  if (status === "loading") return (
    <div className="app-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #071E3D 0%, #123C69 50%, #2563EB 100%)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: "48px", height: "48px", border: "3px solid rgba(255,255,255,0.3)", borderTop: "3px solid #2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>Memuat...</p>
      </div>
    </div>
  );

  return (
    <div className="app-container" style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #071E3D 0%, #123C69 50%, #2563EB 100%)" }}>
      <div className="float-bubble-1" />
      <div className="float-bubble-2" />
      <div className="float-bubble-3" />
      <div className="float-glow" style={{ top: "-80px", left: "-80px" }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", padding: "3rem 1.5rem", paddingTop: "max(3rem, env(safe-area-inset-top)" }}>
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div style={{ width: "72px", height: "72px", background: "white", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <Image src="/logo/ocean-depth.svg" alt="SIMPATI" width={48} height={48} />
          </div>
        </div>

        <h1 style={{ marginTop: "1.5rem", fontSize: "1.25rem", fontWeight: 700, color: "white", letterSpacing: "0.15em" }}>SIMPATI</h1>

        <p style={{ marginTop: "0.5rem", color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textAlign: "center", maxWidth: "280px", lineHeight: 1.5 }}>
          Sistem Informasi Manajemen<br />Protokol & Agenda Terintegrasi
        </p>

        <div style={{ marginTop: "3rem", width: "100%", maxWidth: "320px" }}>
          {showSetup && setupStep === "name" && (
            <div className="card-animate" style={{ background: "white", borderRadius: "1.5rem", padding: "2rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>Waving Hand emoji here</div>
              </div>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#071E3D", marginBottom: "0.5rem" }}>Selamat Datang!</h2>
                <p style={{ fontSize: "0.875rem", color: "#64748B" }}>Lengkapi profil Anda</p>
              </div>
              <form onSubmit={handleNameSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#071E3D", marginBottom: "0.5rem" }}>Nama Lengkap</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nama lengkap" autoFocus required
                    style={{ width: "100%", padding: "0.875rem 1rem", fontSize: "1rem", border: "1.5px solid #E5E7EB", borderRadius: "0.75rem", outline: "none" }}
                    onFocus={(e) => { e.target.style.borderColor = "#2563EB"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }} />
                </div>
                {error && <p style={{ fontSize: "0.8125rem", color: "#EF4444", marginBottom: "1rem" }}>{error}</p>}
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.875rem", fontSize: "1rem" }}>
                  Lanjut
                </button>
              </form>
            </div>
          )}

          {showSetup && setupStep === "division" && (
            <div className="card-animate" style={{ background: "white", borderRadius: "1.5rem", padding: "2rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", marginBottom: "0.75rem" }}>User icon</div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#071E3D" }}>{formData.name}</h2>
              </div>
              <form onSubmit={handleDivisionSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#071E3D", marginBottom: "0.5rem" }}>Divisi</label>
                  <input type="text" value={formData.division} onChange={(e) => setFormData({...formData, division: e.target.value})} placeholder="Contoh: Sekretariat" autoFocus required
                    style={{ width: "100%", padding: "0.875rem 1rem", fontSize: "1rem", border: "1.5px solid #E5E7EB", borderRadius: "0.75rem", outline: "none" }}
                    onFocus={(e) => { e.target.style.borderColor = "#2563EB"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; }} />
                </div>
                {error && <p style={{ fontSize: "0.8125rem", color: "#EF4444", marginBottom: "1rem" }}>{error}</p>}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="button" onClick={() => setSetupStep("name")} className="btn btn-ghost" style={{ flex: 1, padding: "0.875rem" }}>
                    Kembali
                  </button>
                  <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ flex: 1, padding: "0.875rem" }}>
                    {isLoading ? "..." : "Daftar"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {!showSetup && (
            <div className="card-animate" style={{ background: "white", borderRadius: "1.5rem", padding: "2rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#071E3D", marginBottom: "0.5rem" }}>Selamat Datang! Wave emoji</h2>
                <p style={{ fontSize: "0.875rem", color: "#64748B" }}>Masuk dengan akun Google</p>
              </div>
              <button onClick={handleGoogleSignIn} className="btn btn-primary" style={{ width: "100%", padding: "1rem", fontSize: "1rem", gap: "0.75rem" }}>
                Google icon
                <span>Masuk dengan Google</span>
              </button>
              <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#DBEAFE", borderRadius: "0.75rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                Info icon
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#071E3D" }}>Akses Terbatas</p>
                  <p style={{ fontSize: "0.8125rem", color: "#64748B", marginTop: "0.25rem" }}>Hanya administrator berizin dapat login.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: "auto", paddingTop: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
            Dengan masuk, Anda menyetujui<br />
            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Syarat Ketentuan</span>
          </p>
          <span style={{ display: "inline-block", marginTop: "1rem", padding: "0.25rem 0.75rem", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", fontSize: "0.625rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
            v2.0
          </span>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('C:/simpati/app/login/page.tsx', loginPage);
console.log('Login page written');
