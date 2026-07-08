import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function DELETE(
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

    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: { ownerId: true },
    });

    if (!server) {
      return NextResponse.json({ message: "Server tidak ditemukan" }, { status: 404 });
    }

    if (server.ownerId === user.id) {
      return NextResponse.json(
        { message: "Pemilik server tidak bisa keluar. Gunakan Hapus Server." },
        { status: 400 }
      );
    }

    const membership = await prisma.serverMember.findUnique({
      where: { serverId_userId: { serverId, userId: user.id } },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "Anda bukan anggota server ini" },
        { status: 400 }
      );
    }

    await prisma.serverMember.delete({
      where: { id: membership.id },
    });

    return NextResponse.json({ message: "Berhasil keluar dari server" });
  } catch (error: any) {
    console.error("[SERVER_LEAVE]", error);
    return NextResponse.json(
      { message: error?.message || "Gagal keluar dari server" },
      { status: 500 }
    );
  }
}
