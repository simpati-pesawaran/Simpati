"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
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

  // User management state
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
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-[3px] border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Header */}
      <div
        className="bg-gradient-to-br from-[#1e3a5f] via-[#2563eb] to-[#7c3aed] px-4 pb-6 relative overflow-hidden"
        style={{ paddingTop: `calc(0.75rem + env(safe-area-inset-top))` }}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-white/80 text-xs font-medium">Akun</span>
              {isSuperadmin && (
                <span className="px-1.5 py-0.5 bg-yellow-400/20 text-yellow-200 text-[9px] font-medium rounded">Superadmin</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session.user?.image ? (
              <img src={session.user.image} alt="" className="w-14 h-14 rounded-full border-2 border-white/30" />
            ) : (
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{session.user?.name?.[0] || "U"}</span>
              </div>
            )}
            <div>
              <h2 className="text-white text-lg font-bold">{profile?.name || session.user?.name}</h2>
              <p className="text-white/60 text-xs">{session.user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 -mt-3">
        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold text-sm">Profil</h3>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg">
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setIsEditing(false); setFormData({ name: profile?.name || "", division: profile?.division || "" }); }} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                  Batal
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg disabled:opacity-50">
                  {isSaving ? "..." : "Simpan"}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nama</label>
              {isEditing ? (
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
              ) : (
                <p className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm">{profile?.name || "-"}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Divisi</label>
              {isEditing ? (
                <input type="text" value={formData.division} onChange={(e) => setFormData({ ...formData, division: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
              ) : (
                <p className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm">{profile?.division || "-"}</p>
              )}
            </div>
          </div>
        </div>

        {/* User Management (Superadmin Only) */}
        {isSuperadmin && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mt-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 font-semibold text-sm">Manajemen User</h3>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-medium rounded-full">{users.length} user</span>
            </div>

            {isLoadingUsers ? (
              <div className="py-4 text-center">
                <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Belum ada user terdaftar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{user.name || "-"}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{user.division || "-"} • {formatDate(user.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        {user.status === "pending" && (
                          <>
                            <button onClick={() => handleApprove(user.id)} disabled={actionLoading === user.id} className="px-2 py-1 bg-green-500 text-white text-[10px] font-medium rounded-lg hover:bg-green-600 disabled:opacity-50">
                              Approve
                            </button>
                            <button onClick={() => setShowRejectModal(user.id)} className="px-2 py-1 bg-red-500 text-white text-[10px] font-medium rounded-lg hover:bg-red-600">
                              Tolak
                            </button>
                          </>
                        )}
                        {user.status === "approved" && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">Aktif</span>
                        )}
                        {user.status === "rejected" && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-medium rounded-full">Ditolak</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mt-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500">Status</span>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                profile?.status === "approved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {profile?.status === "approved" ? "Aktif" : "Menunggu"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-500">Database</span>
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Terhubung
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full mt-3 h-12 bg-red-50 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>

        <p className="text-center text-[10px] text-gray-400 mt-6 mb-4">
          SIMPATI v1.0.0<br />
          Sistem Informasi Manajemen Protokol & Agenda Terintegrasi
        </p>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowRejectModal(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-3">Tolak Pendaftaran</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Alasan penolakan (opsional)" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm mb-4 resize-none" rows={3} />
            <div className="flex gap-2">
              <button onClick={() => setShowRejectModal(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm">Batal</button>
              <button onClick={() => handleReject(showRejectModal)} disabled={actionLoading === showRejectModal} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium text-sm disabled:opacity-50">Tolak</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}