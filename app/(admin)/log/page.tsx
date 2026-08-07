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
  old_data?: any;
  new_data?: any;
}

const ACTION_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  create: { bg: "bg-emerald-50 border-emerald-200", color: "text-emerald-600", label: "Buat" },
  update: { bg: "bg-blue-50 border-blue-200", color: "text-blue-600", label: "Ubah" },
  delete: { bg: "bg-red-50 border-red-200", color: "text-red-600", label: "Hapus" },
  submit: { bg: "bg-amber-50 border-amber-200", color: "text-amber-600", label: "Kirim" },
  approve: { bg: "bg-emerald-50 border-emerald-200", color: "text-emerald-600", label: "Setuju" },
  reject: { bg: "bg-red-50 border-red-200", color: "text-red-600", label: "Tolak" },
  login: { bg: "bg-indigo-50 border-indigo-200", color: "text-indigo-600", label: "Masuk" },
  logout: { bg: "bg-gray-50 border-gray-200", color: "text-gray-600", label: "Keluar" },
  sync: { bg: "bg-purple-50 border-purple-200", color: "text-purple-600", label: "Sinkron" },
};

const ENTITY_CONFIG: Record<string, { icon: string; color: string }> = {
  agenda: { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-blue-500" },
  gallery: { icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-purple-500" },
  usulan: { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-amber-500" },
  user: { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "text-indigo-500" },
  auth: { icon: "M12 15v2m-6 4h12a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-gray-500" },
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
  const [showFilters, setShowFilters] = useState(false);

  const profile = (session?.user as any)?.profile;

  useEffect(() => {
    fetchLogs(true);
  }, [filterEntity, filterAction, dateFrom, dateTo]);

  const fetchLogs = async (reset: boolean = false) => {
    if (reset) setPage(1);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("limit", "30");
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
        setHasMore(data.data?.length === 30);
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

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return formatTime(dateStr);
  };

  const groupedLogs = groupLogsByDate(logs);
  const dates = Object.keys(groupedLogs);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div
        className="px-5 pt-4 pb-8"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold">Log Aktivitas</h1>
            <p className="text-white/60 text-xs">Riwayat lengkap aktivitas sistem</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: showFilters ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 7.586V4z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Filters Panel */}
        <div className={`bg-white rounded-2xl shadow-sm overflow-hidden mb-4 transition-all duration-300 ${showFilters ? "max-h-[500px]" : "max-h-0"}`}>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="all">Semua Modul</option>
                <option value="agenda">Agenda</option>
                <option value="gallery">Galeri</option>
                <option value="usulan">Usulan</option>
                <option value="user">User</option>
                <option value="auth">Auth</option>
              </select>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="all">Semua Aksi</option>
                <option value="create">Buat</option>
                <option value="update">Ubah</option>
                <option value="delete">Hapus</option>
                <option value="submit">Kirim</option>
                <option value="approve">Setuju</option>
                <option value="reject">Tolak</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <span className="text-gray-400 flex items-center px-1">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <button
              onClick={resetFilters}
              className="w-full py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Timeline */}
        {loading && logs.length === 0 ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : dates.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Tidak ada aktivitas</p>
            <p className="text-gray-400 text-sm mt-1">Aktivitas sistem akan ditampilkan di sini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dates.map((date) => (
              <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Date Header */}
                <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700">{date}</h3>
                </div>

                {/* Timeline Items */}
                <div className="divide-y divide-gray-50">
                  {groupedLogs[date].map((log, index) => {
                    const actionConfig = ACTION_CONFIG[log.action] || { bg: "bg-gray-50 border-gray-200", color: "text-gray-600", label: log.action };
                    const entityConfig = ENTITY_CONFIG[log.entity_type] || { icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-gray-500" };
                    const isFirst = index === 0;
                    const isLast = index === groupedLogs[date].length - 1;

                    return (
                      <div key={log.id} className="px-5 py-4">
                        <div className="flex items-start gap-4">
                          {/* Timeline Line & Dot */}
                          <div className="relative flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full border-2 ${actionConfig.bg.replace("50", "200").replace("-50", "-200")} ${actionConfig.color} z-10 bg-white`}>
                            </div>
                            {!isLast && (
                              <div className="w-0.5 flex-1 bg-gray-200 mt-1" style={{ minHeight: "24px" }}></div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header Row */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${actionConfig.bg} ${actionConfig.color}`}>
                                {actionConfig.label}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className={`${entityConfig.color}`}>
                                <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={entityConfig.icon} />
                                </svg>
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {ENTITY_LABELS[log.entity_type] || log.entity_type}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm font-semibold text-gray-900 mb-1">{log.description}</p>

                            {/* Meta Info */}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {log.user_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(log.created_at)}
                              </span>
                            </div>

                            {/* Relative Time */}
                            <p className="text-[10px] text-gray-400 mt-1">
                              {formatRelativeTime(log.created_at)}
                            </p>
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
                className="w-full py-4 bg-white rounded-2xl shadow-sm text-sm text-indigo-600 font-semibold hover:bg-indigo-50 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 0 12h4z" />
                    </svg>
                    Memuat...
                  </span>
                ) : (
                  "Lihat Lebih Banyak"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const ENTITY_LABELS: Record<string, string> = {
  agenda: "Agenda",
  gallery: "Galeri",
  usulan: "Usulan",
  user: "User",
  auth: "Auth",
};
