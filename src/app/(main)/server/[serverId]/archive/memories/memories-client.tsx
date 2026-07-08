"use client";

import { useState, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  Download, 
  Shield, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Pencil, 
  Eye, 
  X, 
  Loader2,
  FileIcon,
  PlusCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils/cn";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

interface Memory {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
}

interface MemoriesClientProps {
  serverId: string;
  initialMemories: Memory[];
}

export function MemoriesClient({ serverId, initialMemories }: MemoriesClientProps) {
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || "", {
      path: "/api/socket",
      addTrailingSlash: false,
    });
    
    socketInstance.on("connect", () => {
      socketInstance.emit("join-server", serverId);
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, [serverId]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Memory | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Memory | null>(null);
  const [previewMedia, setPreviewMedia] = useState<Memory | null>(null);
  
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    mediaUrl: "",
    mediaType: "image",
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/servers/${serverId}/memories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, adminCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal upload media");
      
      setMemories([result, ...memories]);
      setShowUploadModal(false);
      setFormData({ title: "", mediaUrl: "", mediaType: "image" });
      setAdminCode("");
      toast.success("Media kenangan berhasil disimpan!");

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/servers/${serverId}/memories/${showEditModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, adminCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal mengupdate media");
      
      setMemories((prev) => prev.map(m => m.id === result.id ? result : m));
      setShowEditModal(null);
      setFormData({ title: "", mediaUrl: "", mediaType: "image" });
      setAdminCode("");
      toast.success("Media berhasil diupdate!");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDeleteModal) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/servers/${serverId}/memories/${showDeleteModal.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal menghapus media");
      
      setMemories((prev) => prev.filter(m => m.id !== showDeleteModal.id));
      setShowDeleteModal(null);
      setAdminCode("");
      toast.success("Media berhasil dihapus!");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Arsip Media & Kenangan</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Abadikan momen-momen berharga bersama alumni.</p>
        </div>
        <Button 
          onClick={() => {
            setShowUploadModal(true);
            setFormData({ title: "", mediaUrl: "", mediaType: "image" });
          }} 
          className="flex gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-12 shadow-lg shadow-blue-100"
        >
          <PlusCircle size={20} />
          Upload Media
        </Button>
      </div>

      {/* Media Grid */}
      {memories.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-20 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <ImageIcon size={32} />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Belum ada media yang diunggah.</p>
          <Button variant="outline" onClick={() => setShowUploadModal(true)}>Mulai Upload Kenangan</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {memories.map((memory) => (
            <div key={memory.id} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Media Preview Container */}
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden group/media cursor-pointer" onClick={() => setPreviewMedia(memory)}>
                {memory.mediaType === "image" ? (
                  <img 
                    src={memory.mediaUrl} 
                    alt={memory.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as any).src = "https://placehold.co/600x400?text=Format+Not+Supported";
                    }}
                  />
                ) : memory.mediaType === "video" ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                    <Video size={48} className="text-white/50 group-hover/media:scale-125 transition-transform" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/media:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Eye size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <FileIcon size={48} className="opacity-50 group-hover/media:scale-110 transition-transform" />
                  </div>
                )}
                
                {/* Overlay Type Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-[10px] text-white font-bold uppercase tracking-wider">
                  {memory.mediaType}
                </div>
              </div>
              
              {/* Info & Actions */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={memory.title}>
                    {memory.title}
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 font-medium">
                    <ImageIcon size={12} />
                    Uploaded on {new Date(memory.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setPreviewMedia(memory)}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400 transition-colors" 
                      title="Lihat"
                    >
                      <Eye size={18} />
                    </button>
                    <a 
                      href={memory.mediaUrl} 
                      download 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setShowEditModal(memory);
                        setFormData({ title: memory.title, mediaUrl: memory.mediaUrl, mediaType: memory.mediaType });
                        setAdminCode("");
                      }} 
                      className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        setShowDeleteModal(memory);
                        setAdminCode("");
                      }} 
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Hapus"
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

      {/* Lightbox / Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
          <button 
            onClick={() => setPreviewMedia(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 z-[110]"
          >
            <X size={32} />
          </button>
          
          <div className="w-full h-full p-10 flex flex-col items-center justify-center">
            <div className="max-w-5xl w-full max-h-[80vh] flex items-center justify-center relative group">
              {previewMedia.mediaType === "image" ? (
                <img 
                  src={previewMedia.mediaUrl} 
                  alt={previewMedia.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              ) : previewMedia.mediaType === "video" ? (
                <video 
                  src={previewMedia.mediaUrl} 
                  controls 
                  autoPlay
                  className="max-w-full max-h-full rounded-lg shadow-2xl"
                />
              ) : (
                <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl flex flex-col items-center gap-6 shadow-2xl">
                  <div className="w-24 h-24 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                    <FileText size={48} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{previewMedia.title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6">Preview untuk dokumen tidak tersedia secara langsung.</p>
                    <a href={previewMedia.mediaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl px-8 h-12 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                      <ExternalLink size={18} className="mr-2" /> Buka di Tab Baru
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 text-center text-white">
              <h2 className="text-2xl font-bold">{previewMedia.title}</h2>
              <p className="text-white/60 text-sm mt-1">
                {previewMedia.mediaType.toUpperCase()} • {new Date(previewMedia.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-4 mt-6 justify-center">
                <a href={previewMedia.mediaUrl} download className="inline-flex items-center justify-center rounded-xl px-4 h-10 border border-white/20 text-white font-medium hover:bg-white/10 transition-colors">
                  <Download size={18} className="mr-2" /> Download Original
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload/Edit Modal Overlay */}
      {(showUploadModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-full h-2", showEditModal ? "bg-amber-500" : "bg-blue-600")}></div>
            <button 
              onClick={() => { setShowUploadModal(false); setShowEditModal(null); }}
              className="absolute top-6 right-6 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{showEditModal ? "Edit Media" : "Upload Kenangan Baru"}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Bagikan momen berharga Anda dengan seluruh alumni.</p>
            </div>

            <form onSubmit={showEditModal ? handleUpdate : handleUpload} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Judul Media</label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Misal: Keseruan Reuni 2024"
                  className="rounded-xl h-12"
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Tipe Media</label>
                <div className="grid grid-cols-3 gap-2">
                  {["image", "video", "document"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, mediaType: type})}
                      className={cn(
                        "h-12 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all",
                        formData.mediaType === type 
                          ? "bg-blue-50 dark:bg-blue-950 border-blue-600 text-blue-600 dark:text-blue-400" 
                          : "border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">URL Media</label>
                <Input 
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
                  placeholder="https://images.unsplash.com/..."
                  className="rounded-xl h-12"
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
                  <p className="text-[10px] text-blue-500">Kode diperlukan untuk modifikasi arsip publik.</p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1 rounded-xl h-12" 
                    onClick={() => { setShowUploadModal(false); setShowEditModal(null); }}
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    className={cn(
                      "flex-[2] rounded-xl h-12 font-bold shadow-lg",
                      showEditModal ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                    )}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {showEditModal ? "Simpan Perubahan" : "Simpan Media"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Hapus Media Ini?</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Tindakan ini tidak dapat dibatalkan. Media akan dihapus secara permanen dari arsip.</p>
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
                  className="flex-2 h-12 rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 font-bold" 
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
