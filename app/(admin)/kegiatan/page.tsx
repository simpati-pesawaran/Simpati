"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Agenda {
  id: string;
  jenis: string;
  title: string;
  description: string | null;
  date: string;
  time_start: string;
  time_end: string;
  location: string | null;
  status: string;
  created_by?: string;
  creator?: { id: string; name: string; };
}

interface FormData {
  jenis: "kegiatan" | "audiensi";
  title: string;
  description: string;
  date: string;
  time_start: string;
  time_end: string;
  location: string;
  status: "draft" | "published";
}

const initialFormData: FormData = {
  jenis: "kegiatan",
  title: "",
  description: "",
  date: "",
  time_start: "09:00",
  time_end: "10:00",
  location: "",
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
  const [showSyncMenu, setShowSyncMenu] = useState(false);
  const [syncingType, setSyncingType] = useState<'agenda' | 'usulan' | null>(null);

  // WhatsApp Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareJenis, setShareJenis] = useState<'kegiatan' | 'audiensi' | 'all'>('all');
  const [shareDateOption, setShareDateOption] = useState<'today' | 'tomorrow' | 'week' | 'custom'>('today');
  const [shareCustomDate, setShareCustomDate] = useState("");
  const [shareEndDate, setShareEndDate] = useState("");
  const [shareDateRange, setShareDateRange] = useState(false);
  const [previewAgendas, setPreviewAgendas] = useState<Agenda[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<{url: string, token: string} | null>(null);

  // Close sync menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSyncMenu) {
        const target = e.target as HTMLElement;
        if (!target.closest('.sync-menu')) {
          setShowSyncMenu(false);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSyncMenu]);

  const profile = (session?.user as any)?.profile;
  const isSuperadmin = profile?.role === "superadmin";

  // Sync handler
  const handleSync = async (type: 'agenda' | 'usulan') => {
    setSyncingType(type);
    setShowSyncMenu(false);
    setSyncMessage(null);

    try {
      const res = await fetch(`/api/sheets?sheet=${type}`, { method: "POST" });
      const data = await res.json();

      if (data.success) {
        const results = Object.entries(data.results || {})
          .map(([name, r]: [string, any]) => r.message || `${name}: OK`)
          .join(". ");
        setSyncMessage({ type: "success", text: results || "Sinkronisasi berhasil" });
      } else {
        const errorMsg = data.results?.[type]?.error || data.error || "Gagal sinkronisasi";
        setSyncMessage({ type: "error", text: errorMsg });
      }
    } catch (error) {
      setSyncMessage({ type: "error", text: "Terjadi kesalahan saat sinkronisasi" });
    } finally {
      setSyncingType(null);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

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

  // Open modal when ?action=new with jenis param
  useEffect(() => {
    const action = searchParams?.get("action");
    const jenis = searchParams?.get("jenis") as "kegiatan" | "audiensi" | null;

    if (action === "new") {
      // Set active tab based on jenis param if provided
      if (jenis === "kegiatan" || jenis === "audiensi") {
        setActiveTab(jenis);
      }
      // Small delay to ensure tab is set first
      setTimeout(() => handleOpenModal(), 100);
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
        title: agenda.title,
        description: agenda.description || "",
        date: agenda.date,
        time_start: agenda.time_start,
        time_end: agenda.time_end,
        location: agenda.location || "",
        status: agenda.status as "draft" | "published",
      });
    } else {
      setEditingId(null);
      setFormData({ ...initialFormData, jenis: activeTab as "kegiatan" | "audiensi" });
    }
    setShowModal(true);
    setShowDetail(null);
  };

  // Time Conflict Check
  const checkTimeConflict = (): Agenda | null => {
    if (!formData.date || !formData.time_start || !formData.time_end) return null;

    // Check against existing agendas
    const conflicts = agendas.filter(agenda => {
      if (editingId && agenda.id === editingId) return false; // Skip self when editing
      if (agenda.date !== formData.date) return false;

      const existStart = agenda.time_start;
      const existEnd = agenda.time_end;
      const newStart = formData.time_start;
      const newEnd = formData.time_end;

      // Check if times overlap
      // (newStart < existEnd) AND (newEnd > existStart)
      return (newStart < existEnd) && (newEnd > existStart);
    });

    return conflicts.length > 0 ? conflicts[0] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      alert("Judul dan tanggal wajib diisi");
      return;
    }

    // Check for time conflict
    const conflict = checkTimeConflict();
    if (conflict) {
      const confirmSave = confirm(
        `⚠️ Jadwal tabrakan dengan:\n\n"${conflict.title}"\n🕐 ${conflict.time_start} - ${conflict.time_end}\n\nTetap simpan?`
      );
      if (!confirmSave) return;
    }

    setSubmitting(true);
    try {
      const payload = {
        jenis: formData.jenis,
        title: formData.title,
        description: formData.description || null,
        date: formData.date,
        time_start: formData.time_start,
        time_end: formData.time_end,
        location: formData.location || null,
        status: formData.status,
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

  // WhatsApp Share Functions
  const getDateRange = () => {
    const today = new Date();
    // Use local timezone (WIB/UTC+7)
    const formatDateStr = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (shareDateOption === 'today') {
      return { start: formatDateStr(today), end: formatDateStr(today) };
    } else if (shareDateOption === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { start: formatDateStr(tomorrow), end: formatDateStr(tomorrow) };
    } else if (shareDateOption === 'week') {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return { start: formatDateStr(today), end: formatDateStr(weekEnd) };
    } else {
      return { start: shareCustomDate, end: shareEndDate || shareCustomDate };
    }
  };

  const loadPreviewAgendas = async () => {
    setLoadingPreview(true);
    try {
      const { start, end } = getDateRange();
      const params = new URLSearchParams({
        startDate: start,
        endDate: end,
      });
      if (shareJenis !== 'all') params.set('jenis', shareJenis);

      const res = await fetch(`/api/agenda?${params}`);
      const data = await res.json();
      if (data.success) {
        setPreviewAgendas(data.data || []);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCreateShare = async () => {
    setShareLoading(true);
    try {
      const { start, end } = getDateRange();
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis: shareJenis,
          startDate: start,
          endDate: end,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShareSuccess({ url: data.url, token: data.token });
      } else {
        alert(data.error || 'Gagal membuat link');
      }
    } catch {
      alert('Terjadi kesalahan');
    } finally {
      setShareLoading(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!shareSuccess) return;
    const greeting = `📅 *Jadwal Agenda SIMPATI*\n\nBerikut jadwal agenda yang bisa dilihat:\n\n`;
    const agendaList = previewAgendas.slice(0, 5).map((a, i) =>
      `${i + 1}. *${a.title}*\n   📆 ${new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}\n   🕐 ${formatTime(a.time_start)} - ${formatTime(a.time_end)}\n   📍 ${a.location || '-'}`
    ).join('\n\n');
    const moreText = previewAgendas.length > 5 ? '\n\n...dan lainnya' : '';
    const footer = `\n\n🔗 Lihat selengkapnya:\n${shareSuccess.url}\n\n_Semoga bermanfaat!_`;

    const message = greeting + agendaList + moreText + footer;

    // Use WhatsApp API URL with pre-filled message
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyLink = () => {
    if (shareSuccess) {
      navigator.clipboard.writeText(shareSuccess.url);
      alert('Link berhasil disalin!');
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

          {/* Action Buttons Group */}
          <div className="ml-auto flex items-center gap-2">
            {/* WhatsApp Share Button */}
            <button
              onClick={() => {
                setShowShareModal(true);
                setShareSuccess(null);
                loadPreviewAgendas();
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
              }}
              title="Bagikan ke WhatsApp"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>

            {/* Sync Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSyncMenu(!showSyncMenu)}
                disabled={syncingType !== null}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
                title="Sync ke Google Sheets"
              >
                {syncingType ? (
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

            {/* Dropdown Menu */}
            {showSyncMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 sync-menu">
                <button
                  onClick={() => handleSync('agenda')}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                  Sinkron Agenda
                </button>
                <button
                  onClick={() => handleSync('usulan')}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                  </svg>
                  Sinkron Usulan
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <a
                  href="https://docs.google.com/spreadsheets/d/1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 text-left text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                  Buka Spreadsheet
                </a>
              </div>
            )}
          </div>
          </div>
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
        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDetail(null)}>
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

              {/* Footer */}

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
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(showDetail.id)}
                  className="px-4 py-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <Link href={`/agenda/${showDetail.id}`} className="flex-1 py-3 text-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all">
                  Lihat Detail
                </Link>
                <button onClick={() => { setShowDetail(null); setTimeout(() => handleOpenModal(showDetail), 100); }}
                  className="px-4 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowModal(false)}>
          <div
            className="w-full sm:max-w-[390px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex-shrink-0">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: activeTab === "kegiatan"
                        ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                        : "linear-gradient(135deg, #8b5cf6, #ec4899)",
                    }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      {editingId ? "Edit" : "Tambah"} Agenda
                    </h2>
                    <p className="text-xs text-gray-500">{activeTab === "kegiatan" ? "Kegiatan" : "Audiensi"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content - Scrollable */}
            <form id="agenda-form" onSubmit={(e) => handleSubmit(e)} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain" style={{ WebkitOverflowScrolling: "touch", paddingBottom: "80px" }}>

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
                  Lokasi
                </h3>

                <div className="space-y-2 mb-5">
                  <label className="text-sm font-semibold text-gray-700">Tempat / Lokasi</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Masukkan lokasi kegiatan"
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400" />
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
              <div className="h-20" />
            </form>

            {/* Save Button - Fixed at bottom */}
            <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 pb-safe">
              <button
                type="button"
                onClick={(e) => {
                  const form = document.getElementById('agenda-form');
                  if (form) {
                    const event = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(event);
                  }
                }}
                disabled={submitting || !formData.title || !formData.date}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{
                  background: submitting || !formData.title || !formData.date
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
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
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
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
        /* Safe area padding for mobile */
        .pb-safe {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>

      {/* WhatsApp Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 pb-16 sm:pb-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp"
            style={{ maxHeight: "60vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#25D366" }}>
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Bagikan Agenda</h2>
                  <p className="text-xs text-gray-500">via WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-all"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 overscroll-contain" style={{ WebkitOverflowScrolling: "touch", maxHeight: "calc(60vh - 80px)" }}>

              {/* Jenis Selection */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Pilih Jenis Agenda</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "kegiatan", label: "📌 Kegiatan", color: "blue" },
                    { value: "audiensi", label: "🎭 Audiensi", color: "purple" },
                    { value: "all", label: "📋 Semua", color: "gray" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setShareJenis(opt.value as any);
                        setTimeout(() => loadPreviewAgendas(), 100);
                      }}
                      className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all border-2 ${
                        shareJenis === opt.value
                          ? opt.color === "blue"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : opt.color === "purple"
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-500 bg-gray-100 text-gray-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Pilih Tanggal</label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setShareDateOption("today");
                        setShareDateRange(false);
                        setTimeout(() => loadPreviewAgendas(), 100);
                      }}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border-2 ${
                        shareDateOption === "today" && !shareDateRange
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      📅 Hari Ini
                    </button>
                    <button
                      onClick={() => {
                        setShareDateOption("tomorrow");
                        setShareDateRange(false);
                        setTimeout(() => loadPreviewAgendas(), 100);
                      }}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border-2 ${
                        shareDateOption === "tomorrow" && !shareDateRange
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      📅 Besok
                    </button>
                  </div>

                  {/* Custom Date Toggle */}
                  <button
                    onClick={() => {
                      setShareDateOption("custom");
                      setShareDateRange(!shareDateRange);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all border-2 ${
                      shareDateOption === "custom" || shareDateRange
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    📅 Pilih Tanggal Sendiri
                  </button>

                  {/* Date Pickers */}
                  {(shareDateOption === "custom" || shareDateRange) && (
                    <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Dari Tanggal</label>
                        <input
                          type="date"
                          value={shareCustomDate}
                          onChange={(e) => {
                            setShareCustomDate(e.target.value);
                            setShareDateOption("custom");
                            setTimeout(() => loadPreviewAgendas(), 100);
                          }}
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Sampai Tanggal</label>
                        <input
                          type="date"
                          value={shareEndDate}
                          onChange={(e) => {
                            setShareEndDate(e.target.value);
                            setShareDateRange(true);
                            setTimeout(() => loadPreviewAgendas(), 100);
                          }}
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Preview Jadwal
                  <span className="text-gray-400 font-normal ml-1">({previewAgendas.length} agenda)</span>
                </label>
                <div className="bg-gray-50 rounded-xl p-3 max-h-48 overflow-y-auto">
                  {loadingPreview ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : previewAgendas.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Tidak ada agenda</p>
                  ) : (
                    previewAgendas.map((agenda) => (
                      <div key={agenda.id} className="py-2 border-b border-gray-100 last:border-0">
                        <p className="text-sm font-medium text-gray-800">{agenda.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(agenda.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} | {formatTime(agenda.time_start)} - {formatTime(agenda.time_end)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Success State */}
              {shareSuccess && (
                <div className="bg-emerald-50 rounded-xl p-4 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-emerald-700">Link Berhasil Dibuat!</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 break-all">
                    <p className="text-xs text-gray-500 mb-1">Share Link:</p>
                    <p className="text-xs text-indigo-600 font-mono">{shareSuccess.url}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              {!shareSuccess ? (
                <button
                  onClick={handleCreateShare}
                  disabled={shareLoading || previewAgendas.length === 0}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{
                    background: shareLoading || previewAgendas.length === 0
                      ? "#9ca3af"
                      : "linear-gradient(135deg, #25D366, #128C7E)",
                    boxShadow: "0 4px 16px rgba(37, 211, 102, 0.35)"
                  }}
                >
                  {shareLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Membuat Link...
                    </>
                  ) : previewAgendas.length === 0 ? (
                    "Tidak Ada Agenda"
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Bagikan ke WhatsApp
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #25D366, #128C7E)",
                    boxShadow: "0 4px 16px rgba(37, 211, 102, 0.35)"
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Kirim ke WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
