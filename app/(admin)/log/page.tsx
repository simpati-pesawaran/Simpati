"use client";

import { useEffect, useState, useCallback } from "react";
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

interface FilterState {
  entity: string;
  action: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

const ACTION_CONFIG: Record<string, { bg: string; border: string; color: string; label: string; icon: string }> = {
  create: { bg: "bg-emerald-50", border: "border-emerald-200", color: "text-emerald-600", label: "Buat", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
  update: { bg: "bg-blue-50", border: "border-blue-200", color: "text-blue-600", label: "Ubah", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  delete: { bg: "bg-red-50", border: "border-red-200", color: "text-red-600", label: "Hapus", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" },
  submit: { bg: "bg-amber-50", border: "border-amber-200", color: "text-amber-600", label: "Kirim", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
  approve: { bg: "bg-emerald-50", border: "border-emerald-200", color: "text-emerald-600", label: "Setuju", icon: "M5 13l4 4L19 7" },
  reject: { bg: "bg-red-50", border: "border-red-200", color: "text-red-600", label: "Tolak", icon: "M6 18L18 6M6 6l12 12" },
  login: { bg: "bg-indigo-50", border: "border-indigo-200", color: "text-indigo-600", label: "Masuk", icon: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" },
  logout: { bg: "bg-gray-50", border: "border-gray-200", color: "text-gray-600", label: "Keluar", icon: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" },
  sync: { bg: "bg-purple-50", border: "border-purple-200", color: "text-purple-600", label: "Sinkron", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  view: { bg: "bg-cyan-50", border: "border-cyan-200", color: "text-cyan-600", label: "Lihat", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
  publish: { bg: "bg-teal-50", border: "border-teal-200", color: "text-teal-600", label: "Publikasi", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  cancel: { bg: "bg-orange-50", border: "border-orange-200", color: "text-orange-600", label: "Batal", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
  sync_failure: { bg: "bg-rose-50", border: "border-rose-200", color: "text-rose-600", label: "Gagal Sinkron", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
};

const ENTITY_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  agenda: { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-blue-500", label: "Agenda" },
  audiensi: { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "text-indigo-500", label: "Audiensi" },
  gallery: { icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-purple-500", label: "Galeri" },
  usulan: { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-amber-500", label: "Usulan" },
  user: { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "text-indigo-500", label: "User" },
  auth: { icon: "M12 15v2m-6 4h12a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-gray-500", label: "Auth" },
};

export default function LogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>({
    entity: "all",
    action: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<LogEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.entity !== "all") params.set("entity_type", filter.entity);
      if (filter.action !== "all") params.set("action", filter.action);
      if (filter.dateFrom) params.set("date_from", filter.dateFrom);
      if (filter.dateTo) params.set("date_to", filter.dateTo);
      if (filter.search) params.set("search", filter.search);
      params.set("limit", "50");

      const res = await fetch("/api/logs?" + params);
      const data = await res.json();
      if (data.success) setLogs(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const resetFilters = () => setFilter({ entity: "all", action: "all", dateFrom: "", dateTo: "", search: "" });
  const applyFilters = (newFilter: FilterState) => { setFilter(newFilter); setShowFilterModal(false); };

  const groupLogsByDate = (logs: LogEntry[]) => {
    const groups: Record<string, LogEntry[]> = {};
    logs.forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const hasActiveFilters = filter.entity !== "all" || filter.action !== "all" || filter.dateFrom || filter.dateTo || filter.search;
  const groupedLogs = groupLogsByDate(logs);
  const dates = Object.keys(groupedLogs);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#f1f5f9" }}>
      <div className="px-5 pt-4 pb-8" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)" }}>
        <div className="flex items-center gap-4 mb-1">
          <Link href="/dashboard" className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold">Log Aktivitas</h1>
            <p className="text-white/60 text-xs">Riwayat aktivitas sistem</p>
          </div>
          <button onClick={() => setShowFilterModal(true)} className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 relative" style={{ background: hasActiveFilters ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 7.586V4z" /></svg>
            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>
        </div>
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-white/60 text-xs">Total</p>
            <p className="text-white text-lg font-bold">{logs.length}</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-white/60 text-xs">Hari Ini</p>
            <p className="text-white text-lg font-bold">{groupedLogs[new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })]?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-3 mb-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Cari aktivitas..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} className="flex-1 bg-transparent outline-none text-sm" />
          {filter.search && <button onClick={() => setFilter({ ...filter, search: "" })} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
        </div>

        {loading && logs.length === 0 ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : dates.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p className="text-gray-500 font-medium">Tidak ada aktivitas</p>
            <p className="text-gray-400 text-sm mt-1">Aktivitas sistem akan ditampilkan di sini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dates.map((date) => (
              <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <h3 className="text-sm font-bold text-gray-700">{date}</h3>
                  <span className="ml-auto text-xs text-gray-400">{groupedLogs[date].length} aktivitas</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {groupedLogs[date].map((log) => {
                    const ac = ACTION_CONFIG[log.action] || { bg: "bg-gray-50", border: "border-gray-200", color: "text-gray-600", label: log.action, icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" };
                    const ec = ENTITY_CONFIG[log.entity_type] || { icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-gray-500", label: log.entity_type };
                    return (
                      <button key={log.id} onClick={() => setShowDetailModal(log)} className="w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: ac.bg.includes('emerald') ? '#ecfdf5' : ac.bg.includes('blue') ? '#eff6ff' : ac.bg.includes('red') ? '#fef2f2' : ac.bg.includes('amber') ? '#fffbeb' : ac.bg.includes('indigo') ? '#eef2ff' : ac.bg.includes('purple') ? '#faf5ff' : ac.bg.includes('cyan') ? '#ecfeff' : '#f9fafb', borderColor: ac.border.includes('emerald') ? '#a7f3d0' : ac.border.includes('blue') ? '#bfdbfe' : ac.border.includes('red') ? '#fecaca' : ac.border.includes('amber') ? '#fde68a' : ac.border.includes('indigo') ? '#c7d2fe' : ac.border.includes('purple') ? '#ddd6fe' : ac.border.includes('cyan') ? '#a5f3fc' : '#e5e7eb' }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: ac.color.includes('emerald') ? '#10b981' : ac.color.includes('blue') ? '#3b82f6' : ac.color.includes('red') ? '#ef4444' : ac.color.includes('amber') ? '#f59e0b' : ac.color.includes('indigo') ? '#6366f1' : ac.color.includes('purple') ? '#a855f7' : ac.color.includes('cyan') ? '#06b6d4' : '#6b7280' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ac.icon} /></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold border" style={{ backgroundColor: ac.bg.includes('emerald') ? '#ecfdf5' : ac.bg.includes('blue') ? '#eff6ff' : ac.bg.includes('red') ? '#fef2f2' : ac.bg.includes('amber') ? '#fffbeb' : ac.bg.includes('indigo') ? '#eef2ff' : '#f9fafb', color: ac.color.includes('emerald') ? '#10b981' : ac.color.includes('blue') ? '#3b82f6' : ac.color.includes('red') ? '#ef4444' : ac.color.includes('amber') ? '#f59e0b' : ac.color.includes('indigo') ? '#6366f1' : '#6b7280', borderColor: ac.border.includes('emerald') ? '#a7f3d0' : ac.border.includes('blue') ? '#bfdbfe' : ac.border.includes('red') ? '#fecaca' : ac.border.includes('amber') ? '#fde68a' : ac.border.includes('indigo') ? '#c7d2fe' : '#e5e7eb' }}>{ac.label}</span>
                              <span className="flex items-center gap-1 text-xs" style={{ color: ec.color.includes('blue') ? '#3b82f6' : ec.color.includes('indigo') ? '#6366f1' : ec.color.includes('purple') ? '#a855f7' : ec.color.includes('amber') ? '#f59e0b' : '#6b7280' }}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ec.icon} /></svg>
                                {ec.label}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate pr-4">{log.description}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{log.user_name}</span>
                              <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{formatTime(log.created_at)}</span>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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

      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowFilterModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Filter Aktivitas</h2>
              <button onClick={() => setShowFilterModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Modul</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ value: "all", label: "Semua" }, { value: "agenda", label: "Agenda" }, { value: "gallery", label: "Galeri" }, { value: "usulan", label: "Usulan" }, { value: "user", label: "User" }, { value: "auth", label: "Auth" }].map((opt) => (
                    <button key={opt.value} onClick={() => setFilter({ ...filter, entity: opt.value })} className={"py-2 px-3 rounded-xl text-sm font-medium transition-all " + (filter.entity === opt.value ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Aksi</label>
                <div className="grid grid-cols-4 gap-2">
                  {[{ value: "all", label: "Semua" }, { value: "create", label: "Buat" }, { value: "update", label: "Ubah" }, { value: "delete", label: "Hapus" }, { value: "submit", label: "Kirim" }, { value: "approve", label: "Setuju" }, { value: "reject", label: "Tolak" }, { value: "login", label: "Masuk" }, { value: "logout", label: "Keluar" }].map((opt) => (
                    <button key={opt.value} onClick={() => setFilter({ ...filter, action: opt.value })} className={"py-2 px-3 rounded-xl text-xs font-medium transition-all " + (filter.action === opt.value ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Tanggal</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filter.dateFrom} onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                  <span className="text-gray-400">to</span>
                  <input type="date" value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={resetFilters} className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all">Reset</button>
              <button onClick={() => applyFilters(filter)} className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all">Terapkan</button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowDetailModal(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Detail Aktivitas</h2>
              <button onClick={() => setShowDetailModal(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' }}>
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ACTION_CONFIG[showDetailModal.action]?.icon || "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{showDetailModal.description}</p>
                  <p className="text-sm text-gray-500">{ENTITY_CONFIG[showDetailModal.entity_type]?.label || showDetailModal.entity_type}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Pengguna</span><span className="font-medium text-gray-900">{showDetailModal.user_name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Waktu</span><span className="font-medium text-gray-900">{new Date(showDetailModal.created_at).toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Aksi</span><span className="font-medium text-gray-900">{ACTION_CONFIG[showDetailModal.action]?.label || showDetailModal.action}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">ID Entitas</span><span className="font-mono text-xs text-gray-600">{showDetailModal.entity_id.slice(0, 8)}...</span></div>
              </div>
              {showDetailModal.old_data && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>Data Lama</h4>
                  <pre className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-gray-700 overflow-x-auto">{JSON.stringify(showDetailModal.old_data, null, 2)}</pre>
                </div>
              )}
              {showDetailModal.new_data && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Data Baru</h4>
                  <pre className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-gray-700 overflow-x-auto">{JSON.stringify(showDetailModal.new_data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
