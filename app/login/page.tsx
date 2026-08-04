"use client";

import { signIn } from "next-auth/react";
import { Suspense } from "react";

function LoginContent() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Background Gradient */}
      <div className="bg-gradient-to-br from-navy-800 via-navy-700 to-navy-600 min-h-[55vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">

        {/* Decorative Elements */}
        <div className="absolute top-20 left-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-6 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />

        {/* Logo */}
        <div className="relative z-10 mb-8">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-navy-800 font-bold text-4xl">S</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="relative z-10 text-white text-4xl font-bold tracking-tight mb-3">
          SIMPATI
        </h1>
        <p className="relative z-10 text-white/80 text-center text-sm leading-relaxed max-w-xs">
          Sistem Informasi Manajemen<br />
          Protokol & Agenda Terintegrasi
        </p>

        {/* Badge */}
        <div className="relative z-10 mt-8">
          <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/60 text-xs">
            Demo Mode
          </span>
        </div>
      </div>

      {/* White Content Area */}
      <div className="flex-1 bg-white px-6 py-10 -mt-8 rounded-t-[2rem] shadow-2xl relative z-20">

        {/* Welcome Text */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat Datang
          </h2>
          <p className="text-gray-500 text-sm">
            Masuk dengan akun Google untuk mengakses aplikasi
          </p>
        </div>

        {/* Login Card */}
        <div className="space-y-4">
          {/* Google Button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full h-14 flex items-center justify-center gap-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
          >
            {/* Google Logo */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div className="text-left">
              <span className="font-semibold text-gray-700">Masuk dengan Google</span>
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Info Card */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 mb-1">Mode Testing</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  Hanya email yang terdaftar sebagai test user yang dapat login. Hubungi superadmin untuk akses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-400">
            Dengan masuk, Anda menyetujui<br />
            <span className="text-gray-500">Syarat & Ketentuan</span> dan <span className="text-gray-500">Kebijakan Privasi</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-3 border-navy-800 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
