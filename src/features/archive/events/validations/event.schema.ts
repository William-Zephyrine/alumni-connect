import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  eventDate: z.string().min(1, "Tanggal event wajib diisi"),
  location: z.string().optional(),
  adminCode: z.string().min(1, "Archive Admin Code wajib diisi"),
});

export type EventInput = z.infer<typeof eventSchema>;
