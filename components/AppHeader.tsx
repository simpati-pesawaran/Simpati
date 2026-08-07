"use client";

import { ReactNode, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface AppHeaderProps {
  variant?: "hero" | "default";
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  showNotification?: boolean;
  notificationCount?: number;
  children?: ReactNode; // For dashboard stats/quick actions
}

interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function AppHeader({
  variant = "default",
  title,
  subtitle,
  icon,
  showNotification = true,
  notificationCount = 0,
  children,
}: AppHeaderProps) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=10");
      const data = await res.json();
      if (data.success && data.data) {
        setNotifications(data.data);
        setUnreadCount(data.unread || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  if (variant === "hero") {
    return (
      <>
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)",
            paddingTop: "calc(env(safe-area-inset-top, 20px) + 16px)",
            paddingBottom: "24px",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
        >
          {/* Floating Bubbles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" style={{ transform: "translate(20%, -50%)" }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" style={{ transform: "translate(-30%, 50%)" }} />
          </div>

          {/* Header Content */}
          <div className="relative z-10 flex items-center justify-between pb-6">
            {/* Logo + Description - Clickable */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <Image src="/logo/logo-master.png" alt="SIMPATI" width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <p className="text-white/80 text-xs font-medium tracking-wide">Sistem Informasi Manajemen</p>
                <p className="text-white/60 text-[11px]">Protokol & Agenda Terintegrasi</p>
              </div>
            </Link>

            {/* Bell Notification */}
            <button
              onClick={() => {
                setShowNotifications(true);
                if (unreadCount > 0) {
                  markAsRead();
                }
              }}
              className="relative w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-95"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-500 text-xs font-bold rounded-full flex items-center justify-center shadow">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          {children}
        </div>

        {/* Notification Bottom Sheet */}
        {showNotifications && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNotifications(false)}>
            <div
              className="w-full sm:max-w-[390px] bg-white rounded-3xl shadow-2xl animate-slideDown overflow-hidden"
              style={{ maxHeight: "75vh" }}
              onClick={(e) => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="flex justify-center pt-4 pb-3">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Notifikasi</h2>
                      <p className="text-xs text-gray-500">{notifications.length} notifikasi</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 p-4 rounded-2xl transition-all ${
                            !notif.is_read
                              ? "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            notif.type === "approval"
                              ? "bg-emerald-100 text-emerald-600"
                              : notif.type === "info"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {notif.type === "approval" ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                            {notif.message && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notif.created_at)}</p>
                          </div>
                          {!notif.is_read && (
                            <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
          </div>
        )}

        <style jsx>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .animate-slideDown {
            animation: slideDown 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
          }
        `}</style>
      </>
    );
  }

  // Default variant
  return (
    <>
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)",
          paddingTop: "calc(env(safe-area-inset-top, 20px) + 12px)",
          paddingBottom: "16px",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        {/* Subtle floating effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl" style={{ transform: "translate(20%, -30%)" }} />
        </div>

        {/* Header Content */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Logo + Description */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {icon || (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </div>
            <div className="leading-tight">
              <p className="text-white/80 text-xs font-medium tracking-wide">Sistem Informasi Manajemen</p>
              <p className="text-white/60 text-[11px]">Protokol & Agenda Terintegrasi</p>
            </div>
          </div>

          {/* Bell Notification */}
          {showNotification && (
            <button
              onClick={() => setShowNotifications(true)}
              className="relative w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-95"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-500 text-xs font-bold rounded-full flex items-center justify-center shadow">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Page Title */}
        {title && (
          <h1 className="text-white text-xl font-bold mt-3">{title}</h1>
        )}
      </div>

      {/* Notification Modal - Centered */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNotifications(false)}>
          <div
            className="w-full sm:max-w-[390px] bg-white rounded-3xl shadow-2xl animate-slideDown overflow-hidden"
            style={{ maxHeight: "75vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Notifikasi</h2>
                  <p className="text-xs text-gray-500">{notifications.length} notifikasi</p>
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Tidak ada notifikasi</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 p-4 rounded-2xl transition-all ${
                        !notif.is_read
                          ? "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        notif.type === "approval"
                          ? "bg-emerald-100 text-emerald-600"
                          : notif.type === "info"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {notif.type === "approval" ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                        {notif.message && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notif.created_at)}</p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
      `}</style>
    </>
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

