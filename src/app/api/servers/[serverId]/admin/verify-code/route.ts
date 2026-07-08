import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const { code, codeConfirm, newCode, action } = await req.json();
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const server = await prisma.server.findUnique({
      where: { id: serverId },
      include: { adminCodes: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!server) return NextResponse.json({ message: "Server not found" }, { status: 404 });

    if (server.ownerId !== user.id) {
      return NextResponse.json({ message: "Hanya pemilik yang dapat mengatur kode admin" }, { status: 403 });
    }

    // Set initial code (no existing code)
    if (action === "set") {
      if (server.adminCodes.length > 0) {
        return NextResponse.json({ message: "Admin code already set" }, { status: 400 });
      }
      if (!code || !codeConfirm) return NextResponse.json({ message: "Kode dan konfirmasi wajib diisi" }, { status: 400 });
      if (typeof code !== "string" || typeof codeConfirm !== "string") return NextResponse.json({ message: "Input tidak valid" }, { status: 400 });
      if (code.length < 6) return NextResponse.json({ message: "Kode admin minimal 6 karakter" }, { status: 400 });
      if (code !== codeConfirm) return NextResponse.json({ message: "Konfirmasi kode admin tidak cocok" }, { status: 400 });

      const hash = await bcrypt.hash(code, 10);
      await prisma.archiveAdminCode.create({
        data: { serverId, codeHash: hash },
      });
      return NextResponse.json({ message: "Admin code berhasil diatur" });
    }

    // Change existing code (requires current code + new code)
    if (action === "change") {
      const latestCode = server.adminCodes[0];
      if (!latestCode) {
        return NextResponse.json({ message: "Admin code belum diatur" }, { status: 400 });
      }

      if (!code || !newCode || !codeConfirm) {
        return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
      }
      if (newCode.length < 6) {
        return NextResponse.json({ message: "Kode admin baru minimal 6 karakter" }, { status: 400 });
      }
      if (newCode !== codeConfirm) {
        return NextResponse.json({ message: "Konfirmasi kode admin baru tidak cocok" }, { status: 400 });
      }

      const isCurrentValid = await bcrypt.compare(code, latestCode.codeHash);
      if (!isCurrentValid) {
        return NextResponse.json({ message: "Kode admin saat ini salah" }, { status: 401 });
      }

      const hash = await bcrypt.hash(newCode, 10);
      await prisma.archiveAdminCode.create({
        data: { serverId, codeHash: hash },
      });
      return NextResponse.json({ message: "Kode admin berhasil diganti" });
    }

    // Verify code
    const latestCode = server.adminCodes[0];
    if (!latestCode) {
      return NextResponse.json({ message: "Admin code not set" }, { status: 403 });
    }

    const isValid = await bcrypt.compare(code, latestCode.codeHash);
    if (isValid) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ message: "Admin code salah" }, { status: 401 });
  } catch (error: any) {
    console.error("[VERIFY_CODE]", error);
    return NextResponse.json({ message: error?.message || "Internal Error" }, { status: 500 });
  }
}
