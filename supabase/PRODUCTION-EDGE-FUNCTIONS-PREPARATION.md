# Kandidat Edge Functions Production

Paket ini disiapkan untuk proyek Supabase Production, tetapi **belum dideploy dan belum dijalankan**.

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
- Fungsi hapus mengunci baris investigasi, memverifikasi `owner_id`, menghapus child records termasuk respons survei, dan menulis audit log.

## Urutan aktivasi (belum dilakukan)
1. Backup dan verifikasi pemulihan database Production.
2. Peer review SQL migration dan source code.
3. Uji migrasi pada salinan database Production yang terisolasi.
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
