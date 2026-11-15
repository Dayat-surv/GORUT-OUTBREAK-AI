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


## Pemeriksaan lanjutan (15 November 2026)
- Struktur kolom Production diverifikasi kembali untuk semua tabel yang disentuh. Kolom yang dipakai kandidat tersedia, termasuk `registration_requests.note/reviewed_by/reviewed_at`, `subscriptions.activated_at`, dan `audit_log.details`.
- Fungsi kandidat hapus investigasi diperketat: sebelum menghapus, ia menolak seluruh operasi bila ada kasus/kontak/spesimen/kunjungan atau survei terkait yang owner/creator-nya berbeda dari pemilik investigasi. Ini fail-closed karena skema saat ini tidak memiliki FK komposit yang menjamin konsistensi pemilik.
- Helper Edge Function mengembalikan konflik generik bila integritas kepemilikan rekaman terkait tidak konsisten.
- Snapshot Production setelah audit tetap menunjukkan 9 investigasi, 5 kasus, 0 kontak, 0 spesimen, 0 kunjungan, 0 permohonan registrasi, dan 0 survei publik aktif. Daftar Edge Functions Production tetap kosong. Pemeriksaan ini hanya SELECT/list; tidak ada perubahan.
- Kode kandidat masih belum dikompilasi atau dijalankan. Pemeriksaan skema tidak menggantikan uji migrasi pada salinan database dan uji runtime.

## Matriks uji wajib sebelum aktivasi
| Fungsi | Uji positif | Uji negatif |
|---|---|---|
| create-registration-request | akun login + email terverifikasi yang cocok | tanpa JWT, email tidak cocok, email belum diverifikasi, input terlalu panjang |
| activate-registration | Admin + permohonan pending | petugas, anon, ID tidak ada, permohonan bukan pending |
| reject-registration | Admin + permohonan pending | petugas, anon, ID tidak ada, permohonan bukan pending |
| delete-investigation | pemilik investigasi + semua child owner cocok | anon, bukan pemilik, ID tidak ada, child owner mismatch |

Semua uji hapus harus memakai data sintetis di lingkungan terisolasi dan memastikan tidak ada rekaman akun lain yang terhapus.
