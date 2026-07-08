import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { MemoriesClient } from "./memories-client";

export default async function MemoriesPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) return null;

  const memories = await prisma.memoryMedia.findMany({
    where: { serverId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Memories</h1>
          <p className="text-gray-500">Kumpulan foto dan video kenangan</p>
        </div>

        <MemoriesClient 
          serverId={serverId} 
          initialMemories={memories.map(m => ({
            ...m,
            createdAt: m.createdAt.toISOString()
          }))} 
        />
      </div>
    </div>
  );
}
