"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  const isAgendaActive = pathname?.includes("/kegiatan") || pathname?.includes("/agenda");
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname === href;
  };

  return (
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

          {/* Tambah (Center FAB) - Raised Circle */}
          <div className="relative -mt-6 z-20">
            <Link
              href="/kegiatan?action=new"
              className="flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                boxShadow: "0 6px 24px rgba(99, 102, 241, 0.45), 0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>

          {/* Akun */}
          <button
            type="button"
            className={`flex flex-col items-center justify-center w-20 h-full transition-all duration-200 ${
              isActive("/akun") ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill={isActive("/akun") ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/akun") ? 2.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-medium">Akun</span>
          </button>
        </div>
      </div>
    </nav>
  );
}