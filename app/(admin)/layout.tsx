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
    <div className="w-full flex flex-col" style={{ maxWidth: "430px", minHeight: "100vh", background: "#f1f5f9", position: "relative" }}>
      {/* Header untuk semua halaman KECUALI dashboard */}
      {!isDashboard && <Header />}

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
