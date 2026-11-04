# Runbook Pengujian Runtime Edge Functions — STAGING

**Tanggal pembaruan:** 4 November 2026  
**Lingkup:** proyek Supabase STAGING `xeqdhwqylutntphlkmqe` dan PR #69.  
**Batas tegas:** tidak ada perubahan pada produksi; `publicSurveyEnabled:false`; uji delete positif hanya dilakukan pada satu investigasi sintetis khusus yang disetujui untuk dihapus; tiga investigasi lain tetap dipertahankan.

## Status pelaksanaan

- [x] Tiga Edge Functions aktif pada STAGING: `delete-investigation`, `activate-registration`, `reject-registration`; ketiganya memakai `verify_jwt=true`.
- [x] Shared handler mengambil actor ID dari verified JWT (`ctx.userClaims?.id ?? ctx.jwtClaims?.sub`) dan memeriksa role admin dari `profiles`.
- [x] Migration pertama `20261104140000_secure_admin_operations_edge_functions.sql` diterapkan pada STAGING.
- [x] Hak baca `service_role` ke `public.profiles` diberikan pada STAGING agar Edge Function dapat memeriksa role.
- [x] Migration kedua `20261104141000_revoke_legacy_admin_rpc_client_access.sql` diterapkan pada STAGING setelah persetujuan pengguna.
- [x] Verifikasi hak EXECUTE: RPC lama ditolak untuk `anon` dan `authenticated`; RPC baru hanya dapat dieksekusi `service_role`.
- [x] Tes tanpa sesi pada ketiga endpoint: HTTP 401 (deployment sebelumnya).
- [x] Tes PETUGAS untuk aktivasi dan penolakan registrasi: HTTP 403 `ADMIN_ONLY` (deployment sebelumnya).
- [x] Tes PETUGAS bukan pemilik saat menghapus investigasi: HTTP 403 `NOT_AUTHORIZED` (deployment sebelumnya).
- [x] Tes langsung tiga RPC lama dari browser: HTTP 403 / permission denied.
- [x] Uji positif ADMIN untuk penolakan registrasi sintetis STAGING berhasil (HTTP 200); verifikasi read-only menunjukkan status `rejected`, `user_id=null`.
- [x] Uji positif ADMIN untuk aktivasi registrasi sintetis STAGING berhasil; registrasi berubah menjadi `approved` dan terhubung ke user Auth yang benar.
- [x] Subscription Premium 7 hari berhasil dibuat satu kali dengan status `active`; `starts_at=2026-11-04T16:10:49.990267Z` dan `expires_at=2026-11-11T16:10:49.990267Z`.
- [x] Uji prasyarat tanpa akun Auth cocok menghasilkan HTTP 409; tidak ada subscription atau perubahan registrasi pada percobaan tersebut.
- [x] Security Advisor pascamigrasi: tidak ada temuan RPC baru; temuan yang tersisa adalah leaked password protection nonaktif pada paket Free.
- [x] GitHub Actions run #176 pada commit kode `283f99ef397d3cfee3e5aeacb8dddbd0d7cb4703` SUCCESS: https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/41862971915
- [x] Uji positif `delete-investigation` melalui Edge Function pada satu record sintetis khusus berhasil (`success=true`, `deleted=true`); semua hitungan child bundle yang dikembalikan = 0.
- [x] Query read-back independen memastikan ID target tidak lagi ada dan ketiga investigasi sintetis yang dipertahankan tetap ada dengan `owner_id` semula.
- [x] Pemeriksaan konsistensi setelah delete: investigations=3; cases=0; contacts=0; specimens=0; field_visits=0; public_surveys=0; survey_responses=0.
- [x] PR #69 masih Open, Draft, dan belum merged.
- [x] Shared handler yang menyamarkan error database telah dideploy ulang ke STAGING: `activate-registration` v5, `reject-registration` v4, `delete-investigation` v4; semuanya `verify_jwt=true`.
- [x] Runtime test terbaru pada deployment tersebut: ketiga endpoint dipanggil dengan UUID dummy yang tidak ada; masing-masing mengembalikan HTTP 404 dan JSON `{"error":"NOT_FOUND"}`.
- [x] GitHub Actions run #183 pada commit `66ba24fb36cf1d0dbef81a29ede9c4087f9a0bcb` berstatus `completed / success`: https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/41876830458.
- [x] Shared handler memetakan pesan `AUTH_REQUIRED` menjadi HTTP 401 dan kode publik `AUTH_REQUIRED`; assertion regresi statis ditambahkan ke `tests/release-smoke.test.js` pada commit `c1d952664474af9861ebf5b755398a417bcfe5b8`.
- [ ] CI untuk commit assertion dan pembaruan dokumentasi terbaru masih harus selesai.

