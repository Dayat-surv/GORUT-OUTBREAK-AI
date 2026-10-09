# GORUT-OUTBREAK AI — Checklist Konfigurasi Supabase

Dokumen ini adalah panduan konfigurasi, bukan bukti bahwa backend sudah aktif atau aman. Saat ini `backend-config.js` masih memakai placeholder dan `enabled: false`.

## Status saat audit 9 Oktober 2026

- Website statis dipublikasikan melalui GitHub Pages.
- Mode lokal menyimpan data pada browser/perangkat masing-masing.
- Kode aplikasi memiliki jalur login Supabase Auth dan membaca peran dari `profiles`.
- Sinkronisasi yang tersedia mengirim data lokal dengan `upsert`; jangan menganggapnya sebagai sinkronisasi dua arah atau database bersama yang sudah tervalidasi.
- Skema database aktual, kebijakan RLS, serta pengujian lintas-peran belum dikonfirmasi. Jangan gunakan identitas pasien nyata sebelum pemeriksaan tersebut selesai.

## 1. Nilai konfigurasi

Setelah membuat proyek Supabase, isi `backend-config.js` menggunakan Project URL dan public anon/publishable key:

```js
window.GORUT_BACKEND = {
  provider: 'supabase',
  url: 'https://PROJECT-REF.supabase.co',
  anonKey: 'PUBLIC_ANON_OR_PUBLISHABLE_KEY',
  enabled: true
};
```

- Jangan pernah menaruh `service_role` key atau secret key di JavaScript, GitHub, atau browser.
- Public anon/publishable key memang digunakan pada browser, tetapi hanya aman jika RLS dan kebijakan akses sudah benar.
- Jangan mengaktifkan `enabled: true` sebelum tabel, profil, RLS, dan akun uji siap.
- Karena repository bersifat publik, jangan menyimpan kata sandi, token rahasia, atau data pasien di repository.

## 2. Tabel yang dirujuk oleh aplikasi

Kode aplikasi merujuk antara lain ke tabel berikut. Daftar ini berasal dari pemeriksaan kode; ini bukan konfirmasi bahwa tabel-tabel tersebut sudah tersedia atau memiliki skema yang cocok di proyek Supabase.

- Operasional: `diseases`, `investigations`, `cases`, `contacts`, `specimens`, `field_visits`, `alerts`.
- Akun dan akses: `profiles`, `my_access_status`, `subscriptions`, `registration_requests`, `audit_log`.
- Kuesioner publik: `questionnaires`, `public_surveys`.

Sebelum membuat atau mengubah tabel, bandingkan nama kolom, tipe data, foreign key, constraint, dan fungsi RPC yang benar-benar ada di proyek Supabase. Jangan menjalankan SQL generik di produksi tanpa mencocokkan skema aktual.

## 3. Persyaratan keamanan minimum

- Aktifkan RLS pada semua tabel yang menyimpan data atau metadata operasional.
- Pengguna anonim tidak boleh membaca/menulis kasus, kontak, spesimen, investigasi, atau kunjungan lapangan.
- Peran dan cakupan fasilitas harus ditentukan oleh profil server yang dikelola administrator; jangan percaya peran yang disimpan di localStorage atau dikirim dari browser.
- Batasi akses sesuai peran dan fasilitas. Peran provinsi/kabupaten tidak otomatis berarti boleh mengakses semua baris tanpa kebijakan eksplisit.
- Lindungi fungsi RPC administratif; jangan mengizinkan pengguna biasa mengubah peran, persetujuan, atau hak akses sendiri.
- Catat perubahan penting dan uji pencegahan akses lintas fasilitas.
- Pertimbangkan minimisasi data, masa retensi, pencatatan akses, backup, serta tata kelola data kesehatan sebelum operasional.

## 4. Uji penerimaan sebelum data nyata

1. Buat akun uji untuk admin, Dinkes provinsi, Dinkes kabupaten, dan Puskesmas/RS.
2. Pastikan setiap akun memiliki baris `profiles` yang valid dan peran yang ditetapkan server.
3. Uji login benar/salah, logout, sesi kedaluwarsa, dan akun tanpa profil.
4. Uji SELECT/INSERT/UPDATE/DELETE untuk setiap tabel dengan setiap peran.
5. Pastikan akun Puskesmas A tidak dapat membaca atau mengubah data Puskesmas B dengan memanipulasi request.
6. Uji sinkronisasi data uji, duplikasi, relasi kasus-kontak-spesimen, serta kegagalan jaringan.
7. Pastikan dashboard dan laporan membaca sumber data yang benar dan hasilnya cocok dengan data uji.
8. Catat hasil PASS/FAIL dan perbaiki semua kegagalan keamanan sebelum peluncuran.

## 5. Batasan yang masih harus diselesaikan di aplikasi

- Validasi sinkronisasi dua arah: pengambilan data server, konflik perubahan, dan penghapusan belum dinyatakan lulus.
- Pemetaan skema aktual untuk semua tabel harus diverifikasi.
- Pembatasan UI berdasarkan peran hanyalah bantuan antarmuka; otorisasi yang sesungguhnya harus ditegakkan oleh RLS/server.
- Pengujian end-to-end pada browser dan perangkat HP masih diperlukan setelah backend dikonfigurasi.

**Status saat ini: konfigurasi backend dan pengujian keamanan belum selesai. Gunakan hanya data sintetis untuk pengujian.**
