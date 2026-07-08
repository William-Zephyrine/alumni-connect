import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.serverMember.findUnique({
      where: { serverId_userId: { serverId, userId: user.id } },
    });

    if (!membership) {
      return NextResponse.json({ message: "Bukan anggota server" }, { status: 403 });
    }

    const members = await prisma.serverMember.findMany({
      where: { serverId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
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

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        fullName: m.user.fullName,
        email: m.user.email,
        headline: m.user.headline,
        occupation: m.user.occupation,
        company: m.user.company,
        joinedAt: m.joinedAt.toISOString(),
        isOwner: m.userId === server?.ownerId,
      })),
    });
  } catch (error: any) {
    console.error("[MEMBERS_GET]", error);
    return NextResponse.json(
      { message: error?.message || "Error" },
      { status: 500 }
    );
  }
}
