import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { schoolName, graduationYear, description, adminCode } = body;

    if (!adminCode || adminCode.length !== 6) {
      return NextResponse.json({ message: "Archive Admin Code wajib diisi dan harus 6 karakter" }, { status: 400 });
    }

    const server = await prisma.server.findUnique({ 
      where: { id: serverId },
      include: { adminCodes: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    if (!server || server.ownerId !== user.id) {
      return NextResponse.json({ message: "Hanya pemilik yang dapat mengedit server" }, { status: 403 });
    }

    // Verify Admin Code
    const latestAdminCode = server.adminCodes[0];
    if (latestAdminCode && !(await bcrypt.compare(adminCode, latestAdminCode.codeHash))) {
        return NextResponse.json({ message: "Archive Admin Code salah" }, { status: 401 });
    }

    const updated = await prisma.server.update({
      where: { id: serverId },
      data: {
        schoolName,
        graduationYear: parseInt(graduationYear),
        description,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[SERVER_PUT]", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Data server bentrok dengan data yang sudah ada" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Gagal mengupdate server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const { adminCode } = await req.json();
    
    if (!adminCode) {
      return NextResponse.json({ message: "Archive Admin Code wajib diisi" }, { status: 400 });
    }

    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const server = await prisma.server.findUnique({ 
      where: { id: serverId },
      include: { adminCodes: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!server || server.ownerId !== user.id) {
      return NextResponse.json({ message: "Hanya pemilik yang dapat menghapus server" }, { status: 403 });
    }

    // Verify Admin Code
    const latestAdminCode = server.adminCodes[0];
    if (!latestAdminCode) {
      return NextResponse.json({ message: "Admin Code belum diatur. Silakan atur di menu Archive." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(adminCode, latestAdminCode.codeHash);
    if (!isValid) {
      return NextResponse.json({ message: "Archive Admin Code salah" }, { status: 401 });
    }

    // Delete dependent records manually
    await prisma.serverMember.deleteMany({ where: { serverId } });
    await prisma.message.deleteMany({ where: { serverId } });
    await prisma.alumniContact.deleteMany({ where: { serverId } });
    await prisma.memoryMedia.deleteMany({ where: { serverId } });
    await prisma.archiveAdminCode.deleteMany({ where: { serverId } });

    await prisma.server.delete({ where: { id: serverId } });

    return NextResponse.json({ message: "Server berhasil dihapus" });
  } catch (error: any) {
    console.error("[SERVER_DELETE]", error);
    return NextResponse.json(
      { message: error.message || "Gagal menghapus server" },
      { status: 500 }
    );
  }
}
