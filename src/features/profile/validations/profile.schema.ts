import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  
  // Professional
  occupation: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  
  // Location
  city: z.string().optional().or(z.literal("")),
  province: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  
  // About Me
  headline: z.string().optional().or(z.literal("")),
  bio: z.string().max(300, "Bio maksimal 300 karakter").optional().or(z.literal("")),
  
  // Social
  linkedin: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmNewPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
