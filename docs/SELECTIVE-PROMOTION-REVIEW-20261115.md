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

## 7. Status setelah audit
- Pemeriksaan skema, kebijakan, fungsi, grants, Edge Functions, dan advisor Production: selesai secara read-only.
- Kompatibilitas frontend STAGING dengan Production: belum lulus karena dependensi Edge Functions belum tersedia di Production.
- Perubahan database Production: nihil.
- Deployment Production: nihil.
- Branch `main`: tidak diubah.
- Branch promosi hanya berisi dokumentasi audit; belum ada kode runtime yang dipromosikan.
