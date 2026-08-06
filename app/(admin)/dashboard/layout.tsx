"use client";

import { BottomNav } from "@/app/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* No Header for Dashboard - Dashboard has its own hero */}
      <main className="flex-1">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}