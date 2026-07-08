import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { AnnouncementsClient } from "./announcements-client";

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) return null;

  const announcements = await prisma.announcement.findMany({
    where: { serverId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
          <p className="text-gray-500">Informasi dan pengumuman penting untuk anggota server</p>
        </div>

        <AnnouncementsClient
          serverId={serverId}
          initialAnnouncements={announcements.map((a) => ({
            ...a,
            createdAt: a.createdAt.toISOString(),
            updatedAt: a.updatedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
