# Review Keamanan STAGING — Migrasi RPC Sensitif ke Edge Functions

**Status: PROPOSAL KODE SAJA — BELUM DIDEploy — BELUM ADA MIGRASI DATABASE YANG DITERAPKAN**

## Tujuan

Menghilangkan pemanggilan langsung dari browser terhadap tiga RPC SECURITY DEFINER yang sebelumnya dapat dieksekusi oleh role authenticated:

- delete_investigation_bundle(text)
- activate_premium_7d(uuid)
- reject_registration(uuid, text)

Browser sekarang diarahkan ke tiga Edge Functions terautentikasi: delete-investigation, activate-registration, dan reject-registration.

## Model kepercayaan

1. Aplikasi memanggil Edge Function menggunakan sesi Supabase Auth pengguna.
2. Edge Function memakai withSupabase({ auth: "user" }); request tanpa JWT pengguna yang valid ditolak.
3. Identitas aktor diambil dari ctx.userClaims.sub, bukan dari body request atau user_metadata.
4. Operasi database istimewa memakai ctx.supabaseAdmin di server Supabase. Kunci server tidak ditanam pada aplikasi browser atau repository.
5. Dua operasi registrasi memeriksa profiles.role = 'admin' pada Edge Function dan mengulang pemeriksaan yang sama di SQL.
6. Penghapusan investigasi memeriksa investigations.owner_id = actor_id dalam transaksi SQL; admin tidak mendapat bypass kepemilikan.
7. Fungsi SQL baru hanya memberi hak EXECUTE kepada service_role. RPC lama dicabut dari PUBLIC, anon, dan authenticated.
8. Seluruh fungsi SQL menggunakan search_path = '' dan referensi objek yang terkualifikasi skema.

## Perubahan dalam branch ini

- app.js: ketiga aksi istimewa memakai supabase.functions.invoke(); tidak ada lagi pemanggilan langsung tiga RPC lama.
- supabase/functions/_shared/secure-admin-operation.ts: validasi JWT, actor ID, CORS, pemeriksaan peran admin, dan pemanggilan RPC server-side.
- Tiga entrypoint Edge Function untuk hapus investigasi, aktivasi akses, dan penolakan registrasi.
- supabase/migrations/20261104140000_secure_admin_operations_edge_functions.sql: definisi RPC server-only dan pencabutan EXECUTE RPC lama.
- tests/release-smoke.test.js: pemeriksaan statis bahwa browser tidak lagi memanggil RPC sensitif langsung.
- Branch ini berasal dari PR #67 yang khusus STAGING; konfigurasi backend STAGING tetap terisolasi. Jangan gabungkan branch ini ke branch produksi.

## Hal yang harus diverifikasi sebelum deployment STAGING

### 1. Prasyarat Supabase

- Pastikan runtime Edge Functions pada proyek STAGING mendukung npm:@supabase/server dan menyediakan konteks supabaseAdmin.
- Pastikan environment Edge Functions menyediakan URL, key publishable/anon untuk validasi user, dan secret/service-role key untuk operasi server-side. Nilai secret tidak boleh disalin ke repository, chat, atau browser.
- Pastikan profiles.role memakai nilai admin untuk administrator yang sah.
- Pastikan kolom audit metadata atau details cocok dengan cabang SQL yang dijalankan.
- Pastikan tabel dan foreign key yang dirujuk migration sama dengan skema STAGING saat deployment.

### 2. Urutan penerapan yang direncanakan

1. Tinjau migration pertama (20261104140000) pada branch database STAGING; migration ini hanya menambahkan RPC server-only dan belum mencabut RPC lama.
2. Terapkan migration pertama pada STAGING.
3. Deploy tiga Edge Functions ke STAGING.
4. Deploy aplikasi STAGING yang menggunakan Edge Functions. Cache-busting app.js dan service worker dinaikkan ke v180 agar browser tidak memakai JavaScript lama.
5. Uji ketiga alur melalui Edge Functions, termasuk otorisasi dan audit, sementara RPC lama masih tersedia sebagai jembatan sementara.
6. Setelah aplikasi baru dan ketiga endpoint terverifikasi, terapkan migration kedua (20261104141000) untuk mencabut EXECUTE RPC lama dari PUBLIC, anon, dan authenticated.
7. Uji ulang pemanggilan langsung RPC lama (harus ditolak), uji regresi, periksa audit log/data, lalu jalankan Security Advisor.

**Urutan dua migration ini wajib dipertahankan.** Jangan menerapkan migration kedua sebelum Edge Functions dan aplikasi baru sudah aktif serta lulus pengujian. Migration pertama sendiri tidak memutus aplikasi lama.

## Matriks uji wajib

| Kasus uji | Hasil yang diharapkan |
|---|---|
| Tanpa sesi / JWT tidak valid | 401, tidak ada perubahan data |
| Petugas kedua menghapus investigasi milik orang lain | 403 / ditolak SQL, investigasi tetap ada |
| Pemilik menghapus investigasi sendiri | Berhasil, data turunan dan audit tercatat atomik |
| Petugas non-admin mengaktifkan akses | 403, tidak ada subscription/registrasi berubah |
| Petugas non-admin menolak registrasi | 403, tidak ada perubahan |
| Admin mengaktifkan registrasi pending | Berhasil, subscription 7 hari dan audit tercatat |
| Admin menolak registrasi pending | Berhasil, alasan dan audit tercatat |
| Panggilan browser langsung ke RPC lama | Ditolak karena EXECUTE dicabut |
| Panggilan authenticated langsung ke RPC baru | Ditolak karena EXECUTE hanya service_role |
| Public survey | Tetap nonaktif; publicSurveyEnabled: false |

## Risiko / batasan yang masih terbuka

- Penggunaan supabaseAdmin melewati RLS. Karena itu, pemeriksaan aktor di Edge Function dan pemeriksaan ulang di SQL merupakan kontrol wajib, bukan pilihan.
- CORS bukan mekanisme autentikasi; keamanan berasal dari verifikasi JWT dan otorisasi server-side.
- Versi SDK/runtime dan ketersediaan secret harus diuji pada proyek STAGING yang sebenarnya.
- Fungsi Edge dan SQL belum dideploy atau dijalankan. Pemeriksaan statis/CI tidak membuktikan runtime.
- Security Advisor terkait leaked-password protection pada paket Free tetap merupakan temuan terpisah dan belum terselesaikan oleh rancangan ini.

## Batas rilis

- Tidak ada perubahan pada proyek Supabase produksi.
- Tidak ada deployment Cloudflare atau Supabase pada pekerjaan ini.
- Tidak ada migrasi database yang diterapkan.
- Tidak ada data investigasi, kasus, kontak, spesimen, kunjungan, survei, atau respons yang diubah.
- publicSurveyEnabled tetap false.
- PR wajib tetap Draft dan DO NOT MERGE sampai seluruh gerbang uji STAGING lulus dan pengguna memberi persetujuan terpisah untuk langkah berikutnya.
