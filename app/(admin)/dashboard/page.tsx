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
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, total_kegiatan: 0, total_audiensi: 0, upcoming: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<Agenda[]>([]);
  const [showDetail, setShowDetail] = useState<Agenda | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const profile = (session?.user as any)?.profile;
  const userName = profile?.name || session?.user?.name || "User";
  const userDivision = profile?.division || "Administrator";

  useEffect(() => {
    // Fetch data in background
    Promise.all([
      fetch("/api/dashboard/stats").then(r => r.json()),
      fetch("/api/agenda?limit=5&upcoming=true").then(r => r.json())
    ]).then(([statsData, eventsData]) => {
      if (statsData.success) setStats(statsData.stats);
      if (eventsData.success) setUpcomingEvents(eventsData.data || []);
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, []);

  const menuItems: MenuItem[] = [
    { name: "Agenda", href: "/kegiatan", icon: "/icons/icon-agenda.svg", color: "from-blue-500 to-indigo-500" },
    { name: "Calendar", href: "/kalender", icon: "/icons/icon-calendar.svg", color: "from-indigo-500 to-purple-500" },
    { name: "Galeri", href: "/galeri", icon: "/icons/icon-galeri.svg", color: "from-purple-500 to-pink-500" },
    { name: "Usulan", href: "/usulan", icon: "/icons/icon-usulan.svg", color: "from-amber-500 to-orange-500" },
    { name: "Log", href: "/log", icon: "/icons/icon-log.svg", color: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2563eb] to-[#7c3aed] px-4 pb-6 relative overflow-hidden" style={{ paddingTop: `calc(0.75rem + env(safe-area-inset-top))` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-6 left-4 w-16 h-16 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
                <Image src="/logo/logo-master.png" alt="SIMPATI" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <p className="text-white/80 text-[11px] font-medium tracking-wide">Sistem Informasi Manajemen</p>
                <p className="text-white/60 text-[10px]">Protokol & Agenda Terintegrasi</p>
              </div>
            </div>
            <button className="relative p-2 bg-white/15 rounded-xl">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">{stats.upcoming || 0}</span>
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-white text-lg font-bold">Halo, {userName.split(" ")[0]}! 👋</h2>
            <p className="text-white/60 text-xs mt-0.5">{userDivision}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-white/15 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-blue-400/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-white/60 text-[10px]">Kegiatan</span>
              </div>
              <p className="text-white text-lg font-bold">{stats.total_kegiatan}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-purple-400/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-white/60 text-[10px]">Audiensi</span>
              </div>
              <p className="text-white text-lg font-bold">{stats.total_audiensi}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 -mt-3">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="text-gray-900 font-semibold text-sm mb-3">Menu</h3>

          <div className="grid grid-cols-3 gap-2 mb-2">
            {menuItems.slice(0, 3).map((menu) => (
              <Link key={menu.name} href={menu.href} className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-all active:scale-95">
                <div className={`w-[48px] h-[48px] rounded-xl bg-gradient-to-br ${menu.color} flex items-center justify-center mb-1.5 shadow-md`}>
                  <Image src={menu.icon} alt={menu.name} width={26} height={26} />
                </div>
                <span className="text-[10px] font-semibold text-gray-700 text-center">{menu.name}</span>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {menuItems.slice(3, 5).map((menu) => (
              <Link key={menu.name} href={menu.href} className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-all active:scale-95">
                <div className={`w-[48px] h-[48px] rounded-xl bg-gradient-to-br ${menu.color} flex items-center justify-center mb-1.5 shadow-md`}>
                  <Image src={menu.icon} alt={menu.name} width={26} height={26} />
                </div>
                <span className="text-[10px] font-semibold text-gray-700 text-center">{menu.name}</span>
              </Link>
            ))}
            <div className="p-2" />
          </div>
        </div>

        {/* Agenda */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mt-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900 font-semibold text-sm">Agenda</h3>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-semibold rounded-full">{upcomingEvents.length}</span>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-gray-400 text-xs">Belum ada agenda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.slice(0, 3).map((event) => (
                <button key={event.id} onClick={() => setShowDetail(event)} className="w-full flex items-start gap-3 p-2.5 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-all">
                  <div className={`w-9 h-11 rounded-lg flex flex-col items-center justify-center py-1 ${event.jenis === "agenda" ? "bg-gradient-to-br from-blue-500 to-indigo-500" : "bg-gradient-to-br from-purple-500 to-pink-500"}`}>
                    <span className="text-white/80 text-[8px] font-medium uppercase">{new Date(event.date).toLocaleDateString("id-ID", { weekday: "short" })}</span>
                    <span className="text-white text-sm font-bold leading-none">{new Date(event.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-xs truncate">{event.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{event.time_start}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${event.jenis === "agenda" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                    {event.jenis === "agenda" ? "Keg" : "Aud"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowDetail(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full bg-white rounded-t-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1 ${showDetail.jenis === "agenda" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                  {showDetail.jenis === "agenda" ? "Kegiatan" : "Audiensi"}
                </span>
                <h3 className="text-base font-bold text-gray-900">{showDetail.title}</h3>
              </div>
              <button onClick={() => setShowDetail(null)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">{new Date(showDetail.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</p>
                  <p className="text-xs font-medium text-gray-900">{showDetail.time_start} - {showDetail.time_end}</p>
                </div>
              </div>
              {showDetail.location && (
                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-gray-900">{showDetail.location}</p>
                </div>
              )}
            </div>
            <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
          </div>
        </div>
      )}
    </div>
  );
}