## Hasil runtime terbaru — penyamaran error (4 November 2026)

Tes dilakukan dari browser STAGING yang telah login ADMIN, menggunakan UUID dummy `00000000-0000-4000-8000-000000000000`. Tidak ada target yang cocok sehingga tes tidak mengubah data.

| Edge Function | HTTP | JSON aktual | Hasil |
|---|---:|---|---|
| `activate-registration` | 404 | `{"error":"NOT_FOUND"}` | Lulus |
| `reject-registration` | 404 | `{"error":"NOT_FOUND"}` | Lulus |
| `delete-investigation` | 404 | `{"error":"NOT_FOUND"}` | Lulus |

Pesan konsol `Edge Function returned a non-2xx status code` merupakan pesan umum dari `supabase-js`; body respons aktual telah diperiksa dan hanya berisi kode publik `NOT_FOUND`. Tidak terlihat pesan database, nama tabel, constraint, atau detail internal pada body respons tersebut.

## Hasil uji positif penghapusan investigasi (4 November 2026)

Pengujian dilakukan dari halaman aplikasi STAGING dengan sesi terautentikasi. Sebelum pemanggilan, `backendClient()` menghasilkan client aktif, sesi tersedia, dan `auth.getUser()` mengembalikan user ID yang sama dengan `owner_id` target (`51acea1d-34a8-4811-9f9c-c3cee464ef3e`). Endpoint `delete-investigation` dipanggil satu kali dengan `investigation_id` khusus berikut:

- ID target: `6d12f897-94f6-4f12-8df6-9074d8649c11`.
- Nama: `SIMULASI STAGING — UJI POSITIF HAPUS INVESTIGASI — 04-11-2026`.
- Respons: `success=true`, `deleted=true`, `error=null`.
- Jumlah child bundle yang dilaporkan: `cases=0`, `contacts=0`, `specimens=0`, `field_visits=0`, `public_surveys=0`, `survey_responses=0`.

Query read-back pada `public.investigations` mengembalikan tepat tiga ID yang dipertahankan dan tidak mengembalikan ID target. Ketiga record tetap memiliki owner ID `51acea1d-34a8-4811-9f9c-c3cee464ef3e`:

| ID yang dipertahankan | Hasil |
|---|---|
| `4463eb81-d3dd-4c53-a9d7-423fbd881cd4` | Tetap ada |
| `21f0c877-e282-4dbc-bd1a-57c76117c628` | Tetap ada |
| `c620faf3-5563-4b27-8601-211a26cc35dc` | Tetap ada |
| `6d12f897-94f6-4f12-8df6-9074d8649c11` | Tidak ditemukan setelah penghapusan |

Kesimpulan: jalur penghapusan positif berhasil untuk tepat satu target yang disetujui; ketiga investigasi lain tidak terhapus. Pengujian dilakukan hanya di STAGING.

## Detail hasil uji runtime sebelumnya

