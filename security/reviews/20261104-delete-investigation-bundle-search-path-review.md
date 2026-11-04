# Review proposal — harden delete_investigation_bundle search_path

**Status: PROPOSAL ONLY — DO NOT EXECUTE OR APPLY.**

Scope: STAGING review branch only. This document proposes a minimal hardening of the existing
`public.delete_investigation_bundle(text)` function. It does not change the database, application
runtime, backend configuration, or operational records.

## Finding

The current function is `SECURITY DEFINER` and sets:

```sql
SET search_path = pg_catalog, public, auth
```

The inspected function body already schema-qualifies application objects:
- `auth.uid()`
- `public.investigations`, `public.cases`, `public.contacts`,
  `public.specimens`, `public.field_visits`, `public.public_surveys`,
  `public.survey_responses`, and `public.audit_log`
- `information_schema.columns`

Built-in PostgreSQL functions/operators remain available from the implicit
`pg_catalog` lookup. Therefore an empty search path is compatible with the
currently inspected function body and reduces the chance of resolving an
unqualified object from a writable schema.

## Proposed minimal SQL change

Only after independent review and explicit approval, apply this single statement
to the **STAGING** project:

```sql
ALTER FUNCTION public.delete_investigation_bundle(text)
  SET search_path = '';
```

This changes the function configuration only. It does not replace the function
body or alter its ownership/authorization logic. Preserve the existing ACL:
- revoke execution from `PUBLIC`
- revoke execution from `anon`
- grant execution to `authenticated`

Do not broaden these grants.

## Read-only preflight and post-change verification

Before applying, confirm the function signature, owner, body, and existing grants
still match the reviewed version. After an approved STAGING-only change, verify:

```sql
select
  p.prosecdef as security_definer,
  p.proconfig as function_settings,
  p.proacl as function_acl,
  pg_get_userbyid(p.proowner) as function_owner,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'delete_investigation_bundle'
  and pg_get_function_identity_arguments(p.oid) = 'p_investigation_id text';

select
  has_function_privilege('anon',
    'public.delete_investigation_bundle(text)', 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated',
    'public.delete_investigation_bundle(text)', 'EXECUTE') as authenticated_can_execute;
```

Expected: `search_path=""`, `SECURITY DEFINER` remains true, owner remains
`postgres`, anon cannot execute, and authenticated can execute.

The Supabase Security Advisor may continue to report this function because it
remains a callable `SECURITY DEFINER` RPC. This proposal does not suppress or
misrepresent that warning; the owner check and privileged deletion behavior
still require explicit security acceptance.

## Rollback proposal

If the empty search path causes an unexpected issue, the inspected previous
setting can be restored with:

```sql
ALTER FUNCTION public.delete_investigation_bundle(text)
  SET search_path = pg_catalog, public, auth;
```

## Required tests after separate approval

1. Re-run the static review and verify the function body has not changed.
2. Test unauthenticated execution is denied.
3. Test a different authenticated user is denied for an investigation they do not own.
4. Test owner deletion only against a newly approved synthetic STAGING investigation.
5. Verify the audit row and dependent-row counts; confirm the public-survey feature flag remains false.
6. Re-run the Security Advisor and document the remaining `SECURITY DEFINER` warning.

## Explicit safety boundaries

- This is a review note, **not a Supabase migration**; it is deliberately outside
  `supabase/migrations/`.
- No SQL has been applied by adding this file.
- Do not merge this review branch into production or deploy it.
- Do not change production configuration or data.
- Keep `publicSurveyEnabled: false`; do not enable surveys or global sync.
- Preserve the existing synthetic investigation; do not delete it for testing.

---

# PEMBARUAN HASIL REVIEW KEAMANAN STAGING
**Tanggal:** 4 November 2026  
**Proyek:** GORUT-OUTBREAK-AI  
**Lingkungan:** Supabase STAGING  
**Status:** REVIEW ONLY — DO NOT MERGE

## 1. Status penerapan search_path

Pernyataan SQL yang sebelumnya dicantumkan sebagai proposal telah diterapkan secara terpisah pada database Supabase STAGING setelah memperoleh persetujuan.

```sql
ALTER FUNCTION public.delete_investigation_bundle(text)
SET search_path = '';
```

Hasil pemeriksaan pascapenerapan:

