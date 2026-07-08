import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  const servers = await prisma.server.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      _count: {
        select: { members: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Accurate Stats
  const totalServersCount = await prisma.server.count({
    where: { members: { some: { userId: user.id } } }
  });

  const stats = {
    totalServers: totalServersCount,
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base">Kelola dan pilih komunitas alumni Anda.</p>
      </div>

      <DashboardClient servers={servers} stats={stats} />
    </div>
  );
}
