import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { 
  User, 
  MapPin, 
  Briefcase, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Image as ImageIcon,
  Globe
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { BackButton } from "@/shared/components/ui/back-button";
import Link from "next/link";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const token = (await cookies()).get("token")?.value;
  const currentUser = token ? verifyToken(token) : null;

  if (!currentUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          messages: true,
          media: true,
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  const isMe = currentUser.id === user.id;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Back Button */}
      <BackButton />

      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center text-blue-600">
                <User size={64} />
              </div>
            </div>
            {isMe && (
              <Link href="/profile">
                <Button className="rounded-xl px-6 font-bold shadow-lg shadow-blue-100">
                  Edit Profil Saya
                </Button>
              </Link>
            )}
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="text-blue-600 font-bold flex items-center gap-2">
              {user.graduationYear || ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Kontribusi</p>
                <p className="font-bold text-gray-900">{user._count.messages} Pesan</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <ImageIcon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Media</p>
                <p className="font-bold text-gray-900">{user._count.media} File</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                <p className="font-bold text-gray-900">Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About / Professional */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Informasi Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                    <Briefcase size={14} /> Pekerjaan
                  </p>
                  <p className="text-gray-700 font-medium">{user.occupation || 'Belum diatur'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                    <Globe size={14} /> Perusahaan
                  </p>
                  <p className="text-gray-700 font-medium">{user.company || 'Belum diatur'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                    <MapPin size={14} /> Lokasi
                  </p>
                  <p className="text-gray-700 font-medium">{user.city ? `${user.city}, ${user.province || ''}` : 'Belum diatur'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                    <Mail size={14} /> Email
                  </p>
                  <p className="text-gray-700 font-medium">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 h-fit">
          <h3 className="text-xl font-bold text-gray-900">Media Sosial</h3>
          <div className="space-y-4">
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                <Globe size={20} />
                <span className="text-sm font-bold">LinkedIn</span>
              </a>
            )}
            {user.instagram && (
              <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors">
                <Globe size={20} />
                <span className="text-sm font-bold">Instagram</span>
              </a>
            )}
            {!user.linkedin && !user.instagram && (
              <p className="text-sm text-gray-400 italic">Tidak ada tautan sosial.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
