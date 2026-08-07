"use client";

import AppHeader from "@/components/AppHeader";

export default function AudensiPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      <AppHeader
        variant="default"
        title="Audiensi"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        notificationCount={0}
      />

      {/* Content */}
      <div className="p-5">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👥</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Halaman Audiensi</h3>
          <p className="text-gray-500 text-sm">Fitur dalam pengembangan</p>
        </div>
      </div>
    </div>
  );
}
