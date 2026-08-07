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

export default function UsulanPage() {
  const { data: session } = useSession();
  const [usulans, setUsulans] = useState<Usulan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUsulan, setSelectedUsulan] = useState<Usulan | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
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
        alert("Usulan disetujui!");
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
        alert("Usulan ditolak");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Disetujui" };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-700", label: "Ditolak" };
      default:
        return { bg: "bg-amber-100", text: "text-amber-700", label: "Menunggu" };
    }
  };

  const filteredUsulans = usulans;

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
            <h1 className="text-white text-xl font-bold">Usulan Kegiatan</h1>
            <p className="text-white/60 text-xs">Ajukan & kelola usulan</p>
          </div>
        </div>

        {/* Tab Navigation for Admin */}
        {isAdmin && (
          <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-1 flex gap-1">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === status
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {status === "all" ? "Semua" : status === "pending" ? "Menunggu" : status === "approved" ? "Disetujui" : "Ditolak"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Section - White Container */}
      <div className="-mt-3 px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredUsulans.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 font-medium">Belum ada usulan</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 text-indigo-600 text-sm font-semibold"
            >
              Ajukan sekarang
            </button>
          </div>
        ) : (
          filteredUsulans.map((usulan) => {
            const badge = getStatusBadge(usulan.status);
            return (
              <button
                key={usulan.id}
                onClick={() => setSelectedUsulan(usulan)}
                className="w-full text-left bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        usulan.jenis === "kegiatan" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {usulan.jenis === "kegiatan" ? "Kegiatan" : "Audiensi"}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{usulan.title}</h3>
                    {usulan.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{usulan.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      oleh {usulan.submitter_name} • {new Date(usulan.date_proposed).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Submit Form Modal - Centered */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div
            className="w-full sm:max-w-[390px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideDown"
            style={{ maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-4 pb-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Ajukan Usulan</h2>
                  <p className="text-xs text-gray-500">Formulir usulan kegiatan</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-6 space-y-5 overscroll-contain">
              {/* Section: JENIS */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Jenis Usulan</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setJenis("kegiatan")}
                    className={`py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                      jenis === "kegiatan"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md"
                        : "bg-gradient-to-br from-gray-50 to-slate-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Kegiatan
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenis("audiensi")}
                    className={`py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                      jenis === "audiensi"
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md"
                        : "bg-gradient-to-br from-gray-50 to-slate-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Audiensi
                    </span>
                  </button>
                </div>
              </section>

              {/* Section: DETAIL */}
              <section className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Judul Usulan</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masukkan judul kegiatan"
                    required
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan kegiatan yang diusulkan"
                    rows={3}
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all resize-none placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Lokasi <span className="text-xs font-normal text-gray-500">(opsional)</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Masukkan lokasi kegiatan"
                      className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all placeholder:text-gray-400 pl-11"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                </div>
              </section>
            </form>

            {/* Sticky Submit Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom)" }}>
              <button
                type="submit"
                disabled={submitting || !title}
                onClick={handleSubmit}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{
                  background: submitting || !title
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
                  boxShadow: submitting || !title
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
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Kirim Usulan
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - Centered */}
      {selectedUsulan && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedUsulan(null)}>
          <div
            className="w-full sm:max-w-[390px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideDown"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-4 pb-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Detail Usulan</h2>
                <p className="text-xs text-gray-500">Informasi lengkap usulan</p>
              </div>
              <button onClick={() => setSelectedUsulan(null)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 overscroll-contain">
              {/* Header */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedUsulan.jenis === "kegiatan" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                }`}>
                  {selectedUsulan.jenis === "kegiatan" ? "Kegiatan" : "Audiensi"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedUsulan.status).bg} ${getStatusBadge(selectedUsulan.status).text}`}>
                  {getStatusBadge(selectedUsulan.status).label}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900">{selectedUsulan.title}</h3>

              {selectedUsulan.description && (
                <div className="p-4 bg-gray-50/80 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                  <p className="text-gray-900">{selectedUsulan.description}</p>
                </div>
              )}

              {selectedUsulan.location && (
                <div className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lokasi</p>
                    <p className="font-semibold text-gray-900">{selectedUsulan.location}</p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50/80 rounded-2xl">
                <p className="text-xs text-gray-500">Diajukan oleh</p>
                <p className="font-semibold text-gray-900">{selectedUsulan.submitter_name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedUsulan.date_proposed).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {selectedUsulan.status === "rejected" && selectedUsulan.rejection_reason && (
                <div className="p-4 bg-red-50/80 rounded-2xl border border-red-100">
                  <p className="text-xs text-red-500 mb-1">Alasan Penolakan</p>
                  <p className="text-gray-900">{selectedUsulan.rejection_reason}</p>
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && selectedUsulan.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleApprove(selectedUsulan.id)}
                    className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
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
                    className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
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
      `}</style>
    </div>
  );
}
