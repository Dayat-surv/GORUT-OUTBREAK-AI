# Catatan Audit dan Gerbang Rilis GORUT-OUTBREAK AI
Tanggal pemeriksaan: 15 November 2026

## 1. Identitas snapshot yang diperiksa

- Repository: `Dayat-surv/GORUT-OUTBREAK-AI`
- Lingkungan yang diuji: STAGING
- Branch STAGING: `staging/backend-auth-e2e-20261028`
- Commit HEAD STAGING yang diperiksa: `16444940c93ee458fe9bbe9e8730705eb136fb39`
- Branch Production: `main`
- Commit HEAD `main` saat perbandingan: `0bce6e12a84cae6e7179266e7eed9ecc2634986b`
- Merge base: `9e8fd19a24da3975706e758d45864de47637125d`

Snapshot ini adalah catatan audit STAGING, bukan persetujuan deployment Production.

## 2. Temuan perbandingan branch

Perbandingan GitHub menunjukkan kedua branch telah divergen:
- STAGING 107 commit di depan `main`.
- `main` 11 commit di depan STAGING.
- Workflow GitHub Pages pada `.github/workflows/pages.yml` melakukan deployment dari branch `main`.

**Keputusan teknis:** jangan melakukan merge penuh STAGING ke `main`, jangan mengganti target workflow Pages, dan jangan melakukan force-push. Perubahan harus dipromosikan secara selektif melalui branch promosi/pull request yang dibuat dari HEAD `main` terkini.

## 3. Konfigurasi STAGING yang diperiksa

File `backend-config.js` pada branch STAGING menunjuk ke proyek Supabase STAGING `xeqdhwqylutntphlkmqe` dengan:
- `enabled: true`
- `publicSurveyEnabled: false`

Publishable key tidak dicatat dalam dokumen ini. Kedua flag dan konfigurasi Production harus diperiksa kembali sebelum promosi. Jangan menyalin URL/key STAGING ke Production.

## 4. Bukti pengujian yang tersedia

### Fungsional
- Pembuatan investigasi dan persistensi server diuji oleh pengguna; data tetap tampil setelah logout/login.
- Pengeditan investigasi diuji; nama berubah setelah login ulang dan jumlah rekaman tetap satu.
- Jalur pembuatan investigasi v185 menggunakan ID server stabil dan upsert untuk mencegah baris duplikat.
- Satu baris duplikat lama di STAGING telah dihapus setelah persetujuan eksplisit; baris pasangannya tetap ada.

### Kontrol akses
- Pengguna petugas memanggil `activate-registration` dan memperoleh HTTP 403 `ADMIN_ONLY`.
- Pengguna petugas memanggil `reject-registration` dan memperoleh HTTP 403 `ADMIN_ONLY`.
- Pengguna petugas mencoba menghapus investigasi milik akun lain dan memperoleh HTTP 403 `NOT_AUTHORIZED`.
- Pemeriksaan ulang setelah uji penghapusan memastikan investigasi milik akun lain tetap ada.
- Audit database sebelumnya menemukan RLS aktif pada seluruh 14 tabel publik yang diperiksa. FORCE RLS tidak aktif; jangan menyatakan FORCE RLS aktif.
- Empat RPC administratif/penghapusan yang diperiksa hanya dapat dieksekusi oleh `service_role`; akses `anon` dan `authenticated` ditolak.
- Edge Functions `delete-investigation`, `activate-registration`, `reject-registration`, dan `create-registration-request` dilaporkan ACTIVE dengan verifikasi JWT aktif.

## 5. Temuan residual dan keterbatasan bukti

