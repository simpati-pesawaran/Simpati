"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  division: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AkunPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const profile = (session?.user as any)?.profile;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    division: "",
  });

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const isSuperadmin = profile?.role === "superadmin";

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        division: profile.division || "",
      });
    }
    if (isSuperadmin) {
      fetchUsers();
    }
  }, [profile, isSuperadmin]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/auth/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          division: formData.division,
        }),
      });

      if (res.ok) {
        await update();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, action: "approve" }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error approving user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          action: "reject",
          reason: rejectReason,
        }),
      });

      if (res.ok) {
        setShowRejectModal(null);
        setRejectReason("");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const pendingUsers = users.filter((u) => u.status === "pending");
  const activeUsers = users.filter((u) => u.status === "approved");

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
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold">Akun</h1>
            <p className="text-white/60 text-xs">Pengaturan profil & akun</p>
          </div>
          {isSuperadmin && (
            <span className="px-2 py-1 bg-yellow-400/20 text-yellow-200 text-[10px] font-bold rounded-lg">
              Superadmin
            </span>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Avatar & Info */}
          <div className="p-5 flex items-center gap-4 border-b border-gray-100">
            <div className="relative">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                profile?.status === "approved" ? "bg-green-500" : "bg-amber-500"
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {profile?.name || session.user?.name}
              </h2>
              <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                profile?.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {profile?.status === "approved" ? "Aktif" : "Menunggu"}
              </span>
            </div>
          </div>

          {/* Edit Form */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Informasi Profil</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg active:scale-95 transition-all"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ name: profile?.name || "", division: profile?.division || "" });
                    }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg active:scale-95 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {isSaving ? "..." : "Simpan"}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-gray-500 font-medium mb-1.5">Nama</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-900 font-medium">
                    {profile?.name || "-"}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-medium mb-1.5">Divisi</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-900 font-medium">
                    {profile?.division || "-"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Management - Superadmin Only */}
        {isSuperadmin && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Manajemen User</h3>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg">
                  {pendingUsers.length} pending
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg">
                  {activeUsers.length} aktif
                </span>
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">Belum ada user terdaftar</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {users.map((user) => (
                  <div key={user.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-gray-600">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name || "-"}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {user.division || "Tanpa divisi"} • {formatDate(user.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {user.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(user.id)}
                              disabled={actionLoading === user.id}
                              className="px-2.5 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 active:scale-95 transition-all"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setShowRejectModal(user.id)}
                              className="px-2.5 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 active:scale-95 transition-all"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        {user.status === "approved" && (
                          <span className="px-2.5 py-1.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg">
                            Aktif
                          </span>
                        )}
                        {user.status === "rejected" && (
                          <span className="px-2.5 py-1.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg">
                            Ditolak
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-red-50 active:bg-red-50/50 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-600">Keluar</p>
              <p className="text-[11px] text-red-400">Keluar dari akun ini</p>
            </div>
          </button>
        </div>

        {/* App Info */}
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-gray-900">SIMPATI</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Sistem Informasi Manajemen</p>
          <p className="text-[10px] text-gray-400 mt-1">Protokol & Agenda Terintegrasi</p>
          <p className="text-[10px] text-gray-300 mt-2">v1.0.0</p>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowRejectModal(null)}>
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">Tolak Pendaftaran</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Alasan penolakan (opsional)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/40"
                rows={3}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowRejectModal(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  disabled={actionLoading === showRejectModal}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
