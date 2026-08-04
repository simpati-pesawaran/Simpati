"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Background Gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-navy-800 to-white pointer-events-none"
        style={{ paddingTop: "var(--safe-area-top)" }}
      />

      {/* Content */}
      <div className="relative w-full max-w-sm animate-fadeIn">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-navy-800 to-navy-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SIMPATI</h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Sistem Informasi Manajemen Protokol &<br />Agenda Terintegrasi
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Masuk dengan Google
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Gunakan akun Google Anda untuk mengakses aplikasi
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-error">
                {error === "AccessDenied"
                  ? "Akun Anda belum disetujui. Hubungi superadmin."
                  : "Terjadi kesalahan. Silakan coba lagi."}
              </p>
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-[0.98]"
          >
            {/* Google Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-gray-700">Masuk dengan Google</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Dengan masuk, Anda menyetujui Syarat & Ketentuan
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
