import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { EventsClient } from "./events-client";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) return null;

  const events = await prisma.event.findMany({
    where: { serverId },
    orderBy: { eventDate: "asc" },
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event</h1>
          <p className="text-gray-500">Jadwal dan informasi event alumni</p>
        </div>

        <EventsClient
          serverId={serverId}
          initialEvents={events.map((e) => ({
            ...e,
            createdAt: e.createdAt.toISOString(),
            updatedAt: e.updatedAt.toISOString(),
            eventDate: e.eventDate.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
