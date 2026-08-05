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
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #071E3D 0%, #123C69 50%, #2563EB 100%)" }}>
      {/* Header Area */}
      <div className="px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-24 flex flex-col items-center">
        {/* Logo */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl">
          <svg width="48" height="48" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        <h1 className="mt-4 text-white text-2xl font-bold tracking-tight">SIMPATI</h1>
        <p className="mt-2 text-white/70 text-xs text-center max-w-[260px]">
          Sistem Informasi Manajemen Protokol & Agenda Terintegrasi
        </p>
      </div>

      {/* White Card Container */}
      <div className="mx-4 bg-white rounded-t-[28px] rounded-b-3xl shadow-2xl overflow-hidden" style={{ marginTop: "-60px" }}>
        {/* Card Content */}
        <div className="p-6">
          {showReapply ? (
            <div>
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <ArrowPathIcon className="w-7 h-7 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Ajukan Ulang</h2>
              <p className="text-gray-500 text-sm text-center mb-5">Perbarui informasi Anda dan ajukan lagi</p>

              <form onSubmit={handleReapply}>
                <div className="mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <UserCircleIcon className="w-4 h-4 text-indigo-500" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama lengkap"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <BuildingOfficeIcon className="w-4 h-4 text-indigo-500" />
                    Divisi / Unit Kerja
                  </label>
                  <input
                    type="text"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    placeholder="Contoh: Sekretariat Daerah"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-3 p-3 bg-red-50 rounded-xl flex items-start gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => setShowReapply(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Kirim
                        <CheckCircleIcon className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {/* Status Icon */}
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse opacity-30" />
                <XCircleIcon className="w-8 h-8 text-red-500" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Permintaan Ditolak ❌</h2>

              <p className="text-gray-500 text-center text-sm leading-relaxed mb-4">
                Maaf, permintaan akses Anda<br />
                <span className="font-semibold text-red-600">telah ditolak</span><br />
                oleh Superadmin.
              </p>

              {/* Rejection Reason */}
              {profile?.rejection_reason && (
                <div className="bg-red-50 rounded-2xl p-4 mb-5">
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

              {/* User Info */}
              {session?.user && (
                <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl p-4 mb-5">
                  <div className="flex items-center gap-3">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name || ""} className="w-12 h-12 rounded-full border-2 border-white shadow" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{session.user.name}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <button
                onClick={() => setShowReapply(true)}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-3 active:scale-[0.98] transition-transform shadow-lg"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Ajukan Ulang
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform hover:bg-gray-50"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Masuk dengan Akun Lain
              </button>
            </div>
          )}
        </div>

        {/* Footer inside card */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Butuh bantuan? <a href="mailto:siagapesarawan@gmail.com" className="text-indigo-600 font-medium">siagapesarawan@gmail.com</a>
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
