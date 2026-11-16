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
