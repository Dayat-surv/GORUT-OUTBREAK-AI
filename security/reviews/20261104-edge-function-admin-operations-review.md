# Review Keamanan STAGING — Migrasi RPC Sensitif ke Edge Functions

**Status: IMPLEMENTASI DAN UJI POSITIF REGISTRASI SELESAI DI STAGING — REVIEW KEAMANAN AKHIR MASIH TERBUKA; PR TETAP DRAFT DAN BELUM MERGED.**  
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
- [x] Shared handler yang menyamarkan error database dideploy ulang pada 4 November 2026: `activate-registration` v5, `reject-registration` v4, `delete-investigation` v4; semuanya `verify_jwt=true`.

### Runtime negative/authorization dan positive tests

| Skenario | Hasil aktual |
|---|---|
| Tanpa sesi ke tiga Edge Functions | HTTP 401 (deployment sebelumnya) |
| PETUGAS → activate-registration | HTTP 403 `ADMIN_ONLY` (deployment sebelumnya) |
| PETUGAS → reject-registration | HTTP 403 `ADMIN_ONLY` (deployment sebelumnya) |
| PETUGAS bukan pemilik → delete-investigation | HTTP 403 `NOT_AUTHORIZED` (deployment sebelumnya) |
| Browser memanggil RPC lama activate/reject/delete | HTTP 403 permission denied |
| ADMIN activate dengan UUID dummy tidak ada | HTTP 404 `{"error":"NOT_FOUND"}` (deployment terbaru) |
| ADMIN reject dengan UUID dummy tidak ada | HTTP 404 `{"error":"NOT_FOUND"}` (deployment terbaru) |
| ADMIN delete dengan ID investigasi dummy tidak ada | HTTP 404 `{"error":"NOT_FOUND"}` (deployment terbaru) |

Tiga respons 404 terbaru telah diperiksa dari body JSON browser Console. Ketiganya hanya mengembalikan kode publik `NOT_FOUND`, tanpa pesan database internal. Tes menggunakan UUID dummy yang tidak ada, sehingga tidak mengubah registrasi, subscription, atau investigasi. Pesan `Edge Function returned a non-2xx status code` yang dicetak `supabase-js` merupakan pembungkus umum untuk respons 404 dan bukan body respons server.

HTTP 404 pada operasi registrasi ADMIN menunjukkan target tidak ditemukan setelah request terautentikasi; tes ini bukan pengganti pengujian role negatif PETUGAS. Untuk delete, 404 hanya membuktikan target tidak ditemukan; fungsi delete mengandalkan ownership, bukan role ADMIN.

Uji positif ADMIN untuk aktivasi dan penolakan registrasi sintetis berhasil. Aktivasi menghasilkan satu subscription `premium_7d` aktif dengan masa berlaku tepat 7 hari; penolakan menghasilkan status `rejected`. Uji positif penghapusan juga berhasil pada satu investigasi sintetis khusus yang disetujui untuk dihapus: Edge Function mengembalikan `success=true`, `deleted=true`, tanpa error. Respons melaporkan seluruh hitungan child bundle = 0. Query read-back independen memastikan target `6d12f897-94f6-4f12-8df6-9074d8649c11` sudah tidak ada, sementara ketiga investigasi sintetis yang dipertahankan tetap ada dengan owner ID yang sama.

### CI dan database

- GitHub Actions run #176 pada commit kode `283f99ef397d3cfee3e5aeacb8dddbd0d7cb4703`: **SUCCESS** — https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/41862971915.
- Run #176 lulus: JavaScript syntax, research snapshot regression, release smoke tests, Supabase RPC static security checks, dan SQL safety checks.
- GitHub Actions run #181 pada head PR `0d2c40189fd950a525681156ce482accd26b8214` berstatus `completed / success`: https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/41868145568.
- Security Advisor pascamigrasi: tidak ada temuan RPC baru; temuan tersisa adalah leaked password protection nonaktif pada paket Free.
- Snapshot database akhir STAGING: 3 investigasi sintetis; 0 kasus, kontak, spesimen, kunjungan lapangan, survei publik, dan respons survei.
- `publicSurveyEnabled:false` tetap.

## Temuan review manual dan status perbaikan

1. **Respons error database terlalu rinci:** perbaikan kode telah dibuat pada commit `1d43cc83afff710115a2266e27be3a7a846cc050`. Handler kini mengembalikan kode publik generik (`NOT_AUTHORIZED`, `NOT_FOUND`, `CONFLICT`, `OPERATION_FAILED`) dan hanya mencatat nama operasi, SQLSTATE, serta status pada log server. Perbaikan telah dideploy ke STAGING dan ketiga endpoint diuji dengan UUID dummy; semuanya mengembalikan HTTP 404 `{"error":"NOT_FOUND"}`. **Uji runtime penyamaran error lulus 3/3.**
2. **Uji delete positif:** berhasil pada record sintetis khusus yang disetujui; query read-back memastikan hanya target tersebut yang hilang dan tiga investigasi lain tetap ada.
3. **CI:** run #181 pada head PR sebelum pembaruan dokumentasi berstatus completed/success. Periksa ulang bila pembaruan dokumentasi memicu workflow baru.
4. **Leaked-password protection:** temuan Security Advisor tersisa pada konfigurasi paket Free; perlu ditangani melalui pengaturan yang mendukung dan tidak terkait langsung dengan migrasi Edge Functions.

## Batas rilis

- Proyek Supabase produksi dan URL produksi tidak disentuh.
- Tidak ada data produksi yang diubah.
- `publicSurveyEnabled:false`; tidak ada survei publik atau sinkronisasi yang diaktifkan.
- Uji positif delete hanya menghapus satu investigasi sintetis khusus; tiga investigasi sintetis lainnya tetap dipertahankan.
- PR #69 wajib tetap **Draft / DO NOT MERGE** sampai review akhir selesai, CI terbaru terkonfirmasi, dan pengguna memberikan persetujuan eksplisit terpisah untuk promosi berikutnya.
