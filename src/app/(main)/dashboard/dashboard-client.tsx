"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, 
  LogIn, 
  Users, 
  Server as ServerIcon,
  MoreVertical, 
  School, 
  MessageSquare, 
  Activity, 
  Copy, 
  Edit, 
  Trash, 
  UserPlus,
  X,
  Loader2,
  Search,
  Shield,
  PlusCircle
} from "lucide-react";
import { 
  createServerSchema, 
  updateServerSchema,
  joinServerSchema, 
  type CreateServerInput,
  type UpdateServerInput, 
  type JoinServerInput 
} from "@/features/servers/validations/server.schema";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import Link from "next/link";
import toast from "react-hot-toast";
import { writeToClipboard } from "@/shared/utils/clipboard";

interface DashboardClientProps {
  servers: any[];
  stats: {
    totalServers: number;
  };
}

export function DashboardClient({ servers, stats }: DashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showEditServerModal, setShowEditServerModal] = useState<any | null>(null);
  const [showDeleteServerModal, setShowDeleteServerModal] = useState<any | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteAdminCode, setDeleteAdminCode] = useState("");
  const [editAdminCode, setEditAdminCode] = useState("");

  const createForm = useForm({
    resolver: zodResolver(createServerSchema),
    defaultValues: {
      schoolName: "",
      graduationYear: new Date().getFullYear(),
      description: "",
      adminCode: "",
      confirmAdminCode: "",
    }
  });

  const joinForm = useForm({
    resolver: zodResolver(joinServerSchema),
    defaultValues: {
      serverCode: "",
    }
  });

  const editForm = useForm({
    resolver: zodResolver(updateServerSchema),
  });

  const [confirmCreateData, setConfirmCreateData] = useState<CreateServerInput | null>(null);

  const onCreateSubmit = async (data: CreateServerInput) => {
    setConfirmCreateData(data);
  };

  const confirmCreateServer = async () => {
    if (!confirmCreateData) return;
    setLoading(true);
    try {
      const response = await fetch("/api/servers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmCreateData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal membuat server");
      
      toast.success("Server berhasil dibuat!");
      createForm.reset();
      setShowCreateModal(false);
      setConfirmCreateData(null);
      router.refresh();
      router.push(`/server/${result.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onEditSubmit = async (data: UpdateServerInput) => {
    if (!showEditServerModal) return;
    if (!editAdminCode.trim()) return toast.error("Masukkan Archive Admin Code!");
    
    setLoading(true);
    try {
      const response = await fetch(`/api/servers/${showEditServerModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, adminCode: editAdminCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal mengupdate server");
      toast.success("Server berhasil diupdate!");
      router.refresh();
      setShowEditServerModal(null);
      setEditAdminCode("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDeleteServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDeleteServerModal) return;
    if (!deleteAdminCode.trim()) return toast.error("Masukkan Archive Admin Code!");

    setLoading(true);
    try {
      const response = await fetch(`/api/servers/${showDeleteServerModal.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminCode: deleteAdminCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal menghapus server");
      
      toast.success("Server berhasil dihapus!");
      setShowDeleteServerModal(null);
      setDeleteAdminCode("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onJoinSubmit = async (data: JoinServerInput) => {
    setLoading(true);
    try {
      const response = await fetch("/api/servers/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal bergabung");
      
      toast.success(result.message || "Berhasil bergabung!");
      joinForm.reset();
      setShowJoinModal(false);
      router.refresh();
      router.push(`/server/${result.serverId}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await writeToClipboard(text);
    toast.success("ID Server disalin!");
    setActiveMenu(null);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Stats + Actions Row */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Stat Card */}
        <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-900 rounded-2xl px-4 py-2.5 shadow-sm shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shrink-0">
            <ServerIcon size={18} className="text-white" />
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-blue-100 dark:border-blue-900 bg-white dark:bg-zinc-900 shrink-0">
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{stats.totalServers}</span>
          </div>
          <div className="h-10 px-2.5 bg-blue-50 dark:bg-blue-950 flex items-center rounded-lg border border-blue-100 dark:border-blue-900 shrink-0">
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Aktif</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-1 gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowJoinModal(true)}
            className="flex-1 h-11 rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium"
          >
            <LogIn size={18} className="mr-2" />
            Gabung
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl font-medium shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            Buat
          </Button>
        </div>
      </div>

      {/* Servers Grid */}
      <div className="space-y-6">
        {servers.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
              <School size={32} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Belum Ada Server</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Anda belum bergabung di server manapun.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowJoinModal(true)}>Gabung Server</Button>
              <Button onClick={() => setShowCreateModal(true)}>Buat Server</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((server) => (
              <div 
                key={server.id} 
                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                        {server.schoolName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {server.schoolName}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Angkatan {server.graduationYear}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === server.id ? null : server.id)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors duration-150"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeMenu === server.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-10 animate-in fade-in duration-150">
                          <button onClick={() => copyToClipboard(server.serverCode)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <Copy size={14} /> Salin ID Server
                          </button>
                          <button onClick={() => { setShowEditServerModal(server); editForm.reset({ schoolName: server.schoolName, graduationYear: server.graduationYear, description: server.description || "" }); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <Edit size={14} /> Edit Server
                          </button>
                          <div className="border-t border-zinc-100 dark:border-zinc-800 my-1"></div>
                          <button onClick={() => { setShowDeleteServerModal(server); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                            <Trash size={14} /> Hapus Server
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <Users size={14} />
                    <span>{server._count.members} Alumni</span>
                  </div>
                  <Link 
                    href={`/server/${server.id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors text-sm font-medium px-3 h-8"
                  >
                    Masuk
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600 rounded-t-2xl"></div>
            <button onClick={() => setShowCreateModal(false)} className="absolute top-5 right-5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              <X size={20} />
            </button>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Buat Server Baru</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Hubungkan alumni sekolah Anda dalam satu tempat.</p>
            </div>
<form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nama Sekolah</label>
                <Input {...createForm.register("schoolName")} placeholder="SMA Negeri ..." className="rounded-xl h-11 mt-1.5" />
                {createForm.formState.errors.schoolName && (
                  <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.schoolName.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Tahun Angkatan</label>
                <Input {...createForm.register("graduationYear")} type="number" className="rounded-xl h-12 mt-1" />
                {createForm.formState.errors.graduationYear && (
                  <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.graduationYear.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">PIN Admin (6 Karakter)</label>
                <Input 
                  {...createForm.register("adminCode")} 
                  type="password" 
                  maxLength={6}
                  placeholder="Buat 6 digit PIN rahasia" 
                  className="rounded-xl h-12 mt-1 font-mono tracking-widest text-center" 
                />
                {createForm.formState.errors.adminCode && (
                  <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.adminCode.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Konfirmasi PIN</label>
                <Input 
                  {...createForm.register("confirmAdminCode")} 
                  type="password" 
                  maxLength={6}
                  placeholder="Ulangi PIN admin" 
                  className="rounded-xl h-12 mt-1 font-mono tracking-widest text-center" 
                />
                {createForm.formState.errors.confirmAdminCode && (
                  <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.confirmAdminCode.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Harap simpan! PIN ini digunakan untuk mengubah/menghapus server.</p>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 rounded-xl font-bold">
                {loading ? <Loader2 className="animate-spin" /> : <PlusCircle className="mr-2" size={18} />}
                Buat Server
              </Button>
            </form>
           </div>
         </div>
       )}

       {confirmCreateData && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
             <button onClick={() => setConfirmCreateData(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
               <X size={24} />
             </button>
             <div className="space-y-2">
               <h2 className="text-2xl font-bold text-gray-900">Konfirmasi Buat Server</h2>
               <p className="text-gray-500 text-sm">Periksa kembali data server Anda.</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm">
               <div><span className="font-bold">Nama Sekolah:</span> {confirmCreateData.schoolName}</div>
               <div><span className="font-bold">Tahun Angkatan:</span> {confirmCreateData.graduationYear}</div>
               <div><span className="font-bold">Deskripsi:</span> {confirmCreateData.description || "-"}</div>
             </div>
             <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
               <p className="text-xs text-amber-800 font-medium">
                 Pastikan PIN Admin sudah benar. Anda akan memerlukan PIN ini untuk mengedit/menghapus server nanti.
               </p>
             </div>
             <div className="flex gap-3 pt-2">
               <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setConfirmCreateData(null)} disabled={loading}>Batal</Button>
               <Button className="flex-[2] h-12 rounded-xl bg-amber-500 text-white font-bold" onClick={confirmCreateServer} disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : "Ya, Buat Server"}
               </Button>
             </div>
           </div>
         </div>
       )}

       {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <button onClick={() => setShowJoinModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Gabung Server</h2>
              <p className="text-gray-500 text-sm">Gunakan Server ID unik teman Anda.</p>
            </div>
            <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700">ID Server</label>
                <Input {...joinForm.register("serverCode")} placeholder="ABC-123" className="rounded-xl h-12 mt-1 text-center font-mono uppercase tracking-widest" />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-indigo-600 rounded-xl font-bold">
                {loading ? <Loader2 className="animate-spin" /> : <UserPlus className="mr-2" size={18} />}
                Gabung Sekarang
              </Button>
            </form>
          </div>
        </div>
      )}

      {showDeleteServerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 relative text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Hapus Server?</h3>
              <p className="text-sm text-gray-500">Tindakan permanen. Semua data akan hilang.</p>
            </div>
            <form onSubmit={onDeleteServer} className="space-y-4">
              <div className="bg-red-50 p-4 rounded-2xl space-y-2 text-left border border-red-100">
                <label className="text-[10px] font-bold text-red-700 flex items-center gap-2 uppercase tracking-widest">
                  <Shield size={12} /> Archive Admin Code
                </label>
                <Input 
                  type="password" 
                  value={deleteAdminCode} 
                  onChange={(e) => setDeleteAdminCode(e.target.value)} 
                  className="h-10 border-red-100 focus:ring-red-200 text-center font-bold"
                  placeholder="6-digit pin"
                  required 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setShowDeleteServerModal(null)}>Batal</Button>
                <Button type="submit" className="flex-[2] h-12 rounded-xl bg-red-600 text-white font-bold" disabled={loading}>
                  {loading ? "Menghapus..." : "Ya, Hapus Server"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

{showEditServerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
            <button onClick={() => {
              setShowEditServerModal(null);
              editForm.reset();
              setEditAdminCode("");
            }} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Edit Server</h2>
              <p className="text-gray-500 text-sm">Ubah informasi server Anda.</p>
            </div>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700">Nama Sekolah</label>
                <Input {...editForm.register("schoolName")} className="rounded-xl h-12 mt-1" />
                {editForm.formState.errors.schoolName && (
                  <p className="text-xs text-red-500 mt-1">{editForm.formState.errors.schoolName.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Tahun Angkatan</label>
                <Input {...editForm.register("graduationYear")} type="number" className="rounded-xl h-12 mt-1" />
                {editForm.formState.errors.graduationYear && (
                  <p className="text-xs text-red-500 mt-1">{editForm.formState.errors.graduationYear.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Deskripsi</label>
                <Input {...editForm.register("description")} className="rounded-xl h-12 mt-1" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Archive Admin Code</label>
                <Input 
                  type="password" 
                  value={editAdminCode} 
                  onChange={(e) => setEditAdminCode(e.target.value)} 
                  className="rounded-xl h-12 mt-1" 
                  placeholder="Masukkan kode admin"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 h-12 rounded-xl" 
                  onClick={() => {
                    setShowEditServerModal(null);
                    editForm.reset();
                    setEditAdminCode("");
                  }}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 rounded-xl font-bold text-white">
                  {loading ? <Loader2 className="animate-spin" /> : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
