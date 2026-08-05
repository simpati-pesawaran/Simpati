"use client";

import { useSession, signOut } from "next-auth/react";
import {
  ClockIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

export default function PendingPage() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #071E3D 0%, #123C69 40%, #2563EB 100%)" }}>
      {/* Header Section */}
      <div className="px-5 pt-4 pb-6 flex flex-col items-center" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        {/* Logo */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl">
          <svg width="48" height="48" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
            <path d="M256 80 L400 160 L400 280 C400 380 256 440 256 440 C256 440 112 380 112 280 L112 160 Z" fill="url(#logoGrad)"/>
            <circle cx="256" cy="256" r="180" stroke="url(#logoGrad)" strokeWidth="16" strokeDasharray="60 30" fill="none"/>
          </svg>
        </div>

        <h1 className="mt-4 text-white text-2xl font-bold tracking-tight">SIMPATI</h1>
        <p className="mt-2 text-white/70 text-xs text-center max-w-[260px] leading-relaxed">
          Sistem Informasi Manajemen Protokol & Agenda Terintegrasi
        </p>
      </div>

      {/* Content Card */}
      <div className="flex-1 px-5 -mt-3">
        <div className="bg-white rounded-t-3xl rounded-b-2xl p-6 shadow-xl">
          {/* Status Icon */}
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-20" />
            <ClockIcon className="w-8 h-8 text-amber-500" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Terima Kasih! 🙏</h2>

          <p className="text-gray-500 text-center text-sm leading-relaxed mb-5">
            Permintaan akses Anda sedang<br />
            <span className="font-semibold text-amber-600">menunggu persetujuan</span><br />
            dari Superadmin.
          </p>

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
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{session.user.name}</p>
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                </div>
                <CheckBadgeIcon className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <InformationCircleIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-2">Yang perlu Anda tahu:</p>
                <ul className="text-xs text-blue-700 space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Superadmin akan meninjau permintaan Anda
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Anda akan mendapat notifikasi setelah disetujui
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Proses biasanya memakan waktu 1x24 jam
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform hover:bg-gray-50"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Batal dan Masuk dengan Akun Lain
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-6 text-center">
        <p className="text-xs text-white/60 mb-1">Butuh bantuan?</p>
        <a href="mailto:siagapesarawan@gmail.com" className="text-xs text-white/80 hover:text-white">
          siagapesarawan@gmail.com
        </a>
        <div className="mt-4">
          <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] text-white/50 font-medium">
            v2.0.0
          </span>
        </div>
      </div>
    </div>
  );
}