- Fungsi `public.delete_investigation_bundle(text)` tetap menggunakan `SECURITY DEFINER`.
- Pemilik fungsi tetap `postgres`.
- Konfigurasi fungsi telah berubah menjadi `search_path=""`.
- Hak eksekusi `anon` tidak diberikan.
- Hak eksekusi `authenticated` tetap tersedia.
- Referensi terhadap `auth.uid()` dan tabel aplikasi menggunakan nama schema yang memenuhi syarat.
- Security Advisor tidak lagi menampilkan peringatan mutable search_path untuk fungsi penghapusan tersebut.

Perubahan ini hanya diterapkan pada STAGING. Tidak ada perubahan terhadap database produksi.

## 2. Review tiga fungsi SECURITY DEFINER

Security Advisor masih mendeteksi tiga fungsi SECURITY DEFINER yang dapat dieksekusi oleh pengguna terautentikasi.

| Fungsi | Kontrol otorisasi yang ditemukan | Hasil review |
|---|---|---|
| `activate_premium_7d(uuid)` | Pemeriksaan administrator melalui `private.is_current_user_admin()`, pemeriksaan status registrasi, dan pencatatan audit | Kontrol ditemukan dalam definisi fungsi; pengujian negatif runtime akun non-admin belum dilakukan |
| `reject_registration(uuid,text)` | Pemeriksaan administrator melalui `private.is_current_user_admin()`, pemeriksaan status registrasi, validasi alasan, dan pencatatan audit | Kontrol ditemukan dalam definisi fungsi; pengujian negatif runtime akun non-admin belum dilakukan |
| `delete_investigation_bundle(text)` | Pemeriksaan autentikasi, pencocokan `auth.uid()` dengan `owner_id`, penguncian baris investigasi, dan pencatatan audit | Pengujian pemilik dan penolakan akun kedua berhasil |

### Pemeriksaan fungsi pembantu administrator

Fungsi `private.is_current_user_admin()` diperiksa dan ditemukan memiliki karakteristik:

- Menggunakan `SECURITY DEFINER`.
- Menggunakan `search_path=""`.
- Menggunakan `auth.uid()` untuk mengidentifikasi akun yang sedang terautentikasi.
- Memeriksa peran administrator melalui `public.profiles.role`.
- Tidak menggunakan `user_metadata` yang dapat diubah pengguna sebagai dasar otorisasi administrator.

Tabel `profiles`, `registration_requests`, `subscriptions`, dan `audit_log` juga diperiksa memiliki Row Level Security (RLS) aktif.

**Catatan:** Pemeriksaan ini merupakan review kode dan konfigurasi yang diperiksa, bukan audit keamanan menyeluruh terhadap seluruh objek database.

## 3. Hasil pengujian otorisasi STAGING

Pengujian dilakukan menggunakan dua akun berbeda.

### 3.1 Pengujian akun pemilik

Hasil:
- Pemilik dapat membaca investigasi miliknya.
- Pemilik berhasil menyimpan investigasi ke Supabase.
- Pemilik berhasil membuka kembali investigasi dan melihat data yang sesuai.
- Pemilik berhasil menjalankan RPC penghapusan terhadap investigasi sintetis khusus pengujian.
- RPC mengembalikan status `deleted: true`.
- Audit log mencatat tindakan penghapusan dan jumlah data terkait.

### 3.2 Pengujian akun kedua

Hasil:
- Akun kedua tidak dapat melihat investigasi milik akun pertama.
- Query SELECT menghasilkan nol baris.
- Percobaan UPDATE menghasilkan nol baris yang berubah.
- Percobaan DELETE melalui RPC ditolak dengan kode `P0001` dan pesan `NOT_AUTHORIZED`.
- Investigasi milik akun pertama tetap tersedia.
- Tidak ditemukan audit penghapusan untuk investigasi milik akun pertama akibat percobaan akun kedua.

**Kesimpulan:** Pengujian isolasi kepemilikan investigasi dan penolakan penghapusan oleh akun yang tidak berwenang berhasil.

## 4. Hasil pengujian fungsi aplikasi

| Fitur | Hasil |
|---|---|
| Simpan investigasi ke Supabase | Berhasil |
| Baca ulang investigasi dari server | Berhasil |
| Buka investigasi | Berhasil |
| Tampilkan data formulir | Sesuai |
| Isolasi SELECT antar akun | Berhasil |
| Isolasi UPDATE antar akun | Berhasil |
| Penghapusan oleh pemilik | Berhasil |
| Penolakan DELETE oleh akun kedua | Berhasil |
| Pencatatan audit penghapusan | Terverifikasi |

Pengujian ini tidak membuktikan seluruh fungsi aplikasi bebas dari kesalahan. Pengujian regresi lanjutan tetap diperlukan sebelum rilis produksi.

