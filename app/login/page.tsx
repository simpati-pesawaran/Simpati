"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SUPERADMIN_EMAIL = "siagapesarawan@gmail.com";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", division: "" });
  const [step, setStep] = useState<"welcome" | "name" | "division">("welcome");
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

      // Check if superadmin
      const isSuperadmin = session?.user?.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

      if (data.exists) {
        // Profile exists - check status
        if (data.profile.status === "approved") {
          router.push("/dashboard");
        } else if (data.profile.status === "pending") {
          router.push("/login/pending");
        } else if (data.profile.status === "rejected") {
          router.push("/login/rejected");
        }
      } else if (isSuperadmin) {
        // Superadmin - profile should be auto-created, redirect to dashboard
        router.push("/dashboard");
      } else {
        // New user - show name form
        setFormData((prev) => ({ ...prev, name: session?.user?.name || "" }));
        setStep("name");
      }
    } catch {
      // If API fails, try to proceed
      const isSuperadmin = session?.user?.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
      if (isSuperadmin) {
        router.push("/dashboard");
      } else {
        setStep("name");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/login" });
    } catch (err) {
      console.error("Sign in error:", err);
      setIsLoading(false);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim().length < 2) {
      setError("Nama minimal 2 karakter");
      return;
    }
    setError("");
    setStep("division");
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

  if (status === "loading") {
    return (
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-[#1e3a5f] via-[#2563eb] to-[#7c3aed] overflow-x-hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Loading Spinner */}
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70 text-sm">Memuat...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-[#1e3a5f] via-[#2563eb] to-[#7c3aed] overflow-x-hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Main Content - Centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 shadow-2xl overflow-hidden">
            <Image src="/logo/logo-master.png" alt="SIMPATI" width={80} height={80} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-widest">SIMPATI</h1>
          <p className="text-white/60 text-xs mt-2 max-w-[260px]">
            Sistem Informasi Manajemen Protokol & Agenda Terintegrasi
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[300px] bg-white rounded-2xl p-5 shadow-2xl">
          {/* Step: Welcome */}
          {step === "welcome" && (
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Selamat Datang! 👋</h2>
              <p className="text-sm text-gray-500 mb-4">Masuk dengan akun Google Anda</p>

              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-11 bg-white border border-gray-200 rounded-xl font-medium text-sm flex items-center justify-center gap-3 text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                ) : (
                  <>
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

              <div className="mt-4 p-3 bg-blue-50 rounded-xl text-left">
                <p className="text-xs font-medium text-blue-900">Akses Terbatas</p>
                <p className="text-xs text-blue-600 mt-0.5">Hanya administrator berizin dapat login.</p>
              </div>
            </div>
          )}

          {/* Step: Name */}
          {step === "name" && (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-1">Lengkapi Profil</h2>
              <p className="text-sm text-gray-500 mb-4">Masukkan informasi Anda</p>

              <form onSubmit={handleNameSubmit}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 text-left">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nama lengkap"
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                {error && <p className="text-xs text-red-500 mb-3 text-left">{error}</p>}

                <button type="submit" className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg">
                  Lanjut
                </button>
              </form>
            </div>
          )}

          {/* Step: Division */}
          {step === "division" && (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
                {formData.name.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold text-gray-900">{formData.name}</p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>

              <form onSubmit={handleDivisionSubmit} className="mt-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 text-left">Divisi / Unit Kerja</label>
                  <input
                    type="text"
                    value={formData.division}
                    onChange={(e) => setFormData({...formData, division: e.target.value})}
                    placeholder="Contoh: Sekretariat Daerah"
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                {error && <p className="text-xs text-red-500 mb-3 text-left">{error}</p>}

                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep("name")} className="flex-1 h-11 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm active:scale-[0.98] transition-transform">
                    Kembali
                  </button>
                  <button type="submit" disabled={isLoading} className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50">
                    {isLoading ? "..." : "Daftar"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-6" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
        <p className="text-white/40 text-xs">Dengan masuk, Anda menyetujui</p>
        <p className="text-white/60 text-xs font-medium mt-0.5">Syarat & Ketentuan</p>
        <span className="inline-block mt-3 px-3 py-1 bg-white/10 rounded-full text-[10px] text-white/40 font-medium">
          v2.0.0
        </span>
      </footer>
    </div>
  );
}
