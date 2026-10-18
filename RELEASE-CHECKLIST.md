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

- [ ] **Validasi relasi respons-kasus:** metadata foreign key menunjukkan `survey_responses.survey_id → public_surveys.id`, tanpa foreign key langsung ke `cases`. Namun migration `20261010_submit_public_survey_idempotency.sql` sengaja menetapkan `v_case_id := v_response_id::text` lalu memasukkan kasus dengan ID tersebut. Jadi JOIN `cases.id = survey_responses.id::text` adalah kontrak ID yang disengaja untuk respons baru yang dikirim melalui fungsi itu. Pastikan fungsi tersebut sudah diterapkan di Supabase aktif dan hitung respons tanpa pasangan kasus sebelum menyetujui penggunaan operasional.
- [ ] **Uji batas akses RPC:** fungsi `get_my_public_survey_submissions()` memakai `SECURITY DEFINER` dan memfilter `investigations.owner_id = auth.uid()`. Uji dengan akun pemilik, akun bukan pemilik, akun tanpa investigasi, dan sesi anonim; pastikan hanya data yang diotorisasi dapat dibaca.
- [ ] **Uji privasi antrean offline:** `public_survey.html` menyimpan respons yang gagal dikirim di `localStorage`. Uji kegagalan jaringan, pengiriman ulang, duplikasi, logout/pergantian pengguna, dan penggunaan perangkat bersama. Jangan menganggap penyimpanan lokal sebagai penyimpanan terenkripsi.
- [ ] **Validasi data dashboard:** bandingkan jumlah respons, ID respons/kasus, dan kolom nama/umur/jenis kelamin/onset antara hasil RPC dan data sintetis yang dibuat khusus untuk uji. Pastikan respons tanpa pasangan kasus tidak salah ditampilkan sebagai kasus lengkap.

Kueri read-only untuk menghitung pasangan respons-kasus (tidak menampilkan payload/identitas dan tidak mengubah data):

```sql
SELECT ps.id AS survey_id, ps.investigation_id,
       COUNT(sr.id) AS response_count,
       COUNT(c.id) AS matched_case_count,
       COUNT(*) FILTER (WHERE sr.id IS NOT NULL AND c.id IS NULL) AS unmatched_response_count
FROM public.public_surveys ps
LEFT JOIN public.survey_responses sr ON sr.survey_id = ps.id
LEFT JOIN public.cases c ON c.id = sr.id::text
GROUP BY ps.id, ps.investigation_id
ORDER BY ps.investigation_id, ps.id;
```

`unmatched_response_count = 0` pada survei yang diuji menunjukkan setiap respons memiliki pasangan ID kasus menurut konvensi tersebut. Ini tidak membuktikan keamanan RLS/RPC; uji lintas-akun tetap wajib.
- [ ] **Jangan buka penggunaan data nyata** sampai seluruh pemeriksaan di atas serta audit RLS lintas-peran lulus dan bukti hasilnya dicatat.

- [ ] **Uji risiko sinkronisasi konflik:** fungsi `syncNow()` di `app.js` mengirim ulang semua rekaman lokal melalui `upsert(..., { onConflict: 'id' })` dan membentuk payload dari nilai lokal. Dengan akun uji terisolasi, uji apakah data server yang lebih baru dapat tertimpa nilai lokal lama, apakah ID bentrok lintas akun ditolak oleh RLS, dan apakah kegagalan parsial menjaga antrean retry dengan benar. Jangan jalankan uji konflik dengan data pasien nyata. Sebelum perilaku konflik disetujui, jangan anggap sinkronisasi aman hanya karena respons upsert berhasil.
