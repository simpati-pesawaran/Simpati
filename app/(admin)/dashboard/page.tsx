"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CalendarDaysIcon, UsersIcon, ClockIcon } from "@heroicons/react/24/outline";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Agenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log("DASHBOARD");
  console.log("status =", status);
  console.log("session =", session);

  const profile = (session?.user as any)?.profile;
  const userName = profile?.name || session?.user?.name || "User";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log('=== [fetchDashboardData] START ===');
    setIsLoading(true);
    try {
      // Fetch stats
      console.log('Fetching /api/dashboard/stats...');
      const statsRes = await fetch("/api/dashboard/stats");
      const statsData = await statsRes.json();
      console.log('stats result:', JSON.stringify(statsData));
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch upcoming events
      console.log('Fetching /api/agenda?limit=5&upcoming=true...');
      const eventsRes = await fetch("/api/agenda?limit=5&upcoming=true");
      const eventsData = await eventsRes.json();
      console.log('events result:', JSON.stringify(eventsData));
      if (eventsData.success) {
        setUpcomingEvents(eventsData.data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
      console.log('=== [fetchDashboardData] END ===');
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

  console.log('=== [DASHBOARD] Rendering component ===');

  return (
    <div className="p-4 animate-fadeIn">
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {userName.split(" ")[0]}! 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
          <div className="bg-gray-100 rounded-xl h-40 animate-pulse" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8a] rounded-xl p-4 text-white">
              <CalendarDaysIcon className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats?.total_kegiatan || 0}</p>
              <p className="text-sm opacity-80">Kegiatan</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <UsersIcon className="w-6 h-6 mb-2 text-purple-600" />
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total_audiensi || 0}
              </p>
              <p className="text-sm text-gray-500">Audiensi</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <ClockIcon className="w-6 h-6 mb-2 text-green-600" />
              <p className="text-3xl font-bold text-gray-900">
                {stats?.upcoming || 0}
              </p>
              <p className="text-sm text-gray-500">Akan Datang</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="w-6 h-6 mb-2 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-amber-600">📋</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total || 0}
              </p>
              <p className="text-sm text-gray-500">Total Agenda</p>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">
                Agenda Mendatang
              </h3>
              <Link
                href="/dashboard/agenda"
                className="text-sm text-[#1e3a5f] font-medium"
              >
                Lihat semua
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Belum ada agenda mendatang</p>
                <Link
                  href="/dashboard?new=agenda"
                  className="inline-block mt-4 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-medium rounded-lg"
                >
                  Buat Agenda Baru
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                          event.jenis === "agenda"
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        <span className="text-xs font-medium">
                          {formatDate(event.date).split(" ")[1]}
                        </span>
                        <span className="text-lg font-bold">
                          {formatDate(event.date).split(" ")[0].replace(",", "")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.time_start} - {event.time_end}
                          {event.location && ` • ${event.location}`}
                        </p>
                        <span
                          className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                            event.jenis === "agenda"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {event.jenis === "agenda" ? "Kegiatan" : "Audiensi"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Aksi Cepat
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard?new=agenda"
                className="h-12 bg-[#1e3a5f] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#2d5a8a] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Kegiatan Baru
              </Link>
              <Link
                href="/dashboard?new=audiensi"
                className="h-12 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Audiensi Baru
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
