import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const servers = await prisma.server.findMany({
      where: {
        members: {
          some: { userId: user.id }
        }
      },
      select: { id: true }
    });

    return NextResponse.json(servers);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
