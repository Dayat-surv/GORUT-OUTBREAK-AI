# Kandidat Edge Functions Production

Paket ini adalah kandidat khusus Production. Kode frontend dan Edge Functions telah melalui pemeriksaan sintaks/tipe, dan migrasi telah diuji pada PostgreSQL 17 disposable dengan skema serta data sintetis. **Belum dideploy ke Supabase Production dan belum diuji pada runtime Edge Functions Supabase.**

## Isi
- `supabase/functions/_shared/production-operation.ts`: autentikasi JWT, validasi input, pemeriksaan role Admin bila dibutuhkan, pemanggilan RPC via server-side Supabase client, dan respons error yang tidak membocorkan detail DB.
- `activate-registration`: aktivasi akses 7 hari, Admin-only.
- `reject-registration`: penolakan permohonan, Admin-only.
- `delete-investigation`: hapus bundle hanya bila pemilik investigasi sama dengan actor JWT.
- `create-registration-request`: pembuatan permohonan oleh pengguna login dengan email terverifikasi.
- `supabase/migrations/20261115090000_production_edge_operations_candidate.sql`: empat RPC dengan `SECURITY DEFINER`, `search_path = ''`, dan EXECUTE hanya untuk `service_role`.

## Adaptasi yang sudah dilakukan untuk schema Production
- Audit log menggunakan kolom `details`, bukan `metadata`.
- Tabel `registration_requests` Production tidak memiliki `rejection_reason`; alasan penolakan hanya disimpan di `audit_log.details`.
- Aktivasi memperbarui status ke `verified`, mengisi `reviewed_by/reviewed_at`, dan menambah subscription dengan `activated_at`.
- Email harus sama dengan email akun Auth dan sudah terverifikasi.
- Fungsi hapus mengunci parent dan child rows, memverifikasi kepemilikan serta konsistensi relasi lintas investigasi, menghapus kontak/spesimen yang terhubung langsung maupun melalui kasus, termasuk respons survei, dan menulis audit log.
- Registrasi memakai advisory transaction lock dan deduplikasi dibatasi pada akun pemohon yang sama.

## Urutan aktivasi (belum dilakukan)
1. Backup dan verifikasi pemulihan database Production.
2. Peer review SQL migration dan source code.
3. Uji sintaks migrasi dan operasi database pada PostgreSQL 17 disposable dengan skema sintetis (sudah lulus); sebelum aktivasi, tetap lakukan validasi pada lingkungan Supabase terisolasi yang benar-benar menyerupai Production.
4. Jalankan test negatif (anon, petugas non-admin, pemilik berbeda, ID tidak valid) dan test positif (Admin, owner).
5. Terapkan migration dengan persetujuan eksplisit pemilik.
6. Deploy tiap Edge Function dengan JWT verification aktif.
7. Jalankan smoke test menggunakan akun uji khusus; jangan memakai record operasional.
8. Pantau log dan lakukan rollback bila ada anomali.

## Peringatan
- Jangan jalankan migration ini di STAGING karena ia ditulis khusus untuk schema Production.
- Jangan deploy function ini sebelum migration berhasil diterapkan.
- Jangan mematikan JWT verification.
- Jangan memasukkan service-role key ke browser, repository, atau file konfigurasi frontend.
- Deployment Edge Function membuat endpoint aktif segera. Karena itu deployment memerlukan persetujuan eksplisit terpisah dan tidak dilakukan oleh pekerjaan persiapan ini.


## Pemeriksaan lanjutan (15 November 2026)
- Struktur kolom Production diverifikasi kembali untuk semua tabel yang disentuh. Kolom yang dipakai kandidat tersedia, termasuk `registration_requests.note/reviewed_by/reviewed_at`, `subscriptions.activated_at`, dan `audit_log.details`.
- Fungsi kandidat hapus investigasi diperketat: sebelum menghapus, ia menolak seluruh operasi bila ada kasus/kontak/spesimen/kunjungan atau survei terkait yang owner/creator-nya berbeda dari pemilik investigasi. Ini fail-closed karena skema saat ini tidak memiliki FK komposit yang menjamin konsistensi pemilik.
- Helper Edge Function mengembalikan konflik generik bila integritas kepemilikan rekaman terkait tidak konsisten.
- Snapshot Production setelah audit tetap menunjukkan 9 investigasi, 5 kasus, 0 kontak, 0 spesimen, 0 kunjungan, 0 permohonan registrasi, dan 0 survei publik aktif. Daftar Edge Functions Production tetap kosong. Pemeriksaan ini hanya SELECT/list; tidak ada perubahan.
- `app.js` kandidat kini memanggil keempat Edge Functions melalui `supabase.functions.invoke`; penghapusan lokal hanya dilakukan setelah server mengonfirmasi sukses.
- `node --check app.js`, pemeriksaan keamanan statis, dan `deno check` untuk keempat Edge Functions lulus pada GitHub Actions run #10 (15 November 2026).
- Migrasi berhasil diterapkan pada PostgreSQL 17 disposable; uji sintetis positif/negatif untuk registrasi, aktivasi Admin, penolakan Admin, penghapusan bundle, owner mismatch, dan relasi kasus lintas investigasi lulus. Seluruh data uji di-rollback.
- Uji tersebut bukan clone Supabase Production: RLS, Auth/JWT platform, Edge Runtime, dan konfigurasi deployment Supabase belum diuji. Tidak ada perubahan Production.

