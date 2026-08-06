"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CalendarIcon, UserIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, CalendarIcon as CalendarIconSolid, UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";

export function BottomNav() {
  const pathname = usePathname();

  const isAgendaActive = pathname?.includes("/kegiatan") || pathname?.includes("/agenda");

  const navItems = [
    {
      name: "Beranda",
      href: "/dashboard",
      icon: pathname === "/dashboard" || pathname === "/" ? HomeIconSolid : HomeIcon,
    },
    {
      name: "Calendar",
      href: "/kalender",
      icon: isAgendaActive ? CalendarIconSolid : CalendarIcon,
    },
    {
      name: "Akun",
      href: "/akun",
      icon: pathname === "/akun" ? UserIconSolid : UserIcon,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 relative">
        {/* Background glow behind FAB */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-xl" />

        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
          const Icon = item.icon;

          // Center item is the FAB
          if (index === 1) {
            return (
              <div key={item.name} className="relative">
                {/* FAB - Agenda */}
                <Link
                  href="/kegiatan?action=new"
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-white/30"
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-20 h-14 transition-colors ${
                isActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[11px] font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute bottom-2 w-1 h-1 bg-indigo-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}