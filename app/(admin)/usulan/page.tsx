"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Usulan Kegiatan</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajukan
          </button>
        </div>

        {/* Filter tabs for admin */}
        {isAdmin && (
          <div className="flex gap-2 mt-4">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterStatus === status
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {status === "all" ? "Semua" : status === "pending" ? "Menunggu" : status === "approved" ? "Disetujui" : "Ditolak"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredUsulans.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">Belum ada usulan</p>
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
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{usulan.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
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

      {/* Submit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Ajukan Usulan</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-4">
              {/* Jenis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenis("kegiatan")}
                    className={`py-3 rounded-xl text-sm font-semibold transition ${
                      jenis === "kegiatan"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Kegiatan
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenis("audiensi")}
                    className={`py-3 rounded-xl text-sm font-semibold transition ${
                      jenis === "audiensi"
                        ? "bg-purple-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Audiensi
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul Usulan</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul kegiatan"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan kegiatan yang diusulkan"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi (opsional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Masukkan lokasi kegiatan"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !title}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mengirim...
                  </>
                ) : (
                  "Kirim Usulan"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedUsulan && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSelectedUsulan(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Detail Usulan</h2>
                <button onClick={() => setSelectedUsulan(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-5 pb-8 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  selectedUsulan.jenis === "kegiatan" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                }`}>
                  {selectedUsulan.jenis === "kegiatan" ? "Kegiatan" : "Audiensi"}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedUsulan.status).bg} ${getStatusBadge(selectedUsulan.status).text}`}>
                  {getStatusBadge(selectedUsulan.status).label}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900">{selectedUsulan.title}</h3>

              {selectedUsulan.description && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Deskripsi</p>
                  <p className="text-gray-900">{selectedUsulan.description}</p>
                </div>
              )}

              {selectedUsulan.location && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lokasi</p>
                    <p className="font-semibold text-gray-900">{selectedUsulan.location}</p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Diajukan oleh</p>
                <p className="font-semibold text-gray-900">{selectedUsulan.submitter_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(selectedUsulan.date_proposed).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {selectedUsulan.status === "rejected" && selectedUsulan.rejection_reason && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-xs text-red-500 mb-1">Alasan Penolakan</p>
                  <p className="text-gray-900">{selectedUsulan.rejection_reason}</p>
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && selectedUsulan.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleApprove(selectedUsulan.id)}
                    className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
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
                    className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
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
