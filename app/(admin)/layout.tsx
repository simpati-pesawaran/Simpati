"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header, BottomNav } from "../components/layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-navy-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header title="SIMPATI" showBell />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