1. Supabase Security Advisor melaporkan `auth_leaked_password_protection`: Leaked Password Protection belum aktif. Paket Supabase Free yang digunakan tidak menyediakan pengaktifan fitur ini. Ini adalah risiko residual yang harus diterima secara tertulis atau ditangani melalui peningkatan paket sebelum penggunaan yang lebih luas.
2. GitHub Actions pada HEAD STAGING `0b423c9b592abbbc1c5b18e49ae91ac38060abcc` telah selesai dengan **conclusion: success**. Run: https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/43703879046 . Job `staging-checks` dan seluruh langkah berikut lulus: JavaScript syntax, research snapshot regression, isolated GIS test mode, release smoke, sync orphan-guard, Supabase RPC static security, dan Supabase validation SQL safety.
3. Audit runtime Edge Function penghapusan pada proyek STAGING `xeqdhwqylutntphlkmqe` menemukan `delete-investigation` ACTIVE versi 4, `verify_jwt=true`. Source runtime berhasil diambil dan ditinjau: handler memakai `serveSecureAdminOperation`, mengambil actor ID dari klaim JWT tervalidasi, memvalidasi ID investigasi, lalu memanggil RPC `edge_delete_investigation_bundle`.
4. Definisi RPC runtime telah diperiksa secara read-only. Fungsi bersifat `SECURITY DEFINER`, `search_path` dikosongkan, pemanggilan langsung dibatasi ke `service_role` (hak EXECUTE untuk `anon`, `authenticated`, dan `PUBLIC` tidak ada), dan fungsi membandingkan `investigations.owner_id` dengan `p_actor_id` sebelum penghapusan. Edge Function meneruskan actor ID yang berasal dari JWT; uji lintas-akun sebelumnya juga menghasilkan 403 `NOT_AUTHORIZED`.
5. Cakupan penghapusan yang ditinjau mencakup kasus, kontak, spesimen, kunjungan lapangan, survei publik, dan respons survei. Relasi FK yang diperiksa menunjukkan kasus dan survei memakai `NO ACTION`, sehingga RPC menghapus child rows terkait secara eksplisit sebelum parent. Kontak/spesimen juga memiliki relasi kasus dengan `SET NULL`, tetapi seluruh data investigasi dihapus melalui RPC yang sama.
6. Pada `syncNow()`, validasi hasil `auth.getUser()` ditambahkan dan exception tak terduga kini ditangkap; pesan status menjelaskan bahwa antrean lokal dipertahankan. Regression test untuk auth guard, penanganan exception, dan empat jalur orphan ditambahkan.
7. Audit lanjutan relasi induk-anak menemukan bahwa fallback `uuidFrom(localId)` pada FK kasus kontak/spesimen dapat membentuk ID yang tidak merujuk pada baris server. Kode STAGING kini mensyaratkan `serverId` investigasi induk sebelum mengirim kasus/kontak/spesimen/kunjungan; untuk kontak dan spesimen yang memiliki `caseId`, server ID kasus yang sebenarnya juga wajib tersedia. Pencocokan ID lokal dinormalisasi melalui `String(...)`; FK kasus tidak lagi direkayasa dari ID lokal. Jika induk belum tersinkron, item dihitung gagal dan antrean tidak dibersihkan.
8. Regression test diperluas untuk memastikan seluruh empat jalur child memerlukan server ID induk yang sah dan tidak membentuk FK kasus palsu. Run terbaru `https://github.com/Dayat-surv/GORUT-OUTBREAK-AI/actions/runs/43704273307` pada HEAD `16444940c93ee458fe9bbe9e8730705eb136fb39` berstatus **success**; seluruh tujuh langkah workflow lulus. Satu run sebelumnya gagal karena assertion test lama masih mengharapkan pola guard lama; test diperbarui pada commit berikutnya dan run terbaru lulus.
9. Pengujian otomatis ini memverifikasi guard dan bentuk kode secara statis; belum menggantikan uji runtime sinkronisasi parsial dengan akun browser STAGING dan data uji terkontrol.
10. Pengujian yang tercatat bukan pengganti audit penetrasi independen, peninjauan seluruh kode baris demi baris, atau uji beban.
11. Tidak ada migrasi, konfigurasi, maupun data Production yang diubah dalam audit ini.

## 6. Gerbang wajib sebelum promosi ke Production

- [ ] Bekukan perubahan STAGING dan pertahankan snapshot commit HEAD di atas.
- [x] Jalankan/konfirmasi seluruh job `staging-validation.yml` pada HEAD STAGING; simpan tautan run dan hasil tiap job.
- [ ] Buat branch promosi baru dari HEAD `main` terkini; jangan menjadikan branch STAGING sebagai target merge langsung.
- [ ] Buat daftar perubahan yang benar-benar diperlukan dan port satu per satu ke branch promosi.
- [ ] Tinjau ulang `app.js`, `index.html`, `sw.js`, `backend-config.js`, stylesheet, dan seluruh file/migrasi Supabase yang ikut dipromosikan.
- [ ] Pastikan konfigurasi Production tetap menunjuk ke proyek Production yang benar; tidak ada publishable key STAGING, service-role key, secret, atau kredensial di bundle.
- [ ] Pertahankan `publicSurveyEnabled: false` dan jangan membuka survei publik tanpa keputusan serta pengujian keamanan tersendiri.
- [ ] Lakukan backup/snapshot database Production dan verifikasi prosedur pemulihannya sebelum perubahan backend apa pun.
- [ ] Tinjau setiap migrasi SQL terhadap skema Production aktual; jangan menjalankan migrasi STAGING secara otomatis di Production.
- [ ] Jalankan review melalui pull request ke `main`; minta persetujuan eksplisit pemilik aplikasi sebelum merge/deploy.
- [ ] Setelah persetujuan, lakukan smoke test Production dengan pendekatan read-only terlebih dahulu dan periksa log/error. Jangan mengubah atau menghapus data operasional untuk uji rilis.

## 7. Prosedur rollback

### Jika masalah terjadi pada aplikasi/frontend
1. Hentikan promosi lanjutan dan catat waktu, commit, serta gejala.
2. Revert commit/merge promosi pada `main` menggunakan commit revert baru; jangan force-push atau menghapus riwayat.
3. Biarkan workflow Pages menerbitkan ulang versi yang telah dipulihkan.
4. Verifikasi URL Production, versi aplikasi, login, pemuatan daftar, dan akses data secara read-only.
5. Pertahankan bukti log dan jangan mengulang deployment sebelum akar masalah diketahui.

### Jika perubahan database/backend terlibat
1. Hentikan perubahan dan jangan menjalankan skrip rollback spekulatif.
2. Periksa dampak migrasi dan konsistensi data.
3. Gunakan backup/snapshot yang telah diverifikasi hanya berdasarkan persetujuan eksplisit dan prosedur pemulihan yang disetujui.
4. Utamakan migrasi perbaikan maju (forward fix) bila aman; setiap tindakan pemulihan harus dicatat dan diverifikasi.

## 8. Keputusan gerbang saat ini

**STATUS: STAGING AUTOMATED CI PASSED ON HEAD 1644494; SYNC PARENT-ID GUARDS ADDED; DELETE EDGE FUNCTION/RPC REVIEWED; RUNTIME BROWSER SYNC RETEST PENDING; RESIDUAL SECURITY FINDING OPEN (LEAKED PASSWORD PROTECTION); PRODUCTION RELEASE NOT APPROVED.**

Dokumen ini hanya ditambahkan ke branch STAGING. Tidak ada perubahan pada branch `main`, GitHub Pages Production, proyek Supabase Production, atau data operasional Production.
