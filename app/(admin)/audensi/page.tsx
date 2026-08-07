"use client";

import Link from "next/link";

export default function AudensiPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header Section - Gradient Theme */}
      <div
        className="px-5 pb-5"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)",
        }}
      >
        {/* Back Button + Title */}
        <div className="flex items-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white text-xl font-bold">Audiensi</h1>
            <p className="text-white/60 text-xs">Kelola audiensi</p>
          </div>
        </div>
      </div>

      {/* Content Section - White Container */}
      <div className="-mt-3 px-4 py-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👥</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Halaman Audiensi</h3>
          <p className="text-gray-500 text-sm">Fitur dalam pengembangan</p>
        </div>
      </div>
    </div>
  );
}
