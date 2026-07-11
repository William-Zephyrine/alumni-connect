import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ChatBox } from "@/features/chat/components/chat-box";

export default async function ServerPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) return null;

  const initialMessages = await prisma.message.findMany({
    where: { serverId },
    include: {
      user: {
        select: { id: true, fullName: true }
      },
      replyTo: {
        include: {
          user: { select: { fullName: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Reverse to chronological order, map Date to string
  const formattedMessages = initialMessages.reverse().map(msg => ({
    ...msg,
    createdAt: msg.createdAt.toISOString()
  }));

  return (
    <div className="-mx-4 -my-4 md:-mx-6 md:-my-6 lg:-mx-8 lg:-my-8 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between shrink-0">
        <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <span className="text-zinc-400 dark:text-zinc-500">#</span> Chat Group
        </h1>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Online</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ChatBox 
          serverId={serverId} 
          userId={user.id} 
          initialMessages={formattedMessages} 
        />
      </div>
    </div>
  );
}
