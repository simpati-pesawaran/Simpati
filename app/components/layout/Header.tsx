"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
  data: Record<string, unknown>;
}

export function Header() {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profile = (session?.user as any)?.profile;
  const isSuperadmin = profile?.role === "superadmin";

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      // Fetch notifications for superadmin to show pending user registrations
      if (isSuperadmin) {
        const res = await fetch("/api/notifications?limit=10");
        const data = await res.json();
        if (data.success && data.data) {
          setNotifications(data.data);
          setUnreadCount(data.unread || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (ids?: string[]) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="h-14 px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-white font-semibold text-lg">SIMPATI</h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Bell Icon */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    markAsRead();
                  }
                }}
                className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        Tidak ada notifikasi
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${
                            !notif.is_read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {notif.title}
                          </p>
                          {notif.message && (
                            <p className="text-xs text-gray-500 mt-1">
                              {notif.message}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(notif.created_at)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {isSuperadmin && notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100">
                      <Link
                        href="/admin/approvals"
                        className="text-sm text-[#1e3a5f] font-medium hover:underline"
                      >
                        Lihat semua permintaan
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            {session?.user?.image && (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30">
                <img
                  src={session.user.image}
                  alt={session.user.name || ""}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </header>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return date.toLocaleDateString("id-ID");
}
