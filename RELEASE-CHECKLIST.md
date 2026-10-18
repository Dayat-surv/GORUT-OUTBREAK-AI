# Checklist Finalisasi dan Rilis — GORUT-OUTBREAK AI

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
- [ ] Simpan bukti PASS/FAIL dan persetujuan penanggung jawab sebelum data nyata digunakan.

## Perlindungan data
Jangan mengubah atau menghapus data operasional untuk menjalankan tes. Gunakan fixture sintetis terisolasi. Snapshot penelitian harus memakai rekaman valid yang dipilih eksplisit; dataset kosong tetap kosong dan tidak boleh mengambil fallback dari data operasional.
