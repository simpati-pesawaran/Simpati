"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState<"name" | "division">("name");
  const [formData, setFormData] = useState({ name: "", division: "" });
  const [error, setError] = useState("");

  // Check profile status after login
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
        if (data.profile.status === "approved") {
          // Approved - go to dashboard
          router.push("/dashboard");
        } else if (data.profile.status === "pending") {
          // Pending - show pending page
          router.push("/login/pending");
        } else if (data.profile.status === "rejected") {
          // Rejected - show rejected page
          router.push("/login/rejected");
        }
      } else {
        // New user - show setup
        setFormData((prev) => ({ ...prev, name: session?.user?.name || "" }));
        setShowSetup(true);
      }
    } catch (err) {
      console.error("Error checking profile:", err);
      setShowSetup(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
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
    setError("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          division: formData.division,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan");
      }

      if (data.needsApproval) {
        router.push("/login/pending");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Error submitting:", err);
      setError(err.message || "Terjadi kesalahan");
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-[3px] border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#71717a]">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header Background - NEW Blue-Purple Gradient */}
      <div className="px-6 pt-12 pb-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2563EB 0%, #123C69 50%, #3B82F6 100%)' }}>
        {/* Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-32 left-6 w-3 h-3 bg-white/30 rounded-full animate-float" />
        <div className="absolute bottom-40 left-12 w-4 h-4 bg-white/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />

        {/* Logo & Branding */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center mb-8 animate-fadeInUp"
            style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <Image src="/logo/ocean-depth.svg" alt="SIMPATI" width={80} height={80} className="w-20 h-20" priority />
          </div>

          <h1 className="text-white text-4xl font-bold tracking-tight mb-3 animate-fadeInUp">
            SIMPATI
          </h1>

          <p className="text-white/80 text-sm text-center leading-relaxed max-w-[280px] animate-fadeInUp">
            Sistem Informasi Manajemen<br />
            Protokol & Agenda Terintegrasi
          </p>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <div className="absolute bottom-0 w-[150%] left-[-25%] h-24 rounded-t-[100%] bg-white" />
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 px-6 -mt-12 relative z-10">
        {/* Setup Modal - Name */}
        {showSetup && setupStep === "name" && (
          <div className="bg-white rounded-[20px] p-8 animate-scaleIn" style={{ boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-[#f3e8ff]">
                👋
              </div>
            </div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-2 text-[#18181b]">
                Selamat Datang!
              </h2>
              <p className="text-sm text-[#71717a]">
                Lengkapi profil Anda untuk melanjutkan
              </p>
            </div>

            <form onSubmit={handleNameSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-[#18181b]">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3.5 rounded-xl text-base bg-white border-[1.5px] border-[#e4e4e7] text-[#18181b] btn-press"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <p className="text-sm mb-4 text-[#ef4444]">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-semibold text-white btn-press flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memuat...
                  </span>
                ) : (
                  "Lanjut"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Setup Modal - Division */}
        {showSetup && setupStep === "division" && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fadeIn">
            <div className="mb-6">
              <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🏢</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                {formData.name} 👤
              </h2>
              <p className="text-gray-500 text-sm text-center">
                Divisi mana Anda?
              </p>
            </div>

            <form onSubmit={handleDivisionSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Divisi
                </label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  placeholder="Contoh: Sekretariat"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-all min-h-[48px]"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSetupStep("name")}
                  className="flex-1 h-12 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-[#1e3a5f] text-white rounded-xl font-semibold text-base shadow-lg shadow-[#1e3a5f]/30 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </span>
                  ) : (
                    "Daftar"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Login Button - Initial State */}
        {!showSetup && (
          <div className="bg-white rounded-[20px] p-8 animate-fadeInUp" style={{ boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)' }}>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2 text-[#18181b]">
                Selamat Datang! 👋
              </h2>
              <p className="text-sm text-[#71717a]">
                Masuk dengan akun Google untuk melanjutkan
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-14 rounded-2xl font-semibold text-white btn-press flex items-center justify-center gap-4"
              style={{
                background: '#18181b',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memuat...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Masuk dengan Google</span>
                </>
              )}
            </button>

            {/* Info Box */}
            <div className="mt-6 rounded-2xl p-4 border" style={{ background: '#faf5ff', borderColor: '#DBEAFE' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#f3e8ff' }}>
                  <svg className="w-4 h-4" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: '#7e22ce' }}>
                    Akses Terbatas
                  </p>
                  <p className="text-xs" style={{ color: '#2563EB' }}>
                    Hanya administrator berizin dapat login.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: '#a1a1aa' }}>
            Dengan masuk, Anda menyetujui<br />
            <span style={{ color: '#71717a', fontWeight: 500 }}>Syarat & Ketentuan</span> serta <span style={{ color: '#71717a', fontWeight: 500 }}>Kebijakan Privasi</span>
          </p>
        </div>

        {/* Version Badge */}
        <div className="mt-6 flex justify-center">
          <span className="px-3 py-1 rounded-full text-[10px] font-medium" style={{ background: '#f4f4f5', color: '#a1a1aa' }}>
            v2.0
          </span>
        </div>
      </div>
    </div>
  );
}
