"use client";

import { BottomNav } from "@/app/components/layout/BottomNav";
import { usePathname } from "next/navigation";
import { Header } from "@/app/components/layout/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard" || pathname === "/";

  return (
    <div className="min-h-screen flex justify-center" style={{ background: "#1a1a2e" }}>
      {/* Mobile Shell - Max 430px, centered on desktop */}
      <div
        className="w-full flex flex-col relative"
        style={{
          maxWidth: "430px",
          minHeight: "100vh",
          minHeight: "100dvh",
          background: "#f1f5f9",
          boxShadow: "0 0 60px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header untuk semua halaman KECUALI dashboard */}
        {!isDashboard && <Header />}

        {/* Main content */}
        <main className={`flex-1 ${isDashboard ? '' : 'pt-0'}`}>
          {children}
        </main>

        {/* Bottom Navigation - inside shell */}
        <BottomNav />
      </div>
    </div>
  );
}