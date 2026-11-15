# Tinjauan Promosi Selektif STAGING ke Production
Tanggal: 15 November 2026

## Status
- Repository: Dayat-surv/GORUT-OUTBREAK-AI
- Branch sumber: staging/backend-auth-e2e-20261028
- Snapshot sumber: f40dae773f8e197d4f566661fe228eac0e5f39c1 (commit dokumentasi gerbang rilis)
- Branch dasar promosi: main
- Commit dasar main saat branch dibuat: 0bce6e12a84cae6e7179266e7eed9ecc2634986b
- Branch kerja: release/production-selective-20261115
- Branch kerja dibuat dari commit main tersebut dan diverifikasi identik dengan main (0 ahead / 0 behind; 0 file berbeda pada saat pemeriksaan).

## 1. Bukti CI STAGING
GitHub Actions run #39: https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/43692644286

Job staging-checks selesai dengan conclusion SUCCESS. Seluruh langkah berikut sukses:
1. Checkout STAGING
2. Set up Node.js
3. Check JavaScript syntax (app.js, sw.js, public-survey-integration.js)
4. Research snapshot regression tests
5. Isolated GIS test-mode regression tests
6. Release smoke tests
7. Supabase RPC static security checks
8. Supabase validation SQL safety checks

Catatan: CI ini membuktikan job yang didefinisikan berhasil pada commit f40dae7. CI statis tidak menggantikan uji browser, pengujian langsung terhadap Supabase Production, atau audit keamanan independen.

## 2. Temuan perbedaan yang wajib diperhatikan

Perbandingan main dengan STAGING menunjukkan 25 file berbeda dan riwayat branch divergen. Perubahan tidak boleh digabungkan sekaligus.

### A. Jangan port apa adanya
- `backend-config.js`: STAGING menunjuk ke Supabase STAGING `xeqdhwqylutntphlkmqe`; main menunjuk ke Supabase Production `lheuszdhprwmtajhdukc`. Pertahankan konfigurasi Production dari main. Jangan menyalin URL atau publishable key STAGING.
- `supabase/migrations/*staging*`: migration berlabel STAGING harus ditinjau satu per satu terhadap schema, policy, function grants, dan data Production. Jangan jalankan otomatis.
- `supabase/migrations/20261010_public_survey_dashboard_rpc.sql`: STAGING mengubah fungsi dashboard dari SECURITY DEFINER menjadi SECURITY INVOKER dan mengubah relasi response/case. Perubahan ini memerlukan validasi skema dan hak akses pada Production sebelum dipertimbangkan.
- `app.js`: perubahan STAGING mencakup persistence investigasi server-side, pembuatan/pembaruan/penghapusan melalui Supabase, serta Edge Function untuk registrasi/admin. Sebagian pesan dan alur secara eksplisit menyebut STAGING. Perlu port selektif dan penyesuaian lingkungan; jangan salin file penuh.
- `index.html`: STAGING menambahkan fungsi modal registrasi dan pembaruan cache asset. Fungsi registrasi memiliki guard/pesan STAGING dan perlu ditinjau agar sesuai dengan konfigurasi Production.
- `sw.js`: versi cache dan daftar asset berbeda; harus diselaraskan dengan file yang benar-benar dipromosikan.
- `premium.css`: konten main dan STAGING berbeda cukup besar. Jangan mengganti stylesheet penuh tanpa review visual/regresi.

### B. Kandidat port yang lebih aman setelah review
- Tes regresi yang tidak mengandung rahasia atau konfigurasi environment: `tests/gis-test-mode.test.js`, perubahan tes `tests/release-smoke.test.js`, `tests/research-snapshot-valid-case.test.js`, dan fixture riset.
- Dokumentasi STAGING: hanya bila berguna untuk dokumentasi pengembang; bukan bagian dari deployment runtime.
- Perbaikan UI/JS tertentu: hanya setelah perubahan kecil diidentifikasi, disalin selektif, dan dites pada branch kerja.

