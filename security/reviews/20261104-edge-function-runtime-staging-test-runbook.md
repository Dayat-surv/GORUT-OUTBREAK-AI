# Runbook Pengujian Runtime Edge Functions — STAGING

**Tujuan:** memverifikasi ketiga endpoint Edge Function pada proyek Supabase STAGING tanpa menyentuh produksi dan tanpa mengubah data operasional.

**Status saat ini (4 November 2026):** ketiga Edge Functions telah dideploy ke STAGING dengan `verify_jwt=true`; migration pertama telah diterapkan. Migration kedua belum diterapkan. Aplikasi v180 belum diverifikasi pada preview STAGING dan uji runtime autentikasi masih menunggu deployment aplikasi.

## Pemeriksaan prasyarat dan status

- [x] PR #69 tetap Draft dan belum digabung.
- [x] Proyek STAGING terverifikasi dengan project ref `xeqdhwqylutntphlkmqe`.
- [ ] Periksa Settings → API Keys / Edge Functions → Secrets bahwa runtime memiliki konfigurasi otomatis `SUPABASE_URL`, publishable keys, dan secret keys yang dibutuhkan SDK. Jangan menyalin atau mengirim nilai secret ke chat, browser console, atau repository.
- [x] Edge Functions menggunakan `npm:@supabase/server@^1`; ketiganya aktif dan `verify_jwt=true`.
- [ ] Siapkan akun STAGING: satu akun admin, satu akun pemilik investigasi, dan satu akun petugas kedua. Jangan gunakan akun produksi untuk uji.
- [x] Snapshot pascamigrasi: 3 investigasi; 0 kasus, kontak, spesimen, kunjungan lapangan, survei publik, dan respons survei. Tiga investigasi sintetis harus tetap dipertahankan.
- [x] `publicSurveyEnabled:false`; jumlah survei publik aktif = 0.

## Urutan cutover STAGING

1. [x] Deploy Edge Functions: `delete-investigation`, `activate-registration`, `reject-registration`.
2. [x] Terapkan migration pertama `20261104140000_secure_admin_operations_edge_functions.sql`; RPC lama tetap aktif.
3. [ ] Deploy aplikasi STAGING v180 dari branch PR ini ke preview STAGING saja.
4. [ ] Uji seluruh skenario tanpa menghapus atau membuat data operasional.
5. [ ] Jika seluruh uji lulus, terapkan migration kedua `20261104141000_revoke_legacy_admin_rpc_client_access.sql` sesuai persetujuan STAGING.
6. [ ] Setelah migration kedua, ulangi tes penolakan direct RPC dan seluruh regresi.

## Pengujian tanpa perubahan data

### Autentikasi dan otorisasi

| Skenario | Hasil yang diharapkan |
|---|---|
| Tanpa login memanggil endpoint | 401; tidak ada perubahan database |
| JWT tidak valid/kedaluwarsa | 401; tidak ada perubahan database |
| Petugas non-admin memanggil activate-registration | 403; tidak ada subscription/registrasi baru |
| Petugas non-admin memanggil reject-registration | 403; status registrasi tidak berubah |
| Akun kedua mencoba hapus investigasi milik akun pemilik | 403 / NOT_AUTHORIZED; investigasi tetap ada |
| Akun pemilik mengirim ID investigasi sintetis yang tidak ada | 404 / NOT_FOUND; tidak ada perubahan database |

### Pengujian admin yang mengubah data

Jangan membuat atau mengubah record registrasi selama rangkaian uji ini. Gunakan UUID valid yang dipastikan tidak ada di tabel untuk memastikan admin melewati pemeriksaan peran dan menerima 404 tanpa perubahan data. Petugas non-admin harus menerima 403 sebelum database dipanggil.

| Skenario | Hasil yang diharapkan |
|---|---|
| Admin memanggil activate-registration dengan UUID valid yang tidak ada | 404; tidak ada registrasi/subscription baru |
| Admin memanggil reject-registration dengan UUID valid yang tidak ada | 404; tidak ada perubahan status/audit mutasi |

### Uji hak akses database setelah cutover

Jalankan hanya setelah migration kedua diterapkan:

- [ ] `authenticated` tidak dapat menjalankan tiga RPC lama secara langsung.
- [ ] `anon` tidak dapat menjalankan tiga RPC lama.
- [ ] `authenticated` tidak dapat menjalankan tiga RPC baru secara langsung.
- [ ] Edge Function tetap dapat menjalankan RPC baru melalui `supabaseAdmin`.
- [ ] Security Advisor tidak lagi melaporkan tiga RPC lama sebagai authenticated-executable. Temuan leaked-password protection pada paket Free mungkin tetap ada dan harus dicatat terpisah.

## Pemeriksaan pascauji

- [ ] Hitung ulang semua tabel terkait dan bandingkan dengan catatan awal.
- [ ] Audit log menunjukkan actor_id dan action yang benar untuk setiap aksi uji.
- [ ] Tidak ada investigasi/kasus operasional yang berubah.
- [ ] Tidak ada survei publik atau respons survei yang dibuat/diaktifkan.
- [ ] `publicSurveyEnabled:false` tetap.
- [ ] Tidak ada secret di browser bundle, log, commit, atau response API.
- [ ] Simpan hasil uji, waktu, akun uji (ID internal saja dalam dokumen privat), status HTTP, dan audit event.

## Rollback / batas keselamatan

- Jangan menjalankan migration kedua sampai endpoint dan aplikasi baru terverifikasi.
- Jika Edge Function gagal sebelum migration kedua, hentikan cutover dan kembalikan preview aplikasi ke versi sebelumnya; RPC lama masih tersedia.
- Jika migration kedua sudah diterapkan dan endpoint baru bermasalah, jangan langsung mengubah grant produksi. Pada STAGING, rollback harus berupa migration terpisah yang ditinjau dan disetujui, dengan memastikan fungsi server-only tetap tertutup bagi client.
- Tidak ada langkah di runbook ini yang mengizinkan perubahan produksi.
- Tidak ada pengaktifan survei publik, sinkronisasi, atau perubahan data produksi.
