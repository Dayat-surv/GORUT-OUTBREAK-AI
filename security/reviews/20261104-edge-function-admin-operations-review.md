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

1. Tinjau dan validasi migration pada salinan/branch database STAGING terlebih dahulu.
2. Deploy tiga Edge Functions ke STAGING saja.
3. Jalankan migration SQL STAGING agar RPC lama ditutup dan RPC baru hanya dapat dipanggil service role.
4. Verifikasi browser memanggil Edge Function, bukan RPC lama.
5. Jalankan pengujian negatif: tanpa sesi, akun petugas kedua, akun pemilik, dan admin.
6. Periksa audit log dan jumlah data sebelum/sesudah pengujian.
7. Jalankan Security Advisor dan uji regresi aplikasi.

**Jangan menjalankan migration sebelum Edge Functions siap.** Saat RPC lama dicabut, versi aplikasi lama yang masih memanggil RPC tersebut akan gagal sampai versi aplikasi baru dan Edge Functions tersedia. Rencanakan urutan deployment agar tidak terjadi jeda fungsi.

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