## Matriks uji wajib sebelum aktivasi
| Fungsi | Uji positif | Uji negatif |
|---|---|---|
| create-registration-request | akun login + email terverifikasi yang cocok | tanpa JWT, email tidak cocok, email belum diverifikasi, input terlalu panjang |
| activate-registration | Admin + permohonan pending | petugas, anon, ID tidak ada, permohonan bukan pending |
| reject-registration | Admin + permohonan pending | petugas, anon, ID tidak ada, permohonan bukan pending |
| delete-investigation | pemilik investigasi + semua child owner cocok | anon, bukan pemilik, ID tidak ada, child owner mismatch |

Semua uji hapus harus memakai data sintetis di lingkungan terisolasi dan memastikan tidak ada rekaman akun lain yang terhapus.



## Hasil audit dan pengujian lanjutan (15 November 2026)

### Perbaikan kandidat pada branch release
- Frontend app.js telah diselaraskan secara selektif dengan empat endpoint: create-registration-request, activate-registration, reject-registration, dan delete-investigation. Kedua wrapper registrasi yang aktif telah diarahkan ke Edge Function; tidak ada pemanggilan langsung legacy create_registration_request / activate_premium_7d / reject_registration dari frontend. Tidak menyalin seluruh app.js STAGING.
- Alur pendaftaran sekarang menangani kondisi sign-up yang belum menghasilkan session: pengguna diminta mengonfirmasi email, masuk, lalu mengirim permohonan; endpoint menolak email yang belum terverifikasi.
- Penghapusan server memerlukan session valid, serverId yang terpetakan dan diverifikasi, konfirmasi pengguna, serta respons sukses server sebelum data lokal dihapus.
- Dependency @supabase/server dipatok pada versi 1.9.2.
- RPC pembuatan registrasi memakai advisory lock untuk menghindari duplikasi serentak dan hanya mengembalikan permohonan pending milik actor yang sama.
- Penghapusan bundle mengunci baris terkait, memeriksa owner dan konsistensi investigation ID, serta mencakup kontak/spesimen yang terhubung melalui cases.index_case_id / specimens.case_id.

### Bukti pengujian otomatis
GitHub Actions: https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/43697019083 — SUCCESS, kedua job lulus:
1. validate: node --check app.js, pemeriksaan kontrak keamanan statis, dan deno check untuk keempat Edge Functions.
2. postgres-integration: membangun skema sintetis Production-shaped di PostgreSQL 17 disposable, menerapkan migrasi kandidat, memverifikasi grants service_role-only, lalu menjalankan uji positif/negatif. Semua data uji di-rollback.

Cakupan uji database:
- registrasi email terverifikasi dan idempotensi;
- penolakan email yang belum terverifikasi;
- aktivasi dan penolakan oleh Admin;
- penolakan operasi Admin oleh petugas non-admin;
- penghapusan bundle dengan child records langsung dan tidak langsung;
- penolakan penghapusan oleh pemilik lain;
- fail-closed saat owner child berbeda;
- fail-closed saat kontak menghubungkan dua investigasi berbeda.

Batas uji: fixture PostgreSQL merupakan skema sintetis, bukan clone lengkap Supabase Production. Uji ini tidak memverifikasi RLS aktual, validasi JWT oleh platform Supabase, Edge Runtime, CORS melalui browser, atau pemetaan secrets. Semua itu tetap menjadi gerbang sebelum rilis.

### Temuan Production yang masih terbuka (read-only)
Security Advisor pada 15 November 2026:
- 5 fungsi SECURITY DEFINER lama masih dapat dipanggil role authenticated: activate_premium_7d, create_registration_request, get_my_public_survey_submissions, is_admin, dan reject_registration. Fungsi-fungsi tersebut memiliki guard internal yang terlihat, tetapi grants dan kebutuhan kompatibilitasnya tetap perlu review independen.
- Leaked Password Protection masih nonaktif karena keterbatasan paket Free.

Performance Advisor:
- 12 foreign key tanpa covering index (INFO);
- 4 index yang belum terpakai (INFO);
- 1 peringatan multiple permissive SELECT policies pada profiles (WARN).

Health Advisor: tidak ada lint.

Temuan Advisor di atas adalah kondisi Production yang sudah ada dan tidak dibuat oleh migrasi kandidat. Tidak ada grants atau konfigurasi Production yang diubah untuk menghilangkan peringatan tersebut.

### Status gerbang
- Lulus: sintaks JavaScript; type-check Deno; pemeriksaan statis; pembuatan fungsi/migrasi dan uji database sintetis pada PostgreSQL 17.
- Belum lulus: runtime Edge Functions pada Supabase, RLS/Auth/JWT end-to-end, uji browser Production-like, backup/restore rehearsal, review independen atas legacy SECURITY DEFINER grants, serta persetujuan rilis.
- Production: tidak berubah; migration belum diterapkan; Edge Functions Production masih belum dideploy.
- main dan GitHub Pages Production: tidak berubah.
- Tidak ada PR, merge, atau deployment yang dilakukan.
