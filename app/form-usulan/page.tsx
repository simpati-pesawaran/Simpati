'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FormData {
  name: string;
  phone: string;
  title: string;
  jenis: 'kegiatan' | 'audiensi';
  category: string;
  category_other: string;
  date_proposed: string;
  time_proposed: string;
  location: string;
  description: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  phone: '',
  title: '',
  jenis: 'kegiatan',
  category: '',
  category_other: '',
  date_proposed: '',
  time_proposed: '',
  location: '',
  description: '',
};

const CATEGORIES = [
  { value: '', label: 'Pilih Kategori' },
  { value: 'pendidikan', label: 'Pendidikan' },
  { value: 'kesehatan', label: 'Kesehatan' },
  { value: 'budaya', label: 'Budaya' },
  { value: 'olahraga', label: 'Olahraga' },
  { value: 'sosial', label: 'Kemanusiaan/Sosial' },
  { value: 'lingkungan', label: 'Lingkungan' },
  { value: 'ekonomi', label: 'Ekonomi' },
  { value: 'lainnya', label: 'Lainnya' },
];

// Section label component
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {children}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

export default function PublicUsulanPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showAbout, setShowAbout] = useState(false);

  const isFormValid = form.name.trim() && form.phone.trim() && form.title.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/usulan/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setSubmittedId(data.data?.id || null);
        setSubmitted(true);
      } else {
        setError(data.error || 'Gagal mengirim usulan');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateForm = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Success State
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center animate-scaleIn">
            {/* Success Icon with Animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
              <div className="relative w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-emerald-500 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Usulan Berhasil Dikirim</h1>
            <p className="text-gray-500 mb-6">
              Terima kasih telah menyampaikan usulan agenda.
            </p>

            {/* Usulan Info Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 mb-6 text-left border border-indigo-100/50">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">Judul Usulan</p>
              <p className="text-base font-semibold text-gray-900 mb-3">{form.title}</p>
              {submittedId && (
                <>
                  <div className="h-px bg-indigo-100 my-3" />
                  <p className="text-xs text-gray-400">
                    Kode Usulan: <span className="font-mono font-semibold text-gray-600">#{submittedId.slice(0, 8).toUpperCase()}</span>
                  </p>
                </>
              )}
            </div>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Tim kami akan meninjau usulan Anda</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedId(null);
                  setForm(INITIAL_FORM);
                }}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/30"
              >
                Kembali ke Form
              </button>
              <Link
                href="/login"
                className="block w-full py-4 bg-gray-50 text-gray-600 font-medium rounded-2xl text-center active:scale-[0.98] transition-all"
              >
                Login ke Dashboard
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes checkmark {
            0% { stroke-dashoffset: 24; }
            100% { stroke-dashoffset: 0; }
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s cubic-bezier(0.32, 0.72, 0, 1);
          }
          .animate-checkmark {
            stroke-dasharray: 24;
            stroke-dashoffset: 24;
            animation: checkmark 0.5s ease-out 0.3s forwards;
          }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - SIMPATI Default Style */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white px-4 pt-12 pb-5">
        <div className="flex items-start justify-between gap-4">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image src="/logo/logo-master.png" alt="SIMPATI" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">SIMPATI</h1>
              <p className="text-[10px] text-white/60 leading-snug">
                Sistem Informasi Manajemen<br />
                Protokol & Agenda Terintegrasi
              </p>
            </div>
          </div>

          {/* About Button */}
          <button
            onClick={() => setShowAbout(true)}
            className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center hover:bg-white/25 active:scale-95 transition-all flex-shrink-0"
            title="Tentang Aplikasi"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Title & Description */}
        <h2 className="text-xl font-bold mt-5 mb-1">Ajukan Usulan</h2>
        <p className="text-white/75 text-sm">
          Sampaikan ide kegiatan atau agenda untuk kebaikan bersama
        </p>
      </div>

      {/* About Modal - Premium Centered */}
      {showAbout && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAbout(false)}>
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Gradient */}
            <div className="px-5 py-6 text-center" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)" }}>
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden">
                <Image src="/logo/logo-master.png" alt="SIMPATI" width={44} height={44} className="object-contain" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">SIMPATI</h3>
              <p className="text-xs text-white/70">Sistem Informasi Manajemen<br />Protokol & Agenda Terintegrasi</p>
            </div>

            {/* Content */}
            <div className="px-5 py-5">
              <p className="text-sm text-gray-600 leading-relaxed text-center mb-4">
                Platform untuk pengelolaan agenda, kegiatan, audiensi, dan usulan secara terintegrasi.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Agenda</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Audiensi</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Usulan</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.213 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-gray-700">WhatsApp</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="px-5 pb-5">
              <button
                onClick={() => setShowAbout(false)}
                className="w-full py-3 text-gray-600 font-medium rounded-xl active:scale-[0.98] transition-all bg-gray-100 hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="px-4 -mt-3 pb-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-5 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* DATA PENGUSUL */}
          <SectionLabel>Data Pengusul</SectionLabel>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Masukkan nama Anda"
              required
              className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                placeholder="08xxxxxxxxxx"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all placeholder:text-gray-400"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.213 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Contoh: 081234567890</p>
          </div>

          {/* DETAIL USULAN */}
          <SectionLabel>Detail Usulan</SectionLabel>

          {/* Jenis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateForm('jenis', 'kegiatan')}
                className={`py-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  form.jenis === 'kegiatan'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25'
                    : 'bg-gray-50 text-gray-600 border border-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Kegiatan
              </button>
              <button
                type="button"
                onClick={() => updateForm('jenis', 'audiensi')}
                className={`py-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  form.jenis === 'audiensi'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25'
                    : 'bg-gray-50 text-gray-600 border border-gray-100'
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Usulan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              placeholder="Contoh: Bakti Sosial Kesehatan Desa"
              required
              className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => updateForm('category', e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all appearance-none cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Category Other Field - Animated */}
            <div className={`overflow-hidden transition-all duration-300 ease-out ${form.category === 'lainnya' ? 'max-h-20 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
              <input
                type="text"
                value={form.category_other}
                onChange={(e) => updateForm('category_other', e.target.value)}
                placeholder="Sebutkan kategori lainnya"
                className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* WAKTU & LOKASI */}
          <SectionLabel>Waktu & Lokasi</SectionLabel>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={form.date_proposed}
                onChange={(e) => updateForm('date_proposed', e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waktu
              </label>
              <input
                type="time"
                value={form.time_proposed}
                onChange={(e) => updateForm('time_proposed', e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateForm('location', e.target.value)}
                placeholder="Contoh: Baldes Kantor Desa"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all placeholder:text-gray-400"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* KETERANGAN */}
          <SectionLabel>Keterangan</SectionLabel>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi / Keterangan
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Jelaskan secara rinci kegiatan yang diusulkan..."
              rows={4}
              className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Spacer for button */}
          <div className="h-2" />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !isFormValid}
            className={`w-full py-4 rounded-2xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
              isFormValid && !submitting
                ? 'shadow-lg shadow-indigo-500/30'
                : ''
            }`}
            style={{
              background: isFormValid && !submitting
                ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                : '#94a3b8',
              boxShadow: isFormValid && !submitting
                ? '0 4px 20px rgba(99, 102, 241, 0.4)'
                : 'none',
            }}
          >
            {submitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.657A8 8 0 0112 20v4.03C7.03 24.03 2 19.97 2 14c0-2.21 1.05-4.18 2.67-5.5" />
                </svg>
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Kirim Usulan</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Trust Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-xs text-gray-400">
            Usulan Anda akan ditinjau oleh tim kami.<br />
            Kami akan menghubungi Anda melalui WhatsApp jika diperlukan.
          </p>
        </div>
      </div>
    </div>
  );
}
