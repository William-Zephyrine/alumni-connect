"use client";

import { useState, useEffect } from "react";
import { Search, Shield, UserPlus, Phone, Mail, MapPin, Briefcase, Users, X, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { alumniContactSchema, type AlumniContactInput } from "@/features/archive/contacts/validations/contact.schema";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

interface Contact {
  id: string;
  fullName: string;
  graduationYear: number;
  phone: string | null;
  email: string | null;
  address: string | null;
  occupation: string | null;
  company: string | null;
}

interface ContactsClientProps {
  serverId: string;
  initialContacts: Contact[];
  isOwner: boolean;
  hasAdminCode: boolean;
}

export function ContactsClient({ serverId, initialContacts, isOwner, hasAdminCode }: ContactsClientProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Contact | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Contact | null>(null);
  const [showSetupCodeModal, setShowSetupCodeModal] = useState(!hasAdminCode && isOwner);
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [deleteAdminCode, setDeleteAdminCode] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [setupCodeConfirm, setSetupCodeConfirm] = useState("");
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
  } = useForm({
    resolver: zodResolver(alumniContactSchema),
  });

  const filteredContacts = contacts.filter(c => 
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.occupation?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddContact = async (data: AlumniContactInput) => {
    setLoading(true);
    try {
      const endpoint = showEditModal ? `/api/servers/${serverId}/contacts/${showEditModal.id}` : `/api/servers/${serverId}/contacts`;
      const method = showEditModal ? "PUT" : "POST";
      
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan kontak");
      }
      
      if (showEditModal) {
        setContacts((prev) => prev.map(c => c.id === result.id ? result : c));
        setShowEditModal(null);
      } else {
        setContacts((prev) => [...prev, result].sort((a, b) => a.fullName.localeCompare(b.fullName)));
        setShowAddModal(false);

      }
      reset();
      toast.success(showEditModal ? "Kontak berhasil diupdate!" : "Kontak berhasil ditambahkan!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDeleteModal) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/servers/${serverId}/contacts/${showDeleteModal.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminCode: deleteAdminCode }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Gagal menghapus kontak");
      }
      
      setContacts((prev) => prev.filter(c => c.id !== showDeleteModal.id));
      setShowDeleteModal(null);
      setDeleteAdminCode("");
      toast.success("Kontak berhasil dihapus!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupCode.length < 6) return toast.error("Kode admin minimal 6 karakter");
    if (setupCode !== setupCodeConfirm) return toast.error("Konfirmasi kode admin tidak cocok.");
    
    setSetupLoading(true);
    try {
      const response = await fetch(`/api/servers/${serverId}/admin/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: setupCode, codeConfirm: setupCodeConfirm, action: "set" }),
      });
      if (!response.ok) throw new Error("Gagal mengatur kode");
      setShowSetupCodeModal(false);
      setSetupCode("");
      setSetupCodeConfirm("");
      toast.success("Archive Admin Code berhasil diatur!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Cari nama, pekerjaan, atau perusahaan..." 
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => { setShowAddModal(true); reset(); }} className="flex gap-2 w-full md:w-auto shadow-sm">
          <UserPlus size={18} />
          Tambah Alumni
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <div key={contact.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{contact.fullName}</h3>
                <p className="text-sm text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                  Angkatan {contact.graduationYear}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => { setShowEditModal(contact); setShowAddModal(true); reset({
                  ...contact,
                  phone: contact.phone ?? undefined,
                  email: contact.email ?? undefined,
                  address: contact.address ?? undefined,
                  occupation: contact.occupation ?? undefined,
                  company: contact.company ?? undefined,
                }); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                  <Pencil size={18} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(contact)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600 border-t pt-4">
              {contact.occupation && <div className="flex items-center gap-3"><Briefcase size={16} className="text-gray-400 shrink-0" /> <span className="font-medium text-gray-700">{contact.occupation} {contact.company ? `@ ${contact.company}` : ''}</span></div>}
              {contact.phone && <div className="flex items-center gap-3"><Phone size={16} className="text-gray-400 shrink-0" /> {contact.phone}</div>}
              {contact.email && <div className="flex items-center gap-3"><Mail size={16} className="text-gray-400 shrink-0" /> {contact.email}</div>}
              {contact.address && <div className="flex items-center gap-3"><MapPin size={16} className="text-gray-400 shrink-0" /> {contact.address}</div>}
            </div>
          </div>
        ))}
      </div>

      {showSetupCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <Shield size={32} />
              </div>
              <h2 className="text-2xl font-bold">Atur Admin Code</h2>
              <p className="text-gray-500 text-sm">Sebagai pemilik server, Anda perlu mengatur 6-digit kode admin untuk mengelola arsip.</p>
            </div>
            <form onSubmit={handleSetupCode} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">6-Digit Admin Code</label>
                <Input 
                  type="password" 
                  placeholder="Masukkan kode admin (misal: 123456)" 
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value)}
                  className="text-center tracking-widest text-lg font-bold h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Konfirmasi Kode Admin</label>
                <Input 
                  type="password" 
                  placeholder="Konfirmasi kode admin" 
                  value={setupCodeConfirm}
                  onChange={(e) => setSetupCodeConfirm(e.target.value)}
                  className="text-center tracking-widest text-lg font-bold h-12"
                  required
                />
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowSetupCodeModal(false)}>Batal</Button>
                <Button type="submit" className="flex-1" disabled={setupLoading}>{setupLoading ? <Loader2 className="animate-spin mr-2" /> : null}Simpan Kode</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full space-y-6">
            <h2 className="text-2xl font-bold">{showEditModal ? "Edit Kontak" : "Tambah Kontak"}</h2>
            <form onSubmit={handleSubmit(handleAddContact)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nama Lengkap</label>
                  <Input {...register("fullName")} />
                </div>
                <div>
                  <label className="text-sm font-medium">Angkatan</label>
                  <Input type="number" {...register("graduationYear")} />
                </div>
                <div>
                  <label className="text-sm font-medium">Telepon</label>
                  <Input {...register("phone")} />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input {...register("email")} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Alamat</label>
                  <Input {...register("address")} />
                </div>
                <div>
                  <label className="text-sm font-medium">Pekerjaan</label>
                  <Input {...register("occupation")} />
                </div>
                <div>
                  <label className="text-sm font-medium">Perusahaan</label>
                  <Input {...register("company")} />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Archive Admin Code</label>
                  <Input type="password" {...register("adminCode")} required />
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowAddModal(false); setShowEditModal(null); reset(); }}>Batal</Button>
                  <Button type="submit" className="flex-1" disabled={loading}>{loading ? <Loader2 className="animate-spin mr-2" /> : null}{showEditModal ? "Simpan Perubahan" : "Tambah Kontak"}</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Hapus Kontak</h3>
            <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus data alumni ini?</p>
            <form onSubmit={handleDeleteContact} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Masukkan Archive Admin Code</label>
                <Input type="password" value={deleteAdminCode} onChange={(e) => setDeleteAdminCode(e.target.value)} required />
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowDeleteModal(null); setDeleteAdminCode(""); }}>Batal</Button>
                <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Menghapus..." : "Hapus"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
