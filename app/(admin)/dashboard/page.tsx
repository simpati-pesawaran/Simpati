"use client";

import { Card } from "../../components/ui";
import {
  CalendarCheckIcon,
  UsersIcon,
  InboxIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

const stats = [
  {
    name: "Kegiatan",
    count: 12,
    icon: CalendarCheckIcon,
    color: "bg-blue-50 text-blue-600",
  },
  {
    name: "Audensi",
    count: 8,
    icon: UsersIcon,
    color: "bg-purple-50 text-purple-600",
  },
  {
    name: "Usulan Baru",
    count: 3,
    icon: InboxIcon,
    color: "bg-amber-50 text-amber-600",
  },
  {
    name: "Galeri",
    count: 24,
    icon: PhotoIcon,
    color: "bg-green-50 text-green-600",
  },
];

const recentActivities = [
  {
    id: 1,
    title: "Rapat Koordinasi Tim",
    date: "15 Agustus 2026",
    time: "09:00 - 11:00",
    type: "Kegiatan",
  },
  {
    id: 2,
    title: "Audiensi Komunitas",
    date: "16 Agustus 2026",
    time: "14:00 - 15:30",
    type: "Audensi",
  },
  {
    id: 3,
    title: "Workshop Digital",
    date: "18 Agustus 2026",
    time: "10:00 - 16:00",
    type: "Kegiatan",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-4 animate-fadeIn">
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Selamat Datang!</h2>
        <p className="text-sm text-gray-500">Berikut ringkasan aktivitas Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                  <p className="text-xs text-gray-500">{stat.name}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Aktivitas Mendatang</h3>
          <button className="text-sm text-navy-800 font-medium">Lihat semua</button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <Card key={activity.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">
                    {activity.type.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activity.date} • {activity.time}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="h-12 bg-navy-800 text-white rounded-xl font-medium hover:bg-navy-700 transition-colors">
            + Kegiatan
          </button>
          <button className="h-12 bg-navy-800 text-white rounded-xl font-medium hover:bg-navy-700 transition-colors">
            + Audensi
          </button>
        </div>
      </div>
    </div>
  );
}
