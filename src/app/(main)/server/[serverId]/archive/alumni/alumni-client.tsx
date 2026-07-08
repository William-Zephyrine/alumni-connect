"use client";

import { useState, useMemo } from "react";
import { Search, User, MapPin, Briefcase, Mail, ExternalLink } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

interface Alumni {
  id: string;
  fullName: string;
  email: string;
  occupation: string | null;
  company: string | null;
  city: string | null;
  headline: string | null;
}

interface AlumniClientProps {
  alumni: Alumni[];
}

export function AlumniClient({ alumni }: AlumniClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAlumni = useMemo(() => {
    return alumni.filter(a => 
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.occupation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.headline?.toLowerCase().includes(searchQuery)
    );
  }, [alumni, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-5 h-5" />
          <Input 
            placeholder="Cari berdasarkan nama, pekerjaan, lokasi..." 
            className="pl-12 h-12 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl focus:ring-2 focus:ring-blue-100 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400 px-2 font-medium">
        Menampilkan {filteredAlumni.length} alumni
      </p>

      {/* Alumni Grid */}
      {filteredAlumni.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-20 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <User size={32} />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">Tidak ada alumni yang ditemukan.</p>
          <Button variant="ghost" onClick={() => setSearchQuery("")}>Reset Pencarian</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((person) => (
            <div key={person.id} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden flex flex-col p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {person.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {person.fullName}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    {person.headline || "Belum diatur"}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3 flex-1">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg">
                  <Briefcase size={16} className="text-indigo-500" />
                  <span className="truncate">{person.occupation || 'Belum diatur'} {person.company ? `@ ${person.company}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg">
                  <MapPin size={16} className="text-red-500" />
                  <span>{person.city || 'Lokasi tidak tersedia'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                  <Mail size={16} />
                  <span className="text-xs font-medium truncate max-w-[120px]">{person.email}</span>
                </div>
                <Link href={`/profile/${person.id}`}>
                  <Button size="sm" variant="ghost" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-bold">
                    Lihat Profil
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
