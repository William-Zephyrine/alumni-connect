import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AlumniClient } from "./alumni-client";

export default async function AlumniDirectoryPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  // Check if user is a member of THIS server
  const membership = await prisma.serverMember.findUnique({
    where: {
      serverId_userId: {
        serverId,
        userId: user.id,
      },
    },
  });

  if (!membership) {
    redirect("/dashboard");
  }

  // Fetch alumni only from THIS server
  const alumni = await prisma.user.findMany({
    where: {
      memberships: {
        some: { serverId }
      }
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      occupation: true,
      company: true,
      city: true,
      headline: true,
      createdAt: true,
    },
    orderBy: {
      fullName: "asc",
    }
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cari Alumni</h1>
          <p className="text-gray-500 text-sm">Temukan dan hubungkan kembali dengan teman lama Anda.</p>
        </div>
      </div>
      
      <AlumniClient alumni={alumni} />
    </div>
  );
}
