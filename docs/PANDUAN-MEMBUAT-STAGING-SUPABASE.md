# Panduan menyiapkan staging GORUT-OUTBREAK-AI

Panduan ini untuk membuat lingkungan pengujian yang terpisah dari produksi. Gunakan hanya data sintetis.

## A. Buat proyek Supabase staging

1. Buka https://supabase.com/dashboard/ dan masuk ke akun Anda.
2. Pilih organisasi yang sesuai. Jika belum ada organisasi, ikuti petunjuk Supabase untuk membuatnya.
3. Klik **New project**.
4. Beri nama, misalnya `GORUT-OUTBREAK-AI-STAGING`.
5. Buat database password baru yang kuat dan simpan di pengelola kata sandi. Jangan kirim password ini ke chat.
6. Pilih region yang tersedia dan sesuai kebutuhan, lalu buat proyek. Tunggu sampai status proyek siap.
7. Pastikan nama proyek jelas mengandung **STAGING**. Jangan menggunakan proyek produksi `lheuszdhprwmtajhdukc` untuk langkah pengujian.

## B. Ambil hanya informasi publik proyek staging

Di dashboard proyek staging:
1. Buka **Project Settings → API** (tampilan dashboard dapat berubah).
2. Salin **Project URL**.
3. Salin **publishable key** atau **anon/public key** yang memang ditujukan untuk browser.
4. Jangan salin atau membagikan `service_role`, secret key, database password, access token, atau kredensial pribadi.

Kunci publik boleh digunakan di browser, tetapi hanya jika RLS dan fungsi database sudah benar. URL dan kunci harus berasal dari proyek STAGING.

## C. Jangan aktifkan formulir dulu

Cabang staging saat ini sengaja memakai placeholder dan kedua flag dinonaktifkan:
- `enabled: false`
- `publicSurveyEnabled: false`

Jangan menggantinya dengan URL/key produksi. Jangan mengaktifkan formulir sampai migrasi yang diperlukan ditinjau, skema staging diverifikasi, dan halaman staging dipisahkan dari situs utama.

## D. Terapkan skema dengan aman

1. Jangan menyalin database produksi secara penuh dan jangan mengimpor data pasien.
2. Gunakan hanya migrasi skema/fungsi yang sudah ditinjau untuk pengujian.
3. Jalankan migrasi pada proyek STAGING saja. Sebelum menjalankan SQL, periksa bahwa dashboard menampilkan proyek `GORUT-OUTBREAK-AI-STAGING`.
4. Gunakan data sintetis berlabel UJI/STAGING. Jangan gunakan nama, alamat, nomor telepon, atau detail kasus nyata.

## E. Siapkan hosting staging terpisah

Workflow GitHub Pages saat ini menerbitkan cabang `main`. Jangan mengubah workflow tersebut agar menerbitkan cabang staging ke alamat produksi. Halaman staging perlu hosting terpisah atau deployment preview yang terisolasi dan menggunakan konfigurasi staging saja.

## F. Kriteria sebelum uji end-to-end

- [ ] URL backend pada staging mengarah ke proyek staging.
- [ ] Halaman staging tidak menggunakan konfigurasi produksi.
- [ ] Kedua flag tetap false sampai semua pemeriksaan isolasi selesai.
- [ ] Token survei sintetis dibuat khusus untuk tes.
- [ ] Uji muat, token salah, submit, retry dengan ID submission yang sama, survei nonaktif/kedaluwarsa, dan hitung akhir respons/kasus.
- [ ] Survei dinonaktifkan kembali dan flag publik tetap false setelah tes.

**Batas penting:** jangan mengirimkan password database, secret/service-role key, access token, atau data pasien ke chat.
