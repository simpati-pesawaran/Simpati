"use client";

import AppHeader from "@/components/AppHeader";

export default function ProfilePage() {
  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      <AppHeader
        variant="default"
        title="Profil"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        showNotification={false}
      />

      {/* Content */}
      <div className="p-5">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👤</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Halaman Profil</h3>
          <p className="text-gray-500 text-sm">Fitur dalam pengembangan</p>
        </div>
      </div>
    </div>
  );
}
