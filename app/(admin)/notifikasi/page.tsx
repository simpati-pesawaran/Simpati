"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
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

const NOTIFICATION_CONFIG: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  user_registered: { bg: "bg-amber-50", border: "border-amber-200", color: "text-amber-600", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" },
  user_approved: { bg: "bg-emerald-50", border: "border-emerald-200", color: "text-emerald-600", icon: "M5 13l4 4L19 7" },
  user_rejected: { bg: "bg-red-50", border: "border-red-200", color: "text-red-600", icon: "M6 18L18 6M6 6l12 12" },
  agenda_created: { bg: "bg-blue-50", border: "border-blue-200", color: "text-blue-600", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
  agenda_updated: { bg: "bg-indigo-50", border: "border-indigo-200", color: "text-indigo-600", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  agenda_deleted: { bg: "bg-red-50", border: "border-red-200", color: "text-red-600", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" },
  agenda_reminder: { bg: "bg-purple-50", border: "border-purple-200", color: "text-purple-600", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  usulan_new: { bg: "bg-amber-50", border: "border-amber-200", color: "text-amber-600", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  sync_failed: { bg: "bg-rose-50", border: "border-rose-200", color: "text-rose-600", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  profile_updated: { bg: "bg-cyan-50", border: "border-cyan-200", color: "text-cyan-600", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  share_created: { bg: "bg-teal-50", border: "border-teal-200", color: "text-teal-600", icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" },
  media_uploaded: { bg: "bg-violet-50", border: "border-violet-200", color: "text-violet-600", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  media_deleted: { bg: "bg-orange-50", border: "border-orange-200", color: "text-orange-600", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const profile = (session?.user as any)?.profile;
  const isSuperadmin = profile?.role === "superadmin";

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");

      const res = await fetch("/api/notifications?" + params);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unread || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session, fetchNotifications]);

  const markAsRead = async (ids?: string[]) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = () => {
    markAsRead();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "read") return n.is_read;
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const groupByDate = (items: Notification[]) => {
    const groups: Record<string, Notification[]> = {};
    items.forEach((item) => {
      const date = new Date(item.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateLabel = date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

      if (date.toDateString() === today.toDateString()) {
        dateLabel = "Hari Ini";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateLabel = "Kemarin";
      }

      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(item);
    });
    return groups;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const groupedNotifications = groupByDate(filteredNotifications);
  const dateLabels = Object.keys(groupedNotifications);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-6" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)" }}>
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard" className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold">Notifikasi</h1>
            <p className="text-white/60 text-xs">Semua notifikasi untuk Anda</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 bg-white/20 text-white text-xs font-medium rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all"
            >
              Tandai sudah dibaca
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-white/60 text-xs">Total</p>
            <p className="text-white text-lg font-bold">{notifications.length}</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-white/60 text-xs">Belum Dibaca</p>
            <p className="text-white text-lg font-bold">{unreadCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 -mt-3">
        <div className="bg-white rounded-2xl shadow-sm p-1.5 flex gap-1">
          {[
            { key: "all", label: "Semua" },
            { key: "unread", label: "Belum Dibaca", badge: unreadCount },
            { key: "read", label: "Sudah Dibaca" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === tab.key ? "bg-white/20" : "bg-red-100 text-red-600"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : dateLabels.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 font-semibold">Tidak ada notifikasi</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === "unread" ? "Semua notifikasi sudah dibaca" : "Notifikasi akan muncul di sini"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dateLabels.map((dateLabel) => (
              <div key={dateLabel} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-sm font-bold text-gray-700">{dateLabel}</h3>
                  <span className="ml-auto text-xs text-gray-400">{groupedNotifications[dateLabel].length} notifikasi</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {groupedNotifications[dateLabel].map((notif) => {
                    const config = NOTIFICATION_CONFIG[notif.type] || { bg: "bg-gray-50", border: "border-gray-200", color: "text-gray-600", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" };
                    return (
                      <button
                        key={notif.id}
                        onClick={() => setSelectedNotif(notif)}
                        className={`w-full px-5 py-4 text-left transition-all hover:bg-gray-50/50 active:bg-gray-100 ${
                          !notif.is_read ? "bg-gradient-to-r from-indigo-50/30 to-purple-50/30" : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${config.bg} ${config.border}`}>
                            <svg className={`w-5 h-5 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`text-sm font-semibold ${notif.is_read ? "text-gray-700" : "text-gray-900"}`}>
                                {notif.title}
                              </p>
                              {!notif.is_read && (
                                <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></span>
                              )}
                            </div>
                            {notif.message && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTime(notif.created_at)}
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedNotif(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[75vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Detail Notifikasi</h2>
                <button onClick={() => setSelectedNotif(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[55vh]">
              {/* Icon & Type */}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                  NOTIFICATION_CONFIG[selectedNotif.type]?.bg || "bg-gray-50"
                } ${NOTIFICATION_CONFIG[selectedNotif.type]?.border || "border-gray-200"}`}>
                  <svg className={`w-6 h-6 ${NOTIFICATION_CONFIG[selectedNotif.type]?.color || "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={NOTIFICATION_CONFIG[selectedNotif.type]?.icon || "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedNotif.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(selectedNotif.created_at).toLocaleString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Message */}
              {selectedNotif.message && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedNotif.message}</p>
                </div>
              )}

              {/* Type Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Tipe:</span>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                  {selectedNotif.type.replace(/_/g, " ")}
                </span>
              </div>

              {/* Data if available */}
              {selectedNotif.data && Object.keys(selectedNotif.data).length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Data Tambahan</p>
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(selectedNotif.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Action */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-white">
              {!selectedNotif.is_read && (
                <button
                  onClick={() => {
                    markAsRead([selectedNotif.id]);
                    setSelectedNotif({ ...selectedNotif, is_read: true });
                  }}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
                >
                  Tandai Sudah Dibaca
                </button>
              )}
              {selectedNotif.is_read && (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium">Sudah dibaca</span>
                </div>
              )}
            </div>

            {/* Safe Area */}
            <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
          </div>
        </div>
      )}
    </div>
  );
}
