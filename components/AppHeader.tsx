"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";

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
  type: "agenda" | "audiensi" | "usulan" | "info";
  title: string;
  time: string;
  isToday?: boolean;
  isYesterday?: boolean;
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
  const [showNotifications, setShowNotifications] = useState(false);

  // Sample notifications
  const notifications: Notification[] = [
    { id: "1", type: "agenda", title: "Agenda dimulai 07.00", time: "Hari ini", isToday: true },
    { id: "2", type: "audiensi", title: "Audiensi pukul 09.30", time: "Hari ini", isToday: true },
    { id: "3", type: "usulan", title: "Usulan kegiatan baru", time: "Kemarin", isYesterday: true },
    { id: "4", type: "agenda", title: "Agenda diperbarui", time: "Kemarin", isYesterday: true },
    { id: "5", type: "info", title: "Admin mengubah jadwal", time: "Kemarin", isYesterday: true },
  ];

  const todayNotifications = notifications.filter(n => n.isToday);
  const yesterdayNotifications = notifications.filter(n => n.isYesterday);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "agenda":
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case "audiensi":
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      case "usulan":
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
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
            {/* Logo + Description */}
            <div className="flex items-center gap-3">
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
            </div>

            {/* Bell Notification */}
            {showNotification && (
              <button
                onClick={() => setShowNotifications(true)}
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
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-500 text-xs font-bold rounded-full flex items-center justify-center shadow">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {children}
        </div>

        {/* Notification Bottom Sheet */}
        {showNotifications && (
          <div className="fixed inset-0 z-50" onClick={() => setShowNotifications(false)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] shadow-2xl flex flex-col animate-slideUp"
              style={{ maxHeight: "75vh", maxWidth: "430px", margin: "0 auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Notifikasi
                </h2>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                {/* Today */}
                {todayNotifications.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Hari ini</h3>
                    <div className="space-y-3">
                      {todayNotifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => setShowNotifications(false)}
                          className="w-full flex items-start gap-3 p-3 bg-gray-50/80 rounded-2xl hover:bg-gray-100 transition-colors"
                        >
                          {getNotificationIcon(notif.type)}
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{notif.time}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Yesterday */}
                {yesterdayNotifications.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Kemarin</h3>
                    <div className="space-y-3">
                      {yesterdayNotifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => setShowNotifications(false)}
                          className="w-full flex items-start gap-3 p-3 bg-gray-50/80 rounded-2xl hover:bg-gray-100 transition-colors"
                        >
                          {getNotificationIcon(notif.type)}
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{notif.time}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slideUp {
            animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1);
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

      {/* Notification Bottom Sheet */}
      {showNotifications && (
        <div className="fixed inset-0 z-50" onClick={() => setShowNotifications(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] shadow-2xl flex flex-col animate-slideUp"
            style={{ maxHeight: "75vh", maxWidth: "430px", margin: "0 auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Notifikasi
              </h2>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {/* Today */}
              {todayNotifications.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Hari ini</h3>
                  <div className="space-y-3">
                    {todayNotifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => setShowNotifications(false)}
                        className="w-full flex items-start gap-3 p-3 bg-gray-50/80 rounded-2xl hover:bg-gray-100 transition-colors"
                      >
                        {getNotificationIcon(notif.type)}
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notif.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Yesterday */}
              {yesterdayNotifications.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Kemarin</h3>
                  <div className="space-y-3">
                    {yesterdayNotifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => setShowNotifications(false)}
                        className="w-full flex items-start gap-3 p-3 bg-gray-50/80 rounded-2xl hover:bg-gray-100 transition-colors"
                      >
                        {getNotificationIcon(notif.type)}
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notif.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </>
  );
}
