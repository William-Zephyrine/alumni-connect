import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { joinServerSchema } from "@/features/servers/validations/server.schema";

export async function POST(req: Request) {
  try {
    const tokenStore = await cookies();
    const token = tokenStore.get("token")?.value;
    const decoded = token ? verifyToken(token) : null;
    
    if (!decoded) {
      return NextResponse.json({ message: "Anda harus login terlebih dahulu" }, { status: 401 });
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      const response = NextResponse.json({ message: "Sesi tidak valid, silakan login kembali" }, { status: 401 });
      response.cookies.delete("token");
      return response;
    }
    
    const body = await req.json();
    
    // Validate input
    const validation = joinServerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        message: "Server ID tidak valid", 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { serverCode } = validation.data;
    
    // Find server (Case-insensitive check or just find unique as is)
    // Server codes are stored uppercase in create route
    const server = await prisma.server.findUnique({
      where: { serverCode: serverCode.toUpperCase() },
    });
    
    if (!server) {
      return NextResponse.json(
        { message: "Server ID tidak ditemukan. Pastikan kode sudah benar." },
        { status: 404 }
      );
    }
    
    // Check if already a member
    const existingMember = await prisma.serverMember.findUnique({
      where: {
        serverId_userId: {
          serverId: server.id,
          userId: user.id,
        }
      }
    });
    
    if (existingMember) {
      return NextResponse.json(
        { message: "Anda sudah bergabung di server ini", serverId: server.id },
        { status: 200 }
      );
    }
    
    // Join server
    await prisma.serverMember.create({
      data: {
        serverId: server.id,
        userId: user.id,
      }
    });
    
    return NextResponse.json(
      { message: "Berhasil bergabung", serverId: server.id },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error("[SERVERS_JOIN_POST]", error);
    return NextResponse.json(
      { message: "Gagal bergabung ke server" },
      { status: 500 }
    );
  }
}
