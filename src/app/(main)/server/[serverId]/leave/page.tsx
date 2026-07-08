import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LeaveServerClient } from "./leave-client";

export default async function LeaveServerPage({
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
    select: { schoolName: true, ownerId: true },
  });

  if (!server) {
    notFound();
  }

  return (
    <div className="max-w-md mx-auto">
      <LeaveServerClient
        serverId={serverId}
        schoolName={server.schoolName}
        isOwner={server.ownerId === user.id}
      />
    </div>
  );
}
