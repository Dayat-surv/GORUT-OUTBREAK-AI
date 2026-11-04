# Runbook Pengujian Runtime Edge Functions — STAGING

**Tujuan:** memverifikasi ketiga endpoint Edge Function pada proyek Supabase STAGING tanpa menyentuh produksi dan tanpa mengubah data operasional.

**Status saat ini:** belum dijalankan. Dokumen ini adalah rencana uji; tidak ada deployment atau migrasi yang dilakukan saat menyusunnya.

## Prasyarat sebelum deployment

- [ ] PR #69 tetap Draft dan belum digabung.
- [ ] Pastikan proyek yang sedang dibuka adalah STAGING dengan project ref `xeqdhwqylutntphlkmqe`.
- [ ] Periksa Settings → API Keys / Edge Functions → Secrets bahwa runtime memiliki konfigurasi otomatis `SUPABASE_URL`, publishable keys, dan secret keys yang dibutuhkan SDK. Jangan menyalin atau mengirim nilai secret ke chat, browser console, atau repository.
- [ ] Pastikan paket Edge Functions menggunakan `npm:@supabase/server@^1` dan project runtime mendukung SDK tersebut.
- [ ] Siapkan akun STAGING: satu akun admin, satu akun pemilik investigasi, dan satu akun petugas kedua. Jangan gunakan akun produksi untuk uji.
- [ ] Catat jumlah awal investigasi, kasus, kontak, spesimen, kunjungan lapangan, survei, respons survei, dan audit log. Jangan masukkan data nyata baru.
- [ ] Pastikan `publicSurveyEnabled:false` dan tidak ada survei publik aktif.

## Urutan deployment STAGING yang disarankan

Jangan menjalankan tahap berikut tanpa persetujuan eksplisit untuk deployment STAGING.

1. Deploy Edge Functions: `delete-investigation`, `activate-registration`, `reject-registration`.
2. Jalankan migration pertama `20261104140000_secure_admin_operations_edge_functions.sql` untuk membuat RPC server-only. RPC lama tetap aktif pada tahap ini agar versi aplikasi sebelumnya tidak langsung terputus.
3. Deploy aplikasi STAGING v180 dari branch PR ini ke preview STAGING saja.
4. Uji seluruh skenario di bawah sementara RPC lama masih aktif.
5. Jika seluruh uji lulus, minta persetujuan terpisah sebelum menjalankan migration kedua `20261104141000_revoke_legacy_admin_rpc_client_access.sql`.
6. Setelah migration kedua, ulangi tes penolakan direct RPC dan seluruh regresi.

## Pengujian tanpa perubahan data

### Autentikasi dan otorisasi

| Skenario | Hasil yang diharapkan |
|---|---|
| Tanpa login memanggil endpoint | 401; tidak ada perubahan database |
| JWT tidak valid/kedaluwarsa | 401; tidak ada perubahan database |
| Petugas non-admin memanggil activate-registration | 403; tidak ada subscription/registrasi baru |
| Petugas non-admin memanggil reject-registration | 403; status registrasi tidak berubah |
| Akun kedua mencoba hapus investigasi milik akun pemilik | 403 / NOT_AUTHORIZED; investigasi tetap ada |
| Akun pemilik menghapus investigasi uji yang memang disetujui untuk dihapus | Sukses; hitungan data turunan dan audit cocok |

### Pengujian admin yang mengubah data

Pengujian ini memerlukan record registrasi sintetis berstatus pending dan persetujuan khusus untuk membuat/mengubah record uji di STAGING. Jangan jalankan sebelum data uji dan prosedur pembersihannya disepakati.

| Skenario | Hasil yang diharapkan |
|---|---|
| Admin mengaktifkan registrasi pending sintetis | Status approved, subscription premium_7d 7 hari, audit actor_id = admin |
| Admin menolak registrasi pending sintetis | Status rejected, alasan tercatat, audit actor_id = admin |
| Admin mengulang aksi pada registrasi yang bukan pending | Ditolak; tidak ada subscription ganda atau perubahan kedua |

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
