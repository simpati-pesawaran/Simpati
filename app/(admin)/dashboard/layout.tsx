"use client";

import { BottomNav } from "@/app/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex justify-center" style={{ background: "#1e3a5f" }}>
      {/* Mobile Shell - Max 430px, centered on desktop */}
      <div
        className="w-full min-h-screen flex flex-col"
        style={{
          maxWidth: "430px",
          background: "#f1f5f9",
          position: "relative"
        }}
      >
        {/* No Header for Dashboard - Dashboard has its own hero header */}
        <main className="flex-1">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}