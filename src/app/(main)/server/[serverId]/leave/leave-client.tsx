"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/shared/components/ui/button";

interface LeaveServerClientProps {
  serverId: string;
  schoolName: string;
  isOwner: boolean;
}

export function LeaveServerClient({
  serverId,
  schoolName,
  isOwner,
}: LeaveServerClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLeave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/servers/${serverId}/members/me`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal keluar dari server");
      }

      toast.success(result.message || "Berhasil keluar dari server");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal keluar dari server";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (isOwner) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Tidak Dapat Keluar
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Anda adalah pemilik server <strong>{schoolName}</strong>. Pemilik
            server tidak bisa keluar. Gunakan fitur Hapus Server di Dashboard
            jika ingin menghapus server ini.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl"
          onClick={() => router.push(`/server/${serverId}`)}
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali ke Server
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-8 text-center space-y-6">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
        <LogOut size={32} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Keluar dari Server</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Apakah Anda yakin ingin keluar dari server{" "}
          <strong>{schoolName}</strong>? Anda harus dimasukkan kembali oleh
          anggota lain untuk bergabung lagi.
        </p>
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 rounded-xl"
          onClick={() => router.push(`/server/${serverId}`)}
          disabled={loading}
        >
          <ArrowLeft size={18} className="mr-2" />
          Batal
        </Button>
        <Button
          variant="danger"
          className="flex-[2] h-12 rounded-xl font-bold"
          onClick={handleLeave}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" size={18} />
          ) : (
            <LogOut size={18} className="mr-2" />
          )}
          Ya, Keluar
        </Button>
      </div>
    </div>
  );
}
