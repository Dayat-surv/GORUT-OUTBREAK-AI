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

### Runtime negative/authorization dan positive tests

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

Uji positif ADMIN untuk aktivasi dan penolakan registrasi sintetis kemudian berhasil. Aktivasi menghasilkan satu subscription `premium_7d` aktif dengan masa berlaku tepat 7 hari; penolakan menghasilkan status `rejected`. Uji positif penghapusan tetap tidak dilakukan.

### CI dan database

- GitHub Actions run #176 pada commit kode `283f99ef397d3cfee3e5aeacb8dddbd0d7cb4703`: **SUCCESS** — https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/41862971915.
- Lulus: JavaScript syntax, research snapshot regression, release smoke tests, Supabase RPC static security checks, dan SQL safety checks. Run #169 adalah hasil CI sebelumnya.
- Security Advisor pascamigrasi: tidak ada temuan RPC baru; temuan tersisa adalah leaked password protection nonaktif pada paket Free.
- Snapshot database akhir STAGING: 3 investigasi sintetis; 0 kasus, kontak, spesimen, kunjungan lapangan, survei publik, dan respons survei.
- `publicSurveyEnabled:false` tetap.

## Pekerjaan tersisa / risiko

- Review manual akhir masih terbuka untuk temuan error response: shared handler saat ini mengirim `error.message` dari database secara langsung kepada client. Pesan database dapat mengungkap detail internal; pertimbangkan pemetaan ke kode error publik yang aman dan pencatatan detail hanya di log server sebelum rilis.
- Tes positif delete belum dilakukan; ownership denial telah diuji, tetapi keberhasilan penghapusan atomik dan audit belum dibuktikan.
- Bila diperlukan, tes ADMIN sukses hanya dengan record registrasi sintetis khusus STAGING yang disetujui untuk dimutasi; jangan gunakan registrasi nyata.
- Jangan lakukan tes hapus positif pada tiga investigasi sintetis yang saat ini dipertahankan. Bila dibutuhkan, buat record khusus yang boleh dihapus dengan persetujuan terpisah.
- Temuan leaked-password protection perlu ditangani melalui pengaturan paket/produk yang mendukung; tidak terkait langsung dengan migrasi Edge Functions.
- CI statis dan uji negatif tidak menggantikan review kode serta uji positif terkontrol sebelum rilis.

## Batas rilis

- Proyek Supabase produksi dan URL produksi tidak disentuh.
- Tidak ada data produksi yang diubah.
- `publicSurveyEnabled:false`; tidak ada survei publik atau sinkronisasi yang diaktifkan.
- PR #69 wajib tetap **Draft / DO NOT MERGE** sampai review akhir selesai dan pengguna memberikan persetujuan eksplisit terpisah untuk promosi berikutnya.


## Perbaikan pasca-review manual — 4 November 2026

- [x] Validasi actor ID diperketat menjadi format UUID kanonis (termasuk versi dan variant UUID yang valid).
- [x] Exception tak terduga pada handler tidak lagi dilabeli sebagai kegagalan autentikasi; respons generik HTTP 500 `INTERNAL_SERVER_ERROR` digunakan.
- [x] Smoke-test ditambah untuk mengunci dua perilaku tersebut.
- [x] CI run #176 pada commit kode perbaikan `283f99ef397d3cfee3e5aeacb8dddbd0d7cb4703` SUCCESS.
- [x] Runtime uji aktivasi positif pada deployment Edge Function yang memuat pemetaan HTTP 409 berhasil setelah akun Auth sintetis tersedia.
- [ ] Uji runtime negatif 401/403/404 tidak diulang khusus setelah perbaikan helper; hasil sebelumnya tetap tercatat, tetapi tidak boleh dianggap sebagai rerun pada deployment terbaru.


## Temuan review manual tambahan

1. **Respons error database terlalu rinci:** perbaikan kode telah dibuat pada commit `1d43cc83afff710115a2266e27be3a7a846cc050`. Handler kini mengembalikan kode publik generik (`NOT_AUTHORIZED`, `NOT_FOUND`, `CONFLICT`, `OPERATION_FAILED`) dan hanya mencatat nama operasi, SQLSTATE, serta status pada log server. Perubahan ini belum memiliki hasil CI yang terkonfirmasi dan belum dideploy/diuji runtime pada STAGING.
2. **Penghapusan positif belum tervalidasi:** uji 403 non-owner telah berhasil, tetapi belum ada uji sukses owner yang membuktikan seluruh bundle terhapus atomik dan audit tercatat. Jangan menggunakan tiga investigasi yang dipertahankan; uji ini memerlukan record sintetis khusus dan persetujuan tersendiri.
3. **CI docs-only commit:** commit dokumentasi `9c434f8ebdc9648a12ec1b93e062f6d73db5a814` tidak menghasilkan workflow run pada pemeriksaan connector. CI #176 tetap menguji commit kode `283f99ef397d3cfee3e5aeacb8dddbd0d7cb4703`, bukan commit dokumentasi terbaru.

Perubahan kode perbaikan respons error dibuat pada branch PR saja; belum ada redeploy Edge Function atau perubahan database. Produksi tetap tidak disentuh.
