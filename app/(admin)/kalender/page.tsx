"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
  status: string;
  google_event_id?: string;
  google_synced_at?: string;
}

export default function KalenderPage() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAgendas, setSelectedAgendas] = useState<Agenda[]>([]);
  const [showDetail, setShowDetail] = useState<Agenda | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const profile = (session?.user as any)?.profile;

  useEffect(() => {
    fetchMonthAgendas();
  }, [currentDate]);

  const fetchMonthAgendas = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];

      // Fetch all published agendas with high limit, filter client-side
      const params = new URLSearchParams({
        limit: "200",
        status: "published",
      });

      const res = await fetch(`/api/agenda?${params}`);
      const data = await res.json();
      if (data.success) {
        // Filter client-side for the current month
        const monthAgendas = (data.data || []).filter((a: Agenda) => {
          return a.date >= firstDay && a.date <= lastDay;
        });
        setAgendas(monthAgendas);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days: (number | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
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

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split("T")[0]);
    const todayAgendas = getAgendasForDate(new Date().getDate());
    setSelectedAgendas(todayAgendas);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dateStr === selectedDate;
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayAgendas = getAgendasForDate(day);
    setSelectedDate(dateStr);
    setSelectedAgendas(dayAgendas);
  };

  const formatSelectedDate = (d: string) => {
    return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formatTime = (t: string) => t.slice(0, 5);

  const days = getDaysInMonth();
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="min-h-screen pb-24" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-6" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)" }}>
        <div className="flex items-center gap-4 mb-1">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold">Kalender</h1>
            <p className="text-white/60 text-xs">Agenda kegiatan & audiensi</p>
          </div>
          <Link href="/dashboard" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={prevMonth} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">{formatMonthYear()}</h2>
              <button onClick={goToToday} className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all">
                Hari Ini
              </button>
            </div>
            <button onClick={nextMonth} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 px-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-[10px] font-semibold text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="px-2 pb-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0.5">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square"></div>;
                  }

                  const dayAgendas = getAgendasForDate(day);
                  const hasAgenda = dayAgendas.length > 0;
                  const hasKegiatan = dayAgendas.some((a) => a.jenis === "kegiatan" || a.jenis === "agenda");
                  const hasAudiensi = dayAgendas.some((a) => a.jenis === "audiensi");

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all active:scale-95 ${
                        isSelected(day)
                          ? "bg-indigo-500 shadow-sm"
                          : isToday(day)
                          ? "bg-indigo-100"
                          : hasAgenda
                          ? "bg-gray-50 hover:bg-gray-100"
                          : ""
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        isSelected(day)
                          ? "text-white font-bold"
                          : isToday(day)
                          ? "text-indigo-600 font-bold"
                          : "text-gray-700"
                      }`}>
                        {day}
                      </span>
                      {hasAgenda && !isSelected(day) && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasKegiatan && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          )}
                          {hasAudiensi && (
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 px-4 py-2.5 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] text-gray-500 font-medium">Kegiatan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-[10px] text-gray-500 font-medium">Audiensi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Date Agenda */}
      <div className="px-4 mt-4">
        {selectedDate ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-sm font-bold text-gray-900">{formatSelectedDate(selectedDate)}</h3>
              <span className="ml-auto text-xs text-gray-400">{selectedAgendas.length} agenda</span>
            </div>

            {selectedAgendas.length > 0 ? (
              <div className="space-y-2">
                {selectedAgendas
                  .sort((a, b) => a.time_start.localeCompare(b.time_start))
                  .map((agenda) => {
                    const isKegiatan = agenda.jenis === "kegiatan" || agenda.jenis === "agenda";
                    const googleSynced = !!agenda.google_event_id;

                    return (
                      <button
                        key={agenda.id}
                        onClick={() => setShowDetail(agenda)}
                        className={`w-full text-left bg-white rounded-xl p-3 shadow-sm border transition-all active:scale-[0.98] ${
                          isKegiatan
                            ? "border-blue-200 hover:border-blue-300"
                            : "border-purple-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isKegiatan
                              ? "bg-blue-100"
                              : "bg-purple-100"
                          }`}>
                            <svg className={`w-5 h-5 ${isKegiatan ? "text-blue-600" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-xs font-semibold text-gray-500">{formatTime(agenda.time_start)} - {formatTime(agenda.time_end)}</p>
                              {googleSynced && (
                                <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center" title="Tersinkron Google Calendar">
                                  <svg className="w-2.5 h-2.5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{agenda.title}</p>
                            {agenda.location && (
                              <div className="flex items-center gap-1 mt-1">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <p className="text-xs text-gray-500 truncate">{agenda.location}</p>
                              </div>
                            )}
                          </div>
                          <div className={`px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 ${
                            isKegiatan
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {isKegiatan ? "Keg" : "Aud"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">Tidak ada agenda</p>
                <p className="text-xs text-gray-400 mt-1">pada tanggal ini</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">Pilih tanggal</p>
            <p className="text-xs text-gray-400 mt-1">untuk melihat agenda pada tanggal tersebut</p>
          </div>
        )}
      </div>

      {/* FAB - Add Agenda */}
      <Link
        href="/kegiatan"
        className="fixed right-4 bottom-24 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 z-40"
        style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </Link>

      {/* Detail Modal - Bottom Sheet */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowDetail(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                showDetail.jenis === "kegiatan" || showDetail.jenis === "agenda"
                  ? "bg-blue-100"
                  : "bg-purple-100"
              }`}>
                <svg className={`w-5 h-5 ${
                  showDetail.jenis === "kegiatan" || showDetail.jenis === "agenda"
                    ? "text-blue-600"
                    : "text-purple-600"
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    showDetail.jenis === "kegiatan" || showDetail.jenis === "agenda"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {showDetail.jenis === "kegiatan" || showDetail.jenis === "agenda" ? "Kegiatan" : "Audiensi"}
                  </span>
                  {showDetail.google_event_id && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Synced
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{showDetail.title}</p>
              </div>
              <button onClick={() => setShowDetail(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[50vh]">
              {/* Date & Time */}
              <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-gray-900">{formatDate(showDetail.date)}</p>
                  <p className="text-xs text-gray-500">{formatTime(showDetail.time_start)} - {formatTime(showDetail.time_end)}</p>
                </div>
              </div>

              {/* Location */}
              {showDetail.location && (
                <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <p className="text-xs font-medium text-gray-900 truncate">{showDetail.location}</p>
                </div>
              )}

              {/* Google Calendar Status */}
              {showDetail.google_event_id && showDetail.google_synced_at && (
                <div className="flex items-center gap-3 px-3 py-2.5 bg-emerald-50 rounded-xl">
                  <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <p className="text-xs font-medium text-emerald-700">Tersinkron ke Google Calendar</p>
                </div>
              )}

              {/* Description */}
              {showDetail.description && (
                <div className="px-3 py-2.5">
                  <p className="text-xs text-gray-600 leading-relaxed">{showDetail.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Link
                  href={`/kegiatan?id=${showDetail.id}`}
                  className="flex-1 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl text-center hover:bg-indigo-600 transition-all"
                >
                  Lihat Detail
                </Link>
                {showDetail.google_event_id && (
                  <button className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                    <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
