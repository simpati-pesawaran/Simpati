"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AkunPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const profile = (session?.user as any)?.profile;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    division: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        division: profile.division || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          division: formData.division,
        }),
      });

      if (res.ok) {
        // Update session to reflect changes
        await update();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (status === "loading") {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-[3px] border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Header */}
      <div
        className="bg-gradient-to-br from-[#1e3a5f] via-[#2563eb] to-[#7c3aed] px-4 pb-6 relative overflow-hidden"
        style={{ paddingTop: `calc(0.75rem + env(safe-area-inset-top))` }}
      >
        {/* Floating Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="relative z-10">
          {/* Logo Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-white/80 text-xs font-medium">Akun</span>
            </div>
          </div>

          {/* Profile Header */}
          <div className="flex items-center gap-4">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || ""}
                className="w-14 h-14 rounded-full border-2 border-white/30"
              />
            ) : (
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {session.user?.name?.[0] || "U"}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-white text-lg font-bold">{profile?.name || session.user?.name}</h2>
              <p className="text-white/60 text-xs">{session.user?.email}</p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                  profile?.role === "superadmin"
                    ? "bg-yellow-400/20 text-yellow-200"
                    : "bg-white/20 text-white"
                }`}
              >
                {profile?.role === "superadmin" ? "Superadmin" : "Admin"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 -mt-3">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          {/* Edit Form */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold text-sm">Informasi Profil</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: profile?.name || "", division: profile?.division || "" });
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Nama Lengkap</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Masukkan nama lengkap"
                />
              ) : (
                <p className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">
                  {profile?.name || "-"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Divisi / Jabatan</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Contoh: Sekretariat Daerah"
                />
              ) : (
                <p className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">
                  {profile?.division || "-"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mt-3">
          <h3 className="text-gray-900 font-semibold text-sm mb-3">Status Akun</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500">Status</span>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                profile?.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : profile?.status === "pending"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {profile?.status === "approved"
                  ? "Aktif"
                  : profile?.status === "pending"
                  ? "Menunggu"
                  : "Ditolak"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-500">Login</span>
              <span className="text-xs text-gray-700">{session.user?.email}</span>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mt-3">
          <h3 className="text-gray-900 font-semibold text-sm mb-3">Info Aplikasi</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500">Versi</span>
              <span className="text-xs text-gray-700">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-500">Database</span>
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Terhubung
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 h-12 bg-red-50 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Keluar
        </button>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 mt-6 mb-4">
          SIMPATI v1.0.0<br />
          Sistem Informasi Manajemen Protokol & Agenda Terintegrasi
        </p>
      </div>
    </div>
  );
}