## 5. Pemeriksaan konsistensi database STAGING

Pemeriksaan terakhir terhadap data STAGING menghasilkan:

| Objek | Jumlah |
|---|---:|
| Investigasi milik akun penguji | 3 |
| Kasus | 0 |
| Kontak | 0 |
| Spesimen | 0 |
| Kunjungan lapangan | 0 |
| Survei publik | 0 |
| Survei publik aktif | 0 |
| Respons survei | 0 |

Ketiga investigasi sintetis yang tersisa tetap dipertahankan sebagai data pengujian.

Tidak ada kasus, kontak, spesimen, kunjungan lapangan, survei publik, atau respons survei yang dibuat dalam rangka pengujian ini.

## 6. Status fitur survei publik

Konfigurasi preview STAGING telah diperiksa:

- Supabase host mengarah ke proyek STAGING.
- Backend aktif pada preview STAGING.
- `publicSurveyEnabled` bernilai `false`.
- Publishable key tersedia untuk koneksi aplikasi.
- Tidak ada aktivasi survei publik.
- Tidak ada perubahan konfigurasi produksi.

Survei publik dan sinkronisasi global harus tetap dinonaktifkan sampai proses review keamanan selesai.

## 7. Peringatan keamanan yang masih tersisa

Security Advisor masih menunjukkan dua kelompok peringatan:

### A. Authenticated SECURITY DEFINER functions

Tiga fungsi berikut masih terdeteksi:

1. `activate_premium_7d`
2. `delete_investigation_bundle`
3. `reject_registration`

Peringatan tetap muncul karena fungsi SECURITY DEFINER dapat dipanggil oleh pengguna terautentikasi dan berjalan menggunakan hak pemilik fungsi.

Walaupun kontrol otorisasi ditemukan dan pengujian negatif untuk fungsi penghapusan berhasil, risiko residual tetap harus dicatat.

Pengujian negatif runtime untuk fungsi aktivasi dan penolakan registrasi dengan akun non-admin masih diperlukan.

Pencabutan hak eksekusi `authenticated` tidak direkomendasikan tanpa analisis dampak terhadap aplikasi dan mekanisme otorisasi pengganti.

### B. Leaked Password Protection

Security Advisor masih menunjukkan bahwa perlindungan terhadap kata sandi yang diketahui bocor belum aktif pada konfigurasi Supabase yang diperiksa.

Peringatan ini belum diperbaiki dan harus menjadi bagian dari tindak lanjut keamanan Auth.

## 8. Kesimpulan review

Berdasarkan pengujian dan pemeriksaan yang telah dilakukan, fungsi penyimpanan, pembacaan, isolasi akses, pembukaan detail, serta penghapusan investigasi pada lingkungan STAGING menunjukkan hasil sesuai dengan skenario pengujian.

Pengamanan `search_path` pada fungsi `delete_investigation_bundle` telah diterapkan dan diverifikasi.

Pengujian akun kedua membuktikan bahwa pengguna yang bukan pemilik tidak dapat membaca, mengubah, maupun menghapus investigasi milik akun lain melalui jalur yang diuji.

Namun, masih terdapat peringatan SECURITY DEFINER dan leaked-password protection yang perlu ditindaklanjuti. Oleh sebab itu, hasil ini belum dapat dianggap sebagai sertifikasi keamanan menyeluruh atau persetujuan rilis produksi.

## 9. Keputusan dan batas keselamatan

1. Seluruh pengujian lanjutan dilakukan pada lingkungan STAGING.
2. Ketiga investigasi sintetis yang tersisa harus dipertahankan.
3. Tidak boleh ada penghapusan atau perubahan data operasional produksi.
4. Tidak boleh mengaktifkan survei publik.
5. `publicSurveyEnabled` harus tetap `false`.
6. Tidak boleh mengekspos service role key atau secret key.
7. Tidak boleh mengubah konfigurasi backend produksi dalam pekerjaan review ini.
8. PR #68 tetap berstatus DRAFT / REVIEW ONLY.
9. PR #65, #66, #67, dan #68 tidak boleh digabungkan tanpa review dan persetujuan eksplisit terpisah.
10. Rilis produksi hanya dapat dipertimbangkan setelah seluruh pemeriksaan keamanan, regresi aplikasi, dan validasi konfigurasi selesai.

**Status akhir: STAGING FUNCTIONAL TESTS PASSED — SECURITY REVIEW WITH RESIDUAL FINDINGS — PRODUCTION RELEASE NOT APPROVED.**
