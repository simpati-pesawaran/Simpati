"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PendingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
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
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fadeIn">
          {/* Status Icon */}
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Terima Kasih! 🙏
          </h2>

          <p className="text-gray-500 text-center mb-6 leading-relaxed">
            Permintaan akses Anda sedang<br />
            <span className="font-semibold text-amber-600">menunggu persetujuan</span><br />
            dari Superadmin.
          </p>

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

          {/* Info */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Yang perlu Anda tahu:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Superadmin akan meninjau permintaan Anda</li>
                  <li>• Anda akan mendapat notifikasi setelah disetujui</li>
                  <li>• Proses biasanya memakan waktu 1x24 jam</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full h-12 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Batal dan Masuk dengan Akun Lain
          </button>
        </div>

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
