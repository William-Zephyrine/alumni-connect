import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ serverId: string; memoryId: string }> }
) {
  try {
    const { serverId, memoryId } = await params;
    const body = await req.json();
    const { adminCode, title, mediaUrl, mediaType } = body;

    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const adminRecord = await prisma.archiveAdminCode.findFirst({ where: { serverId } });
    if (!adminRecord) return NextResponse.json({ message: "Admin code belum diatur" }, { status: 403 });
    if (!adminCode || !(await bcrypt.compare(adminCode, adminRecord.codeHash))) {
      return NextResponse.json({ message: "Archive Admin Code salah" }, { status: 401 });
    }

    const updated = await prisma.memoryMedia.update({
      where: { id: memoryId },
      data: {
        title,
        mediaUrl,
        mediaType,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[MEMORY_PUT]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serverId: string; memoryId: string }> }
) {
  try {
    const { serverId, memoryId } = await params;
    const { adminCode } = await req.json();

    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const adminRecord = await prisma.archiveAdminCode.findFirst({ where: { serverId } });
    if (!adminRecord) return NextResponse.json({ message: "Admin code belum diatur" }, { status: 403 });
    if (!adminCode || !(await bcrypt.compare(adminCode, adminRecord.codeHash))) {
      return NextResponse.json({ message: "Archive Admin Code salah" }, { status: 401 });
    }

    // Delete DB record. If file storage provider is used, add removal there.
    await prisma.memoryMedia.delete({ where: { id: memoryId } });

    return NextResponse.json({ message: "Media berhasil dihapus" });
  } catch (error) {
    console.error("[MEMORY_DELETE]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
