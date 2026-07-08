import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ProfileClient } from "@/features/profile/components/profile-client";

export default async function GlobalProfilePage() {
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      _count: {
        select: {
          messages: true,
          memberships: true,
        }
      }
    }
  });

  if (!userData) {
    const response = redirect("/login");
    // Since we are in a Server Component, we can't easily delete cookies here
    // but the next request to any API or Middleware will handle it.
    return response;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pengaturan Profil</h1>
      </div>
      
      <ProfileClient initialUser={userData} />
    </div>
  );
}
