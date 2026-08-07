"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface LogEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  created_at: string;
}

const ACTION_COLORS: Record<string, { bg: string; icon: string }> = {
  create: { bg: "bg-emerald-100 text-emerald-700", icon: "M12 4v16m8-8H4" },
  update: { bg: "bg-blue-100 text-blue-700", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  delete: { bg: "bg-red-100 text-red-700", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" },
  submit: { bg: "bg-amber-100 text-amber-700", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  approve: { bg: "bg-emerald-100 text-emerald-700", icon: "M5 13l4 4L19 7" },
  reject: { bg: "bg-red-100 text-red-700", icon: "M6 18L18 6M6 6l12 12" },
  login: { bg: "bg-indigo-100 text-indigo-700", icon: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" },
  sync: { bg: "bg-purple-100 text-purple-700", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
};

const ENTITY_LABELS: Record<string, string> = {
  agenda: "Agenda",
  gallery: "Galeri",
  usulan: "Usulan",
  user: "User",
  auth: "Autentikasi",
};

export default function LogPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const profile = (session?.user as any)?.profile;
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    fetchLogs(true);
  }, [filterEntity, filterAction, dateFrom, dateTo]);

  const fetchLogs = async (reset: boolean = false) => {
    if (reset) setPage(1);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("limit", "20");
      params.set("page", String(reset ? 1 : page));

      if (filterEntity !== "all") params.set("entity_type", filterEntity);
      if (filterAction !== "all") params.set("action", filterAction);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);

      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();

      if (data.success) {
        if (reset) {
          setLogs(data.data || []);
        } else {
          setLogs((prev) => [...prev, ...(data.data || [])]);
        }
        setHasMore(data.data?.length === 20);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage((p) => p + 1);
    fetchLogs(false);
  };

  const resetFilters = () => {
    setFilterEntity("all");
    setFilterAction("all");
    setDateFrom("");
    setDateTo("");
  };

  const groupLogsByDate = (logs: LogEntry[]) => {
    const groups: Record<string, LogEntry[]> = {};
    logs.forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupedLogs = groupLogsByDate(logs);
  const dates = Object.keys(groupedLogs);

  return (
    <div className="min-h-screen pb-20" style={{ background: "#f1f5f9" }}>
      {/* Header Section - Gradient Theme */}
      <div
        className="px-5 pb-5"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)",
        }}
      >
        {/* Back Button + Title */}
        <div className="flex items-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white text-xl font-bold">Log Aktivitas</h1>
            <p className="text-white/60 text-xs">Riwayat aktivitas sistem</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="-mt-3 px-4 py-4">
        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Entitas</option>
              <option value="agenda">Agenda</option>
              <option value="gallery">Galeri</option>
              <option value="usulan">Usulan</option>
              <option value="user">User</option>
              <option value="auth">Autentikasi</option>
            </select>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Aksi</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="submit">Submit</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="login">Login</option>
              <option value="sync">Sync</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-400 flex items-center">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={resetFilters}
            className="w-full py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            Reset Filter
          </button>
        </div>
      </div>
      {/* Log List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : dates.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">Tidak ada aktivitas</p>
          </div>
        ) : (
          <>
            {dates.map((date) => (
              <div key={date} className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">{date}</h3>
                <div className="space-y-2">
                  {groupedLogs[date].map((log) => {
                    const actionStyle = ACTION_COLORS[log.action] || { bg: "bg-gray-100 text-gray-700", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" };
                    return (
                      <div key={log.id} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${actionStyle.bg}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={actionStyle.icon} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                {ENTITY_LABELS[log.entity_type] || log.entity_type}
                              </span>
                              <span className="text-xs text-gray-400">{formatTime(log.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-900">{log.description}</p>
                            <p className="text-xs text-gray-500 mt-1">oleh {log.user_name}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-3 bg-white text-indigo-600 text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
              >
                {loading ? "Memuat..." : "Lihat Lebih Banyak"}
              </button>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </div>
  );
}
