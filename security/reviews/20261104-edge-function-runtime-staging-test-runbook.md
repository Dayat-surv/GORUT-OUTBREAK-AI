# Runbook Pengujian Runtime Edge Functions — STAGING

**Tanggal pembaruan:** 4 November 2026  
**Lingkup:** proyek Supabase STAGING `xeqdhwqylutntphlkmqe` dan preview branch PR #69.  
**Batas tegas:** tidak ada perubahan pada produksi; `publicSurveyEnabled:false`; tidak ada pengujian operasi ADMIN yang memutasi data.

## Status pelaksanaan

<badge> </badge>
- [x] Tiga Edge Functions aktif pada STAGING: `delete-investigation`, `activate-registration`, `reject-registration`; ketiganya memakai `verify_jwt=true`.
- [x] Shared handler mengambil actor ID dari verified JWT (`ctx.userClaims?.id ?? ctx.jwtClaims?.sub`) dan memeriksa role admin dari `profiles`.
- [x] Migration pertama `20261104140000_secure_admin_operations_edge_functions.sql` diterapkan pada STAGING.
- [x] Hak baca `service_role` ke `public.profiles` diberikan pada STAGING agar Edge Function dapat memeriksa role.
- [x] Migration kedua `20261104141000_revoke_legacy_admin_rpc_client_access.sql` diterapkan pada STAGING setelah persetujuan pengguna.
- [x] Verifikasi hak EXECUTE: RPC lama ditolak untuk `anon` dan `authenticated`; RPC baru hanya dapat dieksekusi `service_role`.
- [x] Tes tanpa sesi pada ketiga endpoint menghasilkan HTTP 401.
- [x] Tes PETUGAS untuk aktivasi dan penolakan registrasi menghasilkan HTTP 403 `ADMIN_ONLY`.
- [x] Tes PETUGAS bukan pemilik saat menghapus investigasi menghasilkan HTTP 403 `NOT_AUTHORIZED`.
- [x] Tes langsung tiga RPC lama dari browser menghasilkan HTTP 403 / permission denied.
- [x] Tes ADMIN dengan UUID dummy yang tidak ada: activate dan reject menghasilkan HTTP 404 `Permintaan registrasi tidak ditemukan`; delete menghasilkan HTTP 404 `INVESTIGATION_NOT_FOUND`.
- [x] Security Advisor pascamigrasi: tidak ada temuan RPC baru; temuan yang tersisa adalah leaked password protection nonaktif pada paket Free.
- [x] GitHub Actions run #169 SUCCESS: syntax, research snapshot regression, release smoke tests, Supabase RPC static security, dan SQL safety checks.
- [x] Pemeriksaan konsistensi akhir: investigations=3; cases=0; contacts=0; specimens=0; field_visits=0; public_surveys=0; survey_responses=0.
- [x] PR #69 masih Open, Draft, dan belum merged.

## Detail hasil uji runtime

| Skenario | Hasil aktual | Interpretasi |
|---|---|---|
| Tanpa sesi → tiga Edge Functions | 401 | JWT diwajibkan |
| PETUGAS → activate-registration | 403 `ADMIN_ONLY` | Role non-admin ditolak |
| PETUGAS → reject-registration | 403 `ADMIN_ONLY` | Role non-admin ditolak |
| PETUGAS bukan pemilik → delete-investigation | 403 `NOT_AUTHORIZED` | Pemeriksaan kepemilikan bekerja |
| Browser → RPC lama activate/reject/delete | 403 permission denied | Akses client ke RPC lama telah dicabut |
| ADMIN → activate dengan UUID dummy | 404 registrasi tidak ditemukan | Pemeriksaan admin dilewati; tidak ada record target |
| ADMIN → reject dengan UUID dummy | 404 registrasi tidak ditemukan | Pemeriksaan admin dilewati; tidak ada record target |
| ADMIN → delete dengan ID dummy | 404 investigasi tidak ditemukan | Tidak ada investigasi target; bukan bukti jalur admin karena delete berbasis kepemilikan |

Tes ADMIN menggunakan UUID valid yang dipastikan tidak ada, sehingga tidak mengaktifkan subscription, mengubah status registrasi, menghapus investigasi, atau membuat audit mutasi sukses. **Belum dilakukan tes sukses ADMIN yang benar-benar mengubah data.** Tes positif hapus investigasi juga tidak dilakukan.

## Hak akses database setelah cutover

Hasil verifikasi `has_function_privilege`:

| Fungsi | anon | authenticated | service_role |
|---|---:|---:|---:|
| Legacy `activate_premium_7d` | false | false | false |
| Legacy `reject_registration` | false | false | false |
| Legacy `delete_investigation_bundle` | false | false | false |
| New `edge_activate_premium_7d` | false | false | true |
| New `edge_reject_registration` | false | false | true |
| New `edge_delete_investigation_bundle` | false | false | true |

Edge Functions memanggil RPC baru melalui konteks server `supabaseAdmin`; browser tidak memperoleh hak EXECUTE pada RPC tersebut.

## Pemeriksaan data dan batas keselamatan

Snapshot akhir STAGING:
- Investigations: **3** (tiga investigasi sintetis dipertahankan).
- Cases, contacts, specimens, field visits, public surveys, survey responses: **0**.
- `publicSurveyEnabled:false` harus tetap dipertahankan.
- Tidak ada data produksi yang disentuh.

## Pekerjaan yang masih tersisa

1. Review manual akhir terhadap kode, migration, dan dokumentasi PR #69.
2. Jika diperlukan, lakukan pengujian ADMIN positif yang memutasi hanya record registrasi sintetis khusus STAGING, setelah record uji dan dampaknya disetujui secara terpisah.
3. Jangan lakukan pengujian delete positif pada investigasi yang saat ini dipertahankan; jika benar-benar diperlukan, buat record khusus yang boleh dihapus dan minta persetujuan tersendiri.
4. Jangan merge PR #69 atau mengubah produksi tanpa persetujuan eksplisit yang terpisah.

## Rollback / batas rilis

- Jangan menjalankan migration tambahan tanpa review dan persetujuan.
- Jika endpoint bermasalah setelah cutover, jangan membuka kembali RPC lama untuk client secara spontan. Buat rollback STAGING yang ditinjau dan tetap menjaga fungsi istimewa tertutup bagi client.
- Tidak ada langkah di runbook ini yang mengizinkan perubahan produksi.
- Tidak ada pengaktifan survei publik atau sinkronisasi.