| Skenario | Hasil aktual | Interpretasi |
|---|---|---|
| Tanpa sesi → tiga Edge Functions | 401 | JWT diwajibkan |
| PETUGAS → activate-registration | 403 `ADMIN_ONLY` | Role non-admin ditolak |
| PETUGAS → reject-registration | 403 `ADMIN_ONLY` | Role non-admin ditolak |
| PETUGAS bukan pemilik → delete-investigation | 403 `NOT_AUTHORIZED` | Pemeriksaan kepemilikan bekerja |
| Browser → RPC lama activate/reject/delete | 403 permission denied | Akses client ke RPC lama telah dicabut |
| ADMIN → activate dengan UUID dummy | 404 `NOT_FOUND` (deployment terbaru) | Target tidak ditemukan; respons publik generik |
| ADMIN → reject dengan UUID dummy | 404 `NOT_FOUND` (deployment terbaru) | Target tidak ditemukan; respons publik generik |
| ADMIN → delete dengan ID dummy | 404 `NOT_FOUND` (deployment terbaru) | Target tidak ditemukan; bukan bukti jalur admin karena delete berbasis kepemilikan |
| ADMIN → reject registrasi sintetis | HTTP 200 | Mutasi positif berhasil; read-back status `rejected`, `user_id=null` |
| ADMIN → activate registrasi sintetis | Tidak ada error; read-back `approved` | Mutasi positif berhasil; `user_id` terhubung ke Auth user yang cocok |
| Subscription setelah aktivasi | `premium_7d`, `active` | Satu subscription; durasi tepat 7 hari |
| Aktivasi tanpa akun Auth yang cocok | HTTP 409 | Prasyarat bisnis ditolak dengan status konflik yang sesuai |

### Rincian data sintetis untuk uji positif

- Registrasi aktivasi: `93a5ed73-4357-462b-aea2-8ca6609db412`; email `staging-activate-20261104@example.invalid`; status akhir `approved`; `user_id=d046b830-2dc9-4949-b052-2b099765d4a1`.
- Subscription: `abb368a2-58b4-4ff2-bfe1-b947e89794c2`; `plan_code=premium_7d`; status `active`; mulai 4 Nov 2026 16:10:49.990267 UTC; berakhir 11 Nov 2026 16:10:49.990267 UTC.
- Registrasi penolakan: `f5608a58-84db-4029-b035-558e4f2e85a5`; status akhir `rejected`; `user_id=null`.
- Uji positif hanya memutasi dua registrasi sintetis yang telah disetujui untuk pengujian dan membuat satu subscription sintetis. Tidak ada data kasus atau investigasi yang dihapus.

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

Snapshot akhir STAGING yang diverifikasi:
- Investigations: **3** (tiga investigasi sintetis dipertahankan).
- Cases, contacts, specimens, field visits, public surveys, survey responses: **0**.
- Satu subscription sintetis `premium_7d` aktif dibuat untuk uji aktivasi positif.
- `publicSurveyEnabled:false` harus tetap dipertahankan.
- Tidak ada data produksi yang disentuh.

## Pekerjaan yang masih tersisa

1. Tunggu CI terbaru pada commit assertion regresi dan pembaruan dokumentasi.
2. Runtime test yang sudah dilakukan membuktikan 401 dari gerbang JWT tanpa sesi. Cabang SQL `AUTH_REQUIRED` tidak diuji terpisah karena actor ID yang tidak valid sudah ditolak sebelum RPC; assertion regresi statis memastikan pemetaan defensifnya tetap 401.
3. Uji delete positif telah selesai pada satu record sintetis khusus; tiga investigasi lain tetap dipertahankan.
4. Jangan merge PR #69 atau mengubah produksi tanpa persetujuan eksplisit yang terpisah.

## Rollback / batas rilis

- Jangan menjalankan migration tambahan tanpa review dan persetujuan.
- Jika endpoint bermasalah setelah cutover, jangan membuka kembali RPC lama untuk client secara spontan. Buat rollback STAGING yang ditinjau dan tetap menjaga fungsi istimewa tertutup bagi client.
- Uji delete positif hanya menargetkan ID `6d12f897-94f6-4f12-8df6-9074d8649c11`; tiga ID investigasi yang dipertahankan tetap ada.
- Tidak ada langkah di runbook ini yang mengizinkan perubahan produksi.
- Tidak ada pengaktifan survei publik atau sinkronisasi.
- PR #69 tetap **DRAFT — STAGING ONLY — DO NOT MERGE**.
