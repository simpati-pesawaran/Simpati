"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #071E3D 0%, #123C69 50%, #2563EB 100%)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-white/30 border-t-blue-400 rounded-full animate-spin" />
        <p className="text-white/70 text-sm">Memuat...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #071E3D 0%, #123C69 50%, #2563EB 100%)" }}>
      {/* Header Area */}
      <div className="px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-24 flex flex-col items-center">
        {/* Logo */}
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
          <Image src="/logo/logo.svg" alt="SIMPATI" width={40} height={40} />
        </div>

        {/* Brand */}
        <h1 className="mt-3 text-white text-xl font-bold tracking-wider">SIMPATI</h1>
        <p className="mt-1 text-white/60 text-xs text-center max-w-[260px]">
          Sistem Informasi Manajemen Protokol & Agenda Terintegrasi
        </p>
      </div>

      {/* White Card Container */}
      <div className="mx-4 bg-white rounded-t-[28px] rounded-b-3xl shadow-2xl overflow-hidden" style={{ marginTop: "-60px" }}>
        {/* Card Content */}
        <div className="p-6">
          {showSetup && setupStep === "name" && (
            <div>
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <SparklesIcon className="w-7 h-7 text-indigo-500" />
                </div>
              </div>

              <h2 className="text-center text-lg font-bold text-gray-900 mb-1">Selamat Datang! 👋</h2>
              <p className="text-center text-sm text-gray-500 mb-5">Lengkapi profil Anda</p>

              <form onSubmit={handleNameSubmit}>
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                {error && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mb-3">
                    <InformationCircleIcon className="w-4 h-4" />
                    {error}
                  </p>
                )}
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                  Lanjut
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {showSetup && setupStep === "division" && (
            <div>
              {/* User Avatar */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold mb-2">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-gray-900">{formData.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>

              <form onSubmit={handleDivisionSubmit}>
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                {error && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mb-3">
                    <InformationCircleIcon className="w-4 h-4" />
                    {error}
                  </p>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setSetupStep("name")} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Kembali
                  </button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50">
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
            <div>
              <h2 className="text-center text-lg font-bold text-gray-900 mb-1">Selamat Datang! 👋</h2>
              <p className="text-center text-sm text-gray-500 mb-5">Masuk dengan akun Google Anda</p>

              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 bg-white border border-gray-200 rounded-xl font-medium text-sm flex items-center justify-center gap-3 text-gray-800 active:scale-[0.98] transition-transform shadow-sm"
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

              {/* Info Box */}
              <div className="mt-4 p-3 bg-blue-50 rounded-xl flex gap-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Akses Terbatas</p>
                  <p className="text-xs text-blue-600 mt-0.5">Hanya administrator berizin dapat login.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer inside card */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Dengan masuk, Anda menyetujui <span className="text-gray-600 font-medium">Syarat & Ketentuan</span>
          </p>
        </div>
      </div>

      {/* Version Badge */}
      <div className="text-center mt-6 mb-6">
        <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] text-white/50 font-medium">
          v2.0.0
        </span>
      </div>
    </div>
  );
}
