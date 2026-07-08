"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  PlusCircle,
  Pencil,
  Trash2,
  Shield,
  X,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/utils/cn";
import toast from "react-hot-toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementsClientProps {
  serverId: string;
  initialAnnouncements: Announcement[];
}

export function AnnouncementsClient({
  serverId,
  initialAnnouncements,
}: AnnouncementsClientProps) {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Announcement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Announcement | null>(null);

  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ title: "", content: "" });

  const resetForm = () => setFormData({ title: "", content: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, adminCode }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal membuat pengumuman");

      setAnnouncements([result, ...announcements]);
      setShowModal(false);
      resetForm();
      setAdminCode("");
      toast.success("Pengumuman berhasil dibuat!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/servers/${serverId}/announcements/${showEditModal.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, adminCode }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal mengupdate pengumuman");

      setAnnouncements((prev) =>
        prev.map((a) => (a.id === result.id ? result : a))
      );
      setShowEditModal(null);
      resetForm();
      setAdminCode("");
      toast.success("Pengumuman berhasil diupdate!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDeleteModal) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/servers/${serverId}/announcements/${showDeleteModal.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminCode }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal menghapus pengumuman");

      setAnnouncements((prev) => prev.filter((a) => a.id !== showDeleteModal.id));
      setShowDeleteModal(null);
      setAdminCode("");
      toast.success("Pengumuman berhasil dihapus!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Pengumuman Server</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Bagikan informasi penting kepada anggota server.</p>
        </div>
        <Button
          onClick={() => {
            setShowModal(true);
            resetForm();
          }}
          className="flex gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-12 shadow-lg shadow-blue-100"
        >
          <PlusCircle size={20} />
          Buat Pengumuman
        </Button>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center py-16 px-4 space-y-4">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto">
            <Megaphone size={24} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="space-y-1">
            <p className="text-zinc-800 dark:text-zinc-200 font-semibold">Belum ada pengumuman</p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Bagikan informasi penting pertama Anda.</p>
          </div>
          <Button variant="outline" onClick={() => setShowModal(true)} className="h-10 rounded-xl">
            Buat Pengumuman
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {a.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mt-1 mb-3">
                    <Calendar size={12} />
                    <span>{new Date(a.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm whitespace-pre-wrap">{a.content}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setShowEditModal(a);
                      setFormData({ title: a.title, content: a.content });
                    }}
                    className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(a)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-full h-2", showEditModal ? "bg-amber-500" : "bg-blue-600")} />
            <button
              onClick={() => {
                setShowModal(false);
                setShowEditModal(null);
              }}
              className="absolute top-6 right-6 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400"
            >
              <X size={24} />
            </button>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {showEditModal ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Sampaikan informasi penting untuk anggota server.
              </p>
            </div>

            <form onSubmit={showEditModal ? handleUpdate : handleCreate} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Judul</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Judul pengumuman"
                  className="rounded-xl h-12"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Konten</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Isi pengumuman..."
                  className="rounded-xl min-h-[120px]"
                  required
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2 uppercase tracking-widest">
                    <Shield size={14} />
                    Archive Admin Code
                  </label>
                  <Input
                    type="password"
                    placeholder="6-Digit Admin Code"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="h-10 border-blue-100 focus:ring-blue-200"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 rounded-xl h-12"
                    onClick={() => {
                      setShowModal(false);
                      setShowEditModal(null);
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className={cn(
                      "flex-[2] rounded-xl h-12 font-bold shadow-lg",
                      showEditModal
                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                    )}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {showEditModal ? "Simpan Perubahan" : "Simpan Pengumuman"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Hapus Pengumuman?</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <form onSubmit={handleDelete} className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-2xl space-y-2 text-left">
                <label className="text-[10px] font-bold text-red-700 flex items-center gap-2 uppercase tracking-widest">
                  <Shield size={12} />
                  Archive Admin Code
                </label>
                <Input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="h-10 border-red-100 focus:ring-red-200"
                  placeholder="Masukkan kode admin"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-12 rounded-xl"
                  onClick={() => setShowDeleteModal(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] h-12 rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 font-bold"
                  disabled={loading}
                >
                  {loading ? "Menghapus..." : "Ya, Hapus"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
