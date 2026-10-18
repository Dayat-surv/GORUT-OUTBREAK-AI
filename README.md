# GORUT-OUTBREAK AI
### Platform Surveilans Epidemiologi — Kabupaten Gorontalo Utara

**Website:** https://dayat-surv.github.io/GORUT-OUTBREAK-AI/

Platform web untuk membantu pencatatan surveilans, penyelidikan epidemiologi, investigasi KLB, rantai penularan, kontak, spesimen, pemetaan, analisis, dan penyusunan laporan.

## Modul utama
- Dashboard surveilans dan investigasi
- Investigasi PE/KLB dan daftar kasus
- Kuesioner sumber data terpisah serta rantai penularan
- Kontak, spesimen, kunjungan lapangan, dan peringatan
- Analisis epidemiologi, demografi, GIS, dan penelitian
- Laporan PE/KLB serta formulir lapangan mobile
- Mode instalasi PWA dan dukungan tampilan responsif

## Batas penggunaan dan perlindungan data
- Gunakan **data sintetis** untuk pengujian dan demonstrasi.
- Jangan memasukkan identitas pasien ke issue, commit, atau file pada repository publik.
- Kunci publishable/anon frontend bukan kunci admin; jangan pernah menaruh service_role atau secret key di frontend.
- Keberadaan konfigurasi Supabase di frontend tidak membuktikan bahwa skema, RLS, izin peran, atau sinkronisasi sudah aman. Audit keamanan dan uji penerimaan harus lulus sebelum data kesehatan nyata digunakan.
- Mode browser lokal menyimpan data pada perangkat yang digunakan dan tidak otomatis menjadi basis data bersama.
- Aplikasi adalah alat bantu kerja; penetapan KLB/wabah dan keputusan kesehatan masyarakat tetap mengikuti kewenangan serta pedoman resmi.

## Deployment
Website statis dideploy melalui GitHub Pages oleh workflow .github/workflows/pages.yml. Perubahan pada branch main memicu deployment otomatis.

## Pemeriksaan otomatis
Workflow penelitian menguji perlindungan snapshot agar rekaman uji tidak valid dikecualikan, sumber penelitian tidak bercampur, dan dataset kosong tidak beralih diam-diam ke kasus operasional.
