"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import AppHeader from "@/components/AppHeader";

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
  const [stats, setStats] = useState<DashboardStats | null>({ total: 0, total_kegiatan: 0, total_audiensi: 0, upcoming: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<Agenda[]>([]);
  const [showDetail, setShowDetail] = useState<Agenda | null>(null);

  const profile = (session?.user as any)?.profile;
  const userName = profile?.name || session?.user?.name || "User";
  const userDivision = profile?.division || "Administrator";

  useEffect(() => {
    // Fetch data
    fetch("/api/dashboard/stats")
      .then(r => r.json())
      .then(d => d.success && setStats(d.stats))
      .catch(() => {});

    fetch("/api/agenda?limit=5&upcoming=true")
      .then(r => r.json())
      .then(d => d.success && setUpcomingEvents(d.data || []))
      .catch(() => {});
  }, []);

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

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Hero Header using AppHeader Component */}
      <AppHeader variant="hero" notificationCount={stats?.upcoming || 0}>
        {/* Greeting - Inside Hero */}
        <div className="mt-4">
          <h2 className="text-white text-3xl font-bold">Halo,</h2>
          <h2 className="text-white text-2xl font-bold mt-1">{userName}</h2>
          <p className="text-white/60 text-sm mt-1">{userDivision}</p>
        </div>

        {/* Quick Stats - Inside Hero */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-400/40 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-white/80 text-sm font-medium">Kegiatan</span>
            </div>
            <p className="text-white text-2xl font-bold">{stats?.total_kegiatan || 0}</p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-400/40 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-white/80 text-sm font-medium">Audiensi</span>
            </div>
            <p className="text-white text-2xl font-bold">{stats?.total_audiensi || 0}</p>
          </div>
        </div>
      </AppHeader>

      {/* White Content Sheet */}
      <div
        className="bg-white rounded-t-3xl"
        style={{
          marginTop: "16px",
          padding: "24px",
          paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Menu Grid - BIGGER */}
        <div className="mb-5">
          <h3 className="text-gray-900 font-bold text-base mb-4">Menu</h3>

          {/* Grid 3 Kolom - Bigger */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {menuItems.slice(0, 3).map((menu) => (
              <Link
                key={menu.name}
                href={menu.href}
                className="group flex flex-col items-center p-4 rounded-2xl border border-gray-100 hover:bg-slate-50 transition-all active:scale-95"
                style={{
                  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                }}
              >
                <div className={`w-[60px] h-[60px] rounded-2xl bg-gradient-to-br ${menu.color} flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}>
                  <Image src={menu.icon} alt={menu.name} width={32} height={32} />
                </div>
                <span className="text-sm font-semibold text-gray-800 text-center leading-tight">{menu.name}</span>
              </Link>
            ))}
          </div>

          {/* Grid 3 Kolom - Row 2 */}
          <div className="grid grid-cols-3 gap-3">
            {menuItems.slice(3, 5).map((menu) => (
              <Link
                key={menu.name}
                href={menu.href}
                className="group flex flex-col items-center p-4 rounded-2xl border border-gray-100 hover:bg-slate-50 transition-all active:scale-95"
                style={{
                  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                }}
              >
                <div className={`w-[60px] h-[60px] rounded-2xl bg-gradient-to-br ${menu.color} flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}>
                  <Image src={menu.icon} alt={menu.name} width={32} height={32} />
                </div>
                <span className="text-sm font-semibold text-gray-800 text-center leading-tight">{menu.name}</span>
              </Link>
            ))}
            {/* Empty cell */}
            <div className="p-4" />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 my-4" />

        {/* Agenda Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-bold text-base">Agenda</h3>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
              {upcomingEvents.length}
            </span>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Belum ada agenda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 4).map((event) => (
                <button
                  key={event.id}
                  onClick={() => setShowDetail(event)}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-left hover:shadow-md hover:border-indigo-100 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Badge */}
                    <div className={`flex-shrink-0 w-12 h-14 rounded-xl flex flex-col items-center justify-center ${
                      event.jenis === "agenda"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                        : "bg-gradient-to-br from-purple-500 to-pink-500"
                    }`}>
                      <span className="text-white/80 text-[10px] font-semibold uppercase">
                        {new Date(event.date).toLocaleDateString("id-ID", { weekday: "short" })}
                      </span>
                      <span className="text-white text-lg font-bold leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="font-semibold text-gray-900 text-sm truncate pr-2">{event.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-500">{event.time_start}</span>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
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
                  className="block w-full py-3 text-center text-indigo-600 font-semibold text-sm hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  Lihat semua →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet Detail */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowDetail(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-white rounded-t-3xl p-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${
                  showDetail.jenis === "agenda"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}>
                  {showDetail.jenis === "agenda" ? "Kegiatan" : "Audiensi"}
                </span>
                <h3 className="text-lg font-bold text-gray-900">{showDetail.title}</h3>
              </div>
              <button
                onClick={() => setShowDetail(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tanggal & Waktu</p>
                  <p className="font-semibold text-gray-900">{formatDate(showDetail.date)}</p>
                  <p className="text-sm text-gray-600">{showDetail.time_start} - {showDetail.time_end}</p>
                </div>
              </div>

              {showDetail.location && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lokasi</p>
                    <p className="font-semibold text-gray-900">{showDetail.location}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Link
                  href={`/kegiatan/${showDetail.id}`}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl text-sm text-center shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-transform"
                >
                  Lihat Detail
                </Link>
                <button className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Safe Area */}
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
