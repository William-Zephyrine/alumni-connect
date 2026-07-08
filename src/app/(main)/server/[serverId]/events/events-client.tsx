"use client";

import { useState } from "react";
import {
  CalendarDays,
  PlusCircle,
  Pencil,
  Trash2,
  Shield,
  X,
  Loader2,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/utils/cn";
import toast from "react-hot-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EventsClientProps {
  serverId: string;
  initialEvents: Event[];
}

export function EventsClient({ serverId, initialEvents }: EventsClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Event | null>(null);

  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
  });

  const resetForm = () =>
    setFormData({ title: "", description: "", eventDate: "", location: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, adminCode }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal membuat event");

      setEvents(
        [...events, result].sort(
          (a, b) =>
            new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        )
      );
      setShowModal(false);
      resetForm();
      setAdminCode("");
      toast.success("Event berhasil dibuat!");
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
        `/api/servers/${serverId}/events/${showEditModal.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, adminCode }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal mengupdate event");

      setEvents((prev) =>
        prev
          .map((ev) => (ev.id === result.id ? result : ev))
          .sort(
            (a, b) =>
              new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
          )
      );
      setShowEditModal(null);
      resetForm();
      setAdminCode("");
      toast.success("Event berhasil diupdate!");
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
        `/api/servers/${serverId}/events/${showDeleteModal.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminCode }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal menghapus event");

      setEvents((prev) => prev.filter((ev) => ev.id !== showDeleteModal.id));
      setShowDeleteModal(null);
      setAdminCode("");
      toast.success("Event berhasil dihapus!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Event Alumni</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Jadwal kegiatan dan acara alumni.</p>
        </div>
        <Button
          onClick={() => {
            setShowModal(true);
            resetForm();
          }}
          className="flex gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 h-12 shadow-lg shadow-indigo-100"
        >
          <PlusCircle size={20} />
          Buat Event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center py-16 px-4 space-y-4">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto">
            <CalendarDays size={24} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="space-y-1">
            <p className="text-zinc-800 dark:text-zinc-200 font-semibold">Belum ada event</p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Jadwalkan kegiatan alumni pertama Anda.</p>
          </div>
          <Button variant="outline" onClick={() => setShowModal(true)} className="h-10 rounded-xl">
            Buat Event
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {ev.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-3">
                      <span className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                        <CalendarDays size={12} />
                        {formatDate(ev.eventDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(ev.eventDate)}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {ev.location}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm whitespace-pre-wrap">{ev.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setShowEditModal(ev);
                        const d = new Date(ev.eventDate);
                        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16);
                        setFormData({
                          title: ev.title,
                          description: ev.description,
                          eventDate: local,
                          location: ev.location || "",
                        });
                      }}
                      className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(ev)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-full h-2", showEditModal ? "bg-amber-500" : "bg-indigo-600")} />
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
                {showEditModal ? "Edit Event" : "Buat Event Baru"}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Atur jadwal kegiatan alumni.</p>
            </div>

            <form onSubmit={showEditModal ? handleUpdate : handleCreate} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Judul Event</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Reuni Akbar 2024"
                  className="rounded-xl h-12"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Tanggal & Waktu</label>
                <Input
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="rounded-xl h-12"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Lokasi</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Gedung Serbaguna, Jakarta"
                  className="rounded-xl h-12"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Deskripsi</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi event..."
                  className="rounded-xl min-h-[100px]"
                  required
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2 uppercase tracking-widest">
                    <Shield size={14} />
                    Archive Admin Code
                  </label>
                  <Input
                    type="password"
                    placeholder="6-Digit Admin Code"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="h-10 border-indigo-100 focus:ring-indigo-200"
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
                        : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                    )}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {showEditModal ? "Simpan Perubahan" : "Simpan Event"}
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
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Hapus Event?</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Tindakan ini tidak dapat dibatalkan.</p>
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
