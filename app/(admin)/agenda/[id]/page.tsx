'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AgendaWithCreator } from '@/app/types/database';

interface Profile {
  id: string;
  name: string;
  role: string;
}

export default function AgendaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [agenda, setAgenda] = useState<AgendaWithCreator | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    time_start: '',
    time_end: '',
    location: '',
    target_audience: '',
    status: 'draft',
  });

  const id = params.id as string;

  useEffect(() => {
    fetchAgenda();
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile');
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch profile');
    }
  };

  const fetchAgenda = async () => {
    try {
      const res = await fetch(`/api/agenda/${id}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Agenda tidak ditemukan');
        return;
      }

      setAgenda(data.data);
    } catch (err) {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/agenda/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        router.push('/kegiatan');
      } else {
        alert(data.error || 'Gagal menghapus');
      }
    } catch (err) {
      alert('Gagal menghapus agenda');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const openEditModal = () => {
    if (!agenda) return;
    setEditForm({
      title: agenda.title || '',
      description: agenda.description || '',
      date: agenda.date || '',
      time_start: agenda.time_start || '',
      time_end: agenda.time_end || '',
      location: agenda.location || '',
      target_audience: agenda.target_audience || '',
      status: agenda.status || 'draft',
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/agenda/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (data.success) {
        setShowEditModal(false);
        fetchAgenda();
      } else {
        alert(data.error || 'Gagal mengupdate');
      }
    } catch (err) {
      alert('Gagal mengupdate agenda');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const getJenisBadge = (jenis: string) => {
    if (jenis === 'agenda') {
      return { label: 'Kegiatan', className: 'bg-blue-100 text-blue-700' };
    }
    return { label: 'Audiensi', className: 'bg-purple-100 text-purple-700' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return { label: 'Dipublikasi', className: 'bg-green-100 text-green-700' };
      case 'draft': return { label: 'Draft', className: 'bg-yellow-100 text-yellow-700' };
      case 'cancelled': return { label: 'Dibatalkan', className: 'bg-red-100 text-red-700' };
      default: return { label: status, className: 'bg-gray-100 text-gray-700' };
    }
  };

  // Check if user can edit/delete
  const canModify = profile && agenda && (
    agenda.created_by === profile.id || profile.role === 'superadmin'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  if (error || !agenda) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Agenda Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-6">{error || 'Data tidak tersedia'}</p>
          <Link href="/kegiatan" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg">
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const jenis = getJenisBadge(agenda.jenis);
  const status = getStatusBadge(agenda.status);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Container - matching app max-width */}
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24">

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white px-4 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Detail Agenda</h1>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${jenis.className}`}>{jenis.label}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}>{status.label}</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">{agenda.title}</h2>

          {agenda.creator && (
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Dibuat oleh {agenda.creator.name}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 -mt-4 space-y-4">
          {/* Date & Time */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Tanggal & Waktu</p>
                <p className="font-semibold text-gray-900">{formatDate(agenda.date)}</p>
                <p className="text-sm text-gray-600 mt-1">{agenda.time_start} - {agenda.time_end}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          {agenda.location && (
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Lokasi</p>
                  <p className="font-semibold text-gray-900">{agenda.location}</p>
                </div>
              </div>
            </div>
          )}

          {/* Target Audience */}
          {agenda.target_audience && (
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Target Audiensi</p>
                  <p className="font-semibold text-gray-900">{agenda.target_audience}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {agenda.description && (
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Deskripsi</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{agenda.description}</p>
            </div>
          )}

          {/* Meta Info */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Informasi</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ID</span>
                <span className="text-gray-700 font-mono">{agenda.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dibuat</span>
                <span className="text-gray-700">{new Date(agenda.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Inside Content Area */}
          {canModify && (
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex gap-3">
                <button
                  onClick={openEditModal}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Agenda
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="py-3 px-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 active:scale-[0.98] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slideUp {
            animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
          }
        `}</style>
      </div>

      {/* Edit Modal - Bottom Sheet Pattern */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowEditModal(false)}>
          <div
            className="w-full sm:max-w-[390px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp"
            style={{ maxHeight: "92vh" }}
            onClick={e => e.stopPropagation()}
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
                    background: agenda?.jenis === "agenda"
                      ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                      : "linear-gradient(135deg, #8b5cf6, #ec4899)",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                  }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Edit Agenda</h2>
                  <p className="text-xs text-gray-500">{agenda?.jenis === "agenda" ? "Kegiatan" : "Audiensi"}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleEdit} className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-5 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Judul Agenda <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all"
                  placeholder="Masukkan judul agenda"
                  required
                />
              </div>

              {/* Date & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Tanggal <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={e => setEditForm({...editForm, date: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Dipublikasi</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Jam Mulai <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={editForm.time_start}
                    onChange={e => setEditForm({...editForm, time_start: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Jam Selesai <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={editForm.time_end}
                    onChange={e => setEditForm({...editForm, time_end: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Lokasi</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={e => setEditForm({...editForm, location: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all"
                  placeholder="Masukkan lokasi"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Target Audiensi</label>
                <input
                  type="text"
                  value={editForm.target_audience}
                  onChange={e => setEditForm({...editForm, target_audience: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all"
                  placeholder="Masukkan target audiensi"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3.5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/80 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all resize-none"
                  placeholder="Masukkan deskripsi agenda"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 rounded-2xl font-semibold text-sm text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] bg-gradient-to-r from-indigo-600 to-blue-600"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Agenda?</h3>
              <p className="text-sm text-gray-500 mb-6">"{agenda.title}" akan dihapus permanen.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
