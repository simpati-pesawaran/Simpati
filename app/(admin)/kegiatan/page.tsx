"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Agenda {
  id: string;
  jenis: "kegiatan" | "audiensi";
  sub_jenis: string | null;
  title: string;
  description: string | null;
  date: string;
  time_start: string;
  time_end: string;
  location: string | null;
  pic_name: string | null;
  pic_phone: string | null;
  participants_count: number | null;
  dresscode: string | null;
  notes: string | null;
  status: string;
  created_by?: string;
  creator?: { id: string; name: string; };
}

interface FormData {
  jenis: "kegiatan" | "audiensi";
  sub_jenis: string;
  title: string;
  description: string;
  date: string;
  time_start: string;
  time_end: string;
  location: string;
  pic_name: string;
  pic_phone: string;
  participants_count: string;
  dresscode: string;
  notes: string;
  status: "draft" | "published";
}

const SUB_JENIS_KEGIATAN = [
  { value: "rapat", label: "Rapat" },
  { value: "meeting", label: "Meeting" },
  { value: "kunjungan", label: "Kunjungan" },
  { value: "monitoring", label: "Monitoring" },
  { value: "event", label: "Event" },
  { value: "lainnya", label: "Lainnya" },
];

const SUB_JENIS_AUDIENSI = [
  { value: "dinas", label: "Dinas" },
  { value: "tamu", label: "Tamu" },
  { value: "delegasi", label: "Delegasi" },
  { value: "masyarakat", label: "Masyarakat" },
  { value: "lainnya", label: "Lainnya" },
];

const initialFormData: FormData = {
  jenis: "kegiatan",
  sub_jenis: "",
  title: "",
  description: "",
  date: "",
  time_start: "09:00",
  time_end: "10:00",
  location: "",
  pic_name: "",
  pic_phone: "",
  participants_count: "",
  dresscode: "",
  notes: "",
  status: "draft",
};

function KegiatanContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"kegiatan" | "audiensi">("kegiatan");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [filteredAgendas, setFilteredAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetail, setShowDetail] = useState<Agenda | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const profile = (session?.user as any)?.profile;
  const isSuperadmin = profile?.role === "superadmin";

  const subJenisOptions = activeTab === "kegiatan" ? SUB_JENIS_KEGIATAN : SUB_JENIS_AUDIENSI;

  // Auto-determine status based on date/time
  const getComputedStatus = (agenda: Agenda): "today" | "upcoming" | "finished" | "cancelled" => {
    if (agenda.status === "cancelled") return "cancelled";

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5);

    if (agenda.date < today) {
      return "finished";
    } else if (agenda.date === today) {
      if (agenda.time_end <= currentTime) {
        return "finished";
      }
      return "today";
    }
    return "upcoming";
  };

  // Apply status filter
  useEffect(() => {
    let filtered = [...agendas];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        (a.location?.toLowerCase() || "").includes(query) ||
        (a.pic_name?.toLowerCase() || "").includes(query) ||
        (a.jenis.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(a => {
        const computedStatus = getComputedStatus(a);
        return computedStatus === statusFilter;
      });
    }

    setFilteredAgendas(filtered);
  }, [agendas, searchQuery, statusFilter]);

  // Open modal when ?action=new
  useEffect(() => {
    if (searchParams?.get("action") === "new") {
      handleOpenModal();
    }
  }, [searchParams]);

  useEffect(() => { fetchAgendas(); }, [activeTab]);

  const fetchAgendas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ jenis: activeTab, limit: "100" });
      const res = await fetch(`/api/agenda?${params}`);
      const data = await res.json();
      if (data.success) setAgendas(data.data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formatTime = (t: string) => t.slice(0, 5);

  const handleOpenModal = (agenda?: Agenda) => {
    if (agenda) {
      setEditingId(agenda.id);
      setFormData({
        jenis: agenda.jenis,
        sub_jenis: agenda.sub_jenis || "",
        title: agenda.title,
        description: agenda.description || "",
        date: agenda.date,
        time_start: agenda.time_start,
        time_end: agenda.time_end,
        location: agenda.location || "",
        pic_name: agenda.pic_name || "",
        pic_phone: agenda.pic_phone || "",
        participants_count: agenda.participants_count?.toString() || "",
        dresscode: agenda.dresscode || "",
        notes: agenda.notes || "",
        status: agenda.status as "draft" | "published",
      });
    } else {
      setEditingId(null);
      setFormData({ ...initialFormData, jenis: activeTab as "kegiatan" | "audiensi" });
    }
    setShowModal(true);
    setShowDetail(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      alert("Judul dan tanggal wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        participants_count: formData.participants_count ? parseInt(formData.participants_count) : null,
      };

      const url = editingId ? `/api/agenda/${editingId}` : "/api/agenda";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchAgendas();
      } else {
        alert(data.error || "Gagal menyimpan");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/agenda/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { fetchAgendas(); setShowDeleteConfirm(null); setShowDetail(null); }
      else alert(data.error || "Gagal");
    } catch { alert("Error"); }
  };

  const handleSyncToSheets = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/sheets", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncMessage({ type: "success", text: data.message });
      } else {
        // Check if it's a configuration issue
        if (data.requiredEnvVars) {
          setSyncMessage({
            type: "error",
            text: "Google Sheets belum dikonfigurasi. Hubungi admin untuk setup."
          });
        } else {
          setSyncMessage({ type: "error", text: data.message || "Gagal sinkronisasi" });
        }
      }
    } catch (error) {
      setSyncMessage({ type: "error", text: "Terjadi kesalahan saat sinkronisasi" });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Container - matching app max-width */}
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen">

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
            <h1 className="text-white text-xl font-bold">Agenda</h1>
            <p className="text-white/60 text-xs">Kelola jadwal kegiatan & audiensi</p>
          </div>
          <button
            onClick={handleSyncToSheets}
            disabled={syncing}
            className="ml-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
            title="Sync ke Google Sheets"
          >
            {syncing ? (
              <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Sync Message Toast */}
        {syncMessage && (
          <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium ${
            syncMessage.type === "success" ? "bg-emerald-500/20 text-emerald-200" : "bg-red-500/20 text-red-200"
          }`}>
            {syncMessage.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-1 flex">
          <button
            onClick={() => setActiveTab("kegiatan")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "kegiatan"
                ? "bg-white text-gray-900 shadow-md"
                : "text-white/80 hover:text-white"
            }`}
          >
            Kegiatan
          </button>
          <button
            onClick={() => setActiveTab("audiensi")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "audiensi"
                ? "bg-white text-gray-900 shadow-md"
                : "text-white/80 hover:text-white"
            }`}
          >
            Audiensi
          </button>
        </div>
      </div>

      {/* Content Section - White Container */}
      <div className="-mt-3">
        {/* Search Bar */}
        <form onSubmit={(e) => { e.preventDefault(); }} className="px-4 pt-4 pb-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari agenda, lokasi, atau PIC..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 shadow-sm" />
          </div>
        </form>

        {/* Status Filter Tabs */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {(["all", "today", "upcoming", "finished", "cancelled"] as StatusFilter[]).map((filter) => {
              const labels: Record<StatusFilter, string> = {
                all: "Semua",
                today: "Hari Ini",
                upcoming: "Mendatang",
                finished: "Selesai",
                cancelled: "Dibatalkan",
              };
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    statusFilter === filter
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {labels[filter]}
                </button>
              );
            })}
          </div>
        </div>

        {/* List Agenda */}
        <div className="px-4 pb-24 space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 text-sm mt-3">Memuat...</p>
            </div>
          ) : filteredAgendas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-gray-700 font-semibold">Belum ada agenda</h3>
              <p className="text-gray-500 text-sm mt-1">Tekan tombol + untuk menambah</p>
            </div>
          ) : filteredAgendas.map((agenda) => {
            const computedStatus = getComputedStatus(agenda);
            const isFinished = computedStatus === "finished";
            const isCancelled = computedStatus === "cancelled";
            const isToday = computedStatus === "today";
            const isKegiatan = agenda.jenis === "kegiatan" || agenda.jenis === "agenda";

            return (
              <button
                key={agenda.id}
                onClick={() => setShowDetail(agenda)}
                className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition active:scale-[0.98] shadow-sm ${
                  isCancelled ? "border-gray-200 opacity-70" :
                  isFinished ? "border-gray-200" :
                  isKegiatan ? "border-blue-100 hover:border-blue-300" : "border-purple-100 hover:border-purple-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-14 h-16 rounded-xl flex flex-col items-center justify-center ${
                    isCancelled ? "bg-gray-400" :
                    isFinished ? "bg-gray-500" :
                    isKegiatan ? "bg-gradient-to-br from-blue-500 to-indigo-500" : "bg-gradient-to-br from-purple-500 to-pink-500"
                  }`}>
                    <span className="text-white/80 text-[10px] font-semibold uppercase">{new Date(agenda.date).toLocaleDateString("id-ID", { weekday: "short" })}</span>
                    <span className="text-white text-xl font-bold">{new Date(agenda.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold line-clamp-1 ${isFinished || isCancelled ? "text-gray-500" : "text-gray-900"}`}>{agenda.title}</h3>
                      {isToday && !isCancelled && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Hari Ini</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className={`w-4 h-4 ${isFinished || isCancelled ? "text-gray-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`text-sm ${isFinished || isCancelled ? "text-gray-400" : "text-gray-500"}`}>{formatTime(agenda.time_start)} - {formatTime(agenda.time_end)}</span>
                    </div>
                    {agenda.location && !isFinished && !isCancelled && (
                      <div className="flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="text-xs text-gray-400 truncate">{agenda.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isCancelled ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Dibatalkan</span>
                    ) : isFinished ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Selesai</span>
                    ) : agenda.status === "draft" ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Draft</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Published</span>
                    )}
                    {agenda.google_event_id && !isCancelled && (
                      <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center" title="Tersinkron Google Calendar">
                        <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        </div>

        {/* FAB - Inside Container */}
        <button onClick={() => handleOpenModal()}
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center active:scale-95 transition-transform z-20 max-w-md"
          style={{ right: "max(1rem, calc((100vw - 448px)/2 + 1rem))" }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {showDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDetail(null)}>
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${showDetail.jenis === "kegiatan" ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-purple-500 to-pink-500"}`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${showDetail.jenis === "kegiatan" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                  {showDetail.jenis === "kegiatan" ? "Kegiatan" : "Audiensi"}
                </span>
                <p className="text-sm font-semibold text-gray-900 truncate">{showDetail.title}</p>
              </div>
              <button onClick={() => setShowDetail(null)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{formatDate(showDetail.date)}</p>
                  <p className="text-sm font-medium text-gray-800">{formatTime(showDetail.time_start)} - {formatTime(showDetail.time_end)}</p>
                </div>
              </div>

              {showDetail.location && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-800 truncate">{showDetail.location}</p>
                </div>
              )}

              {showDetail.pic_name && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{showDetail.pic_name}</p>
                    {showDetail.pic_phone && (
                      <p className="text-xs text-gray-500">{showDetail.pic_phone}</p>
                    )}
                  </div>
                </div>
              )}

              {showDetail.description && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                  <p className="text-sm text-gray-800">{showDetail.description}</p>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  showDetail.status === "cancelled" ? "bg-red-100 text-red-700" :
                  showDetail.status === "published" ? "bg-emerald-100 text-emerald-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {showDetail.status === "cancelled" ? "Dibatalkan" :
                   showDetail.status === "published" ? "Dipublikasi" : "Draft"}
                </span>
                {showDetail.google_event_id && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Google Calendar
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
              <div className="flex gap-2">
                <Link href={`/agenda/${showDetail.id}`} className="flex-1 py-3 text-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all">
                  Lihat Detail
                </Link>
                <button onClick={() => { setShowDetail(null); handleOpenModal(showDetail); }}
                  className="px-4 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full sm:max-w-[390px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 sm:pt-4 sm:pb-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 sm:py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: activeTab === "kegiatan"
                      ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                      : "linear-gradient(135deg, #8b5cf6, #ec4899)",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                  }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingId ? "Edit" : ""} Agenda
                  </h2>
                  <p className="text-xs text-gray-500">{activeTab === "kegiatan" ? "Kegiatan" : "Audiensi"}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-5 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>

              {/* Section: INFORMASI */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informasi
                </h3>

                {/* Title */}
                <div className="space-y-2 mb-5">
                  <label className="text-sm font-semibold text-gray-700">Judul Agenda <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masukkan judul agenda"
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400" />
                </div>

                {/* Sub Jenis - Select */}
                <div className="space-y-2 mb-5">
                  <label className="text-sm font-semibold text-gray-700">Sub Jenis</label>
                  <div className="relative">
                    <select value={formData.sub_jenis} onChange={(e) => setFormData({ ...formData, sub_jenis: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer">
                      <option value="">Pilih Sub Jenis</option>
                      {subJenisOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Custom Sub Jenis - Conditional */}
                {formData.sub_jenis === "lainnya" && (
                  <div className="space-y-2 mb-5 animate-fadeIn">
                    <label className="text-sm font-semibold text-gray-700">Nama Sub Jenis <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Masukkan nama sub jenis"
                      className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400" />
                  </div>
                )}
              </section>

              {/* Section: WAKTU */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Waktu & Tanggal
                </h3>

                {/* Date - Modern Picker */}
                <div className="space-y-2 mb-5">
                  <label className="text-sm font-semibold text-gray-700">Tanggal <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all" />
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Jam Mulai</label>
                    <div className="relative">
                      <input type="time" value={formData.time_start} onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all" />
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Jam Selesai</label>
                    <div className="relative">
                      <input type="time" value={formData.time_end} onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all" />
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section: LOKASI */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Lokasi & Kontak
                </h3>

                <div className="space-y-2 mb-5">
                  <label className="text-sm font-semibold text-gray-700">Tempat / Lokasi</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Masukkan lokasi kegiatan"
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Penanggung Jawab</label>
                    <input type="text" value={formData.pic_name} onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                      placeholder="Nama PIC"
                      className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nomor HP</label>
                    <input type="tel" value={formData.pic_phone} onChange={(e) => setFormData({ ...formData, pic_phone: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400" />
                  </div>
                </div>
              </section>

              {/* Section: KETERANGAN */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Keterangan
                </h3>

                <div className="space-y-2 mb-5">
                  <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Jelaskan detail agenda..."
                    rows={3}
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all resize-none placeholder:text-gray-400" />
                </div>

                {/* Status Toggle */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setFormData({ ...formData, status: "draft" })}
                      className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold border-2 transition-all ${
                        formData.status === "draft"
                          ? "border-indigo-500 text-white shadow-md"
                          : "border-gray-200 text-gray-600 bg-gray-50/50 hover:bg-gray-100"
                      }`}
                      style={formData.status === "draft" ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" } : {}}>
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Draft
                      </span>
                    </button>
                    <button type="button" onClick={() => setFormData({ ...formData, status: "published" })}
                      className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold border-2 transition-all ${
                        formData.status === "published"
                          ? "border-emerald-500 text-white shadow-md"
                          : "border-gray-200 text-gray-600 bg-gray-50/50 hover:bg-gray-100"
                      }`}
                      style={formData.status === "published" ? { background: "linear-gradient(135deg, #10b981, #059669)" } : {}}>
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Publish
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Bottom spacing for sticky button */}
              <div className="h-8" />
            </div>

            {/* Save Button - Sticky */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
              <button
                type="submit"
                disabled={submitting || !formData.title || !formData.date}
                onClick={handleSubmit}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{
                  background: submitting || !formData.title || !formData.date
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
                  boxShadow: submitting || !formData.title || !formData.date
                    ? 'none'
                    : '0 4px 16px rgba(37, 99, 235, 0.35)'
                }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Agenda
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slideUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Premium Header Accent */}
            <div className="relative">
              <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-500" />
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
            </div>
            <div className="px-5 py-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Agenda?</h3>
              <p className="text-sm text-gray-500 mb-8">Aksi ini tidak bisa dibatalkan dan data akan hilang permanen.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl text-base active:scale-[0.98] transition-all hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-4 rounded-2xl font-semibold text-base text-white shadow-lg active:scale-[0.98] transition-all"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    boxShadow: "0 4px 16px rgba(239, 68, 68, 0.35)"
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
        @media (min-width: 640px) {
          .animate-slideUp {
            animation: fadeIn 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
          }
        }
        /* Custom Scrollbar */
        .overscroll-contain::-webkit-scrollbar {
          width: 4px;
        }
        .overscroll-contain::-webkit-scrollbar-track {
          background: transparent;
        }
        .overscroll-contain::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
          border-radius: 4px;
        }
        .overscroll-contain::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.25);
        }
      `}</style>
    </div>
  );
}

export default function KegiatanPage() {
  return (
    <Suspense fallback={
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <KegiatanContent />
    </Suspense>
  );
}
