# Audit dan Pengujian Kandidat Rilis Production

Tanggal audit: 15 November 2026  
Repository: `Dayat-surv/GORUT-OUTBREAK-AI`  
Branch: `release/production-selective-20261115`  
Commit yang diuji: `15d6aa98dd7481781efa200f3ac818c441af309a`  
Base `main`: `0bce6e12a84cae6e7179266e7eed9ecc2634986b`

## Ringkasan keputusan

**Status: layak untuk peer review kode dan pengujian lanjutan; belum layak untuk persetujuan deployment Production.**

Branch kandidat terpisah dari `main` (35 commit ahead, 0 behind pada saat audit). Perubahan tidak digabungkan ke `main`; tidak ada PR, merge, deployment, migrasi, perubahan secret, grant, atau operasi tulis pada Supabase Production.

## Bukti pengujian yang sudah lulus

GitHub Actions run [43697365938](https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/43697365938) pada commit di atas menyelesaikan dua job dengan status SUCCESS:

### Job `validate`
- `node --check app.js` — lulus.
- `scripts/validate-production-candidate.mjs` — lulus untuk pemeriksaan wiring frontend, pola JWT/actor/Admin, grant service_role-only, idempotensi registrasi, integritas penghapusan, dan keseimbangan leksikal SQL.
- `deno check` pada empat Edge Functions — lulus dengan Deno 2.9.8 dan dependency `@supabase/server@1.9.2`.

### Job `postgres-integration`
- PostgreSQL disposable 17 digunakan; log runtime menunjukkan PostgreSQL 17.12.
- Skema sintetis Production-shaped dibuat dari fixture repo.
- Migrasi kandidat diterapkan sampai COMMIT.
- Uji privilege memastikan RPC kandidat tidak dapat dieksekusi oleh `anon` atau `authenticated`, tetapi dapat oleh `service_role`.
- Uji positif/negatif lulus untuk registrasi terverifikasi dan idempotensi, email belum diverifikasi, aktivasi/penolakan Admin, penolakan petugas non-admin, penghapusan bundle, owner mismatch, dan relasi lintas investigasi.
- Seluruh data uji diakhiri dengan ROLLBACK; container PostgreSQL dihentikan.

**Batas bukti:** ini adalah PostgreSQL disposable dengan skema sintetis, bukan clone penuh Supabase Production dan bukan pengujian Supabase Edge Runtime. Uji tersebut tidak membuktikan integrasi RLS, Auth/JWT platform, CORS browser, secrets, atau deployment Supabase.

## Pemeriksaan tambahan pada Supabase Production (read-only)

Pemeriksaan ulang pada 15 November 2026 menunjukkan:
- Proyek `gorut-outbreak-ai`, ref `lheuszdhprwmtajhdukc`, status ACTIVE_HEALTHY, PostgreSQL 17.11.
- Daftar Edge Functions Production masih kosong.
- Security Advisor: 5 fungsi SECURITY DEFINER lama dapat dieksekusi role `authenticated`; Leaked Password Protection nonaktif.
- Performance Advisor: 12 foreign key tanpa covering index (INFO), 4 index belum terpakai (INFO), dan 1 peringatan multiple permissive SELECT policies pada `profiles` (WARN).
- Health Advisor: tidak ada lint.

Tidak ada temuan advisor yang diubah dalam audit ini.

## Daftar temuan dan tindakan perbaikan

