import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MembersClient } from "./members-client";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  const membership = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId, userId: user.id } },
  });

  if (!membership) {
    redirect("/dashboard");
  }

  const members = await prisma.serverMember.findMany({
    where: { serverId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          headline: true,
          occupation: true,
          company: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    select: { ownerId: true },
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anggota</h1>
          <p className="text-gray-500">Daftar anggota server alumni</p>
        </div>

        <MembersClient
          serverId={serverId}
          initialMembers={members.map((m) => ({
            id: m.user.id,
            fullName: m.user.fullName,
            headline: m.user.headline,
            occupation: m.user.occupation,
            company: m.user.company,
            joinedAt: m.joinedAt.toISOString(),
            isOwner: m.user.id === server?.ownerId,
          }))}
        />
      </div>
    </div>
  );
}
