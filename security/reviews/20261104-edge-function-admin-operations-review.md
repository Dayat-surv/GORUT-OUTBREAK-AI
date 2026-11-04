# Review Keamanan STAGING — Migrasi RPC Sensitif ke Edge Functions

**Status: TELAH DITERAPKAN DAN DIUJI PADA STAGING — PR MASIH DRAFT, BELUM MERGED.**  
**Tanggal verifikasi:** 4 November 2026.

## Tujuan

Mengalihkan tiga operasi istimewa dari pemanggilan RPC langsung oleh browser ke Edge Functions yang memverifikasi sesi pengguna dan otorisasi server-side:

- `delete_investigation_bundle(text)`
- `activate_premium_7d(uuid)`
- `reject_registration(uuid, text)`

Browser sekarang memakai `supabase.functions.invoke()` untuk endpoint `delete-investigation`, `activate-registration`, dan `reject-registration`.

## Model kepercayaan yang diterapkan

1. Edge Function menggunakan `withSupabase({ auth: "user" })`; request tanpa JWT valid ditolak.
2. Actor ID diambil dari verified JWT/context (`ctx.userClaims?.id ?? ctx.jwtClaims?.sub`), bukan dari body request atau `user_metadata`.
3. Pemeriksaan ADMIN memakai exact match `profiles.role = 'admin'` pada Edge Function dan diulang di SQL untuk aktivasi/penolakan registrasi.
4. Penghapusan investigasi memeriksa `investigations.owner_id = actor_id`; role admin tidak melewati batas kepemilikan.
5. Operasi database istimewa dipanggil server-side melalui `ctx.supabaseAdmin`; service-role secret tidak ditanam pada aplikasi browser/repository.
6. RPC baru menggunakan `SECURITY DEFINER`, `search_path = ''`, referensi skema terkualifikasi, dan EXECUTE hanya untuk `service_role`.
7. Migration kedua mencabut EXECUTE pada RPC lama dari `PUBLIC`, `anon`, dan `authenticated`.
8. CORS bukan mekanisme autentikasi; batas keamanan berasal dari verifikasi JWT, pemeriksaan role/ownership, dan hak EXECUTE database.

## Perubahan branch

- `app.js`: ketiga aksi memakai `supabase.functions.invoke()`.
- Shared handler dan tiga Edge Function.
- Migration pertama `20261104140000_secure_admin_operations_edge_functions.sql` untuk membuat RPC server-only.
- Migration kedua `20261104141000_revoke_legacy_admin_rpc_client_access.sql` untuk mencabut akses client ke RPC lama.
- `tests/release-smoke.test.js`, review ini, dan runbook runtime STAGING.
- Cache-busting aplikasi/service worker v180.
- Branch tetap terisolasi dari produksi; konfigurasi STAGING tidak boleh digabung ke konfigurasi produksi.

## Hasil deployment dan pengujian STAGING

### Deployment dan migrasi

- [x] Tiga Edge Functions dideploy ke proyek STAGING `xeqdhwqylutntphlkmqe`.
- [x] Ketiganya aktif dengan `verify_jwt=true`.
- [x] Migration pertama diterapkan.
- [x] Grant `SELECT` pada `public.profiles` untuk `service_role` diterapkan pada STAGING agar pemeriksaan role berjalan.
- [x] Migration kedua diterapkan setelah persetujuan pengguna.
- [x] Verifikasi privilege menunjukkan ketiga RPC lama tidak dapat dieksekusi `anon`, `authenticated`, maupun `service_role`; ketiga RPC baru hanya dapat dieksekusi `service_role`.
- [x] Aplikasi preview branch v180 diuji melalui browser.

### Runtime negative/authorization tests

| Skenario | Hasil aktual |
|---|---|
| Tanpa sesi ke tiga Edge Functions | HTTP 401 |
| PETUGAS → activate-registration | HTTP 403 `ADMIN_ONLY` |
| PETUGAS → reject-registration | HTTP 403 `ADMIN_ONLY` |
| PETUGAS bukan pemilik → delete-investigation | HTTP 403 `NOT_AUTHORIZED` |
| Browser memanggil RPC lama activate/reject/delete | HTTP 403 permission denied |
| ADMIN activate dengan UUID valid yang tidak ada | HTTP 404 `Permintaan registrasi tidak ditemukan` |
| ADMIN reject dengan UUID valid yang tidak ada | HTTP 404 `Permintaan registrasi tidak ditemukan` |
| ADMIN delete dengan ID investigasi yang tidak ada | HTTP 404 `INVESTIGATION_NOT_FOUND` |

HTTP 404 pada dua operasi registrasi ADMIN menunjukkan pemeriksaan ADMIN dilewati dan fungsi mencapai pencarian record. Tes menggunakan UUID dummy yang tidak ada sehingga tidak ada aktivasi, penolakan, subscription, atau audit mutasi sukses. Untuk delete, 404 hanya membuktikan target tidak ditemukan; fungsi delete mengandalkan ownership, bukan role ADMIN.

**Belum dilakukan operasi ADMIN sukses yang mengubah data.** Pengujian positif penghapusan juga tidak dilakukan.

### CI dan database

- GitHub Actions run #169: **SUCCESS** — https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/41845412592
- Lulus: JavaScript syntax, research snapshot regression, release smoke tests, Supabase RPC static security checks, dan SQL safety checks.
- Security Advisor pascamigrasi: tidak ada temuan RPC baru; temuan tersisa adalah leaked password protection nonaktif pada paket Free.
- Snapshot database akhir STAGING: 3 investigasi sintetis; 0 kasus, kontak, spesimen, kunjungan lapangan, survei publik, dan respons survei.
- `publicSurveyEnabled:false` tetap.

## Pekerjaan tersisa / risiko

- Review manual akhir terhadap kode dan migration.
- Bila diperlukan, tes ADMIN sukses hanya dengan record registrasi sintetis khusus STAGING yang disetujui untuk dimutasi; jangan gunakan registrasi nyata.
- Jangan lakukan tes hapus positif pada tiga investigasi sintetis yang saat ini dipertahankan. Bila dibutuhkan, buat record khusus yang boleh dihapus dengan persetujuan terpisah.
- Temuan leaked-password protection perlu ditangani melalui pengaturan paket/produk yang mendukung; tidak terkait langsung dengan migrasi Edge Functions.
- CI statis dan uji negatif tidak menggantikan review kode serta uji positif terkontrol sebelum rilis.

## Batas rilis

- Proyek Supabase produksi dan URL produksi tidak disentuh.
- Tidak ada data produksi yang diubah.
- `publicSurveyEnabled:false`; tidak ada survei publik atau sinkronisasi yang diaktifkan.
- PR #69 wajib tetap **Draft / DO NOT MERGE** sampai review akhir selesai dan pengguna memberikan persetujuan eksplisit terpisah untuk promosi berikutnya.
