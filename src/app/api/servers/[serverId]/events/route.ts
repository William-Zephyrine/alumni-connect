import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { eventSchema } from "@/features/archive/events/validations/event.schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const events = await prisma.event.findMany({
      where: { serverId },
      orderBy: { eventDate: "asc" },
    });
    return NextResponse.json(events);
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
    const body = await req.json();
    const validated = eventSchema.parse(body);
    const { adminCode, ...data } = validated;

    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const adminRecord = await prisma.archiveAdminCode.findFirst({
      where: { serverId },
    });
    if (!adminRecord) {
      return NextResponse.json({ message: "Admin code belum diatur" }, { status: 403 });
    }

    const isValid = await bcrypt.compare(adminCode, adminRecord.codeHash);
    if (!isValid) {
      return NextResponse.json({ message: "Admin code salah" }, { status: 401 });
    }

    const event = await prisma.event.create({
      data: {
        ...data,
        eventDate: new Date(data.eventDate),
        location: data.location || null,
        serverId,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      const fields = error.issues?.map((e: any) => e.message).join(", ");
      return NextResponse.json({ message: fields || "Validasi gagal" }, { status: 400 });
    }
    console.error("[EVENTS_POST]", error);
    return NextResponse.json({ message: error?.message || "Error" }, { status: 500 });
  }
}
