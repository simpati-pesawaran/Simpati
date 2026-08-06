"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface Agenda {
  id: string;
  jenis: "agenda" | "audiensi";
  title: string;
  date: string;
  time_start: string;
  time_end: string;
  location: string | null;
  status: string;
}

interface DashboardStats {
  total: number;
  total_kegiatan: number;
  total_audiensi: number;
  upcoming: number;
}

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  color: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Agenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState<Agenda | null>(null);

  const profile = (session?.user as any)?.profile;
  const userName = profile?.name || session?.user?.name || "User";
  const userDivision = profile?.division || "Administrator";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await fetch("/api/dashboard/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      const eventsRes = await fetch("/api/agenda?limit=5&upcoming=true");
      const eventsData = await eventsRes.json();
      if (eventsData.success) {
        setUpcomingEvents(eventsData.data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const menuItems: MenuItem[] = [
    {
      name: "Agenda",
      href: "/kegiatan",
      icon: "/icons/icon-agenda.svg",
      color: "from-blue-500 to-indigo-500",
    },
    {
      name: "Calendar",
      href: "/kalender",
      icon: "/icons/icon-calendar.svg",
      color: "from-indigo-500 to-purple-500",
    },
    {
      name: "Galeri",
      href: "/galeri",
      icon: "/icons/icon-galeri.svg",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Usulan",
      href: "/usulan",
      icon: "/icons/icon-usulan.svg",
      color: "from-amber-500 to-orange-500",
    },
    {
      name: "Log",
      href: "/log",
      icon: "/icons/icon-log.svg",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2563eb] to-[#7c3aed] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-sm">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Hero Header - Full Width with Safe Area */}
      <div
        className="bg-gradient-to-br from-[#1e3a5f] via-[#2563eb] to-[#7c3aed] px-4 pb-8 relative overflow-hidden"
        style={{ paddingTop: `calc(0.75rem + env(safe-area-inset-top))` }}
      >
        {/* Floating Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-6 left-4 w-16 h-16 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Header Content - Logo + Description + Bell */}
        <div className="relative z-10 flex items-start justify-between">
          {/* Logo + Description */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
              <Image src="/logo/logo-master.png" alt="SIMPATI" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div className="leading-tight">
              <p className="text-white/80 text-[11px] font-medium tracking-wide">Sistem Informasi Manajemen</p>
              <p className="text-white/60 text-[10px]">Protokol & Agenda Terintegrasi</p>
            </div>
          </div>

          {/* Bell Notification */}
          <button className="relative p-2 bg-white/15 backdrop-blur-sm rounded-xl hover:bg-white/25 transition-colors flex-shrink-0">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">3</span>
          </button>
        </div>

        {/* Greeting - Simple, No Date */}
        <div className="mt-4">
          <h2 className="text-white text-xl font-bold">
            Halo, {userName.split(" ")[0]}! 👋
          </h2>
          <p className="text-white/60 text-xs mt-0.5">
            {userDivision}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-400/30 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-white/60 text-[11px]">Kegiatan</span>
            </div>
            <p className="text-white text-xl font-bold">{stats?.total_kegiatan || 0}</p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-purple-400/30 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-white/60 text-[11px]">Audiensi</span>
            </div>
            <p className="text-white text-xl font-bold">{stats?.total_audiensi || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Content - White Container (Full Width) */}
      <div className="px-3 -mt-4 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-500/10 p-4">
          {/* Menu Grid - 3 Kolom, Rata Kiri */}
          <div className="mb-5">
            <h3 className="text-gray-900 font-bold text-sm mb-3">Menu</h3>

            {/* Grid 3 Kolom - Row 1 */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {menuItems.slice(0, 3).map((menu) => (
                <Link
                  key={menu.name}
                  href={menu.href}
                  className="group flex flex-col items-center p-2.5 rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  <div className={`w-[52px] h-[52px] rounded-xl bg-gradient-to-br ${menu.color} flex items-center justify-center mb-1.5 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}>
                    <Image src={menu.icon} alt={menu.name} width={28} height={28} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">{menu.name}</span>
                </Link>
              ))}
            </div>

            {/* Grid 3 Kolom - Row 2 (2 items + 1 empty) */}
            <div className="grid grid-cols-3 gap-2">
              {menuItems.slice(3, 5).map((menu) => (
                <Link
                  key={menu.name}
                  href={menu.href}
                  className="group flex flex-col items-center p-2.5 rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  <div className={`w-[52px] h-[52px] rounded-xl bg-gradient-to-br ${menu.color} flex items-center justify-center mb-1.5 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}>
                    <Image src={menu.icon} alt={menu.name} width={28} height={28} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">{menu.name}</span>
                </Link>
              ))}
              {/* Empty cell untuk alignment */}
              <div className="p-2.5" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 my-3" />

          {/* Today's Agenda */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 font-bold text-sm">Agenda</h3>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-semibold rounded-full">
                {upcomingEvents.length}
              </span>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium text-sm">Belum ada agenda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.slice(0, 4).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setShowDetail(event)}
                    className="w-full bg-white border border-gray-100 rounded-xl p-3 text-left hover:shadow-md hover:border-indigo-100 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-3">
                      {/* Date Badge */}
                      <div className={`flex-shrink-0 w-10 h-12 rounded-lg flex flex-col items-center justify-center py-1 ${
                        event.jenis === "agenda"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                          : "bg-gradient-to-br from-purple-500 to-pink-500"
                      }`}>
                        <span className="text-white/80 text-[9px] font-medium uppercase">
                          {new Date(event.date).toLocaleDateString("id-ID", { weekday: "short" })}
                        </span>
                        <span className="text-white text-base font-bold leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs truncate pr-2">{event.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-[11px] text-gray-500">{event.time_start}</span>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <span className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                        event.jenis === "agenda"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-purple-50 text-purple-600"
                      }`}>
                        {event.jenis === "agenda" ? "Keg" : "Aud"}
                      </span>
                    </div>
                  </button>
                ))}

                {upcomingEvents.length > 4 && (
                  <Link
                    href="/kegiatan"
                    className="block w-full py-2 text-center text-indigo-600 font-medium text-xs hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Lihat semua →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sheet Detail */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowDetail(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-white rounded-t-3xl p-5 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1.5 ${
                  showDetail.jenis === "agenda"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}>
                  {showDetail.jenis === "agenda" ? "Kegiatan" : "Audiensi"}
                </span>
                <h3 className="text-base font-bold text-gray-900">{showDetail.title}</h3>
              </div>
              <button
                onClick={() => setShowDetail(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Details */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Tanggal & Waktu</p>
                  <p className="font-semibold text-gray-900 text-sm">{formatDate(showDetail.date)}</p>
                  <p className="text-xs text-gray-600">{showDetail.time_start} - {showDetail.time_end}</p>
                </div>
              </div>

              {showDetail.location && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Lokasi</p>
                    <p className="font-semibold text-gray-900 text-sm">{showDetail.location}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Link
                  href={`/kegiatan/${showDetail.id}`}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl text-xs text-center shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-transform"
                >
                  Lihat Detail
                </Link>
                <button className="px-3 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Safe Area Spacing */}
            <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
          </div>
        </div>
      )}

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
  );
}