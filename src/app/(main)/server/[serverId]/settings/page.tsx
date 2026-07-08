import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ServerSettingsClient } from "./settings-client";

export default async function ServerSettingsPage({
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

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    include: {
      owner: { select: { fullName: true } },
    },
  });

  if (!server) {
    notFound();
  }

  if (server.ownerId !== user.id) {
    redirect(`/server/${serverId}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Pengaturan Server
        </h1>
        <p className="text-gray-500">
          Kelola pengaturan server {server.schoolName}
        </p>
      </div>

      <ServerSettingsClient
        serverId={server.id}
        schoolName={server.schoolName}
        graduationYear={server.graduationYear}
        description={server.description ?? ""}
      />
    </div>
  );
}
