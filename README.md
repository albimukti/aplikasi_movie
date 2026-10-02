# 🎬 MovieHub Cinema — Platform Streaming Film 4K & Admin Studio

Aplikasi **MovieHub** dibangun sesuai seluruh spesifikasi teknis dan acuan arsitektur pada dokumen **`Dokumentasi_Implementasi_Aplikasi_Movie.pdf`**.

Platform ini mengadopsi tema **Merah & Hitam Sinematik (Cinema Red & Deep Black)** dengan efek visual **3D, Glassmorphism, Glow Neon**, serta pemisahan tampilan yang sangat tegas antara **Super Admin** dan **Admin (Content Ops)**.

---

## 🌟 Fitur Utama Sesuai Spesifikasi Dokumen

### 1. 🛡️ Super Admin Console (Pusat Kendali Penuh)
- **Tema Visual**: *Crimson Ruby & Obsidian Armor*, lencana otoritas penuh.
- **Manajemen Akun & Role**: Ubah role (*SuperAdmin, Admin, Viewer*), tangguhkan akun (*SUSPEND*), tambah akun baru, hapus akun.
- **Manajemen Iklan Pre-Roll**: Buat campaign iklan video, atur durasi tayang, batas waktu tombol lewati (*skip timer*), prioritas, serta pantau analitik tayangan (*impressions, completion rate, clicks*).
- **Kanal QRIS Donasi Komunitas**: Unggah barcode QRIS, aktifkan/nonaktifkan, ubah pesan dukungan untuk Viewer.
- **Audit Trail & Keamanan Menyeluruh**: Rekam seluruh aksi login, pembuatan/perubahan akun, mutasi data, alamat IP, dan metadata JSON.
- **Pengaturan Sistem Platform**: Konfigurasi resolusi default, batas ukuran unggah, dan status operasional.

### 2. 🎬 Admin Content Studio (Editorial & Transcoding)
- **Tema Visual**: *Warm Amber & Carbon Black Studio*, fokus alur kerja editorial.
- **Katalog & Alur Publikasi**: Alur status film `DRAFT` ➔ `PROCESSING` ➔ `READY` ➔ `PUBLISHED`.
- **Pipeline Transcoding & Kompresi**: Pantau antrean job transcoding multi-resolusi (4K Ultra HD, 1080p FHD, 720p HD, 480p SD), status progres animasi, serta tombol *Retry Job* untuk job yang gagal.
- **Manajemen Subtitle & Terjemahan**: Tambah dan hubungkan file `.vtt`/`.srt` multi-bahasa (*Bahasa Indonesia, English, Japanese, dll.*), dan tentukan subtitle utama (default).
- **Manajemen Kategori / Genre**: Tambah genre baru dengan auto-slug generator.
- **Log Editorial Terbatas**: Melihat riwayat audit yang hanya berhubungan dengan konten media.

### 3. 🍿 Viewer / Penonton Streaming
- **Hero Showcase 4K**: Banner latar interaktif dengan badge 4K Ultra HD dan tombol putar instan.
- **Lanjutkan Menonton (Continue Watching)**: Menyimpan riwayat dan detik terakhir film secara otomatis.
- **Filter Kategori & Pencarian**: Filter cepat berdasarkan genre (*Action, Sci-Fi, Drama, Anime, dll.*) dan pengurutan (*Populer, Rating, Tahun, Rilis*).
- **Pemutar Video Sinematik (Cinema Player)**:
  - **Sistem Keputusan Iklan (Ad Decision Engine)**: Pemutaran iklan pre-roll dengan hitung mundur tombol lewati (*skip button*).
  - **Pemilih Kualitas**: 4K (2160p), 1080p, 720p, 480p.
  - **Pemilih Subtitle**: Multi-bahasa (*ID, EN, JA, Off*).
- **Halaman Dukungan QRIS**: Tampilan barcode QRIS nasional dengan nominal donasi pilihan, salin data, dan simulasi konfirmasi pembayaran.
- **Verifikasi CAPTCHA SVG**: Sistem keamanan visual CAPTCHA dinamis saat login.

---

## 🛠️ Arsitektur Teknologi

| Komponen | Teknologi yang Digunakan |
|---|---|
| **Backend API Gateway** | Golang Fiber v2 (REST API, Clean Architecture, Routing, CORS) |
| **Database Utama** | PostgreSQL 18 (UUID v4, Foreign Keys, JSONB, Indexes) |
| **Cache & Session** | Redis dengan Fallback Otomatis Memory Cache |
| **Otentikasi & Keamanan** | JWT Access & Refresh Token Rotation + SVG CAPTCHA + Bcrypt |
| **Media Processing** | Worker background transcoding (4K, 1080p, 720p, 480p) & FFmpeg readiness |
| **Frontend Web** | React JS 19 + Vite + Tailwind CSS v3 + Lucide Icons |
| **Kontainerisasi** | Dockerfile multi-stage & Docker Compose v3.8 |

---

## 🔑 Kredensial Akun Bawaan (Seed Data)

Database lokal telah terisi akun siap pakai untuk pengujian:

| Role | Username | Email | Password | Hak Akses |
|---|---|---|---|---|
| **Super Admin** | `superadmin` | `superadmin@moviehub.com` | `SuperAdmin123!` | Penuh (User, Role, Ad, QRIS, Audit, System) |
| **Admin** | `admin` | `admin@moviehub.com` | `Admin123!` | Studio (Movie, Transcoding, Subtitle, Category) |
| **Viewer** | `user` | `user@moviehub.com` | `User123!` | Penonton (Streaming 4K, Subtitle, QRIS) |

> 🔒 **Autentikasi Fleksibel & Aman**: Login dapat menggunakan **Username** atau **Email** beserta password dan verifikasi kode **CAPTCHA**. Sistem akan secara otomatis mengarahkan ke dashboard yang sesuai dengan role pengguna (*Super Admin Console*, *Admin Studio*, atau *Viewer Home*). Di dalam modal login juga disediakan tombol klik cepat untuk mengisi kredensial demo secara instan.

---

## 🚀 Panduan Menjalankan Aplikasi

### Pilihan A: Menjalankan Menggunakan Docker Compose (Satu Perintah untuk Semua)

Pastikan Docker Desktop aktif di sistem Anda. Dari root folder proyek (`Aplikasi_Movie`):

```bash
docker compose up -d --build
```

Layanan yang otomatis berjalan dalam kontainer:
- **moviehub-postgres**: Port `5433` di host (`5432` internal) terisi otomatis dengan skema dan seed `001_init.sql`.
- **moviehub-redis**: Port `6379` untuk high-speed cache & session token blacklist.
- **moviehub-backend**: Port `8080` (Go Fiber v2 API Gateway).
- **moviehub-frontend**: Port `3000` (Nginx Alpine + React SPA production build).

Untuk menghentikan kontainer:
```bash
docker compose down
```

---

### Pilihan B: Menjalankan Secara Hybrid (Database & Redis di Docker, App di Host)

1. **Jalankan Redis di Docker**:
```bash
docker run -d --name moviehub-redis -p 6379:6379 --restart unless-stopped redis:7-alpine
```

2. **Jalankan Backend (Golang)**:
```bash
cd backend
.\moviehub-server.exe
# atau go run cmd/server/main.go
```
*Backend akan otomatis mendeteksi dan tersambung ke `Redis` pada `localhost:6379` dan `PostgreSQL` pada `localhost:5432`.*

3. **Jalankan Frontend (React + Vite)**:
```bash
cd frontend
npm run dev
```
Buka browser di **`http://localhost:5173`**
