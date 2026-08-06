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
    <div className="min-h-screen bg-slate-100">
      {/* Header untuk semua halaman KECUALI dashboard */}
      {!isDashboard && <Header />}

      {/* Main content */}
      <main className={`flex-1 ${isDashboard ? '' : 'pt-14'}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}