Kandidat di atas bukan persetujuan otomatis untuk merge.

## 3. Klasifikasi seluruh 25 file yang berubah
1. `.github/workflows/research-snapshot-tests.yml` — workflow CI; review dampak terhadap workflow main.
2. `.github/workflows/staging-validation.yml` — workflow khusus STAGING; tidak perlu ikut deployment aplikasi Production.
3. `app.js` — perubahan runtime besar; port selektif saja.
4. `backend-config.js` — environment-specific; pertahankan Production.
5. `docs/PANDUAN-MEMBUAT-STAGING-SUPABASE.md` — dokumentasi STAGING.
6. `docs/RELEASE-GATE-STAGING-20261115.md` — dokumentasi STAGING.
7. `docs/STAGING-PUBLIC-SURVEY-E2E-20261019.md` — dokumentasi STAGING.
8. `index.html` — perubahan runtime; review selektif.
9. `supabase/migrations/20261010_public_survey_dashboard_rpc.sql` — perubahan database sensitif; review terpisah.
10. `supabase/migrations/20261027213557_staging_operational_schema_additive_v1.sql` — migrasi STAGING; jangan port otomatis.
11. `supabase/migrations/20261027213637_staging_rls_owner_boundaries_v1.sql` — kebijakan akses; jangan port otomatis.
12. `supabase/migrations/20261027213725_staging_private_rls_helper_v1.sql` — helper keamanan; jangan port otomatis.
13. `supabase/migrations/20261027213741_staging_registration_access_rpcs_v1.sql` — RPC registrasi; jangan port otomatis.
14. `supabase/migrations/20261027213807_staging_registration_email_validation_fix_v1.sql` — validasi registrasi; review sebelum digunakan.
15. `supabase/migrations/20261027213834_staging_survey_response_owner_read_v1.sql` — RLS survei; jangan port otomatis.
16. `supabase/migrations/20261030054215_staging_public_survey_dashboard_rpc_invoker_v1.sql` — RPC akses dashboard; review hak akses Production.
17. `supabase/migrations/20261030054310_staging_public_survey_dashboard_case_link_fix_v1.sql` — relasi response/case; validasi data Production.
18. `supabase/migrations/20261030054504_staging_disable_legacy_registration_and_public_survey_rpcs_v1.sql` — perubahan grants/RPC; review keamanan wajib.
19. `supabase/migrations/20261110030000_staging_profiles_update_policy_consolidation.sql` — policy profil; review keamanan wajib.
20. `sw.js` — cache runtime; sesuaikan dengan asset hasil port.
21. `tests/fixtures/research-valid-case.json` — fixture uji.
22. `tests/gis-test-mode.test.js` — tes mode GIS.
23. `tests/release-smoke.test.js` — tes rilis.
24. `tests/research-snapshot-valid-case.test.js` — tes snapshot riset.
25. `tests/supabase-rpc-static.test.js` — tes kontrak keamanan RPC.

## 4. Langkah promosi berikutnya
1. Review lebih lanjut fungsi-fungsi spesifik di `app.js` terhadap kebutuhan Production dan Edge Functions yang benar-benar aktif di proyek Production.
2. Cocokkan migrasi kandidat terhadap skema dan grants Production secara read-only terlebih dahulu.
3. Pilih satu perbaikan kecil yang sudah diverifikasi dan port ke branch kerja ini.
4. Jalankan workflow/regression tests pada branch kerja.
5. Lakukan review visual dan uji browser pada lingkungan terisolasi sebelum pull request ke main.
6. Minta persetujuan eksplisit pemilik aplikasi sebelum merge atau deployment Production.

## 5. Batas perubahan
Dokumen ini dibuat pada branch `release/production-selective-20261115`. Branch `main`, GitHub Pages Production, Supabase Production, dan data operasional Production tidak diubah. Belum ada pull request, merge, migrasi Production, atau deployment Production.


