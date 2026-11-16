# STAGING v189 — Case Edit Persistence Fix

Tanggal: 17 November 2026
Branch: `fix/staging-case-edit-persistence-v189-20261117`
Base: `staging/audit-questionnaire-integrity-20261116`

## Temuan pemicu
Audit kode menemukan bahwa alur edit kasus hanya memperbarui penyimpanan lokal melalui `save()`; berbeda dengan alur tambah kasus yang memasukkan entitas ke antrean sinkronisasi. Akibatnya, nama yang diedit dapat terlihat pada sesi aktif tetapi hilang setelah data dimuat ulang dari Supabase.

## Perbaikan
- Menambahkan wrapper akhir untuk `window.upd` agar hasil edit kasus dikirim langsung melalui authenticated Supabase client ke tabel `cases`.
- Mempertahankan ID server yang sudah melekat pada kasus agar operasi menjadi upsert pada rekaman yang sama, bukan membuat duplikat.
- Menyertakan field inti dan payload `questionnaire_response` (jawaban, foodCase, priority).
- Hanya menandai hasil sukses setelah Supabase mengonfirmasi upsert.
- Jika autentikasi, relasi investigasi, atau upsert gagal, snapshot lokal sebelum edit dipulihkan dan pengguna menerima pesan kegagalan.
- Memperbarui cache aset ke v189.

## Batas keselamatan
- STAGING branch/preview saja; backend config tetap mengarah ke proyek STAGING `xeqdhwqylutntphlkmqe`.
- `publicSurveyEnabled: false` tetap dipertahankan.
- Tidak ada migration atau perubahan skema database.
- Tidak ada perubahan pada branch PRODUKSI, backend PRODUKSI, atau data operasional.
- Tidak ada penghapusan data.

## Uji browser wajib setelah preview tersedia
1. Buka kasus sintetis yang telah tersimpan di investigasi STAGING.
2. Edit nama saja, simpan, dan pastikan notifikasi/console menunjukkan upsert terkonfirmasi.
3. Logout lalu login kembali; pastikan nama baru tetap tampil.
4. Periksa detail kasus dan pastikan jawaban kuesioner umum/spesifik tetap utuh.
5. Pastikan jumlah kasus tidak bertambah dan ID kasus/server tetap sama.
6. Uji kondisi gagal (misalnya sesi habis) hanya jika dapat dilakukan tanpa mengubah data operasional; pastikan aplikasi tidak menampilkan sukses palsu.

## Status
- Temuan kode: DIKONFIRMASI.
- Patch v189: DIBUAT DI CABANG STAGING TERPISAH.
- Syntax/CI dan browser E2E: MENUNGGU.
- T02: GAGAL PADA BUILD SEBELUM PATCH; WAJIB DIULANG PADA PREVIEW v189.
- Produksi: TIDAK DIUBAH; RILIS TIDAK DISETUJUI.
