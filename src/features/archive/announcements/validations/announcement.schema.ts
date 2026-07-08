import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  content: z.string().min(5, "Konten minimal 5 karakter"),
  adminCode: z.string().min(1, "Archive Admin Code wajib diisi"),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
