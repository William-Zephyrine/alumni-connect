import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { alumniContactSchema } from "@/features/archive/contacts/validations/contact.schema";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ serverId: string; contactId: string }> }
) {
  try {
    const { serverId, contactId } = await params;
    const body = await req.json();
    
    // Validate input
    const validatedData = alumniContactSchema.parse(body);
    const { adminCode, ...data } = validatedData;
    
    // Verify Auth
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    // Verify Admin Code
    const adminRecord = await prisma.archiveAdminCode.findFirst({ where: { serverId } });
    if (!adminRecord || !(await bcrypt.compare(adminCode, adminRecord.codeHash))) {
      return NextResponse.json({ message: "Archive Admin Code salah" }, { status: 401 });
    }
    
    const contact = await prisma.alumniContact.update({
      where: { id: contactId, serverId },
      data: {
        fullName: data.fullName,
        graduationYear: data.graduationYear,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        occupation: data.occupation || null,
        company: data.company || null,
      }
    });
    
    return NextResponse.json(contact);
  } catch (error: any) {
    console.error("[CONTACT_PUT]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serverId: string; contactId: string }> }
) {
  try {
    const { serverId, contactId } = await params;
    const { adminCode } = await req.json();
    
    // Verify Auth & Admin Code
    const token = (await cookies()).get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const adminRecord = await prisma.archiveAdminCode.findFirst({ where: { serverId } });
    if (!adminRecord || !(await bcrypt.compare(adminCode, adminRecord.codeHash))) {
      return NextResponse.json({ message: "Archive Admin Code salah" }, { status: 401 });
    }
    
    await prisma.alumniContact.delete({
      where: { id: contactId, serverId }
    });
    
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    console.error("[CONTACT_DELETE]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
