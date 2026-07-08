"use client";

import { useMemo, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Briefcase,
  MapPin,
  Globe,
  Save,
  Lock,
  LogOut,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  profileSchema,
  changePasswordSchema,
  type ChangePasswordInput,
  type ProfileInput,
} from "@/features/profile/validations/profile.schema";

interface ProfileClientProps {
  initialUser: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    occupation?: string;
    company?: string;
    position?: string;
    city?: string;
    province?: string;
    country?: string;
    headline?: string;
    bio?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    website?: string;
    createdAt?: string;
    _count?: {
      messages: number;
    };
  };
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const profileDefaultValues = useMemo(
    () => ({
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      dateOfBirth: user.dateOfBirth ?? "",
      occupation: user.occupation ?? "",
      company: user.company ?? "",
      position: user.position ?? "",
      city: user.city ?? "",
      province: user.province ?? "",
      country: user.country ?? "",
      headline: user.headline ?? "",
      bio: user.bio ?? "",
      linkedin: user.linkedin ?? "",
      instagram: user.instagram ?? "",
      facebook: user.facebook ?? "",
      website: user.website ?? "",
    }),
    [user]
  );

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileDefaultValues,
    mode: "onSubmit",
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
  });

  const onProfileSubmit = async (data: ProfileInput) => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "Gagal memperbarui profil");

      setUser(result);
      setIsEditing(false);
      toast.success("Profil berhasil diperbarui!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui profil";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    setPasswordLoading(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "Gagal mengganti password");

      passwordForm.reset();
      toast.success("Password berhasil diganti!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengganti password";
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Berhasil keluar!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Gagal keluar. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-blue-600 overflow-hidden">
                <User size={48} />
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="px-8 pb-8 pt-20">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{user.fullName}</h2>
              {user.headline && (
                <p className="text-lg text-zinc-600 dark:text-zinc-400 font-medium mt-1">{user.headline}</p>
              )}
              {(user.city || user.country) && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-2">
                  <MapPin size={14} className="text-zinc-400 dark:text-zinc-500" />
                  {[user.city, user.province, user.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant={isEditing ? "outline" : "primary"}
                onClick={() => {
                  if (!isEditing) {
                    profileForm.reset(profileDefaultValues);
                  }
                  setIsEditing(!isEditing);
                }}
              >
                {isEditing ? "Batal" : "Edit Profil"}
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex gap-2"
                disabled={loading}
              >
                <LogOut size={18} />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Forms) */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
            {/* About Me Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
                <User className="text-blue-600" size={20} />
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Tentang Saya</h3>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Headline Profil</label>
                    <Input
                      {...profileForm.register("headline")}
                      placeholder="Software Engineer"
                      disabled={!isEditing}
                      className="bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-colors rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Bio Singkat</label>
                    <Textarea
                      {...profileForm.register("bio")}
                      placeholder="Ceritakan tentang diri Anda..."
                      disabled={!isEditing}
                      className="bg-gray-50/50 focus:bg-white transition-colors min-h-[100px]"
                    />
                    {profileForm.formState.errors.bio && (
                      <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.bio.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
                <User className="text-blue-600" size={20} />
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Informasi Pribadi</h3>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <User size={14} className="text-zinc-400 dark:text-zinc-500" /> Nama Lengkap
                      </label>
                      <Input
                        {...profileForm.register("fullName")}
                        disabled={!isEditing}
                        className="bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-colors rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <Mail size={14} className="text-zinc-400 dark:text-zinc-500" /> Email
                      </label>
                      <Input
                        {...profileForm.register("email")}
                        disabled={!isEditing}
                        className="bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-colors rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <Phone size={14} className="text-zinc-400 dark:text-zinc-500" /> Nomor Telepon
                      </label>
                      <Input
                        {...profileForm.register("phone")}
                        disabled={!isEditing}
                        className="bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-colors rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-400 dark:text-zinc-500" /> Tanggal Lahir
                      </label>
                      <Input
                        type="date"
                        {...profileForm.register("dateOfBirth")}
                        disabled={!isEditing}
                        className="bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-colors rounded-xl h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
                <MapPin className="text-green-600" size={20} />
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Lokasi</h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    {...profileForm.register("city")}
                    placeholder="Kota"
                    disabled={!isEditing}
                    className="bg-gray-50/50 focus:bg-white transition-colors"
                  />
                  <Input
                    {...profileForm.register("province")}
                    placeholder="Provinsi"
                    disabled={!isEditing}
                    className="bg-gray-50/50 focus:bg-white transition-colors"
                  />
                  <Input
                    {...profileForm.register("country")}
                    placeholder="Negara"
                    disabled={!isEditing}
                    className="bg-gray-50/50 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
                <Briefcase className="text-indigo-600" size={20} />
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Informasi Profesional</h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Pekerjaan</label>
                    <Input
                      {...profileForm.register("occupation")}
                      placeholder="Software Engineer"
                      disabled={!isEditing}
                      className="bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-colors rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Perusahaan / Instansi</label>
                    <Input
                      {...profileForm.register("company")}
                      placeholder="Google Indonesia"
                      disabled={!isEditing}
                      className="bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-colors rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Jabatan / Posisi</label>
                    <Input
                      {...profileForm.register("position")}
                      placeholder="Senior Manager"
                      disabled={!isEditing}
                      className="bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-colors rounded-xl h-12"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
                <Globe className="text-purple-600" size={20} />
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Tautan Sosial</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">LinkedIn</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                      <Globe size={18} />
                    </div>
                    <Input
                      {...profileForm.register("linkedin")}
                      className="pl-10 bg-gray-50/50"
                      placeholder="linkedin.com/in/..."
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">Instagram</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-600">
                      <Globe size={18} />
                    </div>
                    <Input
                      {...profileForm.register("instagram")}
                      className="pl-10 bg-gray-50/50"
                      placeholder="@username"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">Facebook</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-800">
                      <Globe size={18} />
                    </div>
                    <Input
                      {...profileForm.register("facebook")}
                      className="pl-10 bg-gray-50/50"
                      placeholder="facebook.com/..."
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">Website Pribadi</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                      <Globe size={18} />
                    </div>
                    <Input
                      {...profileForm.register("website")}
                      className="pl-10 bg-gray-50/50"
                      placeholder="https://"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <Button
                  type="submit"
                  className="w-full flex gap-2 h-12 text-lg shadow-lg shadow-blue-100"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  Simpan Semua Perubahan Profil
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar (Security) */}
        <div className="space-y-8">
          {/* Password Form */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <Lock className="text-red-600" size={20} />
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Keamanan Akun</h3>
            </div>
            <div className="p-6">
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Password Saat Ini</label>
                  <Input
                    type="password"
                    {...passwordForm.register("currentPassword")}
                    className="bg-gray-50/50 focus:bg-white transition-colors"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-red-500 font-medium">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Password Baru</label>
                  <Input
                    type="password"
                    {...passwordForm.register("newPassword")}
                    className="bg-gray-50/50 focus:bg-white transition-colors"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-red-500 font-medium">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Konfirmasi Password</label>
                  <Input
                    type="password"
                    {...passwordForm.register("confirmNewPassword")}
                    className="bg-gray-50/50 focus:bg-white transition-colors"
                  />
                  {passwordForm.formState.errors.confirmNewPassword && (
                    <p className="text-xs text-red-500 font-medium">
                      {passwordForm.formState.errors.confirmNewPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 font-bold h-11"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? <Loader2 className="animate-spin" /> : "Ganti Password"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
            <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100">Konfirmasi Keluar</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Apakah Anda yakin ingin keluar dari akun ini?</p>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)} disabled={loading}>
                Batal
              </Button>
              <Button variant="danger" onClick={() => {
                handleLogout();
                setShowLogoutConfirm(false);
              }} disabled={loading}>
                {loading ? "Keluar..." : "Keluar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}