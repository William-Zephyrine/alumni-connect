import { z } from "zod";

export const createServerSchema = z.object({
  schoolName: z.string().min(3, "Nama sekolah minimal 3 karakter"),
  graduationYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 10),
  description: z.string().optional(),
  adminCode: z.string().length(6, "PIN Admin harus persis 6 karakter"),
  confirmAdminCode: z.string().length(6, "Konfirmasi PIN harus 6 karakter"),
}).refine((data) => data.adminCode === data.confirmAdminCode, {
  message: "PIN dan Konfirmasi PIN tidak cocok",
  path: ["confirmAdminCode"],
});

export const updateServerSchema = z.object({
  schoolName: z.string().min(3, "Nama sekolah minimal 3 karakter"),
  graduationYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 10),
  description: z.string().optional(),
});

export const joinServerSchema = z.object({
  serverCode: z.string().min(5, "Server ID tidak valid"),
});

export type CreateServerInput = z.infer<typeof createServerSchema>;
export type UpdateServerInput = z.infer<typeof updateServerSchema>;
export type JoinServerInput = z.infer<typeof joinServerSchema>;
