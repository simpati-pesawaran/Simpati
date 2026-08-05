"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  XCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

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
      {/* Header - Ocean Depth Gradient */}
      <div className="bg-gradient-to-br from-[#071E3D] via-[#123C69] to-[#2563EB] px-6 pt-12 pb-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo */}
          <div className="w-28 h-28 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-6">
            <svg width="64" height="64" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333ea"/>
                  <stop offset="100%" stopColor="#3b82f6"/>
                </linearGradient>
              </defs>
              <path d="M256 80 L400 160 L400 280 C400 380 256 440 256 440 C256 440 112 380 112 280 L112 160 Z" fill="url(#logoGrad2)"/>
              <circle cx="256" cy="256" r="180" stroke="url(#logoGrad2)" strokeWidth="16" strokeDasharray="60 30" fill="none"/>
            </svg>
          </div>

          <h1 className="text-white text-4xl font-bold tracking-tight mb-3">
            SIMPATI
          </h1>

          <p className="text-white/70 text-sm text-center leading-relaxed max-w-[280px]">
            Sistem Informasi Manajemen<br />
            Protokol & Agenda Terintegrasi
          </p>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 375 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50C96.667 50 96.667 20 193.333 20C290 20 290 50 387.667 50V100H0V50Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 px-6 py-8 -mt-16 relative z-10">
        {/* Re-apply Form */}
        {showReapply ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fadeIn">
            <div className="mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <ArrowPathIcon className="w-8 h-8 text-indigo-600" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <UserCircleIcon className="w-4 h-4 text-indigo-500" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[48px]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <BuildingOfficeIcon className="w-4 h-4 text-indigo-500" />
                  Divisi / Unit Kerja
                </label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  placeholder="Contoh: Sekretariat Daerah"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[48px]"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 rounded-xl flex items-start gap-2">
                  <InformationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReapply(false)}
                  className="flex-1 h-12 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Kirim Ulang
                      <CheckCircleIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fadeIn">
            {/* Status Icon */}
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse opacity-30" />
              <XCircleIcon className="w-12 h-12 text-red-500" />
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
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <InformationCircleIcon className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-900 mb-1">Alasan penolakan:</p>
                    <p className="text-sm text-red-700">{profile.rejection_reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* User Info Card */}
            {session?.user && (
              <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-4">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ""}
                      className="w-14 h-14 rounded-full border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{session.user.name}</p>
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={() => setShowReapply(true)}
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all mb-3 flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Ajukan Ulang
            </button>

            <button
              onClick={handleLogout}
              className="w-full h-12 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Masuk dengan Akun Lain
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Butuh bantuan?</p>
          <p className="text-xs text-gray-400">
            Hubungi Superadmin di<br />
            <a href="mailto:siagapesarawan@gmail.com" className="text-indigo-600 font-medium hover:text-indigo-700">
              siagapesarawan@gmail.com
            </a>
          </p>
        </div>

        {/* Version Badge */}
        <div className="mt-6 flex justify-center">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] text-gray-500 font-medium">
            v2.0.0
          </span>
        </div>
      </div>
    </div>
  );
}