## 6. Pemeriksaan read-only Supabase Production (15 Nov 2026)

Proyek Production teridentifikasi sebagai `gorut-outbreak-ai`, ref `lheuszdhprwmtajhdukc`, status proyek ACTIVE_HEALTHY, PostgreSQL 17.11. Tidak ada perintah perubahan skema atau data yang dijalankan.

### Struktur dan data
- 14 tabel di schema public; seluruh 14 tabel mengaktifkan RLS.
- `relforcerowsecurity` belum diaktifkan (FORCE RLS false).
- Snapshot jumlah baris: investigations 9, cases 5, contacts 0, specimens 0, field_visits 0, registration_requests 0, active public_surveys 0. Angka ini hanya snapshot saat audit, bukan pernyataan bahwa tabel kosong secara permanen.
- Kebijakan owner pada tabel operasional menggunakan `auth.uid() = owner_id` pada USING dan WITH CHECK. Policy admin tersedia terpisah pada audit_log, profiles, dan registration_requests.
- Fungsi `is_admin()` memeriksa role pada `profiles`, bukan user metadata JWT.

### Edge Functions
Daftar Edge Functions Production yang dikembalikan Supabase MCP kosong. Ini berbeda dari STAGING yang memiliki:
- activate-registration v5
- reject-registration v4
- delete-investigation v4
- create-registration-request v1

STAGING `app.js` memanggil ketiga fungsi registrasi/admin tersebut dan fungsi penghapusan investigasi melalui `supabase.functions.invoke(...)`. Karena fungsi-fungsi itu belum terdaftar di Production, mempromosikan kode frontend STAGING tanpa menyiapkan/deploy fungsi Production yang telah diaudit akan menghasilkan alur yang gagal. Jangan deploy fungsi STAGING apa adanya; sesuaikan endpoint, konfigurasi, secrets, otorisasi Admin, dan pemeriksaan kepemilikan terhadap Production terlebih dahulu.

### Fungsi SQL dan Security Advisor
Production memiliki 9 fungsi di schema public, seluruhnya SECURITY DEFINER dan `search_path=''`. Dari pemeriksaan hak EXECUTE:
- `activate_premium_7d`, `reject_registration`: EXECUTE authenticated, tidak untuk anon. Isi fungsi memeriksa `auth.uid()` memiliki role admin sebelum perubahan.
- `create_registration_request`: EXECUTE authenticated, tidak untuk anon. Isi fungsi mewajibkan sesi login dan email formulir cocok dengan email akun.
- `get_my_public_survey_submissions`: EXECUTE authenticated, tidak untuk anon. Isi fungsi membatasi hasil ke investigasi yang `owner_id = auth.uid()`.
- `is_admin`: EXECUTE authenticated, tidak untuk anon; hanya mengembalikan boolean dari role profil.
- `get_public_survey`, `submit_public_survey` (dua signature), dan trigger function `handle_new_user`: tidak memiliki EXECUTE untuk anon maupun authenticated pada hasil pemeriksaan privilege.

Security Advisor memberi 5 peringatan SECURITY DEFINER yang dapat dipanggil authenticated (empat fungsi di atas kecuali fungsi-fungsi tanpa EXECUTE; tepatnya activate_premium_7d, create_registration_request, get_my_public_survey_submissions, is_admin, reject_registration), serta peringatan leaked-password protection disabled. Lima fungsi tersebut mempunyai guard internal yang terlihat pada definisinya, tetapi tetap memerlukan review dan uji otorisasi independen sebelum rilis. Jangan menganggap peringatan selesai hanya karena ada guard internal.
Health Advisor tidak mengembalikan lint.

### Keputusan kompatibilitas
1. Jangan jalankan migrasi STAGING ke Production.
2. Jangan menyalin `backend-config.js` STAGING.
3. Jangan mempromosikan `app.js` STAGING sebelum Edge Functions Production tersedia dan telah diuji.
4. Jangan mengubah grants SECURITY DEFINER Production hanya berdasarkan peringatan advisor; evaluasi kebutuhan aplikasi dan jalur pemanggilan lebih dahulu.
5. Production memiliki data operasional (9 investigations dan 5 cases pada snapshot audit). Semua perubahan tetap memerlukan backup, rencana rollback, dan persetujuan eksplisit.

