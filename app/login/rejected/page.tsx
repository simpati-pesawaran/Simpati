"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProfileData {
  name: string;
  division: string;
  rejection_reason: string | null;
}

export default function RejectedPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showReapply, setShowReapply] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", division: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/profile");
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || "",
          division: data.profile.division || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleReapply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name.trim().length < 2 || formData.division.trim().length < 2) {
      setError("Nama dan Divisi minimal 2 karakter");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim ulang");
      }

      router.push("/login/pending");
    } catch (err: any) {
      console.error("Error re-applying:", err);
      setError(err.message || "Terjadi kesalahan");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#2d5a8a] px-6 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-28 h-28 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-8">
            <span className="text-[#1e3a5f] font-black text-5xl tracking-tight">S</span>
          </div>

          <h1 className="text-white text-4xl font-bold tracking-tight mb-3">
            SIMPATI
          </h1>

          <p className="text-white/70 text-sm text-center leading-relaxed max-w-[280px]">
            Sistem Informasi Manajemen<br />
            Protokol & Agenda Terintegrasi
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 375 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50C96.667 50 96.667 20 193.333 20C290 20 290 50 387.667 50V100H0V50Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 -mt-12 relative z-10">
        {/* Re-apply Form */}
        {showReapply ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fadeIn">
            <div className="mb-6">
              <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🔄</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Ajukan Ulang
              </h2>
              <p className="text-gray-500 text-sm text-center">
                Perbarui informasi Anda dan ajukan lagi
              </p>
            </div>

            <form onSubmit={handleReapply}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-all min-h-[48px]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Divisi
                </label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-all min-h-[48px]"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReapply(false)}
                  className="flex-1 h-12 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-[#1e3a5f] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    "Kirim Ulang"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fadeIn">
            {/* Status Icon */}
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Permintaan Ditolak ❌
            </h2>

            <p className="text-gray-500 text-center mb-6 leading-relaxed">
              Maaf, permintaan akses Anda<br />
              <span className="font-semibold text-red-600">telah ditolak</span><br />
              oleh Superadmin.
            </p>

            {/* Rejection Reason */}
            {profile?.rejection_reason && (
              <div className="bg-red-50 rounded-2xl p-4 mb-6">
                <p className="text-sm font-medium text-red-900 mb-1">Alasan penolakan:</p>
                <p className="text-sm text-red-700">{profile.rejection_reason}</p>
              </div>
            )}

            {/* User Info */}
            {session?.user && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-4">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ""}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{session.user.name}</p>
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowReapply(true)}
              className="w-full h-12 bg-[#1e3a5f] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all mb-3"
            >
              Ajukan Ulang
            </button>

            <button
              onClick={handleLogout}
              className="w-full h-12 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Masuk dengan Akun Lain
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Butuh bantuan? Hubungi Superadmin di<br />
            <span className="text-[#1e3a5f] font-medium">siagapesarawan@gmail.com</span>
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] text-gray-400 font-medium">
            v1.0.0
          </span>
        </div>
      </div>
    </div>
  );
}
