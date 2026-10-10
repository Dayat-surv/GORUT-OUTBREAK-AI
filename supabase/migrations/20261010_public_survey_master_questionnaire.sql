-- GORUT-OUTBREAK-AI: PE umum + modul penyakit untuk survei publik
-- Aman untuk data lama: hanya memperbarui kuesioner uji yang ditautkan ke survei berjudul UJI SISTEM.
-- Tinjau dan jalankan di Supabase SQL Editor. Tidak mengubah atau menghapus respons yang sudah ada.

BEGIN;

WITH qdata(module_id, module_label, section_name, label, field_type, options, required) AS (
  VALUES
  ('general','PE Umum','Identitas','ID Kasus','text','[]'::jsonb,false),
  ('general','PE Umum','Identitas','Nama lengkap','text','[]'::jsonb,true),
  ('general','PE Umum','Identitas','NIK/ID lokal','text','[]'::jsonb,false),
  ('general','PE Umum','Identitas','Tanggal lahir','date','[]'::jsonb,false),
  ('general','PE Umum','Identitas','Umur','number','[]'::jsonb,true),
  ('general','PE Umum','Identitas','Satuan umur','choice','["Tahun","Bulan","Hari"]'::jsonb,true),
  ('general','PE Umum','Identitas','Jenis kelamin','choice','["Laki-laki","Perempuan","Tidak diketahui"]'::jsonb,true),
  ('general','PE Umum','Sosiodemografi','Alamat lengkap','textarea','[]'::jsonb,true),
  ('general','PE Umum','Sosiodemografi','Desa/Kelurahan','text','[]'::jsonb,true),
  ('general','PE Umum','Sosiodemografi','Kecamatan','text','[]'::jsonb,true),
  ('general','PE Umum','Sosiodemografi','Kabupaten','text','[]'::jsonb,false),
  ('general','PE Umum','Sosiodemografi','Provinsi','text','[]'::jsonb,false),
  ('general','PE Umum','Sosiodemografi','Puskesmas','text','[]'::jsonb,false),
  ('general','PE Umum','Sosiodemografi','No. HP','tel','[]'::jsonb,false),
  ('general','PE Umum','Sosiodemografi','Pekerjaan','text','[]'::jsonb,false),
  ('general','PE Umum','Sosiodemografi','Sekolah/Tempat kerja','text','[]'::jsonb,false),
  ('general','PE Umum','Klinis','Tanggal onset gejala','date','[]'::jsonb,true),
  ('general','PE Umum','Klinis','Tanggal pertama berobat','date','[]'::jsonb,false),
  ('general','PE Umum','Klinis','Tanggal dirawat','date','[]'::jsonb,false),
  ('general','PE Umum','Klinis','Gejala utama','textarea','[]'::jsonb,true),
  ('general','PE Umum','Klinis','Status kasus','choice','["Suspek","Probable","Konfirmasi","Bukan kasus","Belum diklasifikasi"]'::jsonb,true),
  ('general','PE Umum','Klinis','Status kesehatan','choice','["Sakit","Sembuh","Masih dirawat","Meninggal","Tidak diketahui"]'::jsonb,false),
  ('general','PE Umum','Klinis','Tanggal meninggal bila ada','date','[]'::jsonb,false),
  ('general','PE Umum','Paparan','Riwayat kontak dengan kasus','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('general','PE Umum','Paparan','Nama/ID kontak bila diketahui','text','[]'::jsonb,false),
  ('general','PE Umum','Paparan','Jenis hubungan kontak','choice','["Serumah","Sekolah","Tempat kerja","Fasilitas kesehatan","Tetangga","Teman","Lainnya"]'::jsonb,false),
  ('general','PE Umum','Paparan','Tanggal kontak terakhir','date','[]'::jsonb,false),
  ('general','PE Umum','Paparan','Riwayat perjalanan 14–21 hari sebelum onset','textarea','[]'::jsonb,false),
  ('general','PE Umum','Paparan','Lokasi paparan utama','textarea','[]'::jsonb,false),
  ('general','PE Umum','Spesimen/Laboratorium','Spesimen diambil','choice','["Ya","Tidak","Direncanakan"]'::jsonb,false),
  ('general','PE Umum','Spesimen/Laboratorium','Jenis spesimen','text','[]'::jsonb,false),
  ('general','PE Umum','Spesimen/Laboratorium','Tanggal pengambilan','date','[]'::jsonb,false),
  ('general','PE Umum','Spesimen/Laboratorium','Laboratorium tujuan','text','[]'::jsonb,false),
  ('general','PE Umum','Spesimen/Laboratorium','Hasil laboratorium','textarea','[]'::jsonb,false),
  ('general','PE Umum','Tindakan/Respons','Isolasi/karantina bila relevan','choice','["Ya","Tidak","Tidak relevan"]'::jsonb,false),
  ('general','PE Umum','Tindakan/Respons','Pengobatan/tatalaksana','textarea','[]'::jsonb,false),
  ('general','PE Umum','Tindakan/Respons','Pelacakan kontak dilakukan','choice','["Ya","Tidak","Sedang berlangsung"]'::jsonb,false),
  ('general','PE Umum','Tindakan/Respons','Jumlah kontak ditemukan','number','[]'::jsonb,false),
  ('general','PE Umum','Tindakan/Respons','Intervensi lapangan','textarea','[]'::jsonb,false),
  ('general','PE Umum','Lokasi','Latitude','number','[]'::jsonb,false),
  ('general','PE Umum','Lokasi','Longitude','number','[]'::jsonb,false),
  ('general','PE Umum','Lokasi','Tanggal investigasi lapangan','date','[]'::jsonb,false),
  ('general','PE Umum','Investigator','Petugas investigator','text','[]'::jsonb,false),

  ('campak','Campak','Modul Campak','Tanggal onset demam','date','[]'::jsonb,false),
  ('campak','Campak','Modul Campak','Tanggal onset ruam','date','[]'::jsonb,false),
  ('campak','Campak','Modul Campak','Demam','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('campak','Campak','Modul Campak','Ruam','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('campak','Campak','Modul Campak','Batuk/pilek/konjungtivitis','textarea','[]'::jsonb,false),
  ('campak','Campak','Modul Campak','Status imunisasi MR/MMR','choice','["Lengkap","Tidak lengkap","Tidak diketahui"]'::jsonb,false),
  ('campak','Campak','Modul Campak','Jumlah dosis MR/MMR','number','[]'::jsonb,false),
  ('campak','Campak','Modul Campak','Tanggal dosis terakhir','date','[]'::jsonb,false),
  ('campak','Campak','Modul Campak','Keterkaitan epidemiologis/klaster','choice','["Ada","Tidak ada","Belum diketahui"]'::jsonb,false),
  ('campak','Campak','Modul Campak','Spesimen campak','choice','["Serum","Urine","Swab tenggorok","Serum + urine/swab","Tidak diambil"]'::jsonb,false),
  ('campak','Campak','Modul Campak','Klasifikasi akhir campak','choice','["Suspek","Probable","Konfirmasi","Discarded","Belum diklasifikasi"]'::jsonb,false),

  ('tb','Tuberkulosis (TB)','Modul TB','Lokasi TB','choice','["Paru","Ekstra paru","Paru + ekstra paru"]'::jsonb,false),
  ('tb','Tuberkulosis (TB)','Modul TB','Status bakteriologis','choice','["Terkonfirmasi bakteriologis","Terdiagnosis klinis","Belum ditetapkan"]'::jsonb,false),
  ('tb','Tuberkulosis (TB)','Modul TB','Pemeriksaan utama TB','choice','["TCM/Xpert","BTA","Kultur","Foto toraks","Kombinasi","Belum diperiksa"]'::jsonb,false),
  ('tb','Tuberkulosis (TB)','Modul TB','Resistensi rifampisin','choice','["Sensitif","Resisten","Indeterminate","Belum diperiksa"]'::jsonb,false),
  ('tb','Tuberkulosis (TB)','Modul TB','Skrining kontak serumah','choice','["Sudah","Belum","Tidak relevan"]'::jsonb,false),
  ('tb','Tuberkulosis (TB)','Modul TB','Regimen/pengobatan TB','text','[]'::jsonb,false),
  ('tb','Tuberkulosis (TB)','Modul TB','Status hasil pengobatan TB','choice','["Masih pengobatan","Sembuh","Pengobatan lengkap","Meninggal","Putus berobat","Gagal","Belum diketahui"]'::jsonb,false),

  ('dbd','DBD/Dengue','Modul DBD','Tanda bahaya dengue','choice','["Ada","Tidak ada","Tidak dinilai"]'::jsonb,false),
  ('dbd','DBD/Dengue','Modul DBD','Perdarahan dan lokasi','textarea','[]'::jsonb,false),
  ('dbd','DBD/Dengue','Modul DBD','Trombosit terendah','number','[]'::jsonb,false),
  ('dbd','DBD/Dengue','Modul DBD','Hematokrit tertinggi (%)','number','[]'::jsonb,false),
  ('dbd','DBD/Dengue','Modul DBD','Syok/renjatan','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('dbd','DBD/Dengue','Modul DBD','Pemeriksaan etiologi dengue','choice','["NS1","IgM","IgG","PCR","Kombinasi","Belum diperiksa"]'::jsonb,false),
  ('dbd','DBD/Dengue','Modul DBD','Klasifikasi akhir dengue','choice','["Dengue tanpa tanda bahaya","Dengue dengan tanda bahaya","Dengue berat","Bukan dengue","Belum diklasifikasi"]'::jsonb,false),

  ('malaria','Malaria','Modul Malaria','Spesies Plasmodium','choice','["P. falciparum","P. vivax","P. malariae","P. ovale","P. knowlesi","Campuran","Belum diketahui"]'::jsonb,false),
  ('malaria','Malaria','Modul Malaria','Parasitemia','number','[]'::jsonb,false),
  ('malaria','Malaria','Modul Malaria','Metode diagnosis malaria','choice','["RDT","Mikroskopis","PCR","Kombinasi","Belum diperiksa"]'::jsonb,false),
  ('malaria','Malaria','Modul Malaria','Perjalanan ke daerah risiko','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('malaria','Malaria','Modul Malaria','Paparan malam hari di luar rumah','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('malaria','Malaria','Modul Malaria','Regimen/pengobatan malaria','text','[]'::jsonb,false),
  ('malaria','Malaria','Modul Malaria','Klasifikasi akhir malaria','choice','["Konfirmasi","Suspek","Bukan malaria","Belum diklasifikasi"]'::jsonb,false),

  ('keracunan-pangan','Keracunan Pangan','Modul Keracunan Pangan','Tanggal/jam konsumsi pangan','text','[]'::jsonb,false),
  ('keracunan-pangan','Keracunan Pangan','Modul Keracunan Pangan','Jarak konsumsi–onset (jam)','number','[]'::jsonb,false),
  ('keracunan-pangan','Keracunan Pangan','Modul Keracunan Pangan','Sindrom dominan','choice','["Muntah dominan","Diare dominan","Diare + muntah","Neurologis","Demam dominan","Campuran","Belum jelas"]'::jsonb,false),
  ('keracunan-pangan','Keracunan Pangan','Modul Keracunan Pangan','Makanan/minuman yang dikonsumsi','textarea','[]'::jsonb,false),
  ('keracunan-pangan','Keracunan Pangan','Modul Keracunan Pangan','Jumlah orang terpapar','number','[]'::jsonb,false),
  ('keracunan-pangan','Keracunan Pangan','Modul Keracunan Pangan','Jumlah orang sakit','number','[]'::jsonb,false),
  ('keracunan-pangan','Keracunan Pangan','Modul Keracunan Pangan','Spesimen klinis/pangan/lingkungan','textarea','[]'::jsonb,false),
  ('keracunan-pangan','Keracunan Pangan','Modul Keracunan Pangan','Klasifikasi kejadian','choice','["KLB terkonfirmasi","KLB tersangka","Bukan KLB","Belum ditetapkan"]'::jsonb,false),

  ('flu-burung','Flu Burung/Avian Influenza','Modul Flu Burung','Kontak unggas sakit/mati','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('flu-burung','Flu Burung/Avian Influenza','Modul Flu Burung','Jenis dan jumlah unggas','textarea','[]'::jsonb,false),
  ('flu-burung','Flu Burung/Avian Influenza','Modul Flu Burung','Aktivitas paparan unggas','choice','["Memegang","Menyembelih","Membersihkan kandang","Mengolah/konsumsi","Pasar unggas hidup","Lainnya"]'::jsonb,false),
  ('flu-burung','Flu Burung/Avian Influenza','Modul Flu Burung','Lokasi paparan','textarea','[]'::jsonb,false),
  ('flu-burung','Flu Burung/Avian Influenza','Modul Flu Burung','Keparahan respiratori','choice','["Ringan","Sedang","Berat","ARDS/critical","Tidak dinilai"]'::jsonb,false),
  ('flu-burung','Flu Burung/Avian Influenza','Modul Flu Burung','Spesimen respiratori','choice','["Diambil","Tidak diambil","Direncanakan"]'::jsonb,false),
  ('flu-burung','Flu Burung/Avian Influenza','Modul Flu Burung','Klasifikasi akhir flu burung','choice','["Suspek","Probable","Konfirmasi","Bukan kasus","Belum diklasifikasi"]'::jsonb,false),

  ('difteri','Difteri','Modul Difteri','Pseudomembran','choice','["Ada","Tidak ada","Tidak dinilai"]'::jsonb,false),
  ('difteri','Difteri','Modul Difteri','Lokasi pseudomembran','text','[]'::jsonb,false),
  ('difteri','Difteri','Modul Difteri','Status imunisasi difteri','choice','["Lengkap","Tidak lengkap","Tidak diketahui"]'::jsonb,false),
  ('difteri','Difteri','Modul Difteri','Antibiotik diberikan','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('difteri','Difteri','Modul Difteri','Profilaksis kontak','choice','["Ya","Tidak","Sebagian","Belum dilakukan"]'::jsonb,false),
  ('difteri','Difteri','Modul Difteri','Spesimen usap diambil','choice','["Ya","Tidak","Direncanakan"]'::jsonb,false),
  ('difteri','Difteri','Modul Difteri','Klasifikasi akhir difteri','choice','["Suspek","Probable","Konfirmasi","Bukan kasus","Belum diklasifikasi"]'::jsonb,false),

  ('pertusis','Pertusis','Modul Pertusis','Lama batuk (hari)','number','[]'::jsonb,false),
  ('pertusis','Pertusis','Modul Pertusis','Batuk paroksismal','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('pertusis','Pertusis','Modul Pertusis','Whoop','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('pertusis','Pertusis','Modul Pertusis','Apnea','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('pertusis','Pertusis','Modul Pertusis','Status imunisasi pertusis','choice','["Lengkap","Tidak lengkap","Tidak diketahui"]'::jsonb,false),
  ('pertusis','Pertusis','Modul Pertusis','Spesimen nasofaring','choice','["Diambil","Tidak diambil","Direncanakan"]'::jsonb,false),
  ('pertusis','Pertusis','Modul Pertusis','Klasifikasi akhir pertusis','choice','["Suspek","Probable","Konfirmasi","Bukan kasus","Belum diklasifikasi"]'::jsonb,false),

  ('afp','AFP/Polio','Modul AFP','Tanggal onset kelumpuhan','date','[]'::jsonb,false),
  ('afp','AFP/Polio','Modul AFP','Kelumpuhan asimetris','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('afp','AFP/Polio','Modul AFP','Spesimen tinja pertama memadai','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('afp','AFP/Polio','Modul AFP','Spesimen tinja kedua memadai','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('afp','AFP/Polio','Modul AFP','Hasil follow-up 60 hari','choice','["Sembuh total","Sisa kelumpuhan","Meninggal","Tidak dapat dinilai","Belum dilakukan"]'::jsonb,false),
  ('afp','AFP/Polio','Modul AFP','Klasifikasi akhir AFP','choice','["Non-polio AFP","Polio kompatibel","Polio","Discarded","Belum diklasifikasi"]'::jsonb,false),

  ('rabies','Rabies/GHPR','Modul Rabies/GHPR','Jenis hewan','text','[]'::jsonb,false),
  ('rabies','Rabies/GHPR','Modul Rabies/GHPR','Gigitan provokatif','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('rabies','Rabies/GHPR','Modul Rabies/GHPR','Kategori paparan luka','choice','["Risiko rendah","Risiko tinggi","Belum ditentukan"]'::jsonb,false),
  ('rabies','Rabies/GHPR','Modul Rabies/GHPR','Hasil observasi hewan','choice','["Sehat selama observasi","Sakit","Mati","Tidak dapat diobservasi","Belum selesai"]'::jsonb,false),
  ('rabies','Rabies/GHPR','Modul Rabies/GHPR','VAR diberikan','choice','["Ya lengkap","Ya belum lengkap","Tidak","Tidak diketahui"]'::jsonb,false),
  ('rabies','Rabies/GHPR','Modul Rabies/GHPR','SAR diberikan','choice','["Ya","Tidak","Tidak diindikasikan","Tidak diketahui"]'::jsonb,false),
  ('rabies','Rabies/GHPR','Modul Rabies/GHPR','Outcome paparan','choice','["Selesai PEP","Masih PEP","Rujuk","Tidak diketahui"]'::jsonb,false),

  ('leptospirosis','Leptospirosis','Modul Leptospirosis','Paparan banjir/genangan','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('leptospirosis','Leptospirosis','Modul Leptospirosis','Paparan tikus/hewan','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('leptospirosis','Leptospirosis','Modul Leptospirosis','Gangguan ginjal','choice','["Ya","Tidak","Tidak dinilai"]'::jsonb,false),
  ('leptospirosis','Leptospirosis','Modul Leptospirosis','Jaundis','choice','["Ya","Tidak","Tidak diketahui"]'::jsonb,false),
  ('leptospirosis','Leptospirosis','Modul Leptospirosis','Spesimen leptospirosis','choice','["Serum","Urin","Serum + urin","Tidak diambil"]'::jsonb,false),
  ('leptospirosis','Leptospirosis','Modul Leptospirosis','Hasil pemeriksaan leptospirosis','text','[]'::jsonb,false)
),
built AS (
 SELECT
   jsonb_agg(
     jsonb_build_object(
       'id', CASE WHEN module_id='general'
         THEN 'pe_general_' || trim(both '_' from regexp_replace(lower(label),'[^a-z0-9]+','_','g'))
         ELSE 'pe_' || module_id || '_' || trim(both '_' from regexp_replace(lower(label),'[^a-z0-9]+','_','g'))
       END,
       'label',label,'type',field_type,'options',options,'required',required,
       'section',section_name,'module',module_id
     ) ORDER BY CASE WHEN module_id='general' THEN 0 ELSE 1 END,module_id,section_name,label
   ) AS questions,
   (SELECT jsonb_agg(jsonb_build_object('id',module_id,'label',module_label) ORDER BY module_label)
    FROM (SELECT DISTINCT module_id,module_label FROM qdata WHERE module_id<>'general') m) AS modules
 FROM qdata
),
full_schema AS (
 SELECT jsonb_build_object(
   'version','PE-MASTER-1.0',
   'instrumentName','PE Umum + Modul Penyakit',
   'note','Instrumen digital operasional. Validasi dengan pedoman resmi terkini tetap wajib sebelum penggunaan sebagai instrumen resmi.',
   'questions', questions || jsonb_build_array(jsonb_build_object('id','disease_module','label','Modul penyakit terpilih','type','text','required',false,'section','Metadata','module','metadata')),
   'diseaseModules',modules,
   'conditionalRules',jsonb_build_array()
 ) AS schema_json FROM built
)
UPDATE public.questionnaires q
SET schema_json = full_schema.schema_json,
    name = 'Kuesioner PE Umum + Modul Penyakit',
    version = 'PE-MASTER-1.0'
FROM full_schema
WHERE q.id IN (
  SELECT DISTINCT s.questionnaire_id
  FROM public.public_surveys s
  WHERE s.title ILIKE 'UJI SISTEM%Survei Publik%GORUT-OUTBREAK-AI%'
);

COMMIT;

-- Setelah menjalankan, verifikasi dengan:
-- SELECT q.name,q.version,jsonb_array_length(q.schema_json->'questions') AS jumlah_pertanyaan,
--        jsonb_array_length(q.schema_json->'diseaseModules') AS jumlah_modul
-- FROM public.questionnaires q
-- WHERE q.name='Kuesioner PE Umum + Modul Penyakit';
