import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { alumniContactSchema } from "@/features/archive/contacts/validations/contact.schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const contacts = await prisma.alumniContact.findMany({
      where: { serverId },
      orderBy: { fullName: "asc" }
    });
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("[CONTACTS_GET]", error);
    return NextResponse.json({ message: "Gagal mengambil data kontak" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const body = await req.json();
    
    // 1. Validate input
    const validatedData = alumniContactSchema.parse(body);
    const { adminCode, ...data } = validatedData;
    
    // 2. Check Authentication
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ message: "Sesi berakhir, silakan login kembali" }, { status: 401 });
    }
    
    // 3. Verify admin code
    const adminRecord = await prisma.archiveAdminCode.findFirst({
      where: { serverId }
    });
    
    if (!adminRecord) {
      return NextResponse.json({ message: "Archive Admin Code belum diatur oleh pemilik server" }, { status: 403 });
    }
    
    const isValid = await bcrypt.compare(adminCode, adminRecord.codeHash);
    if (!isValid) {
      return NextResponse.json({ message: "Archive Admin Code salah" }, { status: 401 });
    }
    
    // 4. Create contact
    const contact = await prisma.alumniContact.create({
      data: {
        fullName: data.fullName,
        graduationYear: data.graduationYear,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        occupation: data.occupation || null,
        company: data.company || null,
        serverId
      },
      include: {
        server: { select: { schoolName: true } }
      }
    });

    
    return NextResponse.json(contact);
  } catch (error: any) {
    console.error("[CONTACTS_POST]", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ 
        message: "Validasi gagal", 
        errors: error.errors.map((e: any) => e.message) 
      }, { status: 400 });
    }

    return NextResponse.json({ message: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}
