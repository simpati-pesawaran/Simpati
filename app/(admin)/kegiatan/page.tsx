"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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
  { value: "event", label: "Event" },
  { value: "kunjungan", label: "Kunjungan" },
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

export default function KegiatanPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"kegiatan" | "audiensi">("kegiatan");
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetail, setShowDetail] = useState<Agenda | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const profile = (session?.user as any)?.profile;
  const isSuperadmin = profile?.role === "superadmin";

  const subJenisOptions = activeTab === "kegiatan" ? SUB_JENIS_KEGIATAN : SUB_JENIS_AUDIENSI;

  useEffect(() => { fetchAgendas(); }, [activeTab]);

  const fetchAgendas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ jenis: activeTab, limit: "50" });
      if (searchQuery) params.append("search", searchQuery);
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

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      <div className="px-5 py-4" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)" }}>
        <h1 className="text-white text-xl font-bold">{activeTab === "kegiatan" ? "Kegiatan" : "Audiensi"}</h1>
        <p className="text-white/60 text-sm mt-1">{agendas.length} {activeTab}</p>
      </div>

      <div className="px-5 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex gap-1">
          <button onClick={() => setActiveTab("kegiatan")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${activeTab === "kegiatan" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"}`}>
            Kegiatan
          </button>
          <button onClick={() => setActiveTab("audiensi")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${activeTab === "audiensi" ? "border-purple-500 text-purple-600" : "border-transparent text-gray-500"}`}>
            Audiensi
          </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); fetchAgendas(); }} className="p-4 bg-white">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari agenda..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </form>

      <div className="px-4 pb-24 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 text-sm mt-3">Memuat...</p>
          </div>
        ) : agendas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-semibold">Belum ada {activeTab}</h3>
            <p className="text-gray-500 text-sm mt-1">Tekan + untuk menambah</p>
          </div>
        ) : agendas.map((agenda) => (
          <button key={agenda.id} onClick={() => setShowDetail(agenda)}
            className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition active:scale-[0.98] ${activeTab === "kegiatan" ? "border-blue-100 hover:border-blue-300" : "border-purple-100 hover:border-purple-300"}`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-14 h-16 rounded-xl flex flex-col items-center justify-center ${activeTab === "kegiatan" ? "bg-gradient-to-br from-blue-500 to-indigo-500" : "bg-gradient-to-br from-purple-500 to-pink-500"}`}>
                <span className="text-white/80 text-[10px] font-semibold uppercase">{new Date(agenda.date).toLocaleDateString("id-ID", { weekday: "short" })}</span>
                <span className="text-white text-xl font-bold">{new Date(agenda.date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{agenda.title}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-500">{formatTime(agenda.time_start)} - {formatTime(agenda.time_end)}</span>
                </div>
                {agenda.location && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-sm text-gray-500 line-clamp-1">{agenda.location}</span>
                  </div>
                )}
              </div>
              <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${agenda.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {agenda.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
          </button>
        ))}
      </div>

      <button onClick={() => handleOpenModal()}
        className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center active:scale-95 transition-transform z-20">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {showDetail && (
        <div className="fixed inset-0 z-50" onClick={() => setShowDetail(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-[28px] shadow-2xl flex flex-col animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${showDetail.jenis === "kegiatan" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                  {showDetail.jenis === "kegiatan" ? "Kegiatan" : "Audiensi"}
                </span>
                <h2 className="text-lg font-bold text-gray-900">{showDetail.title}</h2>
              </div>
              <button onClick={() => setShowDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${showDetail.jenis === "kegiatan" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tanggal & Waktu</p>
                  <p className="font-semibold text-gray-900">{formatDate(showDetail.date)}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{formatTime(showDetail.time_start)} - {formatTime(showDetail.time_end)}</p>
                </div>
              </div>
              {showDetail.location && (
                <div className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lokasi</p>
                    <p className="font-semibold text-gray-900">{showDetail.location}</p>
                  </div>
                </div>
              )}
              {showDetail.pic_name && (
                <div className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Penanggung Jawab</p>
                    <p className="font-semibold text-gray-900">{showDetail.pic_name}</p>
                    {showDetail.pic_phone && <a href={`tel:${showDetail.pic_phone}`} className="text-sm text-indigo-600">{showDetail.pic_phone}</a>}
                  </div>
                </div>
              )}
              {showDetail.description && (
                <div className="p-4 bg-gray-50/80 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                  <p className="text-sm text-gray-700">{showDetail.description}</p>
                </div>
              )}
              {showDetail.participants_count && (
                <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-2xl">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-sm text-gray-500">Peserta:</span>
                  <span className="text-sm font-semibold text-gray-900">{showDetail.participants_count} orang</span>
                </div>
              )}
              {showDetail.dresscode && (
                <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-2xl">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                  <span className="text-sm text-gray-500">Dresscode:</span>
                  <span className="text-sm font-semibold text-gray-900">{showDetail.dresscode}</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-2xl">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${showDetail.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{showDetail.status === "published" ? "Published" : "Draft"}</span>
              </div>
              {showDetail.creator && <p className="text-xs text-gray-400 text-center">Dibuat oleh {showDetail.creator.name}</p>}
              <div className="flex gap-3 pt-4">
                <button onClick={() => handleOpenModal(showDetail)} className="flex-1 py-4 bg-indigo-600 text-white font-semibold rounded-2xl text-sm shadow-lg active:scale-[0.98] transition-transform">Edit</button>
                {(isSuperadmin || profile?.id === showDetail.created_by) && (
                  <button onClick={() => setShowDeleteConfirm(showDetail.id)} className="px-4 py-4 border-2 border-red-200 text-red-600 font-semibold rounded-2xl text-sm hover:bg-red-50 active:scale-[0.98] transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50" onClick={() => setShowModal(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />

          {/* Bottom Sheet */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[92vh] bg-white rounded-t-[28px] shadow-2xl flex flex-col animate-slideUp" onClick={(e) => e.stopPropagation()}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header - Sticky */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {editingId ? "Edit" : "Tambah"} {activeTab === "kegiatan" ? "Kegiatan" : "Audiensi"}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">

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
                  <label className="text-sm font-semibold text-gray-800">Judul Agenda</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masukkan judul agenda"
                    className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-gray-500" />
                </div>

                {/* Sub Jenis - Select */}
                <div className="space-y-2 mb-5">
                  <label className="text-sm font-semibold text-gray-800">Sub Jenis</label>
                  <div className="relative">
                    <select value={formData.sub_jenis} onChange={(e) => setFormData({ ...formData, sub_jenis: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                      <option value="">Pilih Sub Jenis</option>
                      {subJenisOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Custom Sub Jenis - Conditional */}
                {formData.sub_jenis === "lainnya" && (
                  <div className="space-y-2 mb-5 animate-fadeIn">
                    <label className="text-sm font-semibold text-gray-800">Nama Sub Jenis <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Masukkan nama sub jenis"
                      className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-gray-500" />
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
                  <label className="text-sm font-semibold text-gray-800">Tanggal</label>
                  <div className="relative">
                    <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-800">Jam Mulai</label>
                    <div className="relative">
                      <input type="time" value={formData.time_start} onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-800">Jam Selesai</label>
                    <div className="relative">
                      <input type="time" value={formData.time_end} onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <label className="text-sm font-semibold text-gray-800">Tempat / Lokasi</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Masukkan lokasi kegiatan"
                    className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-gray-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-800">Penanggung Jawab</label>
                    <input type="text" value={formData.pic_name} onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                      placeholder="Nama PIC"
                      className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-800">Nomor HP</label>
                    <input type="tel" value={formData.pic_phone} onChange={(e) => setFormData({ ...formData, pic_phone: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-gray-500" />
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
                  <label className="text-sm font-semibold text-gray-800">Deskripsi</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Jelaskan detail agenda..."
                    rows={3}
                    className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none placeholder:text-gray-500" />
                </div>

                {/* Status Toggle */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-800">Status</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setFormData({ ...formData, status: "draft" })}
                      className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold border-2 transition-all ${
                        formData.status === "draft"
                          ? "border-yellow-400 bg-yellow-50 text-yellow-800 shadow-sm"
                          : "border-gray-300 text-gray-600 bg-gray-50/50"
                      }`}>
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
                          ? "border-green-400 bg-green-50 text-green-800 shadow-sm"
                          : "border-gray-300 text-gray-600 bg-gray-50/50"
                      }`}>
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
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
              <button
                type="submit"
                disabled={submitting || !formData.title || !formData.date}
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-semibold text-base text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{
                  background: submitting || !formData.title || !formData.date
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
                  boxShadow: submitting || !formData.title || !formData.date
                    ? 'none'
                    : '0 4px 20px rgba(37, 99, 235, 0.35)'
                }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="fixed inset-0 z-[60]" onClick={() => setShowDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-5 py-6 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Agenda?</h3>
              <p className="text-sm text-gray-500 mb-8">Aksi ini tidak bisa dibatalkan dan data akan hilang permanen.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl text-base active:scale-[0.98] transition-transform">Batal</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-4 bg-red-600 text-white font-semibold rounded-2xl text-base shadow-lg active:scale-[0.98] transition-transform">Hapus</button>
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
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
