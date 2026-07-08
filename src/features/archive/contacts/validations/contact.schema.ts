import { z } from "zod";

export const alumniContactSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  graduationYear: z.coerce.number().min(1900, "Tahun tidak valid").max(new Date().getFullYear() + 10, "Tahun tidak valid"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  occupation: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  adminCode: z.string().min(1, "Archive Admin Code wajib diisi"),
});

export type AlumniContactInput = z.infer<typeof alumniContactSchema>;
