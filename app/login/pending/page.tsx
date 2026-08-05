"use client";

import { useSession, signOut } from "next-auth/react";
import {
  ClockIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

export default function PendingPage() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
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
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333ea"/>
                  <stop offset="100%" stopColor="#3b82f6"/>
                </linearGradient>
              </defs>
              <path d="M256 80 L400 160 L400 280 C400 380 256 440 256 440 C256 440 112 380 112 280 L112 160 Z" fill="url(#logoGrad)"/>
              <circle cx="256" cy="256" r="180" stroke="url(#logoGrad)" strokeWidth="16" strokeDasharray="60 30" fill="none"/>
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
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fadeIn">
          {/* Status Icon - Animated */}
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-20" />
            <ClockIcon className="w-12 h-12 text-amber-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Terima Kasih! 🙏
          </h2>

          <p className="text-gray-500 text-center mb-8 leading-relaxed">
            Permintaan akses Anda sedang<br />
            <span className="font-semibold text-amber-600">menunggu persetujuan</span><br />
            dari Superadmin.
          </p>

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
                <CheckBadgeIcon className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-blue-50 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <InformationCircleIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-2">Yang perlu Anda tahu:</p>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    Superadmin akan meninjau permintaan Anda
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    Anda akan mendapat notifikasi setelah disetujui
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    Proses biasanya memakan waktu 1x24 jam
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full h-12 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Batal dan Masuk dengan Akun Lain
          </button>
        </div>

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
