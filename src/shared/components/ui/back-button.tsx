"use client";

import { ChevronLeft } from "lucide-react";

export function BackButton({ fallback = "/dashboard" }: { fallback?: string }) {
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = fallback;
        }
      }}
      className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium"
    >
      <ChevronLeft size={20} /> Kembali
    </button>
  );
}
