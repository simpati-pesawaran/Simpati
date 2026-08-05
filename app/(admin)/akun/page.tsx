"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AkunPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const profile = (session?.user as any)?.profile;

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
    <div className="p-4 animate-fadeIn">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8a] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || ""}
              className="w-16 h-16 rounded-full border-2 border-white/30"
            />
          ) : (
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">
                {session.user?.name?.[0] || "U"}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{profile?.name || session.user?.name}</h2>
            <p className="text-white/70 text-sm">{session.user?.email}</p>
            <span
              className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${
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

      {/* Profile Details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100 mb-6">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Divisi</span>
          <span className="text-sm font-medium text-gray-900">
            {profile?.division || "-"}
          </span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              profile?.status === "approved"
                ? "bg-green-100 text-green-700"
                : profile?.status === "pending"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {profile?.status === "approved"
              ? "Aktif"
              : profile?.status === "pending"
              ? "Menunggu"
              : "Ditolak"}
          </span>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100 mb-6">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Versi</span>
          <span className="text-sm font-medium text-gray-900">1.0.0</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Database</span>
          <span className="text-sm font-medium text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Terhubung
          </span>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full h-12 bg-red-50 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
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
      <p className="text-center text-xs text-gray-400 mt-8">
        SIMPATI v1.0.0<br />
        Sistem Informasi Manajemen Protokol & Agenda Terintegrasi
      </p>
    </div>
  );
}
