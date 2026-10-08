# GORUT-OUTBREAK AI — Website Gratis

Versi publik ini adalah aplikasi web statis. Secara default data disimpan lokal di browser (`localStorage`) sehingga tidak membutuhkan server atau hosting berbayar.

## Fitur utama
- Dashboard surveilans dan investigasi epidemiologi
- Investigasi KLB/PE
- Kasus, kontak, spesimen
- Formulir lapangan desktop dan HP
- Analisis epidemiologi
- Demografi & IR
- GIS kasus
- Disease Intelligence
- Laporan PE/KLB
- Audit Workflow
- Mode lokal/offline

## Hosting gratis yang direkomendasikan
### GitHub Pages
GitHub Pages dapat digunakan dengan GitHub Free untuk repository publik.
1. Buat repository publik, misalnya `gorut-outbreak-ai`.
2. Upload seluruh isi folder website ini ke root repository.
3. GitHub → Settings → Pages.
4. Source: **Deploy from a branch**.
5. Branch: `main`, folder: `/ (root)`.
6. Save.
7. Website akan tersedia pada alamat `https://USERNAME.github.io/gorut-outbreak-ai/`.

### Cloudflare Pages
Folder ini juga dapat dipublikasikan sebagai static HTML di Cloudflare Pages.

## Penting tentang data
Mode gratis/local tidak membuat satu database bersama. Data yang dimasukkan pengguna tersimpan pada browser/perangkat pengguna masing-masing.

Jika aplikasi akan dipakai bersama oleh Dinkes, Puskesmas dan RS dengan database terpusat, aktifkan backend Supabase secara terpisah dan lakukan konfigurasi keamanan/RLS sebelum digunakan untuk data nyata.

Jangan memasukkan data identitas pasien nyata ke repository publik.

## KLB
Aplikasi hanya membantu screening, analisis dan pengambilan keputusan. Penetapan KLB/wabah tetap dilakukan oleh pejabat/otoritas kesehatan sesuai ketentuan yang berlaku.