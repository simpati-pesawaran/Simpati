"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AppHeader from "@/components/AppHeader";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  category: "dokumentasi" | "arsip";
  image_url: string;
  agenda_id: string | null;
  created_by: string;
  created_at: string;
}

export default function GaleriPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"dokumentasi" | "arsip">("dokumentasi");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const profile = (session?.user as any)?.profile;
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    fetchGallery();
  }, [activeTab]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery?category=${activeTab}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !title) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", activeTab);

      const res = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setShowUpload(false);
        setTitle("");
        setDescription("");
        setImageFile(null);
        setImagePreview(null);
        fetchGallery();
      } else {
        alert(data.error || "Gagal upload");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus item ini?")) return;
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchGallery();
        setSelectedItem(null);
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: "#f1f5f9" }}>
      <AppHeader
        variant="default"
        title="Galeri"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        notificationCount={items.length}
      />

      {/* Tabs */}
      <div className="px-5 py-3 bg-white border-b border-gray-100" style={{ marginTop: "-1px" }}>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("dokumentasi")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "dokumentasi"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Dokumentasi
          </button>
          <button
            onClick={() => setActiveTab("arsip")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "arsip"
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Arsip Digital
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 font-medium">Belum ada {activeTab === "dokumentasi" ? "dokumentasi" : "arsip digital"}</p>
            {isAdmin && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-4 px-4 py-2 text-indigo-600 text-sm font-semibold"
              >
                Upload pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-200 group"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition">
                  <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50" onClick={() => setShowUpload(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 max-h-[92vh] bg-white rounded-t-[28px] shadow-2xl flex flex-col animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Upload {activeTab === "dokumentasi" ? "Dokumentasi" : "Arsip Digital"}
              </h2>
              <button onClick={() => setShowUpload(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800">Gambar</label>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full active:scale-90 transition-transform"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Ketuk untuk upload gambar</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                </label>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul"
                  required
                  className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-gray-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800">Deskripsi <span className="text-xs font-normal text-gray-500">(opsional)</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Masukkan deskripsi"
                  rows={3}
                  className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none placeholder:text-gray-500"
                />
              </div>

              {/* Bottom spacing */}
              <div className="h-20" />
            </form>
            {/* Sticky Submit Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
              <button
                type="submit"
                disabled={uploading || !imageFile || !title}
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-semibold text-base text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{
                  background: uploading || !imageFile || !title
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
                  boxShadow: uploading || !imageFile || !title
                    ? 'none'
                    : '0 4px 20px rgba(37, 99, 235, 0.35)'
                }}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Mengupload...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50" onClick={() => setSelectedItem(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-[28px] shadow-2xl flex flex-col animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-end px-5 py-3">
              <button onClick={() => setSelectedItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 active:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <div className="relative rounded-2xl overflow-hidden shadow-lg mb-4">
                <img src={selectedItem.image_url} alt={selectedItem.title} className="w-full aspect-video object-cover" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedItem.title}</h2>
              {selectedItem.description && (
                <p className="text-gray-700 mt-2 font-medium">{selectedItem.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-4 font-medium">
                {new Date(selectedItem.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  className="w-full mt-6 py-4 rounded-2xl bg-red-500 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus
                </button>
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
