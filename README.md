# AlumniConnect

AlumniConnect adalah platform komunitas alumni sekolah yang memungkinkan alumni berkomunikasi, berbagi kenangan, dan mengakses arsip alumni dalam satu tempat.

## Fitur Utama

- **Sistem Server:** Buat server alumni khusus sekolah & angkatan atau bergabung menggunakan Server ID unik.
- **Chat Real-time:** Berkomunikasi dengan sesama alumni dalam grup chat.
- **Arsip Kontak:** Simpan dan cari data kontak alumni (Pekerjaan, Alamat, No. Telp, dll).
- **Galeri Kenangan:** Berbagi foto dan video kenangan masa sekolah.
- **Keamanan Arsip:** Perubahan data arsip dilindungi oleh *Archive Admin Code* yang di-hash.

## Tech Stack

- **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS v4, Lucide React.
- **Backend:** Next.js Route Handlers.
- **Database:** PostgreSQL dengan Prisma ORM.
- **Authentication:** JWT (JSON Web Token) dengan Cookie-based session.
- **Validation:** Zod & React Hook Form.

## Prasyarat

- Node.js 20+
- PostgreSQL database

## Instalasi

1. Clone repositori:
   ```bash
   git clone <repository-url>
   cd alumni-connect
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi environment variables:
   Buat file `.env` di root direktori dan tambahkan:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/alumni_db?schema=public"
   JWT_SECRET="rahasia-super-aman"
   ```

4. Jalankan migrasi database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## Arsitektur Proyek

Proyek ini menggunakan **Feature-Based Architecture** untuk modularitas dan skalabilitas:

- `src/features/`: Logika spesifik fitur (Auth, Servers, Chat, Archive).
- `src/shared/`: Komponen UI reusable, utils, dan konstanta.
- `src/lib/`: Inisialisasi library (Prisma, Auth).
- `src/app/`: Routing Next.js App Router.

## Lisensi

MIT
