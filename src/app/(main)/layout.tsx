import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { Shell } from "@/shared/components/layout/shell";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  return (
    <Shell userName={user.fullName} userId={user.id}>
      {children}
    </Shell>
  );
}
