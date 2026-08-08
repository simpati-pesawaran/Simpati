"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Usulan {
  id: string;
  title: string;
  description: string | null;
  jenis: "kegiatan" | "audiensi";
  location: string | null;
  category: string | null;
  date_proposed: string | null;
  time_proposed: string | null;
  submitter_name: string;
  submitter_phone: string | null;
  status: "pending" | "approved" | "rejected" | "rescheduled";
  rejection_reason: string | null;
  date_proposed_system: string;
  reviewed_at: string | null;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "bg-amber-50 border-amber-200", color: "text-amber-600", label: "Menunggu" },
  approved: { bg: "bg-emerald-50 border-emerald-200", color: "text-emerald-600", label: "Disetujui" },
  rejected: { bg: "bg-red-50 border-red-200", color: "text-red-600", label: "Ditolak" },
  rescheduled: { bg: "bg-blue-50 border-blue-200", color: "text-blue-600", label: "Dijadwalkan Ulang" },
};

const JENIS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  kegiatan: { bg: "bg-blue-100", color: "text-blue-700", label: "Kegiatan" },
  audiensi: { bg: "bg-purple-100", color: "text-purple-700", label: "Audiensi" },
};

export default function UsulanPage() {
  const { data: session } = useSession();
  const [usulans, setUsulans] = useState<Usulan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUsulan, setSelectedUsulan] = useState<Usulan | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  // Modal states
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState<{phone: string; message: string; link: string} | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jenis, setJenis] = useState<"kegiatan" | "audiensi">("kegiatan");
  const [location, setLocation] = useState("");

  const profile = (session?.user as any)?.profile;
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    fetchUsulans();
  }, [filterStatus, searchQuery]);

  const fetchUsulans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (!isAdmin) params.set("my", "true");
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/usulan?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsulans(data.data || []);
        setPendingCount(data.pending_count || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/usulan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, jenis, location }),
      });
      const data = await res.json();

      if (data.success) {
        setShowForm(false);
        setTitle("");
        setDescription("");
        setJenis("kegiatan");
        setLocation("");
        fetchUsulans();
        alert("Usulan berhasil diajukan!");
      } else {
        alert(data.error || "Gagal mengirim usulan");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/usulan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.whatsapp?.link) {
          setWhatsAppData(data.whatsapp);
          setShowWhatsAppModal(true);
        }
        setSelectedUsulan(null);
        fetchUsulans();
      } else {
        alert(data.error || "Gagal menyetujui usulan");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/usulan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      });
      const data = await res.json();
      if (data.success) {
        // Show WhatsApp modal
        if (data.whatsapp?.link) {
          setWhatsAppData(data.whatsapp);
          setShowWhatsAppModal(true);
        }
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedUsulan(null);
        fetchUsulans();
      } else {
        alert(data.error || "Gagal menolak usulan");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const handleReschedule = async () => {
    if (!selectedUsulan || !newDate) return;
    try {
      const res = await fetch(`/api/usulan/${selectedUsulan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          new_date: newDate,
          new_time: newTime,
          new_location: newLocation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.whatsapp?.link) {
          setWhatsAppData(data.whatsapp);
          setShowWhatsAppModal(true);
        }
        setShowRescheduleModal(false);
        setNewDate("");
        setNewTime("");
        setNewLocation("");
        setSelectedUsulan(null);
        fetchUsulans();
      } else {
        alert(data.error || "Gagal menjadwalkan ulang");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      const res = await fetch("/api/usulan/share");
      const data = await res.json();
      if (data.success && data.data?.whatsapp_link) {
        window.open(data.data.whatsapp_link, "_blank");
      }
    } catch (error) {
      alert("Gagal membuka WhatsApp");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Container */}
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
        {/* Header */}
        <div
          className="px-5 pt-4 pb-5"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="text-white text-xl font-bold">Usulan Kegiatan</h1>
              <p className="text-white/60 text-xs">Kelola usulan dari masyarakat</p>
            </div>
            {/* WhatsApp Share Button - Green Accent */}
            <button
              onClick={handleShareWhatsApp}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #25D366, #128C7E)",
              }}
              title="Bagikan ke WhatsApp"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.213 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
            {/* Add Usulan Button - Blue/Purple Accent */}
            <button
              onClick={() => setShowForm(true)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Spacer for breathing room */}
        <div className="h-4" />

        {/* Search Bar */}
        <div className="px-4">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari usulan..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 shadow-sm placeholder-gray-400"
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="h-5" />

        {/* List */}
        <div className="px-4 pb-28">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : usulans.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gray-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium text-base">Belum ada usulan</p>
            <p className="text-gray-300 text-sm mt-1.5">Ajukan usulan kegiatan baru</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-500/25"
            >
              Ajukan Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {usulans.map((usulan, index) => {
              const statusConfig = STATUS_CONFIG[usulan.status];
              const jenisConfig = JENIS_CONFIG[usulan.jenis];
              // NEW badge: if pending and within 24 hours
              const isNew = usulan.status === "pending" &&
                (Date.now() - new Date(usulan.date_proposed_system).getTime()) < 24 * 60 * 60 * 1000;

              return (
                <button
                  key={usulan.id}
                  onClick={() => setSelectedUsulan(usulan)}
                  className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100/50 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Tags Row */}
                      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${jenisConfig.bg} ${jenisConfig.color}`}>
                          {jenisConfig.label}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        {isNew && (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">{usulan.title}</h3>
                      {/* Description */}
                      {usulan.description && (
                        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{usulan.description}</p>
                      )}
                      {/* Meta Row */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-600 font-medium">{usulan.submitter_name}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(usulan.date_proposed_system).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </span>
                        {usulan.submitter_phone && (
                          <a
                            href={`https://wa.me/${usulan.submitter_phone.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.213 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Hubungi
                          </a>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Submit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[92vh] bg-white rounded-t-3xl shadow-2xl flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Ajukan Usulan
              </h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 active:scale-95 transition-all">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
              {/* Jenis */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Jenis</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenis("kegiatan")}
                    className={`py-4 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      jenis === "kegiatan"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Kegiatan
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenis("audiensi")}
                    className={`py-4 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      jenis === "audiensi"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Audiensi
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Judul Kegiatan</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul kegiatan"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Deskripsi <span className="text-xs font-normal text-gray-500">(opsional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan kegiatan yang diusulkan"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Lokasi <span className="text-xs font-normal text-gray-500">(opsional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Masukkan lokasi"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
              </div>

              <div className="h-20" />
            </form>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
              <button
                type="submit"
                disabled={submitting || !title}
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                style={{
                  background: submitting || !title ? "#94a3b8" : "linear-gradient(135deg, #2563eb, #7c3aed)",
                  boxShadow: submitting || !title ? "none" : "0 4px 20px rgba(99, 102, 241, 0.35)",
                }}
              >
                {submitting ? "Mengirim..." : "Kirim Usulan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedUsulan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedUsulan(null)}>
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
              <h2 className="text-lg font-bold text-gray-900">Detail Usulan</h2>
              <button onClick={() => setSelectedUsulan(null)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${JENIS_CONFIG[selectedUsulan.jenis].bg} ${JENIS_CONFIG[selectedUsulan.jenis].color}`}>
                  {JENIS_CONFIG[selectedUsulan.jenis].label}
                </span>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${STATUS_CONFIG[selectedUsulan.status].bg} ${STATUS_CONFIG[selectedUsulan.status].color}`}>
                  {STATUS_CONFIG[selectedUsulan.status].label}
                </span>
                {selectedUsulan.category && (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-gray-100 text-gray-600">
                    {selectedUsulan.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900">{selectedUsulan.title}</h3>

              {/* Submitter Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedUsulan.submitter_name}</p>
                    {selectedUsulan.submitter_phone && (
                      <a href={`https://wa.me/${selectedUsulan.submitter_phone.replace(/^0/, '62')}`} target="_blank" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.213 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {selectedUsulan.submitter_phone}
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Diajukan: {new Date(selectedUsulan.date_proposed_system).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              {/* Proposed Schedule */}
              {(selectedUsulan.date_proposed || selectedUsulan.time_proposed || selectedUsulan.location) && (
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-blue-600">Jadwal Yang Diusulkan</p>
                  {selectedUsulan.date_proposed && (
                    <p className="text-sm text-gray-700">📅 {new Date(selectedUsulan.date_proposed).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                  )}
                  {selectedUsulan.time_proposed && (
                    <p className="text-sm text-gray-700">🕐 {selectedUsulan.time_proposed}</p>
                  )}
                  {selectedUsulan.location && (
                    <p className="text-sm text-gray-700">📍 {selectedUsulan.location}</p>
                  )}
                </div>
              )}

              {/* Description */}
              {selectedUsulan.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Deskripsi</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedUsulan.description}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedUsulan.status === "rejected" && selectedUsulan.rejection_reason && (
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-600 mb-1">Alasan Penolakan</p>
                  <p className="text-sm text-gray-700">{selectedUsulan.rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Action Buttons - Admin Only */}
            {isAdmin && selectedUsulan.status === "pending" && (
              <div className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleApprove(selectedUsulan.id)}
                    className="py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-1 active:scale-[0.98] transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Setuju
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="py-3 rounded-xl bg-red-500 text-white font-semibold text-sm flex items-center justify-center gap-1 active:scale-[0.98] transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Tolak
                  </button>
                  <button
                    onClick={() => setShowRescheduleModal(true)}
                    className="py-3 rounded-xl bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-1 active:scale-[0.98] transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Jadwal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedUsulan && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tolak Usulan?</h3>
              <p className="text-sm text-gray-500 mb-4">Berikan alasan penolakan untuk pengusul.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Mengingat keterbatasan anggaran..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={() => handleReject(selectedUsulan.id, rejectReason)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">
                  Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedUsulan && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowRescheduleModal(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Jadwalkan Ulang</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Baru</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Waktu Baru</label>
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi</label>
                <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Masukkan lokasi baru" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
              </div>
              <button onClick={handleReschedule} disabled={!newDate} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50">
                Simpan & Kirim Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Notification Modal */}
      {showWhatsAppModal && whatsAppData && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowWhatsAppModal(false); setWhatsAppData(null); }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.213 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Kirim Notifikasi WhatsApp</h3>
              <p className="text-sm text-gray-500 mb-4">Kirim notifikasi keputusan kepada pengusul via WhatsApp.</p>
              <div className="bg-gray-50 rounded-xl p-3 text-left mb-4">
                <p className="text-xs text-gray-500 mb-1">Pesan:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{whatsAppData.message}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowWhatsAppModal(false); setWhatsAppData(null); }} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold">
                  Nanti
                </button>
                <a href={whatsAppData.link} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-center">
                  Kirim via WhatsApp
                </a>
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
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </div>
  );
}
