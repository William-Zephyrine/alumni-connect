import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ContactsClient } from "./contacts-client";

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) return null;

  const contacts = await prisma.alumniContact.findMany({
    where: { serverId },
    orderBy: { fullName: "asc" },
  });

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    select: { ownerId: true }
  });

  const hasAdminCode = await prisma.archiveAdminCode.count({
    where: { serverId }
  }) > 0;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kontak Alumni</h1>
            <p className="text-gray-500">Daftar kontak alumni sekolah</p>
          </div>
        </div>

        <ContactsClient 
          serverId={serverId} 
          initialContacts={contacts} 
          isOwner={server?.ownerId === user.id}
          hasAdminCode={hasAdminCode}
        />
      </div>
    </div>
  );
}
