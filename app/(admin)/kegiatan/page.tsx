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
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowDetail(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${showDetail.jenis === "kegiatan" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                    {showDetail.jenis === "kegiatan" ? "Kegiatan" : "Audiensi"}{showDetail.sub_jenis && ` - ${showDetail.sub_jenis}`}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">{showDetail.title}</h2>
                </div>
                <button onClick={() => setShowDetail(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-5 pb-8 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${showDetail.jenis === "kegiatan" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tanggal & Waktu</p>
                  <p className="font-semibold text-gray-900">{formatDate(showDetail.date)}</p>
                  <p className="text-sm text-gray-600">{formatTime(showDetail.time_start)} - {formatTime(showDetail.time_end)}</p>
                </div>
              </div>
              {showDetail.location && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  </div>
                  <div><p className="text-xs text-gray-500">Lokasi</p><p className="font-semibold text-gray-900">{showDetail.location}</p></div>
                </div>
              )}
              {showDetail.pic_name && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div><p className="text-xs text-gray-500">Penanggung Jawab</p><p className="font-semibold text-gray-900">{showDetail.pic_name}</p>{showDetail.pic_phone && <a href={`tel:${showDetail.pic_phone}`} className="text-sm text-indigo-600">{showDetail.pic_phone}</a>}</div>
                </div>
              )}
              {showDetail.description && <div className="p-4 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500 mb-1">Deskripsi</p><p className="text-sm text-gray-700">{showDetail.description}</p></div>}
              {showDetail.participants_count && <div className="flex items-center gap-2"><span className="text-sm text-gray-500">Peserta:</span><span className="text-sm font-semibold text-gray-900">{showDetail.participants_count} orang</span></div>}
              {showDetail.dresscode && <div className="flex items-center gap-2"><span className="text-sm text-gray-500">Dresscode:</span><span className="text-sm font-semibold text-gray-900">{showDetail.dresscode}</span></div>}
              <div className="flex items-center gap-2"><span className="text-sm text-gray-500">Status:</span><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${showDetail.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{showDetail.status === "published" ? "Published" : "Draft"}</span></div>
              {showDetail.creator && <p className="text-xs text-gray-400">Dibuat oleh {showDetail.creator.name}</p>}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => handleOpenModal(showDetail)} className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl text-sm active:scale-[0.98] transition">Edit</button>
                {(isSuperadmin || profile?.id === showDetail.created_by) && (
                  <button onClick={() => setShowDeleteConfirm(showDetail.id)} className="px-4 py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100 z-10">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{editingId ? "Edit" : "Tambah"} {activeTab === "kegiatan" ? "Kegiatan" : "Audiensi"}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-4">
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sub Jenis *</label>
                <div className="grid grid-cols-3 gap-2">
                  {subJenisOptions.map((opt) => (
                    <button type="button" key={opt.value}
                      onClick={() => setFormData({ ...formData, sub_jenis: opt.value })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition ${formData.sub_jenis === opt.value ? (activeTab === "kegiatan" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-purple-500 bg-purple-50 text-purple-700") : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Agenda *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan judul agenda" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal *</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Mulai</label>
                  <input type="time" value={formData.time_start} onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Selesai</label>
                  <input type="time" value={formData.time_end} onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Masukkan lokasi"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Penanggung Jawab</label>
                  <input type="text" value={formData.pic_name} onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                    placeholder="Nama PIC"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">No. Telepon PIC</label>
                  <input type="tel" value={formData.pic_phone} onChange={(e) => setFormData({ ...formData, pic_phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah Peserta</label>
                  <input type="number" value={formData.participants_count} onChange={(e) => setFormData({ ...formData, participants_count: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Dresscode</label>
                  <input type="text" value={formData.dresscode} onChange={(e) => setFormData({ ...formData, dresscode: e.target.value })}
                    placeholder="cth: Batik"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan deskripsi agenda"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setFormData({ ...formData, status: "draft" })}
                    className={`py-3 px-4 rounded-xl text-sm font-medium border-2 transition ${formData.status === "draft" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600"}`}>
                    Draft
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, status: "published" })}
                    className={`py-3 px-4 rounded-xl text-sm font-medium border-2 transition ${formData.status === "published" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"}`}>
                    Published
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 pb-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm">
                  Batal
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50">
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Hapus Agenda?</h3>
            <p className="text-sm text-gray-500 text-center mt-2">Aksi ini tidak bisa dibatalkan</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm">Batal</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl text-sm">Hapus</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1); }`}</style>
    </div>
  );
}
