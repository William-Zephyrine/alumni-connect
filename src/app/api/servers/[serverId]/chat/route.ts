import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const messages = await prisma.message.findMany({
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
    
    return NextResponse.json(messages.reverse());
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const { message, replyToId } = await req.json();
    
    const newMessage = await prisma.message.create({
      data: {
        message,
        serverId,
        userId: user.id,
        replyToId: replyToId || null,
      },
      include: {
        user: {
          select: { id: true, fullName: true }
        },
        replyTo: {
          include: {
            user: { select: { fullName: true } }
          }
        },
        server: {
          select: { schoolName: true }
        }
      }
    });

    
    return NextResponse.json(newMessage);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
