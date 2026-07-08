"use client";

import { useState } from "react";
import { Users, Crown, Briefcase, Calendar } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface Member {
  id: string;
  fullName: string;
  headline: string | null;
  occupation: string | null;
  company: string | null;
  joinedAt: string;
  isOwner: boolean;
}

interface MembersClientProps {
  serverId: string;
  initialMembers: Member[];
}

export function MembersClient({
  serverId,
  initialMembers,
}: MembersClientProps) {
  const [members] = useState<Member[]>(initialMembers);

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center py-16 px-4 space-y-4">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto">
            <Users size={24} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="space-y-1">
            <p className="text-zinc-800 dark:text-zinc-200 font-semibold">Belum ada anggota</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group flex items-start gap-4"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0",
                  member.isOwner
                    ? "bg-gradient-to-br from-amber-400 to-amber-600"
                    : "bg-gradient-to-br from-blue-400 to-blue-600"
                )}
              >
                {member.fullName.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {member.fullName}
                  </h3>
                  {member.isOwner && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full shrink-0">
                      <Crown size={10} />
                      Owner
                    </span>
                  )}
                </div>

                {member.headline && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{member.headline}</p>
                )}

                {(member.occupation || member.company) && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                    <Briefcase size={12} />
                    <span>
                      {[member.occupation, member.company]
                        .filter(Boolean)
                        .join(" @ ")}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-gray-300 mt-1">
                  <Calendar size={12} />
                  <span>
                    Bergabung{" "}
                    {new Date(member.joinedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
