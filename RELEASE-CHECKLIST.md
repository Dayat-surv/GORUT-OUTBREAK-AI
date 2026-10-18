# Checklist Finalisasi dan Rilis — GORUT-OUTBREAK AI

> **Status rilis:** dapat dipublikasikan sebagai tampilan/demo premium dengan data sintetis; belum disetujui untuk data kesehatan nyata. Formulir publik dinonaktifkan sampai relasi RPC, RLS, dan alur retry diverifikasi pada proyek Supabase aktif. Jangan mengaktifkannya hanya dengan mengubah flag.

## Otomatis
- [ ] JavaScript lolos pemeriksaan sintaks.
- [ ] Uji regresi snapshot penelitian lulus.
- [ ] Manifest PWA merupakan JSON valid.
- [ ] Semua aset lokal yang dirujuk tersedia.
- [ ] Workflow GitHub Pages selesai dengan status sukses.

## Manual sebelum penggunaan operasional
- [ ] Buka website di desktop dan HP; uji navigasi setiap modul.
- [ ] Uji login, logout, reset kata sandi, sesi kedaluwarsa, dan akun tanpa profil.
- [ ] Pastikan skema Supabase sesuai kode aplikasi.
- [ ] Audit RLS untuk seluruh tabel, peran, dan cakupan fasilitas menggunakan akun uji.
- [ ] Uji sinkronisasi, duplikasi, konflik, offline/retry, dan relasi kasus-kontak-spesimen.
- [ ] Pastikan dashboard, rantai penularan, laporan, dan penelitian konsisten.
- [ ] Pastikan tidak ada data pasien nyata di repository, fixture, log, atau screenshot.
- [ ] Pastikan `publicSurveyEnabled` tetap `false` sampai pengujian Supabase langsung dan persetujuan penanggung jawab selesai.
- [ ] Simpan bukti PASS/FAIL dan persetujuan penanggung jawab sebelum data nyata digunakan.

## Perlindungan data
Jangan mengubah atau menghapus data operasional untuk menjalankan tes. Gunakan fixture sintetis terisolasi. Snapshot penelitian harus memakai rekaman valid yang dipilih eksplisit; dataset kosong tetap kosong dan tidak boleh mengambil fallback dari data operasional.

## Catatan audit statis — 18 Oktober 2026

Status di bawah ini berasal dari pembacaan kode repositori; belum menggantikan uji terhadap proyek Supabase aktual.

- [ ] **Validasi relasi respons-kasus:** migration `supabase/migrations/20261010_public_survey_dashboard_rpc.sql` menghubungkan `cases` ke `survey_responses` melalui `c.id = sr.id::text`. Konfirmasi apakah ID respons memang sengaja digunakan sebagai ID kasus. Jika tidak, perbaiki JOIN berdasarkan foreign key/kolom relasi yang benar setelah skema aktual diperiksa. Jangan mengubah skema atau data produksi berdasarkan asumsi.
- [ ] **Uji batas akses RPC:** fungsi `get_my_public_survey_submissions()` memakai `SECURITY DEFINER` dan memfilter `investigations.owner_id = auth.uid()`. Uji dengan akun pemilik, akun bukan pemilik, akun tanpa investigasi, dan sesi anonim; pastikan hanya data yang diotorisasi dapat dibaca.
- [ ] **Uji privasi antrean offline:** `public_survey.html` menyimpan respons yang gagal dikirim di `localStorage`. Uji kegagalan jaringan, pengiriman ulang, duplikasi, logout/pergantian pengguna, dan penggunaan perangkat bersama. Jangan menganggap penyimpanan lokal sebagai penyimpanan terenkripsi.
- [ ] **Validasi data dashboard:** bandingkan jumlah respons, ID respons/kasus, dan kolom nama/umur/jenis kelamin/onset antara hasil RPC dan data sintetis yang dibuat khusus untuk uji. Pastikan respons tanpa pasangan kasus tidak salah ditampilkan sebagai kasus lengkap.
- [ ] **Jangan buka penggunaan data nyata** sampai seluruh pemeriksaan di atas serta audit RLS lintas-peran lulus dan bukti hasilnya dicatat.

- [ ] **Uji risiko sinkronisasi konflik:** fungsi `syncNow()` di `app.js` mengirim ulang semua rekaman lokal melalui `upsert(..., { onConflict: 'id' })` dan membentuk payload dari nilai lokal. Dengan akun uji terisolasi, uji apakah data server yang lebih baru dapat tertimpa nilai lokal lama, apakah ID bentrok lintas akun ditolak oleh RLS, dan apakah kegagalan parsial menjaga antrean retry dengan benar. Jangan jalankan uji konflik dengan data pasien nyata. Sebelum perilaku konflik disetujui, jangan anggap sinkronisasi aman hanya karena respons upsert berhasil.
