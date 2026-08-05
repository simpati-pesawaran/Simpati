"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FingerPrint,
  UserCircleIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState("name");
  const [formData, setFormData] = useState({ name: "", division: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      checkProfileStatus();
    }
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
    } catch {
      setShowSetup(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/login" });
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim().length < 2) {
      setError("Nama minimal 2 karakter");
      return;
    }
    setError("");
    setSetupStep("division");
  };

  const handleDivisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.division.trim().length < 2) {
      setError("Divisi minimal 2 karakter");
      return;
    }
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
    } catch {
      setError("Terjadi kesalahan");
      setIsLoading(false);
    }
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
      {/* Floating Bubbles */}
      <div className="float-bubble-1" />
      <div className="float-bubble-2" />
      <div className="float-bubble-3" />
      <div className="float-glow" style={{ top: "-80px", left: "-80px" }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100dvh", padding: "1.5rem 1.5rem 2rem", paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}>
        {/* Logo */}
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div style={{ width: "64px", height: "64px", background: "white", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}>
            <Image src="/logo/logo.svg" alt="SIMPATI" width={40} height={40} />
          </div>
        </div>

        {/* Brand */}
        <h1 style={{ marginTop: "1rem", fontSize: "1.125rem", fontWeight: 700, color: "white", letterSpacing: "0.15em" }}>SIMPATI</h1>

        <p style={{ marginTop: "0.5rem", color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textAlign: "center", maxWidth: "280px", lineHeight: 1.5 }}>
          Sistem Informasi Manajemen<br />Protokol & Agenda Terintegrasi
        </p>

        {/* Main Content Card */}
        <div style={{ marginTop: "2rem", width: "100%", maxWidth: "320px" }}>
          {showSetup && setupStep === "name" && (
            <div className="card-animate" style={{ background: "white", borderRadius: "1.5rem", padding: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              {/* Avatar Icon */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #DBEAFE 0%, #E9D5FF 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SparklesIcon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>

              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#071E3D", marginBottom: "0.25rem" }}>Selamat Datang! 👋</h2>
                <p style={{ fontSize: "0.8125rem", color: "#64748B" }}>Lengkapi profil Anda</p>
              </div>

              <form onSubmit={handleNameSubmit}>
                <div style={{ marginBottom: "0.875rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 500, color: "#071E3D", marginBottom: "0.375rem" }}>
                    <UserCircleIcon className="w-4 h-4 text-indigo-500" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nama lengkap"
                    autoFocus
                    required
                    style={{ width: "100%", padding: "0.75rem 1rem", fontSize: "1rem", border: "1.5px solid #E5E7EB", borderRadius: "0.75rem", outline: "none" }}
                    onFocus={(e) => { e.target.style.borderColor = "#2563EB"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                {error && (
                  <p style={{ fontSize: "0.75rem", color: "#EF4444", marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <InformationCircleIcon className="w-4 h-4" />
                    {error}
                  </p>
                )}
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.75rem", fontSize: "0.9375rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  Lanjut
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {showSetup && setupStep === "division" && (
            <div className="card-animate" style={{ background: "white", borderRadius: "1.5rem", padding: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              {/* User Avatar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
                  <span className="text-white text-xl font-bold">{formData.name.charAt(0).toUpperCase()}</span>
                </div>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#071E3D" }}>{formData.name}</h2>
                <p style={{ fontSize: "0.75rem", color: "#64748B" }}>{session?.user?.email}</p>
              </div>

              <form onSubmit={handleDivisionSubmit}>
                <div style={{ marginBottom: "0.875rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 500, color: "#071E3D", marginBottom: "0.375rem" }}>
                    <BuildingOfficeIcon className="w-4 h-4 text-indigo-500" />
                    Divisi / Unit Kerja
                  </label>
                  <input
                    type="text"
                    value={formData.division}
                    onChange={(e) => setFormData({...formData, division: e.target.value})}
                    placeholder="Contoh: Sekretariat Daerah"
                    autoFocus
                    required
                    style={{ width: "100%", padding: "0.75rem 1rem", fontSize: "1rem", border: "1.5px solid #E5E7EB", borderRadius: "0.75rem", outline: "none" }}
                    onFocus={(e) => { e.target.style.borderColor = "#2563EB"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                {error && (
                  <p style={{ fontSize: "0.75rem", color: "#EF4444", marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <InformationCircleIcon className="w-4 h-4" />
                    {error}
                  </p>
                )}
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button type="button" onClick={() => setSetupStep("name")} className="btn btn-ghost" style={{ flex: 1, padding: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                    <ArrowLeftIcon className="w-4 h-4" />
                    Kembali
                  </button>
                  <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ flex: 1, padding: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Daftar
                        <CheckCircleIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {!showSetup && (
            <div className="card-animate" style={{ background: "white", borderRadius: "1.5rem", padding: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#071E3D", marginBottom: "0.25rem" }}>Selamat Datang! 👋</h2>
                <p style={{ fontSize: "0.8125rem", color: "#64748B" }}>Masuk dengan akun Google Anda</p>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="btn"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  fontSize: "0.9375rem",
                  background: "white",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  color: "#071E3D",
                  fontWeight: 500,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                ) : (
                  <>
                    {/* Google Icon SVG */}
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Masuk dengan Google
                  </>
                )}
              </button>

              {/* Info Box */}
              <div style={{ marginTop: "1.25rem", padding: "0.875rem", background: "#EFF6FF", borderRadius: "0.75rem", display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#1E40AF" }}>Akses Terbatas</p>
                  <p style={{ fontSize: "0.75rem", color: "#3B82F6", marginTop: "0.125rem" }}>Hanya administrator berizin dapat login.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.5)" }}>
            Dengan masuk, Anda menyetujui<br />
            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Syarat & Ketentuan</span>
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
            <span style={{ display: "inline-block", padding: "0.25rem 0.625rem", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", fontSize: "0.625rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              v2.0.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
