import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/features/auth/validations/auth.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }
    
    // Compare password
    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.passwordHash
    );
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }
    
    // Generate token
    const token = signToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    });
    
    const response = NextResponse.json(
      { 
        message: "Login berhasil",
        user: { id: user.id, email: user.email, fullName: user.fullName }
      },
      { status: 200 }
    );
    
    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    
    return response;
    
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Validasi gagal", errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