| ID | Risiko | Temuan | Tindakan yang diperlukan | Status |
|---|---|---|---|---|
| F-01 | Tinggi / penghalang rilis | Edge Functions belum diuji pada Supabase Edge Runtime; validasi JWT platform dan perilaku `withSupabase({ auth: "user" })` belum diuji end-to-end. | Jalankan Supabase lokal dengan CLI + Docker, serve keempat fungsi, uji tanpa JWT, JWT petugas, JWT Admin, actor mismatch, dan respons CORS. Jika perangkat pengujian belum memiliki tool, pasang CLI/Docker atau gunakan runner CI terisolasi. | Terbuka |
| F-02 | Tinggi / penghalang rilis | Production belum memiliki Edge Functions, sedangkan frontend kandidat memanggil empat endpoint tersebut. | Setelah seluruh gerbang lulus dan ada persetujuan pemilik: terapkan migrasi aditif, deploy keempat fungsi dengan JWT verification aktif, baru promosikan frontend. Jangan mengaktifkan frontend sebelum endpoint tersedia. | Terbuka |
| F-03 | Sedang | Lima fungsi SECURITY DEFINER lama masih dapat dieksekusi oleh authenticated: `activate_premium_7d`, `create_registration_request`, `get_my_public_survey_submissions`, `is_admin`, dan `reject_registration`. Tiga fungsi operasi memiliki guard internal; `get_my_public_survey_submissions` membatasi hasil ke pemilik; `is_admin` dipakai oleh empat kebijakan RLS. | Lakukan review dependency dan grants per fungsi. Jangan mencabut semua grant secara massal. `is_admin()` harus tetap tersedia bagi authenticated selama kebijakan RLS masih memanggilnya. `main` saat ini masih memiliki pemanggilan langsung ke RPC registrasi/aktivasi/penolakan; pencabutan grant operasi lama hanya boleh dilakukan setelah frontend baru aktif dan pemanggilan lama dipastikan tidak digunakan. Rencanakan pencabutan sebagai migrasi tahap kedua. | Terbuka |
| F-04 | Sedang / residual | Leaked Password Protection nonaktif pada paket Free. | Catat sebagai risiko residual; pertahankan verifikasi email, kebijakan kata sandi minimum, dan edukasi penggunaan kata sandi unik. Fitur ini tidak dapat diaktifkan melalui pekerjaan kode kandidat. | Residual |
| F-05 | Rendah / performa | Advisor menemukan 12 FK tanpa indeks covering, 4 index belum terpakai, dan satu pasang kebijakan SELECT permisif pada `profiles`. | Review query plan dan frekuensi akses sebelum menambah/menghapus indeks. Tinjau apakah dua policy SELECT dapat dikonsolidasikan tanpa mengubah akses Admin/pemilik. Jangan melakukan perubahan indeks/policy tanpa pengukuran dan uji regresi. | Terbuka |
| F-06 | Sedang / keterbatasan pengujian | Workspace audit ini memiliki Node.js 22, tetapi tidak tersedia Deno, Supabase CLI, Docker, atau psql; karena itu Supabase local stack tidak dapat dijalankan langsung dari workspace ini. | Gunakan workflow CI disposable yang sudah lulus sebagai bukti parsial. Untuk pengujian runtime lokal berikutnya, sediakan Docker + Supabase CLI dan jalankan `supabase start`, `supabase functions serve`, serta uji Auth/RLS. | Terbuka |

### Catatan penting tentang fungsi legacy

Hasil baca definisi SQL Production menunjukkan:
- `activate_premium_7d` dan `reject_registration` memeriksa `auth.uid()` dan role `admin`.
- `create_registration_request` memerlukan sesi login dan email formulir yang sama dengan email Auth, tetapi definisi lama tidak memeriksa `email_confirmed_at` dan tidak memiliki deduplikasi/idempotensi seperti fungsi kandidat.
- `get_my_public_survey_submissions` memfilter hasil berdasarkan `investigations.owner_id = auth.uid()`.
- `is_admin()` memeriksa role di `profiles` dan dipakai oleh policy `audit_log`, `profiles`, `registration_requests`, serta `subscriptions`.

Karena `main` masih memanggil tiga RPC operasi lama, pencabutan grant sebelum frontend kandidat dipromosikan akan memutus alur aplikasi yang sedang aktif. Karena itu, jangan menerapkan pencabutan legacy pada migrasi pertama.

## Keterbatasan pengujian lokal pada sesi ini

Pemeriksaan tool pada workspace audit menemukan Node.js v22.16.0, tetapi `deno`, `supabase`, `psql`, dan `docker` tidak tersedia. Maka:
- Pengujian JavaScript, Deno type-check, dan PostgreSQL dilakukan oleh GitHub Actions runner.
- Belum ada `supabase start` atau `supabase functions serve` lokal.
- Tidak ada koneksi tulis ke Supabase Production maupun STAGING.

Dokumentasi Supabase saat ini menyatakan pengujian Edge Functions lokal menggunakan Supabase CLI; menjalankan stack lokal memerlukan Docker atau runtime kompatibel. Perhatikan perubahan CLI v3: perintah database sekarang default ke stack lokal, sedangkan operasi hosted memerlukan target remote eksplisit dan konfirmasi.

## Urutan perbaikan sebelum review rilis final

1. Siapkan tool lokal gratis: Docker Desktop/engine, Supabase CLI, Deno, dan psql; verifikasi versi dengan `--help` dan `--version`.
2. Jalankan stack lokal dari skema sintetis; jangan link ke Production. Uji keempat Edge Functions melalui runtime lokal.
3. Tambahkan uji Auth/JWT dan RLS: tanpa JWT, akun petugas, Admin, pemilik berbeda, dan percobaan memalsukan actor ID.
4. Uji frontend di browser dengan backend lokal: registrasi, aktivasi, penolakan, penghapusan, CORS/preflight, serta perilaku gagal jaringan.
5. Validasi migrasi terhadap schema-only snapshot yang cocok dengan Production, tanpa menyalin data pribadi/operasional.
6. Minta peer review independen atas SQL SECURITY DEFINER, dependency legacy, dan urutan rollout.
7. Susun backup/restore rehearsal dan rencana rollback.
8. Setelah semua lulus, ajukan kandidat untuk review final. Deployment tetap memerlukan persetujuan eksplisit terpisah.

## Status pengamanan

- Supabase Production: tidak diubah.
- Supabase STAGING: tidak diubah.
- `main` / GitHub Pages Production: tidak diubah.
- Branch kandidat: tetap terpisah.
- Migrasi kandidat: belum diterapkan pada Supabase mana pun.
- Edge Functions kandidat: belum dideploy.
- Tidak ada PR, merge, atau deployment.
