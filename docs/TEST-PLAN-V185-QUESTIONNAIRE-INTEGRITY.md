# v185 — Perbaikan awal integritas jawaban kuesioner
Tanggal: 16 November 2026
Branch: `staging/audit-questionnaire-integrity-20261116`
Commit implementasi: `78faf6eec3065fdd6760aac9100d3dcfec7e267a`

## Perubahan kode
1. Wrapper akhir `editCase` memilih instrumen berdasarkan penyakit pada rekaman kasus (atau investigasi induknya) sebelum form edit dibangun.
2. Wrapper akhir `upd` mengambil snapshot `case.answers` sebelum penyimpanan.
3. Setelah seluruh handler edit lama selesai, jawaban digabung secara non-destruktif: jawaban lama yang tidak dirender tetap dipertahankan.
4. Jika instrumen aktif tidak cocok dengan penyakit kasus, perubahan dari payload kuesioner yang tidak cocok tidak diterapkan; snapshot jawaban sebelumnya dipulihkan.
5. Metadata integritas mencatat `questionnaireDiseaseId`, `answerStorage: case.answers`, `preserveUnrenderedKeys: true`, dan versi `v185`.

## Batasan
- Tidak menghapus pertanyaan atau jawaban.
- Tidak mengubah skema database Supabase.
- Tidak mengubah konfigurasi backend maupun Production.
- Perubahan ini belum membuktikan round-trip backend berhasil; pengujian browser STAGING tetap wajib.
- Pengeditan field inti (nama, umur, status, outcome, wilayah) tetap mengikuti handler aplikasi yang sudah ada.

## Skenario uji wajib di STAGING
Gunakan satu investigasi dan satu kasus sintetis yang jelas diberi awalan `UJI`. Jangan memakai data pasien nyata.

| ID | Skenario | Kriteria lulus |
|---|---|---|
| T01 | Buat kasus dengan minimal 3 jawaban umum dan 3 jawaban spesifik penyakit | Semua key/value muncul di detail kasus |
| T02 | Edit hanya nama kasus, tanpa mengubah jawaban kuesioner | Seluruh key/value jawaban identik sebelum dan sesudah |
| T03 | Edit satu jawaban kuesioner | Hanya nilai yang diedit berubah; key lain tetap |
| T04 | Pindah ke investigasi/penyakit lain, lalu buka edit kasus uji sebelumnya | Form memuat instrumen sesuai penyakit kasus |
| T05 | Simpan kasus setelah T04 tanpa mengubah jawaban | Tidak ada jawaban lama yang hilang/tertimpa |
| T06 | Sinkronkan ke Supabase STAGING, logout/login, buka kembali detail | `questionnaire_response` pulih identik dengan `case.answers` |
| T07 | Jalankan penemuan variabel penelitian | Semua key jawaban tetap ditemukan; pemeriksaan label dictionary diuji terpisah |
| T08 | Bandingkan jumlah key dan JSON sebelum/sesudah | Tidak ada key hilang; perubahan nilai hanya sesuai edit yang disengaja |

## Status
- Kode perbaikan v185: COMMITTED TO STAGING BRANCH.
- Uji browser: BELUM DILAKUKAN.
- Uji sinkronisasi Supabase: BELUM DILAKUKAN.
- Kelayakan rilis: BELUM DISETUJUI.
- Production: TIDAK DIUBAH.


## Tambahan implementasi v186 — kamus dan snapshot penelitian
Commit implementasi: `a21bdfe78b0b47b23911a2c3ecd013d16832bf43`

- Penemuan variabel menampilkan label, kategori, tipe, dan penyakit/instrumen dari metadata pertanyaan sambil mempertahankan nama teknis `answers.Q_...`.
- Pembuatan dictionary otomatis memperkaya label kolom Q_* yang dikenali tanpa mengganti nama teknis variabel.
- Snapshot penelitian kini mempertahankan kolom Q_* yang tidak memiliki alias field inti. Sebelumnya, cabang pemrosesan Q_* hanya mengisi alias tertentu lalu menghentikan pemrosesan; pertanyaan lain berisiko tidak ikut masuk ke dataset penelitian.
- Kolom alias inti tetap mengisi field standar yang kosong; jawaban Q_* yang tidak memiliki alias disimpan sebagai kolom Q_* tersendiri.

## Pemeriksaan kode setelah v185/v186
- Pemeriksaan sintaks terisolasi untuk wrapper v185: LULUS.
- Simulasi merge: kunci jawaban yang tidak dirender tetap ada; perubahan instrumen yang tidak cocok memulihkan jawaban awal: LULUS.
- Pemeriksaan sintaks terisolasi untuk resolver metadata v186: LULUS.
- Pemeriksaan browser pada aplikasi lengkap: BELUM DILAKUKAN.
- Uji Supabase STAGING round-trip: BELUM DILAKUKAN.
- Validasi hasil dataset penelitian dengan contoh kasus: BELUM DILAKUKAN.

Catatan: pemeriksaan sintaks dan simulasi terisolasi bukan pengganti pengujian end-to-end di browser. Jangan menganggap rilis telah lulus sebelum T01–T08 dijalankan.


## Hasil pengujian terisolasi tambahan — 16 November 2026
Pengujian dilakukan pada sumber kode yang diambil langsung dari branch ini, tanpa menjalankan aplikasi terhadap data operasional.

| Uji teknis | Hasil |
|---|---|
| Parse/syntax seluruh `app.js` dengan JavaScript Function parser | PASS |
| v185: pemilihan penyakit kasus sebelum edit | PASS |
| v185: nilai yang sengaja diedit tetap diterapkan | PASS |
| v185: jawaban lama yang tidak dirender tetap ada | PASS |
| v185: jawaban spesifik penyakit tetap ada | PASS |
| v185: snapshot dipulihkan jika instrumen tidak cocok | PASS |
| v186: label pertanyaan dikenali dari metadata | PASS |
| v186: variabel Q_* tanpa metadata tetap terdaftar | PASS |
| v186: alias inti dipetakan ke kolom standar | PASS |
| v186: Q_* tanpa alias tetap menjadi kolom dataset | PASS |

Contoh uji snapshot sintetis memuat `Q_ID_KASUS`, `Q_BATUK`, `Q_DEMAM`, dan `Q_LEGACY`: ID Kasus dipetakan ke kolom inti, sedangkan ketiga variabel pertanyaan lainnya tetap tersedia sebagai kolom dataset.

**Batas interpretasi:** PASS di atas merupakan parse/syntax dan unit harness terisolasi, bukan uji browser end-to-end. Tidak membuktikan bahwa UI aktual, handler lengkap, autentikasi, RLS, atau Supabase STAGING bekerja benar. T01–T08 tetap wajib dilakukan pada browser STAGING.
