# 🌐 Panduan Lengkap Hosting Online Gratis MovieHub

Dokumen ini memandu Anda mempublikasikan aplikasi **MovieHub (Frontend React + Backend Go + Database PostgreSQL)** ke internet secara **100% GRATIS** agar dapat diakses oleh banyak orang dari HP, tablet, maupun laptop di mana saja.

Tersedia **2 Pilihan Cara**:
1. **Opsi 1 (Full Cloud 24/7)**: Online terus menerus di cloud tanpa perlu laptop Anda menyala. (*Rekomendasi untuk Publik/Produksi*)
2. **Opsi 2 (Instant Tunnel 1 Menit)**: Membuka akses Docker lokal Anda ke publik via link HTTPS resmi dalam 1 menit. (*Cocok untuk Demo Cepat*)

---

## 🚀 OPSI 1: Full Cloud Deployment 24/7 (100% Gratis Selamanya)

Arsitektur hosting gratis terbaik untuk stack ini:
```mermaid
graph LR
    User[📱 / 💻 Pengunjung Internet] -->|HTTPS| Frontend[⚡ Vercel / Netlify<br/>React + Vite Frontend]
    Frontend -->|REST API & JWT| Backend[🚀 Render.com / Koyeb<br/>Go Fiber API Gateway]
    Backend -->|SQL Query| DB[(🐘 Neon.tech<br/>Serverless PostgreSQL)]
    Backend -.->|Auto Fallback| Cache[⚡ In-Memory Cache]
```

