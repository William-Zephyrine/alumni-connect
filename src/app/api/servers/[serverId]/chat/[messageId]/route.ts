import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ serverId: string; messageId: string }> }
) {
  try {
    const { serverId, messageId } = await params;
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { message: newMessage } = await req.json();

    // Check if user is owner of message
    const existingMessage = await prisma.message.findUnique({ where: { id: messageId } });
    if (!existingMessage || existingMessage.userId !== user.id) {
      return NextResponse.json({ message: "Anda tidak dapat mengedit pesan ini" }, { status: 403 });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        message: newMessage,
        edited: true,
      },
      include: {
        user: {
          select: { id: true, fullName: true }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[MESSAGE_PUT]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serverId: string; messageId: string }> }
) {
  try {
    const { serverId, messageId } = await params;
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Check if user is owner of message or server admin
    const existingMessage = await prisma.message.findUnique({ where: { id: messageId } });
    if (!existingMessage) return NextResponse.json({ message: "Pesan tidak ditemukan" }, { status: 404 });

    const server = await prisma.server.findUnique({ where: { id: serverId } });
    const isOwner = existingMessage.userId === user.id;
    const isServerOwner = server?.ownerId === user.id;

    if (!isOwner && !isServerOwner) {
      return NextResponse.json({ message: "Anda tidak dapat menghapus pesan ini" }, { status: 403 });
    }

    const { mode } = await req.json(); // 'me' or 'everyone'

    if (mode === "everyone") {
      const updated = await prisma.message.update({
        where: { id: messageId },
        data: {
          message: "Pesan ini telah dihapus",
          isDeleted: true,
        },
        include: {
          user: { select: { id: true, fullName: true } }
        }
      });
      return NextResponse.json(updated);
    }

    // 'me' mode: In this prototype, we don't have a per-user hidden status.
    // We'll just return success without deleting from DB to avoid affecting others.
    return NextResponse.json({ message: "Pesan dihapus dari tampilan Anda" });
  } catch (error) {
    console.error("[MESSAGE_DELETE]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
