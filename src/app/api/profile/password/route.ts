import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken, comparePassword, hashPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/features/profile/validations/profile.schema";

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ message: "Password saat ini salah" }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash: newHash }
    });

    return NextResponse.json({ message: "Password berhasil diperbarui" });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ message: "Validasi gagal", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
