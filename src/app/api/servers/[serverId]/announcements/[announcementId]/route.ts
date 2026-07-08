import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { announcementSchema } from "@/features/archive/announcements/validations/announcement.schema";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ serverId: string; announcementId: string }> }
) {
  try {
    const { serverId, announcementId } = await params;
    const body = await req.json();
    const validated = announcementSchema.parse(body);
    const { adminCode, ...data } = validated;

    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const adminRecord = await prisma.archiveAdminCode.findFirst({ where: { serverId } });
    if (!adminRecord) return NextResponse.json({ message: "Admin code belum diatur" }, { status: 403 });
    if (!(await bcrypt.compare(adminCode, adminRecord.codeHash))) {
      return NextResponse.json({ message: "Archive Admin Code salah" }, { status: 401 });
    }

    const updated = await prisma.announcement.update({
      where: { id: announcementId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.name === "ZodError") {
      const fields = error.issues?.map((e: any) => e.message).join(", ");
      return NextResponse.json({ message: fields || "Validasi gagal" }, { status: 400 });
    }
    console.error("[ANNOUNCEMENT_PUT]", error);
    return NextResponse.json({ message: error?.message || "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serverId: string; announcementId: string }> }
) {
  try {
    const { serverId, announcementId } = await params;
    const { adminCode } = await req.json();

    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const adminRecord = await prisma.archiveAdminCode.findFirst({ where: { serverId } });
    if (!adminRecord) return NextResponse.json({ message: "Admin code belum diatur" }, { status: 403 });
    if (!adminCode || !(await bcrypt.compare(adminCode, adminRecord.codeHash))) {
      return NextResponse.json({ message: "Archive Admin Code salah" }, { status: 401 });
    }

    await prisma.announcement.delete({ where: { id: announcementId } });

    return NextResponse.json({ message: "Pengumuman berhasil dihapus" });
  } catch (error: any) {
    console.error("[ANNOUNCEMENT_DELETE]", error);
    return NextResponse.json({ message: error?.message || "Internal Error" }, { status: 500 });
  }
}