## 7. Status setelah audit awal
- Pemeriksaan skema, kebijakan, fungsi, grants, Edge Functions, dan advisor Production selesai secara read-only.
- Pada tahap audit awal, kompatibilitas frontend STAGING belum lulus karena dependensi Edge Functions belum tersedia di Production.
- Pada tahap audit awal, belum ada perubahan database atau deployment Production.
- Branch `main` tidak diubah. Catatan ini kemudian diperbarui oleh bagian 9 setelah port selektif dan uji kandidat.


## 8. Paket kandidat empat Edge Functions Production disiapkan (belum aktif)

Dibuat pada branch promosi:
- `supabase/functions/_shared/production-operation.ts`
- `supabase/functions/activate-registration/index.ts`
- `supabase/functions/reject-registration/index.ts`
- `supabase/functions/delete-investigation/index.ts`
- `supabase/functions/create-registration-request/index.ts`
- `supabase/migrations/20261115090000_production_edge_operations_candidate.sql`
- `supabase/PRODUCTION-EDGE-FUNCTIONS-PREPARATION.md`

Penyesuaian khusus schema Production:
- `audit_log.details` digunakan sebagai kolom audit.
- Tidak mengasumsikan adanya `registration_requests.rejection_reason`.
- Status aktivasi diset ke `verified`, sesuai kondisi yang dibaca UI Production.
- Semua RPC baru dibatasi EXECUTE ke `service_role`; Edge Functions menerima JWT dan meneruskan actor ID hanya dari klaim JWT terverifikasi.
- Aktivasi dan penolakan memerlukan role Admin; penghapusan memeriksa kepemilikan investigasi di dalam RPC; pembuatan permohonan memerlukan email Auth terverifikasi yang sama.

Pemeriksaan file di GitHub mengonfirmasi seluruh 6 file kode/migrasi dan dokumen paket tersimpan di branch. Ini merupakan pemeriksaan isi repositori, bukan hasil kompilasi Deno, uji migrasi, atau uji runtime.

**Belum dilakukan:** migration tidak dijalankan di proyek mana pun; Edge Functions tidak dideploy; endpoint Production belum dibuat; belum ada data atau konfigurasi Production yang diubah. Deployment memerlukan persetujuan eksplisit terpisah karena endpoint akan langsung aktif setelah deploy.


### Pemeriksaan lanjutan 15 November 2026
- Kolom semua tabel yang disentuh migrasi kandidat telah dicocokkan dengan schema Production melalui metadata PostgreSQL.
- Penghapusan investigasi kini menolak operasi jika ditemukan child record atau survei terkait dengan owner/creator berbeda. Hal ini mencegah penghapusan lintas akun bila ada inkonsistensi relasi.
- Snapshot ulang Production: 9 investigations, 5 cases, 0 contacts, 0 specimens, 0 field_visits, 0 registration_requests, 0 active public_surveys; Production masih tidak memiliki Edge Functions.
- Snapshot data konsisten dengan audit sebelumnya. Tidak ada migrasi, deploy, grant, perubahan secret, atau operasi tulis pada Production.

**Gerbang masih tertutup:** belum ada kompilasi Deno, uji migrasi di clone database, atau uji runtime. Paket hanya kandidat source code. Jangan deploy atau menerapkan migration sebelum semua uji matriks pada dokumen persiapan selesai dan persetujuan eksplisit diberikan.


## 9. Audit lanjutan, perbaikan selektif, dan uji kandidat (15 November 2026)

