import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { profileSchema } from "@/features/profile/validations/profile.schema";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        _count: {
          select: {
            messages: true,
            media: true
          }
        }
      }
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const { passwordHash, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error("[PROFILE_GET]", error);
    return NextResponse.json(
      { message: error.message || "Gagal mengambil profil" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validated = profileSchema.parse(body);

    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(validated)) {
      data[k] = v === "" ? null : v;
    }

    if (typeof data.email === "string") {
      const conflict = await prisma.user.findFirst({
        where: { email: data.email, id: { not: decoded.id } },
        select: { id: true },
      });
      if (conflict) {
        return NextResponse.json(
          { message: "Email sudah digunakan oleh pengguna lain" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: decoded.id },
      data,
    });

    const { passwordHash: _, ...safe } = updated;
    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("[PROFILE_PATCH]", error);

    if (error?.name === "ZodError") {
      return NextResponse.json(
        { message: "Validasi gagal", errors: error.errors },
        { status: 400 }
      );
    }

    if (error?.code === "P2002") {
      return NextResponse.json(
        { message: "Email sudah digunakan oleh pengguna lain" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: error?.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
