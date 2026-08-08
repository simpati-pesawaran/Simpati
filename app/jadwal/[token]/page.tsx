"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Agenda {
  id: string;
  jenis: string;
  title: string;
  date: string;
  time_start: string;
  time_end: string;
  location: string | null;
}

export default function SharedAgendaPage({ params }: { params: { token: string } }) {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const res = await fetch(`/api/share/${params.token}`);
        const data = await res.json();
        if (data.success) {
          setAgendas(data.agendas || []);
        } else {
          setError(data.error || "Link tidak valid atau sudah kadaluarsa");
        }
      } catch {
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchAgenda();
  }, [params.token]);

  const formatTime = (t: string) => t?.slice(0, 5) || "";

  // Group agendas by date
  const groupedAgendas = agendas.reduce((acc, agenda) => {
    const date = agenda.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(agenda);
    return acc;
  }, {} as Record<string, Agenda[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="text-white/70 mt-4">Memuat jadwal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-sm">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Oops!</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <Link href="/" className="inline-block px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="px-5 py-8 text-center">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Jadwal Agenda</h1>
        <p className="text-white/60 mt-1">SIMPATI Pesawaran</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
          <span className="text-white/80 text-sm">{agendas.length} agenda</span>
        </div>
      </div>

      {/* Agenda List */}
      <div className="px-5 pb-10 space-y-6">
        {Object.entries(groupedAgendas).map(([date, dateAgendas]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
                <p className="text-white/60 text-xs font-medium">
                  {new Date(date).toLocaleDateString("id-ID", { weekday: "short" })}
                </p>
                <p className="text-white text-lg font-bold">
                  {new Date(date).toLocaleDateString("id-ID", { day: "numeric" })}
                </p>
              </div>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <div className="space-y-3">
              {dateAgendas.map((agenda) => (
                <div
                  key={agenda.id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-1 h-12 rounded-full ${
                      agenda.jenis === "kegiatan" ? "bg-blue-400" : "bg-purple-400"
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          agenda.jenis === "kegiatan"
                            ? "bg-blue-500/30 text-blue-300"
                            : "bg-purple-500/30 text-purple-300"
                        }`}>
                          {agenda.jenis === "kegiatan" ? "📌 Kegiatan" : "🎭 Audiensi"}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold">{agenda.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/70">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(agenda.time_start)} - {formatTime(agenda.time_end)}
                        </span>
                        {agenda.location && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {agenda.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {agendas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50">Tidak ada agenda dalam periode ini</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <Link href="/" className="text-white/40 text-sm hover:text-white/60 transition">
         Powered by SIMPATI
        </Link>
      </div>
    </div>
  );
}
