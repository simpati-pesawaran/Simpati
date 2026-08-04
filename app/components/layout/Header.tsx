"use client";

import { BellIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

interface HeaderProps {
  title?: string;
  showBell?: boolean;
}

export function Header({ title = "SIMPATI", showBell = true }: HeaderProps) {
  const { data: session } = useSession();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Navy Gradient Background */}
      <div
        className="bg-gradient-to-r from-navy-800 to-navy-700"
        style={{ paddingTop: "var(--safe-area-top)" }}
      >
        <div className="h-14 px-4 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-white font-semibold text-lg">{title}</h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Bell Icon */}
            {showBell && (
              <button className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                <BellIcon className="w-6 h-6" />
                {/* Badge */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full" />
              </button>
            )}

            {/* Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white/30"
                  />
                ) : (
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {session?.user?.name?.[0] || "U"}
                    </span>
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-fadeIn">
                  {session?.user && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user.email}
                      </p>
                    </div>
                  )}
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowProfile(false)}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-gray-50"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
