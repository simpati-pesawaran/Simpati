"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDaysIcon,
  UsersIcon,
  CalendarIcon,
  PhotoIcon,
  InboxIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../../lib/utils";

const navItems = [
  {
    name: "Kegiatan",
    href: "/kegiatan",
    icon: CalendarDaysIcon,
  },
  {
    name: "Audensi",
    href: "/audensi",
    icon: UsersIcon,
  },
  {
    name: "Kalender",
    href: "/kalender",
    icon: CalendarIcon,
  },
  {
    name: "Galeri",
    href: "/galeri",
    icon: PhotoIcon,
  },
  {
    name: "Usulan",
    href: "/usulan",
    icon: InboxIcon,
  },
  {
    name: "Profil",
    href: "/profile",
    icon: UserIcon,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom"
      style={{ paddingBottom: "var(--safe-area-bottom)" }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-lg transition-colors",
                isActive ? "text-navy-800" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-navy-800 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