### Perbaikan pada branch release
Audit membuktikan bahwa kandidat Edge Functions awal belum dipanggil oleh frontend Production berbasis main. Empat operasi masih menggunakan RPC lama atau hanya memodifikasi state lokal. Untuk menutup celah integrasi tersebut, perubahan STAGING dipindahkan secara selektif ke app.js pada branch release:
- registrasi: create-registration-request melalui Edge Function; jika sign-up belum memberi session, pengguna diminta mengonfirmasi email dan login sebelum mengirim permohonan;
- aktivasi: activate-registration melalui Edge Function;
- penolakan: reject-registration melalui Edge Function;
- penghapusan: delete-investigation melalui Edge Function, dengan verifikasi session dan serverId serta konfirmasi server sebelum state lokal dihapus.

Tidak ada salinan penuh app.js STAGING. backend-config.js tetap konfigurasi Production dari main.

### Hardening SQL
- Registrasi memakai pg_advisory_xact_lock untuk mencegah permohonan ganda akibat retry serentak, dan deduplikasi dibatasi pada user_id yang sama.
- Penghapusan mengunci parent dan child rows sebelum pemeriksaan.
- Penghapusan memasukkan kontak dan spesimen yang terhubung tidak langsung melalui kasus, serta menolak relasi lintas investigasi.
- Uji metadata Production read-only menunjukkan semua kolom yang dirujuk tersedia. Foreign key Production menunjukkan kontak dapat merujuk kasus melalui index_case_id dan spesimen melalui case_id. Snapshot saat audit menemukan nol record yang hanya terhubung melalui kasus, tetapi fungsi tetap mengantisipasi kondisi tersebut.
- Dependency npm:@supabase/server dipatok pada 1.9.2.

### Bukti uji otomatis
GitHub Actions run #1: https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/43697019083 — **SUCCESS** pada kedua job:
1. validate: node --check app.js, pemeriksaan kontrak keamanan statis, dan deno check pada keempat Edge Functions.
2. postgres-integration: migrasi diterapkan pada PostgreSQL 17 disposable dengan skema sintetis; uji positif/negatif registrasi, email belum terverifikasi, aktivasi/penolakan Admin, larangan non-admin, penghapusan bundle, kepemilikan berbeda, dan relasi lintas investigasi lulus. Data uji di-rollback.

Cakupan ini membuktikan sintaks/tipe Edge Function dan logika PostgreSQL pada skema sintetis. Ini **bukan** clone Supabase Production dan tidak membuktikan RLS aktual, validasi JWT platform, runtime Edge Functions Supabase, CORS browser, konfigurasi secrets, atau uji end-to-end browser.

### Temuan Production yang masih terbuka
Security Advisor (read-only, 15 Nov 2026):
- Lima fungsi SECURITY DEFINER lama masih dapat dipanggil authenticated: activate_premium_7d, create_registration_request, get_my_public_survey_submissions, is_admin, reject_registration. Fungsi tersebut memiliki guard internal, tetapi perlu review independen terhadap grants dan jalur pemanggilan. Tidak ada grant Production yang diubah.
- Leaked Password Protection masih nonaktif pada paket Free.

Performance Advisor:
- 12 foreign key tanpa covering index (INFO);
- 4 index belum terpakai (INFO);
- satu multiple permissive SELECT policy pada profiles (WARN).
Health Advisor tidak menemukan lint.

### Status kandidat saat ini
- Lulus: frontend JavaScript parse; TypeScript/Deno check; static assertions; migrasi PostgreSQL 17 disposable; synthetic positive/negative SQL tests.
- Belum lulus: Supabase Edge Runtime/Auth/JWT end-to-end, validasi RLS pada lingkungan Supabase terisolasi, uji browser, backup/restore rehearsal, peer review independen legacy SECURITY DEFINER grants, dan final release review.
- Production Supabase: tidak berubah; tidak ada migrasi atau Edge Function yang dideploy.
- main dan GitHub Pages: tidak berubah.
- Belum ada PR, merge, atau deployment. Kandidat tetap pada branch release/production-selective-20261115.
