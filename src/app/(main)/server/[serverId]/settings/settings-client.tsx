"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  School,
  Shield,
  Save,
  Loader2,
  ArrowLeft,
  Lock,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { updateServerSchema } from "@/features/servers/validations/server.schema";

interface ServerSettingsClientProps {
  serverId: string;
  schoolName: string;
  graduationYear: number;
  description: string;
}

export function ServerSettingsClient({
  serverId,
  schoolName,
  graduationYear,
  description,
}: ServerSettingsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [adminCode, setAdminCode] = useState("");

  const [codeCurrent, setCodeCurrent] = useState("");
  const [codeNew, setCodeNew] = useState("");
  const [codeConfirm, setCodeConfirm] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateServerSchema),
    defaultValues: {
      schoolName,
      graduationYear,
      description,
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: any) => {
    if (!adminCode.trim()) {
      toast.error("Masukkan Archive Admin Code!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/servers/${serverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, adminCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal menyimpan perubahan");
      }

      toast.success("Pengaturan server berhasil disimpan!");
      form.reset(data);
      setAdminCode("");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan perubahan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCode = async () => {
    if (!codeCurrent.trim() || !codeNew.trim() || !codeConfirm.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    }
    if (codeNew.length < 6) {
      toast.error("Kode admin baru minimal 6 karakter");
      return;
    }
    if (codeNew !== codeConfirm) {
      toast.error("Konfirmasi kode admin baru tidak cocok");
      return;
    }

    setCodeLoading(true);
    try {
      const response = await fetch(`/api/servers/${serverId}/admin/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change",
          code: codeCurrent,
          newCode: codeNew,
          codeConfirm,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengganti kode admin");
      }

      toast.success(result.message || "Kode admin berhasil diganti!");
      setCodeCurrent("");
      setCodeNew("");
      setCodeConfirm("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengganti kode admin";
      toast.error(message);
    } finally {
      setCodeLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-gray-50/50">
          <School className="text-blue-600 dark:text-blue-400" size={20} />
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Informasi Server</h3>
        </div>
        <div className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Sekolah
              </label>
              <Input
                {...form.register("schoolName")}
                placeholder="SMA Negeri 1 Jakarta"
                className="rounded-xl h-12"
              />
              {form.formState.errors.schoolName && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.schoolName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Tahun Angkatan
              </label>
              <Input
                {...form.register("graduationYear")}
                type="number"
                className="rounded-xl h-12"
              />
              {form.formState.errors.graduationYear && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.graduationYear.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Deskripsi
              </label>
              <Textarea
                {...form.register("description")}
                placeholder="Deskripsi singkat tentang server alumni ini..."
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-gray-50/50">
          <Shield className="text-amber-600 dark:text-amber-400" size={20} />
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Verifikasi Admin</h3>
        </div>
        <div className="p-8">
          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-2xl space-y-2 border border-amber-100">
            <label className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Shield size={14} />
              Archive Admin Code
            </label>
            <Input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Masukkan 6-digit kode admin"
              className="h-10 border-amber-200 dark:border-amber-800 focus:ring-amber-200 text-center font-mono tracking-widest"
              required
              maxLength={6}
            />
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              Kode admin diperlukan untuk menyimpan perubahan server.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 rounded-xl"
          onClick={() => router.push(`/server/${serverId}`)}
          disabled={loading}
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali
        </Button>
        <Button
          type="submit"
          className="flex-[2] h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" size={18} />
          ) : (
            <Save size={18} className="mr-2" />
          )}
          Simpan Perubahan
        </Button>
      </div>
    </form>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-gray-50/50">
          <Lock className="text-red-600 dark:text-red-400" size={20} />
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Ganti Admin Code</h3>
        </div>
        <div className="p-8 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <KeyRound size={14} className="text-zinc-400 dark:text-zinc-500" />
              Kode Admin Saat Ini
            </label>
            <Input
              type="password"
              value={codeCurrent}
              onChange={(e) => setCodeCurrent(e.target.value)}
              placeholder="Masukkan kode admin saat ini"
              className="rounded-xl h-12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <KeyRound size={14} className="text-zinc-400 dark:text-zinc-500" />
              Kode Admin Baru
            </label>
            <Input
              type="password"
              value={codeNew}
              onChange={(e) => setCodeNew(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="rounded-xl h-12"
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <KeyRound size={14} className="text-zinc-400 dark:text-zinc-500" />
              Konfirmasi Kode Baru
            </label>
            <Input
              type="password"
              value={codeConfirm}
              onChange={(e) => setCodeConfirm(e.target.value)}
              placeholder="Ulangi kode admin baru"
              className="rounded-xl h-12"
            />
          </div>

          <Button
            onClick={handleChangeCode}
            variant="outline"
            className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 font-bold h-11 rounded-xl"
            disabled={codeLoading}
          >
            {codeLoading ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              <KeyRound size={18} className="mr-2" />
            )}
            Ganti Kode Admin
          </Button>
        </div>
      </div>
    </>
  );
}
