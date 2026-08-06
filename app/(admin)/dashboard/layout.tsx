"use client";

import { BottomNav } from "@/app/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {/* No Header for Dashboard - Dashboard has its own hero header */}
        <main className="flex-1">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}