import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createServerSchema } from "@/features/servers/validations/server.schema";
import bcrypt from "bcrypt";

// Since nanoid is not installed, I'll use a simple generator or install it.
// I'll install nanoid.

export async function POST(req: Request) {
  try {
    const tokenStore = await cookies();
    const token = tokenStore.get("token")?.value;
    const decoded = token ? verifyToken(token) : null;
    
    if (!decoded) {
      return NextResponse.json({ message: "Anda harus login terlebih dahulu" }, { status: 401 });
    }

    // Verify user exists in database (in case of DB reset/user deletion)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      const response = NextResponse.json({ message: "Sesi tidak valid, silakan login kembali" }, { status: 401 });
      response.cookies.delete("token");
      return response;
    }
    
    const body = await req.json();
    
    // Validate input with Zod
    const validation = createServerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        message: "Validasi gagal", 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }
    
    const validatedData = validation.data;
    
    // Generate unique 6-character server code
    const serverCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const server = await prisma.server.create({
      data: {
        schoolName: validatedData.schoolName,
        graduationYear: validatedData.graduationYear,
        description: validatedData.description || null,
        serverCode: serverCode,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
          }
        },
        adminCodes: {
          create: {
            codeHash: await bcrypt.hash(validatedData.adminCode, 10)
          }
        }
      },
    });
    
    return NextResponse.json(server, { status: 201 });
    
  } catch (error: any) {
    console.error("[SERVERS_CREATE_POST]", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Server dengan kode tersebut sudah ada, silakan coba lagi" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Gagal membuat server" },
      { status: 500 }
    );
  }
}