| Komponen | Layanan Gratis Rekomendasi | Fitur Free Tier | Biaya |
|---|---|---|---|
| **Database** | [Neon.tech](https://neon.tech) / Supabase | PostgreSQL 16+ Serverless (0.5 GB storage, SSL) | Rp 0 / Gratis |
| **Backend API** | [Render.com](https://render.com) / Koyeb | Web Service (Docker / Go, Free HTTPS domain) | Rp 0 / Gratis |
| **Frontend Web** | [Vercel](https://vercel.com) / Netlify | Unlimited Bandwidth, Global Edge CDN, Free SSL | Rp 0 / Gratis |

---

### Langkah 1: Buat Database PostgreSQL Gratis di Neon.tech

1. Buka [https://neon.tech](https://neon.tech) dan klik **Sign Up** (bisa login dengan akun GitHub / Google).
2. Buat Project baru, beri nama misalnya: `moviehub-db`.
3. Setelah dibuat, Anda akan langsung mendapatkan **Connection String (Database URL)** seperti:
   ```text
   postgresql://moviehub_owner:npg_xxxx@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Selesai!** Database Anda sudah siap.
   > 💡 **Auto-Migration**: Backend MovieHub telah dilengkapi fitur *Auto-Migrate*. Saat backend pertama kali terkoneksi ke Neon, backend akan secara otomatis membuat seluruh tabel dan mengisikan akun Super Admin, Admin, film-film, kategori, dan banner bawaan!

---

### Langkah 2: Deploy Backend Go ke Render.com

1. Buat repositori Git di komputer Anda dan upload ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: setup cloud ready MovieHub"
   git branch -M main
   # Buat repository baru di github.com lalu sambungkan:
   git remote add origin https://github.com/USERNAME_ANDA/Aplikasi_Movie.git
   git push -u origin main
   ```
2. Buka [https://render.com](https://render.com) dan login dengan akun GitHub.
3. Klik tombol **New +** ➔ **Web Service**.
4. Pilih repositori GitHub `Aplikasi_Movie` yang tadi Anda upload.
5. Konfigurasi Web Service:
   - **Name**: `moviehub-api` *(atau nama pilihan Anda)*
   - **Root Directory**: `backend`
   - **Environment**: `Docker` *(Render otomatis mendeteksi `backend/Dockerfile`)*
   - **Instance Type**: `Free`
6. Masukkan **Environment Variables**:
   | Key | Value | Keterangan |
   |---|---|---|
   | `DATABASE_URL` | *`postgresql://...neon.tech/neondb?sslmode=require`* | URL koneksi dari Neon Langkah 1 |
   | `PORT` | `8080` | Port default backend |
   | `JWT_SECRET` | `super-secret-moviehub-jwt-token-key-2026-v1` | Kunci rahasia token auth |
   | `CORS_ALLOWED_ORIGINS` | `*` | Memperbolehkan akses dari Vercel |
7. Klik **Create Web Service**. Tunggu proses build selesai (~2-3 menit).
8. Setelah status **Live**, Anda akan mendapatkan URL backend, contoh:
   ```text
   https://moviehub-api.onrender.com
   ```
   *(Coba buka `https://moviehub-api.onrender.com/health` di browser untuk memastikan status `healthy`)*.

---

### Langkah 3: Deploy Frontend React ke Vercel

1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New...** ➔ **Project**.
3. Import repositori `Aplikasi_Movie`.
4. Di bagian pengaturan project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Klik *Edit*, pilih folder `frontend`.
5. Buka bagian **Environment Variables**, tambahkan:
   - **NAME**: `VITE_API_URL`
   - **VALUE**: `https://moviehub-api.onrender.com/api/v1` *(Ganti dengan URL Render backend Anda di Langkah 2)*
6. Klik **Deploy**!
7. Dalam waktu ~40 detik, frontend MovieHub Anda sudah aktif dengan URL publik HTTPS resmi, contoh:
   ```text
   https://moviehub-cinema.vercel.app
   ```
   Bagikan URL ini ke siapa pun untuk mulai streaming dan mengakses Super Admin & Admin Studio!

---

## ⚡ OPSI 2: Instant Public Tunnel (Cepat 1 Menit dari Docker Lokal)

Jika Docker Anda sedang berjalan di komputer lokal dan Anda ingin **saat ini juga** langsung dites oleh teman, dosen, atau banyak orang tanpa perlu mendaftar cloud:

### Cara A: Menggunakan Cloudflare Tunnel (Tanpa Akun, Sangat Cepat & Resmi)

1. Unduh `cloudflared` (resmi dari Cloudflare) via terminal PowerShell:
   ```powershell
   winget install Cloudflare.cloudflared
   ```
2. Pastikan Docker MovieHub sedang menyala di laptop Anda:
   ```bash
   docker compose up -d
   ```
3. Buka tunnel langsung ke port frontend (3000):
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
4. Terminal akan menampilkan URL publik HTTPS instan, contoh:
   ```text
   https://your-temporary-name.trycloudflare.com
   ```
5. URL tersebut langsung dapat diakses siapa pun di seluruh dunia via browser HP/laptop!

---

### Cara B: Menggunakan Localtunnel (Langsung via Node.js / npx)

Jika komputer Anda sudah terpasang Node.js:
1. Pastikan Docker menyala:
   ```bash
   docker compose up -d
   ```
2. Jalankan perintah ini di Command Prompt / PowerShell:
   ```bash
   npx localtunnel --port 3000
   ```
3. Anda akan diberikan URL publik:
   ```text
   your url is: https://bright-movies-stream.loca.lt
   ```
4. Saat pertama dibuka, pengunjung cukup memasukkan *friendly password* berupa IP publik pengirim (tertera di layar) untuk langsung masuk ke aplikasi.

---

## 🔑 Kredensial Akun untuk Pengujian Publik

Setelah aplikasi online, Anda dan pengunjung dapat menguji semua fitur menggunakan kredensial bawaan:

| Peran (Role) | Username | Password | Fitur yang Bisa Dicoba |
|---|---|---|---|
| **Super Admin** | `superadmin` | `SuperAdmin123!` | Kelola User, Iklan Pre-Roll, Saluran QRIS, Audit Log |
| **Admin Studio** | `admin` | `Admin123!` | Manajemen Film, Transcoding Video, Subtitle, Kategori |
| **Viewer** | `user` | `User123!` | Streaming Film 4K, Continue Watching, Donasi QRIS |

---

## 📋 Ringkasan File & Kode yang Telah Disesuaikan

Kami telah memperbarui kode backend dan frontend agar 100% siap langsung jalan di cloud:
1. **`backend/internal/config/config.go` & `db.go`**: Mendukung variabel `DATABASE_URL` (standar Neon.tech / Supabase / Render / Railway).
2. **Auto-Migrate Schema**: Database cloud yang baru dibuat akan otomatis terisi tabel & data seed film saat backend pertama kali dinyalakan.
3. **CORS Dinamis**: Mendukung domain Vercel/Netlify melalui `CORS_ALLOWED_ORIGINS` tanpa kendala blokir CORS browser.
4. **`backend/Dockerfile` & `frontend/Dockerfile`**: Menggunakan Multi-Stage build standar produksi.
5. **`frontend/vercel.json`**: Menangani client-side SPA routing agar tidak terjadi 404 saat merefresh halaman selain beranda.
