"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, UserIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, UserIcon as UserIconSolid } from "@heroicons/react/24/solid";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Beranda",
      href: "/dashboard",
      icon: pathname === "/dashboard" || pathname === "/" ? HomeIconSolid : HomeIcon,
    },
    {
      name: "Akun",
      href: "/akun",
      icon: pathname === "/akun" ? UserIconSolid : UserIcon,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-20 h-14 transition-colors ${
                isActive ? "text-[#1e3a5f]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[11px] font-medium">{item.name}</span>
            </Link>
          );
        })}

        {/* FAB - Agenda */}
        <Link
          href="/dashboard?new=agenda"
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8a] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
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
    </nav>
  );
}
