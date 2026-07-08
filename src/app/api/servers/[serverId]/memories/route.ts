import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const memories = await prisma.memoryMedia.findMany({
      where: { serverId },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(memories);
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
    const { adminCode, title, mediaUrl, mediaType } = await req.json();
    
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Verify admin code
    const adminRecord = await prisma.archiveAdminCode.findFirst({
      where: { serverId }
    });
    
    if (!adminRecord) {
      return NextResponse.json({ message: "Admin code belum diatur" }, { status: 403 });
    }
    
    const isValid = await bcrypt.compare(adminCode, adminRecord.codeHash);
    if (!isValid) {
      return NextResponse.json({ message: "Admin code salah" }, { status: 401 });
    }
    
    const memory = await prisma.memoryMedia.create({
      data: {
        title,
        mediaUrl,
        mediaType,
        serverId,
        uploadedBy: user.id
      },
      include: {
        server: { select: { schoolName: true } },
        user: { select: { fullName: true } }
      }
    });

    
    return NextResponse.json(memory);
  } catch (error) {
    console.error("[MEMORIES_POST]", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
