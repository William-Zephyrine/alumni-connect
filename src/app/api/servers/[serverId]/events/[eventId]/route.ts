import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { eventSchema } from "@/features/archive/events/validations/event.schema";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ serverId: string; eventId: string }> }
) {
  try {
    const { serverId, eventId } = await params;
    const body = await req.json();
    const validated = eventSchema.parse(body);
    const { adminCode, ...data } = validated;

    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const adminRecord = await prisma.archiveAdminCode.findFirst({ where: { serverId } });
    if (!adminRecord) return NextResponse.json({ message: "Admin code belum diatur" }, { status: 403 });
    if (!(await bcrypt.compare(adminCode, adminRecord.codeHash))) {
      return NextResponse.json({ message: "Archive Admin Code salah" }, { status: 401 });
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...data,
        eventDate: new Date(data.eventDate),
        location: data.location || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.name === "ZodError") {
      const fields = error.issues?.map((e: any) => e.message).join(", ");
      return NextResponse.json({ message: fields || "Validasi gagal" }, { status: 400 });
    }
    console.error("[EVENT_PUT]", error);
    return NextResponse.json({ message: error?.message || "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serverId: string; eventId: string }> }
) {
  try {
    const { serverId, eventId } = await params;
    const { adminCode } = await req.json();

    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const adminRecord = await prisma.archiveAdminCode.findFirst({ where: { serverId } });
    if (!adminRecord) return NextResponse.json({ message: "Admin code belum diatur" }, { status: 403 });
    if (!adminCode || !(await bcrypt.compare(adminCode, adminRecord.codeHash))) {
      return NextResponse.json({ message: "Archive Admin Code salah" }, { status: 401 });
    }

    await prisma.event.delete({ where: { id: eventId } });

    return NextResponse.json({ message: "Event berhasil dihapus" });
  } catch (error: any) {
    console.error("[EVENT_DELETE]", error);
    return NextResponse.json({ message: error?.message || "Internal Error" }, { status: 500 });
  }
}
