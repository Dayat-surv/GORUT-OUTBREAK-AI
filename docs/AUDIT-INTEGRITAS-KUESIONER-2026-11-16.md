# Audit Integritas Kuesioner Epidemiologi Terintegrasi
Tanggal: 16 November 2026
Repository: Dayat-surv/GORUT-OUTBREAK-AI
Basis audit: branch staging/fix-food-investigation-persistence-v184-20261111
Branch audit: staging/audit-questionnaire-integrity-20261116

## Ruang lingkup dan batas
Audit statis terhadap alur pembentukan instrumen, input kasus, edit kasus, pemetaan ke field inti, penemuan variabel penelitian, sinkronisasi Supabase, dan pemulihan data. Tidak ada perubahan pada Production, skema Supabase, atau data operasional. Tidak ada pertanyaan yang dihapus.

## Temuan

### QI-01 — Risiko hilangnya jawaban yang tidak tampil pada kuesioner aktif (prioritas kritis)
Pada wrapper `window.upd` di integrasi v45, aplikasi mengumpulkan jawaban hanya dari elemen pertanyaan yang sedang dirender melalui `collectQ45()`, kemudian menetapkan `c.answers = a`. Penetapan ini mengganti seluruh objek jawaban lama, bukan menggabungkan jawaban yang sedang diedit. Kunci jawaban lama yang tidak hadir di form saat itu dapat hilang ketika kasus diedit.

Dampak: data historis, jawaban dari versi instrumen sebelumnya, atau jawaban dari modul penyakit lain yang tidak sedang dirender berisiko terhapus dari `case.answers`.

Rekomendasi: sebelum menulis, pertahankan objek lama dan lakukan merge terkontrol; jangan menghapus kunci yang tidak dirender. Catat versi instrumen dan penyakit sumber pada setiap kasus. Uji edit tanpa perubahan dan edit satu field untuk memastikan semua kunci lain tetap identik.

### QI-02 — Form edit bergantung pada kuesioner global yang sedang dipilih (prioritas tinggi)
`questionnaireCasePanel(c)` membaca `db.questions` global, sedangkan pemilihan instrumen dilakukan melalui `db.selectedDisease` dan `loadDiseaseQuestions()`. Dengan demikian, form edit kasus mengikuti kuesioner yang terakhir dimuat, bukan secara eksplisit memilih instrumen berdasarkan `c.disease`/metadata instrumen pada kasus.

Dampak: ketika pengguna berpindah penyakit/investigasi sebelum membuka kasus lama, form dapat menampilkan pertanyaan yang tidak sesuai. Dikombinasikan dengan QI-01, penyimpanan dapat mengganti jawaban lama dengan himpunan field yang keliru.

Rekomendasi: bangun daftar pertanyaan untuk kasus berdasarkan disease ID dan versi instrumen yang melekat pada kasus. Jika versi lama tidak tersedia, tampilkan jawaban lama sebagai data terlindungi dan jangan menimpa field yang tidak dikenali.

### QI-03 — Dictionary penelitian menemukan key teknis, bukan label variabel (prioritas sedang)
`discoverResearchVariables()` menghasilkan nama `answers.<key>` dan label sama dengan key mentah. Key pertanyaan dibentuk dari ID seperti `Q_...`; metadata label pertanyaan tersedia pada definisi kuesioner tetapi tidak digunakan oleh discovery untuk menampilkan label yang mudah dibaca.

Dampak: peneliti dapat melihat nama teknis seperti `answers.Q_...` sehingga pemilihan exposure, outcome, dan confounder lebih sulit dan rawan salah pilih. Ini bukan bukti bahwa jawaban tidak tersimpan, tetapi mengurangi keterlacakan variabel.

Rekomendasi: buat resolver dictionary yang menghubungkan question ID ke label, kategori, tipe, opsi, penyakit, dan versi instrumen. Pertahankan nama key yang stabil untuk kompatibilitas dataset.

### QI-04 — Pemetaan dan sinkronisasi dasar tersedia, tetapi perlu uji round-trip (prioritas tinggi)
Alur statis menunjukkan jawaban kasus disimpan sebagai `case.answers`, dikirim dalam kolom JSONB `cases.questionnaire_response`, dan dibaca kembali ke `answers` saat pemuatan data server. Field tambahan `foodCase` dan `priority` juga ditempatkan di payload tersebut. Ini mendukung integrasi, tetapi belum membuktikan tidak ada kehilangan data saat create/edit/sync/reload.

Rekomendasi: lakukan uji round-trip dengan data sintetis: buat kasus dengan jawaban umum dan spesifik, sinkronkan, muat ulang, bandingkan JSON sebelum/sesudah; lalu edit satu jawaban dan ulangi. Bandingkan jumlah key, nilai, tipe data, serta field tambahan.

### QI-05 — Audit kuesioner yang ada hanya memeriksa struktur dangkal (prioritas sedang)
`auditQuestionnaire()` memeriksa jumlah pertanyaan spesifik, duplikasi label dalam satu penyakit, dan label kosong. Pemeriksaan tersebut tidak memvalidasi ID unik, benturan ID lintas label, tipe/opsi, pertanyaan wajib, logika skip, kesesuaian domain, atau pemetaan ke kamus variabel.

Rekomendasi: perluas audit menjadi validasi skema instrumen dan matriks pemetaan analisis. Jangan menandai instrumen layak pakai hanya berdasarkan PASS pada pemeriksaan dangkal.

## Hal yang sudah terlihat pada kode
- Kuesioner umum dan spesifik penyakit dibangun dari `baseQ` dan `diseases[id].q`.
- Jawaban form dikumpulkan dengan question ID dan disimpan pada `case.answers`.
- Beberapa field inti (ID, nama, umur, jenis kelamin, onset, status, outcome, wilayah, koordinat) diproyeksikan dari jawaban kuesioner.
- Sinkronisasi mengirim `case.answers` ke `questionnaire_response`; pemuatan server membentuk kembali `answers` dari payload tersebut.
- Penemuan variabel penelitian membaca key pada `case.answers`, tetapi belum menyajikan label instrumen sebagai metadata dictionary.

## Urutan perbaikan yang disarankan
1. Perbaiki QI-01 terlebih dahulu: merge non-destruktif dan perlindungan kunci yang tidak tampil.
2. Perbaiki QI-02: pilih instrumen per kasus berdasarkan disease ID dan versi.
3. Tambahkan metadata instrumen pada setiap kasus tanpa mengubah jawaban historis.
4. Perbaiki dictionary agar menampilkan label, domain, tipe, opsi, penyakit, dan versi sambil mempertahankan key teknis stabil.
5. Perluas validator instrumen dan buat laporan field yang belum memiliki pemetaan analisis.
6. Jalankan tes create/edit/sync/reload/analisis dengan data sintetis dan bandingkan checksum/JSON.
7. Hanya setelah seluruh tes lulus, siapkan kandidat rilis terpisah untuk peninjauan. Tidak ada promosi otomatis ke Production.

## Status
STATIC AUDIT: TEMUAN TERIDENTIFIKASI.
QUESTION DELETION: NONE.
PRODUCTION CHANGE: NONE.
PRODUCTION RELEASE: NOT APPROVED.
