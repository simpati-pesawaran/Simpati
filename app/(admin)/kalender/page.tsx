"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Agenda {
  id: string;
  jenis: "kegiatan" | "audiensi";
  sub_jenis: string | null;
  title: string;
  date: string;
  time_start: string;
  time_end: string;
  location: string | null;
  status: string;
}

export default function KalenderPage() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAgendas, setSelectedAgendas] = useState<Agenda[]>([]);
  const [showDetail, setShowDetail] = useState<Agenda | null>(null);

  const profile = (session?.user as any)?.profile;

  useEffect(() => {
    checkCalendarConnection();
    fetchMonthAgendas();
  }, [currentDate]);

  const checkCalendarConnection = async () => {
    try {
      const res = await fetch("/api/calendar");
      const data = await res.json();
      setCalendarConnected(data.connected || false);
    } catch {
      setCalendarConnected(false);
    }
  };

  const fetchMonthAgendas = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];

      const params = new URLSearchParams({
        date_from: firstDay,
        date_to: lastDay,
        limit: "100",
      });

      const res = await fetch(`/api/agenda?${params}`);
      const data = await res.json();
      if (data.success) {
        setAgendas(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      const res = await fetch("/api/calendar", { method: "POST" });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const syncAll = async () => {
    try {
      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_all" }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchMonthAgendas();
      } else {
        alert(data.error || "Gagal sinkron");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  // Calendar helpers
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getAgendasForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return agendas.filter((a) => a.date === dateStr);
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayAgendas = getAgendasForDate(day);
    if (dayAgendas.length > 0) {
      setSelectedDate(dateStr);
      setSelectedAgendas(dayAgendas);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formatTime = (t: string) => t.slice(0, 5);

  const days = getDaysInMonth();
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)" }}>
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-bold">Kalender</h1>
          {calendarConnected ? (
            <button onClick={syncAll}
              className="px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync
            </button>
          ) : (
            <button onClick={connectGoogleCalendar}
              className="px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Hubungkan
            </button>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="p-4 bg-white mx-4 mt-4 rounded-2xl shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-gray-900">{formatMonthYear()}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square"></div>;
              }

              const dayAgendas = getAgendasForDate(day);
              const hasAgenda = dayAgendas.length > 0;
              const kegiatanCount = dayAgendas.filter((a) => a.jenis === "kegiatan").length;
              const audiensiCount = dayAgendas.filter((a) => a.jenis === "audiensi").length;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg relative transition ${
                    hasAgenda ? "hover:bg-gray-50" : ""
                  } ${isToday(day) ? "bg-indigo-100" : ""}`}
                >
                  <span className={`text-sm font-medium ${
                    isToday(day) ? "text-indigo-700 font-bold" : "text-gray-700"
                  }`}>
                    {day}
                  </span>
                  {hasAgenda && (
                    <div className="flex gap-0.5 mt-0.5">
                      {kegiatanCount > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      )}
                      {audiensiCount > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Kegiatan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-600">Audiensi</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Agenda Mendatang</h3>
        <div className="space-y-2">
          {agendas
            .filter((a) => new Date(a.date) >= new Date())
            .slice(0, 5)
            .map((agenda) => (
              <button
                key={agenda.id}
                onClick={() => setShowDetail(agenda)}
                className={`w-full text-left bg-white rounded-xl p-3 border-l-4 ${
                  agenda.jenis === "kegiatan" ? "border-blue-500" : "border-purple-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{agenda.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(agenda.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} • {formatTime(agenda.time_start)}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    agenda.jenis === "kegiatan" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  }`}>
                    {agenda.jenis === "kegiatan" ? "Keg" : "Aud"}
                  </span>
                </div>
              </button>
            ))}
          {agendas.filter((a) => new Date(a.date) >= new Date()).length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">Tidak ada agenda mendatang</p>
          )}
        </div>
      </div>

      {/* Selected Date Bottom Sheet */}
      {selectedDate && selectedAgendas.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSelectedDate(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedAgendas.length} agenda</p>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-5 pb-8 space-y-3">
              {selectedAgendas.map((agenda) => (
                <button
                  key={agenda.id}
                  onClick={() => { setShowDetail(agenda); setSelectedDate(null); }}
                  className={`w-full text-left bg-gray-50 rounded-xl p-4 border-l-4 ${
                    agenda.jenis === "kegiatan" ? "border-blue-500" : "border-purple-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      agenda.jenis === "kegiatan" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{agenda.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatTime(agenda.time_start)} - {formatTime(agenda.time_end)}
                      </p>
                      {agenda.location && (
                        <p className="text-xs text-gray-400 mt-0.5">{agenda.location}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Bottom Sheet */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowDetail(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${
                    showDetail.jenis === "kegiatan" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  }`}>
                    {showDetail.jenis === "kegiatan" ? "Kegiatan" : "Audiensi"}
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
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  showDetail.jenis === "kegiatan" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lokasi</p>
                    <p className="font-semibold text-gray-900">{showDetail.location}</p>
                  </div>
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
