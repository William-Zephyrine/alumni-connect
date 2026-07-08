import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function ServerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  // Verify membership
  const membership = await prisma.serverMember.findUnique({
    where: {
      serverId_userId: {
        serverId,
        userId: user.id,
      },
    },
    include: {
      server: true,
    },
  });

  if (!membership) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col h-full">
      {children}
    </div>
  );
}
