import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai reset database...");
  
  // Hapus data dalam urutan yang benar (menangani foreign keys)
  await prisma.message.deleteMany();
  await prisma.serverMember.deleteMany();
  await prisma.memoryMedia.deleteMany();
  await prisma.alumniContact.deleteMany();
  await prisma.archiveAdminCode.deleteMany();
  await prisma.server.deleteMany();
  await prisma.user.deleteMany();
  
  console.log("Database berhasil direset. Semua akun, server, dan pesan telah dihapus.");
}

main()
  .catch((e) => {
    console.error("Gagal reset database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
