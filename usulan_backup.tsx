"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Usulan {
  id: string;
  title: string;
  description: string | null;
  jenis: "kegiatan" | "audiensi";
  date_proposed: string;
  location: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_by: string;
  submitter_name: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "bg-amber-50 border-amber-200", color: "text-amber-600", label: "Menunggu" },
  approved: { bg: "bg-emerald-50 border-emerald-200", color: "text-emerald-600", label: "Disetujui" },
  rejected: { bg: "bg-red-50 border-red-200", color: "text-red-600", label: "Ditolak" },
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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jenis, setJenis] = useState<"kegiatan" | "audiensi">("kegiatan");
  const [location, setLocation] = useState("");

  const profile = (session?.user as any)?.profile;
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    fetchUsulans();
  }, [filterStatus]);

  const fetchUsulans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (!isAdmin) params.set("my", "true");

      const res = await fetch(`/api/usulan?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsulans(data.data || []);
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
      const res = await fetch(`/api/usulan?id=${id}&action=approve`, { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        fetchUsulans();
        setSelectedUsulan(null);
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/usulan?id=${id}&action=reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsulans();
        setSelectedUsulan(null);
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const pendingCount = usulans.filter((u) => u.status === "pending").length;

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
            <h1 className="text-white text-xl font-bold">Usulan Kegiatan</h1>
            <p className="text-white/60 text-xs">Ajukan & kelola usulan kegiatan</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      {isAdmin && (
        <div className="px-4 -mt-4 mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-1.5 flex gap-1">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {status === "all" ? "Semua" : status === "pending" ? "Menunggu" : status === "approved" ? "Disetujui" : "Ditolak"}
                {status === "pending" && pendingCount > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === status ? "bg-white/30" : "bg-amber-100 text-amber-600"}`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : usulans.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Belum ada usulan</p>
            <p className="text-gray-400 text-sm mt-1">Ajukan usulan kegiatan baru</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all"
            >
              Ajukan Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {usulans.map((usulan) => {
              const statusConfig = STATUS_CONFIG[usulan.status];
              const jenisConfig = JENIS_CONFIG[usulan.jenis];

              return (
                <button
                  key={usulan.id}
                  onClick={() => setSelectedUsulan(usulan)}
                  className="w-full text-left bg-white rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${jenisConfig.bg} ${jenisConfig.color}`}>
                          {jenisConfig.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{usulan.title}</h3>
                      {usulan.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{usulan.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {usulan.submitter_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(usulan.date_proposed)}
                        </span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}
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
        <div className="fixed inset-0 z-50" onClick={() => setSelectedUsulan(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-3xl shadow-2xl flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Detail Usulan</h2>
              <button onClick={() => setSelectedUsulan(null)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 active:scale-95 transition-all">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
              {/* Status Badges */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${JENIS_CONFIG[selectedUsulan.jenis].bg} ${JENIS_CONFIG[selectedUsulan.jenis].color}`}>
                  {JENIS_CONFIG[selectedUsulan.jenis].label}
                </span>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${STATUS_CONFIG[selectedUsulan.status].bg} ${STATUS_CONFIG[selectedUsulan.status].color}`}>
                  {STATUS_CONFIG[selectedUsulan.status].label}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900">{selectedUsulan.title}</h3>

              {selectedUsulan.description && (
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs text-gray-500 font-medium mb-1">Deskripsi</p>
                  <p className="text-gray-900">{selectedUsulan.description}</p>
                </div>
              )}

              {selectedUsulan.location && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lokasi</p>
                    <p className="font-semibold text-gray-900">{selectedUsulan.location}</p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Diajukan oleh</p>
                    <p className="font-semibold text-gray-900">{selectedUsulan.submitter_name}</p>
                    <p className="text-sm text-gray-500">{formatDate(selectedUsulan.date_proposed)}</p>
                  </div>
                </div>
              </div>

              {selectedUsulan.status === "rejected" && selectedUsulan.rejection_reason && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-xs text-red-500 font-bold mb-1">Alasan Penolakan</p>
                  <p className="text-gray-900">{selectedUsulan.rejection_reason}</p>
                </div>
              )}

              {isAdmin && selectedUsulan.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleApprove(selectedUsulan.id)}
                    className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Setujui
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt("Alasan penolakan:");
                      if (reason) handleReject(selectedUsulan.id, reason);
                    }}
                    className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Tolak
                  </button>
                </div>
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
    </div>
  );
}
