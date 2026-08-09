"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showJenisModal, setShowJenisModal] = useState(false);

  const isAgendaActive = pathname?.includes("/kegiatan") || pathname?.includes("/agenda");
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname === href;
  };

  // Close modal on route change
  useEffect(() => {
    setShowJenisModal(false);
  }, [pathname]);

  const handleCreateAgenda = (jenis: "kegiatan" | "audiensi") => {
    setShowJenisModal(false);
    router.push(`/kegiatan?action=new&jenis=${jenis}`);
  };

  return (
    <>
      <nav
        className="bottom-nav-fixed"
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "430px",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          zIndex: 50,
        }}
      >
        {/* Frosted Glass Container - Rounded Full */}
        <div className="mx-3 mb-2">
          <div
            className="flex items-center justify-around h-16 rounded-full relative"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8)",
            }}
          >
            {/* Beranda */}
            <Link
              href="/dashboard"
              className={`flex flex-col items-center justify-center w-20 h-full transition-all duration-200 ${
                isActive("/dashboard") ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill={isActive("/dashboard") ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/dashboard") ? 2.5 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] font-medium">Beranda</span>
            </Link>

            {/* Tambah (Center FAB) - Opens Jenis Modal */}
            <div className="relative -mt-6 z-20">
              <button
                onClick={() => setShowJenisModal(true)}
                className="flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  boxShadow: "0 6px 24px rgba(99, 102, 241, 0.45), 0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Akun */}
            <Link
              href="/akun"
              className={`flex flex-col items-center justify-center w-20 h-full transition-all duration-200 ${
                isActive("/akun") ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill={isActive("/akun") ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/akun") ? 2.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] font-medium">Akun</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Modal: Pilih Jenis Agenda */}
      {showJenisModal && (
        <div
          className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowJenisModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 text-center border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Buat Agenda Baru</h2>
              <p className="text-xs text-gray-500 mt-1">Pilih jenis agenda yang ingin dibuat</p>
            </div>

            {/* Options */}
            <div className="p-4 space-y-3">
              {/* Kegiatan */}
              <button
                onClick={() => handleCreateAgenda("kegiatan")}
                className="w-full p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-blue-700">📌 Kegiatan</h3>
                    <p className="text-xs text-blue-600/70">Rapat, meeting, kunjungan, dll</p>
                  </div>
                </div>
              </button>

              {/* Audiensi */}
              <button
                onClick={() => handleCreateAgenda("audiensi")}
                className="w-full p-4 rounded-xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-purple-700">🎭 Audiensi</h3>
                    <p className="text-xs text-purple-600/70">Tamu, delegasi, masyarakat, dll</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Cancel */}
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowJenisModal(false)}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </>
  );
}
