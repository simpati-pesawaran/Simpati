export default function ProfilePage() {
  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header - Compact Hero Dashboard Pattern */}
      <div
        className="px-5 py-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)" }}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-white/80 text-xs font-medium">Profil Saya</p>
              <p className="text-white/60 text-[11px]">Informasi akun</p>
            </div>
          </div>
          <button className="w-11 h-11 flex items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
        <h1 className="text-white text-xl font-bold mt-4">Profil</h1>
      </div>

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
