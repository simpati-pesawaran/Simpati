"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAgendas, setSelectedAgendas] = useState<Agenda[]>([]);
  const [showDetail, setShowDetail] = useState<Agenda | null>(null);

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
    <div className="min-h-screen pb-24" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div
        className="px-5 pt-4 pb-8"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95"
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
            <h1 className="text-white text-xl font-bold">Kalender</h1>
            <p className="text-white/60 text-xs">Agenda kegiatan & audiensi</p>
          </div>
        </div>
      </div>

      {/* Spacer between header and calendar */}
      <div className="h-6" />

      {/* Calendar Card */}
      <div className="mx-4">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
            <button onClick={prevMonth} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900">{formatMonthYear()}</h2>
            <button onClick={nextMonth} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 px-2 pt-4 pb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="px-2 pb-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square"></div>;
                  }

                  const dayAgendas = getAgendasForDate(day);
                  const hasAgenda = dayAgendas.length > 0;
                  const hasKegiatan = dayAgendas.some((a) => a.jenis === "agenda");
                  const hasAudiensi = dayAgendas.some((a) => a.jenis === "audiensi");

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 ${
                        isToday(day)
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md"
                          : hasAgenda
                          ? "bg-gray-50 hover:bg-gray-100"
                          : ""
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        isToday(day) ? "text-white font-bold" : "text-gray-700"
                      }`}>
                        {day}
                      </span>
                      {hasAgenda && (
                        <div className="flex gap-0.5 mt-1">
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
          <div className="flex items-center justify-center gap-6 px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600 font-medium">Kegiatan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs text-gray-600 font-medium">Audiensi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mx-4 mt-6">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Agenda Mendatang
        </h3>
        <div className="space-y-3">
          {agendas
            .filter((a) => new Date(a.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
            .slice(0, 5)
            .map((agenda) => (
              <button
                key={agenda.id}
                onClick={() => setShowDetail(agenda)}
                className={`w-full text-left bg-white rounded-2xl p-4 shadow-sm border-l-4 transition-all active:scale-[0.98] ${
                  agenda.jenis === "agenda"
                    ? "border-blue-500 hover:shadow-md"
                    : "border-purple-500 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                    agenda.jenis === "agenda"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                      : "bg-gradient-to-br from-purple-500 to-pink-500"
                  }`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2">{agenda.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-500 font-medium">
                        {new Date(agenda.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {formatTime(agenda.time_start)}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                    agenda.jenis === "agenda"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {agenda.jenis === "agenda" ? "Keg" : "Aud"}
                  </span>
                </div>
              </button>
            ))}
          {agendas.filter((a) => new Date(a.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Tidak ada agenda mendatang</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Date Modal */}
      {selectedDate && selectedAgendas.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setSelectedDate(null)}>
          <div
            className="w-full sm:max-w-[390px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
            style={{ maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                </h2>
                <p className="text-xs text-gray-500">{selectedAgendas.length} agenda</p>
              </div>
              <button onClick={() => setSelectedDate(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto overscroll-contain px-4 py-4">
              <div className="space-y-3">
                {selectedAgendas.map((agenda) => (
                  <button
                    key={agenda.id}
                    onClick={() => { setShowDetail(agenda); setSelectedDate(null); }}
                    className={`w-full text-left bg-gray-50 rounded-2xl p-4 border-l-4 transition-all active:scale-[0.99] ${
                      agenda.jenis === "agenda"
                        ? "border-blue-500 hover:bg-blue-50"
                        : "border-purple-500 hover:bg-purple-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        agenda.jenis === "agenda"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-purple-100 text-purple-600"
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{agenda.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatTime(agenda.time_start)} - {formatTime(agenda.time_end)}
                        </p>
                        {agenda.location && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {agenda.location}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold flex-shrink-0 ${
                        agenda.jenis === "agenda"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {agenda.jenis === "agenda" ? "Keg" : "Aud"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - Super Compact */}
      {showDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowDetail(null)}>
          <div
            className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  showDetail.jenis === "agenda"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-purple-100 text-purple-600"
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    showDetail.jenis === "agenda"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {showDetail.jenis === "agenda" ? "Kegiatan" : "Audiensi"}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{showDetail.title}</p>
                </div>
              </div>
              <button onClick={() => setShowDetail(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="max-h-[55vh] overflow-y-auto overscroll-contain pb-4">
              <div className="px-4 py-3 space-y-2">
                {/* Date & Time */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">{formatDate(showDetail.date)}</p>
                    <p className="text-sm font-medium text-gray-900">{formatTime(showDetail.time_start)} - {formatTime(showDetail.time_end)}</p>
                  </div>
                </div>

                {/* Location */}
                {showDetail.location && (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">{showDetail.location}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
