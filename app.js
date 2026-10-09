



const K='gorut-v8';let db=JSON.parse(localStorage.getItem(K)||'null')||{investigations:[],cases:[],questions:[],contacts:[],specimens:[],fieldVisits:[],alerts:[],active:null,outbox:[]};
db.contacts ||= []; db.specimens ||= []; db.alerts ||= []; db.outbox ||= [];
const diseases={
'kolera':{name:'Tersangka Kolera',group:'SKDR',q:['Tanggal onset diare','Diare cair akut','Frekuensi BAB per hari','Muntah','Tanda dehidrasi','Sumber air minum','Air tidak diolah','Konsumsi makanan berisiko','Konsumsi makanan laut','Riwayat kontak kasus diare','Riwayat perjalanan','Lokasi paparan bersama','Spesimen tinja','Kultur/PCR','Hasil laboratorium','Status kasus','Outcome']},
'diare-akut':{name:'Diare Akut',group:'SKDR',q:['Tanggal onset','Frekuensi BAB','Konsistensi tinja','Muntah','Demam','Darah/lendir dalam tinja','Tanda dehidrasi','Makanan/minuman 3 hari sebelum sakit','Sumber air minum','Sanitasi/jamban','Riwayat kontak','Klaster tempat tinggal/sekolah','Spesimen tinja','Hasil laboratorium','Status kasus','Outcome']},
'diare-berdarah':{name:'Diare Akut Berdarah/Disentri',group:'SKDR',q:['Tanggal onset','Frekuensi BAB','Darah dalam tinja','Lendir dalam tinja','Demam','Nyeri perut','Tenesmus','Tanda dehidrasi','Makanan/minuman berisiko','Sumber air','Riwayat kontak','Spesimen tinja','Hasil laboratorium','Status kasus','Outcome']},
'jaundis':{name:'Sindrom Jaundis Akut',group:'SKDR',q:['Tanggal onset','Demam','Jaundis','Mual/muntah','Nyeri perut','Urin gelap','Feses pucat','Riwayat hepatitis','Riwayat perjalanan','Makanan/air berisiko','Riwayat obat','Paparan darah/cairan tubuh','Spesimen serum','Pemeriksaan fungsi hati','Hasil laboratorium','Status kasus','Outcome']},
'leptospirosis':{name:'Tersangka Leptospirosis',group:'SKDR/Zoonosis',q:['Tanggal onset','Demam','Sakit kepala','Myalgia','Nyeri betis','Conjunctival suffusion','Jaundis','Oliguria/gangguan ginjal','Riwayat banjir/genangan','Kontak air/tanah tercemar','Kontak tikus/hewan','Pekerjaan berisiko','Riwayat perjalanan','Spesimen serum/urin','Hasil laboratorium','Status kasus','Outcome']},
'meningitis':{name:'Tersangka Meningitis/Ensefalitis',group:'SKDR',q:['Tanggal onset','Demam','Sakit kepala','Kaku kuduk','Fotofobia','Muntah','Kejang','Penurunan kesadaran','Ruam/perdarahan','Riwayat kontak','Riwayat perjalanan','Vaksinasi relevan','Spesimen CSF','Spesimen darah','Hasil laboratorium','Status kasus','Outcome']},
'pneumonia':{name:'Pneumonia',group:'SKDR/Respiratori',q:['Tanggal onset','Batuk','Sesak/dispnea','Napas cepat','Tarikan dinding dada','Stridor','Demam','Saturasi oksigen','Riwayat kontak','Riwayat perjalanan','Komorbid','Paparan asap/polusi','Spesimen respiratori','Hasil laboratorium','Status kasus','Outcome']},
'flu-burung':{name:'Tersangka Flu Burung/Avian Influenza',group:'SKDR/PIE/Zoonosis',q:['Tanggal onset','Demam','Batuk','Sakit tenggorokan','Sesak/dispnea','Pneumonia','Kontak unggas sakit/mati','Jenis unggas','Jumlah unggas','Menyembelih unggas','Membersihkan kandang','Kontak lingkungan pasar unggas hidup','Lokasi paparan','Kontak kasus manusia','Riwayat perjalanan','Spesimen saluran napas','Hasil laboratorium','Pelacakan kontak','Outcome']},
'difteri':{name:'Tersangka Difteri',group:'SKDR/PD3I',q:['Tanggal onset','Demam','Sakit tenggorokan','Pseudomembran','Lokasi membran','Perdarahan membran','Stridor/sesak','Pembengkakan leher','Status imunisasi DPT/DT/Td','Dosis terakhir dan tanggal','Riwayat kontak','Sekolah/tempat kerja','Spesimen usap tenggorok/hidung','Hasil laboratorium','Kontak yang diberi profilaksis','Status kasus','Outcome']},
'campak':{name:'Tersangka Campak',group:'SKDR/PD3I',q:['Tanggal onset demam','Tanggal onset ruam','Demam','Ruam','Batuk','Pilek','Konjungtivitis','Koplik','Status imunisasi MR/MMR','Jumlah dosis','Tanggal dosis terakhir','Riwayat kontak','Sekolah/daycare/kelompok','Riwayat perjalanan','Kontak serumah','Spesimen serum','Spesimen urine/swab tenggorok','Tanggal pengambilan spesimen','Hasil laboratorium','Klasifikasi kasus','Outcome']},
'pertusis':{name:'Tersangka Pertusis',group:'SKDR/PD3I',q:['Tanggal onset','Batuk ≥2 minggu','Batuk paroksismal','Whoop','Muntah setelah batuk','Apnea pada bayi','Sianosis','Status imunisasi pertusis','Riwayat kontak','Sekolah/daycare','Spesimen nasofaring','Hasil laboratorium','Klasifikasi kasus','Status kasus','Outcome']},
'afp':{name:'Lumpuh Layuh Mendadak/AFP',group:'SKDR/PD3I',q:['Tanggal onset kelumpuhan','Tanggal ditemukan','Demam saat onset','Lokasi/distribusi kelumpuhan','Kekuatan otot','Refleks','Progresivitas kelumpuhan','Riwayat imunisasi polio','Jumlah dosis OPV/IPV','Riwayat perjalanan','Riwayat kontak','Spesimen tinja pertama','Tanggal spesimen 1','Spesimen tinja kedua','Tanggal spesimen 2','Kondisi spesimen','60-day follow-up','Klasifikasi akhir','Outcome']},
'tetanus':{name:'Tersangka Tetanus',group:'SKDR/PD3I',q:['Tanggal onset','Trismus/kaku rahang','Disfagia','Rigiditas otot','Spasme','Opistotonus','Riwayat luka','Jenis/lokasi luka','Perawatan luka','Status imunisasi tetanus','Dosis terakhir','Riwayat kontak','Status kasus','Outcome']},
'tn':{name:'Tetanus Neonatorum',group:'SKDR/PD3I',q:['Tanggal lahir','Tanggal onset','Kesulitan menyusu','Trismus','Spasme','Kaku','Riwayat persalinan','Tempat persalinan','Penolong persalinan','Perawatan tali pusat','Bahan yang digunakan pada tali pusat','Status imunisasi ibu','Riwayat ANC','Dosis TT/Td ibu','Outcome']},
'tifoid':{name:'Tersangka Demam Tifoid',group:'SKDR',q:['Tanggal onset','Demam','Sakit kepala','Nyeri perut','Diare/konstipasi','Mual/muntah','Riwayat makanan/minuman','Sumber air','Sanitasi','Riwayat perjalanan','Kontak kasus','Spesimen darah/tinja','Hasil laboratorium','Status kasus','Outcome']},
'keracunan-pangan':{name:'Keracunan Pangan / Keracunan Makanan (KLB)',group:'KLB/Keracunan Pangan',q:['Tanggal kejadian','Lokasi kejadian','Nama acara/kegiatan','Jumlah orang terpapar','Jumlah orang sakit','Tanggal/jam konsumsi pangan','Tanggal/jam onset gejala','Masa inkubasi','Makanan/minuman yang dikonsumsi','Jenis/menu pangan yang dicurigai','Sumber/pengolah pangan','Tempat pengolahan/penyajian','Cara penyimpanan pangan','Suhu/waktu penyimpanan bila tersedia','Air yang digunakan','Riwayat higiene penjamah makanan','Gejala: mual','Gejala: muntah','Gejala: diare','Gejala: nyeri perut','Gejala: demam','Gejala neurologis','Tanda dehidrasi','Perawatan/rujukan','Rawat inap','Kematian','Spesimen klinis','Spesimen pangan','Spesimen lingkungan/air','Tanggal pengambilan spesimen','Hasil laboratorium','Definisi/klasifikasi kasus','Outcome']},
'malaria':{name:'Malaria Konfirmasi/Tersangka Malaria',group:'SKDR/Vektor',q:['Tanggal onset','Demam','Menggigil','Berkeringat','Riwayat malaria sebelumnya','Riwayat perjalanan ke daerah endemis','Tanggal perjalanan','Aktivitas malam hari','Bermalam di luar rumah','Penggunaan kelambu','Penggunaan repellent','Kondisi rumah','Tempat perindukan potensial','Spesies Plasmodium','RDT/mikroskopis','Parasitemia bila tersedia','Pengobatan','Spesimen','Hasil laboratorium','Status kasus','Outcome']},
'dbd':{name:'Tersangka Dengue/DBD',group:'SKDR/Vektor',q:['Tanggal onset demam','Demam','Sakit kepala','Nyeri retroorbital','Myalgia/artralgia','Ruam','Mual/muntah','Perdarahan','Tanda bahaya','Trombosit','Hematokrit','Riwayat dengue','Kepadatan hunian','Tempat penampungan air','Jentik ditemukan','PSN','Penggunaan repellent','Riwayat perjalanan','Spesimen','NS1/IgM/IgG/PCR','Hasil laboratorium','Status kasus','Outcome']},
'chikungunya':{name:'Tersangka Chikungunya',group:'SKDR/Vektor',q:['Tanggal onset','Demam','Nyeri sendi berat','Pembengkakan sendi','Ruam','Nyeri otot','Riwayat perjalanan','Kontak kasus','Tempat perindukan nyamuk','Jentik ditemukan','PSN','Penggunaan repellent','Spesimen','Hasil laboratorium','Status kasus','Outcome']},
'ili':{name:'Influenza Like Illness/ILI',group:'SKDR/Respiratori',q:['Tanggal onset','Demam','Batuk','Sakit tenggorokan','Pilek','Myalgia','Sakit kepala','Sesak','Riwayat kontak','Klaster','Riwayat perjalanan','Vaksinasi influenza','Komorbid','Spesimen respiratori','Hasil laboratorium','Status kasus','Outcome']},
'antraks':{name:'Tersangka Antraks',group:'SKDR/Zoonosis',q:['Tanggal onset','Demam','Lesi kulit','Papul/vesikel/pustul','Eschar','Edema','Gejala respiratori','Gejala gastrointestinal','Kontak hewan ternak','Kontak produk hewan','Penyembelihan hewan','Konsumsi daging','Kematian hewan di sekitar','Riwayat perjalanan','Spesimen','Hasil laboratorium','Status kasus','Outcome']},
'klaster-tidak-lazim':{name:'Klaster Penyakit Tidak Lazim',group:'SKDR/PIE',q:['Tanggal kasus pertama','Tanggal kasus terakhir','Jumlah kasus','Jumlah kematian','Kelompok umur dominan','Gejala dominan','Lokasi klaster','Paparan bersama','Sumber paparan yang dicurigai','Riwayat perjalanan','Kontak antar kasus','Kasus indeks','Spesimen','Hipotesis awal','Penilaian risiko awal','Status investigasi','Outcome']},
'rabies':{name:'Gigitan Hewan Penular Rabies/GHPR',group:'SKDR/Zoonosis',q:['Tanggal kejadian','Tanggal datang ke fasilitas kesehatan','Jenis hewan','Ras/warna hewan','Status vaksinasi hewan','Lokasi gigitan/cakaran','Jumlah luka','Kedalaman luka','Lokasi anatomi luka','Gigitan provokatif/tidak','Hewan masih hidup','Hewan dapat diobservasi','Hasil observasi hewan','Status hewan','Cuci luka','Tanggal VAR','Jumlah dosis VAR','SAR diberikan','Tanggal SAR','Riwayat perjalanan','Outcome']},
'hfmd':{name:'Tersangka HFMD',group:'SKDR',q:['Tanggal onset','Demam','Lesi mulut','Lesi tangan','Lesi kaki','Ruam','Nyeri menelan','Gejala neurologis','Riwayat kontak','Sekolah/daycare','Klaster','Riwayat perjalanan','Spesimen','Hasil laboratorium','Status kasus','Outcome']},
'covid19':{name:'Tersangka COVID-19',group:'SKDR/Respiratori/PIE',q:['Tanggal onset','Demam','Batuk','Sesak','Sakit tenggorokan','Anosmia/ageusia','Gejala gastrointestinal','Riwayat kontak','Klaster','Riwayat perjalanan','Vaksinasi COVID-19','Dosis terakhir','Komorbid','Spesimen respiratori','Jenis tes','Hasil laboratorium','Pelacakan kontak','Outcome']},
'mpox':{name:'Mpox',group:'PIE',q:['Tanggal onset','Demam','Ruam/lesi kulit','Jumlah lesi','Lokasi lesi','Lesi anogenital','Lesi oral','Limfadenopati','Nyeri saat menelan','Riwayat kontak erat','Kontak dengan kasus terkonfirmasi','Kontak hewan','Paparan bahan hewan','Riwayat perjalanan','Spesimen lesi','Jenis spesimen','Hasil laboratorium','Pelacakan kontak','Status kasus','Outcome']},
'nipah':{name:'Penyakit Virus Nipah',group:'PIE/Zoonosis',q:['Tanggal onset','Demam','Sakit kepala','Muntah','Gangguan kesadaran','Kejang','Gejala respiratori','Pneumonia','Kontak dengan kasus','Kontak dengan kelelawar','Kontak babi/hewan berisiko','Konsumsi makanan berisiko','Riwayat perjalanan internasional','Paparan fasilitas kesehatan','Spesimen','Hasil laboratorium','Pelacakan kontak','Outcome']},
'ebola':{name:'Penyakit Virus Ebola',group:'PIE',q:['Tanggal onset','Demam','Kelemahan','Muntah','Diare','Nyeri perut','Perdarahan','Ruam','Kontak kasus','Kontak jenazah','Pemakaman','Paparan fasilitas kesehatan','Riwayat perjalanan ke daerah terjangkit','Spesimen','Hasil laboratorium','Pelacakan kontak','Outcome']},
'mers':{name:'MERS',group:'PIE/Respiratori',q:['Tanggal onset','Demam','Batuk','Sesak','Pneumonia','Gejala gastrointestinal','Kontak unta','Kontak produk unta','Kontak kasus','Paparan fasilitas kesehatan','Riwayat perjalanan Timur Tengah','Riwayat perjalanan lain','Spesimen respiratori','Hasil laboratorium','Pelacakan kontak','Outcome']},
'hantavirus':{name:'Hantavirus',group:'PIE/Zoonosis',q:['Tanggal onset','Demam','Myalgia','Sakit kepala','Batuk','Sesak','Gangguan ginjal','Perdarahan','Kontak tikus','Kotoran/urin tikus','Membersihkan tempat berisiko','Pekerjaan berisiko','Riwayat perjalanan','Spesimen','Hasil laboratorium','Outcome']},
'legionellosis':{name:'Legionellosis',group:'PIE',q:['Tanggal onset','Demam','Batuk','Sesak','Pneumonia','Gejala gastrointestinal','Paparan hotel/gedung','Paparan sistem air','Paparan aerosol','Hot tub/spa','Fasilitas kesehatan','Riwayat perjalanan','Spesimen','Hasil laboratorium','Outcome']},
'rift-valley':{name:'Demam Rift Valley',group:'PIE/Zoonosis',q:['Tanggal onset','Demam','Nyeri otot','Sakit kepala','Gangguan penglihatan','Perdarahan','Kontak ternak','Penyembelihan hewan','Kontak jaringan/produk hewan','Gigitan nyamuk','Riwayat perjalanan','Spesimen','Hasil laboratorium','Outcome']},
'demam-kuning':{name:'Demam Kuning',group:'PIE/Vektor',q:['Tanggal onset','Demam','Sakit kepala','Nyeri otot','Jaundis','Mual/muntah','Perdarahan','Riwayat perjalanan ke daerah terjangkit','Status vaksinasi yellow fever','Paparan nyamuk','Spesimen','Hasil laboratorium','Outcome']},
'novel-respiratory':{name:'Novel Respiratory Pathogen/Pandemic-prone',group:'PIE',q:['Tanggal onset','Demam','Batuk','Sakit tenggorokan','Sesak','Pneumonia','Hipoksemia','Riwayat kontak','Klaster','Riwayat perjalanan domestik','Riwayat perjalanan internasional','Paparan hewan','Paparan fasilitas kesehatan','Paparan laboratorium','Spesimen respiratori','Hasil laboratorium','Pelacakan kontak','Outcome']},
};

/* MASTER QUESTIONNAIRE ENGINE v5
   Struktur: PE umum + modul spesifik penyakit/sindrom.
   Catatan: instrumen ini adalah digitalisasi/penyesuaian operasional dan wajib divalidasi
   terhadap formulir/pedoman Kemenkes terbaru sebelum dipakai sebagai instrumen resmi.
*/
const instrumentMeta={
  owner:'Dinas Kesehatan Kabupaten Gorontalo Utara',
  app:'GORUT-OUTBREAK AI',
  release:'v5.0 — 2026-10',
  generalBasis:'Pedoman SKDR Penyakit Potensial KLB/Wabah Kemenkes RI, Edisi Revisi 2023 / terbit 2024',
  diseaseSpecificBasis:'Pedoman/formulir spesifik penyakit Kemenkes RI yang berlaku; setiap instrumen harus melalui validasi versi sebelum ditetapkan sebagai formulir resmi',
  workflow:['Deteksi/alert','Verifikasi','PE','Line listing','Pelacakan kontak','Spesimen/laboratorium','Analisis','Respons','Laporan']
};

const domainMap={
  'Tanggal onset':'Klinis/Waktu','Tanggal onset demam':'Klinis/Waktu','Tanggal onset ruam':'Klinis/Waktu','Tanggal ditemukan':'Klinis/Waktu','Tanggal onset kelumpuhan':'Klinis/Waktu',
  'Riwayat perjalanan':'Paparan/Perjalanan','Riwayat perjalanan ke daerah endemis':'Paparan/Perjalanan','Riwayat perjalanan internasional':'Paparan/Perjalanan',
  'Spesimen':'Laboratorium','Hasil laboratorium':'Laboratorium','Spesimen serum':'Laboratorium','Spesimen darah':'Laboratorium','Spesimen respiratori':'Laboratorium'
};

const typeRules=[
  [/^Tanggal|Tanggal |tanggal/i,'date'],[/Jumlah|Frekuensi|Umur|Jumlah kasus|Jumlah kematian|Parasitemia|Trombosit|Hematokrit|Saturasi|Latitude|Longitude/i,'number'],
  [/Status|Jenis kelamin|Ya\/Tidak|dapat diobservasi|masih hidup|berisiko|provokatif|Lengkap|diperiksa|diberikan|Ada /i,'choice'],
  [/Riwayat|Alamat|Gejala|Hipotesis|Intervensi|Lokasi paparan|Pekerjaan|Sekolah|Kontak|Paparan|Kondisi|Jenis .*spesimen|Outcome/i,'textarea']
];

function inferMeta(label){
  const l=String(label||'');
  let type='text';
  for(const [rx,t] of typeRules){if(rx.test(l)){type=t;break}}
  if(l.includes('Tanggal')||/^tanggal/i.test(l)) type='date';
  if(/^(Umur|Jumlah|Frekuensi|Trombosit|Hematokrit|Saturasi|Parasitemia|Latitude|Longitude)/i.test(l)) type='number';
  const opts={};
  if(type==='choice'){
    if(/Jenis kelamin/i.test(l)) opts.options=['Laki-laki','Perempuan','Tidak diketahui'];
    else if(/status imunisasi/i.test(l)) opts.options=['Lengkap','Tidak lengkap','Tidak diketahui'];
    else if(/status kasus/i.test(l)) opts.options=['Suspek','Probable','Konfirmasi','Bukan kasus','Belum diklasifikasi'];
    else if(/outcome|keadaan akhir/i.test(l)) opts.options=['Sembuh','Masih sakit/dirawat','Meninggal','Tidak diketahui'];
    else if(/ya|ada|kontak|dapat|masih|perdarahan|jaundis|demam|batuk|sesak|ruam|muntah|kejang|vaksinasi|isolasi|pelacakan|spesimen/i.test(l)) opts.options=['Ya','Tidak','Tidak diketahui'];
    else opts.options=['Ada','Tidak ada','Tidak diketahui'];
  }
  return {type,...opts};
}

const questionnaireSections={
  'PE Umum':['Identitas','Sosiodemografi','Klinis','Waktu','Paparan','Kontak','Perjalanan','Spesimen/Laboratorium','Tindakan/Respons','Lokasi','Investigator'],
  'Validasi':['status kelengkapan','sumber data','tanggal verifikasi','petugas verifikasi','catatan ketidakpastian']
};

const conditionalEngine=[
  {when:/status imunisasi.*(Tidak lengkap|Tidak diketahui)/i, reveal:/Jumlah dosis|Tanggal dosis/i},
  {when:/kontak unggas sakit\/mati/i, reveal:/Jenis unggas|Jumlah unggas|Menyembelih|Membersihkan kandang|Lokasi paparan/i},
  {when:/Hewan dapat diobservasi/i, reveal:/Hasil observasi hewan|Status hewan/i},
  {when:/Perdarahan/i, reveal:/lokasi|jenis perdarahan/i},
  {when:/Ruam\/lesi kulit|Lesi kulit/i, reveal:/Jumlah lesi|Lokasi lesi/i},
  {when:/Spesimen diambil/i, reveal:/Jenis spesimen|Tanggal pengambilan|Laboratorium tujuan|Hasil laboratorium/i},
  {when:/Riwayat kontak dengan kasus/i, reveal:/Nama\/ID kontak|Jenis hubungan kontak|Tanggal kontak terakhir/i}
];

function buildQuestion(label,cat='Spesifik'){
  const m=fieldMeta[label]||inferMeta(label);
  return {id:'Q_'+label.toLowerCase().replace(/[^a-z0-9]+/g,'_').slice(0,55),cat,label,type:m.type,options:m.options||[],required:false,source:instrumentMeta.diseaseSpecificBasis,version:instrumentMeta.release};
}

const baseQ=[
['Identitas','ID Kasus','text'],['Identitas','Nama lengkap','text'],['Identitas','NIK/ID lokal','text'],['Identitas','Tanggal lahir','date'],['Identitas','Umur','number'],['Identitas','Satuan umur','choice'],['Identitas','Jenis kelamin','choice'],
['Sosiodemografi','Alamat lengkap','textarea'],['Sosiodemografi','Desa/Kelurahan','text'],['Sosiodemografi','Kecamatan','text'],['Sosiodemografi','Kabupaten','text'],['Sosiodemografi','Provinsi','text'],['Sosiodemografi','Puskesmas','text'],['Sosiodemografi','No. HP','text'],['Sosiodemografi','Pekerjaan','text'],['Sosiodemografi','Sekolah/Tempat kerja','text'],
['Klinis','Tanggal onset gejala','date'],['Klinis','Tanggal pertama berobat','date'],['Klinis','Tanggal dirawat','date'],['Klinis','Gejala utama','textarea'],['Klinis','Status kasus','choice'],['Klinis','Status kesehatan','choice'],['Klinis','Tanggal meninggal bila ada','date'],
['Paparan','Riwayat kontak dengan kasus','choice'],['Paparan','Nama/ID kontak bila diketahui','text'],['Paparan','Jenis hubungan kontak','choice'],['Paparan','Tanggal kontak terakhir','date'],['Paparan','Riwayat perjalanan 14–21 hari sebelum onset','textarea'],['Paparan','Lokasi paparan utama','textarea'],
['Spesimen','Spesimen diambil','choice'],['Spesimen','Jenis spesimen','text'],['Spesimen','Tanggal pengambilan','date'],['Spesimen','Laboratorium tujuan','text'],['Spesimen','Hasil laboratorium','textarea'],
['Tindakan','Isolasi/karantina bila relevan','choice'],['Tindakan','Pengobatan/tatalaksana','textarea'],['Tindakan','Pelacakan kontak dilakukan','choice'],['Tindakan','Jumlah kontak ditemukan','number'],['Tindakan','Intervensi lapangan','textarea'],
['Lokasi','Latitude','number'],['Lokasi','Longitude','number'],['Lokasi','Tanggal investigasi lapangan','date'],['Lokasi','Petugas investigator','text']
];
const fieldMeta={
'Jenis kelamin':{type:'choice',options:['Laki-laki','Perempuan','Tidak diketahui']},'Satuan umur':{type:'choice',options:['Tahun','Bulan','Hari']},'Status kasus':{type:'choice',options:['Suspek','Probable','Konfirmasi','Bukan kasus','Meninggal','Belum diklasifikasi']},'Status kesehatan':{type:'choice',options:['Sakit','Sembuh','Masih dirawat','Meninggal','Tidak diketahui']},'Riwayat kontak dengan kasus':{type:'choice',options:['Ya','Tidak','Tidak diketahui']},'Jenis hubungan kontak':{type:'choice',options:['Serumah','Sekolah','Tempat kerja','Fasilitas kesehatan','Tetangga','Teman','Lainnya']},'Spesimen diambil':{type:'choice',options:['Ya','Tidak','Direncanakan']},'Isolasi/karantina bila relevan':{type:'choice',options:['Ya','Tidak','Tidak relevan']},'Pelacakan kontak dilakukan':{type:'choice',options:['Ya','Tidak','Sedang berlangsung']}
};
const priorityClinicalEpi={
  'campak':{title:'Campak — Panel Prioritas',fields:[['demamHari','Durasi demam (hari)','number'],['ruamHari','Hari ke-berapa ruam muncul sejak demam','number'],['immunization','Status imunisasi MR/MMR','select','Lengkap|Tidak lengkap|Tidak diketahui'],['doseCount','Jumlah dosis MR/MMR','number'],['epiLink','Keterkaitan epidemiologis/klaster','select','Ada|Tidak ada|Belum diketahui'],['specimenType','Spesimen utama','select','Serum|Urine|Swab tenggorok|Serum + urine/swab|Tidak diambil'],['classification','Klasifikasi akhir','select','Suspek|Probable|Konfirmasi|Discarded|Belum diklasifikasi']]},
  'tb':{title:'TB — Panel Prioritas',fields:[['site','Lokasi TB','select','Paru|Ekstra paru|Paru + ekstra paru'],['bacteriologic','Status bakteriologis','select','Terkonfirmasi bakteriologis|Terdiagnosis klinis|Belum ditetapkan'],['test','Pemeriksaan utama','select','TCM/Xpert|BTA|Kultur|Foto toraks|Kombinasi|Belum diperiksa'],['rifampicin','Resistensi rifampisin','select','Sensitif|Resisten|Indeterminate|Belum diperiksa'],['contactScreening','Skrining kontak serumah','select','Sudah|Belum|Tidak relevan'],['treatment','Pengobatan/TB regimen','text'],['outcome','Status hasil pengobatan','select','Masih pengobatan|Sembuh|Pengobatan lengkap|Meninggal|Putus berobat|Gagal|Belum diketahui']]},
  'dbd':{title:'DBD — Panel Prioritas',fields:[['warningSigns','Tanda bahaya dengue','select','Ada|Tidak ada|Tidak dinilai'],['bleedingSite','Lokasi perdarahan utama','text'],['plateletNadir','Trombosit terendah','number'],['hematocritPeak','Hematokrit tertinggi (%)','number'],['shock','Syok/renjatan','select','Ya|Tidak|Tidak diketahui'],['dengueTest','Pemeriksaan etiologi','select','NS1|IgM|IgG|PCR|Kombinasi|Belum diperiksa'],['classification','Klasifikasi akhir','select','Dengue tanpa tanda bahaya|Dengue dengan tanda bahaya|Dengue berat|Bukan dengue|Belum diklasifikasi']]},
  'malaria':{title:'Malaria — Panel Prioritas',fields:[['species','Spesies Plasmodium','select','P. falciparum|P. vivax|P. malariae|P. ovale|P. knowlesi|Campuran|Belum diketahui'],['parasitemia','Parasitemia','number'],['diagnosticMethod','Metode diagnosis','select','RDT|Mikroskopis|PCR|Kombinasi|Belum diperiksa'],['travelExposure','Paparan/perjalanan ke daerah risiko','select','Ya|Tidak|Tidak diketahui'],['nightExposure','Paparan malam hari di luar rumah','select','Ya|Tidak|Tidak diketahui'],['treatment','Regimen/pengobatan diberikan','text'],['classification','Klasifikasi akhir','select','Konfirmasi|Suspek|Bukan malaria|Belum diklasifikasi']]},
  'difteri':{title:'Difteri — Panel Prioritas',fields:[['membrane','Pseudomembran','select','Ada|Tidak ada|Tidak dinilai'],['membraneSite','Lokasi pseudomembran','text'],['immunization','Status imunisasi difteri','select','Lengkap|Tidak lengkap|Tidak diketahui'],['antibiotic','Antibiotik diberikan','select','Ya|Tidak|Tidak diketahui'],['prophylaxisContacts','Kontak mendapat profilaksis','select','Ya|Tidak|Sebagian|Belum dilakukan'],['swab','Spesimen usap diambil','select','Ya|Tidak|Direncanakan'],['classification','Klasifikasi akhir','select','Suspek|Probable|Konfirmasi|Bukan kasus|Belum diklasifikasi']]},
  'pertusis':{title:'Pertusis — Panel Prioritas',fields:[['coughDays','Lama batuk (hari)','number'],['paroxysm','Batuk paroksismal','select','Ya|Tidak|Tidak diketahui'],['whoop','Whoop','select','Ya|Tidak|Tidak diketahui'],['apnea','Apnea','select','Ya|Tidak|Tidak diketahui'],['immunization','Status imunisasi pertusis','select','Lengkap|Tidak lengkap|Tidak diketahui'],['specimen','Spesimen nasofaring','select','Diambil|Tidak diambil|Direncanakan'],['classification','Klasifikasi akhir','select','Suspek|Probable|Konfirmasi|Bukan kasus|Belum diklasifikasi']]},
  'afp':{title:'AFP/Polio — Panel Prioritas',fields:[['paralysisDate','Tanggal onset kelumpuhan','date'],['asymmetry','Kelumpuhan asimetris','select','Ya|Tidak|Tidak diketahui'],['stool1','Spesimen tinja pertama memadai','select','Ya|Tidak|Tidak diketahui'],['stool2','Spesimen tinja kedua memadai','select','Ya|Tidak|Tidak diketahui'],['sixtyDay','Hasil follow-up 60 hari','select','Sembuh total|Sisa kelumpuhan|Meninggal|Tidak dapat dinilai|Belum dilakukan'],['finalClass','Klasifikasi akhir AFP','select','Non-polio AFP|Polio kompatibel|Polio|Discarded|Belum diklasifikasi']]},
  'rabies':{title:'Rabies/GHPR — Panel Prioritas',fields:[['animal','Jenis hewan','text'],['provoked','Gigitan provokatif','select','Ya|Tidak|Tidak diketahui'],['woundCategory','Kategori paparan luka','select','Risiko rendah|Risiko tinggi|Belum ditentukan'],['animalObservation','Hasil observasi hewan','select','Sehat selama observasi|Sakit|Mati|Tidak dapat diobservasi|Belum selesai'],['var','VAR diberikan','select','Ya lengkap|Ya belum lengkap|Tidak|Tidak diketahui'],['sar','SAR diberikan','select','Ya|Tidak|Tidak diindikasikan|Tidak diketahui'],['outcome','Outcome paparan','select','Selesai PEP|Masih PEP|Rujuk|Tidak diketahui']]},
  'leptospirosis':{title:'Leptospirosis — Panel Prioritas',fields:[['flood','Paparan banjir/genangan','select','Ya|Tidak|Tidak diketahui'],['animalRodent','Paparan tikus/hewan','select','Ya|Tidak|Tidak diketahui'],['renal','Gangguan ginjal','select','Ya|Tidak|Tidak dinilai'],['jaundice','Jaundis','select','Ya|Tidak|Tidak diketahui'],['specimen','Spesimen','select','Serum|Urin|Serum + urin|Tidak diambil'],['lab','Hasil pemeriksaan','text'],['classification','Klasifikasi akhir','select','Suspek|Probable|Konfirmasi|Bukan kasus|Belum diklasifikasi']]},
  'flu-burung':{title:'Avian Influenza — Panel Prioritas',fields:[['poultryContact','Kontak unggas sakit/mati','select','Ya|Tidak|Tidak diketahui'],['poultryActivity','Aktivitas paparan','select','Memegang|Menyembelih|Membersihkan kandang|Mengolah/konsumsi|Pasar unggas hidup|Lainnya'],['respSeverity','Keparahan respiratori','select','Ringan|Sedang|Berat|ARDS/critical|Tidak dinilai'],['isolation','Isolasi/tindakan pencegahan','select','Dilakukan|Belum dilakukan|Tidak relevan'],['specimen','Spesimen respiratori','select','Diambil|Tidak diambil|Direncanakan'],['lab','Hasil laboratorium','text'],['classification','Klasifikasi akhir','select','Suspek|Probable|Konfirmasi|Bukan kasus|Belum diklasifikasi']]},
  'keracunan-pangan':{title:'Keracunan Pangan — Panel Prioritas',fields:[['onsetMinutes','Jarak konsumsi–onset (jam)','number'],['syndrome','Sindrom dominan','select','Muntah dominan|Diare dominan|Diare + muntah|Neurologis|Demam dominan|Campuran|Belum jelas'],['dehydration','Dehidrasi','select','Tidak|Ringan|Sedang|Berat|Tidak dinilai'],['hospitalized','Rawat inap','select','Ya|Tidak|Tidak diketahui'],['specimenClinical','Spesimen klinis','text'],['specimenFood','Spesimen pangan/lingkungan','text'],['classification','Klasifikasi kejadian','select','KLB terkonfirmasi|KLB tersangka|Bukan KLB|Belum ditetapkan']]}
};
function priorityPanel(disease,data={},prefix='pe_'){
  const p=priorityClinicalEpi[disease];if(!p)return '';
  return `<div class="card" style="margin-top:10px;border-left:4px solid var(--primary,#1769aa)"><h4>🧬 ${escHtml(p.title)}</h4><p class="muted">Panel prioritas operasional. Isian ini melengkapi kuesioner penyakit dan tetap perlu divalidasi terhadap instrumen/pedoman resmi yang berlaku.</p>${p.fields.map(([k,l,t,opts])=>{const v=data[k]??'';return f(l,prefix+k,t,v,opts)}).join('')}</div>`;
}
function collectPriority(disease,prefix='pe_'){const p=priorityClinicalEpi[disease];if(!p)return null;const o={};p.fields.forEach(([k])=>{const v=val(prefix+k);o[k]=v===''?null:(/^number$/.test(p.fields.find(x=>x[0]===k)?.[2])?(Number(v)||null):v)});o._version='v35';o._disease=disease;return o}
function priorityReportHtml(d){const p=priorityClinicalEpi[d.o.disease],rows=p?.fields?.map(([k,l])=>{const vals=d.cs.map(c=>c.priority?.[k]).filter(v=>v!==undefined&&v!==null&&v!=='');const u=[...new Set(vals)];return `<tr><td>${escHtml(l)}</td><td>${u.length?u.map(v=>escHtml(v)).join(', '):'Belum diisi'}</td></tr>`}).join('');return p?`<div class="priority-report"><h4>3.6B Panel Klinis & Epidemiologi Prioritas — ${escHtml(p.title.replace(' — Panel Prioritas',''))}</h4><table class="report-table compact"><thead><tr><th>Variabel</th><th>Data tersedia</th></tr></thead><tbody>${rows}</tbody></table><p class="muted">Ringkasan ini merupakan agregasi data kasus yang tersedia. Klasifikasi akhir tetap mengikuti definisi kasus/pedoman yang berlaku dan penilaian tim investigasi.</p></div>`:''}

const conditionalRules={
'Campak':{'Status imunisasi MR/MMR':'Jika status imunisasi tidak lengkap/tidak diketahui → tampilkan jumlah dosis dan tanggal dosis terakhir'},
'DBD':{'Perdarahan':'Jika Ya → tampilkan lokasi dan jenis perdarahan'},
'Gigitan Hewan Penular Rabies/GHPR':{'Hewan dapat diobservasi':'Jika Ya → tampilkan hasil observasi hewan'},
'Tersangka Flu Burung/Avian Influenza':{'Kontak unggas sakit/mati':'Jika Ya → tampilkan jenis unggas, jumlah, aktivitas kontak dan lokasi paparan'},
'Mpox':{'Ruam/lesi kulit':'Jika Ya → tampilkan jumlah dan lokasi lesi'},
};
function diseaseOptions(){return Object.entries(diseases).map(([id,d])=>`<option value="${id}">${d.name} — ${d.group}</option>`).join('')}
function selectDisease(id){if(!diseases[id])return;db.selectedDisease=id;if(document.getElementById('disease'))document.getElementById('disease').value=id;if(document.getElementById('qDisease'))document.getElementById('qDisease').value=id;loadDiseaseQuestions();save()}
function loadDiseaseQuestions(){let id=val('qDisease')||db.selectedDisease||'campak';db.selectedDisease=id;let d=diseases[id];const general=baseQ.map(q=>buildQuestion(q[1],q[0]));const specific=d.q.map(x=>buildQuestion(x,'Spesifik — '+d.name));db.questions=[...general,...specific];db.questionMeta={disease:id,diseaseName:d.name,group:d.group,version:instrumentMeta.release,generalBasis:instrumentMeta.generalBasis,specificBasis:instrumentMeta.diseaseSpecificBasis,validationStatus:'Perlu validasi akhir sebelum digunakan sebagai formulir resmi',workflow:instrumentMeta.workflow};save();renderQ()}
function exportQuestionnaire(){let payload={app:'GORUT-OUTBREAK AI',instrument:instrumentMeta,disease:db.selectedDisease,meta:db.questionMeta,questions:db.questions,conditionalEngine:conditionalEngine.map(x=>({trigger:x.when.toString(),reveal:x.reveal.toString()}))};let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='kuesioner-'+db.selectedDisease+'.json';a.click()}
const save=()=>{localStorage.setItem(K,JSON.stringify(db));syncLocalDatabase()};const val=id=>document.getElementById(id)?.value||'';const act=()=>db.investigations.find(x=>x.id===db.active);
function login(){loginEl.style.display='none';app.style.display='block';render()}
function page(id,b){document.querySelectorAll('.page').forEach(x=>x.classList.remove('show'));document.getElementById(id).classList.add('show');document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));if(b)b.classList.add('active');title.textContent=id==='analisis'?'Analisis Epidemiologi':id[0].toUpperCase()+id.slice(1);render()}
function syncInvestigationType(){const type=val('inType');const d=document.getElementById('disease');const panel=document.getElementById('foodInvestigationPanel');if(type==='Keracunan Makanan'){if(d){d.value='keracunan-pangan';selectDisease('keracunan-pangan')}if(panel)panel.style.display='block'}else{if(panel)panel.style.display='none';if(d&&d.value==='keracunan-pangan'){d.value='campak';selectDisease('campak')}}}
function newKlb(){page('investigasi');['inName','kec','desa','pkm','tgl','foodEventName','foodEventDate','foodVenue','foodSource','foodMealTime','foodExposed','foodIll','foodDead','foodSuspected','foodHandler','foodWater','foodStorage','foodHypothesis'].forEach(x=>{const e=document.getElementById(x);if(e)e.value=''});const t=document.getElementById('inType');if(t)t.value='Penyakit Menular';syncInvestigationType();}
function saveKlb(){let o={id:Date.now(),name:val('inName')||'Investigasi Baru',type:val('inType'),disease:val('disease')||db.selectedDisease||'campak',prov:val('prov'),kab:val('kab'),kec:val('kec'),desa:val('desa'),pkm:val('pkm'),date:val('tgl')||new Date().toISOString().slice(0,10),status:'Berjalan'};if(o.type==='Keracunan Makanan'){o.disease='keracunan-pangan';o.foodInvestigation={eventName:val('foodEventName'),eventDate:val('foodEventDate'),venue:val('foodVenue'),foodSource:val('foodSource'),mealTime:val('foodMealTime'),exposed:+val('foodExposed')||0,ill:+val('foodIll')||0,dead:+val('foodDead')||0,suspectedFood:val('foodSuspected'),foodHandler:val('foodHandler'),waterSource:val('foodWater'),storage:val('foodStorage'),initialHypothesis:val('foodHypothesis')}}db.investigations.push(o);db.active=o.id;db.selectedDisease=o.disease;save();page('dashboard')}
function dash(){let q=val('search').toLowerCase(),t=val('typeFilter'),r=db.investigations.filter(x=>(!q||x.name.toLowerCase().includes(q))&&(!t||x.type===t));klbRows.innerHTML=r.map(x=>`<tr><td><b>${x.name}</b></td><td>${x.type}</td><td>${x.desa||'-'}, ${x.kec||'-'}</td><td>${db.cases.filter(c=>c.investigationId===x.id).length}</td><td>${x.status}</td><td><button onclick="openKlb(${x.id})">Buka</button></td></tr>`).join('')||'<tr><td colspan="6">Belum ada investigasi.</td></tr>';let cs=db.cases;stats.innerHTML=[['Investigasi',db.investigations.length],['Kasus',cs.length],['Konfirmasi',cs.filter(c=>c.status==='Konfirmasi').length],['Meninggal',cs.filter(c=>c.outcome==='Meninggal').length]].map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}
function openKlb(id){db.active=id;save();let o=act();inName.value=o.name||'';inType.value=o.type||'Penyakit Menular';disease.innerHTML=diseaseOptions();disease.value=o.disease||'campak';prov.value=o.prov||'';kab.value=o.kab||'';kec.value=o.kec||'';desa.value=o.desa||'';pkm.value=o.pkm||'';tgl.value=o.date||'';db.selectedDisease=o.disease||'campak';syncInvestigationType();if(o.type==='Keracunan Makanan'&&o.foodInvestigation){const f=o.foodInvestigation;[['foodEventName','eventName'],['foodEventDate','eventDate'],['foodVenue','venue'],['foodSource','foodSource'],['foodMealTime','mealTime'],['foodExposed','exposed'],['foodIll','ill'],['foodDead','dead'],['foodSuspected','suspectedFood'],['foodHandler','foodHandler'],['foodWater','waterSource'],['foodStorage','storage'],['foodHypothesis','initialHypothesis']].forEach(([id,k])=>{const e=document.getElementById(id);if(e)e.value=f[k]??''})}page('investigasi')}
function addCase(){if(!act())return alert('Pilih investigasi terlebih dahulu.');const food=act().disease==='keracunan-pangan';const diseaseId=act().disease;const extraPriority=priorityPanel(diseaseId,{});const extra=(food?`<div class="card" style="margin-top:10px"><h4>🍱 Detail Kasus Keracunan Pangan</h4>${f('Makanan/minuman dikonsumsi','caseFood','text','')}${f('Waktu konsumsi','caseConsumedAt','datetime-local','')}${f('Waktu onset','caseOnsetTime','datetime-local','')}${f('Masa inkubasi (jam)','caseIncubation','number','')}${f('Gejala utama','caseSymptoms','text','')}${f('Sumber pangan','caseFoodSource','text','')}${f('Dirawat inap?','caseHospitalized','select','Tidak|Ya')}${f('Spesimen klinis','caseClinicalSpecimen','text','')}</div>`:'')+extraPriority;modal(`<h2>Tambah Kasus</h2>${f('ID','cid','text','K'+String(db.cases.length+1).padStart(3,'0'))}${f('Nama','cn','text','')}${f('Umur','ca','number','')}${f('Jenis kelamin','cs','select','Laki-laki|Perempuan')}${f('Onset','co',food?'datetime-local':'date','')}${f('Status','ct','select','Suspek|Probable|Konfirmasi')}${f('Outcome','cu','select','Rawat jalan|Dirawat|Sembuh|Meninggal')}${extra}<button class="primary" onclick="saveCase()">Simpan</button>`)}
function f(l,id,t,v,opts){return `<div class="field"><label>${l}</label>${t==='select'?`<select id="${id}">${(opts||v||'').split('|').map(x=>`<option ${String(x)===String(v)?'selected':''}>${x}</option>`).join('')}</select>`:`<input id="${id}" type="${t}" value="${escHtml(v??'')}">`}</div>`}
function saveCase(){const food=act()?.disease==='keracunan-pangan';const c={id:val('cid'),name:val('cn'),age:+val('ca')||0,sex:val('cs'),onset:val('co'),status:val('ct'),outcome:val('cu'),lat:+val('clat')||null,lng:+val('clng')||null,investigationId:db.active,createdAt:new Date().toISOString()};if(food)c.foodCase={food:val('caseFood'),consumedAt:val('caseConsumedAt'),onsetAt:val('caseOnsetTime'),incubationHours:+val('caseIncubation')||null,symptoms:(val('caseMainSymptoms')||val('caseSymptoms')),foodSource:val('caseFoodSource'),hospitalized:val('caseHospitalized'),clinicalSpecimen:val('caseClinicalSpecimen')};const priority=collectPriority(act()?.disease);if(priority)c.priority=priority;db.cases.push(c);queueSync('cases');save();close();render()}
function cases(){let q=val('caseSearch').toLowerCase(),r=db.cases.filter(c=>(!db.active||c.investigationId===db.active)&&(!q||`${c.id} ${c.name}`.toLowerCase().includes(q)));caseRows.innerHTML=r.map(c=>`<tr><td>${esc(c.id)}</td><td>${esc(c.name)}</td><td>${esc(c.age)}</td><td>${esc(c.sex)}</td><td>${esc(c.onset||'-')}</td><td><span class="badge">${esc(c.status)}</span></td><td>${esc(c.outcome||'-')}</td><td><button onclick="editCase('${esc(c.id)}')">Edit</button> <button class="danger" data-v30-delete onclick="deleteRecord('cases','${esc(c.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="8">Belum ada kasus.</td></tr>'}
function editCase(id){let c=db.cases.find(x=>String(x.id)===String(id));if(!c)return;const food=act()?.disease==='keracunan-pangan';const diseaseId=act()?.disease;const fc=c.foodCase||{};const extraPriority=priorityPanel(diseaseId,c.priority||{});const extra=(food?`<div class="card" style="margin-top:10px"><h4>🍱 Detail Kasus Keracunan Pangan</h4>${f('Makanan/minuman dikonsumsi','caseFood','text',fc.food||fc.exposureFood||'')}${f('Waktu konsumsi','caseConsumedAt','datetime-local',fc.consumedAt||'')}${f('Waktu onset','caseOnsetTime','datetime-local',fc.onsetAt||fc.onsetTime||'')}${f('Masa inkubasi (jam)','caseIncubation','number',fc.incubationHours??'')}${f('Gejala utama','caseSymptoms','text',fc.symptoms||'')}${f('Sumber pangan','caseFoodSource','text',fc.foodSource||fc.source||'')}${f('Dirawat inap?','caseHospitalized','select','Tidak|Ya')}${f('Spesimen klinis','caseClinicalSpecimen','text',fc.clinicalSpecimen||fc.specimenClinical||'')}</div>`:'')+extraPriority;modal(`<h2>Edit ${esc(c.id)}</h2>${f('Nama','en','text',c.name)}${f('Umur','ea','number',c.age)}${f('Jenis kelamin','es','select','Laki-laki|Perempuan')}${f('Onset','eo',food?'datetime-local':'date',c.onset)}${f('Status','et','select','Suspek|Probable|Konfirmasi')}${f('Outcome','eu','select','Rawat jalan|Dirawat|Sembuh|Meninggal')}${extra}<button class="primary" onclick="upd('${esc(c.id)}')">Simpan</button>`);es.value=c.sex||'';et.value=c.status||'Suspek';eu.value=c.outcome||'';if(food)caseHospitalized.value=fc.hospitalized||'Tidak'}
function upd(id){let c=db.cases.find(x=>String(x.id)===String(id));if(!c)return;Object.assign(c,{name:val('en'),age:+val('ea')||0,sex:val('es')||c.sex,onset:val('eo'),status:val('et'),outcome:val('eu')});if(act()?.disease==='keracunan-pangan'){c.foodCase={food:val('caseFood'),consumedAt:val('caseConsumedAt'),onsetAt:val('caseOnsetTime'),incubationHours:+val('caseIncubation')||null,symptoms:(val('caseMainSymptoms')||val('caseSymptoms')),foodSource:val('caseFoodSource'),hospitalized:val('caseHospitalized'),clinicalSpecimen:val('caseClinicalSpecimen')}}const priority=collectPriority(act()?.disease);if(priority)c.priority=priority;save();close();render()}
function inputFor(q,i){let meta=fieldMeta[q.label]||q;if(q.type==='choice'||meta.type==='choice'){return `<select id="fq_${i}"><option value="">Pilih...</option>${(q.options||meta.options||[]).map(o=>`<option>${o}</option>`).join('')}</select>`}if(q.type==='textarea')return `<textarea id="fq_${i}" rows="2"></textarea>`;return `<input id="fq_${i}" type="${q.type==='number'?'number':q.type==='date'?'date':'text'}">`}
function renderQ(){
  let qs=db.questions||[];
  if(document.getElementById('qDisease')){qDisease.innerHTML=diseaseOptions();qDisease.value=db.selectedDisease||'campak'}
  bankEl.innerHTML=qs.length?qs.map((q,i)=>`<label style="display:block;margin:7px"><input type="checkbox" checked onchange="toggleQ(${i},this.checked)"> <b>${q.cat}</b> — ${q.label} <small style="opacity:.65">[${q.type}]</small></label>`).join(''):'<p>Belum ada modul penyakit dimuat.</p>';
  const d=diseases[db.selectedDisease||'campak'];
  const rules=conditionalEngine.filter(r=>qs.some(q=>r.when.test(q.label))).map(r=>`<div class="notice">Logika bersyarat: bila pertanyaan pemicu terisi/bernilai relevan, pertanyaan lanjutan akan ditampilkan.</div>`).join('');
  const head=qs.length?`<div class="notice"><b>${d?.name||''}</b><br>Kelompok: ${d?.group||''}<br>Basis umum: ${instrumentMeta.generalBasis}<br>Basis spesifik: ${instrumentMeta.diseaseSpecificBasis}<br><b>Status:</b> instrumen perlu validasi akhir oleh pemegang program sebelum penggunaan resmi.</div>`:'';
  preview.innerHTML=(head+rules)+(qs.length?qs.map((q,i)=>`<div class="field" data-qid="${q.id}"><label>${i+1}. ${q.label}${q.required?' *':''}</label>${inputFor(q,i)}<small style="display:block;opacity:.6">Domain: ${q.cat} · Versi: ${q.version||instrumentMeta.release}</small></div>`).join(''):'<p>Belum ada pertanyaan dipilih.</p>');
}
function toggleQ(i,on){let qs=db.questions;if(!qs[i])return; if(!on)qs.splice(i,1);save();renderQ()}
function customQ(){modal(`<h2>Pertanyaan Kustom</h2>${f('Kategori','qc','text','PE')}${f('Pertanyaan','ql','text','')}${f('Tipe','qt','select','text|number|date|choice')}${f('Pilihan','qo','text','Ya|Tidak')}<button class="primary" onclick="saveCustom()">Tambah</button>`)}
function saveCustom(){db.questions.push({cat:val('qc'),label:val('ql'),type:val('qt')});save();close();renderQ()}
function saveQ(){save();alert('Kuesioner tersimpan.')}
function publicQ(){let id=act()?.id||'demo';let slug='survey-'+id+'-'+(db.selectedDisease||'campak');modal(`<h2>Kuesioner Publik</h2><div class="notice"><b>Mode prototype:</b> tautan publik belum tersambung ke server. Slug investigasi: <code>${slug}</code><br><br>Pada versi produksi slug ini menjadi URL publik + QR, tanpa login responden, dan setiap kiriman masuk otomatis ke line listing.</div><button onclick="close()">Tutup</button>`)}
function analysis(x){['epi','demo','biv','ai'].forEach(i=>document.getElementById(i).style.display=i===x?'block':'none');if(x==='epi')chart();if(x==='demo')demo();if(x==='biv')renderBivControls();}
function renderBivControls(){const r=document.getElementById('statResult');if(r)r.innerHTML='Siap menghitung tabel 2×2 dari data kasus investigasi aktif. Pilih outcome dan paparan, lalu tekan <b>Hitung</b>.'}
function currentCases(){return db.cases.filter(c=>String(c.investigationId)===String(db.active));}
function exposureValue(c,key){if(key==='contact')return (db.contacts||[]).some(x=>String(x.investigationId)===String(db.active)&&String(x.caseId)===String(c.id));if(key==='male')return String(c.sex||'').toLowerCase().startsWith('l');return Boolean(c[key]);}
function outcomeValue(c,key){if(key==='status')return c.status==='Konfirmasi';if(key==='outcome')return c.outcome==='Meninggal';return Boolean(c[key]);}
function ln(x){return Math.log(x)}
function invNorm95(){return 1.959963984540054}
function chiSquareP1df(x){if(!isFinite(x)||x<0)return NaN;const z=Math.sqrt(x);return Math.erf?1-Math.erf(z/Math.sqrt(2)):erfcApprox(z/Math.sqrt(2));}
function erfcApprox(x){const t=1/(1+0.3275911*x),a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429;const y=1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);return y}
function continuityTable(cs,ok,ek){let a=0,b=0,c=0,d=0;cs.forEach(x=>{const e=exposureValue(x,ek),o=outcomeValue(x,ok);if(e&&o)a++;else if(e&&!o)b++;else if(!e&&o)c++;else d++;});return {a,b,c,d,n:cs.length}}
function safeRR(t){const {a,b,c,d}=t;const r1=(a+b)?a/(a+b):NaN,r0=(c+d)?c/(c+d):NaN;return r0===0?Infinity:r1/r0}
function safeOR(t){const {a,b,c,d}=t;return (b*c)===0?(a*d===0?NaN:Infinity):(a*d)/(b*c)}
function ciLogRatio(est,se){if(!isFinite(est)||est<=0||!isFinite(se))return [NaN,NaN];const z=invNorm95(),l=ln(est);return [Math.exp(l-z*se),Math.exp(l+z*se)]}
function runStats(){const cs=currentCases();const ok=document.getElementById('statOutcome')?.value||'status',ek=document.getElementById('statExposure')?.value||'contact';if(!cs.length){statResult.innerHTML='<b>Tidak ada kasus</b> pada investigasi aktif.';return}const t=continuityTable(cs,ok,ek);const rr=safeRR(t),or=safeOR(t);let rrse,orse,rrci,orci;if(t.a&&t.c&&t.a+t.b&&t.c+t.d)rrse=Math.sqrt((1/t.a)-(1/(t.a+t.b))+(1/t.c)-(1/(t.c+t.d)));if(t.a&&t.b&&t.c&&t.d)orse=Math.sqrt(1/t.a+1/t.b+1/t.c+1/t.d);rrci=ciLogRatio(rr,rrse);orci=ciLogRatio(or,orse);const denom=(t.a+t.b)*(t.c+t.d)*(t.a+t.c)*(t.b+t.d);const chi=denom?((t.a*t.d-t.b*t.c)**2*t.n)/denom:NaN;const p=chiSquareP1df(chi);window.lastStats={investigationId:db.active,outcome:ok,exposure:ek,table:t,RR:rr,RR_CI95:rrci,OR:or,OR_CI95:orci,chiSquare:chi,pValue:p,calculatedAt:new Date().toISOString()};statResult.innerHTML=`<h3>Hasil analisis 2×2</h3><table><tr><th></th><th>Outcome +</th><th>Outcome −</th><th>Total</th></tr><tr><th>Paparan +</th><td>${t.a}</td><td>${t.b}</td><td>${t.a+t.b}</td></tr><tr><th>Paparan −</th><td>${t.c}</td><td>${t.d}</td><td>${t.c+t.d}</td></tr></table><div class="grid"><div class="stat"><small>RR</small><b>${fmtStat(rr)}</b></div><div class="stat"><small>95% CI RR</small><b>${fmtCI(rrci)}</b></div><div class="stat"><small>OR</small><b>${fmtStat(or)}</b></div><div class="stat"><small>95% CI OR</small><b>${fmtCI(orci)}</b></div><div class="stat"><small>Chi-square</small><b>${fmtStat(chi)}</b></div><div class="stat"><small>p-value</small><b>${fmtP(p)}</b></div></div><div class="notice">Perhitungan menggunakan tabel 2×2 dan pendekatan Chi-square 1 df. Nilai CI dapat tidak tersedia pada sel nol; untuk analisis resmi pertimbangkan metode exact/continuity correction dan validasi statistik.</div>`}
function fmtStat(x){return isFinite(x)?(Math.abs(x)>=100?x.toExponential(3):x.toFixed(3)):'NA'}
function fmtP(x){return isFinite(x)?(x<0.001?'<0.001':x.toFixed(4)):'NA'}
function fmtCI(x){return x&&isFinite(x[0])&&isFinite(x[1])?`${x[0].toFixed(3)} – ${x[1].toFixed(3)}`:'NA'}
function runAdvancedEpiV52(){
 const el=document.getElementById('v52AdvancedResult'); if(!el)return;
 const cs=currentCases(); const o=act();
 if(!o){el.innerHTML='<div class="notice">Pilih investigasi aktif terlebih dahulu.</div>';return;}
 const total=cs.length, dead=cs.filter(c=>/meninggal/i.test(String(c.outcome||''))).length;
 const conf=cs.filter(c=>/konfirmasi|confirmed/i.test(String(c.status||''))).length;
 const prob=cs.filter(c=>/probable/i.test(String(c.status||''))).length;
 const withOnset=cs.filter(c=>c.onset).length;
 const geo=cs.filter(c=>Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lng))).length;
 const cfr=total?dead/total*100:null;
 const bySex={}; cs.forEach(c=>{const k=String(c.sex||c.jk||'Tidak diketahui');bySex[k]=(bySex[k]||0)+1});
 const ageGroup=v=>{const n=Number(v);if(!Number.isFinite(n))return 'Tidak diketahui';if(n<1)return '<1 tahun';if(n<5)return '1–4';if(n<15)return '5–14';if(n<25)return '15–24';if(n<45)return '25–44';if(n<65)return '45–64';return '≥65'};
 const byAge={}; cs.forEach(c=>{const k=ageGroup(c.age);byAge[k]=(byAge[k]||0)+1});
 const byDate={};cs.filter(c=>c.onset).forEach(c=>{const k=String(c.onset).slice(0,10);byDate[k]=(byDate[k]||0)+1});
 const dates=Object.keys(byDate).sort(); const peak=dates.length?dates.reduce((a,b)=>byDate[b]>byDate[a]?b:a):null;
 const days=dates.length>1?Math.max(1,(new Date(dates.at(-1))-new Date(dates[0]))/86400000+1):dates.length;
 const avgPerOnsetDay=withOnset&&days?withOnset/days:null;
 const sexRows=Object.entries(bySex).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v}</td><td>${total?(v/total*100).toFixed(1):'—'}%</td></tr>`).join('')||'<tr><td colspan="3">Tidak ada data</td></tr>';
 const ageOrder=['<1 tahun','1–4','5–14','15–24','25–44','45–64','≥65','Tidak diketahui'];
 const ageRows=ageOrder.filter(k=>byAge[k]).map(k=>`<tr><td>${k}</td><td>${byAge[k]}</td><td>${total?(byAge[k]/total*100).toFixed(1):'—'}%</td></tr>`).join('')||'<tr><td colspan="3">Tidak ada data umur</td></tr>';
 const epi=dates.map(d=>`<div class="epi-col"><span class="epi-count">${byDate[d]}</span><div class="epi-bar" style="height:${Math.max(4,byDate[d]/Math.max(...dates.map(x=>byDate[x]))*180)}px"></div><span class="epi-date">${d}</span></div>`).join('');
 const result={version:'v52',investigationId:db.active,disease:o.disease,total,confirmed:conf,probable:prob,deaths:dead,CFR_percent:cfr,onsetCoverage_percent:total?withOnset/total*100:null,coordinateCoverage_percent:total?geo/total*100:null,peakOnset:peak,peakCases:peak?byDate[peak]:null,observedOnsetDays:days,meanCasesPerOnsetDay:avgPerOnsetDay,ageDistribution:byAge,sexDistribution:bySex,calculatedAt:new Date().toISOString()};
 window.V52_AdvancedEpi=result;
 el.innerHTML=`<div class="grid"><div class="stat"><small>Total kasus</small><b>${total}</b></div><div class="stat"><small>Konfirmasi</small><b>${conf}</b></div><div class="stat"><small>Probable</small><b>${prob}</b></div><div class="stat"><small>Meninggal</small><b>${dead}</b></div><div class="stat"><small>CFR</small><b>${cfr===null?'—':cfr.toFixed(1)+'%'}</b></div><div class="stat"><small>Kelengkapan onset</small><b>${total?(withOnset/total*100).toFixed(1):'0'}%</b></div><div class="stat"><small>Kelengkapan koordinat</small><b>${total?(geo/total*100).toFixed(1):'0'}%</b></div><div class="stat"><small>Puncak onset</small><b>${peak||'—'}</b></div></div>
 <div class="grid2"><div class="chart-box"><h4>⏱️ Kurva Epidemi</h4>${dates.length?`<div class="epi-chart">${epi}</div>`:'<div class="notice">Belum tersedia tanggal onset.</div>'}<div class="small">Rata-rata kasus per hari observasi: ${avgPerOnsetDay===null?'—':avgPerOnsetDay.toFixed(2)}</div></div><div class="chart-box"><h4>⚠️ Interpretasi Otomatis</h4><ul><li>Puncak onset: <b>${peak||'belum dapat ditentukan'}</b>${peak?` dengan ${byDate[peak]} kasus`:''}.</li><li>CFR: <b>${cfr===null?'belum dapat dihitung':cfr.toFixed(1)+'%'}</b>.</li><li>${withOnset}/${total} kasus memiliki onset; ${geo}/${total} memiliki koordinat.</li><li>Hasil ini bersifat deskriptif dan tidak menetapkan KLB secara otomatis.</li></ul></div></div>
 <div class="grid2"><div class="chart-box"><h4>⚥ Distribusi Jenis Kelamin</h4><table><thead><tr><th>Kelompok</th><th>n</th><th>%</th></tr></thead><tbody>${sexRows}</tbody></table></div><div class="chart-box"><h4>👤 Distribusi Umur</h4><table><thead><tr><th>Kelompok umur</th><th>n</th><th>%</th></tr></thead><tbody>${ageRows}</tbody></table></div></div>
 <div class="notice"><b>Catatan metodologis:</b> CFR hanya menggunakan denominator seluruh kasus pada investigasi aktif. Attack Rate/IR memerlukan denominator populasi atau jumlah terpapar yang valid. RR/OR dan p-value harus mengikuti desain penelitian serta definisi exposure/outcome yang ditetapkan.</div>`;
}
function exportAdvancedEpiV52(){if(!window.V52_AdvancedEpi)return alert('Jalankan analisis v52 terlebih dahulu.');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(window.V52_AdvancedEpi,null,2)],{type:'application/json'}));a.download='GORUT-v52-advanced-epidemiology.json';a.click()}
function exportStats(){if(!window.lastStats)return alert('Jalankan analisis terlebih dahulu.');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(window.lastStats,null,2)],{type:'application/json'}));a.download='analisis-epidemiologi-2x2.json';a.click()}
function ai(){const cs=currentCases(),o=act(),contacts=(db.contacts||[]).filter(x=>String(x.investigationId)===String(db.active)),spec=(db.specimens||[]).filter(x=>String(x.investigationId)===String(db.active)),vis=(db.fieldVisits||[]).filter(x=>String(x.investigationId)===String(db.active));if(!o){aiResult.innerHTML='<div class="notice">Pilih investigasi aktif.</div>';return}const conf=cs.filter(c=>c.status==='Konfirmasi').length,prob=cs.filter(c=>c.status==='Probable').length,dead=cs.filter(c=>c.outcome==='Meninggal').length,withOnset=cs.filter(c=>c.onset).length,geo=cs.filter(c=>c.lat&&c.lng).length,labDone=spec.filter(s=>s.result).length;const byDate={};cs.filter(c=>c.onset).forEach(c=>byDate[c.onset]=(byDate[c.onset]||0)+1);const peak=Object.entries(byDate).sort((a,b)=>b[1]-a[1])[0];const flags=[];if(cs.length&&!withOnset)flags.push('tanggal onset belum tersedia pada seluruh kasus');if(cs.length&&geo<cs.length)flags.push(`${cs.length-geo} kasus belum memiliki koordinat`);if(spec.length&&labDone<spec.length)flags.push(`${spec.length-labDone} spesimen belum memiliki hasil`);if(contacts.length===0)flags.push('belum ada data kontak pada investigasi');if(vis.length===0)flags.push('belum ada kunjungan lapangan tercatat');const context=(document.getElementById('aiContext')?.value||'').trim();aiResult.innerHTML=`<h3>AI Epidemiologist — Draft Analisis</h3><p><b>Investigasi:</b> ${esc(o.name)} · <b>Penyakit:</b> ${esc(diseases[o.disease]?.name||o.disease||'-')}</p><div class="grid"><div class="stat"><small>Total kasus</small><b>${cs.length}</b></div><div class="stat"><small>Konfirmasi</small><b>${conf}</b></div><div class="stat"><small>Probable</small><b>${prob}</b></div><div class="stat"><small>Meninggal</small><b>${dead}</b></div><div class="stat"><small>Kontak</small><b>${contacts.length}</b></div><div class="stat"><small>Spesimen</small><b>${spec.length}</b></div></div><h4>Temuan otomatis</h4><ul><li>${peak?`Tanggal onset dengan frekuensi tertinggi: <b>${esc(peak[0])}</b> (${peak[1]} kasus).`:'Belum dapat menentukan puncak berdasarkan onset.'}</li><li>${geo}/${cs.length||0} kasus memiliki koordinat.</li><li>${labDone}/${spec.length||0} spesimen memiliki hasil.</li></ul>${flags.length?`<div class="notice"><b>Kesenjangan data:</b><ul>${flags.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:'<div class="notice">Tidak ditemukan kekosongan data utama dari indikator yang diperiksa.</div>'}${context?`<div class="notice"><b>Konteks investigator:</b> ${esc(context)}</div>`:''}<h4>Langkah analisis yang disarankan</h4><ol><li>Validasi definisi kasus dan tanggal onset.</li><li>Bandingkan distribusi orang–tempat–waktu dengan sumber paparan.</li><li>Tinjau hubungan kontak dan kemungkinan rantai penularan.</li><li>Padankan hasil laboratorium dengan klasifikasi kasus.</li><li>Gunakan analisis 2×2/regresi hanya setelah variabel dan desain studi ditetapkan.</li></ol><p><b>Catatan:</b> ini adalah draft berbantuan aturan/data lokal, bukan diagnosis atau kesimpulan KLB otomatis. Validasi epidemiolog tetap diperlukan.</p>`}
function reportData(){
 const o=act()||{};
 const cs=currentCases();
 const contacts=(db.contacts||[]).filter(x=>String(x.investigationId)===String(db.active));
 const specs=(db.specimens||[]).filter(x=>String(x.investigationId)===String(db.active));
 const visits=(db.fieldVisits||[]).filter(x=>String(x.investigationId)===String(db.active));
 const dead=cs.filter(c=>c.outcome==='Meninggal').length;
 const conf=cs.filter(c=>c.status==='Konfirmasi').length;
 const prob=cs.filter(c=>c.status==='Probable').length;
 const susp=cs.filter(c=>c.status==='Suspek').length;
 const byDate={}; cs.filter(c=>c.onset).forEach(c=>{byDate[c.onset]=(byDate[c.onset]||0)+1});
 const dates=Object.keys(byDate).sort();
 const peak=Object.entries(byDate).sort((a,b)=>b[1]-a[1])[0];
 const rep={
   no:val('repNo')||'-', start:val('repStart')||o.date||'-', date:val('repDate')||new Date().toISOString().slice(0,10),
   status:val('repStatus')||'Dalam penyelidikan', design:val('repDesign')||'Deskriptif dan analitik', team:val('repTeam')||'-',
   background:val('repBackground').trim(), caseDef:val('repCaseDef').trim(), methods:val('repMethods').trim(),
   etiology:val('repEtiology').trim(), discussion:val('repDiscussion').trim(), recommendations:val('repRecommendations').trim(),
   knownBy:val('repKnownBy')||'', knownTitle:val('repKnownTitle')||'', teamTitle:val('repTeamTitle')||'Ketua Tim Investigasi', teamName:val('repTeamName')||val('repTeam')||''
 };
 return {o,cs,contacts,specs,visits,dead,conf,prob,susp,byDate,dates,peak,rep};
}
function saveReportDraft(){
 if(!db.reportMeta)db.reportMeta={};
 db.reportMeta[db.active]={repNo:val('repNo'),repStart:val('repStart'),repDate:val('repDate'),repStatus:val('repStatus'),repDesign:val('repDesign'),repTeam:val('repTeam'),repBackground:val('repBackground'),repCaseDef:val('repCaseDef'),repMethods:val('repMethods'),repEtiology:val('repEtiology'),repDiscussion:val('repDiscussion'),repRecommendations:val('repRecommendations'),repKnownBy:val('repKnownBy'),repKnownTitle:val('repKnownTitle'),repTeamTitle:val('repTeamTitle'),repTeamName:val('repTeamName')};
 save(); alert('Draft laporan tersimpan untuk investigasi aktif.');
}
function loadReportDraft(){
 const m=(db.reportMeta||{})[db.active]||{}; const o=act()||{};
 const set=(id,v)=>{const e=document.getElementById(id);if(e&&v!==undefined)e.value=v};
 set('repNo',m.repNo||'');set('repStart',m.repStart||o.date||'');set('repDate',m.repDate||new Date().toISOString().slice(0,10));set('repStatus',m.repStatus||'Dalam penyelidikan');set('repDesign',m.repDesign||'Deskriptif dan analitik');set('repTeam',m.repTeam||'');set('repBackground',m.repBackground||'');set('repCaseDef',m.repCaseDef||'');set('repMethods',m.repMethods||'');set('repEtiology',m.repEtiology||'');set('repDiscussion',m.repDiscussion||'');set('repRecommendations',m.repRecommendations||'');set('repKnownBy',m.repKnownBy||'');set('repKnownTitle',m.repKnownTitle||'');set('repTeamTitle',m.repTeamTitle||'Ketua Tim Investigasi');set('repTeamName',m.repTeamName||m.repTeam||'');
}
function escHtml(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function pct(n,d){return d?((n/d)*100).toFixed(1)+'%':'—'}
function ageGroup(a){a=Number(a);if(!Number.isFinite(a))return 'Tidak diketahui';if(a<1)return '<1 tahun';if(a<=4)return '1–4 tahun';if(a<=14)return '5–14 tahun';if(a<=24)return '15–24 tahun';if(a<=44)return '25–44 tahun';if(a<=64)return '45–64 tahun';return '≥65 tahun'}
function donut(label,counts,total){const entries=Object.entries(counts).filter(x=>x[1]>0);const sum=entries.reduce((a,x)=>a+x[1],0)||1;let acc=0;const seg=entries.map(([k,v])=>{const a=acc/sum*360,b=(acc+v)/sum*360;acc+=v;return `${['#0a9f6e','#1769aa','#f0ad00','#d64545','#7a5af8','#64748b'][entries.indexOf([k,v])%6]} ${a}deg ${b}deg`}).join(',');return `<div class="donut-card"><div class="donut" style="background:conic-gradient(${seg||'#d9dee5 0 360deg'})"><div>${total}</div></div><b>${escHtml(label)}</b><div class="donut-legend">${entries.map(([k,v])=>`<span><i></i>${escHtml(k)} ${pct(v,total)}</span>`).join('')||'<span>Belum ada data</span>'}</div></div>`}
function demographicsHtml(cs){
 const sex={};cs.forEach(c=>sex[c.sex||'Tidak diketahui']=(sex[c.sex||'Tidak diketahui']||0)+1);
 const age={};cs.forEach(c=>{const g=ageGroup(c.age);age[g]=(age[g]||0)+1});
 const job={};cs.forEach(c=>{const g=c.job||c.pekerjaan||'Belum diisi';job[g]=(job[g]||0)+1});
 const village={};cs.forEach(c=>{const g=c.desa||c.village||act()?.desa||'Belum diisi';village[g]=(village[g]||0)+1});
 return `<div class="donut-grid">${donut('Kelompok Umur',age,cs.length)}${donut('Jenis Kelamin',sex,cs.length)}${donut('Pekerjaan',job,cs.length)}${donut('Desa/Kelurahan',village,cs.length)}</div>`;
}
function personTableHtml(cs){
 const vars=[['Jenis Kelamin',c=>c.sex||'Belum diisi'],['Pekerjaan',c=>c.job||c.pekerjaan||'Belum diisi'],['Tempat Tinggal',c=>c.kec||act()?.kec||'Belum diisi'],['Desa/Kelurahan',c=>c.desa||act()?.desa||'Belum diisi'],['Nomor Indeks Kasus',c=>c.id||'Belum diisi'],['Status Kasus',c=>c.status||'Belum diisi'],['Tempat Outbreak',c=>c.outbreakPlace||'Belum diisi'],['Alasan Tidak Dirawat',c=>c.notAdmittedReason||'Belum diisi'],['Pengobatan Diberikan',c=>c.treatment||'Belum diisi'],['Spesimen & Hasil',c=>c.specimenResult||'Belum diisi'],['Diduga Tertular Dari',c=>c.source||'Belum diisi'],['Diduga Akan Menularkan Kepada',c=>c.potentialContacts||'Belum diisi']];
 let rows='';for(const [label,fn] of vars){const vals=cs.map(fn);const uniq=[...new Set(vals)];rows+=`<tr class="group"><th colspan="6">${escHtml(label)}</th></tr>`;uniq.forEach(v=>{const n=vals.filter(x=>x===v).length;rows+=`<tr><td>${escHtml(v)}</td><td>${n}</td><td>${n}</td><td>—</td><td>${n}</td><td>${pct(n,cs.length)}</td></tr>`})}
 return `<table class="report-table"><thead><tr><th>Variabel</th><th>Frekuensi</th><th>Sakit</th><th>Tidak Sakit</th><th>Total</th><th>Persentase</th></tr></thead><tbody>${rows||'<tr><td colspan="6">Belum ada data kasus.</td></tr>'}</tbody></table><p class="muted">Catatan: kolom “Tidak Sakit” hanya diisi bila denominator populasi/kelompok tidak sakit tersedia. Tanda “—” berarti data tersebut belum tersedia dalam aplikasi.</p>`;
}
function epiCurveHtml(d){
 const max=Math.max(...Object.values(d.byDate),1);const bars=d.dates.length?d.dates.map(x=>`<div class="epi-col"><div class="epi-count">${d.byDate[x]}</div><div class="epi-bar" style="height:${Math.max(8,(d.byDate[x]/max)*190)}px"></div><div class="epi-date">${escHtml(x)}</div></div>`).join(''):'<div class="notice">Belum ada tanggal onset yang dapat diplot.</div>';
 return `<div class="chart-box"><h4>Kurva Epidemi</h4><p class="muted">Sumbu-X menunjukkan tanggal onset yang tersedia; sumbu-Y menunjukkan jumlah kasus per tanggal. Interpretasi pola outbreak memerlukan data onset dan informasi masa inkubasi yang memadai.</p><div class="epi-chart">${bars}</div>${d.peak?`<p><b>Puncak frekuensi onset:</b> ${escHtml(d.peak[0])} (${d.peak[1]} kasus).</p>`:''}</div>`;
}
function placeHtml(d){
 const cs=d.cs;const loc={};cs.forEach(c=>{const k=c.desa||c.village||d.o.desa||'Belum diisi';loc[k]=(loc[k]||0)+1});
 const rows=Object.entries(loc).map(([k,v])=>`<tr><td>${escHtml(k)}</td><td>${v}</td><td>${pct(v,cs.length)}</td></tr>`).join('');
 const geo=cs.filter(c=>c.lat&&c.lng);return `<table class="report-table"><thead><tr><th>Lokasi</th><th>Kasus</th><th>Persentase</th></tr></thead><tbody>${rows||'<tr><td colspan="3">Belum ada data lokasi.</td></tr>'}</tbody></table><p>Kasus dengan koordinat: <b>${geo.length}</b> dari <b>${cs.length}</b>. Peta titik kasus dapat dilihat pada modul GIS dan dapat dilampirkan saat laporan final.</p>`;
}
function analyticHtml(d){
 const st=window.lastStats&&String(window.lastStats.investigationId)===String(db.active)?window.lastStats:null;
 if(!st)return `<div class="notice">Belum ada analisis bivariat tersimpan untuk investigasi ini. Jalankan analisis pada menu Analisis Epidemiologi sebelum menerbitkan laporan.</div>`;
 const t=st.table;return `<table class="report-table"><thead><tr><th></th><th>Outcome +</th><th>Outcome −</th><th>Total</th></tr></thead><tbody><tr><th>Paparan +</th><td>${t.a}</td><td>${t.b}</td><td>${t.a+t.b}</td></tr><tr><th>Paparan −</th><td>${t.c}</td><td>${t.d}</td><td>${t.c+t.d}</td></tr></tbody></table><p><b>RR:</b> ${fmtStat(st.RR)} (95% CI ${fmtCI(st.RR_CI95)}) &nbsp; <b>OR:</b> ${fmtStat(st.OR)} (95% CI ${fmtCI(st.OR_CI95)}) &nbsp; <b>Chi-square:</b> ${fmtStat(st.chiSquare)} &nbsp; <b>p:</b> ${fmtP(st.pValue)}</p><p class="muted">Interpretasi statistik harus disesuaikan dengan desain studi, definisi paparan/outcome, ukuran populasi, dan metode yang tepat. Modul ini merupakan alat bantu dan bukan pengganti validasi statistik.</p>`;
}
function foodDataQuality(fi,cs){const exposed=Number(fi.exposed)||0,ill=Number(fi.ill)||cs.length,dead=Number(fi.dead)||0;const issues=[];if(exposed&&ill>exposed)issues.push('Jumlah sakit melebihi jumlah terpapar. Periksa kembali denominator.');if(dead>ill)issues.push('Jumlah meninggal melebihi jumlah sakit. Periksa kembali data.');if(!exposed&&ill>0)issues.push('Jumlah terpapar belum diisi; Attack Rate tidak dapat dihitung secara valid.');return issues;}
function foodPoisoningHtml(d){if(d.o.disease!=='keracunan-pangan')return '';const fi=d.o.foodInvestigation||{};const exposed=Number(fi.exposed)||0,ill=Number(fi.ill)||d.cs.length,dead=Number(fi.dead)||d.dead;const ar=(exposed&&ill<=exposed)?((ill/exposed)*100).toFixed(1)+'%':'—';const quality=foodDataQuality(fi,d.cs);const qualityHtml=quality.length?`<div class="notice"><b>⚠ Pemeriksaan kualitas data:</b><ul>${quality.map(x=>`<li>${escHtml(x)}</li>`).join('')}</ul></div>`:'';const rows=d.cs.map(c=>{const f=c.foodCase||{};return `<tr><td>${escHtml(c.id||'-')}</td><td>${escHtml(f.exposureFood||f.food||'-')}</td><td>${escHtml(f.consumedAt||'-')}</td><td>${escHtml(f.onsetTime||f.onsetAt||c.onset||'-')}</td><td>${escHtml(f.incubationHours??'-')}</td><td>${escHtml(f.hospitalized||'-')}</td><td>${escHtml(c.outcome||'-')}</td></tr>`}).join('')||'<tr><td colspan="7">Belum ada data kasus keracunan pangan.</td></tr>';return `<div class="food-report"><h4>3.6A Komponen Khusus KLB Keracunan Pangan</h4>${qualityHtml}<div class="summary-grid"><div><b>Terpapar</b><strong>${exposed||'—'}</strong></div><div><b>Sakit</b><strong>${ill}</strong></div><div><b>Attack Rate</b><strong>${ar}</strong></div><div><b>Meninggal</b><strong>${dead}</strong></div><div><b>Pangan dicurigai</b><strong>${escHtml(fi.suspectedFood||'—')}</strong></div><div><b>Waktu konsumsi</b><strong>${escHtml(fi.mealTime||'—')}</strong></div></div><p><b>Acara/kegiatan:</b> ${escHtml(fi.eventName||'—')} &nbsp; <b>Tempat:</b> ${escHtml(fi.venue||'—')} &nbsp; <b>Sumber/pengelola:</b> ${escHtml(fi.foodSource||'—')}</p><p><b>Sumber air:</b> ${escHtml(fi.waterSource||'—')} &nbsp; <b>Kondisi penyimpanan:</b> ${escHtml(fi.storage||'—')} &nbsp; <b>Penjamah:</b> ${escHtml(fi.foodHandler||'—')}</p><p><b>Hipotesis awal:</b> ${escHtml(fi.initialHypothesis||'Belum diisi.')}</p><h5>Line Listing Khusus Keracunan Pangan</h5><table class="report-table compact"><thead><tr><th>ID</th><th>Pangan dikonsumsi</th><th>Waktu konsumsi</th><th>Onset</th><th>Inkubasi (jam)</th><th>Rawat inap</th><th>Outcome</th></tr></thead><tbody>${rows}</tbody></table><p class="muted">Attack rate dihitung sebagai jumlah sakit dibagi jumlah terpapar. Jika denominator terpapar belum tersedia atau belum tervalidasi, hasil tidak dihitung. Analisis makanan spesifik memerlukan denominator paparan per item makanan/minuman.</p></div>`}
function reportHtml(){
 const d=reportData(),o=d.o,cs=d.cs,loc=[o.desa,o.kec,o.kab,o.prov].filter(Boolean).join(', '), disease=diseases[o.disease]?.name||o.disease||'Penyakit menular';
 const summary=d.rep.background||`Telah dilakukan penyelidikan epidemiologi ${escHtml(disease)} pada ${escHtml(o.desa||'lokasi investigasi')} ${escHtml(o.kec||'')} dengan ${cs.length} kasus tercatat, ${d.dead} kematian, ${d.conf} kasus konfirmasi, ${d.prob} probable, dan ${d.susp} suspek. Ringkasan ini hanya menggunakan data yang tersedia pada investigasi aktif dan perlu dilengkapi/ditinjau oleh tim investigasi.`;
 const methods=d.rep.methods||'Pengumpulan data melalui kuesioner/investigasi lapangan, line listing kasus, pelacakan kontak, data laboratorium, observasi lapangan, serta sumber data lain yang tersedia pada investigasi. Metode analisis disesuaikan dengan desain studi dan kelengkapan data.';
 const caseDef=d.rep.caseDef||'Belum diisi. Definisi kasus operasional harus ditetapkan berdasarkan penyakit/sindrom dan pedoman yang digunakan dalam investigasi.';
 const discussion=d.rep.discussion||`Hasil sementara menunjukkan ${cs.length} kasus tercatat dengan distribusi onset yang dapat dilihat pada kurva epidemi. Interpretasi sumber paparan, pola penularan, dan hubungan faktor risiko memerlukan peninjauan terhadap data lapangan, kontak, laboratorium, serta desain studi. ${d.contacts.length} kontak dan ${d.specs.length} spesimen tercatat pada investigasi aktif.`;
 const recommendations=d.rep.recommendations||'Lengkapi rekomendasi berdasarkan temuan investigasi: pengendalian sumber/reservoir bila relevan, tata laksana dan pemantauan kasus, pelacakan dan pemantauan kontak, pengambilan/pengiriman spesimen, intervensi lingkungan, komunikasi risiko, serta penguatan surveilans untuk mendeteksi kasus tambahan.';
 const conclusion=`Investigasi aktif mencatat ${cs.length} kasus dan ${d.dead} kematian. Status kejadian pada laporan ini: ${d.rep.status}. Kesimpulan etiologi dan pola penularan harus mengikuti bukti yang tersedia dan hasil validasi tim investigasi.`;
 const refs=`<ol><li>Kementerian Kesehatan Republik Indonesia. Pedoman/formulir penyakit dan surveilans yang digunakan dalam investigasi — sesuaikan dengan versi yang berlaku.</li><li>WHO. Field epidemiology/outbreak investigation guidance yang relevan dengan penyakit yang diselidiki.</li><li>Dokumen, hasil laboratorium, dan sumber data lokal yang digunakan oleh tim investigasi.</li></ol>`;
 return `<article class="report-doc">
 <div class="report-kicker">LAPORAN PENYELIDIKAN EPIDEMIOLOGI KEJADIAN LUAR BIASA (KLB)</div>
 <h1>KLB ${escHtml(disease.replace(/^Tersangka /i,''))}</h1>
 <div class="report-sub">Lokasi: ${escHtml(loc||'-')} &nbsp; | &nbsp; Jenis Kejadian: ${escHtml(o.type||'Penyakit Menular')} &nbsp; | &nbsp; Desain Studi: ${escHtml(d.rep.design)}</div>
 <div class="report-meta"><div><b>No. Laporan:</b> ${escHtml(d.rep.no)} <span><b>Tanggal Mulai Investigasi:</b> ${escHtml(d.rep.start)}</span></div><div><b>Tanggal Akhir Investigasi:</b> ${escHtml(d.rep.date)} <span><b>Tanggal Laporan:</b> ${escHtml(d.rep.date)}</span></div><div><b>Status KLB:</b> ${escHtml(d.rep.status)}</div></div>
 <div class="exec"><h3>RINGKASAN EKSEKUTIF</h3><p>${summary}</p></div>
 <h3>I. PENDAHULUAN</h3><h4>1.1 Latar Belakang.</h4><p>${d.rep.background?escHtml(d.rep.background):`Kejadian ${escHtml(disease)} di ${escHtml(o.desa||'lokasi')} ${escHtml(o.kec||'')} memerlukan penyelidikan epidemiologi untuk menggambarkan besaran masalah menurut orang, tempat, dan waktu, menilai kemungkinan sumber/paparan dan pola penularan, serta merumuskan tindakan pengendalian berdasarkan bukti yang tersedia.`}</p>
 <h4>1.2 Tujuan Umum.</h4><p>Melakukan penyelidikan epidemiologi untuk mengendalikan dan mencegah perluasan kejadian yang sedang diselidiki.</p>
 <h4>1.3 Tujuan Khusus.</h4><ol><li>Memastikan diagnosis dan mengkaji status kejadian berdasarkan bukti yang tersedia.</li><li>Mendeskripsikan kasus berdasarkan variabel orang, tempat, dan waktu.</li><li>Mengidentifikasi sumber/paparan dan faktor yang berhubungan berdasarkan data yang tersedia.</li><li>Merumuskan hipotesis dan, bila desain serta data memungkinkan, menguji hipotesis melalui studi epidemiologi analitik.</li><li>Menyusun rekomendasi tindakan penanggulangan dan pencegahan.</li></ol>
 <h4>1.4 Definisi Kasus Operasional.</h4><p>${escHtml(caseDef)}</p>
 <h3>II. METODE PENYELIDIKAN</h3><h4>2.1 Desain Studi.</h4><p>${escHtml(d.rep.design)}. Desain final dan metode analisis harus disesuaikan dengan karakteristik kejadian, populasi, paparan, outcome, dan ketersediaan data.</p>
 <h4>2.2 Populasi dan Sampel.</h4><p>Populasi/sampel mengikuti populasi berisiko dan subjek yang tercatat dalam investigasi aktif. Jumlah kasus yang tersedia pada sistem: <b>${cs.length}</b>.</p>
 <h4>2.3 Pengumpulan Data.</h4><p>${escHtml(methods)}</p>
 <h4>2.4 Analisis Data.</h4><p>Analisis deskriptif meliputi frekuensi, proporsi, distribusi orang-tempat-waktu, dan kurva epidemi. Analisis analitik ditampilkan bila data dan desain mendukung, termasuk tabel 2×2, RR/OR, interval kepercayaan, dan p-value. Interpretasi akhir dilakukan oleh epidemiolog.</p>
 <h4>2.5 Tim Investigasi.</h4><p>${escHtml(d.rep.team||'Belum diisi')}</p>
 <h3>III. HASIL PENYELIDIKAN</h3><h4>3.1 Besaran Masalah</h4><div class="summary-grid"><div><b>Total Kasus Sakit</b><strong>${cs.length}</strong></div><div><b>Total Meninggal</b><strong>${d.dead}</strong></div><div><b>Index Case/Kasus Awal</b><strong>${cs[0]?.onset||'Belum diisi'}</strong></div><div><b>Masa Inkubasi</b><strong>Belum dapat dihitung</strong></div><div><b>Kasus Konfirmasi</b><strong>${d.conf}</strong></div><div><b>CFR</b><strong>${cs.length?pct(d.dead,cs.length):'—'}</strong></div></div>${demographicsHtml(cs)}
 <h4>3.2 Deskripsi Epidemiologi Menurut Orang (Karakteristik Demografi)</h4>${personTableHtml(cs)}
 <h4>3.3 Deskripsi Epidemiologi Menurut Waktu (Kurva Epidemik)</h4>${epiCurveHtml(d)}
 <h4>3.4 Deskripsi Epidemiologi Menurut Tempat</h4><p>Sebaran kasus menurut lokasi disajikan berdasarkan data alamat/desa yang tersedia. Pengelompokan spasial dapat digunakan untuk menilai kemungkinan sumber paparan bersama atau pola klaster wilayah.</p>${placeHtml(d)}
 <h4>3.5 Deskripsi Kontak, Spesimen, dan Lapangan</h4><div class="summary-grid"><div><b>Kontak</b><strong>${d.contacts.length}</strong></div><div><b>Spesimen</b><strong>${d.specs.length}</strong></div><div><b>Hasil spesimen tersedia</b><strong>${d.specs.filter(x=>x.result&&x.result!=='Belum ada').length}</strong></div><div><b>Kunjungan lapangan</b><strong>${d.visits.length}</strong></div></div>
 <h4>3.6 Analisis Epidemiologi</h4>${foodPoisoningHtml(d)}${priorityReportHtml(d)}${analyticHtml(d)}
 <h4>3.7 Dugaan Etiologi/Diagnosis</h4><p>${escHtml(d.rep.etiology||'Belum diisi. Dugaan etiologi/diagnosis harus didasarkan pada bukti klinis, epidemiologis, dan laboratorium yang tersedia.')}</p>
 <h3>RINGKASAN EKSEKUTIF ANALISIS</h3><p>${discussion}</p>
 <h3>IV. PEMBAHASAN</h3><p>${escHtml(d.rep.discussion||discussion)}</p><p><b>Keterbatasan Studi.</b> Interpretasi dibatasi oleh kelengkapan data yang tersedia pada sistem, termasuk data denominator populasi, tanggal onset, paparan, kontak, koordinat, dan hasil laboratorium bila belum tersedia. Keterbatasan lain harus ditambahkan oleh tim investigasi sesuai kondisi lapangan.</p>
 <h3>V. KESIMPULAN</h3><p>${conclusion}</p>
 <h3>VI. REKOMENDASI TINDAK LANJUT</h3><p>${escHtml(recommendations)}</p>
 ${reportAppendicesHtml(d)}<div class="page-break"></div><h3>DAFTAR PUSTAKA</h3>${refs}
 <p>Demikian laporan penyelidikan epidemiologi ini disusun untuk digunakan sebagaimana mestinya.</p>
 <div class="signature"><div>Mengetahui,<br><br><br><br><b>${escHtml(d.rep.knownBy||'................................')}</b><br>${escHtml(d.rep.knownTitle||'................................')}</div><div>${escHtml(o.desa||'................................')}, ${escHtml(d.rep.date)}<br>${escHtml(d.rep.teamTitle)}<br><br><br><br><b>${escHtml(d.rep.teamName||'................................')}</b></div></div>
 </article>`;
}
function reportAppendicesHtml(d){
 const caseRows=d.cs.map((c,i)=>`<tr><td>${i+1}</td><td>${escHtml(c.id||'-')}</td><td>${escHtml(c.name||'-')}</td><td>${escHtml(c.age||'-')}</td><td>${escHtml(c.sex||'-')}</td><td>${escHtml(c.onset||'-')}</td><td>${escHtml(c.status||'-')}</td><td>${escHtml(c.outcome||'-')}</td></tr>`).join('')||'<tr><td colspan="8">Belum ada data kasus.</td></tr>';
 const contactRows=d.contacts.map((c,i)=>`<tr><td>${i+1}</td><td>${escHtml(c.id||'-')}</td><td>${escHtml(c.caseId||'-')}</td><td>${escHtml(c.name||'-')}</td><td>${escHtml(c.relation||'-')}</td><td>${escHtml(c.last||'-')}</td><td>${escHtml(c.status||'-')}</td><td>${escHtml(c.follow||'-')}</td></tr>`).join('')||'<tr><td colspan="8">Belum ada data kontak.</td></tr>';
 const specRows=d.specs.map((x,i)=>`<tr><td>${i+1}</td><td>${escHtml(x.id||'-')}</td><td>${escHtml(x.caseId||'-')}</td><td>${escHtml(x.type||'-')}</td><td>${escHtml(x.date||'-')}</td><td>${escHtml(x.lab||'-')}</td><td>${escHtml(x.result||'-')}</td></tr>`).join('')||'<tr><td colspan="7">Belum ada data spesimen.</td></tr>';
 const visitRows=d.visits.map((x,i)=>`<tr><td>${i+1}</td><td>${escHtml(x.date||'-')}</td><td>${escHtml(x.activity||'-')}</td><td>${escHtml(x.subject||'-')}</td><td>${escHtml(x.officer||'-')}</td><td>${escHtml(x.location||'-')}</td><td>${escHtml(x.lat||'-')}, ${escHtml(x.lng||'-')}</td><td>${escHtml(x.finding||'-')}</td></tr>`).join('')||'<tr><td colspan="8">Belum ada kunjungan lapangan.</td></tr>';
 return `<div class="page-break"></div><h3>LAMPIRAN</h3><h4>Lampiran 1. Line Listing Kasus</h4><table class="report-table compact"><tr><th>No.</th><th>ID</th><th>Nama/ID</th><th>Umur</th><th>JK</th><th>Onset</th><th>Status</th><th>Outcome</th></tr>${caseRows}</table><h4>Lampiran 2. Daftar Kontak</h4><table class="report-table compact"><tr><th>No.</th><th>ID Kontak</th><th>ID Kasus</th><th>Nama/ID</th><th>Hubungan</th><th>Paparan terakhir</th><th>Status</th><th>Follow-up</th></tr>${contactRows}</table><h4>Lampiran 3. Daftar Spesimen/Laboratorium</h4><table class="report-table compact"><tr><th>No.</th><th>ID</th><th>ID Kasus</th><th>Jenis</th><th>Tanggal</th><th>Laboratorium</th><th>Hasil</th></tr>${specRows}</table><h4>Lampiran 4. Kunjungan Investigasi Lapangan</h4><table class="report-table compact"><tr><th>No.</th><th>Waktu</th><th>Aktivitas</th><th>Subjek</th><th>Petugas</th><th>Lokasi</th><th>Koordinat</th><th>Temuan</th></tr>${visitRows}</table><p class="muted">Lampiran merupakan salinan data dari investigasi aktif pada saat laporan dibuat. Data sensitif hanya boleh dibagikan sesuai kewenangan dan ketentuan perlindungan data yang berlaku.</p>`;
}
function reportText(){const d=reportData();return `LAPORAN PENYELIDIKAN EPIDEMIOLOGI KEJADIAN LUAR BIASA (KLB)\nKLB ${d.o.disease||'-'}\n\nNo. Laporan: ${d.rep.no}\nLokasi: ${[d.o.desa,d.o.kec,d.o.kab,d.o.prov].filter(Boolean).join(', ')}\nStatus: ${d.rep.status}\n\nRINGKASAN EKSEKUTIF\n${d.rep.background||'Belum diisi.'}\n\nI. PENDAHULUAN\n1.1 Latar Belakang\n1.2 Tujuan Umum\n1.3 Tujuan Khusus\n1.4 Definisi Kasus Operasional\n\nII. METODE PENYELIDIKAN\n2.1 Desain Studi\n2.2 Populasi dan Sampel\n2.3 Pengumpulan Data\n2.4 Analisis Data\n2.5 Tim Investigasi\n\nIII. HASIL PENYELIDIKAN\nTotal kasus: ${d.cs.length}\nKonfirmasi: ${d.conf}\nProbable: ${d.prob}\nSuspek: ${d.susp}\nMeninggal: ${d.dead}\nKontak: ${d.contacts.length}\nSpesimen: ${d.specs.length}\nKunjungan lapangan: ${d.visits.length}\n\nIV. PEMBAHASAN\n${d.rep.discussion||'Belum diisi.'}\n\nV. KESIMPULAN\nStatus kejadian: ${d.rep.status}\n\nVI. REKOMENDASI TINDAK LANJUT\n${d.rep.recommendations||'Belum diisi.'}`}
function report(){loadReportDraft();document.getElementById('report').innerHTML=reportHtml()}
function printReport(){saveReportDraft();document.getElementById('report').innerHTML=reportHtml();let w=open('','_blank');w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Laporan PE/KLB</title><style>'+reportPrintCss()+'</style></head><body>'+reportHtml()+'</body></html>');w.document.close();setTimeout(()=>w.print(),300)}
function reportPrintCss(){return `.report-doc{font-family:Georgia,"Times New Roman",serif;color:#202020;line-height:1.55;max-width:900px;margin:auto}.report-kicker{text-align:center;letter-spacing:1.2px;font-size:14px}.report-doc h1{text-align:center;font-size:24px;margin:4px 0}.report-sub{text-align:center;font-size:14px}.report-meta{border-top:2px solid #444;border-bottom:1px solid #ddd;padding:10px 0;margin:14px 0}.report-meta div{display:flex;justify-content:space-between;margin:3px 0}.exec{background:#f6f8fa;border:1px solid #d9dee5;padding:12px}.report-doc h3{font-size:18px;border-bottom:1px solid #aaa;padding-bottom:4px;margin-top:20px}.report-doc h4{font-size:15px;margin:12px 0 5px}.report-table{width:100%;border-collapse:collapse;margin:9px 0}.report-table th,.report-table td{border:1px solid #bfc7d1;padding:5px;font-size:11px}.report-table th{background:#eef2f7}.report-table.compact th,.report-table.compact td{font-size:9.5px;padding:4px}.appendix-note{font-size:10px;color:#666}.report-table .group th{text-align:left}.summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:8px 0}.summary-grid div{border:1px solid #d9dee5;padding:8px;background:#f8fafc}.summary-grid strong{display:block;font-size:17px;margin-top:3px}.donut-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:10px 0}.donut-card{border:1px solid #e2e7ee;padding:10px;text-align:center}.donut{width:110px;height:110px;border-radius:50%;margin:4px auto 8px;display:grid;place-items:center}.donut>div{background:#fff;border-radius:50%;width:62px;height:62px;display:grid;place-items:center;font-weight:bold}.donut-legend{font-size:10px;text-align:left}.donut-legend span{display:block}.epi-chart{display:flex;align-items:flex-end;gap:6px;min-height:230px;border-left:1px solid #777;border-bottom:1px solid #777;padding:10px 6px 0;overflow:hidden}.epi-col{min-width:34px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:220px}.epi-count{font-size:9px}.epi-bar{width:24px;background:#0a9f6e}.epi-date{font-size:8px;transform:rotate(-45deg);transform-origin:top center;margin-top:7px;white-space:nowrap}.muted{font-size:11px;color:#666}.signature{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:45px}.signature div{text-align:center;min-height:130px}.page-break{break-before:page}@media print{@page{size:A4;margin:18mm 16mm}body{margin:0}.report-doc{max-width:none}.report-table tr{break-inside:avoid}.donut-card{break-inside:avoid}.chart-box{break-inside:avoid}}`}
function downloadHTMLReport(){saveReportDraft();const html='<!doctype html><html><head><meta charset="utf-8"><title>Laporan PE/KLB</title><style>'+reportPrintCss()+'</style></head><body>'+reportHtml()+'</body></html>';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download='laporan-PE-KLB.html';a.click()}
function downloadReportBundle(){
  saveReportDraft();
  const payload={
    app:'GORUT-OUTBREAK AI',
    module:'PE/KLB Report Bundle',
    exportedAt:new Date().toISOString(),
    report:reportData(),
    html:'<!doctype html><html><head><meta charset="utf-8"><title>Laporan PE/KLB</title><style>'+reportPrintCss()+'</style></head><body>'+reportHtml()+'</body></html>'
  };
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  a.download='paket-laporan-PE-KLB.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

function downloadTxt(){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([reportText()],{type:'text/plain'}));a.download='laporan-PE-KLB.txt';a.click()}
function exportCSV(){let cs=db.cases.filter(c=>c.investigationId===db.active),s='ID,Nama,Umur,JK,Onset,Status,Outcome\\n'+cs.map(c=>[c.id,c.name,c.age,c.sex,c.onset,c.status,c.outcome].join(',')).join('\\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/csv'}));a.download='kasus-KLB.csv';a.click()}
function importCSV(e){let r=new FileReader();r.onload=()=>{r.result.split(/\\r?\\n/).slice(1).filter(Boolean).forEach(x=>{let a=x.split(',');db.cases.push({id:a[0],name:a[1],age:+a[2]||0,sex:a[3],onset:a[4],status:a[5]||'Suspek',outcome:a[6]||'',investigationId:db.active})});save();cases()};r.readAsText(e.target.files[0])}
function alerts(){let rows=document.getElementById('alertRows');if(!rows)return;rows.innerHTML=(db.alerts||[]).map((a,i)=>`<tr><td>${esc(a.date||'-')}</td><td>${esc(diseases[a.disease]?.name||a.disease)}</td><td>${esc(a.facility||'-')}</td><td>${esc(a.count||0)}</td><td><span class="badge">${esc(a.result)}</span></td><td><button onclick="createInvestigationFromAlert(${i})">Buat PE</button> <button class="danger" data-v30-delete onclick="deleteRecord('alerts','${esc(a.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="6">Belum ada alert.</td></tr>';let s=document.getElementById('alertDisease');if(s)s.innerHTML=diseaseOptions()}
function saveAlert(){let a={id:Date.now(),disease:val('alertDisease')||'campak',week:val('alertWeek'),date:val('alertDate'),facility:val('alertFacility'),count:+val('alertCount')||0,result:val('alertResult')};db.alerts.push(a);save();alerts();alert('Alert tersimpan.')}
function createInvestigationFromAlert(i){let a=db.alerts[i];db.selectedDisease=a.disease;page('investigasi');document.getElementById('inName').value=`PE ${diseases[a.disease]?.name||a.disease} — ${a.facility||'lokasi'}`;document.getElementById('inType').value='Penyakit Menular';document.getElementById('disease').value=a.disease;document.getElementById('tgl').value=a.date||''}
function contacts(){let rows=document.getElementById('contactRows');if(!rows)return;let q=(val('contactSearch')||'').toLowerCase();let cs=(db.contacts||[]).filter(c=>!q||`${c.id} ${c.name} ${c.caseId}`.toLowerCase().includes(q));rows.innerHTML=cs.map(c=>`<tr><td>${esc(c.id)}</td><td>${esc(c.caseId)}</td><td>${esc(c.name)}</td><td>${esc(c.relation||'-')}</td><td>${esc(c.last||'-')}</td><td>${esc(c.status)}</td><td>${esc(c.follow||'-')}</td><td><button class="danger" data-v30-delete onclick="deleteRecord('contacts','${esc(c.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="8">Belum ada kontak.</td></tr>'}
function addContact(){if(!act())return alert('Pilih investigasi terlebih dahulu.');let cases=db.cases.filter(c=>c.investigationId===db.active);modal(`<h2>Tambah Kontak</h2>${f('Kasus indeks','ccase','select',cases.map(c=>c.id).join('|')||'-')}${f('Nama kontak','cname','text','')}${f('Hubungan','crel','select','Serumah|Keluarga|Teman|Teman sekolah|Rekan kerja|Tetangga|Tenaga kesehatan|Lainnya')}${f('Tanggal kontak terakhir','clast','date','')}${f('Status pemantauan','cstatus','select','Dipantau|Selesai|Sakit|Tidak dapat dihubungi')}${f('Tindak lanjut','cfollow','text','')}<button class="primary" onclick="saveContact()">Simpan</button>`)}
function saveContact(){db.contacts.push({id:'C'+String(db.contacts.length+1).padStart(3,'0'),investigationId:db.active,caseId:val('ccase'),name:val('cname'),relation:val('crel'),last:val('clast'),status:val('cstatus'),follow:val('cfollow')});queueSync('contacts');save();close();contacts();}
function specimens(){let rows=document.getElementById('specimenRows');if(!rows)return;let ss=(db.specimens||[]).filter(s=>!db.active||s.investigationId===db.active);rows.innerHTML=ss.map(s=>`<tr><td>${esc(s.id)}</td><td>${esc(s.caseId)}</td><td>${esc(s.type)}</td><td>${esc(s.date||'-')}</td><td>${esc(s.lab||'-')}</td><td>${esc(s.result||'-')}</td><td>${esc(s.status)}</td><td><button class="danger" data-v30-delete onclick="deleteRecord('specimens','${esc(s.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="8">Belum ada spesimen.</td></tr>'}
function addSpecimen(){if(!act())return alert('Pilih investigasi terlebih dahulu.');let cases=db.cases.filter(c=>c.investigationId===db.active);modal(`<h2>Tambah Spesimen</h2>${f('Kasus','scase','select',cases.map(c=>c.id).join('|')||'-')}${f('Jenis spesimen','stype','select','Serum|Darah EDTA|Swab nasofaring|Swab orofaring|Urine|Feses|CSF|Spesimen lain')}${f('Tanggal pengambilan','sdate','date','')}${f('Laboratorium tujuan','slab','text','')}${f('Hasil','sresult','select','Belum ada|Negatif|Positif|Inkonklusif|Pending')}${f('Status pengiriman','sstatus','select','Belum dikirim|Dikirim|Diterima laboratorium|Selesai')}<button class="primary" onclick="saveSpecimen()">Simpan</button>`)}
function saveSpecimen(){db.specimens.push({id:'S'+String(db.specimens.length+1).padStart(3,'0'),investigationId:db.active,caseId:val('scase'),type:val('stype'),date:val('sdate'),lab:val('slab'),result:val('sresult'),status:val('sstatus')});queueSync('specimens');save();close();specimens();}
function deleteRecord(collection,id){const list=db[collection];if(!Array.isArray(list))return;if(!confirm(`Hapus record ${id}? Data yang dihapus tidak dapat dikembalikan.`))return;const idx=list.findIndex(x=>String(x.id)===String(id));if(idx<0)return;const invId=list[idx].investigationId;list.splice(idx,1);if(collection==='cases'){db.contacts=(db.contacts||[]).filter(x=>String(x.caseId)!==String(id));db.specimens=(db.specimens||[]).filter(x=>String(x.caseId)!==String(id));}save();if(collection==='cases')cases();else if(collection==='contacts')contacts();else if(collection==='specimens')specimens();else if(collection==='alerts')alerts();else if(collection==='fieldVisits')fieldVisits();else if(collection==='investigations'){if(String(db.active)===String(id))db.active=null;dash();}else render();}
function modal(x){modalbox.innerHTML=x;modalEl.classList.add('show')}function close(){modalEl.classList.remove('show')}
let mapObj=null;let syncQueue=JSON.parse(localStorage.getItem('gorut-sync-queue')||'[]');const DBNAME='gorut-outbreak-v7';
function queueSync(entity){syncQueue.push({entity,at:new Date().toISOString()});localStorage.setItem('gorut-sync-queue',JSON.stringify(syncQueue));updateSyncBadge()}
function updateSyncBadge(){let n=syncQueue.length;let el=document.getElementById('syncBadge');if(el)el.textContent=n?`Menunggu sinkronisasi: ${n}`:'Tersimpan lokal';}
async function syncLocalDatabase(){try{let req=indexedDB.open(DBNAME,1);req.onupgradeneeded=e=>{let d=e.target.result;if(!d.objectStoreNames.contains('snapshots'))d.createObjectStore('snapshots',{keyPath:'key'});};req.onsuccess=e=>{let idb=e.target.result;let tx=idb.transaction('snapshots','readwrite');tx.objectStore('snapshots').put({key:'state',savedAt:new Date().toISOString(),data:db});};}catch(e){console.warn(e)} updateSyncBadge()}
window.addEventListener('online',()=>{updateSyncBadge();});
function locateMe(){if(!navigator.geolocation)return alert('Perangkat tidak mendukung lokasi.');navigator.geolocation.getCurrentPosition(pos=>{let lat=pos.coords.latitude,lng=pos.coords.longitude;alert(`Lokasi perangkat:\n${lat.toFixed(6)}, ${lng.toFixed(6)}\n\nKoordinat ini dapat dimasukkan ke data kasus yang sedang diinput.`);if(mapObj){mapObj.setView([lat,lng],15);L.marker([lat,lng]).addTo(mapObj).bindPopup('Lokasi perangkat').openPopup()}},()=>alert('Lokasi tidak tersedia atau izin lokasi belum diberikan.'))}
function renderMap(){if(!window.L){alert('Peta memerlukan koneksi internet untuk memuat Leaflet.');return}let el=document.getElementById('map');if(!el)return;if(mapObj)mapObj.remove();mapObj=L.map(el).setView([0.7,122.0],9);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(mapObj);let cs=db.cases.filter(c=>c.investigationId===db.active&&c.lat&&c.lng);let fvs=(db.fieldVisits||[]).filter(v=>String(v.investigationId)===String(db.active)&&v.lat&&v.lng);cs.forEach(c=>L.marker([+c.lat,+c.lng]).addTo(mapObj).bindPopup(`<b>${esc(c.id)}</b><br>${esc(c.name||'')}<br>Status: ${esc(c.status||'')}`));fvs.forEach(v=>L.circleMarker([+v.lat,+v.lng],{radius:7}).addTo(mapObj).bindPopup(`<b>Kunjungan lapangan</b><br>${esc(v.activity||'')}<br>${esc(v.subject||'')}<br>${esc(v.date||'')}`));document.getElementById('geoTable').innerHTML=`<div class="chainLegend"><span class="legendItem"><span class="dot"></span> Kasus</span><span class="legendItem"><span class="dot" style="border:2px solid #555"></span> Kunjungan lapangan</span></div>`+(cs.length||fvs.length?`<table><tr><th>Jenis</th><th>ID/Subjek</th><th>Latitude</th><th>Longitude</th><th>Status/Aktivitas</th></tr>${cs.map(c=>`<tr><td>Kasus</td><td>${esc(c.id)}</td><td>${esc(c.lat)}</td><td>${esc(c.lng)}</td><td>${esc(c.status||'-')}</td></tr>`).join('')}${fvs.map(v=>`<tr><td>Kunjungan</td><td>${esc(v.subject||v.id)}</td><td>${esc(v.lat)}</td><td>${esc(v.lng)}</td><td>${esc(v.activity||'-')}</td></tr>`).join('')}</table>`:'<div class="notice">Belum ada kasus atau kunjungan dengan koordinat.')}
function exportProject(){let payload={app:'GORUT-OUTBREAK AI',version:'v9',exportedAt:new Date().toISOString(),data:db};let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='GORUT-OUTBREAK-AI-project.json';a.click()}
async function backendClient(){
  const c=window.GORUT_BACKEND||{};
  if(!c.enabled||!c.url||!c.anonKey||c.url.includes('YOUR-PROJECT')) return null;
  if(!window.supabase) return null;
  if(!window.__gorutSupabase) window.__gorutSupabase=window.supabase.createClient(c.url,c.anonKey);
  return window.__gorutSupabase;
}
async function testBackend(){
  const badge=document.getElementById('backendBadge'),detail=document.getElementById('backendDetail');
  const c=window.GORUT_BACKEND||{};
  if(!c.enabled){badge.textContent='Backend: belum dikonfigurasi';detail.textContent='Edit backend-config.js dengan URL proyek Supabase dan public anon/publishable key. Aktifkan RLS dan uji kebijakan akses sebelum menggunakan data nyata.';return;}
  const sb=await backendClient(); if(!sb){badge.textContent='Backend: gagal';detail.textContent='Supabase client/config belum tersedia.';return;}
  const {data,error}=await sb.from('diseases').select('id').limit(1);
  if(error){badge.textContent='Backend: error';detail.textContent='Koneksi tercapai tetapi query ditolak: '+error.message;}
  else {badge.textContent='Backend: online';detail.textContent='Koneksi PostgreSQL/Supabase aktif. '+(data?.length||0)+' baris disease terbaca.';}
}
async function syncNow(){
  const sb=await backendClient(); if(!sb){alert('Backend belum dikonfigurasi. Mode offline tetap aktif.');return;}
  const user=(await sb.auth.getUser()).data.user;
  if(!user){alert('Silakan login melalui Supabase Auth terlebih dahulu.');return;}
  let ok=0,fail=0;
  for(const x of db.investigations){const row={id:uuidFrom(x.id),owner_id:user.id,name:x.name,outbreak_type:x.type||'Penyakit Menular',disease_id:x.disease||null,province:x.prov||'Gorontalo',district:x.kab||'Gorontalo Utara',subdistrict:x.kec||null,village:x.desa||null,facility:x.pkm||null,start_date:x.date||null,status:x.status||'Berjalan',metadata:{local_id:x.id}};const r=await sb.from('investigations').upsert(row,{onConflict:'id'});r.error?fail++:ok++;}
  for(const a of (db.alerts||[])){const row={id:uuidFrom(a.id),owner_id:user.id,disease_id:a.disease||null,epi_week:a.week||null,alert_date:a.date||null,reporting_facility:a.facility||null,count:a.count||0,verification_result:a.result||null,metadata:{local_id:a.id}};const r=await sb.from('alerts').upsert(row,{onConflict:'id'});r.error?fail++:ok++;}
  for(const c of (db.cases||[])){if(!db.investigations.find(i=>i.id===c.investigationId)) continue;const row={id:uuidFrom(c.id),owner_id:user.id,investigation_id:uuidFrom(c.investigationId),case_code:String(c.id||''),full_name:c.name||'',age:Number(c.age)||null,sex:c.sex||null,onset_date:c.onset||null,status:c.status||null,outcome:c.outcome||null,latitude:c.lat||null,longitude:c.lng||null,questionnaire_response:{...(c.answers||{}),foodCase:c.foodCase||null,priority:c.priority||null}};const r=await sb.from('cases').upsert(row,{onConflict:'id'});r.error?fail++:ok++;}
  for(const c of (db.contacts||[])){if(!db.investigations.find(i=>i.id===c.investigationId)) continue;const row={id:uuidFrom(c.id),owner_id:user.id,investigation_id:uuidFrom(c.investigationId),index_case_id:c.caseId?uuidFrom(c.caseId):null,contact_name:c.name||'',relation:c.relation||null,last_contact_date:c.last||null,monitoring_status:c.status||null,follow_up:c.follow||null,metadata:{local_id:c.id,linked_case_id:c.linkedCaseId||null}};const r=await sb.from('contacts').upsert(row,{onConflict:'id'});r.error?fail++:ok++;}
  for(const s of (db.specimens||[])){if(!db.investigations.find(i=>String(i.id)===String(s.investigationId)))continue;const row={id:uuidFrom(s.id),owner_id:user.id,investigation_id:uuidFrom(s.investigationId),case_id:s.caseId?uuidFrom(s.caseId):null,specimen_type:s.type||null,collected_at:s.date||null,lab_name:s.lab||null,result:s.result||null,status:s.status||null,metadata:{local_id:s.id}};const r=await sb.from('specimens').upsert(row,{onConflict:'id'});r.error?fail++:ok++;}
  for(const v of (db.fieldVisits||[])){if(!db.investigations.find(i=>i.id==v.investigationId)) continue;const row={id:uuidFrom(v.id),owner_id:user.id,investigation_id:uuidFrom(v.investigationId),activity:v.activity||null,subject:v.subject||null,visit_at:v.date||null,officer_name:v.officer||null,latitude:v.lat?Number(v.lat):null,longitude:v.lng?Number(v.lng):null,location_text:v.location||null,finding:v.finding||null,action_taken:v.action||null,media:v.photo?[{data:v.photo.slice(0,100000)}]:[],sync_status:'synced',metadata:{local_id:v.id,has_photo:!!v.photo}};const r=await sb.from('field_visits').upsert(row,{onConflict:'id'});if(!r.error){v.syncStatus='synced';}r.error?fail++:ok++;}
  if(fail===0){syncQueue=[];localStorage.setItem('gorut-sync-queue','[]');for(const v of (db.fieldVisits||[]))v.syncStatus='synced';save();}
  document.getElementById('backendBadge').textContent=fail?'Backend: sebagian gagal':'Backend: tersinkron';
  document.getElementById('backendDetail').textContent=`Sinkronisasi selesai. Berhasil: ${ok}; gagal: ${fail}.`;
}
function uuidFrom(v){let h=String(v).replace(/[^0-9a-f]/gi,'').padEnd(32,'0').slice(0,32);return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20,32);}

function render(){db.fieldVisits=db.fieldVisits||[]; disease.innerHTML=diseaseOptions();qDisease.innerHTML=diseaseOptions();if(act()){disease.value=act().disease||db.selectedDisease||'campak';qDisease.value=act().disease||db.selectedDisease||'campak'}else{disease.value=db.selectedDisease||'campak';qDisease.value=db.selectedDisease||'campak'}dash();cases();contacts();specimens();alerts();renderQ();report();populateFieldInvestigations();fieldVisits();if(document.getElementById('chain'))document.getElementById('chain').innerHTML=act()?.type==='Penyakit Menular'?'<h2>Rantai Penularan</h2><p>Gunakan menu 🧬 Rantai Penularan untuk visualisasi hubungan kasus dan kontak.</p>':'';renderChain();populateRiskInvestigations();if(document.getElementById('risiko')?.classList.contains('show'))runRiskAssessment()}
const loginEl=document.getElementById('login'),app=document.getElementById('app'),title=document.getElementById('title'),klbRows=document.getElementById('klbRows'),stats=document.getElementById('stats'),bankEl=document.getElementById('bank'),preview=document.getElementById('preview'),caseRows=document.getElementById('caseRows'),modalEl=document.getElementById('modal');

/* ===== v9 operational layer ===== */
let GORUT_USER=null;
function demoLogin(){loginEl.style.display='none';app.style.display='block';GORUT_USER={id:'offline',email:val('email')||'offline',role:'admin_kabupaten'};document.getElementById('roleBadge').textContent='Mode lokal/demo — akses tidak terautentikasi';const d=document.getElementById('backendDetail');if(d)d.textContent='Mode lokal: tidak ada autentikasi server atau pembatasan akses yang aman. Data hanya tersimpan di perangkat ini; jangan masukkan identitas pasien nyata.';setRoleUI();render();}
async function login(){
  const sb=await backendClient();
  if(!sb){demoLogin();return;}
  const email=val('email'),password=val('password');
  const r=await sb.auth.signInWithPassword({email,password});
  if(r.error){const m=document.getElementById('loginMsg');m.style.display='block';m.textContent='Login gagal: '+r.error.message;return;}
  GORUT_USER=r.data.user; loginEl.style.display='none';app.style.display='block';
  await authStatus(); render();
}
async function logout(){try{const sb=await backendClient();if(sb)await sb.auth.signOut();}catch(e){} location.reload()}
async function authStatus(){
 const sb=await backendClient(); if(!sb){document.getElementById('roleBadge').textContent='Role: Offline';return;}
 const r=await sb.auth.getUser(); GORUT_USER=r.data.user||null;
 if(!GORUT_USER){document.getElementById('roleBadge').textContent='Role: belum login';return;}
 let role='petugas'; const pr=await sb.from('profiles').select('role,full_name,facility').eq('id',GORUT_USER.id).maybeSingle();
 if(pr.data?.role)role=pr.data.role; document.getElementById('roleBadge').textContent='Role: '+role;
 const d=document.getElementById('backendDetail'); if(d)d.textContent=`Login: ${GORUT_USER.email||'-'} | Role: ${role}`;
}
function erf(x){const sign=x<0?-1:1;x=Math.abs(x);const t=1/(1+0.3275911*x);const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return sign*y}
function normalCdf(x){return 0.5*(1+erf(x/Math.sqrt(2)))}
function chi2p1(x){return Math.max(0,Math.min(1,2*(1-normalCdf(Math.sqrt(Math.max(0,x))))))}
function safeLog(x){return Math.log(Math.max(x,1e-12))}
function runStats(){
 const cs=db.cases.filter(c=>c.investigationId===db.active); if(cs.length<2){statResult.textContent='Minimal 2 kasus diperlukan.';return}
 const exp=document.getElementById('statExposure').value, out=document.getElementById('statOutcome').value;
 const E=c=>exp==='contact' ? (c.contact==='Ya'||c.exposure==='Ya') : c.sex==='Laki-laki';
 const Y=c=>out==='status' ? c.status==='Konfirmasi' : c.outcome==='Meninggal';
 let a=0,b=0,c=0,d=0;cs.forEach(x=>{if(E(x)&&Y(x))a++;else if(E(x)&&!Y(x))b++;else if(!E(x)&&Y(x))c++;else d++});
 const risk1=a/(a+b||1),risk0=c/(c+d||1),rr=risk0?risk1/risk0:Infinity,or=(a*d||1)/(Math.max(1,b*c));
 const seLogRR=Math.sqrt((a?1/a:0)-(b?1/(a+b):0)+(c?1/c:0)-(d?1/(c+d):0));
 const rrL=seLogRR?Math.exp(safeLog(rr)-1.96*seLogRR):NaN,rrU=seLogRR?Math.exp(safeLog(rr)+1.96*seLogRR):NaN;
 const seLogOR=Math.sqrt(1/Math.max(a,0.5)+1/Math.max(b,0.5)+1/Math.max(c,0.5)+1/Math.max(d,0.5));
 const orL=Math.exp(safeLog(or)-1.96*seLogOR),orU=Math.exp(safeLog(or)+1.96*seLogOR);
 const n=a+b+c+d,den=(a+b)*(c+d)*(a+c)*(b+d);const chi=n*Math.pow(a*d-b*c,2)/Math.max(den,1),p=chi2p1(chi);
 statResult.innerHTML=`<b>Tabel 2×2</b><br>a=${a}, b=${b}, c=${c}, d=${d}<br><br><b>RR</b> = ${fmt(rr)} (95% CI ${fmt(rrL)}–${fmt(rrU)})<br><b>OR</b> = ${fmt(or)} (95% CI ${fmt(orL)}–${fmt(orU)})<br><b>Chi-square p-value</b> ≈ ${p.toFixed(4)}<br><small>Perhitungan ini adalah modul screening/prototipe; untuk pelaporan resmi gunakan validasi statistik dan metode yang sesuai desain penelitian.</small>`;
}
function fmt(x){return Number.isFinite(x)?x.toFixed(3):'∞'}

function populateFieldInvestigations(){const s=document.getElementById('fieldInv');if(!s)return;s.innerHTML=(db.investigations||[]).map(i=>`<option value="${i.id}">${esc(i.name||i.id)} — ${esc(diseases[i.disease]?.name||i.disease||'')}</option>`).join('')||'<option value="">Belum ada investigasi</option>';if(db.active)s.value=db.active;}
function getGPS(){if(!navigator.geolocation){alert('Perangkat tidak mendukung GPS.');return}document.getElementById('gpsStatus').textContent='GPS: mengambil...';navigator.geolocation.getCurrentPosition(pos=>{document.getElementById('fieldLat').value=pos.coords.latitude.toFixed(6);document.getElementById('fieldLng').value=pos.coords.longitude.toFixed(6);document.getElementById('gpsStatus').textContent=`GPS: ±${Math.round(pos.coords.accuracy||0)} m`},e=>{document.getElementById('gpsStatus').textContent='GPS: gagal';alert('GPS tidak tersedia/izin ditolak: '+e.message)},{enableHighAccuracy:true,timeout:15000,maximumAge:30000})}
function readPhoto(){return new Promise(resolve=>{const f=document.getElementById('fieldPhoto')?.files?.[0];if(!f)return resolve('');const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>resolve('');r.readAsDataURL(f)})}
async function saveFieldVisit(){const inv=val('fieldInv')||db.active;if(!inv)return alert('Buat/pilih investigasi terlebih dahulu.');const photo=await readPhoto();const o={id:'FV'+Date.now(),investigationId:inv,activity:val('fieldActivity'),subject:val('fieldSubject'),date:val('fieldDate')||new Date().toISOString().slice(0,16),officer:val('fieldOfficer'),lat:val('fieldLat'),lng:val('fieldLng'),location:val('fieldLocation'),finding:val('fieldFinding'),action:val('fieldAction'),photo:photo,syncStatus:'pending',createdAt:new Date().toISOString()};db.fieldVisits.push(o);queueSync('field_visits');save();fieldVisits();clearFieldForm();alert('Kunjungan lapangan tersimpan di perangkat. Status: menunggu sinkronisasi.');}
function fieldVisits(){const rows=document.getElementById('fieldRows');if(!rows)return;const inv=val('fieldInv')||db.active;const a=(db.fieldVisits||[]).filter(x=>!inv||String(x.investigationId)===String(inv));rows.innerHTML=a.slice().reverse().map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.activity)}</td><td>${esc(x.subject||'-')}</td><td>${esc(x.location||'-')}</td><td>${x.lat&&x.lng?esc(x.lat+', '+x.lng):'-'}</td><td>${esc(x.officer||'-')}</td><td><span class="badge">${esc(x.syncStatus||'pending')}</span></td><td><button class="danger" data-v30-delete onclick="deleteRecord('fieldVisits','${esc(x.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="8">Belum ada kunjungan.</td></tr>'}
function clearFieldForm(){['fieldSubject','fieldOfficer','fieldLat','fieldLng','fieldLocation','fieldFinding','fieldAction'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});const f=document.getElementById('fieldPhoto');if(f)f.value='';const d=document.getElementById('fieldDate');if(d)d.value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16)}
function exportFieldVisits(){const a=db.fieldVisits||[];const head=['id','investigationId','activity','subject','date','officer','lat','lng','location','finding','action','syncStatus'];const csv=[head.join(','),...a.map(x=>head.map(k=>`"${String(x[k]??'').replaceAll('"','""')}"`).join(','))].join('\n');const blob=new Blob([csv],{type:'text/csv'});const u=URL.createObjectURL(blob),aEl=document.createElement('a');aEl.href=u;aEl.download='gorut-field-visits.csv';aEl.click();URL.revokeObjectURL(u)}
function renderMaster(){
 const rows=document.getElementById('masterRows'); if(!rows)return;
 const search=(val('masterSearch')||'').toLowerCase(), group=val('masterGroup')||'';
 const arr=Object.entries(diseases).filter(([id,d])=>(!search||(`${d.name} ${d.group} ${id}`).toLowerCase().includes(search))&&(!group||d.group===group));
 rows.innerHTML=arr.map(([id,d])=>{const src=instrumentSource(id,d);return `<tr><td><b>${esc(d.name)}</b><br><span class="badge">${id}</span></td><td>${esc(d.group)}</td><td>${d.q.length}</td><td>${esc(src)}</td><td><span class="badge">${d.validationStatus||'Perlu validasi akhir'}</span></td></tr>`}).join('')||'<tr><td colspan="5">Tidak ditemukan.</td></tr>';
}
function instrumentSource(id,d){
 if(['campak'].includes(id)) return 'Pedoman Surveilans Campak-Rubela Kemenkes 2020; verifikasi terhadap pedoman/form terbaru';
 if(['mpox'].includes(id)) return 'Formulir PE Mpox Kemenkes/Infeksi Emerging; verifikasi versi terbaru';
 if(d.group.includes('SKDR')) return 'Pedoman SKDR Penyakit Potensial KLB/Wabah Kemenkes 2024 + pedoman penyakit terkait';
 if(d.group.includes('PD3I')) return 'Pedoman/program PD3I Kemenkes + formulir surveilans penyakit terkait';
 if(d.group.includes('PIE')) return 'Pedoman penyakit infeksi emerging Kemenkes; verifikasi instrumen spesifik';
 return 'Pedoman/formulir penyakit terkait Kemenkes — perlu validasi versi';
}
function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function renderMasterGroups(){const s=document.getElementById('masterGroup');if(!s)return;const gs=[...new Set(Object.values(diseases).map(d=>d.group))].sort();s.innerHTML='<option value="">Semua kelompok</option>'+gs.map(g=>`<option>${esc(g)}</option>`).join('');}
function loadMasterToQuestionnaire(){page('kuesioner');const q=val('qDisease')||db.selectedDisease||'campak';document.getElementById('qDisease').value=q;loadDiseaseQuestions();}

// v13 Chain of Transmission + spatial investigation layer
function chainCases(){return (db.cases||[]).filter(c=>String(c.investigationId)===String(db.active))}
function chainContacts(){return (db.contacts||[]).filter(c=>String(c.investigationId)===String(db.active))}
function renderChain(){
 const canvas=document.getElementById('chainCanvas'); if(!canvas)return;
 const cs=chainCases(), ct=chainContacts();
 const ids=new Set(cs.map(c=>String(c.id))); const links=ct.filter(x=>ids.has(String(x.caseId)));
 const linkedCases=new Set(links.map(x=>String(x.caseId)));
 const confirmed=cs.filter(c=>c.status==='Konfirmasi').length;
 const symptomaticContacts=ct.filter(c=>['Sakit','Konfirmasi'].includes(c.status)).length;
 document.getElementById('chainSummary').innerHTML=[['Kasus',cs.length],['Kontak',ct.length],['Kasus dengan kontak',linkedCases.size],['Kontak sakit/terkonfirmasi',symptomaticContacts]].map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');
 const width=Math.max(760,Math.min(1400,220*(Math.max(cs.length,1))));
 const h=Math.max(300,120*(Math.max(cs.length,1)));
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${h}" viewBox="0 0 ${width} ${h}"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#777"/></marker></defs>`;
 const positions={}; cs.forEach((c,i)=>{const x=90+(i%5)*190,y=80+Math.floor(i/5)*150;positions[String(c.id)]={x,y};const fill=c.status==='Konfirmasi'?'#b42318':c.status==='Probable'?'#b54708':'#667085';svg+=`<g class="nodeBox"><circle cx="${x}" cy="${y}" r="27" fill="${fill}"/><text x="${x}" y="${y+5}" text-anchor="middle" fill="white">${esc(c.id).slice(0,12)}</text><text x="${x}" y="${y+48}" text-anchor="middle" fill="#222">${esc(c.name||'Kasus').slice(0,22)}</text></g>`});
 // Contacts are rendered under their index case; if contact has a linked case id, connect case-to-case.
 let ci=0; links.forEach(l=>{const from=positions[String(l.caseId)];if(!from)return;const linked=l.linkedCaseId&&positions[String(l.linkedCaseId)];const x=from.x+(ci%2?45:-45), y=from.y+70+Math.floor(ci/2)*18; if(linked){svg+=`<line x1="${from.x}" y1="${from.y+27}" x2="${linked.x}" y2="${linked.y-27}" stroke="#777" stroke-width="2" marker-end="url(#arrow)"/>`}else{svg+=`<circle cx="${x}" cy="${y}" r="18" fill="#f2c94c" stroke="#8a6d00"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="10" fill="#222">${esc(l.id).slice(0,8)}</text><line x1="${from.x}" y1="${from.y+27}" x2="${x}" y2="${y-18}" stroke="#aaa" stroke-dasharray="5,4"/>`}ci++});
 svg+=`</svg>`; canvas.innerHTML=svg;
 document.getElementById('chainTable').innerHTML=links.length?`<table><tr><th>Kontak</th><th>Kasus indeks</th><th>Nama kontak</th><th>Hubungan</th><th>Status</th><th>Kasus terkait</th></tr>${links.map(l=>`<tr><td>${esc(l.id)}</td><td>${esc(l.caseId)}</td><td>${esc(l.name||'-')}</td><td>${esc(l.relation||'-')}</td><td>${esc(l.status||'-')}</td><td>${esc(l.linkedCaseId||'-')}</td></tr>`).join('')}</table>`:'<div class="notice">Belum ada data kontak untuk investigasi aktif.';
}
function addTransmissionLink(){const cs=chainCases();if(!act()||!cs.length)return alert('Pilih investigasi yang memiliki kasus.');const opts=cs.map(c=>`${c.id}|${c.id}`).join('|');modal(`<h2>Tambah Hubungan Penularan</h2>${f('Kasus sumber/kasus indeks','tcase','select',opts)}${f('Nama kontak','tname','text','')}${f('Hubungan','trel','select','Serumah|Keluarga|Teman|Sekolah|Rekan kerja|Tetangga|Tenaga kesehatan|Lainnya')}${f('Status kontak','tstatus','select','Dipantau|Sakit|Konfirmasi|Selesai|Tidak dapat dihubungi')}${f('Kasus terkait bila sudah menjadi kasus','tlinked','select','-|'+cs.map(c=>c.id).join('|'))}<button class="primary" onclick="saveTransmissionLink()">Simpan</button>`)}
function saveTransmissionLink(){const id='C'+String((db.contacts||[]).length+1).padStart(3,'0');db.contacts=db.contacts||[];db.contacts.push({id,investigationId:db.active,caseId:val('tcase'),name:val('tname'),relation:val('trel'),status:val('tstatus'),follow:'',linkedCaseId:val('tlinked')==='-'?'':val('tlinked')});save();close();contacts();renderChain()}
function exportChain(){const payload={investigation:act(),cases:chainCases(),contacts:chainContacts(),exportedAt:new Date().toISOString()};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='gorut-chain-of-transmission.json';a.click()}

// v11 Public Survey: creates a published questionnaire + active survey linked to investigation.
async function publicQ(){
 const inv=act(); const id=inv?.id||'demo', disease=db.selectedDisease||'campak'; const sb=await backendClient();
 if(!sb){const base=new URL('public_survey.html',location.href);base.searchParams.set('investigation',String(id));base.searchParams.set('disease',disease);const url=base.toString();
   modal(`<h2>Kuesioner Publik — Mode Offline</h2><div class="notice">Backend belum aktif. URL ini hanya untuk preview lokal.</div><input value="${esc(url)}" readonly onclick="this.select()"><div id="qrBox" style="text-align:center;margin:15px"></div><button class="primary" onclick="copyText('${esc(url)}')">Salin URL</button> <button onclick="close()">Tutup</button>`); makeQR(url); return;}
 const user=(await sb.auth.getUser()).data.user;if(!user){alert('Login online diperlukan untuk membuat public survey.');return;}
 if(!inv){alert('Pilih investigasi terlebih dahulu.');return;}
 const schema={questions:db.questions||[],meta:db.questionMeta||{}};
 const qr=await sb.from('questionnaires').insert({disease_id:disease,name:`PE ${diseases[disease]?.name||disease}`,version:instrumentMeta.release,status:'published',schema_json:schema,source_reference:instrumentMeta.diseaseSpecificBasis,created_by:user.id}).select('id').single();
 if(qr.error){alert('Gagal membuat instrumen publik: '+qr.error.message);return;}
 const sr=await sb.from('public_surveys').insert({questionnaire_id:qr.data.id,investigation_id:uuidFrom(inv.id),title:`Kuesioner PE ${diseases[disease]?.name||disease} — ${inv.name||inv.id}`,created_by:user.id}).select('public_token').single();
 if(sr.error){alert('Gagal membuat public survey: '+sr.error.message);return;}
 const base=new URL('public_survey.html',location.href);base.searchParams.set('survey',sr.data.public_token);const url=base.toString();
 modal(`<h2>Kuesioner Publik Aktif</h2><div class="notice"><b>Investigasi:</b> ${esc(inv.name||inv.id)}<br><b>Instrumen:</b> ${esc(diseases[disease]?.name||disease)}<br>Setiap respons akan dibuat menjadi <b>kasus awal</b> dan terhubung ke line listing melalui trigger database.</div><input value="${esc(url)}" readonly onclick="this.select()"><div id="qrBox" style="text-align:center;margin:15px"></div><button class="primary" onclick="copyText('${esc(url)}')">Salin URL</button> <button onclick="close()">Tutup</button>`); makeQR(url);
}
function copyText(u){navigator.clipboard?.writeText(u);alert('URL disalin');}
function makeQR(url){const box=document.getElementById('qrBox');if(!box)return;box.innerHTML=`<div style="font-size:12px;margin-bottom:6px">QR Survey</div><img alt="QR Survey" width="220" height="220" src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}"><div style="font-size:11px;color:#666;margin-top:5px">QR membutuhkan internet saat dibuat.</div>`}

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
// v19 Risk Assessment & Early Warning — transparent operational screening
let lastRiskAssessment=null;
function populateRiskInvestigations(){const s=document.getElementById('riskInv');if(!s)return;const arr=db.investigations||[];s.innerHTML=arr.map(i=>`<option value="${esc(i.id)}">${esc(i.name||i.id)}</option>`).join('')||'<option value="">Belum ada investigasi</option>';if(db.active)s.value=String(db.active);}
function riskInv(){const id=document.getElementById('riskInv')?.value||db.active;return (db.investigations||[]).find(i=>String(i.id)===String(id))||act();}
function riskCases(){const id=riskInv()?.id||db.active;return (db.cases||[]).filter(c=>String(c.investigationId)===String(id));}
function dateObj(x){const d=new Date(x);return isNaN(d.getTime())?null:d;}
function riskDateRange(cs){const ds=cs.map(c=>dateObj(c.onset)).filter(Boolean).sort((a,b)=>a-b);if(!ds.length)return null;return {min:ds[0],max:ds[ds.length-1]};}
function pct(a,b){return b?Math.round(a/b*1000)/10:0;}
function riskIndicator(name,detail,score,max,cls=''){const width=max?Math.min(100,Math.round(score/max*100)):0;return `<div class="risk-row ${cls}"><div><b>${esc(name)}</b><div class="small">${esc(detail)}</div></div><div class="risk-meter"><span style="width:${width}%"></span></div><div style="text-align:right"><b>${score>0?'+':''}${score}</b></div></div>`;}
function runRiskAssessment(){
 const inv=riskInv(), cs=riskCases();
 if(!inv){document.getElementById('riskBanner').textContent='Belum ada investigasi. Buat investigasi terlebih dahulu.';return;}
 const contacts=(db.contacts||[]).filter(x=>String(x.investigationId)===String(inv.id));
 const specs=(db.specimens||[]).filter(x=>String(x.investigationId)===String(inv.id));
 const alerts=(db.alerts||[]).filter(x=>x.disease===inv.disease);
 const visits=(db.fieldVisits||[]).filter(x=>String(x.investigationId)===String(inv.id));
 const knownDates=cs.map(c=>dateObj(c.onset)).filter(Boolean).sort((a,b)=>a-b), range=riskDateRange(cs), windowDays=+(document.getElementById('riskWindow')?.value||28);
 let score=0, indicators=[];
 if(knownDates.length>=3){
   const max=knownDates[knownDates.length-1], recentStart=new Date(max);recentStart.setDate(recentStart.getDate()-windowDays+1);const prevStart=new Date(recentStart);prevStart.setDate(prevStart.getDate()-windowDays);
   const recent=knownDates.filter(d=>d>=recentStart&&d<=max).length, previous=knownDates.filter(d=>d>=prevStart&&d<recentStart).length;
   const ratio=previous?recent/previous:null;
   const add=ratio!==null&&recent>=3?(ratio>=2?2:ratio>=1.5?1:0):(previous===0&&recent>=3?1:0);
   score+=add;indicators.push({name:'Tendensi temporal',detail:`${recent} kasus pada ${windowDays} hari terakhir; periode sebelumnya ${previous} kasus${ratio!==null?` (rasio ${ratio.toFixed(2)})`:''}`,score:add,max:2});
 } else indicators.push({name:'Tendensi temporal',detail:'Tanggal onset belum cukup untuk membandingkan periode.',score:0,max:2});
 const groups={};cs.forEach(c=>{const g=c.desa||c.village||c.kec||'Tidak diketahui';groups[g]=(groups[g]||0)+1});const top=Object.entries(groups).sort((a,b)=>b[1]-a[1])[0];const topShare=top?pct(top[1],cs.length):0;const spatial=topShare>=50?2:topShare>=30?1:0;score+=spatial;indicators.push({name:'Konsentrasi spasial',detail:top?`${top[0]}: ${top[1]} dari ${cs.length} kasus (${topShare}%)`:'Belum ada lokasi kasus',score:spatial,max:2});
 const results=specs.map(s=>String(s.result||'').toLowerCase()).filter(r=>r&&r!=='belum ada'&&r!=='pending');const positive=results.filter(r=>r==='positif'||r.includes('positive')).length;const lab=pct(positive,results.length);const labScore=results.length?(lab>=50?2:lab>0?1:0):0;score+=labScore;indicators.push({name:'Sinyal laboratorium',detail:results.length?`${positive}/${results.length} hasil tersedia positif (${lab}%)`:'Belum ada hasil laboratorium yang dapat dianalisis',score:labScore,max:2});
 const dead=cs.filter(c=>String(c.outcome||'').toLowerCase().includes('meninggal')).length;const cfr=pct(dead,cs.length);const sev=cs.length?(cfr>=5?2:cfr>0?1:0):0;score+=sev;indicators.push({name:'Keparahan/outcome',detail:`${dead} meninggal dari ${cs.length} kasus (CFR ${cfr}%)`,score:sev,max:2});
 const sickContacts=contacts.filter(c=>['sakit','konfirmasi'].includes(String(c.status||'').toLowerCase())).length;const linked=contacts.filter(c=>c.linkedCaseId).length;const trans=(linked>=1?2:(contacts.length&&sickContacts/contacts.length>=.2?1:0));score+=trans;indicators.push({name:'Transmisi/kontak',detail:`${contacts.length} kontak; ${sickContacts} sakit/konfirmasi; ${linked} kontak terkait kasus`,score:trans,max:2});
 const verifiedAlerts=alerts.filter(a=>String(a.result||'').includes('Terverifikasi')).length;const alertScore=verifiedAlerts>0?1:0;score+=alertScore;indicators.push({name:'Sinyal SKDR',detail:`${verifiedAlerts} alert terverifikasi untuk penyakit ini pada data lokal`,score:alertScore,max:1});
 const totalMax=11;const level=score>=7?'Tinggi':score>=4?'Perlu perhatian':'Rendah';const completeness={onset:pct(knownDates.length,cs.length),coordinates:pct(cs.filter(c=>c.lat&&c.lng).length,cs.length),status:pct(cs.filter(c=>c.status).length,cs.length),contacts:contacts.length,labResults:results.length,visits:visits.length};
 const qualityFlags=[];if(cs.length&&completeness.onset<80)qualityFlags.push('Tanggal onset belum lengkap.');if(cs.length&&completeness.coordinates<80)qualityFlags.push('Koordinat kasus belum lengkap.');if(cs.length&&completeness.status<100)qualityFlags.push('Status klasifikasi kasus belum lengkap.');if(specs.length&&results.length<specs.length)qualityFlags.push(`${specs.length-results.length} spesimen belum memiliki hasil yang dapat dianalisis.`);if(!contacts.length)qualityFlags.push('Belum ada data kontak.');if(!visits.length)qualityFlags.push('Belum ada kunjungan lapangan.');
 lastRiskAssessment={version:'v19-screening-1',investigation:inv,score,totalMax,level,windowDays,indicators,completeness,qualityFlags,calculatedAt:new Date().toISOString()};
 const banner=document.getElementById('riskBanner');banner.className='notice '+(level==='Tinggi'?'risk-high':level==='Perlu perhatian'?'risk-medium':'risk-low');banner.innerHTML=`<div class="small">SCREENING OPERASIONAL — bukan klasifikasi KLB</div><div class="risk-score">${score}/${totalMax} · ${level}</div><div>${esc(inv.name||inv.id)} · ${esc(diseases[inv.disease]?.name||inv.disease||'-')}</div>`;
 document.getElementById('riskSummary').innerHTML=[['Kasus',cs.length],['Kontak',contacts.length],['Hasil lab',results.length],['Kunjungan',visits.length]].map(x=>`<div class="stat"><small>${esc(x[0])}</small><b>${x[1]}</b></div>`).join('');
 document.getElementById('riskIndicators').innerHTML=indicators.map(x=>riskIndicator(x.name,x.detail,x.score,x.max,x.score>=2?'risk-high':x.score===1?'risk-medium':'risk-neutral')).join('');
 document.getElementById('riskDataQuality').innerHTML=`<div class="summary-grid"><div>Onset<strong>${completeness.onset}%</strong></div><div>Koordinat<strong>${completeness.coordinates}%</strong></div><div>Status kasus<strong>${completeness.status}%</strong></div></div>${qualityFlags.length?'<ul>'+qualityFlags.map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>':'<div class="notice">Tidak ada kesenjangan utama yang terdeteksi dari indikator kelengkapan dasar.</div>'}`;
 const caution=qualityFlags.length?' Namun, kelengkapan data perlu diperbaiki sebelum interpretasi lebih lanjut.':'';document.getElementById('riskInterpretation').innerHTML=`<b>Screening:</b> skor ${score}/${totalMax} (${level}). Skor ini hanya merangkum sinyal pada data investigasi aktif dan tidak menetapkan diagnosis, KLB, sumber penularan, atau prediksi kejadian.${caution}<br><br><b>Prioritas verifikasi:</b> ${indicators.filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>esc(x.name)).join(', ')||'belum ada sinyal yang mendapat skor'}.`;
}
function exportRiskAssessment(){if(!lastRiskAssessment)runRiskAssessment();if(!lastRiskAssessment)return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(lastRiskAssessment,null,2)],{type:'application/json'}));a.download='gorut-risk-assessment.json';a.click();}

/* ===== v20 RESEARCH ANALYSIS ENGINE =====
   Purpose: distinguish epidemiologic designs and generate transparent analysis plans.
   This is a decision-support engine; methods/results must be reviewed before publication.
*/
const researchPlans={
  descriptive:{label:'Deskriptif / case series',measure:'Proporsi, mean/SD, median/IQR, orang-tempat-waktu',tests:'Tidak wajib uji hipotesis; dapat memakai CI proporsi/mean bila relevan.',report:'STROBE bila analitik; untuk case report/series gunakan pedoman pelaporan yang sesuai.'},
  'cross-sectional':{label:'Cross-sectional',measure:'Prevalence, Prevalence Ratio (PR), Prevalence Odds Ratio (POR)',tests:'Chi-square/Fisher untuk kategorik; t-test/Welch atau Mann–Whitney untuk kontinu; regresi Poisson robust/log-binomial untuk PR bila tersedia.',report:'STROBE Cross-sectional'},
  'case-control':{label:'Case-control tidak berpasangan',measure:'Odds Ratio (OR), 95% CI',tests:'Chi-square/Fisher; logistic regression untuk analisis multivariat; evaluasi confounding dan interaction.',report:'STROBE Case-control'},
  'matched-case-control':{label:'Case-control berpasangan',measure:'Matched OR',tests:'McNemar untuk pasangan 1:1; conditional logistic regression untuk matched sets.',report:'STROBE Case-control'},
  cohort:{label:'Cohort',measure:'Risk, Attack Rate, RR, Risk Difference, Incidence Rate Ratio',tests:'Chi-square/Fisher; Poisson/binomial; survival analysis/Cox bila ada time-to-event.',report:'STROBE Cohort'},
  'outbreak-retro-cohort':{label:'Retrospective cohort outbreak',measure:'Attack Rate exposed/unexposed, RR, Risk Difference, attributable fraction',tests:'2×2; Chi-square/Fisher; stratified analysis bila ada confounding.',report:'STROBE Cohort + format PE/KLB'},
  ecological:{label:'Ecological',measure:'Rate/ratio antar wilayah/waktu; korelasi/regresi agregat',tests:'Correlation/linear or Poisson regression sesuai outcome agregat; ecological inference harus hati-hati.',report:'STROBE adapted / ecological reporting'},
  'time-series':{label:'Time-series / surveillance trend',measure:'Trend, moving average, incidence rate, seasonality',tests:'Trend tests; segmented regression/ITS atau time-series model bila data memadai.',report:'STROBE adapted / time-series reporting'},
  'quasi-experimental':{label:'Quasi-experimental',measure:'Difference-in-differences, level/slope change, rate ratio',tests:'Interrupted time series / DiD; model harus mempertimbangkan serial correlation dan confounding waktu.',report:'STROBE adapted / intervention reporting'}
};
let researchState=JSON.parse(localStorage.getItem('gorut-research-plan')||'null')||{design:'descriptive',title:'',population:'',period:'',outcome:'status',exposure:'contact',analysis:null};
function saveResearchPlan(){researchState={...researchState,design:val('studyDesign'),title:val('studyTitle'),population:val('studyPopulation'),period:val('studyPeriod'),outcome:val('researchOutcome'),exposure:val('researchExposure')};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));applyStudyDesign();alert('Rancangan penelitian tersimpan di perangkat.');}
function applyStudyDesign(){const d=val('studyDesign')||researchState.design||'descriptive';const p=researchPlans[d]||researchPlans.descriptive;const guide=document.getElementById('studyDesignGuide');if(guide)guide.innerHTML=`<b>${p.label}</b><br><b>Ukuran asosiasi:</b> ${p.measure}<br><b>Uji/model:</b> ${p.tests}<br><b>Pelaporan:</b> ${p.report}<br><small>WHO menjelaskan cross-sectional, case-control, dan cohort sebagai tiga kategori observasional utama; pilihan ukuran asosiasi harus mengikuti desain dan cara sampling.</small>`;const methods=document.getElementById('researchMethods');if(methods)methods.innerHTML=`<ul><li><b>Deskriptif:</b> frekuensi, proporsi, mean/SD, median/IQR, orang–tempat–waktu.</li><li><b>Bivariat:</b> tabel 2×2, Chi-square atau Fisher exact bila sesuai.</li><li><b>Effect measure:</b> ${p.measure}.</li><li><b>Multivariat:</b> ${d.includes('case-control')?'logistic regression / conditional logistic bila matched.':d.includes('cohort')?'Poisson robust/log-binomial atau Cox bila tersedia time-to-event.':d==='cross-sectional'?'Poisson robust/log-binomial untuk PR; logistic dapat menghasilkan POR.':'model dipilih sesuai struktur outcome dan waktu.'}</li><li><b>Confounding:</b> rencanakan a priori/berdasarkan DAG atau pengetahuan epidemiologis; jangan hanya memilih variabel berdasarkan p-value.</li><li><b>Missing data:</b> laporkan jumlah missing dan strategi penanganannya.</li></ul>`;const ck=document.getElementById('researchChecklist');if(ck)ck.innerHTML=`<label><input type="checkbox"> Judul/desain jelas</label><br><label><input type="checkbox"> Populasi dan setting dijelaskan</label><br><label><input type="checkbox"> Definisi outcome dan exposure tersedia</label><br><label><input type="checkbox"> Pemilihan peserta/sampling dijelaskan</label><br><label><input type="checkbox"> Bias dan confounding dibahas</label><br><label><input type="checkbox"> Metode statistik sesuai desain</label><br><label><input type="checkbox"> Missing data dilaporkan</label><br><label><input type="checkbox"> Effect estimate + 95% CI dilaporkan</label><br><label><input type="checkbox"> Keterbatasan dijelaskan</label>`;}
function researchCases(){return currentCases();}
function researchExposure(c,key){if(key==='contact')return exposureValue(c,'contact');if(key==='male')return String(c.sex||'').toLowerCase().startsWith('l');if(key==='age20')return Number(c.age)>=20;if(key==='custom')return Boolean(c.exposure==='Ya'||c.contact==='Ya');return Boolean(c[key]);}
function researchOutcome(c,key){if(key==='status')return c.status==='Konfirmasi';if(key==='outcome')return c.outcome==='Meninggal';return Number(c.age)||null;}
function fisherExact2x2(a,b,c,d){const n=a+b+c+d;const logC=(N,k)=>k<0||k>N?-Infinity:gammaln(N+1)-gammaln(k+1)-gammaln(N-k+1);const lp=(aa,bb,cc,dd)=>logC(aa+bb,aa)+logC(cc+dd,cc)-logC(n,aa+cc);const lo=Math.max(0,(a+b)-(b+d)),hi=Math.min(a+b,a+c);const obs=lp(a,b,c,d);let s=0;for(let x=lo;x<=hi;x++){const aa=x,bb=a+b-x,cc=a+c-x,dd=n-aa-bb-cc;const q=lp(aa,bb,cc,dd);if(q<=obs+1e-12)s+=Math.exp(q);}return Math.min(1,s)}
function gammaln(x){let cof=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.001208650973866179,-0.000005395239384953];let y=x,tmp=x+5.5;tmp-=(x+0.5)*Math.log(tmp);let ser=1.000000000190015;for(let j=0;j<cof.length;j++){y+=1;ser+=cof[j]/y}return -tmp+Math.log(2.5066282746310005*ser/x)}
function propCI(x,n,z=1.96){if(!n)return [NaN,NaN];const p=x/n,se=Math.sqrt(p*(1-p)/n);return [Math.max(0,p-z*se),Math.min(1,p+z*se)]}
function meanStats(vals){const x=vals.filter(v=>Number.isFinite(v));if(!x.length)return null;const mean=x.reduce((a,b)=>a+b,0)/x.length;const sd=x.length>1?Math.sqrt(x.reduce((a,b)=>a+(b-mean)**2,0)/(x.length-1)):0;const med=[...x].sort((a,b)=>a-b);const mid=Math.floor(med.length/2);const median=med.length%2?med[mid]:(med[mid-1]+med[mid])/2;const q=(p)=>{const pos=(x.length-1)*p;const lo=Math.floor(pos),hi=Math.ceil(pos);const z=[...x].sort((a,b)=>a-b);return z[lo]+(z[hi]-z[lo])*(pos-lo)};return {n:x.length,mean,sd,median,q1:q(.25),q3:q(.75)}}
function runResearchAnalysis(){const d=val('studyDesign')||researchState.design||'descriptive';researchState={...researchState,design:d,title:val('studyTitle'),population:val('studyPopulation'),period:val('studyPeriod'),outcome:val('researchOutcome'),exposure:val('researchExposure')};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));const cs=researchCases();const res=document.getElementById('researchResults');if(!res)return;if(!cs.length){res.innerHTML='<div class="notice">Belum ada kasus pada investigasi aktif. Buat/import data terlebih dahulu.</div>';return}let html=`<p><b>Desain:</b> ${esc(researchPlans[d]?.label||d)} · <b>n:</b> ${cs.length}</p>`;if(d==='descriptive'||d==='time-series'||d==='ecological'){const ages=meanStats(cs.map(c=>Number(c.age)));const sex={male:cs.filter(c=>String(c.sex||'').toLowerCase().startsWith('l')).length,female:cs.filter(c=>String(c.sex||'').toLowerCase().startsWith('p')).length};html+=`<h4>Statistik deskriptif</h4><p>Umur: n=${ages?.n||0}, mean=${fmt(ages?.mean)}, SD=${fmt(ages?.sd)}, median=${fmt(ages?.median)}, IQR ${fmt(ages?.q1)}–${fmt(ages?.q3)}.</p><p>Jenis kelamin: laki-laki ${sex.male}, perempuan ${sex.female}.</p>`;}else{let a=0,b=0,c=0,e=0;cs.forEach(x=>{const X=researchExposure(x,researchState.exposure),Y=researchOutcome(x,researchState.outcome);if(typeof Y!=='boolean')return;if(X&&Y)a++;else if(X&&!Y)b++;else if(!X&&Y)c++;else e++;});const n=a+b+c+e;const chiDen=(a+b)*(c+e)*(a+c)*(b+e);const chi=n*(a*e-b*c)**2/Math.max(chiDen,1);const pChi=chi2p1(chi);const fisher=fisherExact2x2(a,b,c,e);const risk1=a/Math.max(a+b,1),risk0=c/Math.max(c+e,1);const rr=risk0?risk1/risk0:Infinity;const or=(a*e)/Math.max(b*c,1);const pr=rr;const rrSe=Math.sqrt((a?1/a:0)-(b?1/(a+b):0)+(c?1/c:0)-(e?1/(c+e):0));const rrCI=rrSe? [Math.exp(Math.log(Math.max(rr,1e-12))-1.96*rrSe),Math.exp(Math.log(Math.max(rr,1e-12))+1.96*rrSe)]:[NaN,NaN];const orSe=Math.sqrt(1/Math.max(a,.5)+1/Math.max(b,.5)+1/Math.max(c,.5)+1/Math.max(e,.5));const orCI=[Math.exp(Math.log(Math.max(or,1e-12))-1.96*orSe),Math.exp(Math.log(Math.max(or,1e-12))+1.96*orSe)];const x1=propCI(a,a+b),x0=propCI(c,c+e);let measure=d.includes('case-control')?`OR ${fmt(or)} (95% CI ${fmt(orCI[0])}–${fmt(orCI[1])})`:d.includes('cohort')?`RR ${fmt(rr)} (95% CI ${fmt(rrCI[0])}–${fmt(rrCI[1])})`:d==='cross-sectional'?`PR ${fmt(pr)} (screening approximation; 95% CI ${fmt(rrCI[0])}–${fmt(rrCI[1])})`:`OR ${fmt(or)}; RR ${fmt(rr)}`;html+=`<h4>Tabel 2×2</h4><table class="report-table"><tr><th></th><th>Outcome +</th><th>Outcome −</th><th>Total</th></tr><tr><th>Exposure +</th><td>${a}</td><td>${b}</td><td>${a+b}</td></tr><tr><th>Exposure −</th><td>${c}</td><td>${e}</td><td>${c+e}</td></tr></table><p><b>Ukuran asosiasi utama:</b> ${measure}</p><p><b>Chi-square p:</b> ${pChi.toFixed(4)} · <b>Fisher exact p:</b> ${fisher.toFixed(4)}</p><p><b>Prevalence/attack proportion exposed:</b> ${(100*risk1).toFixed(1)}% · unexposed: ${(100*risk0).toFixed(1)}%</p><div class="notice">Interpretasi harus mengikuti desain. Pada case-control, attack rate/risk tidak dihitung dari sampling kasus-kontrol; OR adalah ukuran asosiasi utama.</div>`;if(d==='matched-case-control')html+=`<div class="notice">Untuk matched case-control, data pasangan/strata belum tersedia pada model kasus saat ini. Gunakan McNemar untuk pasangan 1:1 atau conditional logistic regression setelah ID pasangan/strata tersedia.</div>`;if(d.includes('cohort'))html+=`<h4>Analisis cohort lanjutan</h4><p>Jika tersedia waktu follow-up/person-time, gunakan incidence rate dan incidence rate ratio. Jika ada waktu sampai event, pertimbangkan Kaplan–Meier/Cox. Jika hanya data 2×2, hasil di atas merupakan analisis risk/attack rate.</p>`;}
researchState.analysis={design:d,n:cs.length,html,generatedAt:new Date().toISOString()};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));res.innerHTML=html;}
function sampleSizeWizard(){const d=val('studyDesign');modal(`<h2>🧮 Kalkulator Sampel — ${esc(researchPlans[d]?.label||d)}</h2><div class="notice">Kalkulator ini memberi estimasi awal. Untuk proposal/tesis/penelitian resmi, parameter prevalensi/risiko, power, alpha, ratio kasus:kontrol, design effect, matching, dan antisipasi non-response harus ditetapkan sesuai pertanyaan penelitian.</div>${f('Alpha (%)','ssAlpha','number','5')}${f('Power (%)','ssPower','number','80')}${f('Proporsi pada kelompok pembanding (%)','ssP0','number','20')}${f('RR yang ingin dideteksi','ssRR','number','2')}${f('Rasio kontrol : kasus (case-control)','ssRatio','number','2')}<button class="primary" onclick="calcSampleSize()">Hitung</button><div id="ssResult" class="notice"></div>`)}
function calcSampleSize(){const alpha=(+val('ssAlpha')||5)/100,power=(+val('ssPower')||80)/100,p0=(+val('ssP0')||20)/100,rr=+val('ssRR')||2,ratio=+val('ssRatio')||2;const zA=1.96,zB=0.84;const p1=Math.min(.999,Math.max(.001,p0*rr));const q1=1-p1,q0=1-p0;const num=(zA*Math.sqrt((1+1/ratio)*((p1*(1-p1))+(p0*(1-p0))/ratio))+zB*Math.sqrt(p1*q1+p0*q0/ratio))**2;const den=(p1-p0)**2;const nCase=Math.ceil(num/den);const nControl=Math.ceil(nCase*ratio);const el=document.getElementById('ssResult');if(el)el.innerHTML=`<b>Estimasi awal:</b> kasus ≈ ${nCase}; kontrol ≈ ${nControl}; total ≈ ${nCase+nControl}.<br><small>Rumus ini hanya pendekatan untuk dua proporsi dan RR target. Untuk matched case-control, cohort dengan loss to follow-up, cluster sampling, atau desain kompleks diperlukan kalkulasi khusus.</small>`;}
function researchReportPreview(){if(!researchState.analysis)runResearchAnalysis();const d=researchState.design,p=researchPlans[d]||researchPlans.descriptive;const o=act();const cs=researchCases();const r=document.getElementById('researchReport');if(!r)return;r.innerHTML=`<div class="report-doc"><h1>${esc(researchState.title||'Laporan Penelitian Epidemiologi')}</h1><p><b>Desain:</b> ${esc(p.label)}<br><b>Populasi:</b> ${esc(researchState.population||'-')}<br><b>Periode:</b> ${esc(researchState.period||'-')}<br><b>Setting/investigasi:</b> ${esc(o?.name||'-')}</p><h2>Abstrak</h2><p><b>Latar belakang:</b> Jelaskan masalah kesehatan dan alasan penelitian.</p><p><b>Metode:</b> ${esc(p.label)}; n=${cs.length}. Variabel utama dan analisis mengikuti rencana penelitian.</p><p><b>Hasil:</b> Ringkasan otomatis tersedia pada bagian hasil analisis di bawah.</p><p><b>Kesimpulan:</b> Harus ditulis setelah validasi hasil dan mempertimbangkan bias/confounding.</p><h2>1. Pendahuluan</h2><p>Latar belakang, besaran masalah, tinjauan pustaka, gap pengetahuan, dan tujuan.</p><h2>2. Metode Penelitian</h2><p><b>Desain:</b> ${esc(p.label)}.</p><p><b>Populasi/sampel:</b> ${esc(researchState.population||'-')}.</p><p><b>Variabel:</b> outcome=${esc(researchState.outcome)}, exposure=${esc(researchState.exposure)}.</p><p><b>Analisis:</b> ${esc(p.measure)}; ${esc(p.tests)}</p><h2>3. Hasil</h2>${researchState.analysis?.html||'<p>Belum ada hasil.</p>'}<h2>4. Pembahasan</h2><p>Bahas besar asosiasi, ketepatan/ketidakpastian, kemungkinan bias, confounding, consistency dengan literatur, dan implikasi.</p><h2>5. Keterbatasan</h2><p>Jelaskan selection bias, information bias, recall bias, confounding, missing data, dan keterbatasan generalisasi bila relevan.</p><h2>6. Kesimpulan</h2><p>Kesimpulan harus sesuai estimasi dan desain; hindari menyatakan kausalitas dari studi observasional tanpa dasar yang memadai.</p><h2>7. Rekomendasi</h2><p>Rekomendasi program atau penelitian lanjutan berdasarkan hasil.</p><h2>Daftar Pustaka</h2><p>Tambahkan referensi primer/pedoman yang digunakan.</div>`;}
function exportResearchJSON(){const payload={app:'GORUT-OUTBREAK AI',module:'Research Analysis Engine',version:'v20',plan:researchState,designGuide:researchPlans[researchState.design||'descriptive']};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='gorut-research-study.json';a.click();}
function initResearch(){if(!document.getElementById('studyDesign'))return;document.getElementById('studyDesign').value=researchState.design||'descriptive';document.getElementById('studyTitle').value=researchState.title||'';document.getElementById('studyPopulation').value=researchState.population||'';document.getElementById('studyPeriod').value=researchState.period||'';document.getElementById('researchOutcome').value=researchState.outcome||'status';document.getElementById('researchExposure').value=researchState.exposure||'contact';applyStudyDesign();if(researchState.analysis)document.getElementById('researchResults').innerHTML=researchState.analysis.html;}
const _renderOriginal=render;render=function(){_renderOriginal();initResearch();};

// v21 Advanced Biostatistics Engine
function advVal(c,key){
  if(!key)return null;
  key=String(key).trim();
  if(!key)return null;
  if(key.startsWith('answers.')){let v=c.answers;for(const k of key.slice(8).split('.'))v=v?.[k];return v}
  if(key.includes('.')){let v=c;for(const k of key.split('.'))v=v?.[k];return v}
  return c[key];
}
function binVal(v){
  if(typeof v==='boolean')return v?1:0;
  if(v===null||v===undefined||v==='')return null;
  const s=String(v).trim().toLowerCase();
  if(['1','ya','yes','true','positif','positive','kasus','konfirmasi','confirmed','l','laki-laki','male'].includes(s))return 1;
  if(['0','tidak','no','false','negatif','negative','kontrol','suspek?','p','perempuan','female'].includes(s))return 0;
  const n=Number(v);return Number.isFinite(n)&&[0,1].includes(n)?n:null;
}
function numVal(v){if(v===null||v===undefined||v==='')return null;const n=Number(v);return Number.isFinite(n)?n:null}
function researchRows(outcome, exposure, covars=[]){
  const cs=researchCases(); const rows=[]; let miss=0;
  cs.forEach(c=>{const y=binVal(advVal(c,outcome));const x=binVal(advVal(c,exposure));const z=covars.map(k=>{const v=advVal(c,k);const n=numVal(v);if(n!==null)return n;const b=binVal(v);return b});if(y===null||x===null||z.some(v=>v===null)){miss++;return}rows.push({c,y,x,z})});
  return {rows,missing:miss,total:cs.length};
}
function matSolve(A,b){const n=b.length,M=A.map((r,i)=>r.slice().concat([b[i]]));for(let i=0;i<n;i++){let p=i;for(let j=i+1;j<n;j++)if(Math.abs(M[j][i])>Math.abs(M[p][i]))p=j;if(Math.abs(M[p][i])<1e-10)return null;[M[i],M[p]]=[M[p],M[i]];const q=M[i][i];for(let j=i;j<=n;j++)M[i][j]/=q;for(let k=0;k<n;k++){if(k===i)continue;const f=M[k][i];for(let j=i;j<=n;j++)M[k][j]-=f*M[i][j]}}return M.map(r=>r[n])}
function matInv(A){const n=A.length,I=A.map((r,i)=>r.map((_,j)=>i===j?1:0));for(let i=0;i<n;i++){let p=i;for(let j=i+1;j<n;j++)if(Math.abs(A[j][i])>Math.abs(A[p][i]))p=j;if(Math.abs(A[p][i])<1e-10)return null;[A[i],A[p]]=[A[p],A[i]];[I[i],I[p]]=[I[p],I[i]];const q=A[i][i];for(let j=0;j<n;j++){A[i][j]/=q;I[i][j]/=q}for(let k=0;k<n;k++){if(k===i)continue;const f=A[k][i];for(let j=0;j<n;j++){A[k][j]-=f*A[i][j];I[k][j]-=f*I[i][j]}}}return I}
function normalP(z){return 0.5*Math.erfc?0.5*Math.erfc(Math.abs(z)/Math.SQRT2):normalPApprox(z)}
function normalPApprox(z){const x=Math.abs(z);const t=1/(1+0.2316419*x),d=.39894228*Math.exp(-x*x/2),p=d*t*(.31938153+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return Math.min(1,2*p)}
function logisticFit(rows,k){
  const X=rows.map(r=>[1,r.x,...r.z]);const y=rows.map(r=>r.y);const p=k+2;let beta=Array(p).fill(0),cov=null;
  for(let it=0;it<50;it++){
    const eta=X.map(row=>row.reduce((s,v,j)=>s+v*beta[j],0));const mu=eta.map(e=>1/(1+Math.exp(-Math.max(-30,Math.min(30,e)))));const W=X.map((row,i)=>row.map(v=>v));const A=Array.from({length:p},()=>Array(p).fill(0)),g=Array(p).fill(0);
    for(let i=0;i<X.length;i++){const w=Math.max(mu[i]*(1-mu[i]),1e-7);for(let j=0;j<p;j++){g[j]+=X[i][j]*(y[i]-mu[i]);for(let l=0;l<p;l++)A[j][l]+=w*X[i][j]*X[i][l]}}
    const step=matSolve(A,g);if(!step)break;let max=0;for(let j=0;j<p;j++){beta[j]+=step[j];max=Math.max(max,Math.abs(step[j]))}if(max<1e-7){cov=matInv(A);break}if(it===49)cov=matInv(A)}
  if(!cov)return null;const se=beta.map((_,i)=>Math.sqrt(Math.max(cov[i][i],0)));const table=beta.map((b,i)=>{const z=se[i]?b/se[i]:NaN;const pval=Number.isFinite(z)?normalPApprox(z):NaN;return {b,se:z?se[i]:se[i],OR:Math.exp(b),lo:Math.exp(b-1.96*se[i]),hi:Math.exp(b+1.96*se[i]),p:pval}});return {beta,se,table,n:rows.length,p};
}
function runAdvancedAnalysis(){
  const out=(document.getElementById('advOutcome')?.value||researchState.outcome||'status').trim();const exp=(document.getElementById('advExposure')?.value||researchState.exposure||'contact').trim();const cov=(document.getElementById('advCovariates')?.value||'').split(',').map(x=>x.trim()).filter(Boolean);const box=document.getElementById('advancedResults');if(!box)return;const d=researchRows(out,exp,cov);if(d.rows.length<Math.max(20,cov.length+10)){box.innerHTML=`<b>Data belum memadai untuk model multivariat.</b><br>Observasi lengkap: ${d.rows.length}/${d.total}; missing/tidak valid: ${d.missing}. Minimal operasional disarankan ≥20 observasi lengkap, tetapi kecukupan sampel/event harus dinilai berdasarkan desain dan kompleksitas model.`;return}
  const fit=logisticFit(d.rows,cov.length);if(!fit){box.innerHTML='<b>Model tidak dapat diestimasi.</b> Periksa variasi outcome/exposure, kolinearitas sempurna, dan jumlah event.';return}
  const names=['Intercept',exp,...cov];let html=`<h4>Regresi logistik multivariat</h4><p>Outcome: <b>${esc(out)}</b> · Exposure utama: <b>${esc(exp)}</b> · n lengkap=${fit.n}; missing=${d.missing}.</p><table class="report-table"><tr><th>Variabel</th><th>Adjusted OR</th><th>95% CI</th><th>p Wald</th></tr>`;fit.table.forEach((r,i)=>html+=`<tr><td>${esc(names[i])}</td><td>${fmt(r.OR)}</td><td>${fmt(r.lo)}–${fmt(r.hi)}</td><td>${Number.isFinite(r.p)?r.p.toFixed(4):'-'}</td></tr>`);html+='</table>';
  const crudeRows=researchRows(out,exp,[]).rows;let crude=null;if(crudeRows.length){let a=0,b=0,c=0,e=0;crudeRows.forEach(r=>{if(r.x&&r.y)a++;else if(r.x&&!r.y)b++;else if(!r.x&&r.y)c++;else e++});crude=(a*e)/Math.max(b*c,1)}const adj=fit.table[1]?.OR;const change=crude&&Number.isFinite(adj)?Math.abs(adj-crude)/Math.abs(crude)*100:null;html+=`<p><b>OR crude:</b> ${fmt(crude)} · <b>OR adjusted:</b> ${fmt(adj)}${change!==null?` · perubahan absolut relatif ${change.toFixed(1)}%`:''}.</p><div class="notice">Penilaian confounding tidak ditentukan hanya oleh p-value. Bandingkan estimasi crude dan adjusted berdasarkan rencana kausal/DAG, pengetahuan epidemiologi, dan kriteria yang ditetapkan sebelum analisis. Interaksi/effect modification perlu diuji dengan term interaksi yang direncanakan.</div>`;researchState.advanced={type:'logistic',outcome:out,exposure:exp,covariates:cov,result:{n:fit.n,missing:d.missing,table:fit.table,crudeOR:crude,adjustedOR:adj,changePct:change}};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));box.innerHTML=html;}
function strataKey(c,key){const v=advVal(c,key);return v===null||v===undefined||v===''?'Missing':String(v)}
function table2(rows){let a=0,b=0,c=0,d=0;rows.forEach(r=>{if(r.x&&r.y)a++;else if(r.x&&!r.y)b++;else if(!r.x&&r.y)c++;else d++});return {a,b,c,d}}
function runMHAnalysis(){const exp=(document.getElementById('advExposure')?.value||researchState.exposure||'contact').trim(),out=(document.getElementById('advOutcome')?.value||researchState.outcome||'status').trim(),sk=(document.getElementById('advStrata')?.value||'').trim(),box=document.getElementById('advancedResults');if(!sk){if(box)box.innerHTML='<b>Masukkan field strata</b>, misalnya sex, desa, pendidikan, atau answers.strata.';return}const groups={};researchCases().forEach(c=>{const y=binVal(advVal(c,out)),x=binVal(advVal(c,exp));if(y===null||x===null)return;(groups[strataKey(c,sk)]??=[]).push({x,y})});let num=0,den=0,total=0,html=`<h4>Mantel–Haenszel stratified analysis</h4><table class="report-table"><tr><th>Strata</th><th>a</th><th>b</th><th>c</th><th>d</th><th>OR strata</th></tr>`;Object.entries(groups).forEach(([g,rows])=>{const t=table2(rows);total+=rows.length;const or=t.b*t.c?(t.a*t.d)/(t.b*t.c):NaN;html+=`<tr><td>${esc(g)}</td><td>${t.a}</td><td>${t.b}</td><td>${t.c}</td><td>${t.d}</td><td>${fmt(or)}</td></tr>`;num+=t.a*t.d/Math.max(rows.length,1);den+=t.b*t.c/Math.max(rows.length,1)});const mh=den?num/den:NaN;html+=`</table><p><b>Common OR Mantel–Haenszel:</b> ${fmt(mh)}</p><div class="notice">MH memberikan ukuran asosiasi gabungan setelah stratifikasi. Homogenitas efek antarstrata/effect modification tetap perlu diperiksa; jangan menggabungkan strata secara otomatis bila efek sangat berbeda.</div>`;if(box)box.innerHTML=html;researchState.advancedMH={exposure:exp,outcome:out,strata:sk,ORmh:mh,total};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));}
function runMatchedAnalysis(){const exp=(document.getElementById('advExposure')?.value||researchState.exposure||'contact').trim(),out=(document.getElementById('advOutcome')?.value||researchState.outcome||'status').trim(),pk=(document.getElementById('advPairId')?.value||'pairId').trim(),box=document.getElementById('advancedResults');if(!pk){if(box)box.innerHTML='<b>Masukkan field pair ID</b>, misalnya pairId.';return}const g={};researchCases().forEach(c=>{const id=advVal(c,pk),y=binVal(advVal(c,out)),x=binVal(advVal(c,exp));if(id===null||y===null||x===null)return;(g[id]??=[]).push({x,y})});let b=0,c=0,pairs=0;Object.values(g).forEach(rows=>{if(rows.length!==2)return;const caseRow=rows.find(r=>r.y===1),ctrl=rows.find(r=>r.y===0);if(!caseRow||!ctrl)return;pairs++;if(caseRow.x===1&&ctrl.x===0)b++;if(caseRow.x===0&&ctrl.x===1)c++});const or=c?b/c:Infinity;const chi=(b-c)**2/Math.max(b+c,1),p=chi2p1(chi);if(box)box.innerHTML=`<h4>Matched case-control — McNemar</h4><p>Pasangan valid: <b>${pairs}</b> · discordant case exposed/control unexposed (b)=${b} · case unexposed/control exposed (c)=${c}.</p><p><b>Matched OR:</b> ${fmt(or)} · <b>McNemar χ²:</b> ${fmt(chi)} · <b>p:</b> ${fmt(p,4)}</p><div class="notice">Conditional logistic regression masih memerlukan struktur matched set yang konsisten. McNemar digunakan untuk pasangan 1:1 dengan outcome case/control dan exposure biner.</div>`;researchState.matched={pairs,b,c,OR:or,p};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));}
function runPersonTimeAnalysis(){const exp=(document.getElementById('advExposure')?.value||researchState.exposure||'contact').trim(),out=(document.getElementById('advOutcome')?.value||researchState.outcome||'status').trim(),pk=(document.getElementById('advPersonTime')?.value||'personTime').trim(),box=document.getElementById('advancedResults');const groups={};researchCases().forEach(c=>{const x=binVal(advVal(c,exp)),y=binVal(advVal(c,out)),pt=numVal(advVal(c,pk));if(x===null||y===null||pt===null||pt<=0)return;(groups[x]??={events:0,pt:0,n:0});groups[x].events+=y;groups[x].pt+=pt;groups[x].n++});const r1=groups[1],r0=groups[0];if(!r1||!r0){if(box)box.innerHTML='<b>Data person-time belum lengkap</b> pada kedua kelompok exposure.';return}const ir1=r1.events/r1.pt,ir0=r0.events/r0.pt,irr=ir0?ir1/ir0:Infinity;const se=Math.sqrt(1/Math.max(r1.events,1)+1/Math.max(r0.events,1));const ci=[Math.exp(Math.log(Math.max(irr,1e-12))-1.96*se),Math.exp(Math.log(Math.max(irr,1e-12))+1.96*se)];if(box)box.innerHTML=`<h4>Cohort — incidence rate / incidence rate ratio</h4><table class="report-table"><tr><th>Kelompok</th><th>n</th><th>Events</th><th>Person-time</th><th>Incidence rate</th></tr><tr><td>Exposure +</td><td>${r1.n}</td><td>${r1.events}</td><td>${fmt(r1.pt)}</td><td>${fmt(ir1)}</td></tr><tr><td>Exposure −</td><td>${r0.n}</td><td>${r0.events}</td><td>${fmt(r0.pt)}</td><td>${fmt(ir0)}</td></tr></table><p><b>IRR:</b> ${fmt(irr)} (95% CI ${fmt(ci[0])}–${fmt(ci[1])})</p><div class="notice">Pastikan satuan person-time konsisten (misalnya person-years atau person-months). Jika event sangat sedikit, pendekatan CI perlu dipilih hati-hati.</div>`;researchState.personTime={exposure:exp,outcome:out,field:pk,IRR:irr,CI:ci,groups};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));}
function advancedReportBlock(){const a=researchState.advanced,m=researchState.advancedMH,mt=researchState.matched,pt=researchState.personTime;let h='';if(a)h+=`<h3>Analisis multivariat</h3><p>Regresi logistik menghasilkan OR adjusted ${fmt(a.adjustedOR)} untuk exposure utama, dibandingkan OR crude ${fmt(a.crudeOR)}; n lengkap ${a.n}, missing ${a.missing}.</p>`;if(m)h+=`<p>Analisis Mantel–Haenszel: common OR=${fmt(m.ORmh)} dengan strata ${esc(m.strata)}.</p>`;if(mt)h+=`<p>Matched case-control: ${mt.pairs} pasangan valid; matched OR=${fmt(mt.OR)}; McNemar p=${fmt(mt.p,4)}.</p>`;if(pt)h+=`<p>Cohort person-time: IRR=${fmt(pt.IRR)} (95% CI ${fmt(pt.CI?.[0])}–${fmt(pt.CI?.[1])}).</p>`;return h}
const _researchReportPreviewV21=researchReportPreview;researchReportPreview=function(){_researchReportPreviewV21();const r=document.getElementById('researchReport');if(r&&advancedReportBlock())r.querySelector('.report-doc')?.insertAdjacentHTML('beforeend',advancedReportBlock())}
const _exportResearchJSONV21=exportResearchJSON;exportResearchJSON=function(){const payload={app:'GORUT-OUTBREAK AI',module:'Research Analysis Engine',version:'v21',plan:researchState,designGuide:researchPlans[researchState.design||'descriptive']};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='gorut-research-study-v21.json';a.click()}

/* ================= GORUT-OUTBREAK AI v22: Statistical Validation & Survival Engine ================= */
function v22Date(c,key){const v=advVal(c,key);if(v===null||v===undefined||v==='')return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d;}
function v22KM(rows,timeKey,eventKey){
  const a=rows.map(c=>({t:numVal(advVal(c,timeKey)),e:binVal(advVal(c,eventKey))})).filter(x=>Number.isFinite(x.t)&&x.t>=0&&x.e!==null).sort((a,b)=>a.t-b.t);
  if(!a.length)return null;let n=a.length,s=1,varS=0,last=0,table=[];
  const times=[...new Set(a.map(x=>x.t))];
  times.forEach(t=>{const at=a.filter(x=>x.t===t),d=at.filter(x=>x.e===1).length,c=at.filter(x=>x.e===0).length,r=a.filter(x=>x.t>=t).length;if(d){s*=1-d/Math.max(r,1);if(r-d>0)varS+=d/(r*Math.max(r-d,1));table.push({time:t,atRisk:r,events:d,censored:c,survival:s,se:s*Math.sqrt(varS)});}});
  return {n:a.length,table};
}
function v22KMAnalysis(){const tk=(document.getElementById('advTime')?.value||'timeToEvent').trim(),ek=(document.getElementById('advEvent')?.value||document.getElementById('advOutcome')?.value||'status').trim(),box=document.getElementById('advancedResults');const rows=researchCases();const km=v22KM(rows,tk,ek);if(!km){if(box)box.innerHTML='<b>Kaplan–Meier:</b> data waktu/event belum lengkap atau tidak valid.';return}let median='Belum tercapai';const hit=km.table.find(x=>x.survival<=.5);if(hit)median=hit.time;let h=`<h4>Kaplan–Meier</h4><p>n=${km.n} · time=${esc(tk)} · event=${esc(ek)} · median survival: <b>${fmt(median)}</b></p><table class="report-table"><tr><th>Time</th><th>At risk</th><th>Event</th><th>Censored</th><th>S(t)</th><th>SE Greenwood</th></tr>`;km.table.forEach(x=>h+=`<tr><td>${fmt(x.time)}</td><td>${x.atRisk}</td><td>${x.events}</td><td>${x.censored}</td><td>${fmt(x.survival)}</td><td>${fmt(x.se)}</td></tr>`);h+='</table><div class="notice">Untuk membandingkan dua atau lebih kurva survival, gunakan log-rank test; tabel ini belum mengklaim hasil uji antar-kelompok.</div>';if(box)box.innerHTML=h;researchState.km={time:tk,event:ek,n:km.n,median,table:km.table};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));}
function v22PoissonRobust(rows,k){
  const X=rows.map(r=>[1,...r.x]);const y=rows.map(r=>r.y);const p=X[0]?.length||0;let beta=Array(p).fill(0),cov=null;
  for(let it=0;it<80;it++){const mu=X.map(row=>Math.exp(Math.max(-20,Math.min(20,row.reduce((s,v,j)=>s+v*beta[j],0)))));const A=Array.from({length:p},()=>Array(p).fill(0)),g=Array(p).fill(0);for(let i=0;i<X.length;i++){for(let j=0;j<p;j++){g[j]+=X[i][j]*(y[i]-mu[i]);for(let l=0;l<p;l++)A[j][l]+=mu[i]*X[i][j]*X[i][l]}}const step=matSolve(A,g);if(!step)break;let max=0;for(let j=0;j<p;j++){beta[j]+=step[j];max=Math.max(max,Math.abs(step[j]))}if(max<1e-8){cov=matInv(A);break}}
  if(!cov)cov=matInv(Array.from({length:p},(_,j)=>Array.from({length:p},(_,l)=>X.reduce((s,row,i)=>s+Math.exp(Math.max(-20,Math.min(20,row.reduce((q,v,z)=>q+v*beta[z],0))))*row[j]*row[l],0))));if(!cov)return null;
  const mu=X.map(row=>Math.exp(Math.max(-20,Math.min(20,row.reduce((s,v,j)=>s+v*beta[j],0)))));const meat=Array.from({length:p},()=>Array(p).fill(0));for(let i=0;i<X.length;i++){const u=y[i]-mu[i];for(let j=0;j<p;j++)for(let l=0;l<p;l++)meat[j][l]+=u*u*X[i][j]*X[i][l]};const rob=matMul(matMul(cov,meat),cov);const se=beta.map((_,i)=>Math.sqrt(Math.max(rob[i][i],0)));return {beta,se,table:beta.map((b,i)=>{const z=se[i]?b/se[i]:NaN;return {RR:Math.exp(b),lo:Math.exp(b-1.96*se[i]),hi:Math.exp(b+1.96*se[i]),p:Number.isFinite(z)?normalPApprox(z):NaN}}),n:rows.length};
}
function matMul(A,B){return A.map((r,i)=>B[0].map((_,j)=>r.reduce((s,_,k)=>s+(A[i][k]||0)*(B[k][j]||0),0)))}
function v22PoissonAnalysis(){const out=(document.getElementById('advOutcome')?.value||'status').trim(),exp=(document.getElementById('advExposure')?.value||'contact').trim(),cov=(document.getElementById('advCovariates')?.value||'').split(',').map(x=>x.trim()).filter(Boolean),box=document.getElementById('advancedResults');const d=researchRows(out,exp,cov);if(d.rows.length<10){if(box)box.innerHTML='<b>Robust Poisson:</b> observasi lengkap belum memadai.';return}const fit=v22PoissonRobust(d.rows.map(r=>({x:[r.x,...r.cov],y:r.y})),cov.length+1);if(!fit){if(box)box.innerHTML='<b>Model gagal diestimasi.</b> Periksa variasi data dan kolinearitas.';return}const names=['Intercept',exp,...cov];let h=`<h4>Modified/Robust Poisson — prevalence/risk ratio approximation</h4><p>n lengkap=${fit.n}; outcome=${esc(out)}.</p><table class="report-table"><tr><th>Variabel</th><th>Ratio</th><th>95% CI</th><th>p</th></tr>`;fit.table.forEach((r,i)=>h+=`<tr><td>${esc(names[i])}</td><td>${fmt(r.RR)}</td><td>${fmt(r.lo)}–${fmt(r.hi)}</td><td>${fmt(r.p,4)}</td></tr>`);h+='</table><div class="notice">Model Poisson dengan robust variance dapat digunakan untuk estimasi rasio pada outcome biner, tetapi pemilihan model harus mengikuti desain, prevalensi outcome, dan asumsi analisis.</div>';if(box)box.innerHTML=h;researchState.robustPoisson={outcome:out,exposure:exp,covariates:cov,result:fit};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));}
function v22Validation(){const box=document.getElementById('advancedResults');const rows=[];for(let i=0;i<20;i++)rows.push({x:[i%2],y:i%4===0?1:0});const fit=v22PoissonRobust(rows,1);const km=v22KM([{t:1,e:1},{t:2,e:0},{t:3,e:1},{t:4,e:0}], 't','e');const checks=[['Matrix inverse/solver',!!matInv([[2,0],[0,2]])],['Robust Poisson convergence',!!fit&&fit.table.length===2],['Kaplan–Meier table',!!km&&km.table.length===2],['Fisher exact available',typeof fisherExact2x2==='function'],['Logistic regression available',typeof logisticFit==='function']];const passed=checks.filter(x=>x[1]).length;let h=`<h4>Statistical Engine Validation</h4><p><b>${passed}/${checks.length}</b> internal checks passed.</p><table class="report-table"><tr><th>Komponen</th><th>Status</th></tr>`;checks.forEach(x=>h+=`<tr><td>${esc(x[0])}</td><td>${x[1]?'PASS':'FAIL'}</td></tr>`);h+='</table><div class="notice">Validasi internal hanya memeriksa fungsi dasar mesin. Sebelum hasil digunakan untuk tesis/disertasi/publikasi, bandingkan dataset uji dan hasilnya dengan perangkat statistik tervalidasi seperti R/Stata/SPSS.</div>';if(box)box.innerHTML=h;return checks;}
function v22ReportBlock(){let h='';if(researchState.km)h+=`<h3>Analisis survival</h3><p>Kaplan–Meier: n=${researchState.km.n}; median survival=${fmt(researchState.km.median)}; waktu=${esc(researchState.km.time)}; event=${esc(researchState.km.event)}.</p>`;if(researchState.robustPoisson)h+=`<h3>Modified/Robust Poisson</h3><p>Model menghasilkan estimasi rasio adjusted sesuai variabel yang dimasukkan. Hasil harus ditafsirkan berdasarkan desain dan struktur sampling.</p>`;return h}
const _advReportV22=advancedReportBlock;advancedReportBlock=function(){return _advReportV22()+v22ReportBlock()}
const _exportResearchJSONV22=exportResearchJSON;exportResearchJSON=function(){const payload={app:'GORUT-OUTBREAK AI',module:'Research Analysis Engine',version:'v22',plan:researchState,designGuide:researchPlans[researchState.design||'descriptive'],validation:'Internal checks included; external statistical validation required before publication.'};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='gorut-research-study-v22.json';a.click()}

/* ===================== v23 RESEARCH DATA MANAGEMENT & PUBLICATION ENGINE ===================== */
function parseVarDictionary(){
  const raw=(document.getElementById('varDictionary')?.value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
  return raw.map(line=>{const a=line.split('|').map(x=>x.trim());return {name:a[0]||'',label:a[1]||a[0]||'',type:a[2]||'unknown',role:a[3]||'covariate'};}).filter(x=>x.name);
}
function saveResearchDictionary(){
  const dict=parseVarDictionary();
  researchState.dictionary=dict;
  researchState.definitions=document.getElementById('varDefinitions')?.value||'';
  researchState.dag=document.getElementById('researchDAG')?.value||'';
  researchState.methodNotes=document.getElementById('researchMethodNotes')?.value||'';
  localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));
  const box=document.getElementById('variableDiscovery');
  if(box)box.innerHTML=`<b>Dictionary tersimpan:</b> ${dict.length} variabel. Peran: ${dict.filter(x=>x.role==='exposure').length} exposure, ${dict.filter(x=>x.role==='outcome').length} outcome, ${dict.filter(x=>/confound/i.test(x.role)).length} confounder, ${dict.filter(x=>!['exposure','outcome'].includes(x.role)&&!/confound/i.test(x.role)).length} lainnya.`;
}
function discoverResearchVariables(){
  const cs=researchCases(); const found=new Map();
  cs.forEach(c=>{Object.keys(c||{}).forEach(k=>found.set(k,{name:k,label:k,type:typeof c[k]==='number'?'numeric':'unknown',role:'covariate'}));Object.keys(c.answers||{}).forEach(k=>found.set(`answers.${k}`,{name:`answers.${k}`,label:k,type:typeof c.answers[k]==='number'?'numeric':'unknown',role:'covariate'}));});
  const arr=[...found.values()].sort((a,b)=>a.name.localeCompare(b.name));
  const box=document.getElementById('variableDiscovery');
  if(box)box.innerHTML=arr.length?`<b>${arr.length} variabel terdeteksi</b><br>${arr.map(x=>`<code>${esc(x.name)}</code>`).join(' · ')}<br><small>Salin nama variabel yang diperlukan ke dictionary. Variabel kuesioner menggunakan format <code>answers.namaField</code>.</small>`:'Belum ada variabel pada data kasus aktif.';
}
function loadResearchDictionaryUI(){
  const d=researchState.dictionary||[];
  const el=document.getElementById('varDictionary'); if(el&&d.length&&!el.value)el.value=d.map(x=>`${x.name} | ${x.label} | ${x.type} | ${x.role}`).join('\n');
  const def=document.getElementById('varDefinitions');if(def&&researchState.definitions&&!def.value)def.value=researchState.definitions;
  const dag=document.getElementById('researchDAG');if(dag&&researchState.dag&&!dag.value)dag.value=researchState.dag;
  const notes=document.getElementById('researchMethodNotes');if(notes&&researchState.methodNotes&&!notes.value)notes.value=researchState.methodNotes;
}
function variableValues(name){return researchCases().map(c=>advVal(c,name)).filter(v=>v!==null&&v!==undefined&&v!=='');}
function summarizeVar(v){
  const vals=variableValues(v.name); const miss=researchCases().length-vals.length;
  if(!vals.length)return {n:0,missing:miss};
  if(v.type==='numeric'||vals.every(x=>Number.isFinite(Number(x)))){const nums=vals.map(Number).filter(Number.isFinite);const m=nums.reduce((a,b)=>a+b,0)/nums.length;const sd=Math.sqrt(nums.length>1?nums.reduce((a,b)=>a+(b-m)**2,0)/(nums.length-1):0);return {n:nums.length,missing:miss,mean:m,sd,min:Math.min(...nums),max:Math.max(...nums)};}
  const freq={};vals.forEach(x=>{const k=String(x);freq[k]=(freq[k]||0)+1;});return {n:vals.length,missing:miss,freq};
}
function generatePublicationTables(){
  const dict=parseVarDictionary().length?parseVarDictionary():(researchState.dictionary||[]);
  if(!dict.length){const b=document.getElementById('publicationTables');if(b)b.innerHTML='<div class="notice">Variable dictionary masih kosong. Tambahkan variabel lalu simpan.</div>';return;}
  researchState.dictionary=dict;localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));
  const n=researchCases().length;let html=`<h4>Table 1. Karakteristik subjek penelitian</h4><table class="report-table"><tr><th>Variabel</th><th>n</th><th>Ringkasan</th><th>Missing</th></tr>`;
  dict.forEach(v=>{const s=summarizeVar(v);let sum='-';if(s.freq)sum=Object.entries(s.freq).map(([k,c])=>`${esc(k)}: ${c} (${(100*c/Math.max(s.n,1)).toFixed(1)}%)`).join('<br>');else if(s.n)sum=`Mean ${fmt(s.mean)} ± ${fmt(s.sd)}; range ${fmt(s.min)}–${fmt(s.max)}`;html+=`<tr><td>${esc(v.label)}<br><small>${esc(v.name)} · ${esc(v.role)}</small></td><td>${s.n}</td><td>${sum}</td><td>${s.missing}</td></tr>`});
  html+=`</table><h4>Table 2. Kerangka analitik</h4><table class="report-table"><tr><th>Peran</th><th>Variabel</th><th>Definisi/coding</th></tr>`;
  dict.forEach(v=>{html+=`<tr><td>${esc(v.role)}</td><td>${esc(v.label)} <small>(${esc(v.name)})</small></td><td>${esc(researchState.definitions||'Isi definisi operasional dan coding pada dictionary.')}</td></tr>`});
  html+=`</table><h4>Table 3. Catatan pelaporan</h4><div class="notice">Total data kasus aktif: <b>${n}</b>. Tabel ini merupakan keluaran aplikasi dan harus diperiksa terhadap data mentah, definisi variabel, desain sampling, serta rencana analisis sebelum dimasukkan ke manuskrip.</div>`;
  const b=document.getElementById('publicationTables');if(b)b.innerHTML=html;researchState.publicationTables={generatedAt:new Date().toISOString(),n,html};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));
}
function generateDAGView(){
  const raw=(document.getElementById('researchDAG')?.value||researchState.dag||'').trim();const b=document.getElementById('dagView');if(!b)return;
  const edges=raw.split(/\n+/).map(x=>x.trim()).filter(x=>x.includes('→')||x.includes('->')).map(x=>x.replace(/->/g,'→').split('→').map(y=>y.trim())).filter(x=>x.length>=2);
  if(!edges.length){b.innerHTML='<b>DAG belum didefinisikan.</b><br>Gunakan satu hubungan per baris, misalnya <code>usia → paparan</code>.';return;}
  const nodes=[...new Set(edges.flat())];const indeg={};nodes.forEach(n=>indeg[n]=0);edges.forEach(e=>indeg[e[1]]=(indeg[e[1]]||0)+1);
  b.innerHTML=`<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">${nodes.map(n=>`<span class="notice" style="display:inline-block"><b>${esc(n)}</b><br><small>in-degree ${indeg[n]||0}</small></span>`).join('<span>→</span>')}</div><hr><b>Edges:</b><br>${edges.map(e=>`${esc(e[0])} → ${esc(e[1])}`).join('<br>')}<br><small>DAG di sini adalah representasi konseptual. Aplikasi tidak menyimpulkan kausalitas secara otomatis.</small>`;
  researchState.dag=raw;localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));
}
function exportResearchHTML(){
  const title=researchState.title||'Laporan Penelitian Epidemiologi';
  const tables=researchState.publicationTables?.html||'';
  const analysis=researchState.analysis?.html||'';
  const adv=researchState.advanced?.result?`<h2>Analisis Multivariat</h2><pre>${esc(JSON.stringify(researchState.advanced.result,null,2))}</pre>`:'';
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;line-height:1.55;color:#222}h1,h2,h3{color:#17324d}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #bbb;padding:7px;text-align:left}th{background:#eee}.note{padding:12px;background:#f5f7fa;border-left:4px solid #496}small{color:#666}</style></head><body><h1>${esc(title)}</h1><p><b>Desain:</b> ${esc(researchPlans[researchState.design]?.label||researchState.design||'-')}<br><b>Populasi:</b> ${esc(researchState.population||'-')}<br><b>Periode:</b> ${esc(researchState.period||'-')}</p><h2>Metode dan Variabel</h2><p>${esc(researchState.methodNotes||'')}</p>${tables}<h2>Hasil Analisis</h2>${analysis}${adv}<h2>DAG</h2><pre>${esc(researchState.dag||'')}</pre><p class="note">Dokumen ini adalah draft analitik dari GORUT-OUTBREAK AI. Verifikasi peneliti diperlukan sebelum digunakan sebagai laporan resmi atau publikasi.</p></body></html>`;
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));a.download='GORUT-Research-Report-v23.html';a.click();
}
const _initResearchV23=initResearch;initResearch=function(){_initResearchV23();loadResearchDictionaryUI();};
const _researchReportPreviewV23=researchReportPreview;researchReportPreview=function(){_researchReportPreviewV23();const r=document.getElementById('researchReport');const doc=r?.querySelector('.report-doc');if(doc){if(researchState.publicationTables?.html)doc.insertAdjacentHTML('beforeend',`<h2>Research Tables</h2>${researchState.publicationTables.html}`);if(researchState.dag)doc.insertAdjacentHTML('beforeend',`<h2>Kerangka Analitik / DAG</h2><pre>${esc(researchState.dag)}</pre>`);if(researchState.methodNotes)doc.insertAdjacentHTML('beforeend',`<h2>Catatan Metodologi</h2><p>${esc(researchState.methodNotes)}</p>`);}}
const _exportResearchJSONV23=exportResearchJSON;exportResearchJSON=function(){const payload={app:'GORUT-OUTBREAK AI',module:'Research Analysis & Publication Engine',version:'v23',plan:researchState,validation:'Analytical outputs require review against raw data and an independent statistical reference before publication.'};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='gorut-research-study-v23.json';a.click()};

/* ===================== v24 RESEARCH STUDIO ===================== */
function researchDatasetRows(){return Array.isArray(researchState.dataset?.rows)?researchState.dataset.rows:[]}
function researchCases(){return researchState.dataSource==='dataset'&&researchDatasetRows().length?researchDatasetRows():currentCases()}
function normalizeResearchValue(v){if(v===undefined||v===null)return null;const s=String(v).trim();if(!s)return null;const tokens=(val('researchMissingTokens')||'NA,N/A,.,-,kosong,null,NULL').split(',').map(x=>x.trim().toLowerCase());if(tokens.includes(s.toLowerCase()))return null;return s}
function splitCSVLine(line,delimiter){const out=[];let cur='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q}else if(ch===delimiter&&!q){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out}
function parseCSVText(text,delimiter){const lines=String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim()!=='');if(!lines.length)return [];const headers=splitCSVLine(lines[0],delimiter).map((h,i)=>String(h).trim()||`var_${i+1}`);return lines.slice(1).map(line=>{const a=splitCSVLine(line,delimiter),o={};headers.forEach((h,i)=>o[h]=normalizeResearchValue(a[i]??''));return o})}
function readResearchFile(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=e=>{try{const name=file.name.toLowerCase();if(name.endsWith('.json')){const j=JSON.parse(e.target.result);resolve(Array.isArray(j)?j:(Array.isArray(j.rows)?j.rows:(Array.isArray(j.data)?j.data:[])));return}if((name.endsWith('.xlsx')||name.endsWith('.xls'))&&window.XLSX){const wb=XLSX.read(e.target.result,{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];resolve(XLSX.utils.sheet_to_json(ws,{defval:null}));return}const del=val('researchDelimiter')==='\\t'?'\t':(val('researchDelimiter')||',');resolve(parseCSVText(e.target.result,del))}catch(err){reject(err)}};r.onerror=()=>reject(r.error||new Error('Gagal membaca file'));if(/\.xlsx?$/.test(file.name.toLowerCase()))r.readAsArrayBuffer(file);else r.readAsText(file,'UTF-8')})}
async function importResearchDataset(){const input=document.getElementById('researchDataFile'),status=document.getElementById('researchDataStatus');if(!input?.files?.[0]){status.innerHTML='<b>Pilih file terlebih dahulu.</b>';return}try{const rows=await readResearchFile(input.files[0]);if(!rows.length)throw new Error('Tidak ada baris data yang terbaca.');const clean=rows.map(row=>{const o={};Object.entries(row||{}).forEach(([k,v])=>o[String(k).trim()]=normalizeResearchValue(v));return o});researchState.dataset={name:val('researchDatasetName')||input.files[0].name,source:input.files[0].name,importedAt:new Date().toISOString(),rows:clean};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));status.innerHTML=`<b>Dataset berhasil diimpor.</b> ${clean.length} baris · ${Object.keys(clean[0]).length} variabel · sumber: ${esc(input.files[0].name)}.`;previewResearchDataset();generateAutoDictionary();generateAnalysisPipeline()}catch(e){status.innerHTML=`<b>Import gagal:</b> ${esc(e.message||String(e))}`}}
function clearResearchDataset(){delete researchState.dataset;localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));const s=document.getElementById('researchDataStatus');if(s)s.innerHTML='Dataset penelitian dihapus dari penyimpanan lokal.';const p=document.getElementById('researchDataPreview');if(p)p.innerHTML=''}
function previewResearchDataset(){const rows=researchDatasetRows(),box=document.getElementById('researchDataPreview');if(!box)return;if(!rows.length){box.innerHTML='<div class="notice">Belum ada dataset penelitian.</div>';return}const cols=Object.keys(rows[0]);box.innerHTML=`<h4>Preview 10 baris pertama</h4><div style="overflow:auto"><table class="report-table"><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>${rows.slice(0,10).map(r=>`<tr>${cols.map(c=>`<td>${esc(r[c]??'')}</td>`).join('')}</tr>`).join('')}</table></div><small>Total ${rows.length} baris · ${cols.length} variabel.</small>`}
function applyResearchRecodes(rows){const rules=(val('researchRecodes')||'').split(/\n+/).map(x=>x.trim()).filter(Boolean).map(line=>line.split('|').map(x=>x.trim())).filter(a=>a.length>=3);return rows.map(r=>{const o={...r};rules.forEach(([v,oldVal,newVal])=>{if(String(o[v]??'')===oldVal)o[v]=newVal});return o})}
function applyResearchFilter(rows){const f=(val('researchFilter')||'').trim();if(!f)return rows;const m=f.match(/^([\w.]+)\s*(>=|<=|!=|=|>|<)\s*(.+)$/);if(!m)return rows;const [,k,op,raw]=m;let rhs=raw.trim().replace(/^['"]|['"]$/g,'');return rows.filter(r=>{const a=r[k];const an=Number(a),rn=Number(rhs),both=Number.isFinite(an)&&Number.isFinite(rn);const A=both?an:String(a??''),B=both?rn:rhs;return op==='='?A===B:op==='!='?A!==B:op==='>'?A>B:op==='<'?A<B:op==='>='?A>=B:A<=B})}
function applyResearchCleaning(){let rows=researchDatasetRows();if(!rows.length){document.getElementById('researchCleaningResult').innerHTML='<b>Tidak ada dataset.</b>';return}rows=applyResearchRecodes(rows);rows=applyResearchFilter(rows);const nums=(val('researchNumericVars')||'').split(',').map(x=>x.trim()).filter(Boolean);rows=rows.map(r=>{const o={...r};nums.forEach(k=>{if(o[k]!==null&&o[k]!==undefined&&o[k]!==''){const n=Number(String(o[k]).replace(',','.'));o[k]=Number.isFinite(n)?n:null}});return o});researchState.dataset.rows=rows;researchState.dataset.cleanedAt=new Date().toISOString();researchState.dataset.cleaning={recodes:val('researchRecodes')||'',numericVars:nums,filter:val('researchFilter')||''};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));document.getElementById('researchCleaningResult').innerHTML=`<b>Cleaning selesai.</b> ${rows.length} baris tersisa. Recoding: ${(val('researchRecodes')||'').split(/\n+/).filter(Boolean).length} aturan · numeric: ${nums.length} variabel.`;previewResearchDataset();generateAnalysisPipeline()}
function validateResearchDataset(){const rows=researchDatasetRows(),box=document.getElementById('researchCleaningResult');if(!rows.length){box.innerHTML='Belum ada dataset.';return}const cols=Object.keys(rows[0]),issues=[],dupes=new Set(),ids=rows.map(r=>JSON.stringify(r));ids.forEach((x,i)=>{if(ids.indexOf(x)!==i)dupes.add(i)});cols.forEach(c=>{const miss=rows.filter(r=>normalizeResearchValue(r[c])===null).length;if(miss/rows.length>.2)issues.push(`${c}: missing ${(100*miss/rows.length).toFixed(1)}%`)});if(dupes.size)issues.push(`Terdapat ${dupes.size} baris duplikat penuh.`);box.innerHTML=`<b>Validasi dataset:</b> ${rows.length} baris · ${cols.length} variabel.<br>${issues.length?'<ul>'+issues.map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>':'Tidak ditemukan masalah dasar >20% missing atau duplikat penuh.'}<small>Validasi ini bukan pemeriksaan validitas isi, sampling, outlier klinis, atau kualitas pengukuran.</small>`}
function generateAutoDictionary(){const rows=researchDatasetRows(),box=document.getElementById('variableDiscovery');if(!rows.length){if(box)box.innerHTML='Import dataset terlebih dahulu.';return}const cols=Object.keys(rows[0]),sample=rows.length;const dict=cols.map(k=>{const vals=rows.map(r=>normalizeResearchValue(r[k])).filter(v=>v!==null),nums=vals.map(Number);const numeric=vals.length>0&&nums.every(Number.isFinite);const uniq=[...new Set(vals.map(String))];let type=numeric?'numeric':(uniq.length<=2?'binary':'categorical');return {name:k,label:k,type,role:'covariate'}});researchState.dictionary=dict;localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));const el=document.getElementById('varDictionary');if(el)el.value=dict.map(x=>`${x.name} | ${x.label} | ${x.type} | ${x.role}`).join('\n');if(box)box.innerHTML=`<b>Dictionary otomatis dibuat:</b> ${dict.length} variabel dari ${sample} baris. Periksa tipe dan peran secara manual sebelum analisis.`}
function generateAnalysisPipeline(){const d=val('studyDesign')||researchState.design||'descriptive',p=researchPlans[d]||researchPlans.descriptive,rows=researchDatasetRows(),box=document.getElementById('analysisPipeline');if(!box)return;const n=rows.length;let steps=[];steps.push('1. Audit dataset, missing, duplikasi, coding dan definisi operasional');steps.push('2. Statistik deskriptif sesuai tipe variabel');if(d==='case-control'||d==='matched-case-control')steps.push('3. Bivariat exposure–outcome → OR dan 95% CI');if(d==='cohort'||d==='outbreak-retro-cohort')steps.push('3. Bivariat → attack/risk, RR, RD dan bila tersedia incidence rate/IRR');if(d==='cross-sectional')steps.push('3. Bivariat → prevalence dan PR/POR');if(['case-control','cohort','cross-sectional','outbreak-retro-cohort'].includes(d))steps.push('4. Stratifikasi/Mantel–Haenszel bila ada confounder yang direncanakan');if(['case-control','cross-sectional'].includes(d))steps.push('5. Model multivariat sesuai outcome dan desain');if(d.includes('cohort'))steps.push('5. Person-time dan Kaplan–Meier/Cox bila time-to-event tersedia');steps.push('6. Sensitivity/missing-data assessment dan pemeriksaan model');steps.push('7. Table 1 → Table 2 → model final → interpretasi → laporan');box.innerHTML=`<b>${esc(p.label)}</b><br>Dataset: ${n} baris<br><ol>${steps.map(x=>`<li>${esc(x.replace(/^\d+\.\s*/,''))}</li>`).join('')}</ol><small>Pipeline adalah rekomendasi operasional; peneliti tetap menetapkan analisis berdasarkan protokol, DAG, kualitas data, dan asumsi model.</small>`}
function downloadResearchTemplate(){const cols=['id','age','sex','outcome','exposure','education','occupation','followUpDays','event'];const csv=cols.join(',')+'\n1,35,L,1,0,SMA,Petani,30,0\n2,42,P,0,1,SMP,IRT,18,1\n';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='GORUT-Research-Template.csv';a.click()}
function exportResearchHTML(){const old=researchState.publicationTables?.html||'';const title=researchState.title||'Laporan Penelitian Epidemiologi';const dataset=researchState.dataset?`<p><b>Dataset:</b> ${esc(researchState.dataset.name||'-')} · n=${researchDatasetRows().length}</p>`:'';const html=`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Arial;max-width:1000px;margin:30px auto;line-height:1.5}table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #bbb;padding:6px}th{background:#eee}.note{padding:10px;background:#f5f7fa}</style></head><body><h1>${esc(title)}</h1>${dataset}<h2>Desain</h2><p>${esc(researchPlans[researchState.design]?.label||researchState.design||'-')}</p><h2>Metode</h2><p>${esc(researchState.methodNotes||'')}</p><h2>Hasil Analisis</h2>${researchState.analysis?.html||'<p>Belum ada analisis.</p>'}${researchState.advanced?.result?`<h2>Analisis Lanjutan</h2><pre>${esc(JSON.stringify(researchState.advanced.result,null,2))}</pre>`:''}<h2>Tabel Penelitian</h2>${old}<h2>DAG</h2><pre>${esc(researchState.dag||'')}</pre><p class="note">Draft dari GORUT-OUTBREAK AI v24. Semua hasil harus diverifikasi terhadap data mentah dan metode penelitian sebelum laporan resmi/publikasi.</p></body></html>`;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));a.download='GORUT-Research-Studio-v24.html';a.click()}
function exportResearchJSON(){const payload={app:'GORUT-OUTBREAK AI',module:'Research Studio',version:'v24',plan:researchState,designGuide:researchPlans[researchState.design||'descriptive'],validation:'Review against raw data and an independent statistical reference before publication.'};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='gorut-research-studio-v24.json';a.click()}
const _v24Init=initResearch;initResearch=function(){_v24Init();if(researchState.dataset){const s=document.getElementById('researchDataStatus');if(s)s.innerHTML=`<b>Dataset tersimpan:</b> ${esc(researchState.dataset.name||researchState.dataset.source||'dataset')} · ${researchDatasetRows().length} baris.`;previewResearchDataset();generateAnalysisPipeline()}if(researchState.dictionary?.length){const e=document.getElementById('varDictionary');if(e&&!e.value)e.value=researchState.dictionary.map(x=>`${x.name} | ${x.label} | ${x.type} | ${x.role}`).join('\n')}};
/* GORUT-OUTBREAK AI v25 — Publication-Grade Statistics */
(function(){
  const esc0=window.esc||((s)=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m])));
  const f0=(id)=>document.getElementById(id);
  function num(v){if(v===null||v===undefined||v==='')return null; const n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null}
  function b(v){if(v===true||v===1)return 1;if(v===false||v===0)return 0;const s=String(v??'').trim().toLowerCase();if(['1','yes','ya','y','true','l','male','kasus','positif','positive'].includes(s))return 1;if(['0','no','tidak','n','false','p','female','kontrol','negatif','negative'].includes(s))return 0;const n=num(v);return n===null?null:(n>0?1:0)}
  function valv(row,k){if(!row)return null; if(k.startsWith('answers.')) return row.answers?row.answers[k.slice(8)]:null; return row[k]}
  function rows(){return (window.researchCases?window.researchCases():[])}
  function qnorm(x){return Math.max(0,Math.min(1,Number(x)||0))}
  function erf(x){const s=x<0?-1:1; x=Math.abs(x);const t=1/(1+.3275911*x);const a1=.254829592,a2=-.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429;return s*(1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x))}
  function pz(z){return 1-(0.5*(1+erf(Math.abs(z)/Math.SQRT2)))}
  function logistic(rows,yKey,xKeys){
    const dat=[];rows.forEach(r=>{const y=b(valv(r,yKey));const x=[1,...xKeys.map(k=>num(valv(r,k))??b(valv(r,k)))];if(y!==null&&x.slice(1).every(v=>v!==null&&Number.isFinite(Number(v))))dat.push({y,x:x.map(Number)})});
    if(dat.length<Math.max(20,xKeys.length*10)) return null;
    let beta=Array(xKeys.length+1).fill(0);for(let it=0;it<30;it++){const p=dat.map(d=>1/(1+Math.exp(-Math.max(-30,Math.min(30,d.x.reduce((s,v,i)=>s+v*beta[i],0))))));const k=beta.length,H=Array.from({length:k},()=>Array(k).fill(0)),g=Array(k).fill(0);dat.forEach((d,j)=>{const w=Math.max(p[j]*(1-p[j]),1e-6);for(let a=0;a<k;a++){g[a]+=d.x[a]*(d.y-p[j]);for(let c=0;c<k;c++)H[a][c]+=w*d.x[a]*d.x[c]}});let inv=null;try{inv=window.matInv?window.matInv(H):null}catch(e){}if(!inv)return null;const step=inv.map(row=>row.reduce((s,v,i)=>s+v*g[i],0));let md=0;for(let i=0;i<k;i++){beta[i]+=step[i];md=Math.max(md,Math.abs(step[i]))}if(md<1e-7)break}
    const p=dat.map(d=>1/(1+Math.exp(-Math.max(-30,Math.min(30,d.x.reduce((s,v,i)=>s+v*beta[i],0))))));const k=beta.length,H=Array.from({length:k},()=>Array(k).fill(0));dat.forEach((d,j)=>{const w=Math.max(p[j]*(1-p[j]),1e-6);for(let a=0;a<k;a++)for(let c=0;c<k;c++)H[a][c]+=w*d.x[a]*d.x[c]});let cov=window.matInv?window.matInv(H):null;if(!cov)return null;const table=beta.map((z,i)=>{const se=Math.sqrt(Math.max(cov[i][i],1e-12)),or=Math.exp(z),lo=Math.exp(z-1.96*se),hi=Math.exp(z+1.96*se),zv=z/se;return {beta:z,se,OR:or,lo,hi,p:pz(zv)}});const ll=dat.reduce((s,d)=>s+d.y*Math.log(Math.max(p[dat.indexOf(d)],1e-12))+(1-d.y)*Math.log(Math.max(1-p[dat.indexOf(d)],1e-12)),0);const dev=-2*ll;return {n:dat.length,events:dat.filter(d=>d.y===1).length,table,ll,deviance:dev,iterations:30};
  }
  function twoBy2(rows,yKey,xKey){let a=0,bb=0,c=0,d=0;rows.forEach(r=>{const y=b(valv(r,yKey)),x=b(valv(r,xKey));if(y===null||x===null)return;if(x&&y)a++;else if(x&&!y)bb++;else if(!x&&y)c++;else d++});return {a,b:bb,c,d,n:a+bb+c+d}}
  function effect(t,kind){const {a,b,c,d}=t;if(kind==='OR'){const est=(a*d)/Math.max(b*c,1e-12),se=Math.sqrt(1/Math.max(a,.5)+1/Math.max(b,.5)+1/Math.max(c,.5)+1/Math.max(d,.5));return {est,lo:Math.exp(Math.log(Math.max(est,1e-12))-1.96*se),hi:Math.exp(Math.log(Math.max(est,1e-12))+1.96*se)}}const r1=a/Math.max(a+b,1e-12),r0=c/Math.max(c+d,1e-12),est=r1/Math.max(r0,1e-12),se=Math.sqrt((a?1/a:0)-(b?1/(a+b):0)+(c?1/c:0)-(d?1/(c+d):0));return {est,lo:Math.exp(Math.log(Math.max(est,1e-12))-1.96*se),hi:Math.exp(Math.log(Math.max(est,1e-12))+1.96*se)}}
  function addUI(){const sec=f0('penelitian');if(!sec||f0('v25Publication'))return;const card=document.createElement('div');card.className='card';card.id='v25Publication';card.innerHTML=`<h3>📐 v25 — Publication-Grade Statistics</h3><div class="notice">Mesin ini membantu menyiapkan tabel analitik dan visualisasi publikasi. Pemilihan model tetap mengikuti desain, protokol, DAG, kualitas data, dan asumsi statistik.</div><div class="grid2"><div class="field"><label>Outcome (Y)</label><input id="v25Y" value="${esc0((researchState||{}).outcome||'status')}"></div><div class="field"><label>Exposure utama (X)</label><input id="v25X" value="${esc0((researchState||{}).exposure||'contact')}"></div><div class="field"><label>Kovariat multivariat, pisahkan koma</label><input id="v25Cov" placeholder="age,sex,education"></div><div class="field"><label>Variabel stratifikasi MH</label><input id="v25Strata" placeholder="sex"></div></div><div class="toolbar"><button class="primary" onclick="v25RunPublication()">📊 Jalankan Publication Analysis</button><button onclick="v25Forest()">🌲 Forest Plot</button><button onclick="v25Sensitivity()">🧪 Sensitivity Analysis</button><button onclick="v25Interaction()">↔️ Interaction</button><button onclick="v25ExportCSV()">📥 Export Tables CSV</button></div><div id="v25Results" class="report-preview"><div class="notice">Belum ada hasil.</div></div></div>`;sec.insertBefore(card,sec.querySelector('.card:last-child'))}
  window.v25RunPublication=function(){const R=rows(),Y=(f0('v25Y')?.value||'status').trim(),X=(f0('v25X')?.value||'contact').trim(),cov=(f0('v25Cov')?.value||'').split(',').map(s=>s.trim()).filter(Boolean),t=twoBy2(R,Y,X),d=researchState?.design||'descriptive',kind=d.includes('case-control')?'OR':'RR',ef=effect(t,kind),fit=logistic(R,Y,[X,...cov]);let h=`<h3>Publication Analysis</h3><p><b>n analitik:</b> ${t.n} · <b>Outcome:</b> ${esc0(Y)} · <b>Exposure:</b> ${esc0(X)}</p><h4>Table 2. Crude association</h4><table class="report-table"><tr><th>Exposure</th><th>Outcome +</th><th>Outcome −</th><th>Total</th></tr><tr><td>+</td><td>${t.a}</td><td>${t.b}</td><td>${t.a+t.b}</td></tr><tr><td>−</td><td>${t.c}</td><td>${t.d}</td><td>${t.c+t.d}</td></tr></table><p><b>${kind}:</b> ${ef.est.toFixed(3)} (95% CI ${ef.lo.toFixed(3)}–${ef.hi.toFixed(3)})</p>`;if(fit){h+=`<h4>Table 3. Multivariable logistic regression</h4><table class="report-table"><tr><th>Variable</th><th>β</th><th>Adjusted OR</th><th>95% CI</th><th>p</th></tr>`;[X,...cov].forEach((k,i)=>{const z=fit.table[i+1];if(z)h+=`<tr><td>${esc0(k)}</td><td>${z.beta.toFixed(4)}</td><td>${z.OR.toFixed(3)}</td><td>${z.lo.toFixed(3)}–${z.hi.toFixed(3)}</td><td>${z.p.toFixed(4)}</td></tr>`});h+=`</table><div class="notice">Model n=${fit.n}; events=${fit.events}; deviance=${fit.deviance.toFixed(3)}. Pemeriksaan kolinearitas, separation, calibration dan external validation belum otomatis menggantikan penilaian statistik profesional.</div>`}else h+=`<div class="notice">Model multivariat belum dapat diestimasi. Periksa ukuran sampel, variasi outcome, missing data, atau separation/kolinearitas.</div>`;f25(h);researchState.v25={Y,X,cov,crude:{table:t,kind,effect:ef},logistic:fit};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));}
  function f25(h){const b0=f0('v25Results');if(b0)b0.innerHTML=h}
  window.v25Forest=function(){const r=researchState?.v25;if(!r?.logistic){v25RunPublication();return}const vars=[r.X,...r.cov],zs=r.logistic.table.slice(1),w=720,h=70+vars.length*42;let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="max-width:100%;background:#fff"><line x1="360" y1="30" x2="360" y2="${h-20}" stroke="#999"/><text x="360" y="18" text-anchor="middle" font-size="12">OR = 1</text>`;vars.forEach((v,i)=>{const z=zs[i];if(!z)return;const x0=80+Math.max(0,Math.min(600,(Math.log(z.lo)-(-3))/6*600));const x1=80+Math.max(0,Math.min(600,(Math.log(z.hi)-(-3))/6*600));const xm=80+Math.max(0,Math.min(600,(Math.log(z.OR)-(-3))/6*600));const y=45+i*42;svg+=`<text x="8" y="${y+4}" font-size="12">${esc0(v)}</text><line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#555"/><circle cx="${xm}" cy="${y}" r="5"/><text x="610" y="${y+4}" font-size="11">${z.OR.toFixed(2)} (${z.lo.toFixed(2)}–${z.hi.toFixed(2)})</text>`});svg+=`</svg>`;f25(`<h3>Forest Plot — Adjusted OR</h3>${svg}<div class="notice">Visualisasi log-scale konseptual; angka tabel di atas adalah keluaran analitik yang harus diverifikasi sebelum publikasi.</div>`)}
  window.v25Sensitivity=function(){const R=rows(),Y=f0('v25Y')?.value||'status',X=f0('v25X')?.value||'contact',base=twoBy2(R,Y,X),ef=effect(base,'OR');const complete=R.filter(r=>b(valv(r,Y))!==null&&b(valv(r,X))!==null);const n=complete.length;const sens=effect(twoBy2(complete,Y,X),'OR');f25(`<h3>Sensitivity Analysis — complete cases</h3><p>Dataset tersedia: ${R.length}; complete outcome/exposure: <b>${n}</b>.</p><table class="report-table"><tr><th>Analisis</th><th>OR</th><th>95% CI</th></tr><tr><td>Available 2×2</td><td>${ef.est.toFixed(3)}</td><td>${ef.lo.toFixed(3)}–${ef.hi.toFixed(3)}</td></tr><tr><td>Complete-case</td><td>${sens.est.toFixed(3)}</td><td>${sens.lo.toFixed(3)}–${sens.hi.toFixed(3)}</td></tr></table><div class="notice">Ini sensitivity analysis sederhana terhadap missing pada Y/X. Multiple imputation belum dilakukan otomatis.</div>`)}
  window.v25Interaction=function(){const R=rows(),Y=f0('v25Y')?.value||'status',X=f0('v25X')?.value||'contact',Z=(f0('v25Strata')?.value||'sex').trim();const base=R.filter(r=>b(valv(r,Y))!==null&&b(valv(r,X))!==null&&b(valv(r,Z))!==null);const levels=[...new Set(base.map(r=>String(b(valv(r,Z)))))] ;let h='<h3>Effect modification / stratified estimates</h3><table class="report-table"><tr><th>Strata</th><th>n</th><th>OR</th><th>95% CI</th></tr>';levels.forEach(l=>{const rr=base.filter(r=>String(b(valv(r,Z)))===l),t=twoBy2(rr,Y,X),e=effect(t,'OR');h+=`<tr><td>${esc0(Z)}=${esc0(l)}</td><td>${t.n}</td><td>${e.est.toFixed(3)}</td><td>${e.lo.toFixed(3)}–${e.hi.toFixed(3)}</td></tr>`});h+='</table><div class="notice">Perbedaan estimasi antarstrata perlu dinilai bersama plausibilitas epidemiologis dan uji interaksi yang sesuai; perbedaan angka saja bukan bukti definitif effect modification.</div>';f25(h)}
  window.v25ExportCSV=function(){const r=researchState?.v25;if(!r)return v25RunPublication();const lines=['variable,estimate,lower95,upper95,p'];if(r.logistic) [r.X,...r.cov].forEach((k,i)=>{const z=r.logistic.table[i+1];if(z)lines.push([k,z.OR,z.lo,z.hi,z.p].join(','))});lines.push([r.X,r.crude.effect.est,r.crude.effect.lo,r.crude.effect.hi,''].join(','));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}));a.download='GORUT-publication-analysis-v25.csv';a.click()}

  /* ===================== v26 STATISTICAL VALIDATION & MODEL AUDIT ===================== */
  function chi2p(df,x){
    x=Number(x); df=Number(df); if(!Number.isFinite(x)||x<0||!Number.isFinite(df)||df<=0)return NaN;
    function gammaincP(a,z){if(z<=0)return 0; const IT=120,EPS=1e-12; if(z<a+1){let sum=1/a,term=sum;for(let n=1;n<=IT;n++){term*=z/(a+n);sum+=term;if(Math.abs(term)<Math.abs(sum)*EPS)break}return sum*Math.exp(-z+a*Math.log(z)-gammaln(a));}
      let b0=z+1-a,b1=1/b0,fac=1e-30,C=b1,D=0;for(let i=1;i<=IT;i++){let an=-i*(i-a),bn=b0+2*i,D=bn+an*D;if(Math.abs(D)<fac)D=fac;C=bn+an/C;if(Math.abs(C)<fac)C=fac;D=1/D;const del=C*D;b1*=del;if(Math.abs(del-1)<EPS)break}return 1-Math.exp(-z+a*Math.log(z)-gammaln(a))*b1;}
    return Math.max(0,Math.min(1,1-gammaincP(df/2,x/2)));
  }
  function v26ModelAudit(){
    const r=researchState?.v25,box=f0('v25Results');
    if(!r?.logistic){v25RunPublication();return setTimeout(v26ModelAudit,50)}
    const R=rows(),Y=r.Y,keys=[r.X,...r.cov], dat=[];
    R.forEach(row=>{const y=b(valv(row,Y));const x=[1,...keys.map(k=>num(valv(row,k))??b(valv(row,k)))];if(y!==null&&x.slice(1).every(v=>v!==null&&Number.isFinite(Number(v))))dat.push({y,x:x.map(Number)})});
    const beta=r.logistic.table.map(z=>z.beta), probs=dat.map(d=>1/(1+Math.exp(-Math.max(-30,Math.min(30,d.x.reduce((s,v,i)=>s+v*beta[i],0))))));
    const n=dat.length,k=keys.length+1,events=dat.reduce((s,d)=>s+d.y,0),ll=dat.reduce((s,d,i)=>s+d.y*Math.log(Math.max(probs[i],1e-12))+(1-d.y)*Math.log(Math.max(1-probs[i],1e-12)),0);
    const aic=-2*ll+2*k,bic=-2*ll+k*Math.log(Math.max(n,1));
    const brier=dat.reduce((s,d,i)=>s+(d.y-probs[i])**2,0)/Math.max(n,1);
    const acc=dat.reduce((s,d,i)=>s+((probs[i]>=.5?1:0)===d.y?1:0),0)/Math.max(n,1);
    let hl=0,g=10; const order=dat.map((d,i)=>({i,p:probs[i],y:d.y})).sort((a,b)=>a.p-b.p); for(let q=0;q<g;q++){const lo=Math.floor(q*n/g),hi=Math.floor((q+1)*n/g);const arr=order.slice(lo,hi);if(!arr.length)continue;const o=arr.reduce((s,z)=>s+z.y,0),e=arr.reduce((s,z)=>s+z.p,0),m=arr.length;hl += e>0?(o-e)**2/e:0;hl += (m-e)>0?(m-o-(m-e))**2/(m-e):0;}
    const hlp=chi2p(Math.max(1,g-2),hl);
    let missing=0; R.forEach(row=>keys.concat([Y]).forEach(k0=>{if(b(valv(row,k0))===null)missing++}));
    let vifs=[]; for(let j=1;j<k;j++){const others=keys.filter((_,i)=>i!==j-1);if(!others.length){vifs.push({v:keys[j-1],vif:1});continue}const sub=dat.map(d=>({y:d.x[j],x:[1,...others.map(key=>{const idx=keys.indexOf(key)+1;return d.x[idx]})]}));let fit=null;try{fit=window.matInv?null:null}catch(e){} const ys=sub.map(z=>z.y), means=ys.reduce((a,b)=>a+b,0)/Math.max(ys.length,1);const sst=ys.reduce((a,z)=>a+(z-means)**2,0);let pred=[];try{const Xmat=sub.map(z=>z.x), Xt=Xmat[0]?Xmat[0].map((_,ii)=>Xmat.map(row=>row[ii])):[];const pmat=Array.from({length:Xt.length},(_,ii)=>Xt[ii].map((_,jj)=>Xmat[ii][jj])); const XtX=Array.from({length:pmat.length},()=>Array(pmat.length).fill(0));for(let a=0;a<pmat.length;a++)for(let c=0;c<pmat.length;c++)for(let i=0;i<sub.length;i++)XtX[a][c]+=pmat[a][i]*pmat[c][i];const inv=window.matInv?window.matInv(XtX):null;if(inv){const Xty=Array(pmat.length).fill(0);for(let a=0;a<pmat.length;a++)for(let i=0;i<sub.length;i++)Xty[a]+=pmat[a][i]*ys[i];const bb=inv.map(row=>row.reduce((s,z,i)=>s+z*Xty[i],0));pred=sub.map(z=>z.x.reduce((s,v,i)=>s+v*bb[i],0));}}catch(e){} const sse=pred.length?pred.reduce((a,z,i)=>a+(ys[i]-z)**2,0):sst;const R2=sst>0?Math.max(0,Math.min(.999999,1-sse/sst)):0;vifs.push({v:keys[j-1],vif:1/Math.max(1-R2,1e-9)});}
    const epv=events/Math.max(keys.length,1), status=hlp>=.05&&vifs.every(z=>z.vif<10)&&epv>=10?'PASS':'REVIEW';
    const h=`<h3>🧪 v26 — Statistical Model Audit</h3><table class="report-table"><tr><th>Audit metric</th><th>Value</th><th>Interpretation</th></tr><tr><td>n model</td><td>${n}</td><td>Observasi lengkap yang masuk model</td></tr><tr><td>Events</td><td>${events}</td><td>Outcome=1</td></tr><tr><td>Events / parameter</td><td>${epv.toFixed(2)}</td><td>Indikator kasar; bukan pengganti penilaian sample size/model</td></tr><tr><td>AIC</td><td>${aic.toFixed(3)}</td><td>Untuk perbandingan model pada dataset yang sama</td></tr><tr><td>BIC</td><td>${bic.toFixed(3)}</td><td>Untuk perbandingan model pada dataset yang sama</td></tr><tr><td>Brier score</td><td>${brier.toFixed(4)}</td><td>Semakin kecil umumnya menunjukkan probabilitas prediksi lebih dekat ke outcome</td></tr><tr><td>Accuracy @0.50</td><td>${(100*acc).toFixed(1)}%</td><td>Deskriptif; tidak cukup untuk menilai model</td></tr><tr><td>Hosmer–Lemeshow</td><td>${hl.toFixed(3)}; p=${Number.isFinite(hlp)?hlp.toFixed(4):'NA'}</td><td>Uji kalibrasi berbasis kelompok; interpretasi bergantung ukuran sampel</td></tr><tr><td>Missing cells</td><td>${missing}</td><td>Jumlah field Y/X/kovariat yang missing sebelum complete-case model</td></tr></table><h4>Variance Inflation Factor (screening)</h4><table class="report-table"><tr><th>Variabel</th><th>VIF</th><th>Status</th></tr>${vifs.map(z=>`<tr><td>${esc0(z.v)}</td><td>${z.vif.toFixed(3)}</td><td>${z.vif>=10?'Perlu review':'Tidak tinggi menurut ambang screening'}</td></tr>`).join('')}</table><div class="notice"><b>Audit status: ${status}</b><br>Ini adalah pemeriksaan screening otomatis. Separation, linearitas logit untuk kovariat kontinu, clustering, matching, weights, missing-data mechanism, calibration plot, dan external validation masih memerlukan pemeriksaan khusus.</div>`;
    if(box)box.innerHTML=h; researchState.v26Audit={n,events,epv,aic,bic,brier,accuracy:acc,hosmerLemeshow:{stat:hl,p:hlp},vif:vifs,status}; localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));
  }
  window.v26CompareModels=function(){
    const r=researchState?.v25;if(!r?.logistic){v25RunPublication();return setTimeout(v26CompareModels,50)}
    const R=rows(),Y=r.Y,base=[r.X],full=[r.X,...r.cov];const fit0=logistic(R,Y,base),fit1=logistic(R,Y,full);if(!fit0||!fit1)return f25('<div class="notice">Tidak cukup data untuk membandingkan model.</div>');
    const p0=2*(fit1.ll-fit0.ll);const df=Math.max(1,full.length-base.length),p=chi2p(df,p0);const h=`<h3>Model Comparison</h3><table class="report-table"><tr><th>Model</th><th>Variables</th><th>n</th><th>Log-likelihood</th><th>Deviance</th><th>AIC</th></tr><tr><td>Crude</td><td>${base.join(', ')}</td><td>${fit0.n}</td><td>${fit0.ll.toFixed(3)}</td><td>${fit0.deviance.toFixed(3)}</td><td>${(-2*fit0.ll+2*(base.length+1)).toFixed(3)}</td></tr><tr><td>Full</td><td>${full.join(', ')}</td><td>${fit1.n}</td><td>${fit1.ll.toFixed(3)}</td><td>${fit1.deviance.toFixed(3)}</td><td>${(-2*fit1.ll+2*(full.length+1)).toFixed(3)}</td></tr></table><p><b>Likelihood-ratio comparison:</b> χ²=${p0.toFixed(3)}, df=${df}, p=${p.toFixed(4)}.</p><div class="notice">Perbandingan ini valid sebagai nested-model likelihood-ratio screening bila kedua model memakai observasi yang sama dan asumsi model terpenuhi.</div>`;f25(h);researchState.v26ModelComparison={crude:fit0,full:fit1,lr:{chi2:p0,df,p}};localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));
  };
  function addV26UI(){const sec=f0('penelitian'),old=f0('v26AuditCard');if(!sec||old)return;const card=document.createElement('div');card.className='card';card.id='v26AuditCard';card.innerHTML=`<h3>🧪 v26 — Statistical Validation & Model Audit</h3><div class="notice">Audit otomatis untuk memeriksa beberapa aspek model logistik: calibration screening, AIC/BIC, Brier score, events/parameter, dan VIF. Ini bukan pengganti validasi statistik independen.</div><div class="toolbar"><button class="primary" onclick="v26ModelAudit()">🔬 Audit Model</button><button onclick="v26CompareModels()">⚖️ Bandingkan Model</button></div>`;sec.insertBefore(card,sec.querySelector('.card:last-child'))}
  const _v25hook=hook;hook=function(){_v25hook();addV26UI();};
  function hook(){addUI();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
})();


/* =========================================================
   GORUT-OUTBREAK AI v27 — Disease-specific PE/KLB, CRUD delete,
   disease filters, registration/access control and premium UX.
   ========================================================= */
(function(){
  const V27_KEY='gorut-v27-access';
  const getAccess=()=>{try{return JSON.parse(localStorage.getItem(V27_KEY)||'{}')}catch(e){return {}}};
  const setAccess=x=>localStorage.setItem(V27_KEY,JSON.stringify(x));
  const esc0=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  /* Kemenkes-aligned operational templates. The app stores source labels and
     validation status; it does not claim these are verbatim copies of every official form. */
  const PE_TEMPLATES={
    'campak':{title:'PE/KLB Campak (Campak-Rubella)',source:'Kemenkes RI — SKDR & formulir PE penyakit potensial KLB; instrumen campak/PD3I sesuai versi program yang berlaku.',focus:['rantai penularan dan hubungan epidemiologi','status imunisasi MR/MMR','tanggal demam dan ruam','CBMS/penemuan kasus tambahan','spesimen serum dan spesimen klinis sesuai pedoman'],extra:['Status imunisasi dan cakupan sasaran','Riwayat kontak/klaster','Daftar kasus tambahan','Pengambilan dan pengiriman spesimen','Respons imunisasi/OR/penanggulangan sesuai keputusan program']},
    'dbd':{title:'PE/KLB Dengue/DBD',source:'Kemenkes RI — pedoman pengendalian dengue/DBD dan SKDR; sesuaikan definisi kasus dan kriteria respons dengan pedoman terbaru.',focus:['kurva demam dan perjalanan klinis','tempat perindukan dan kepadatan vektor','distribusi kasus menurut wilayah','faktor lingkungan','surveilans kematian dan tanda bahaya'],extra:['Temuan jentik/PSN','Faktor lingkungan rumah','Kepadatan hunian','Tatalaksana dan tanda bahaya','Intervensi PSN/larvasidasi/fogging bila diindikasikan']},
    'malaria':{title:'PE/KLB Malaria',source:'Kemenkes RI — pedoman malaria dan SKDR; sesuaikan klasifikasi, pemeriksaan laboratorium, dan respons dengan program malaria.',focus:['konfirmasi parasitologis','asal infeksi/importasi','mobilitas dan perjalanan','vektor dan tempat perindukan','surveilans migrasi dan fokus penularan'],extra:['Spesies Plasmodium dan parasitemia','Riwayat perjalanan/migrasi','Aktivitas malam dan perlindungan diri','Investigasi fokus/vector','Pengobatan dan follow-up']},
    'rabies':{title:'PE/KLB Rabies/GHPR',source:'Kemenkes RI — petunjuk teknis/pedoman rabies dan formulir PE GHPR; koordinasi lintas sektor kesehatan hewan.',focus:['jenis dan status hewan penular','observasi hewan','lokasi dan kategori luka','ketepatan cuci luka','VAR/SAR','koordinasi kesehatan hewan'],extra:['Identifikasi hewan','Observasi/pemeriksaan hewan','Cuci luka','VAR dan SAR','Pelacakan korban lain dan sumber hewan','Koordinasi sektor peternakan/kesehatan hewan']},
    'leptospirosis':{title:'PE/KLB Leptospirosis',source:'Kemenkes RI — pedoman/format PE leptospirosis dan SKDR.',focus:['banjir/genangan','paparan air/tanah','rodent','pekerjaan berisiko','manifestasi klinis berat','spesimen dan konfirmasi'],extra:['Riwayat banjir/genangan','Paparan tikus/hewan','Pekerjaan dan aktivitas','Pemetaan sumber paparan','Spesimen serum/urin dan hasil']},
    'difteri':{title:'PE/KLB Difteri',source:'Kemenkes RI — pedoman PD3I/difteri dan SKDR.',focus:['kontak erat','status imunisasi','pseudomembran','spesimen usap','profilaksis kontak','penelusuran kasus tambahan'],extra:['Daftar kontak','Status imunisasi DPT/DT/Td','Spesimen dan hasil','Profilaksis/eritromisin sesuai pedoman','Imunisasi respons']},
    'pertusis':{title:'PE/KLB Pertusis',source:'Kemenkes RI — pedoman PD3I/pertusis dan SKDR.',focus:['batuk paroksismal','status imunisasi','kontak erat','klaster sekolah/daycare','spesimen nasofaring'],extra:['Line listing kontak','Imunisasi','Spesimen','Profilaksis kontak sesuai pedoman','Pengendalian klaster']},
    'afp':{title:'PE AFP/Polio',source:'Kemenkes RI — pedoman surveilans AFP/Polio dan SKDR.',focus:['tanggal onset kelumpuhan','investigasi neurologis','spesimen tinja dua kali','status imunisasi polio','60-day follow-up','klasifikasi akhir'],extra:['Formulir AFP','Spesimen 1 dan 2','Cold chain/pengiriman','Follow-up 60 hari','Klasifikasi akhir']},
    'tn':{title:'PE Tetanus Neonatorum',source:'Kemenkes RI — pedoman PD3I/Tetanus Neonatorum.',focus:['riwayat persalinan','perawatan tali pusat','status imunisasi ibu','ANC','onset gejala','outcome'],extra:['Tempat/penolong persalinan','Bahan tali pusat','TT/Td ibu','Riwayat ANC','Intervensi dan pencegahan kasus berikutnya']},
    'tetanus':{title:'PE/KLB Tetanus',source:'Kemenkes RI — pedoman PD3I/Tetanus.',focus:['riwayat luka','status imunisasi','perawatan luka','onset trismus/spasme','tatalaksana'],extra:['Karakteristik luka','Imunisasi tetanus','Perawatan luka','Kontak/lingkungan bila relevan','Pencegahan kasus']},
    'antraks':{title:'PE/KLB Antraks',source:'Kemenkes RI — pedoman antraks/zoonosis dan SKDR.',focus:['hewan sakit/mati','paparan produk hewan','penyembelihan','konsumsi daging','lesi kulit','koordinasi kesehatan hewan'],extra:['Investigasi sumber hewan','Daftar manusia terpapar','Spesimen','Koordinasi lintas sektor','Pengendalian sumber/reservoir']},
    'kolera':{title:'PE/KLB Kolera',source:'Kemenkes RI — SKDR dan format PE penyakit potensial KLB; sesuaikan dengan pedoman kolera yang berlaku.',focus:['diare cair akut','sumber air','makanan bersama','dehidrasi','klaster','spesimen tinja'],extra:['Attack rate menurut tempat/paparan','Sumber air dan sanitasi','Spesimen/kultur/PCR','Intervensi WASH','Pelacakan kasus tambahan']},
    'meningitis':{title:'PE/KLB Meningitis/Ensefalitis',source:'Kemenkes RI — SKDR/format PE penyakit potensial KLB.',focus:['demam dan tanda neurologis','kontak','vaksinasi relevan','CSF/darah','kematian'],extra:['Line listing kasus/kontak','Spesimen CSF/darah','Status imunisasi','Kemungkinan etiologi','Profilaksis/response sesuai etiologi']},
    'flu-burung':{title:'PE/KLB Avian Influenza pada Manusia',source:'Kemenkes RI — pedoman kesiapsiagaan/penanggulangan influenza zoonotik/PIE dan SKDR.',focus:['paparan unggas sakit/mati','pasar unggas hidup','paparan lingkungan','kontak manusia','spesimen respiratori','pelacakan kontak'],extra:['Investigasi unggas/hewan','Paparan pasar/lingkungan','Line listing kontak','Spesimen respiratori','PPE dan IPC','Koordinasi kesehatan hewan']},
    'mpox':{title:'PE Mpox',source:'Kemenkes RI — Formulir PE Mpox dan pedoman pencegahan/pengendalian Mpox.',focus:['tanggal onset dan lesi','lokasi/jumlah lesi','kontak erat','paparan hewan','spesimen lesi','pelacakan kontak'],extra:['Karakteristik lesi','Riwayat kontak erat','Spesimen lesi','Pelacakan kontak','IPC dan komunikasi risiko']},
    'covid19':{title:'PE/Investigasi Klaster COVID-19',source:'Kemenkes RI — pedoman surveilans/penanggulangan COVID-19 yang berlaku dan SKDR.',focus:['gejala respiratori','kontak dan klaster','status vaksinasi','komorbid','spesimen respiratori','severity/outcome'],extra:['Line listing klaster','Vaksinasi','Komorbid','Spesimen/jenis tes','Isolasi dan IPC','Kematian/keparahan']},
    'nipah':{title:'PE Penyakit Virus Nipah',source:'Kemenkes RI — pedoman kesiapsiagaan/PIE Nipah dan RRA yang berlaku.',focus:['kontak erat','paparan hewan/makanan','perjalanan','fasilitas kesehatan','spesimen','contact tracing'],extra:['Daftar kontak prioritas','Riwayat paparan kelelawar/babi','Perjalanan','IPC','Spesimen dan rujukan laboratorium']},
    'ebola':{title:'PE/Investigasi Ebola',source:'Kemenkes RI — pedoman PIE/Ebola yang berlaku.',focus:['riwayat perjalanan','kontak erat','gejala perdarahan/klinis','IPC','spesimen','contact tracing'],extra:['Screening perjalanan','Kontak','IPC','Spesimen','Pemantauan kontak']},
    'jaundis':{title:'PE Sindrom Jaundis Akut',source:'Kemenkes RI — format PE penyakit potensial KLB/SKDR.',focus:['onset jaundice','paparan makanan/air','riwayat hepatitis','paparan darah','fungsi hati','spesimen'],extra:['Sumber air/makanan','Paparan darah','Spesimen serum','Pemeriksaan fungsi hati','Investigasi klaster']},
    'pneumonia':{title:'PE Klaster Pneumonia',source:'Kemenkes RI — SKDR dan kesiapsiagaan patogen pernapasan/PIE.',focus:['onset dan gejala respiratori','severity','kontak','perjalanan','spesimen','cluster'],extra:['Line listing','Severity','Spesimen respiratori','Kontak','IPC','Investigasi sumber']},
    'hfmd':{title:'PE/Klaster HFMD',source:'Kemenkes RI — SKDR/formulir PE penyakit potensial KLB.',focus:['lesi mulut/tangan/kaki','klaster institusi','kontak','spesimen bila diindikasikan'],extra:['Distribusi sekolah/daycare','Kontak','Gejala berat/neurologis','Spesimen bila diperlukan','Pengendalian klaster']},
    'ili':{title:'PE Klaster ILI/Influenza',source:'Kemenkes RI — SKDR dan surveilans influenza/respiratori.',focus:['onset','gejala respiratori','klaster','vaksinasi','spesimen'],extra:['Line listing','Spesimen respiratori','Vaksinasi','Kontak','IPC']},
    'keracunan-pangan':{title:'PE/KLB Keracunan Pangan',source:'Kemenkes RI — pedoman Penyelidikan dan Penanggulangan KLB Penyakit Menular dan Keracunan Pangan; pedoman/ketentuan keamanan pangan yang berlaku.',focus:['deskripsi orang-tempat-waktu','jumlah terpapar dan attack rate','waktu konsumsi dan onset','makanan/minuman yang dicurigai','sumber dan cara terjadinya keracunan','higiene sanitasi pangan','spesimen klinis, pangan dan lingkungan','penentuan agen bila memungkinkan'],extra:['Penetapan kasus dan kelompok terpapar','Daftar makanan/minuman yang dikonsumsi','Kurva epidemi dan masa inkubasi','Attack rate menurut makanan/paparan','Wawancara penjamah dan investigasi tempat pengolahan pangan','Pemeriksaan higiene sanitasi dan sumber air','Pengambilan spesimen klinis, pangan dan lingkungan sesuai kebutuhan','Hipotesis sumber/cara terjadinya keracunan','Tindakan pengendalian dan rekomendasi']},
    'tifoid':{title:'PE/KLB Demam Tifoid',source:'Kemenkes RI — SKDR/format PE penyakit potensial KLB.',focus:['makanan/minuman','air','sanitasi','klaster','spesimen','sumber paparan bersama'],extra:['Attack rate menurut paparan','Sumber makanan/air','Sanitasi','Spesimen','Intervensi WASH/food safety']},
    'chikungunya':{title:'PE/KLB Chikungunya',source:'Kemenkes RI — SKDR/pedoman arbovirosis yang berlaku.',focus:['distribusi kasus','paparan vektor','tempat perindukan','mobilitas','spesimen'],extra:['Survei jentik','PSN','Mobilitas','Spesimen','Intervensi vektor']},
    'klaster-tidak-lazim':{title:'PE Klaster Penyakit Tidak Lazim',source:'Kemenkes RI — format PE umum/SKDR penyakit potensial KLB dan PIE.',focus:['definisi kasus operasional','kurva epidemi','sumber paparan','etiologi','spesimen','RRA/IRA'],extra:['Definisi kasus sementara','Deskripsi orang-tempat-waktu','Hipotesis etiologi','RRA/IRA','Spesimen','Rekomendasi respons']}
  };
  const genericTemplate={title:'PE/KLB Penyakit Potensial KLB/Wabah',source:'Kemenkes RI — Buku Pedoman SKDR Penyakit Potensial KLB/Wabah (2024) dan Format PE Umum.',focus:['konfirmasi awal','besaran masalah','orang-tempat-waktu','sumber/cara penularan','etiologi','rekomendasi'],extra:['Konfirmasi awal','Definisi kasus','Line listing','Kontak','Spesimen/laboratorium','Analisis orang-tempat-waktu','Sumber/cara penularan','Respons dan rekomendasi']};
  window.PE_TEMPLATES=PE_TEMPLATES;
  function tpl(id){return PE_TEMPLATES[id]||genericTemplate}
  function diseaseLabel(id){return diseases[id]?.name||id||'Penyakit menular'}

  function diseaseOptionsV27(selected){return Object.entries(diseases).map(([id,d])=>`<option value="${esc0(id)}" ${id===selected?'selected':''}>${esc0(d.name)} — ${esc0(d.group||'')}</option>`).join('')}
  window.applyReportDisease=function(id){
    id=id||val('reportDisease')||db.selectedDisease||'campak';
    db.selectedDisease=id;
    const t=tpl(id),info=document.getElementById('reportTemplateInfo');
    if(info)info.innerHTML=`<b>${esc0(t.title)}</b><br>${esc0(t.source)}<br><span class="template-chip">Fokus: ${t.focus.map(esc0).join(' · ')}</span><div class="small" style="margin-top:6px">Template operasional harus diverifikasi terhadap versi pedoman/formulir program yang berlaku sebelum diterbitkan sebagai dokumen resmi.</div>`;
    const rd=document.getElementById('reportDisease');if(rd)rd.value=id;
    save();
  };
  window.applyAnalysisDisease=function(id){db.selectedDisease=id||db.selectedDisease||'campak';save();try{render()}catch(e){}}

  function initDiseaseSelectors(){
    const rd=document.getElementById('reportDisease'); if(rd){rd.innerHTML=diseaseOptionsV27(db.selectedDisease||act()?.disease||'campak');rd.value=db.selectedDisease||act()?.disease||'campak';applyReportDisease(rd.value)}
    const ad=document.getElementById('analysisDisease'); if(ad){ad.innerHTML=diseaseOptionsV27(db.selectedDisease||act()?.disease||'campak');ad.value=db.selectedDisease||act()?.disease||'campak'}
  }

  /* Delete controls for every major record type. */
  function confirmDelete(label){return window.confirm(`Hapus ${label}? Tindakan ini tidak dapat dibatalkan pada penyimpanan lokal.`)}
  window.deleteCase=function(id){if(!confirmDelete('kasus '+id))return;db.cases=db.cases.filter(x=>String(x.id)!==String(id));save();cases();render()}
  window.deleteContact=function(id){if(!confirmDelete('kontak '+id))return;db.contacts=(db.contacts||[]).filter(x=>String(x.id)!==String(id));save();contacts();render()}
  window.deleteSpecimen=function(id){if(!confirmDelete('spesimen '+id))return;db.specimens=(db.specimens||[]).filter(x=>String(x.id)!==String(id));save();specimens();render()}
  window.deleteFieldVisit=function(id){if(!confirmDelete('kunjungan '+id))return;db.fieldVisits=(db.fieldVisits||[]).filter(x=>String(x.id)!==String(id));save();fieldVisits();render()}
  window.deleteAlert=function(id){if(!confirmDelete('alert '+id))return;db.alerts=(db.alerts||[]).filter(x=>String(x.id)!==String(id));save();alerts();render()}
  window.deleteInvestigation=function(id){if(!confirmDelete('investigasi ini'))return;db.investigations=db.investigations.filter(x=>String(x.id)!==String(id));db.cases=db.cases.filter(x=>String(x.investigationId)!==String(id));db.contacts=(db.contacts||[]).filter(x=>String(x.investigationId)!==String(id));db.specimens=(db.specimens||[]).filter(x=>String(x.investigationId)!==String(id));db.fieldVisits=(db.fieldVisits||[]).filter(x=>String(x.investigationId)!==String(id));if(String(db.active)===String(id))db.active=db.investigations[0]?.id||null;save();render()}

  /* Override list renderers to expose delete buttons. */
  const oldCases=window.cases; window.cases=function(){
    const q=(val('caseSearch')||'').toLowerCase(),r=db.cases.filter(c=>(!db.active||c.investigationId===db.active)&&(!q||`${c.id} ${c.name}`.toLowerCase().includes(q)));
    const el=document.getElementById('caseRows');if(!el)return;
    el.innerHTML=r.map(c=>`<tr><td>${esc0(c.id)}</td><td>${esc0(c.name)}</td><td>${esc0(c.age)}</td><td>${esc0(c.sex)}</td><td>${esc0(c.onset||'-')}</td><td><span class="badge">${esc0(c.status)}</span></td><td>${esc0(c.outcome||'-')}</td><td class="table-actions"><button onclick="editCase('${esc0(c.id)}')">Edit</button><button class="btn-danger" onclick="deleteCase('${esc0(c.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="8">Belum ada kasus.</td></tr>';
  }
  const oldContacts=window.contacts; window.contacts=function(){const rows=document.getElementById('contactRows');if(!rows)return;let q=(val('contactSearch')||'').toLowerCase();let cs=(db.contacts||[]).filter(c=>(!db.active||String(c.investigationId)===String(db.active))&&(!q||`${c.id} ${c.name} ${c.caseId}`.toLowerCase().includes(q)));rows.innerHTML=cs.map(c=>`<tr><td>${esc0(c.id)}</td><td>${esc0(c.caseId)}</td><td>${esc0(c.name)}</td><td>${esc0(c.relation||'-')}</td><td>${esc0(c.last||'-')}</td><td>${esc0(c.status)}</td><td>${esc0(c.follow||'-')}</td><td class="table-actions"><button class="btn-danger" onclick="deleteContact('${esc0(c.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="8">Belum ada kontak.</td></tr>'}
  const oldSpecimens=window.specimens; window.specimens=function(){let rows=document.getElementById('specimenRows');if(!rows)return;let ss=(db.specimens||[]).filter(s=>!db.active||String(s.investigationId)===String(db.active));rows.innerHTML=ss.map(s=>`<tr><td>${esc0(s.id)}</td><td>${esc0(s.caseId)}</td><td>${esc0(s.type)}</td><td>${esc0(s.date||'-')}</td><td>${esc0(s.lab||'-')}</td><td>${esc0(s.result||'-')}</td><td>${esc0(s.status)}</td><td class="table-actions"><button class="btn-danger" onclick="deleteSpecimen('${esc0(s.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="8">Belum ada spesimen.</td></tr>'}
  const oldAlerts=window.alerts; window.alerts=function(){let rows=document.getElementById('alertRows');if(!rows)return;rows.innerHTML=(db.alerts||[]).map((a,i)=>`<tr><td>${esc0(a.date||'-')}</td><td>${esc0(diseaseLabel(a.disease))}</td><td>${esc0(a.facility||'-')}</td><td>${esc0(a.count||0)}</td><td><span class="badge">${esc0(a.result)}</span></td><td><button onclick="createInvestigationFromAlert(${i})">Buat PE</button><button class="btn-danger" onclick="deleteAlert('${esc0(a.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="6">Belum ada alert.</td></tr>';let s=document.getElementById('alertDisease');if(s)s.innerHTML=diseaseOptions()}
  const oldFieldVisits=window.fieldVisits; window.fieldVisits=function(){const rows=document.getElementById('fieldRows');if(!rows)return;const fs=(db.fieldVisits||[]).filter(v=>!db.active||String(v.investigationId)===String(db.active));rows.innerHTML=fs.map(v=>`<tr><td>${esc0(v.date||'-')}</td><td>${esc0(v.activity||'-')}</td><td>${esc0(v.subject||'-')}</td><td>${esc0(v.location||'-')}</td><td>${esc0(v.lat||'-')}, ${esc0(v.lng||'-')}</td><td>${esc0(v.officer||'-')}</td><td>${esc0(v.status||'Tersimpan lokal')}</td><td><button class="btn-danger" onclick="deleteFieldVisit('${esc0(v.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="8">Belum ada kunjungan.</td></tr>'}

  /* Dashboard investigation delete action. */
  const oldDash=window.dash; window.dash=function(){
    const q=val('search').toLowerCase(),t=val('typeFilter'),r=db.investigations.filter(x=>(!q||x.name.toLowerCase().includes(q))&&(!t||x.type===t));
    const el=document.getElementById('klbRows');if(el)el.innerHTML=r.map(x=>`<tr><td><b>${esc0(x.name)}</b></td><td>${esc0(diseaseLabel(x.disease))}</td><td>${esc0(x.desa||'-')}, ${esc0(x.kec||'-')}</td><td>${db.cases.filter(c=>String(c.investigationId)===String(x.id)).length}</td><td>${esc0(x.status)}</td><td>${esc0(x.date||'-')}</td><td><button onclick="openKlb(${x.id})">Buka</button><button class="btn-danger" onclick="deleteInvestigation('${esc0(x.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="7">Belum ada investigasi.</td></tr>';
    const cs=db.cases;const st=document.getElementById('stats');if(st)st.innerHTML=[['Investigasi',db.investigations.length],['Kasus',cs.length],['Konfirmasi',cs.filter(c=>c.status==='Konfirmasi').length],['Meninggal',cs.filter(c=>c.outcome==='Meninggal').length]].map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');
  }

  /* Disease-specific report renderer layered over the existing formal report. */
  const oldReportHtml=window.reportHtml;
  window.reportHtml=function(){
    const base=oldReportHtml();
    const id=document.getElementById('reportDisease')?.value||db.selectedDisease||act()?.disease||'campak';
    const t=tpl(id),d=reportData();
    const focus=`<div class="access-card" style="padding:12px;border-radius:10px"><b>Format khusus penyakit: ${esc0(t.title)}</b><br><span class="small">Sumber/rujukan: ${esc0(t.source)}</span><br><b>Fokus PE/KLB:</b> ${t.focus.map(esc0).join(' • ')}</div>`;
    const diseaseSection=`<h3>FORMAT KHUSUS PENYAKIT</h3>${focus}<h4>Komponen khusus yang harus dilengkapi</h4><ol>${t.extra.map(x=>`<li>${esc0(x)}</li>`).join('')}</ol><p class="muted">Catatan: komponen di atas merupakan pemetaan operasional untuk membantu investigator menyusun laporan berdasarkan penyakit. Verifikasi akhir terhadap pedoman/formulir Kemenkes versi yang berlaku tetap diperlukan sebelum laporan resmi diterbitkan.</p>`;
    return base.replace('<div class="exec"><h3>RINGKASAN EKSEKUTIF</h3>',diseaseSection+'<div class="exec"><h3>RINGKASAN EKSEKUTIF</h3>');
  };

  /* v28 Production/SaaS layer: Supabase-backed registration and server-side subscription access. */
  async function v28BackendAccess(){
    const sb=await backendClient();
    if(!sb||!GORUT_USER||GORUT_USER.id==='offline') return {configured:false,allowed:true,admin:true};
    const {data:status,error}=await sb.from('my_access_status').select('*').maybeSingle();
    if(error) return {configured:true,allowed:false,error:error.message};
    const admin=!!status?.is_admin;
    const allowed=admin||!!status?.has_access;
    return {configured:true,allowed,admin,expiresAt:status?.expires_at||null};
  }
  async function v28ShowAccessGate(reason){
    const msg=document.getElementById('loginMsg');
    if(msg){msg.style.display='block';msg.innerHTML=`<b>Akses belum aktif.</b><br>${esc0(reason||'Akun memerlukan aktivasi admin saat backend produksi digunakan.')}<br><br>Mode publik gratis. Aktivasi server hanya diperlukan jika organisasi mengaktifkan backend produksi.`;}
  }
  async function v28CheckAfterBackendLogin(){
    const a=await v28BackendAccess();
    if(!a.allowed){try{const sb=await backendClient();if(sb)await sb.auth.signOut();}catch(e){} loginEl.style.display='block';app.style.display='none';await v28ShowAccessGate(a.error||'Masa akses belum aktif atau sudah berakhir.');return false;}
    if(a.admin){document.getElementById('roleBadge').textContent='Role: Admin · akses penuh';}
    else if(a.expiresAt){document.getElementById('roleBadge').textContent=`Role: Gratis · aktif s/d ${new Date(a.expiresAt).toLocaleString('id-ID')}`;}
    return true;
  }
  const v28OriginalSubmitRegistration=window.submitRegistration;
  window.submitRegistration=async function(){
    const sb=await backendClient();
    if(!sb){return v28OriginalSubmitRegistration();}
    const name=val('regName').trim(),wa=val('regWhatsapp').trim(),email=val('regEmail').trim().toLowerCase(),pw=val('regPassword'),inst=val('regInstitution').trim(),ref=val('regPaymentRef').trim(),note=val('regNote').trim();
    if(!name||!wa||!email||!pw)return alert('Nama, WhatsApp, email, dan kata sandi wajib diisi.');
    if(pw.length<8)return alert('Kata sandi minimal 8 karakter untuk akun produksi.');
    const sign=await sb.auth.signUp({email,password:pw,options:{data:{full_name:name,whatsapp:wa,institution:inst}}});
    if(sign.error){return alert('Registrasi akun gagal: '+sign.error.message);}
    const rr=await sb.rpc('create_registration_request',{p_email:email,p_full_name:name,p_whatsapp:wa,p_institution:inst,p_payment_reference:ref,p_note:note});
    if(rr.error){return alert('Akun berhasil dibuat, tetapi permintaan akses belum tercatat: '+rr.error.message);}
    const rid=rr.data;
    const msg=`Registrasi GORUT-OUTBREAK AI%0AID: ${encodeURIComponent(rid)}%0ANama: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0AWhatsApp: ${encodeURIComponent(wa)}%0AInstansi: ${encodeURIComponent(inst)}%0APenggunaan aplikasi GORUT-OUTBREAK AI versi publik gratis.%0ARef: ${encodeURIComponent(ref)}`;
    const box=document.getElementById('registerMsg');box.style.display='block';box.innerHTML=`Permintaan akses <b>${esc0(rid)}</b> sudah tercatat di server dan menunggu verifikasi admin.<br><br><a href="https://wa.me/6282290150334?text=${msg}" target="_blank" rel="noopener"><button class="btn-whatsapp">Kirim Konfirmasi WhatsApp</button></a><br><span class="small">Jika verifikasi email Supabase aktif, silakan konfirmasi email terlebih dahulu sebelum masuk.</span>`;
  };
  window.activateRegistrationV28=async function(id){
    const sb=await backendClient();if(!sb)return alert('Backend produksi belum dikonfigurasi.');
    const r=await sb.rpc('activate_premium_7d',{p_registration_id:id});
    if(r.error)return alert('Aktivasi gagal: '+r.error.message);
    alert(`Akses Akses aktif sampai ${new Date(r.data.expires_at).toLocaleString('id-ID')}`);renderAdminV28();
  };
  window.renderAdminV28=async function(){
    const el=document.getElementById('v28RegList');if(!el)return;const sb=await backendClient();
    if(!sb){el.innerHTML='<tr><td colspan="8">Backend belum dikonfigurasi. Data lokal dikelola pada panel v27.</td></tr>';return;}
    const r=await sb.from('registration_requests').select('id,full_name,email,whatsapp,institution,payment_amount,payment_reference,status,created_at').order('created_at',{ascending:false});
    if(r.error){el.innerHTML=`<tr><td colspan="8">${esc0(r.error.message)}</td></tr>`;return;}
    el.innerHTML=r.data?.length?r.data.map(x=>`<tr><td>${esc0(x.id)}</td><td>${esc0(x.full_name)}</td><td>${esc0(x.email)}</td><td>${esc0(x.whatsapp)}</td><td>${esc0(x.institution||'-')}</td><td>Rp${Number(x.payment_amount||0).toLocaleString('id-ID')}</td><td><span class="badge">${esc0(x.status)}</span></td><td>${x.status!=='verified'?`<button class="primary" onclick="activateRegistrationV28('${esc0(x.id)}')">Aktifkan 7 Hari</button>`:'Terverifikasi'}</td></tr>`).join(''):'<tr><td colspan="8">Belum ada permintaan registrasi server.</td></tr>';
  };
  function addV28Admin(){
    const sec=document.getElementById('admin');if(!sec||document.getElementById('v28AccessAdmin'))return;
    const c=document.createElement('div');c.className='card';c.id='v28AccessAdmin';c.innerHTML=`<h2>🛡️ Manajemen Akses Organisasi v28</h2><div class="access-card" style="padding:12px;border-radius:10px;margin-bottom:10px"><b>Mode publik:</b> gratis. Backend organisasi dapat diaktifkan terpisah.</div><div class="notice">Aktivasi produksi menggunakan PostgreSQL/Supabase RPC. Masa akses ditetapkan server-side selama tepat 7 × 24 jam. Verifikasi transfer tetap manual; tidak ada klaim verifikasi bank otomatis.</div><button onclick="renderAdminV28()">↻ Muat Permintaan Server</button><div style="overflow:auto;margin-top:10px"><table><thead><tr><th>ID</th><th>Nama</th><th>Email</th><th>WhatsApp</th><th>Instansi</th><th>Pembayaran</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="v28RegList"></tbody></table></div>`;sec.appendChild(c);renderAdminV28();
  }
  const v28OldLogin=window.login;
  window.login=async function(){
    const sb=await backendClient();
    if(sb){
      const email=val('email').trim().toLowerCase(),password=val('password');
      const r=await sb.auth.signInWithPassword({email,password});
      if(r.error){const m=document.getElementById('loginMsg');m.style.display='block';m.textContent='Login gagal: '+r.error.message;return;}
      GORUT_USER=r.data.user; await authStatus();
      if(!(await v28CheckAfterBackendLogin()))return;
      loginEl.style.display='none';app.style.display='block';setRoleUI();render();return;
    }
    return v28OldLogin();
  };
  const v28OldRenderForAccess=window.render;
  window.render=async function(){
    if(GORUT_USER&&GORUT_USER.id!=='offline'&&GORUT_BACKEND?.enabled){const a=await v28BackendAccess();if(!a.allowed){loginEl.style.display='block';app.style.display='none';await v28ShowAccessGate(a.error);return;}}
    if(!enforceAccess())return;
    v28OldRenderForAccess();setRoleUI();addV28Admin();try{renderAdminV28()}catch(e){}
  };
  /* Registration and 7-day access. Admin is unrestricted. This is a local UX layer;
     production deployment should enforce expiry server-side. */
  window.showRegister=function(){document.getElementById('registerModal').classList.add('show')};
  window.closeRegister=function(){document.getElementById('registerModal').classList.remove('show')};
  async function digestPassword(pw){
    try{const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(pw));return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')}catch(e){return btoa(unescape(encodeURIComponent(pw)))}
  }  window.submitRegistration=async function(){
    const name=val('regName').trim(),wa=val('regWhatsapp').trim(),email=val('regEmail').trim().toLowerCase(),pw=val('regPassword'),inst=val('regInstitution').trim(),ref=val('regPaymentRef').trim(),note=val('regNote').trim();
    if(!name||!wa||!email||!pw){return alert('Nama, WhatsApp, email, dan kata sandi wajib diisi.')}
    const regs=JSON.parse(localStorage.getItem('gorut-registrations')||'[]');
    if(regs.some(x=>x.email===email))return alert('Email tersebut sudah terdaftar.');
    const rec={id:'REG-'+Date.now(),name,whatsapp:wa,email,passwordHash:await digestPassword(pw),institution:inst,paymentRef:ref,note,status:'Menunggu verifikasi pembayaran',requestedAt:new Date().toISOString(),accessDays:7,role:'petugas'};
    regs.push(rec);localStorage.setItem('gorut-registrations',JSON.stringify(regs));
    const msg=`Registrasi GORUT-OUTBREAK AI%0AID: ${encodeURIComponent(rec.id)}%0ANama: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0AWhatsApp: ${encodeURIComponent(wa)}%0AInstansi: ${encodeURIComponent(inst)}%0APenggunaan aplikasi GORUT-OUTBREAK AI versi publik gratis.%0ARef: ${encodeURIComponent(ref)}`;
    const box=document.getElementById('registerMsg');box.style.display='block';box.innerHTML=`Registrasi tersimpan sebagai <b>${esc0(rec.id)}</b> dan menunggu verifikasi admin.<br><br><a href="https://wa.me/6282290150334?text=${msg}" target="_blank" rel="noopener"><button class="btn-whatsapp">Kirim Konfirmasi WhatsApp</button></a>`;
  };
  function enforceAccess(){
    if(!GORUT_USER)return true;
    if(GORUT_USER.role&&String(GORUT_USER.role).toLowerCase().includes('admin'))return true;
    const a=getAccess();
    if(a.expiresAt&&Date.now()>new Date(a.expiresAt).getTime()){alert('Masa akses 7 hari telah berakhir. Silakan hubungi admin untuk perpanjangan.');return false}
    return true;
  }
  window.activateRegistration=function(id){
    const regs=JSON.parse(localStorage.getItem('gorut-registrations')||'[]'),r=regs.find(x=>x.id===id);if(!r)return alert('Registrasi tidak ditemukan.');r.status='Aktif';r.activatedAt=new Date().toISOString();r.expiresAt=new Date(Date.now()+7*86400000).toISOString();localStorage.setItem('gorut-registrations',JSON.stringify(regs));alert(`Akses ${r.email} aktif sampai ${new Date(r.expiresAt).toLocaleString('id-ID')}`);renderAdminV27();
  };
  window.renderAdminV27=function(){const el=document.getElementById('v27RegList');if(!el)return;const regs=JSON.parse(localStorage.getItem('gorut-registrations')||'[]');el.innerHTML=regs.length?regs.map(r=>`<tr><td>${esc0(r.id)}</td><td>${esc0(r.name)}</td><td>${esc0(r.email)}</td><td>${esc0(r.whatsapp)}</td><td>${esc0(r.status)}</td><td>${r.expiresAt?esc0(new Date(r.expiresAt).toLocaleString('id-ID')):'-'}</td><td>${r.status!=='Aktif'?`<button onclick="activateRegistration('${esc0(r.id)}')">Aktifkan 7 Hari</button>`:'Aktif'}</td></tr>`).join(''):'<tr><td colspan="7">Belum ada registrasi.</td></tr>'}

  function addV27Admin(){const sec=document.getElementById('admin');if(!sec||document.getElementById('v27AccessAdmin'))return;const c=document.createElement('div');c.className='card';c.id='v27AccessAdmin';c.innerHTML=`<h2>🔐 Manajemen Akses Organisasi</h2><div class="access-card" style="padding:12px;border-radius:10px;margin-bottom:10px"><b>Mode publik:</b> gratis. Tidak ada pembayaran pada versi publik.</div><div class="notice">Aktivasi di bawah adalah administrasi lokal. Untuk aplikasi publik/komersial, masa berlaku harus ditegakkan di backend agar tidak dapat dimanipulasi dari browser.</div><button onclick="renderAdminV27()">↻ Muat Registrasi</button><div style="overflow:auto;margin-top:10px"><table><thead><tr><th>ID</th><th>Nama</th><th>Email</th><th>WhatsApp</th><th>Status</th><th>Berakhir</th><th>Aksi</th></tr></thead><tbody id="v27RegList"></tbody></table></div>`;sec.appendChild(c);renderAdminV27()}

  /* Local registration login when no backend is configured. */
  const originalLogin=window.login;
  window.login=async function(){
    const email=val('email').trim().toLowerCase(),pw=val('password');
    const regs=JSON.parse(localStorage.getItem('gorut-registrations')||'[]');
    const local=regs.find(x=>x.email===email);
    if(local && !(window.GORUT_BACKEND&&window.GORUT_BACKEND.enabled)){
      const hash=await digestPassword(pw);
      if(hash!==local.passwordHash)return alert('Email atau kata sandi tidak sesuai.');
      if(local.status!=='Aktif')return alert('Akun belum aktif. Pembayaran perlu diverifikasi admin terlebih dahulu.');
      GORUT_USER={id:local.id,email:local.email,role:local.role||'petugas',accessExpiresAt:local.expiresAt};
      if(local.expiresAt&&Date.now()>new Date(local.expiresAt).getTime())return alert('Masa akses 7 hari telah berakhir.');
      loginEl.style.display='none';app.style.display='block';document.getElementById('roleBadge').textContent=`Role: ${GORUT_USER.role} · aktif s/d ${new Date(local.expiresAt).toLocaleDateString('id-ID')}`;setRoleUI();render();return;
    }
    return originalLogin();
  };
  function setRoleUI(){
    const isAdmin=!!(GORUT_USER&&GORUT_USER.role&&String(GORUT_USER.role).toLowerCase().includes('admin'));
    const nav=[...document.querySelectorAll('nav button')];nav.forEach(b=>{if((b.getAttribute('onclick')||'').includes("page('admin'"))b.style.display=isAdmin?'block':'none'});
    const sec=document.getElementById('admin');if(sec)sec.style.display=isAdmin?'block':'none';
  }
  /* Patch login/demo and render without breaking backend auth. */
  const oldDemo=window.demoLogin; window.demoLogin=function(){
    loginEl.style.display='none';app.style.display='block';GORUT_USER={id:'offline',email:val('email')||'offline',role:'admin_kabupaten'};document.getElementById('roleBadge').textContent='Mode lokal/demo — akses tidak terautentikasi';const d=document.getElementById('backendDetail');if(d)d.textContent='Mode lokal: tidak ada autentikasi server atau pembatasan akses yang aman. Data hanya tersimpan di perangkat ini; jangan masukkan identitas pasien nyata.';setRoleUI();render();
  };
  const oldRender=window.render; window.render=function(){
    if(!enforceAccess())return;
    oldRender();
    setRoleUI();
    initDiseaseSelectors();
    addV27Admin();
    try{renderAdminV27()}catch(e){}
  };

  /* Make add forms disease-aware and carry disease onto records. */
  const oldSaveCase=window.saveCase; window.saveCase=function(){oldSaveCase();const c=db.cases[db.cases.length-1];if(c)c.disease=db.selectedDisease||act()?.disease||'campak';save();cases()}
  const oldSaveContact=window.saveContact; window.saveContact=function(){oldSaveContact();const c=db.contacts[db.contacts.length-1];if(c)c.disease=db.selectedDisease||act()?.disease||'campak';save();contacts()}
  const oldSaveSpecimen=window.saveSpecimen; window.saveSpecimen=function(){oldSaveSpecimen();const c=db.specimens[db.specimens.length-1];if(c)c.disease=db.selectedDisease||act()?.disease||'campak';save();specimens()}

  /* v28 final wrappers are installed after v27 wrappers so production behavior wins when backend is configured. */
  const v28FinalLoginBase=window.login;
  window.login=async function(){
    const sb=await backendClient();
    if(sb){
      const email=val('email').trim().toLowerCase(),password=val('password');
      const r=await sb.auth.signInWithPassword({email,password});
      if(r.error){const m=document.getElementById('loginMsg');m.style.display='block';m.textContent='Login gagal: '+r.error.message;return;}
      GORUT_USER=r.data.user; await authStatus();
      const access=await v28BackendAccess();
      if(!access.allowed){try{await sb.auth.signOut()}catch(e){};loginEl.style.display='block';app.style.display='none';await v28ShowAccessGate(access.error||'Masa akses belum aktif atau sudah berakhir.');return;}
      loginEl.style.display='none';app.style.display='block';setRoleUI();await window.render();return;
    }
    return v28FinalLoginBase();
  };
  const v28FinalRenderBase=window.render;
  window.render=async function(){
    if(GORUT_USER&&GORUT_USER.id!=='offline'&&window.GORUT_BACKEND?.enabled){const access=await v28BackendAccess();if(!access.allowed){loginEl.style.display='block';app.style.display='none';await v28ShowAccessGate(access.error);return;}}
    if(!enforceAccess())return;
    v28FinalRenderBase();setRoleUI();initDiseaseSelectors();
    // v57: legacy payment/subscription UI is retired permanently.
    try{document.getElementById('v27AccessAdmin')?.remove()}catch(e){}
    try{document.getElementById('v28AccessAdmin')?.remove()}catch(e){}
    try{document.querySelectorAll('[id*=payment],[id*=Payment],[id*=premium],[id*=Premium],[class*=payment],[class*=Payment],[class*=premium],[class*=Premium]').forEach(el=>{if(el.closest('#admin'))el.remove()})}catch(e){}
    try{renderV45Admin()}catch(e){}
  };
  /* Backend registration is preferred; local registration remains available only when no backend is configured. */
  const v28FinalSubmitRegistration=window.submitRegistration;
  window.submitRegistration=async function(){
    const sb=await backendClient();
    if(!sb)return v28FinalSubmitRegistration();
    const name=val('regName').trim(),wa=val('regWhatsapp').trim(),email=val('regEmail').trim().toLowerCase(),pw=val('regPassword'),inst=val('regInstitution').trim(),ref=val('regPaymentRef').trim(),note=val('regNote').trim();
    if(!name||!wa||!email||!pw)return alert('Nama, WhatsApp, email, dan kata sandi wajib diisi.');
    if(pw.length<8)return alert('Kata sandi minimal 8 karakter.');
    const sign=await sb.auth.signUp({email,password:pw,options:{data:{full_name:name,whatsapp:wa,institution:inst}}});
    if(sign.error)return alert('Registrasi akun gagal: '+sign.error.message);
    const rr=await sb.rpc('create_registration_request',{p_email:email,p_full_name:name,p_whatsapp:wa,p_institution:inst,p_payment_reference:ref,p_note:note});
    if(rr.error)return alert('Akun dibuat tetapi permintaan akses gagal dicatat: '+rr.error.message);
    const rid=rr.data; const msg=`Registrasi GORUT-OUTBREAK AI%0AID: ${encodeURIComponent(rid)}%0ANama: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0AWhatsApp: ${encodeURIComponent(wa)}%0AInstansi: ${encodeURIComponent(inst)}%0APenggunaan aplikasi GORUT-OUTBREAK AI versi publik gratis.%0ARef: ${encodeURIComponent(ref)}`;
    const box=document.getElementById('registerMsg');box.style.display='block';box.innerHTML=`Permintaan <b>${esc0(rid)}</b> tercatat di server dan menunggu verifikasi admin.<br><br><a href="https://wa.me/6282290150334?text=${msg}" target="_blank" rel="noopener"><button class="btn-whatsapp">Kirim Konfirmasi WhatsApp</button></a>`;
  };
  /* Start selectors after DOM is ready. */
  setTimeout(()=>{try{initDiseaseSelectors();addV27Admin()}catch(e){console.warn(e)}},300);
})();

/* ============================================================
   GORUT-OUTBREAK AI v29 — Premium SaaS UI & Access UX
   Security model: server-side subscription is authoritative when backend is enabled.
   Offline/local mode is explicitly a demo/training fallback.
   ============================================================ */
(function(){
  'use strict';
  const V29={timer:null};
  function escV(x){return (window.esc0?window.esc0(x):String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])))}
  function fmtV(d){return d?new Date(d).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'-'}
  function backendOn(){return !!(window.GORUT_BACKEND&&window.GORUT_BACKEND.enabled)}
  async function accessV(){
    if(!backendOn()||!window.GORUT_USER||window.GORUT_USER.id==='offline'){
      const a=window.getAccess?window.getAccess():{};
      const admin=!!(window.GORUT_USER&&String(window.GORUT_USER.role||'').toLowerCase().includes('admin'));
      return {allowed:admin||!a.expiresAt||Date.now()<new Date(a.expiresAt).getTime(),isAdmin:admin,expires_at:a.expiresAt||null,source:'local'};
    }
    try{
      const sb=await window.backendClient(); if(!sb)return {allowed:false,error:'Backend belum tersedia.'};
      const {data,error}=await sb.from('my_access_status').select('*').single();
      if(error) return {allowed:false,error:error.message};
      return {allowed:!!data.has_access,isAdmin:!!data.is_admin,expires_at:data.expires_at,source:'server'};
    }catch(e){return {allowed:false,error:e.message}}
  }
  window.toggleV29Profile=function(){document.getElementById('v29ProfilePanel')?.classList.toggle('show')}
  window.v29Logout=async function(){
    try{const sb=await window.backendClient?.();if(sb)await sb.auth.signOut()}catch(e){}
    window.GORUT_USER=null; if(V29.timer)clearInterval(V29.timer);
    document.getElementById('v29Topbar')?.style.setProperty('display','none');
    const login=document.getElementById('login'),app=document.getElementById('app');if(login)login.style.display='grid';if(app)app.style.display='none';
  }
  function countdown(exp){
    if(!exp)return 'Tidak terbatas';
    let ms=new Date(exp).getTime()-Date.now(); if(ms<=0)return 'Berakhir';
    const d=Math.floor(ms/86400000);ms%=86400000;const h=Math.floor(ms/3600000);ms%=3600000;const m=Math.floor(ms/60000);const s=Math.floor((ms%60000)/1000);
    return `${d}h ${String(h).padStart(2,'0')}j ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}d`;
  }
  async function paintAccess(){
    const bar=document.getElementById('v29Topbar');if(!bar)return;
    const a=await accessV();
    if(!window.GORUT_USER){bar.style.display='none';return}
    bar.style.display='flex';
    const pill=document.getElementById('v29AccessPill'),label=document.getElementById('v29UserLabel'),body=document.getElementById('v29ProfileBody');
    const email=window.GORUT_USER.email||'-'; label.textContent=email.length>24?email.slice(0,22)+'…':email;
    pill.className='access-pill '+(a.isAdmin?'admin':(!a.allowed?'expired':''));
    pill.innerHTML=a.isAdmin?'♛ ADMIN · AKSES PENUH':a.allowed?`✦ PREMIUM · <span class="countdown-v29">${countdown(a.expires_at)}</span>`:'⚠ AKSES BERAKHIR';
    body.innerHTML=`<div style="font-weight:800">${escV(email)}</div><div class="small" style="margin-top:3px">Role: ${escV(window.GORUT_USER.role||'petugas')}</div><hr style="border:0;border-top:1px solid #e5e7eb;margin:10px 0"><div><b>Status:</b> ${a.isAdmin?'Admin — gratis & tanpa batas':a.allowed?'Akses aktif':'Tidak aktif'}</div><div style="margin-top:6px"><b>Berlaku sampai:</b> ${a.isAdmin?'Tidak terbatas':fmtV(a.expires_at)}</div><div style="margin-top:6px"><b>Status:</b> akses gratis</div><div class="security-note-v29" style="margin-top:10px">Mode: ${a.source==='server'?'server-side production':'offline/demo'}. Pada mode production, tanggal kedaluwarsa ditentukan server.</div>`;
    if(V29.timer)clearInterval(V29.timer);V29.timer=setInterval(()=>{if(!a.isAdmin&&a.expires_at){const el=document.querySelector('.countdown-v29');if(el)el.textContent=countdown(a.expires_at)}},1000);
  }
  window.showV29AccessDashboard=function(){
    const id='v29-access-card'; if(document.getElementById(id)){document.getElementById(id).scrollIntoView({behavior:'smooth'});return;}
    const sec=document.getElementById('dashboard');if(!sec)return;
    const c=document.createElement('div');c.id=id;c.className='card premium-hero-v29';c.style.marginBottom='16px';c.innerHTML='<div class="eyebrow">PREMIUM ACCESS</div><h2 style="margin:5px 0">Akses GORUT-OUTBREAK AI</h2><p>Kelola investigasi, PE/KLB, analisis epidemiologi dan Research Studio dalam satu platform.</p><div id="v29DashAccess"></div>';
    sec.insertBefore(c,sec.firstElementChild); paintDashAccess();
  }
  async function paintDashAccess(){
    const el=document.getElementById('v29DashAccess');if(!el)return;const a=await accessV();
    el.innerHTML=`<div class="metric-strip-v29"><div><small>Paket</small><strong>${a.isAdmin?'ADMIN':'GRATIS'}</strong></div><div><small>Status</small><strong>${a.allowed?'AKTIF':'BERAKHIR'}</strong></div><div><small>Sisa akses</small><strong>${a.isAdmin?'∞':countdown(a.expires_at)}</strong></div><div><small>Berlaku sampai</small><strong style="font-size:13px">${a.isAdmin?'Tanpa batas':fmtV(a.expires_at)}</strong></div></div>`;
  }
  const oldRenderV29=window.render;
  window.render=async function(){
    const result=oldRenderV29.apply(this,arguments);
    try{await paintAccess();showV29AccessDashboard();}catch(e){console.warn('v29 access UI',e)}
    return result;
  };
  const oldDemoV29=window.demoLogin;
  window.demoLogin=function(){oldDemoV29();setTimeout(()=>{paintAccess();showV29AccessDashboard()},100)};
  setTimeout(()=>{try{paintAccess()}catch(e){}},700);
})();

/* GORUT-OUTBREAK AI v30 — Production Release Candidate overlay */
(function(){
'use strict';
const esc=(x)=>window.esc0?window.esc0(x):String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
async function access(){
 if(!window.GORUT_BACKEND?.enabled||!window.GORUT_USER||window.GORUT_USER.id==='offline') return {has_access:true,is_admin:String(window.GORUT_USER?.role||'').toLowerCase().includes('admin'),source:'local'};
 const sb=await window.backendClient(); if(!sb)return {has_access:false,is_admin:false,error:'Backend belum tersedia'};
 const r=await sb.from('my_access_status').select('*').single(); return r.error?{has_access:false,is_admin:false,error:r.error.message}:{...r.data,source:'server'};
}
function badge(s){const k=String(s||'pending').toLowerCase();return `<span class="v30-status ${esc(k)}">${esc(k)}</span>`}
window.v30RejectRegistration=async function(id){if(!confirm('Tolak registrasi ini?'))return;const sb=await window.backendClient();if(!sb)return alert('Backend belum dikonfigurasi.');const r=await sb.rpc('reject_registration',{p_registration_id:id,p_reason:'Ditolak oleh admin'});if(r.error)return alert('Gagal: '+r.error.message);await window.v30RefreshAdmin()};
window.v30RefreshAdmin=async function(){
 const box=document.getElementById('v30AdminContent');if(!box)return;const a=await access();if(!a.is_admin){box.innerHTML='<div class="security-note-v29">Panel administrasi hanya untuk admin.</div>';return}
 const sb=await window.backendClient();if(!sb){box.innerHTML='<div class="notice">Backend belum dikonfigurasi.</div>';return}
 box.innerHTML='<div class="notice">Memuat…</div>';
 const [r,s,p,l]=await Promise.all([sb.from('registration_requests').select('id,user_id,full_name,email,whatsapp,institution,payment_reference,payment_amount,status,created_at').order('created_at',{ascending:false}),sb.from('subscriptions').select('id,user_id,plan_code,status,starts_at,expires_at,activated_at').order('created_at',{ascending:false}),sb.from('profiles').select('id,full_name,role,facility,created_at').order('created_at',{ascending:false}),sb.from('audit_log').select('id,actor_id,action,entity_type,entity_id,created_at').order('created_at',{ascending:false}).limit(20)]);
 if(r.error||s.error||p.error||l.error){box.innerHTML=`<div class="notice">Gagal memuat admin: ${esc((r.error||s.error||p.error||l.error).message)}</div>`;return}
 const R=r.data||[],S=s.data||[],P=p.data||[],L=l.data||[];const pending=R.filter(x=>x.status==='pending').length,active=S.filter(x=>x.status==='active'&&new Date(x.expires_at)>new Date()).length;
 box.innerHTML=`<div class="v30-admin-grid"><div class="v30-stat"><small>Registrasi pending</small><strong>${pending}</strong></div><div class="v30-stat"><small>Akses aktif</small><strong>${active}</strong></div><div class="v30-stat"><small>Total pengguna</small><strong>${P.length}</strong></div><div class="v30-stat"><small>Audit terbaru</small><strong>${L.length}</strong></div></div>
 <div class="card" style="margin-top:14px"><div class="v30-section-title"><h3>💳 Registrasi & Pembayaran</h3><span class="small">Rp30.000 · 7 hari</span></div><div style="overflow:auto"><table><thead><tr><th>Nama</th><th>Email</th><th>WhatsApp</th><th>Instansi</th><th>Ref</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${R.length?R.map(x=>`<tr><td>${esc(x.full_name)}</td><td>${esc(x.email)}</td><td>${esc(x.whatsapp)}</td><td>${esc(x.institution||'-')}</td><td>${esc(x.payment_reference||'-')}</td><td>${badge(x.status)}</td><td class="table-actions">${x.status==='pending'?`<button class="primary" onclick="activateRegistrationV28('${esc(x.id)}')">Aktifkan 7 Hari</button><button class="btn-danger" onclick="v30RejectRegistration('${esc(x.id)}')">Tolak</button>`:'—'}</td></tr>`).join(''):'<tr><td colspan="7">Belum ada permintaan.</td></tr>'}</tbody></table></div></div>
 <div class="card" style="margin-top:14px"><h3>👥 Pengguna</h3><div style="overflow:auto"><table><thead><tr><th>Nama</th><th>Role</th><th>Fasilitas</th><th>Dibuat</th></tr></thead><tbody>${P.map(x=>`<tr><td>${esc(x.full_name||'-')}</td><td>${esc(x.role)}</td><td>${esc(x.facility||'-')}</td><td>${new Date(x.created_at).toLocaleString('id-ID')}</td></tr>`).join('')||'<tr><td colspan="4">Belum ada.</td></tr>'}</tbody></table></div></div>
 <div class="card" style="margin-top:14px"><h3>🧾 Subscription</h3><div style="overflow:auto"><table><thead><tr><th>User</th><th>Paket</th><th>Status</th><th>Mulai</th><th>Berakhir</th></tr></thead><tbody>${S.map(x=>`<tr><td>${esc(x.user_id)}</td><td>${esc(x.plan_code)}</td><td>${badge(x.status)}</td><td>${x.starts_at?new Date(x.starts_at).toLocaleString('id-ID'):'-'}</td><td>${x.expires_at?new Date(x.expires_at).toLocaleString('id-ID'):'-'}</td></tr>`).join('')||'<tr><td colspan="5">Belum ada.</td></tr>'}</tbody></table></div></div>
 <div class="card" style="margin-top:14px"><h3>🔎 Audit Trail</h3><div style="overflow:auto"><table><thead><tr><th>Waktu</th><th>Aksi</th><th>Entitas</th><th>ID</th></tr></thead><tbody>${L.map(x=>`<tr><td>${new Date(x.created_at).toLocaleString('id-ID')}</td><td>${esc(x.action)}</td><td>${esc(x.entity_type||'-')}</td><td>${esc(x.entity_id||'-')}</td></tr>`).join('')||'<tr><td colspan="4">Belum ada.</td></tr>'}</tbody></table></div></div>
 <div class="v30-receipt-note" style="margin-top:12px">Verifikasi pembayaran dilakukan manual. Jangan meminta atau menyimpan PIN, OTP, atau kredensial bank.</div>`;
};
function addDelete(fnName,rowId,buttonFn){const old=window[fnName];if(typeof old!=='function'||old.__v30)return;const w=function(){const r=old.apply(this,arguments);setTimeout(()=>{try{rowId()}catch(e){}},0);return r};w.__v30=true;window[fnName]=w}
function addActions(id,fn,findId){const rows=document.getElementById(id);if(!rows)return;rows.querySelectorAll('tr').forEach(tr=>{if(tr.querySelector('[data-v30-delete]'))return;const key=findId(tr);if(!key)return;const td=tr.insertCell(-1);td.className='table-actions';td.innerHTML=`<button class="btn-danger" data-v30-delete onclick="${fn}('${esc(key)}')">Hapus</button>`})}
function injectDeletes(){
 addActions('caseRows','deleteCase',tr=>tr.cells[0]?.textContent.trim());
 addActions('contactRows','deleteContact',tr=>tr.cells[0]?.textContent.trim());
 addActions('specimenRows','deleteSpecimen',tr=>tr.cells[0]?.textContent.trim());
 addActions('alertRows','deleteAlert',tr=>{const d=tr.cells[0]?.textContent.trim(),n=tr.cells[1]?.textContent.trim();const x=(db.alerts||[]).find(a=>String(a.date||'-')===d&&String(window.diseases?.[a.disease]?.name||a.disease)===n);return x?.id});
 addActions('fieldRows','deleteFieldVisit',tr=>{const d=tr.cells[0]?.textContent.trim(),sub=tr.cells[2]?.textContent.trim();return (db.fieldVisits||[]).find(x=>String(x.date||'')===d&&String(x.subject||'-')===sub)?.id});
}
const oldRender=window.render;window.render=async function(){const r=oldRender.apply(this,arguments);setTimeout(()=>{injectDeletes();v30RefreshAdmin().catch(()=>{})},300);return r};
setTimeout(()=>{try{injectDeletes();v30RefreshAdmin()}catch(e){}},1200);
})();


/* v31 Food Poisoning completion */
(function(){
  const oldOpen=window.openKlb;
  window.openKlb=function(id){oldOpen(id);const o=act();if(!o)return;const type=document.getElementById('inType');if(type){type.value=o.type||'Penyakit Menular';}syncInvestigationType();const f=o.foodInvestigation||{};[['foodEventName','eventName'],['foodEventDate','eventDate'],['foodVenue','venue'],['foodSource','foodSource'],['foodMealTime','mealTime'],['foodExposed','exposed'],['foodIll','ill'],['foodDead','dead'],['foodSuspected','suspectedFood'],['foodHandler','foodHandler'],['foodWater','waterSource'],['foodStorage','storage'],['foodHypothesis','initialHypothesis']].forEach(([id,k])=>{const e=document.getElementById(id);if(e)e.value=f[k]??''});db.selectedDisease=o.disease||db.selectedDisease;save();};
  const oldSaveCase=window.saveCase;
  window.saveCase=function(){const o=act();const isFood=o?.disease==='keracunan-pangan';const food=isFood?{exposureFood:val('caseFood'),consumedAt:val('caseConsumedAt'),onsetTime:val('caseOnsetTime'),incubationHours:+val('caseIncubation')||null,symptoms:val('caseSymptoms'),source:val('caseFoodSource'),hospitalized:val('caseHospitalized'),specimenClinical:val('caseClinicalSpecimen')}:null;oldSaveCase();const c=db.cases[db.cases.length-1];if(c&&food&&!c.foodCase){c.foodCase=food;save();cases();}}
})();


/* v34 Disease-by-Disease Workflow Audit */
(function(){
  const V35_REQUIRED={
    'kolera':['diare','spesimen','hasil laboratorium'],
    'diare-akut':['diare','spesimen','hasil laboratorium'],
    'diare-berdarah':['darah','spesimen','hasil laboratorium'],
    'jaundis':['jaundis','spesimen','hasil laboratorium'],
    'leptospirosis':['banjir','tikus','spesimen','hasil laboratorium'],
    'meningitis':['kaku kuduk','spesimen CSF','hasil laboratorium'],
    'pneumonia':['sesak','spesimen respiratori','hasil laboratorium'],
    'flu-burung':['unggas','spesimen saluran napas','pelacakan kontak'],
    'difteri':['pseudomembran','imunisasi','spesimen usap','profilaksis'],
    'campak':['ruam','imunisasi','spesimen serum','spesimen urine'],
    'pertusis':['batuk paroksismal','imunisasi','spesimen nasofaring'],
    'afp':['kelumpuhan','spesimen tinja pertama','spesimen tinja kedua','60-day follow-up'],
    'tetanus':['trismus','luka','imunisasi tetanus'],
    'tn':['tanggal lahir','tali pusat','imunisasi ibu'],
    'tifoid':['demam','makanan/minuman','spesimen darah/tinja'],
    'keracunan-pangan':['jumlah orang terpapar','jumlah orang sakit','makanan/minuman','spesimen pangan','spesimen klinis'],
    'malaria':['perjalanan','aktivitas malam hari','kelambu','spesies Plasmodium','parasitemia'],
    'dbd':['trombosit','hematokrit','tempat penampungan air','jentik','NS1/IgM/IgG/PCR'],
    'chikungunya':['nyeri sendi','jentik','spesimen'],
    'ili':['demam','batuk','spesimen respiratori'],
    'antraks':['hewan ternak','produk hewan','eschar','spesimen'],
    'klaster-tidak-lazim':['jumlah kasus','paparan bersama','spesimen','hipotesis awal'],
    'rabies':['jenis hewan','hewan dapat diobservasi','cuci luka','VAR','SAR'],
    'hfmd':['lesi mulut','lesi tangan','lesi kaki','spesimen'],
    'covid19':['spesimen respiratori','jenis tes','hasil laboratorium'],
    'mpox':['ruam/lesi','spesimen','hasil laboratorium'],
    'nipah':['kontak','perjalanan','spesimen','hasil laboratorium'],
    'ebola':['kontak','perjalanan','spesimen','hasil laboratorium'],
    'mers':['spesimen respiratori','kontak','perjalanan'],
    'hantavirus':['tikus','spesimen','hasil laboratorium'],
    'legionellosis':['spesimen','hasil laboratorium'],
    'rift-valley':['hewan','spesimen','hasil laboratorium'],
    'demam-kuning':['perjalanan','vaksinasi','spesimen','hasil laboratorium'],
    'novel-respiratory':['spesimen','hasil laboratorium','kontak','perjalanan']
  };
  let V35_RESULTS=[];
  function qText(id){return (diseases[id]?.q||[]).join(' | ').toLowerCase()}
  function hasAny(text,terms){return terms.some(t=>text.includes(String(t).toLowerCase()))}
  function diseaseAudit(){
    const groups=[...new Set(Object.values(diseases).map(d=>d.group))].sort();
    const rows=Object.entries(diseases).map(([id,d])=>{
      const q=(d.q||[]).length, text=qText(id), req=V35_REQUIRED[id]||[];
      const missing=req.filter(x=>!text.includes(x.toLowerCase()));
      const template=typeof tpl==='function'?tpl(id):null;
      const reportOk=!!template;
      const cases=(db.cases||[]).filter(c=>{const i=(db.investigations||[]).find(x=>String(x.id)===String(c.investigationId));return i?.disease===id}).length;
      const inv=(db.investigations||[]).filter(x=>x.disease===id).length;
      const hasAnalysis=typeof analysis==='function';
      const hasGIS=typeof renderMap==='function';
      const hasContacts=typeof addContact==='function';
      const hasSpecimens=typeof addSpecimen==='function';
      const hasReport=typeof report==='function'&&reportOk;
      const warn=[];
      if(!q)warn.push('belum ada pertanyaan spesifik');
      if(missing.length)warn.push('cek: '+missing.join(', '));
      if(!reportOk)warn.push('template PE/KLB belum tersedia');
      if(!hasAnalysis)warn.push('modul analisis tidak tersedia');
      if(!hasGIS)warn.push('modul GIS tidak tersedia');
      return {id,name:d.name,group:d.group,questions:q,investigations:inv,cases,contacts:hasContacts,specimens:hasSpecimens,analysis:hasAnalysis,gis:hasGIS,report:hasReport,status:warn.length?'WARN':'PASS',missing,warnings:warn};
    });
    V35_RESULTS=rows;return rows;
  }
  window.runDiseaseAudit=function(){V35_RESULTS=diseaseAudit();renderDiseaseAudit();const w=V35_RESULTS.filter(x=>x.status==='WARN').length;const p=V35_RESULTS.length-w;const n=document.getElementById('auditNotice');if(n)n.innerHTML=`Audit selesai: <b>${p}</b> PASS dan <b>${w}</b> WARN. WARN menunjukkan area yang perlu validasi/pengkayaan instrumen, bukan kegagalan aplikasi.`;}
  window.renderDiseaseAudit=function(){
    if(!V35_RESULTS.length)diseaseAudit();
    const g=document.getElementById('auditGroup'),st=document.getElementById('auditStatus');
    if(g&&g.options.length===1)g.innerHTML='<option value="">Semua kelompok</option>'+[...new Set(V35_RESULTS.map(x=>x.group))].sort().map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    const rows=V35_RESULTS.filter(x=>(!g?.value||x.group===g.value)&&(!st?.value||x.status===st.value));
    const sum=document.getElementById('auditSummary');if(sum)sum.innerHTML=[['Total penyakit',V35_RESULTS.length],['PASS',V35_RESULTS.filter(x=>x.status==='PASS').length],['WARN',V35_RESULTS.filter(x=>x.status==='WARN').length],['Investigasi tercatat',V35_RESULTS.reduce((a,x)=>a+x.investigations,0)],['Kasus tercatat',V35_RESULTS.reduce((a,x)=>a+x.cases,0)]].map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');
    const el=document.getElementById('auditRows');if(!el)return;el.innerHTML=rows.map(x=>`<tr><td><b>${esc(x.name)}</b><div class="small">${esc(x.id)} · ${esc(x.group)}</div></td><td>${x.questions?`✓ ${x.questions}`:'—'}</td><td>${x.cases}</td><td>${x.contacts?'✓':'—'}</td><td>${x.specimens?'✓':'—'}</td><td>${x.analysis?'✓':'—'}</td><td>${x.gis?'✓':'—'}</td><td>${x.report?'✓':'—'}</td><td><span class="badge">${x.status}</span></td><td>${esc(x.warnings.join(' · ')||'Alur digital utama tersedia')}</td></tr>`).join('')||'<tr><td colspan="10">Tidak ada hasil sesuai filter.</td></tr>';
  }
  window.exportDiseaseAudit=function(){const rows=diseaseAudit();const payload={app:'GORUT-OUTBREAK AI',version:'v35',generatedAt:new Date().toISOString(),scope:'Disease-by-Disease Workflow Audit',results:rows};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='gorut-disease-workflow-audit-v35.json';a.click();}
  const oldPage=window.page;window.page=function(id,b){oldPage(id,b);if(id==='audit')setTimeout(()=>{runDiseaseAudit()},50)};
  setTimeout(()=>{try{runDiseaseAudit()}catch(e){}},500);
})();

/* v36 — Disease-Specific Intelligence & Automated PE/KLB support */
(function(){
  const V36_META={
    'suspek-campak':{name:'Campak',focus:'PD3I',rec:'Verifikasi definisi kasus, status imunisasi, hubungan epidemiologis, dan kebutuhan spesimen MR.'},
    'campak-rubella':{name:'Campak-Rubella',focus:'PD3I',rec:'Lakukan line listing, verifikasi imunisasi, klasifikasi dan spesimen sesuai program.'},
    'suspek-dengue':{name:'DBD/Dengue',focus:'arbovirus',rec:'Tinjau tanda bahaya, trombosit/hematokrit, tempat tinggal, dan pola waktu kasus.'},
    'malaria-konfirmasi':{name:'Malaria',focus:'vector-borne',rec:'Tinjau spesies, parasitemia, riwayat perjalanan/paparan dan fokus penularan.'},
    'tb':{name:'Tuberkulosis',focus:'respiratory',rec:'Perkuat investigasi kontak, status bakteriologis, resistensi dan kesinambungan pengobatan.'},
    'suspek-difteri':{name:'Difteri',focus:'PD3I',rec:'Verifikasi kasus dan kontak erat, status imunisasi, spesimen dan kebutuhan profilaksis.'},
    'suspek-pertusis':{name:'Pertusis',focus:'PD3I',rec:'Tinjau durasi batuk, kontak, imunisasi, spesimen dan pengendalian transmisi.'},
    'afp':{name:'AFP/Polio',focus:'PD3I',rec:'Pastikan investigasi AFP, spesimen adekuat, klasifikasi dan follow-up 60 hari.'},
    'ghpr-rabies':{name:'GHPR/Rabies',focus:'zoonosis',rec:'Verifikasi jenis hewan, paparan, observasi hewan dan status profilaksis pascapajanan.'},
    'leptospirosis':{name:'Leptospirosis',focus:'zoonosis',rec:'Tinjau paparan air/banjir, lingkungan, faktor pekerjaan dan kebutuhan pemeriksaan laboratorium.'},
    'suspek-flu-burung-manusia':{name:'Avian Influenza',focus:'zoonosis',rec:'Verifikasi pajanan unggas, kontak hewan, cluster dan spesimen respiratori.'},
    'keracunan-pangan':{name:'Keracunan Pangan',focus:'foodborne',rec:'Bangun line listing, hitung attack rate dengan denominator valid, telusuri pangan dan ambil spesimen.'}
  };
  function intelDate(c){return c?.onset||c?.createdAt||null}
  function within(c,days){if(days==='all')return true;const d=new Date(intelDate(c));if(Number.isNaN(d.getTime()))return true;return (Date.now()-d.getTime())<=Number(days)*86400000}
  function diseaseRows(days){
    const dbx=(typeof db!=='undefined'&&db)?db:{}; const invs=dbx.investigations||[]; const cases=(dbx.cases||[]).filter(c=>within(c,days));
    const map={};
    cases.forEach(c=>{const inv=invs.find(i=>String(i.id)===String(c.investigationId));const id=inv?.disease||c.disease||'tidak-teridentifikasi';(map[id]??=[]).push(c)});
    return Object.entries(map).map(([id,cs])=>{const diseaseObj=(typeof diseases!=='undefined'&&diseases)?diseases[id]:null; const meta=V36_META[id]||{name:(diseaseObj?.name||id),focus:'general',rec:'Verifikasi data kasus, tren waktu, lokasi, kontak dan spesimen.'};const confirmed=cs.filter(c=>/konfirmasi/i.test(c.status||'')).length;const probable=cs.filter(c=>/probable/i.test(c.status||'')).length;const deaths=cs.filter(c=>/meninggal/i.test(c.outcome||'')).length;const cfr=cs.length?deaths/cs.length*100:0;const recent=cs.filter(c=>within(c,7)).length;let score=0;score+=Math.min(3,cs.length);score+=confirmed?2:0;score+=deaths?2:0;score+=recent>=3?2:recent>=1?1:0;score+=probable>=2?1:0;score=Math.min(10,score);let priority=score>=7?'TINGGI':score>=4?'PERHATIAN':'RENDAH';if(meta.focus==='PD3I'&&confirmed)score=Math.min(10,score+1);if(score>=7)priority='TINGGI';else if(score>=4)priority='PERHATIAN';return {id,...meta,cases:cs.length,confirmed,probable,deaths,cfr,recent,score,priority};}).sort((a,b)=>b.score-a.score||b.cases-a.cases);
  }
  window.V36_INTEL=[];
  window.runDiseaseIntelligence=function(){const period=document.getElementById('intelPeriod')?.value||'all';window.V36_INTEL=diseaseRows(period);renderDiseaseIntelligence();const n=document.getElementById('intelNotice');if(n)n.innerHTML=`Analisis selesai pada <b>${new Date().toLocaleString('id-ID')}</b>. ${V36_INTEL.length} penyakit/sindrom memiliki data kasus pada periode terpilih.`}
  window.renderDiseaseIntelligence=function(){if(!V36_INTEL.length)runDiseaseIntelligence();const rows=V36_INTEL;const sum=document.getElementById('intelSummary');if(sum){const total=rows.reduce((a,x)=>a+x.cases,0),dead=rows.reduce((a,x)=>a+x.deaths,0),high=rows.filter(x=>x.priority==='TINGGI').length,att=rows.filter(x=>x.priority==='PERHATIAN').length;sum.innerHTML=[['Total kasus',total],['Meninggal',dead],['Sinyal tinggi',high],['Perlu perhatian',att],['Penyakit dengan data',rows.length]].map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}
    const el=document.getElementById('intelRows');if(!el)return;el.innerHTML=rows.map(x=>`<tr><td><b>${esc(x.name)}</b><div class="small">${esc(x.id)}</div></td><td>${x.cases}</td><td>${x.confirmed}</td><td>${x.deaths}</td><td>${x.cases?x.cfr.toFixed(1)+'%':'—'}</td><td>${x.recent?x.recent+' kasus/7 hari':'Tidak ada data 7 hari'}</td><td><span class="badge">${x.priority} · ${x.score}/10</span></td><td>${esc(x.rec)}</td></tr>`).join('')||'<tr><td colspan="8">Belum ada data kasus.</td></tr>';
  }
  const oldPage2=window.page;window.page=function(id,b){oldPage2(id,b);if(id==='intel')setTimeout(runDiseaseIntelligence,50)};
  setTimeout(()=>{try{runDiseaseIntelligence()}catch(e){}},700);
})();

/* v37 — Automated PE/KLB Report Generator: data-grounded draft support */
(function(){
  const REC={
    'suspek-campak':'Verifikasi definisi kasus, lakukan penemuan kasus tambahan dan pelacakan kontak, telaah status imunisasi, serta lengkapi spesimen sesuai pedoman program.',
    'campak-rubella':'Verifikasi klasifikasi kasus, penemuan kasus tambahan, status imunisasi dan pengambilan/pengiriman spesimen sesuai pedoman PD3I.',
    'suspek-dengue':'Perkuat pemantauan tanda bahaya dan kematian, telaah distribusi tempat tinggal serta faktor lingkungan/vektor, dan pastikan klasifikasi kasus didukung data klinis/laboratorium yang tersedia.',
    'malaria-konfirmasi':'Verifikasi asal infeksi/importasi, spesies dan hasil pemeriksaan parasitologis, telaah mobilitas serta lakukan investigasi fokus dan respons sesuai program malaria.',
    'tb':'Perkuat investigasi kontak, verifikasi status bakteriologis dan resistensi, serta pastikan kesinambungan pengobatan dan tindak lanjut kontak.',
    'suspek-difteri':'Verifikasi kasus dan kontak erat, status imunisasi, kebutuhan spesimen serta tindakan pencegahan/penanggulangan sesuai program.',
    'suspek-pertusis':'Verifikasi durasi batuk, hubungan epidemiologis, status imunisasi, spesimen dan kebutuhan pengendalian transmisi.',
    'afp':'Pastikan investigasi AFP lengkap, spesimen adekuat dan follow-up 60 hari sesuai ketentuan program.',
    'ghpr-rabies':'Verifikasi jenis dan status hewan, jenis pajanan, observasi hewan serta status profilaksis pascapajanan.',
    'leptospirosis':'Telaah paparan air/banjir, lingkungan dan pekerjaan, verifikasi diagnosis serta kebutuhan pemeriksaan laboratorium.',
    'suspek-flu-burung-manusia':'Verifikasi pajanan unggas/hewan, kemungkinan klaster, IPC dan kebutuhan spesimen respiratori.',
    'keracunan-pangan':'Lengkapi line listing, denominator terpapar, waktu konsumsi-onset, investigasi pangan/penjamah/sumber air dan spesimen klinis, pangan maupun lingkungan sesuai kebutuhan.'
  };
  function activeData(){
    const o=act()||{}, cs=currentCases(), contacts=(db.contacts||[]).filter(x=>String(x.investigationId)===String(db.active)), specs=(db.specimens||[]).filter(x=>String(x.investigationId)===String(db.active)), visits=(db.fieldVisits||[]).filter(x=>String(x.investigationId)===String(db.active));
    const conf=cs.filter(c=>c.status==='Konfirmasi').length,prob=cs.filter(c=>c.status==='Probable').length,susp=cs.filter(c=>c.status==='Suspek').length,dead=cs.filter(c=>c.outcome==='Meninggal').length;
    const onset=cs.filter(c=>c.onset).map(c=>c.onset).sort(); const peak=Object.entries(cs.reduce((m,c)=>{if(c.onset)m[c.onset]=(m[c.onset]||0)+1;return m},{})).sort((a,b)=>b[1]-a[1])[0];
    return {o,cs,contacts,specs,visits,conf,prob,susp,dead,onset,peak};
  }
  function diseaseName(id){return (typeof diseases!=='undefined'&&diseases[id]?.name)||id||'Penyakit/sindrom tidak ditentukan';}
  function autoDraft(){
    const d=activeData(); if(!d.o?.id && !db.active){alert('Pilih investigasi aktif terlebih dahulu.');return;}
    const loc=[d.o.desa,d.o.kec,d.o.kab,d.o.prov].filter(Boolean).join(', ')||'lokasi investigasi';
    const name=diseaseName(d.o.disease), rec=REC[d.o.disease]||'Validasi definisi kasus, pola orang-tempat-waktu, kontak, spesimen/laboratorium dan tindakan pengendalian berdasarkan temuan investigasi.';
    const background=`Penyelidikan epidemiologi dilakukan terhadap kejadian ${name} di ${loc}. Pada saat penyusunan laporan terdapat ${d.cs.length} kasus tercatat, terdiri dari ${d.conf} konfirmasi, ${d.prob} probable, ${d.susp} suspek dan ${d.dead} kematian. Data ini merupakan kondisi dataset aplikasi pada saat laporan dibuat dan masih memerlukan verifikasi lapangan bila diperlukan.`;
    const methods=`Pengumpulan data dilakukan melalui pencatatan investigasi kasus, line listing, wawancara/kuesioner, penelusuran kontak, pemeriksaan spesimen/laboratorium dan kunjungan lapangan sesuai kebutuhan. Analisis deskriptif menggunakan distribusi orang, tempat dan waktu. Analisis lanjutan hanya dilakukan bila desain, variabel dan kelengkapan data memadai.`;
    const etiology=`Dugaan etiologi/rantai penularan belum dinyatakan secara otomatis. Interpretasi harus didasarkan pada definisi kasus, hubungan epidemiologis, hasil laboratorium dan temuan lapangan.`;
    const discussion=`Dataset saat ini mencatat ${d.cs.length} kasus, ${d.contacts.length} kontak, ${d.specs.length} spesimen dan ${d.visits.length} kunjungan lapangan. ${d.peak?`Frekuensi onset tertinggi tercatat pada ${d.peak[0]} dengan ${d.peak[1]} kasus.`:'Belum tersedia cukup tanggal onset untuk menentukan puncak kasus.'} Temuan tersebut perlu dipadankan dengan distribusi tempat, karakteristik kasus, paparan, kontak dan hasil laboratorium sebelum menarik kesimpulan epidemiologis.`;
    const recommendations=`1. ${rec}\n2. Validasi dan lengkapi data kasus, terutama tanggal onset, klasifikasi, outcome dan variabel paparan yang relevan.\n3. Tindak lanjuti spesimen yang belum memiliki hasil dan dokumentasikan interpretasinya.\n4. Perbarui line listing, kontak dan kunjungan lapangan secara berkala.\n5. Evaluasi kembali status kejadian berdasarkan bukti epidemiologis, laboratorium, baseline dan ketentuan program yang berlaku.`;
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v};
    set('repBackground',background);set('repMethods',methods);set('repEtiology',etiology);set('repDiscussion',discussion);set('repRecommendations',recommendations);
    if(!val('repStart'))set('repStart',d.o.date||new Date().toISOString().slice(0,10)); if(!val('repDate'))set('repDate',new Date().toISOString().slice(0,10));
    if(!val('repDesign'))set('repDesign','Deskriptif dan analitik');
    if(!val('repCaseDef'))set('repCaseDef',`Gunakan definisi kasus operasional yang disepakati dalam investigasi ${name}, dengan klasifikasi suspek/probable/konfirmasi sesuai pedoman program yang berlaku.`);
    saveReportDraft();
    report();
    const n=document.getElementById('v37ReportNotice');if(n)n.innerHTML='<b>Draft otomatis berhasil dibuat.</b> Seluruh narasi perlu diperiksa dan disahkan investigator sebelum digunakan sebagai laporan resmi.';
  }
  window.generateAutomatedPEReport=autoDraft;
  function inject(){
    const card=document.querySelector('#laporan .card'); if(!card||document.getElementById('v37ReportTools'))return;
    const box=document.createElement('div');box.id='v37ReportTools';box.className='card';box.style.marginTop='12px';
    box.innerHTML=`<div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">⚡ v37 — Automated PE/KLB Report</h3><div class="small">Menyusun draft narasi dari data investigasi aktif. Sistem tidak menetapkan KLB atau etiologi secara otomatis.</div></div><button class="primary" onclick="generateAutomatedPEReport()">⚡ Buat Draft Otomatis</button></div><div id="v37ReportNotice" class="notice">Lengkapi data investigasi terlebih dahulu. Draft dapat diedit sebelum dicetak.</div>`;
    card.after(box);
  }
  const oldPage=window.page;window.page=function(id,b){oldPage(id,b);if(id==='laporan')setTimeout(inject,30)};
  setTimeout(inject,300);
  const oldReportText=window.reportText;
  window.reportText=function(){const base=oldReportText();const d=activeData();return base+`\n\nDATA OTOMATIS v37\nKasus: ${d.cs.length}; Konfirmasi: ${d.conf}; Probable: ${d.prob}; Suspek: ${d.susp}; Meninggal: ${d.dead}; Kontak: ${d.contacts.length}; Spesimen: ${d.specs.length}; Kunjungan: ${d.visits.length}.\nCatatan: angka berasal dari dataset investigasi aktif saat laporan dibuat dan harus diverifikasi.`};
})();


/* v38 — Person-Place-Time Epidemiology Intelligence */
(function(){
  function active(){return typeof act==='function'?act():null}
  function cases(){const a=active();return (typeof db!=='undefined'&&db?.cases||[]).filter(c=>String(c.investigationId)===String(a?.id||db?.active))}
  function dateKey(v){if(!v)return null;const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v).slice(0,10);return d.toISOString().slice(0,10)}
  function ageBand(a){const n=Number(a);if(!Number.isFinite(n))return 'Tidak diketahui';if(n<1)return '<1 tahun';if(n<5)return '1–4 tahun';if(n<15)return '5–14 tahun';if(n<25)return '15–24 tahun';if(n<45)return '25–44 tahun';if(n<65)return '45–64 tahun';return '≥65 tahun'}
  function aggregate(){const cs=cases(), o=active()||{};const time={};const sex={},age={},place={};cs.forEach(c=>{const d=dateKey(c.onset);if(d)time[d]=(time[d]||0)+1;const sx=c.sex||'Tidak diketahui';sex[sx]=(sex[sx]||0)+1;const ab=ageBand(c.age);age[ab]=(age[ab]||0)+1;const pl=[o.desa,o.kec,o.kab].filter(Boolean).join(' / ')||'Lokasi investigasi';place[pl]=(place[pl]||0)+1});return {cs,o,time,sex,age,place}}
  function bars(obj){const entries=Object.entries(obj).sort((a,b)=>b[1]-a[1]);const max=Math.max(1,...entries.map(x=>x[1]));return entries.map(([k,v])=>`<div class="barrow"><span>${esc(k)}</span><div class="bar" style="width:${Math.max(4,v/max*100)}%"></div><b>${v}</b></div>`).join('')||'<div class="notice">Belum ada data.</div>'}
  function epi(a){const entries=Object.entries(a.time).sort((x,y)=>x[0].localeCompare(y[0]));if(!entries.length)return '<div class="notice">Tanggal onset belum tersedia sehingga kurva epidemi belum dapat dibuat.</div>';const max=Math.max(1,...entries.map(x=>x[1]));return `<div class="epi-chart">${entries.map(([d,v])=>`<div class="epi-col"><span class="epi-count">${v}</span><div class="epi-bar" style="height:${Math.max(4,v/max*190)}px" title="${d}: ${v} kasus"></div><span class="epi-date">${d}</span></div>`).join('')}</div>`}
  function render(){const a=aggregate();const el=document.getElementById('v38Epi');if(!el)return;const total=a.cs.length,dead=a.cs.filter(c=>/meninggal/i.test(c.outcome||'')).length;el.innerHTML=`<div class="summary-grid"><div><b>Total kasus</b><strong>${total}</strong></div><div><b>Meninggal</b><strong>${dead}</strong></div><div><b>Tanggal onset tersedia</b><strong>${Object.keys(a.time).length}</strong></div></div><div class="grid2"><div class="chart-box"><h4>⏱️ Kurva Epidemi</h4>${epi(a)}</div><div class="chart-box"><h4>👤 Menurut Umur</h4>${bars(a.age)}</div><div class="chart-box"><h4>⚥ Menurut Jenis Kelamin</h4>${bars(a.sex)}</div><div class="chart-box"><h4>📍 Menurut Tempat</h4>${bars(a.place)}</div></div><div class="chart-box"><h4>📋 Ringkasan Orang–Tempat–Waktu</h4><p><b>Orang:</b> Distribusi umur dan jenis kelamin ditampilkan berdasarkan data kasus yang tersedia.</p><p><b>Tempat:</b> Lokasi menggunakan desa/kecamatan/kabupaten dari investigasi aktif. Koordinat per kasus hanya dapat dianalisis bila tersedia.</p><p><b>Waktu:</b> Kurva menggunakan tanggal onset; kasus tanpa onset tidak dimasukkan ke kurva.</p><div class="notice">Interpretasi otomatis bersifat deskriptif. Puncak kurva, klaster, sumber paparan, dan pola penularan tetap harus diverifikasi oleh investigator.</div></div>`;window.V38_EPI=a}
  window.runEpiIntelligence=render;
  function inject(){const page=document.getElementById('laporan');if(!page||document.getElementById('v38EpiCard'))return;const card=document.createElement('div');card.id='v38EpiCard';card.className='card';card.style.marginTop='12px';card.innerHTML=`<div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">📊 v38 — Person–Place–Time Intelligence</h3><div class="small">Kurva epidemi dan distribusi kasus berdasarkan data investigasi aktif.</div></div><button class="primary" onclick="runEpiIntelligence()">🔄 Analisis Orang–Tempat–Waktu</button></div><div id="v38Epi"><div class="notice">Klik analisis untuk membangun ringkasan.</div></div>`;page.appendChild(card)}
  const oldPage=window.page;window.page=function(id,b){oldPage(id,b);if(id==='laporan')setTimeout(()=>{inject();render()},40)};
  const oldReportText=window.reportText;window.reportText=function(){const base=oldReportText();const a=window.V38_EPI||aggregate();const peak=Object.entries(a.time).sort((x,y)=>y[1]-x[1])[0];return base+`\n\nANALISIS ORANG-TEMPAT-WAKTU v38\nTotal kasus: ${a.cs.length}\nTanggal onset teragregasi: ${Object.keys(a.time).length}\nPuncak tanggal onset: ${peak?peak[0]+' ('+peak[1]+' kasus)':'belum dapat ditentukan'}\nCatatan: analisis deskriptif menggunakan data investigasi aktif dan perlu diverifikasi.`};
  setTimeout(()=>{try{render()}catch(e){}},900);
})();


/* v40 — Alamat Kasus + Batas Administrasi BIG/RBI */
(function(){
  const RBI_URL='https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer';
  const LAYERS={prov:12,kab:13,kec:10,desa:11};
  function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
  function pick(props, patterns){
    const keys=Object.keys(props||{});
    for(const pat of patterns){const k=keys.find(x=>pat.test(x));if(k&&props[k]!==null&&props[k]!==undefined&&String(props[k]).trim()!=='')return String(props[k])}
    return '';
  }
  async function queryLayer(layer,lat,lng){
    const params=new URLSearchParams({geometry:`${lng},${lat}`,geometryType:'esriGeometryPoint',inSR:'4326',spatialRel:'esriSpatialRelIntersects',outFields:'*',returnGeometry:'false',f:'json'});
    const r=await fetch(`${RBI_URL}/${layer}/query?${params.toString()}`,{mode:'cors'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json();return j.features?.[0]?.attributes||null;
  }
  async function lookupAdmin(lat,lng){
    lat=n(lat);lng=n(lng);if(lat===null||lng===null)return null;
    const [prov,kab,kec,desa]=await Promise.all([queryLayer(LAYERS.prov,lat,lng),queryLayer(LAYERS.kab,lat,lng),queryLayer(LAYERS.kec,lat,lng),queryLayer(LAYERS.desa,lat,lng)]);
    const provName=pick(prov,[/wadmpr/i,/provinsi/i,/namobj/i,/nama/i]);
    const kabName=pick(kab,[/wadmkk/i,/kabupaten/i,/kota/i,/namobj/i,/nama/i]);
    const kecName=pick(kec,[/wadmkc/i,/kecamatan/i,/namobj/i,/nama/i]);
    const desaName=pick(desa,[/wadmkd/i,/desa/i,/kelurahan/i,/namobj/i,/nama/i]);
    return {prov:provName,kab:kabName,kec:kecName,desa:desaName,lat,lng,source:'BIG-RBI',retrievedAt:new Date().toISOString()};
  }
  window.lookupRBIAdmin=lookupAdmin;
  window.syncCaseRBI=async function(id){const c=db.cases.find(x=>String(x.id)===String(id));if(!c||n(c.lat)===null||n(c.lng)===null)return null;try{const a=await lookupAdmin(c.lat,c.lng);if(a){c.admin=a; c.prov=a.prov||c.prov||'';c.kab=a.kab||c.kab||'';c.kec=a.kec||c.kec||'';c.desa=a.desa||c.desa||'';save();cases();}return a}catch(e){console.warn('RBI lookup gagal',e);return null}};
  function addressFields(c={}){const a=c.admin||{};return `<div class="card" style="margin-top:10px;border-left:4px solid #1769aa"><h4>📍 Alamat & Wilayah Administratif</h4>${f('Alamat lengkap tempat tinggal/kejadian','caddress','text',c.address||'')}${f('Provinsi','cprov','text',c.prov||a.prov||'')}${f('Kabupaten/Kota','ckab','text',c.kab||a.kab||'')}${f('Kecamatan','ckec','text',c.kec||a.kec||'')}${f('Desa/Kelurahan','cdesa','text',c.desa||a.desa||'')}${f('Latitude','clat','number',c.lat??'')}${f('Longitude','clng','number',c.lng??'')}<button type="button" onclick="resolveModalRBI()">🗺️ Identifikasi wilayah dari koordinat (RBI)</button><div id="rbiModalResult" class="small" style="margin-top:6px"></div></div>`}
  window.resolveModalRBI=async function(){const lat=val('clat'),lng=val('clng');const el=document.getElementById('rbiModalResult');if(el)el.textContent='Menghubungkan ke RBI BIG...';try{const a=await lookupAdmin(lat,lng);if(!a)throw new Error('Tidak ditemukan');['cprov','ckab','ckec','cdesa'].forEach((id,i)=>{const e=document.getElementById(id);if(e)e.value=[a.prov,a.kab,a.kec,a.desa][i]||''});if(el)el.innerHTML=`<b>RBI:</b> ${[a.desa,a.kec,a.kab,a.prov].filter(Boolean).join(' · ')||'wilayah tidak teridentifikasi'}`;}catch(e){if(el)el.textContent='Identifikasi RBI gagal. Periksa koneksi dan koordinat.';}};
  function priorityExtra(disease,data){return typeof priorityPanel==='function'?priorityPanel(disease,data||{}):''}
  window.addCase=function(){if(!act())return alert('Pilih investigasi terlebih dahulu.');const food=act().disease==='keracunan-pangan',diseaseId=act().disease,extraPriority=priorityExtra(diseaseId,{});const foodExtra=food?`<div class="card" style="margin-top:10px"><h4>🍱 Detail Kasus Keracunan Pangan</h4>${f('Makanan/minuman dikonsumsi','caseFood','text','')}${f('Waktu konsumsi','caseConsumedAt','datetime-local','')}${f('Waktu onset','caseOnsetTime','datetime-local','')}${f('Masa inkubasi (jam)','caseIncubation','number','')}${f('Gejala utama','caseSymptoms','text','')}${f('Sumber pangan','caseFoodSource','text','')}${f('Dirawat inap?','caseHospitalized','select','Tidak|Ya')}${f('Spesimen klinis','caseClinicalSpecimen','text','')}</div>`:'';modal(`<h2>Tambah Kasus</h2>${f('ID','cid','text','K'+String(db.cases.length+1).padStart(3,'0'))}${f('Nama','cn','text','')}${f('Umur','ca','number','')}${f('Jenis kelamin','cs','select','Laki-laki|Perempuan')}${f('Onset','co',food?'datetime-local':'date','')}${f('Status','ct','select','Suspek|Probable|Konfirmasi')}${f('Outcome','cu','select','Rawat jalan|Dirawat|Sembuh|Meninggal')}${f('Gejala Utama','caseMainSymptoms','text','')}${addressFields()}${foodExtra}${extraPriority}<button class="primary" onclick="saveCase()">Simpan</button>`)};
  window.saveCase=async function(){const food=act()?.disease==='keracunan-pangan';const c={id:val('cid'),name:val('cn'),age:+val('ca')||0,sex:val('cs'),onset:val('co'),status:val('ct'),outcome:val('cu'),symptoms:val('caseMainSymptoms'),address:val('caddress'),prov:val('cprov'),kab:val('ckab'),kec:val('ckec'),desa:val('cdesa'),lat:n(val('clat')),lng:n(val('clng')),investigationId:db.active,createdAt:new Date().toISOString()};if(food)c.foodCase={food:val('caseFood'),consumedAt:val('caseConsumedAt'),onsetAt:val('caseOnsetTime'),incubationHours:+val('caseIncubation')||null,symptoms:(val('caseMainSymptoms')||val('caseSymptoms')),foodSource:val('caseFoodSource'),hospitalized:val('caseHospitalized'),clinicalSpecimen:val('caseClinicalSpecimen')};const priority=collectPriority(act()?.disease);if(priority)c.priority=priority;db.cases.push(c);if(c.lat!==null&&c.lng!==null){try{c.admin=await lookupAdmin(c.lat,c.lng);c.prov=c.admin.prov||c.prov;c.kab=c.admin.kab||c.kab;c.kec=c.admin.kec||c.kec;c.desa=c.admin.desa||c.desa}catch(e){console.warn('RBI lookup gagal saat simpan',e)}}queueSync('cases');save();close();render();};
  window.editCase=function(id){let c=db.cases.find(x=>String(x.id)===String(id));if(!c)return;const food=act()?.disease==='keracunan-pangan',diseaseId=act()?.disease,fc=c.foodCase||{},extraPriority=priorityExtra(diseaseId,c.priority||{}),foodExtra=food?`<div class="card" style="margin-top:10px"><h4>🍱 Detail Kasus Keracunan Pangan</h4>${f('Makanan/minuman dikonsumsi','caseFood','text',fc.food||'')}${f('Waktu konsumsi','caseConsumedAt','datetime-local',fc.consumedAt||'')}${f('Waktu onset','caseOnsetTime','datetime-local',fc.onsetAt||'')}${f('Masa inkubasi (jam)','caseIncubation','number',fc.incubationHours??'')}${f('Gejala utama','caseSymptoms','text',fc.symptoms||'')}${f('Sumber pangan','caseFoodSource','text',fc.foodSource||'')}${f('Dirawat inap?','caseHospitalized','select','Tidak|Ya')}${f('Spesimen klinis','caseClinicalSpecimen','text',fc.clinicalSpecimen||'')}</div>`:'';modal(`<h2>Edit ${esc(c.id)}</h2>${f('Nama','en','text',c.name)}${f('Umur','ea','number',c.age)}${f('Jenis kelamin','es','select','Laki-laki|Perempuan')}${f('Onset','eo',food?'datetime-local':'date',c.onset)}${f('Status','et','select','Suspek|Probable|Konfirmasi')}${f('Outcome','eu','select','Rawat jalan|Dirawat|Sembuh|Meninggal')}${f('Gejala Utama','editMainSymptoms','text',c.symptoms||c.answers?.symptoms||'')}${addressFields(c)}${foodExtra}${extraPriority}<button class="primary" onclick="upd('${esc(c.id)}')">Simpan</button>`);es.value=c.sex||'';et.value=c.status||'Suspek';eu.value=c.outcome||'';if(food)caseHospitalized.value=fc.hospitalized||'Tidak';};
  window.upd=async function(id){let c=db.cases.find(x=>String(x.id)===String(id));if(!c)return;Object.assign(c,{name:val('en'),age:+val('ea')||0,sex:val('es')||c.sex,onset:val('eo'),status:val('et'),outcome:val('eu'),symptoms:val('editMainSymptoms'),address:val('caddress'),prov:val('cprov'),kab:val('ckab'),kec:val('ckec'),desa:val('cdesa'),lat:n(val('clat')),lng:n(val('clng'))});if(act()?.disease==='keracunan-pangan')c.foodCase={food:val('caseFood'),consumedAt:val('caseConsumedAt'),onsetAt:val('caseOnsetTime'),incubationHours:+val('caseIncubation')||null,symptoms:(val('editMainSymptoms')||val('caseSymptoms')),foodSource:val('caseFoodSource'),hospitalized:val('caseHospitalized'),clinicalSpecimen:val('caseClinicalSpecimen')};const priority=collectPriority(act()?.disease);if(priority)c.priority=priority;if(c.lat!==null&&c.lng!==null){try{c.admin=await lookupAdmin(c.lat,c.lng);c.prov=c.admin.prov||c.prov;c.kab=c.admin.kab||c.kab;c.kec=c.admin.kec||c.kec;c.desa=c.admin.desa||c.desa}catch(e){console.warn('RBI lookup gagal saat update',e)}}save();close();render();};
  window.cases=function(){let q=(val('caseSearch')||'').toLowerCase(),r=db.cases.filter(c=>(!db.active||c.investigationId===db.active)&&(!q||`${c.id} ${c.name} ${c.address||''} ${c.desa||''} ${c.kec||''}`.toLowerCase().includes(q)));caseRows.innerHTML=r.map(c=>`<tr><td>${esc(c.id)}</td><td>${esc(c.name)}</td><td>${esc(c.address||'-')}</td><td>${esc(c.desa||c.admin?.desa||'-')}</td><td>${esc(c.kec||c.admin?.kec||'-')}</td><td>${esc(c.age)}</td><td>${esc(c.sex)}</td><td>${esc(c.onset||'-')}</td><td><span class="badge">${esc(c.status)}</span></td><td>${esc(c.outcome||'-')}</td><td><button onclick="editCase('${esc(c.id)}')">Edit</button> <button class="danger" data-v30-delete onclick="deleteRecord('cases','${esc(c.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="11">Belum ada kasus.</td></tr>'};
  window.toggleRBI=function(){if(!mapObj)return alert('Muat peta terlebih dahulu.');if(window.__rbiLayer){window.__rbiLayer.remove();window.__rbiLayer=null;const s=document.getElementById('rbiStatus');if(s)s.textContent='RBI: layer batas disembunyikan.';return}if(!window.L?.esri)return alert('Modul RBI belum termuat. Periksa koneksi internet.');window.__rbiLayer=L.esri.dynamicMapLayer({url:RBI_URL,layers:[12,13,10,11],opacity:.55,useCors:true}).addTo(mapObj);const s=document.getElementById('rbiStatus');if(s)s.innerHTML='<b>RBI aktif:</b> batas provinsi, kabupaten/kota, kecamatan, dan desa/kelurahan dari layanan BIG.'};
  const oldRenderMap=window.renderMap;window.renderMap=function(){oldRenderMap();setTimeout(()=>{if(window.mapObj&&window.L?.esri&&!window.__rbiLayer){window.__rbiLayer=L.esri.dynamicMapLayer({url:RBI_URL,layers:[12,13,10,11],opacity:.5,useCors:true}).addTo(mapObj);const s=document.getElementById('rbiStatus');if(s)s.innerHTML='<b>RBI aktif:</b> batas administrasi ditampilkan dari layanan BIG.'}},350)};
  window.exportCSV=function(){const cs=db.cases.filter(c=>c.investigationId===db.active);const cols=['ID','Nama','Alamat','Provinsi','Kabupaten/Kota','Kecamatan','Desa/Kelurahan','Latitude','Longitude','Onset','Status','Outcome','Sumber Wilayah'];const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;const lines=[cols.join(','),...cs.map(c=>[c.id,c.name,c.address,c.prov,c.kab,c.kec,c.desa,c.lat,c.lng,c.onset,c.status,c.outcome,c.admin?.source||''].map(q).join(','))];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}));a.download='kasus-KLB-dengan-alamat-RBI.csv';a.click()};
  window.V40_RBI={service:RBI_URL,layers:LAYERS,source:'Badan Informasi Geospasial — RBI/Batas Wilayah'};
})();

/* v39 — GIS Epidemiological Intelligence */
(function(){
  const R=6371;
  function active(){return typeof act==='function'?act():null}
  function cases(){const a=active();return (typeof db!=='undefined'&&db?.cases||[]).filter(c=>String(c.investigationId)===String(a?.id||db?.active))}
  function num(v){const n=Number(v);return Number.isFinite(n)?n:null}
  function hav(a,b){const la=num(a.lat),lo=num(a.lng),lb=num(b.lat),lob=num(b.lng);if([la,lo,lb,lob].some(x=>x===null))return null;const p=Math.PI/180,dlat=(lb-la)*p,dlon=(lob-lo)*p;const x=Math.sin(dlat/2)**2+Math.cos(la*p)*Math.cos(lb*p)*Math.sin(dlon/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
  function geoCases(){return cases().filter(c=>num(c.lat)!==null&&num(c.lng)!==null)}
  function cluster(){const cs=geoCases(), used=new Set(), out=[];const radius=1.0;cs.forEach((seed,i)=>{if(used.has(i))return;const members=[i];used.add(i);let changed=true;while(changed){changed=false;for(let j=0;j<cs.length;j++){if(used.has(j))continue;if(members.some(k=>{const d=hav(cs[k],cs[j]);return d!==null&&d<=radius})){members.push(j);used.add(j);changed=true}}}if(members.length>=2){const pts=members.map(k=>cs[k]);out.push({count:pts.length,lat:pts.reduce((s,c)=>s+num(c.lat),0)/pts.length,lng:pts.reduce((s,c)=>s+num(c.lng),0)/pts.length,cases:pts})}});return out.sort((a,b)=>b.count-a.count)}
  function areaRates(){const cs=cases(), o=active()||{};const pop=(o.populationByArea&&typeof o.populationByArea==='object')?o.populationByArea:{};const areas={};cs.forEach(c=>{const area=c.desa||c.kec||o.desa||o.kec||o.kab||'Tidak diketahui';areas[area]=(areas[area]||0)+1});return Object.entries(areas).map(([area,n])=>{const denominator=num(pop[area]);return {area,cases:n,population:denominator,rate:denominator&&denominator>0?n/denominator*100000:null}}).sort((a,b)=>b.cases-a.cases)}
  function render(){const el=document.getElementById('v39GISSummary');if(!el)return;const cs=cases(),gc=geoCases(),clusters=cluster(),rates=areaRates();el.innerHTML=`<div class="stat"><small>Total kasus</small><b>${cs.length}</b></div><div class="stat"><small>Dengan koordinat</small><b>${gc.length}</b></div><div class="stat"><small>Cakupan koordinat</small><b>${cs.length?Math.round(gc.length/cs.length*100):0}%</b></div><div class="stat"><small>Sinyal konsentrasi (≥2 kasus)</small><b>${clusters.length}</b></div>`;
    const cl=document.getElementById('v39Clusters');cl.innerHTML=clusters.length?`<table><thead><tr><th>Cluster</th><th>Kasus</th><th>Centroid</th></tr></thead><tbody>${clusters.map((x,i)=>`<tr><td>Cluster ${i+1}</td><td>${x.count}</td><td>${x.lat.toFixed(5)}, ${x.lng.toFixed(5)}</td></tr>`).join('')}</tbody></table>`:'<div class="notice">Belum ada konsentrasi ≥2 kasus berdasarkan radius eksploratif 1 km.</div>';
    const ar=document.getElementById('v39AreaRates');ar.innerHTML=rates.length?`<table><thead><tr><th>Wilayah</th><th>Kasus</th><th>Populasi</th><th>AR/100.000</th></tr></thead><tbody>${rates.map(x=>`<tr><td>${esc(x.area)}</td><td>${x.cases}</td><td>${x.population===null?'—':x.population.toLocaleString('id-ID')}</td><td>${x.rate===null?'—':x.rate.toFixed(2)}</td></tr>`).join('')}</tbody></table><div class="small">Denominator dibaca dari <code>investigasi.populationByArea</code>. Jika belum diisi, Attack Rate ditampilkan sebagai —.</div>`:'<div class="notice">Belum ada data wilayah.</div>';
    window.V39_GIS={cases:cs,geo:gc,clusters,rates};
    if(typeof renderMap==='function'&&document.getElementById('map')){try{renderMap()}catch(e){}}
  }
  window.runGISIntelligence=render;
  const oldPage=window.page;window.page=function(id,b){oldPage(id,b);if(id==='gis')setTimeout(render,60)};
  const oldReportText=window.reportText; if(oldReportText) window.reportText=function(){const base=oldReportText();const g=window.V39_GIS||{cases:[],geo:[],clusters:[],rates:[]};const ar=g.rates.filter(x=>x.rate!==null).sort((a,b)=>b.rate-a.rate)[0];return base+`\n\nGIS EPIDEMIOLOGICAL INTELLIGENCE v39\nKasus: ${g.cases.length}; memiliki koordinat: ${g.geo.length}; cakupan koordinat: ${g.cases.length?Math.round(g.geo.length/g.cases.length*100):0}%.\nSinyal konsentrasi spasial eksploratif (≥2 kasus dalam radius 1 km): ${g.clusters.length}.\nWilayah dengan Attack Rate tertinggi yang dapat dihitung: ${ar?ar.area+' ('+ar.rate.toFixed(2)+'/100.000)':'belum tersedia karena denominator populasi belum dimasukkan'}.\nCatatan: hasil spasial bersifat eksploratif dan bukan uji cluster statistik.`};
  setTimeout(()=>{try{render()}catch(e){}},1200);
})();

/* ===================== v41 RESEARCH STUDIO UPGRADE =====================
   Disease-aware research protocol + publication-grade reporting scaffold.
   This layer is decision support; investigators must validate definitions,
   sampling, assumptions, and final estimates against the study protocol.
*/
(function(){
  const RKEY='gorut-research-plan';
  const oldSave=window.saveResearchPlan;
  const oldRun=window.runResearchAnalysis;
  const oldPreview=window.researchReportPreview;
  function el(id){return document.getElementById(id)}
  function v(id){return el(id)?.value||''}
  function setv(id,x){if(el(id))el(id).value=x??''}
  function diseaseOptions(){
    const s=el('researchDisease'); if(!s||typeof diseases==='undefined')return;
    const current=s.value;
    s.innerHTML='<option value="">Semua / pilih penyakit</option>'+Object.entries(diseases).map(([id,d])=>`<option value="${esc(id)}">${esc(d.name||id)}</option>`).join('');
    if(current)setv('researchDisease',current);
  }
  window.applyResearchDisease=function(id){
    researchState.researchDisease=id||'';
    localStorage.setItem(RKEY,JSON.stringify(researchState));
    const n=researchDatasetRows().length||currentCases().filter(c=>!id||c.disease===id).length;
    const box=el('researchDataStatus');
    if(box&&id){box.innerHTML=`<b>Filter penyakit penelitian:</b> ${esc(diseases?.[id]?.name||id)} · perkiraan data tersedia ${n} baris/kasus.`}
    if(typeof generateAnalysisPipeline==='function')generateAnalysisPipeline();
  };
  function collectProtocol(){
    return {
      researchDisease:v('researchDisease'), title:v('studyTitle'), question:v('researchQuestion'), design:v('studyDesign'),
      population:v('studyPopulation'), period:v('studyPeriod'), setting:v('studySetting'), dataSource:v('researchDataSource'), sampling:v('researchSampling'),
      outcome:v('researchOutcome'), exposure:v('researchExposure'), generalObjective:v('researchGeneralObjective'), specificObjectives:v('researchSpecificObjectives'),
      hypothesis:v('researchHypothesis'), targetPopulation:v('researchTargetPopulation'), accessiblePopulation:v('researchAccessiblePopulation'),
      inclusion:v('researchInclusion'), exclusion:v('researchExclusion'), sampleTarget:v('researchSampleTarget'), sampleRatio:v('researchSampleRatio'),
      outcomeDefinition:v('researchOutcomeDefinition'), exposureDefinition:v('researchExposureDefinition'), covariates:v('researchCovariates'),
      analysisPlan:v('researchAnalysisPlan'), ethics:v('researchEthics'), funding:v('researchFunding'), reportingGuideline:v('researchReportingGuideline'),
      methodNotes:v('researchMethodNotes')
    };
  }
  function save(){
    const p=collectProtocol();
    researchState={...researchState,...p,analysis:researchState.analysis||null};
    localStorage.setItem(RKEY,JSON.stringify(researchState));
    if(typeof applyStudyDesign==='function')applyStudyDesign();
    alert('Rancangan penelitian dan protokol berhasil disimpan di perangkat.');
  }
  window.saveResearchPlan=save;
  function filteredRows(){
    const disease=v('researchDisease')||researchState.researchDisease||'';
    let rows=[];
    const source=v('researchDataSource')||researchState.dataSource||'cases';
    if(source==='dataset'||source==='both') rows=researchDatasetRows();
    if((source==='cases'||source==='both')&&!rows.length) rows=currentCases();
    if(source==='cases')rows=currentCases();
    if(disease){rows=rows.filter(r=>String(r.disease||r.diseaseId||r.answers?.disease||'')===disease)}
    return rows;
  }
  window.researchCases=function(){return filteredRows()};
  window.validateResearchProtocol=function(){
    const p=collectProtocol(),issues=[];
    ['researchDisease','studyTitle','studyDesign','studyPopulation','studyPeriod','studySetting'].forEach(id=>{if(!v(id))issues.push(`${id} belum diisi.`)});
    if(['case-control','matched-case-control','cohort','outbreak-retro-cohort','cross-sectional'].includes(p.design)&&!p.outcomeDefinition)issues.push('Definisi operasional outcome belum diisi.');
    if(['case-control','matched-case-control','cohort','outbreak-retro-cohort','cross-sectional'].includes(p.design)&&!p.exposureDefinition)issues.push('Definisi operasional exposure belum diisi.');
    const box=el('researchResults'); if(box)box.innerHTML=issues.length?`<div class="notice"><b>Checklist protokol:</b><ul>${issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:'<div class="notice">✅ Komponen protokol utama terisi. Tetap lakukan review metodologis sebelum analisis final.</div>';
    return !issues.length;
  };
  function run(){
    const p=collectProtocol(); researchState={...researchState,...p}; localStorage.setItem(RKEY,JSON.stringify(researchState));
    const disease=p.researchDisease;
    if(disease&&typeof diseases!=='undefined'&&!diseases[disease]){alert('Penyakit tidak ditemukan pada disease library.');return}
    oldRun();
    const box=el('researchResults');
    if(box){const rows=filteredRows();const dname=disease?(diseases?.[disease]?.name||disease):'Semua penyakit';box.innerHTML=`<div class="notice"><b>Dataset penelitian:</b> ${esc(dname)} · n=${rows.length}. ${box.innerHTML||''}</div>`}
  }
  window.runResearchAnalysis=run;
  function checklist(){
    const p=researchState, d=p.design||'descriptive';
    const items=[
      ['Title',!!p.title,'Judul menyebutkan topik/desain bila relevan'],['Background/Objectives',!!(p.question||p.generalObjective),'Pertanyaan/tujuan jelas'],['Setting',!!p.setting,'Setting/lokasi dan periode'],['Participants',!!(p.population||p.targetPopulation),'Populasi dan sumber peserta/data'],['Eligibility',!!(p.inclusion||p.exclusion),'Kriteria inklusi/eksklusi'],['Variables',!!(p.outcomeDefinition&&p.exposureDefinition),'Definisi outcome dan exposure'],['Bias/Confounding',!!(p.covariates||p.methodNotes),'Bias dan confounding dipertimbangkan'],['Sample size',!!p.sampleTarget,'Ukuran sampel/rasio dijelaskan'],['Statistical methods',!!(p.analysisPlan||researchPlans[d]),'Metode statistik sesuai desain'],['Missing data',true,'Missing data dinilai/dilaporkan'],['Effect estimates',true,'Estimasi + 95% CI bila relevan'],['Limitations',true,'Keterbatasan dan generalisabilitas'],['Ethics',!!p.ethics,'Etik/status persetujuan dicatat'],['Funding',!!p.funding,'Sumber pendanaan dicatat']
    ];
    return `<table class="report-table"><tr><th>Komponen</th><th>Status</th><th>Catatan</th></tr>${items.map(x=>`<tr><td>${esc(x[0])}</td><td>${x[1]?'PASS':'PERLU DILENGKAPI'}</td><td>${esc(x[2])}</td></tr>`).join('')}</table>`;
  }
  function preview(){
    if(!researchState.analysis)run();
    const p=researchState,d=researchPlans[p.design]||researchPlans.descriptive,rows=filteredRows(),r=el('researchReport');if(!r)return;
    const disease=p.researchDisease?(diseases?.[p.researchDisease]?.name||p.researchDisease):'Semua penyakit';
    const objs=(p.specificObjectives||'').split(/\n+/).filter(Boolean).map((x,i)=>`<li>${esc(x)}</li>`).join('');
    r.innerHTML=`<div class="report-doc"><h1>${esc(p.title||'Laporan Penelitian Epidemiologi')}</h1>
      <p><b>Penyakit/outcome:</b> ${esc(disease)}<br><b>Desain:</b> ${esc(d.label)}<br><b>Setting:</b> ${esc(p.setting||'-')}<br><b>Periode:</b> ${esc(p.period||'-')}<br><b>Sumber data:</b> ${esc(p.dataSource||'-')}<br><b>n tersedia:</b> ${rows.length}</p>
      <h2>Abstrak</h2><p><b>Latar belakang:</b> ${esc(p.question||'Lengkapi latar belakang dan gap pengetahuan.')}</p><p><b>Metode:</b> ${esc(d.label)}; populasi ${esc(p.population||'-')}; sampling ${esc(p.sampling||'-')}; n=${rows.length}.</p><p><b>Hasil:</b> ${researchState.analysis?.html||'Belum tersedia.'}</p><p><b>Kesimpulan:</b> Kesimpulan harus mengikuti estimasi, ketidakpastian, desain, dan keterbatasan.</p>
      <h2>1. Pendahuluan</h2><p>${esc(p.question||'Lengkapi latar belakang, besaran masalah, gap pengetahuan, dan rasional penelitian.')}</p><p><b>Tujuan umum:</b> ${esc(p.generalObjective||'-')}</p><p><b>Tujuan khusus:</b></p><ol>${objs||'<li>-</li>'}</ol><p><b>Hipotesis:</b> ${esc(p.hypothesis||'-')}</p>
      <h2>2. Metode Penelitian</h2><h3>2.1 Desain dan Setting</h3><p>${esc(d.label)}; ${esc(p.setting||'-')}; periode ${esc(p.period||'-')}.</p><h3>2.2 Populasi dan Sampel</h3><p>Populasi target: ${esc(p.targetPopulation||p.population||'-')}.</p><p>Populasi terjangkau: ${esc(p.accessiblePopulation||'-')}.</p><p>Sampling: ${esc(p.sampling||'-')}; target n=${esc(p.sampleTarget||'-')}; rasio ${esc(p.sampleRatio||'-')}.</p><h3>2.3 Kriteria</h3><p><b>Inklusi:</b><br>${esc(p.inclusion||'-').replace(/\n/g,'<br>')}</p><p><b>Eksklusi:</b><br>${esc(p.exclusion||'-').replace(/\n/g,'<br>')}</p><h3>2.4 Variabel dan Definisi Operasional</h3><p><b>Outcome:</b> ${esc(p.outcome)} — ${esc(p.outcomeDefinition||'-')}</p><p><b>Exposure:</b> ${esc(p.exposure)} — ${esc(p.exposureDefinition||'-')}</p><p><b>Kovariat:</b> ${esc(p.covariates||'-')}</p><h3>2.5 Analisis Statistik</h3><p>${esc(p.analysisPlan||d.tests)}</p><p>Missing data, bias, confounding, dan sensitivity analysis harus dijelaskan sesuai protokol.</p>
      <h2>3. Hasil</h2>${researchState.analysis?.html||'<p>Belum ada hasil.</p>'}
      <h2>4. Pembahasan</h2><p>Bandingkan hasil dengan literatur, jelaskan besaran efek dan ketidakpastian, kemungkinan bias/confounding, konsistensi biologis/epidemiologis, dan implikasi.</p>
      <h2>5. Keterbatasan</h2><p>Jelaskan selection bias, information/recall bias, confounding, missing data, measurement error, temporal ambiguity, dan keterbatasan generalisasi sesuai desain.</p>
      <h2>6. Kesimpulan</h2><p>Kesimpulan harus menjawab tujuan penelitian dan tidak melebihi bukti yang dihasilkan oleh desain.</p>
      <h2>7. Rekomendasi</h2><p>Rekomendasi program dan penelitian lanjutan berdasarkan hasil yang telah diverifikasi.</p>
      <h2>8. Etik dan Pendanaan</h2><p><b>Etik:</b> ${esc(p.ethics||'-')}<br><b>Pendanaan:</b> ${esc(p.funding||'-')}</p>
      <h2>9. Checklist Pelaporan</h2>${checklist()}
      <h2>Daftar Pustaka</h2><p>Tambahkan referensi primer, pedoman program, dan pedoman pelaporan yang digunakan.</p></div>`;
  }
  window.researchReportPreview=preview;
  const oldInit=window.initResearch;
  window.initResearch=function(){
    if(oldInit)oldInit(); diseaseOptions();
    const p=researchState||{};
    ['researchDisease','studyTitle','researchQuestion','studyDesign','studyPopulation','studyPeriod','studySetting','researchDataSource','researchSampling','researchOutcome','researchExposure','researchGeneralObjective','researchSpecificObjectives','researchHypothesis','researchTargetPopulation','researchAccessiblePopulation','researchInclusion','researchExclusion','researchSampleTarget','researchSampleRatio','researchOutcomeDefinition','researchExposureDefinition','researchCovariates','researchAnalysisPlan','researchEthics','researchFunding','researchReportingGuideline','researchMethodNotes'].forEach(id=>{if(p[id]!==undefined)setv(id,p[id])});
    if(p.researchDisease)setv('researchDisease',p.researchDisease);
    if(typeof applyStudyDesign==='function')applyStudyDesign();
  };
  window.validateResearchProtocol&&window.validateResearchProtocol();
})();

/* ===================== v42 ADMINISTRATIVE EPIDEMIOLOGY DASHBOARD ===================== */
(function(){
  function e(id){return document.getElementById(id)}
  function vv(id){return e(id)?.value||''}
  function uniq(a){return [...new Set(a.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'id'))}
  function allCases(){return (db.cases||[])}
  function diseaseList(){const s=e('adminEpiDisease');if(!s||typeof diseases==='undefined')return;const cur=s.value;s.innerHTML='<option value="">Semua penyakit</option>'+Object.entries(diseases).map(([id,d])=>`<option value="${esc(id)}">${esc(d.name||id)}</option>`).join('');if(cur)s.value=cur}
  function filtered(){
    const disease=vv('adminEpiDisease'),prov=vv('adminEpiProv').trim().toLowerCase(),kab=vv('adminEpiKab').trim().toLowerCase(),kec=vv('adminEpiKec').trim().toLowerCase(),desa=vv('adminEpiDesa').trim().toLowerCase();
    return allCases().filter(c=>(!disease||c.disease===disease)&&(!prov||String(c.prov||c.admin?.prov||'').toLowerCase().includes(prov))&&(!kab||String(c.kab||c.admin?.kab||'').toLowerCase().includes(kab))&&(!kec||String(c.kec||c.admin?.kec||'').toLowerCase().includes(kec))&&(!desa||String(c.desa||c.admin?.desa||'').toLowerCase().includes(desa)));
  }
  function levelField(level){return level==='prov'?'prov':level==='kab'?'kab':level==='kec'?'kec':'desa'}
  function populationFor(inv,area,level){
    const maps=inv?.populationByArea||{}; const candidates=[area,`${level}:${area}`,`${level}|${area}`];for(const k of candidates)if(maps[k]!==undefined)return Number(maps[k]);return null
  }
  window.renderAdminEpiDashboard=function(){
    diseaseList();const cs=filtered(),level=vv('adminEpiLevel')||'kec',field=levelField(level),groups={};
    cs.forEach(c=>{const area=c[field]||c.admin?.[field]||'Tidak diketahui';if(!groups[area])groups[area]={area,cases:0,dead:0,geo:0,onset:0};groups[area].cases++;if(String(c.outcome||'').toLowerCase().includes('meninggal'))groups[area].dead++;if(c.lat&&c.lng)groups[area].geo++;if(c.onset)groups[area].onset++});
    const inv=act();const rows=Object.values(groups).map(g=>{const pop=populationFor(inv,g.area,level),rate=Number.isFinite(pop)&&pop>0?g.cases/pop*100000:null;return {...g,pop,rate,cfr:g.cases?g.dead/g.cases*100:0}}).sort((a,b)=>(b.rate??-1)-(a.rate??-1)||b.cases-a.cases);
    const sum=e('adminEpiSummary');if(sum)sum.innerHTML=[['Kasus',cs.length],['Meninggal',cs.filter(c=>String(c.outcome||'').toLowerCase().includes('meninggal')).length],['Wilayah',rows.length],['Koordinat',cs.filter(c=>c.lat&&c.lng).length],['Onset terisi',cs.filter(c=>c.onset).length]].map(x=>`<div class="stat"><small>${esc(x[0])}</small><b>${x[1]}</b></div>`).join('');
    const table=e('adminEpiTable');if(table)table.innerHTML=rows.length?`<table class="report-table"><thead><tr><th>Wilayah</th><th>Kasus</th><th>Meninggal</th><th>CFR %</th><th>Populasi</th><th>AR/100.000</th><th>Koordinat</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.area)}</td><td>${r.cases}</td><td>${r.dead}</td><td>${r.cfr.toFixed(1)}</td><td>${r.pop===null?'—':r.pop.toLocaleString('id-ID')}</td><td>${r.rate===null?'—':r.rate.toFixed(2)}</td><td>${r.geo}</td></tr>`).join('')}</tbody></table>`:'<div class="notice">Belum ada kasus sesuai filter.</div>';
    const byDate={};cs.filter(c=>c.onset).forEach(c=>{const d=String(c.onset).slice(0,10);byDate[d]=(byDate[d]||0)+1});const trend=Object.entries(byDate).sort((a,b)=>a[0].localeCompare(b[0]));const tr=e('adminEpiTrend');if(tr)tr.innerHTML=trend.length?`<table class="report-table"><tr><th>Tanggal</th><th>Kasus</th></tr>${trend.map(x=>`<tr><td>${esc(x[0])}</td><td>${x[1]}</td></tr>`).join('')}</table>`:'<div class="notice">Belum ada tanggal onset.</div>';
    window.__adminEpiRows=rows;window.__adminEpiCases=cs;
  };
  window.exportAdminEpiCSV=function(){const rows=window.__adminEpiRows||[];if(!rows.length)return alert('Belum ada hasil dashboard untuk diekspor.');const cols=['Wilayah','Kasus','Meninggal','CFR_percent','Populasi','AttackRate_per100000','Koordinat'];const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;const lines=[cols.join(','),...rows.map(r=>[r.area,r.cases,r.dead,r.cfr.toFixed(1),r.pop??'',r.rate??'',r.geo].map(q).join(','))];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}));a.download='GORUT-dashboard-epidemiologi-administratif.csv';a.click()};
  const oldInit=window.initResearch; window.initResearch=function(){if(oldInit)oldInit();diseaseList()};
})();

/* =========================================================
   GORUT-OUTBREAK AI v43 — Open Access + Epidemiological Command Center
   Registration, payment verification and time-limited access are retired.
   ========================================================= */
(function(){
  'use strict';
  const esc = x => String(x ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  // Open operational mode: no registration, payment, subscription or expiry gate.
  window.GORUT_USER={id:'open-access',email:'',role:'admin_kabupaten'};
  window.GORUT_OPEN_ACCESS=true;
  // Preserve explicit backend configuration; production login must use Supabase when enabled.
  window.enforceAccess=function(){return true};
  window.showRegister=function(){};
  window.closeRegister=function(){};
  window.submitRegistration=function(){return false};
  window.activateRegistration=function(){return false};
  window.activateRegistrationV28=function(){return false};
  window.v30RejectRegistration=function(){return false};
  window.v29Logout=function(){location.reload()};
  window.logout=function(){location.reload()};
  window.v28BackendAccess=async()=>({configured:false,allowed:true,admin:true,expiresAt:null});
  window.accessV=async()=>({allowed:true,isAdmin:true,expires_at:null,source:'open'});
  window.access=async()=>({has_access:true,is_admin:true,source:'open'});

  function removeLegacyAccessUI(){
    ['login','registerModal','v27AccessAdmin','v28AccessAdmin','v29-access-card','v30AdminPanel'].forEach(id=>{
      const e=document.getElementById(id); if(e) e.remove();
    });
    const top=document.getElementById('v29Topbar'); if(top) top.remove();
    const rb=document.getElementById('roleBadge'); if(rb){rb.textContent='Akses: penuh';rb.className='badge'}
    const bb=document.getElementById('backendBadge'); if(bb){bb.textContent='Mode: lokal';bb.className='badge'}
    document.querySelectorAll('button').forEach(b=>{
      const t=(b.textContent||'').toLowerCase();
      if(/registrasi|pembayaran|subscription|premium 7|aktifkan 7 hari|konfirmasi whatsapp/.test(t)) b.remove();
    });
  }

  function commandCenterCard(){
    const sec=document.getElementById('dashboard'); if(!sec||document.getElementById('v43CommandCard'))return;
    const c=document.createElement('div'); c.id='v43CommandCard'; c.className='card';
    c.innerHTML=`<div class="toolbar" style="justify-content:space-between"><div><div class="eyebrow">V43 · EPIDEMIOLOGICAL COMMAND CENTER</div><h3 style="margin:4px 0">🎯 Prioritas Respons Epidemiologi</h3><div class="small">Ringkasan otomatis dari alert, investigasi, kasus, kematian, spesimen, GIS dan kelengkapan data. Ini adalah decision-support, bukan penetapan KLB.</div></div><button class="primary" id="v43Refresh">🔄 Perbarui</button></div><div id="v43PriorityGrid" class="grid"></div><div id="v43PriorityList" style="margin-top:12px"></div>`;
    const anchor=sec.querySelector('#stats');
    if(anchor) anchor.parentNode.insertBefore(c,anchor.nextSibling); else sec.prepend(c);
    document.getElementById('v43Refresh').onclick=renderCommandCenter;
  }

  function renderCommandCenter(){
    const grid=document.getElementById('v43PriorityGrid'), list=document.getElementById('v43PriorityList'); if(!grid||!list)return;
    const cases=Array.isArray(db.cases)?db.cases:[], inv=Array.isArray(db.investigations)?db.investigations:[], alerts=Array.isArray(db.alerts)?db.alerts:[], specs=Array.isArray(db.specimens)?db.specimens:[];
    const deaths=cases.filter(c=>String(c.outcome||'').toLowerCase().includes('meninggal')).length;
    const pendingSpecs=specs.filter(s=>/pending|menunggu|belum/i.test(String(s.status||''))).length;
    const geo=cases.filter(c=>Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lng))).length;
    const unverified=alerts.filter(a=>/belum|perlu/i.test(String(a.result||''))).length;
    grid.innerHTML=[['Investigasi aktif',inv.filter(x=>x.status!=='Selesai').length],['Kasus',cases.length],['Meninggal',deaths],['Spesimen pending',pendingSpecs],['Alert perlu tindak lanjut',unverified],['Koordinat kasus',`${geo}/${cases.length||0}`]].map(x=>`<div class="stat"><small>${esc(x[0])}</small><b>${esc(x[1])}</b></div>`).join('');
    const byDisease={}; cases.forEach(c=>{const id=c.disease||db.investigations.find(i=>String(i.id)===String(c.investigationId))?.disease||'tidak-teridentifikasi'; byDisease[id]??={n:0,death:0,last:null};byDisease[id].n++;if(String(c.outcome||'').toLowerCase().includes('meninggal'))byDisease[id].death++;const d=String(c.onset||'');if(d&&(!byDisease[id].last||d>byDisease[id].last))byDisease[id].last=d});
    const rows=Object.entries(byDisease).map(([id,x])=>{let score=Math.min(10,x.n)+Math.min(3,x.death*2);const priority=score>=9?'TINGGI':score>=5?'PERHATIAN':'RENDAH';return {id,x,score,priority,name:(window.diseases?.[id]?.name||id)}}).sort((a,b)=>b.score-a.score);
    list.innerHTML=rows.length?`<table><thead><tr><th>Penyakit</th><th>Kasus</th><th>Meninggal</th><th>Skor sinyal</th><th>Prioritas</th><th>Tindakan awal</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${r.x.n}</td><td>${r.x.death}</td><td>${r.score}</td><td><span class="badge">${r.priority}</span></td><td>${esc(r.x.death?'Tinjau severity, lab dan respons segera.':'Verifikasi tren, definisi kasus dan kelengkapan data.')}</td></tr>`).join('')}</tbody></table>`:'<div class="notice">Belum ada kasus untuk membentuk prioritas penyakit.</div>';
  }

  const oldRenderV43=window.render;
  window.render=async function(){
    // Disable any legacy access gate by running the existing renderer in open-access context.
    const result=await oldRenderV43.apply(this,arguments);
    removeLegacyAccessUI();
    commandCenterCard();
    renderCommandCenter();
    const rb=document.getElementById('roleBadge');if(rb)rb.textContent='Akses: penuh';
    return result;
  };

  function startOpen(){
    removeLegacyAccessUI();
    const app=document.getElementById('app'); if(app)app.style.display='block';
    window.GORUT_USER={id:'open-access',email:'',role:'admin_kabupaten'};
    try{setRoleUI();}catch(e){}
    try{initDiseaseSelectors();}catch(e){}
    try{window.render();}catch(e){console.error('v43 startup',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startOpen);else setTimeout(startOpen,0);
})();


/* ============================================================
   GORUT-OUTBREAK AI v45 — LOGIN/REGISTRATION + QUESTIONNAIRE INTEGRATION
   - Login page restored with four user categories.
   - Non-admin users register name/password/WhatsApp and request permission via WhatsApp Admin.
   - Admin manually marks a pending account as permitted after replying "silahkan" in WhatsApp.
   - All four roles receive the same operational access in this local deployment.
   - Questionnaire responses are stored in case.answers and mapped to core epidemiological fields.
   ============================================================ */
(function(){
  'use strict';
  const USER_KEY='gorut-users-v45';
  const SESSION_KEY='gorut-session-v45';
  const WA='6282290150334';
  const WA_TEXT='Izin Admin, saya mau login pada aplikasi Outbreak.';
  const esc45=x=>String(x??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const roleLabel={puskesmas_rs:'Surveilans Puskesmas dan Rumah Sakit',dinkes_kab:'Surveilans Dinkes Kabupaten',dinkes_prov:'Surveilans Dinkes Provinsi',admin:'Admin'};
  const roleShort={puskesmas_rs:'Surveilans Puskesmas/RS',dinkes_kab:'Surveilans Dinkes Kabupaten',dinkes_prov:'Surveilans Dinkes Provinsi',admin:'Admin'};
  const readUsers=()=>{try{return JSON.parse(localStorage.getItem(USER_KEY)||'[]')}catch(e){return[]}};
  const writeUsers=u=>localStorage.setItem(USER_KEY,JSON.stringify(u));
  async function hash45(pw){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(pw));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  function ensureAdminSetup(){return readUsers().some(u=>u.role==='admin'&&u.status==='aktif')}
  function showLogin(msg=''){
    let l=document.getElementById('login');
    if(!l){l=document.createElement('div');l.id='login';l.className='login';document.body.insertBefore(l,document.body.firstElementChild)}
    let reg=document.getElementById('registerModal');
    if(!reg){reg=document.createElement('div');reg.id='registerModal';reg.className='modal';document.body.appendChild(reg)}
    const users=readUsers(); const adminReady=ensureAdminSetup();
    l.style.display='grid';
    l.innerHTML=
      '<div class="loginbox v45-loginbox" style="text-align:center">'+
      '<div class="login-brand-logos"><img src="logo-gorontalo-utara-official.png" onerror="this.onerror=null;this.src=&quot;logo-gorontalo-utara.svg&quot;" alt="Logo Kabupaten Gorontalo Utara"><img src="logo-surveilans-epidemiologi-official.png" onerror="this.onerror=null;this.src=&quot;logo-surveilans-epidemiologi.svg&quot;" alt="Logo Surveilans Epidemiologi"></div>'+
      '<div class="premium-badge">🛡️ GORUT-OUTBREAK AI · v67</div>'+
      '<h2 style="margin:12px 0 4px">Login Pengguna</h2>'+
      '<p class="small">Platform investigasi epidemiologi, PE/KLB, surveilans dan analisis epidemiologi.</p>'+
      (msg?'<div class="notice" style="border-left-color:#b42318">'+esc45(msg)+'</div>':'')+
      '<div class="field"><label>Jenis Pengguna</label><select id="v45Role" onchange="v45RoleChanged()"><option value="puskesmas_rs">Surveilans Puskesmas dan Rumah Sakit</option><option value="dinkes_kab">Surveilans Dinkes Kabupaten</option><option value="dinkes_prov">Surveilans Dinkes Provinsi</option><option value="admin">Admin</option></select></div>'+
      '<div id="v45AdminSetup" style="display:'+(window.GORUT_BACKEND?.enabled||adminReady?'none':'block')+'" class="notice"><b>Pengaturan awal Admin</b><br>Belum ada akun Admin aktif. Buat akun Admin pertama untuk mengelola persetujuan pengguna.</div>'+
      '<div class="field"><label>'+(window.GORUT_BACKEND?.enabled?'Email akun Supabase':'Nama User')+'</label><input id="v45LoginName" autocomplete="username" placeholder="'+(window.GORUT_BACKEND?.enabled?'nama@instansi.go.id':'Nama user')+'"></div>'+
      '<div class="field"><label>Password</label><input id="v45LoginPass" type="password" autocomplete="current-password" placeholder="Password"></div>'+
      '<div class="field" id="v45LoginWaWrap"><label>Nomor WhatsApp terdaftar</label><input id="v45LoginWa" inputmode="tel" placeholder="08xxxxxxxxxx"></div>'+
      '<button class="primary" style="width:100%;margin-top:4px" onclick="v45Login()">🔐 Login</button><button class="btn-ghost" style="width:100%;margin-top:8px" onclick="demoLogin()">🚀 Masuk Gratis / Mode Lokal</button>'+
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">'+
      '<button class="btn-ghost" style="flex:1" onclick="v45ShowRegister()">📝 Daftar Pengguna</button>'+
      '<a href="https://wa.me/'+WA+'?text='+encodeURIComponent(WA_TEXT)+'" target="_blank" rel="noopener" style="flex:1;text-decoration:none"><button class="btn-whatsapp" style="width:100%">💬 WhatsApp Admin</button></a></div>'+
      '<div id="v45LoginHint" class="small" style="margin-top:12px">Pengguna baru harus menunggu izin Admin setelah mengirim pesan WhatsApp.</div>'+
      '</div>';
    v45RoleChanged();
  }
  window.v45RoleChanged=function(){
    const role=document.getElementById('v45Role')?.value; const wa=document.getElementById('v45LoginWaWrap'); const setup=document.getElementById('v45AdminSetup');
    if(wa)wa.style.display=role==='admin'?'none':'block';
    if(setup)setup.style.display=role==='admin'&&!ensureAdminSetup()?'block':'none';
    const n=document.getElementById('v45LoginName'); if(n)n.placeholder=role==='admin'&&!ensureAdminSetup()?'Nama Admin pertama':'Nama user';
    const hint=document.getElementById('v45LoginHint'); if(hint)hint.textContent=role==='admin'?(ensureAdminSetup()?'Login sebagai Admin. Admin memiliki akses penuh dan mengelola persetujuan pengguna.':'Buat akun Admin pertama dengan nama dan password, lalu login.'):'Akun harus berstatus DIIZINKAN setelah Admin menjawab "silahkan" melalui WhatsApp.';
  };
  window.v45ShowRegister=function(){
    let m=document.getElementById('registerModal');
    if(!m){m=document.createElement('div');m.id='registerModal';document.body.appendChild(m)}
    m.style.display='grid'; m.className='modal show';
    m.innerHTML='<div class="modalbox register-modal"><div style="display:flex;justify-content:space-between;gap:10px"><div><h2 style="margin:0">Daftar Pengguna</h2><p class="small">Tidak ada pembayaran, masa akses, atau biaya. Pendaftaran hanya memerlukan nama, password, nomor WhatsApp dan jenis pengguna.</p></div><button onclick="v45CloseRegister()">✕</button></div>'+      '<div class="field"><label>Nama User *</label><input id="v45RegName" placeholder="Nama lengkap/user"></div>'+      '<div class="field"><label>Password *</label><input id="v45RegPass" type="password" placeholder="Minimal 6 karakter"></div>'+      '<div class="field"><label>Nomor WhatsApp *</label><input id="v45RegWa" inputmode="tel" placeholder="08xxxxxxxxxx"></div>'+      '<div class="field"><label>Jenis Pengguna *</label><select id="v45RegRole"><option value="puskesmas_rs">Surveilans Puskesmas dan Rumah Sakit</option><option value="dinkes_kab">Surveilans Dinkes Kabupaten</option><option value="dinkes_prov">Surveilans Dinkes Provinsi</option></select></div>'+      '<div class="notice"><b>Langkah persetujuan:</b> setelah mendaftar, klik tombol WhatsApp Admin dengan pesan otomatis <i>"Izin Admin, saya mau login pada aplikasi Outbreak."</i>. Setelah Admin menjawab <b>silahkan</b>, Admin mengaktifkan akun pada menu Admin.</div>'+      '<button class="primary" onclick="v45Register()">Daftarkan User</button> <button class="btn-whatsapp" onclick="v45RegisterAndWA()">💬 Daftar + WhatsApp Admin</button><div id="v45RegMsg" class="notice" style="display:none;margin-top:10px"></div></div>';
  };
  window.v45CloseRegister=function(){const m=document.getElementById('registerModal');if(m){m.style.display='none';m.className='modal'}};
  window.v45Register=async function(openWA=false){
    const name=(document.getElementById('v45RegName')?.value||'').trim(),pw=document.getElementById('v45RegPass')?.value||'',wa=(document.getElementById('v45RegWa')?.value||'').trim(),role=document.getElementById('v45RegRole')?.value;
    if(!name||!pw||!wa||!role)return alert('Nama, password, WhatsApp dan jenis pengguna wajib diisi.');
    if(pw.length<6)return alert('Password minimal 6 karakter.');
    const users=readUsers(); if(users.some(u=>u.name.toLowerCase()===name.toLowerCase()&&u.role!==role))return alert('Nama user sudah terdaftar. Gunakan nama yang berbeda.');
    const id='USR-'+Date.now(); users.push({id,name,passwordHash:await hash45(pw),whatsapp:wa,role,status:'menunggu',requestedAt:new Date().toISOString(),approvedAt:null}); writeUsers(users);
    const msg=document.getElementById('v45RegMsg'); if(msg){msg.style.display='block';msg.innerHTML='<b>Pendaftaran berhasil.</b> Status akun: <b>MENUNGGU IZIN ADMIN</b>.<br>ID: <code>'+esc45(id)+'</code><br>Silakan klik WhatsApp Admin dan tunggu Admin menjawab "silahkan".';}
    if(openWA)window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(WA_TEXT),'_blank','noopener');
    return id;
  };
  window.v45RegisterAndWA=function(){return v45Register(true)};
  window.v45Login=async function(){
    const cfg=window.GORUT_BACKEND||{};
    const role=document.getElementById('v45Role')?.value;
    const name=(document.getElementById('v45LoginName')?.value||'').trim();
    const pw=document.getElementById('v45LoginPass')?.value||'';
    const wa=(document.getElementById('v45LoginWa')?.value||'').trim();
    if(!name||!pw)return showLogin(cfg.enabled?'Email dan password wajib diisi.':'Nama user dan password wajib diisi.');
    if(cfg.enabled){
      const sb=await backendClient();
      if(!sb)return showLogin('Backend Supabase ditandai aktif tetapi client/config belum siap. Login lokal dinonaktifkan untuk mencegah akses tidak terautentikasi.');
      const auth=await sb.auth.signInWithPassword({email:name.toLowerCase(),password:pw});
      if(auth.error)return showLogin('Login Supabase gagal: '+auth.error.message);
      const user=auth.data?.user;
      if(!user){await sb.auth.signOut();return showLogin('Supabase tidak mengembalikan pengguna yang valid.');}
      const pr=await sb.from('profiles').select('role,full_name,facility').eq('id',user.id).maybeSingle();
      if(pr.error||!pr.data?.role){
        await sb.auth.signOut();
        return showLogin('Profil dan peran pengguna belum tersedia di tabel profiles. Hubungi administrator; akses ditolak.');
      }
      window.GORUT_USER={...user,id:user.id,email:user.email||name,role:pr.data.role,displayName:pr.data.full_name||user.email,facility:pr.data.facility||null};
      GORUT_USER=window.GORUT_USER;
      localStorage.removeItem(SESSION_KEY);
      const app=document.getElementById('app');if(app)app.style.display='block';
      const login=document.getElementById('login');if(login)login.style.display='none';
      const rb=document.getElementById('roleBadge');if(rb)rb.textContent='User: '+pr.data.role;
      try{setRoleUI()}catch(e){}
      try{await window.render()}catch(e){console.error('Render after Supabase login failed',e)}
      return;
    }
    let users=readUsers();
    if(role==='admin'&&!ensureAdminSetup()){
      const rec={id:'ADM-'+Date.now(),name,passwordHash:await hash45(pw),whatsapp:'',role:'admin',status:'aktif',requestedAt:new Date().toISOString(),approvedAt:new Date().toISOString()};users.push(rec);writeUsers(users);alert('Akun Admin lokal pertama berhasil dibuat pada browser ini saja. Akun ini bukan akun server. Silakan login kembali.');showLogin();document.getElementById('v45Role').value='admin';v45RoleChanged();return;
    }
    const u=users.find(x=>x.name.toLowerCase()===name.toLowerCase()&&x.role===role);
    if(!u)return showLogin('User belum terdaftar pada jenis pengguna tersebut. Silakan daftar terlebih dahulu.');
    if(await hash45(pw)!==u.passwordHash)return showLogin('Password tidak sesuai.');
    if(role!=='admin'&&String(u.whatsapp).replace(/\D/g,'')!==String(wa).replace(/\D/g,''))return showLogin('Nomor WhatsApp tidak sesuai dengan nomor saat pendaftaran.');
    if(u.status!=='aktif')return showLogin('Akun belum diizinkan Admin. Mode lokal hanya berlaku pada browser ini.');
    localStorage.setItem(SESSION_KEY,JSON.stringify({id:u.id,at:new Date().toISOString()}));
    window.GORUT_USER={id:u.id,email:u.name,role:u.role,displayName:u.name,whatsapp:u.whatsapp}; GORUT_USER=window.GORUT_USER;
    const app=document.getElementById('app');if(app)app.style.display='block';const login=document.getElementById('login');if(login)login.style.display='none';
    const rb=document.getElementById('roleBadge');if(rb)rb.textContent='User: '+roleLabel[u.role]+' · Mode lokal';
    try{setRoleUI()}catch(e){} try{await window.render()}catch(e){}
  };
  window.v45Logout=function(){localStorage.removeItem(SESSION_KEY);window.GORUT_USER=null;GORUT_USER=null;showLogin();const app=document.getElementById('app');if(app)app.style.display='none'};
  window.v45Approve=function(id){const users=readUsers();const u=users.find(x=>x.id===id);if(!u)return alert('User tidak ditemukan.');u.status='aktif';u.approvedAt=new Date().toISOString();writeUsers(users);renderV45Admin();alert('Akun '+u.name+' sekarang DIIZINKAN login.');};
  window.v45Reject=function(id){const users=readUsers();const u=users.find(x=>x.id===id);if(!u)return;u.status='ditolak';writeUsers(users);renderV45Admin();};
  function renderV45Admin(){
    const sec=document.getElementById('admin');if(!sec)return; let box=document.getElementById('v45UserAdmin');if(!box){box=document.createElement('div');box.id='v45UserAdmin';box.className='card';sec.insertBefore(box,sec.firstElementChild)}
    if(window.GORUT_USER?.role!=='admin'){box.innerHTML='<div class="notice">Menu persetujuan pengguna hanya tersedia untuk Admin.</div>';return}
    const users=readUsers(); const pending=users.filter(u=>u.role!=='admin'&&u.status==='menunggu');
    box.innerHTML='<div class="toolbar" style="justify-content:space-between"><div><h2 style="margin:0">👥 Persetujuan Pengguna v45</h2><div class="small">Setelah Admin menjawab "silahkan" melalui WhatsApp, tandai akun sebagai DIIZINKAN agar pengguna dapat login. Tidak ada pembayaran atau masa berlaku.</div></div><button onclick="renderV45Admin()">↻ Refresh</button></div>'+
      '<div class="summary-grid"><div><b>Menunggu</b><strong>'+pending.length+'</strong></div><div><b>Total pengguna</b><strong>'+users.length+'</strong></div><div><b>Aktif</b><strong>'+users.filter(u=>u.status==='aktif').length+'</strong></div></div>'+
      `<div style="overflow:auto"><table><thead><tr><th>Nama</th><th>Jenis</th><th>WhatsApp</th><th>Status</th><th>Daftar</th><th>Aksi</th></tr></thead><tbody>${users.map(u=>`<tr><td><b>${esc45(u.name)}</b><br><small>${esc45(u.id)}</small></td><td>${esc45(roleShort[u.role]||u.role)}</td><td>${esc45(u.whatsapp||'-')}</td><td><span class="badge">${esc45(u.status)}</span></td><td>${new Date(u.requestedAt).toLocaleString('id-ID')}</td><td>${u.role!=='admin'&&u.status==='menunggu'?`<button class="primary" onclick="v45Approve('${esc45(u.id)}')">✓ Izinkan</button> <button onclick="v45Reject('${esc45(u.id)}')">Tolak</button>`:'—'}</td></tr>`).join('')||'<tr><td colspan="6">Belum ada pengguna.</td></tr>'}</tbody></table></div>`;
  }
  function installBrandingV67(){
  document.documentElement.setAttribute('data-gorut-brand','v67');
  const t=document.querySelector('title'); if(t) t.textContent='GORUT-OUTBREAK AI v67 — Surveilans Epidemiologi Gorontalo Utara';
}
function installLogin(){
    // Retire v43 open-access startup and restore the requested login page.
    const app=document.getElementById('app'); if(app)app.style.display='none';
    showLogin();
    const reg=document.getElementById('registerModal');if(reg){reg.style.display='none';reg.className='modal'}
    const nav=document.querySelector('nav'); if(nav && !document.getElementById('v45LogoutBtn')){const b=document.createElement('button');b.id='v45LogoutBtn';b.textContent='🚪 Keluar';b.onclick=v45Logout;nav.appendChild(b)}
    const oldBadge=document.getElementById('roleBadge');if(oldBadge)oldBadge.textContent='Login diperlukan';
  }
  // ---------- Questionnaire integration ----------
  function qId(q,i){return 'v45q_'+(q.id||('Q_'+i)).replace(/[^a-zA-Z0-9_]/g,'_')+'_'+i}
  function qField(q,i,answers){const id=qId(q,i),v=answers?.[q.id]??answers?.[q.label]??'';if(q.type==='choice')return '<select id="'+id+'"><option value="">Pilih...</option>'+((q.options||[]).map(o=>'<option '+(String(o)===String(v)?'selected':'')+'>'+esc45(o)+'</option>').join(''))+'</select>';if(q.type==='textarea')return '<textarea id="'+id+'" rows="2">'+esc45(v)+'</textarea>';return '<input id="'+id+'" type="'+(q.type==='number'?'number':q.type==='date'?'date':'text')+'" value="'+esc45(v)+'">'}
  function collectQ45(){const qs=db.questions||[],a={};qs.forEach((q,i)=>{if(!q.id)q.id='Q_'+i;const e=document.getElementById(qId(q,i));if(e)a[q.id]=e.value;});return a}
  function ensureQuestionIds(){(db.questions||[]).forEach((q,i)=>{if(!q.id)q.id='Q_'+String(i+1).padStart(3,'0')});}
  function questionnaireCasePanel(c={}){ensureQuestionIds();const qs=db.questions||[];if(!qs.length)return '<div class="notice">Belum ada kuesioner aktif. Buka menu Kuesioner → pilih penyakit → Muat Kuesioner.</div>';return '<div class="card" style="margin-top:10px;border-left:4px solid #1769aa"><h4>📋 Kuesioner Epidemiologi Terintegrasi</h4><p class="small">Semua jawaban disimpan pada <code>case.answers</code>, digunakan oleh variable dictionary/analisis dan ikut dibawa ke sinkronisasi backend.</p>'+qs.map((q,i)=>'<div class="field"><label>'+esc45((i+1)+'. '+q.label)+(q.required?' *':'')+'</label>'+qField(q,i,c.answers||{})+'<small class="small">'+esc45(q.cat||'PE')+' · '+esc45(q.version||'')+'</small></div>').join('')+'</div>'}
  function coreFromAnswers(c,a){const find=(...labels)=>{for(const q of (db.questions||[])){if(labels.some(l=>String(q.label).toLowerCase()===l.toLowerCase())){const v=a[q.id];if(v!==undefined&&v!=='')return v}}return ''};
    if(!c.id)c.id=find('ID Kasus'); if(!c.name)c.name=find('Nama lengkap'); if(!c.age)c.age=Number(find('Umur'))||0; if(!c.sex)c.sex=find('Jenis kelamin'); if(!c.onset)c.onset=find('Tanggal onset gejala'); if(!c.status)c.status=find('Status kasus'); if(!c.outcome)c.outcome=find('Keadaan akhir','Outcome','Status kesehatan');
    c.address=c.address||find('Alamat lengkap');c.desa=c.desa||find('Desa/Kelurahan');c.kec=c.kec||find('Kecamatan');c.kab=c.kab||find('Kabupaten');c.prov=c.prov||find('Provinsi');c.pkm=c.pkm||find('Puskesmas');c.lat=c.lat??(Number(find('Latitude'))||null);c.lng=c.lng??(Number(find('Longitude'))||null);return c;
  }
  function auditQuestionnaire(){
    const rows=Object.entries(diseases||{}).map(([id,d])=>{const q=Array.isArray(d.q)?d.q:[], unique=new Set(q.map(x=>String(x).toLowerCase()));const warn=[];if(!q.length)warn.push('Tidak ada pertanyaan spesifik');if(unique.size!==q.length)warn.push('Ada pertanyaan spesifik duplikat');if(q.some(x=>!x||!x[1]))warn.push('Ada pertanyaan tanpa label');return {id,name:d.name||id,group:d.group||'-',n:q.length,status:warn.length?'WARN':'PASS',warn};});return rows}
  window.runQuestionnaireAudit=function(){ensureQuestionIds();const rows=auditQuestionnaire(),el=document.getElementById('qAudit');if(!el)return;const pass=rows.filter(x=>x.status==='PASS').length,warn=rows.length-pass;el.innerHTML='<div class="card"><h3>Audit Kuesioner v45</h3><div class="grid"><div class="stat"><small>Penyakit/sindrom</small><b>'+rows.length+'</b></div><div class="stat"><small>PASS</small><b>'+pass+'</b></div><div class="stat"><small>WARN</small><b>'+warn+'</b></div><div class="stat"><small>Integrasi jawaban</small><b>AKTIF</b></div></div><div class="notice">Audit memeriksa keberadaan pertanyaan spesifik, duplikasi, label kosong, dan kesiapan integrasi jawaban ke <code>case.answers</code>. Ini bukan validasi substantif terhadap formulir resmi Kemenkes.</div><div style="overflow:auto"><table><thead><tr><th>Penyakit/Sindrom</th><th>Kelompok</th><th>Q spesifik</th><th>Status</th><th>Catatan</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+esc45(r.name)+'</td><td>'+esc45(r.group)+'</td><td>'+r.n+'</td><td><span class="badge">'+r.status+'</span></td><td>'+esc45(r.warn.join(' · ')||'Struktur spesifik tersedia')+'</td></tr>').join('')+'</tbody></table></div></div>'}
  // Patch case creation/edit to collect questionnaire answers without removing v44 address/priority/food behavior.
  const oldAdd=window.addCase;
  window.addCase=function(){
    if(!act())return alert('Pilih investigasi terlebih dahulu.');
    const food=act().disease==='keracunan-pangan',diseaseId=act().disease,extraPriority=priorityPanel(diseaseId,{}),extraFood=food?'<div class="card" style="margin-top:10px"><h4>🍱 Detail Kasus Keracunan Pangan</h4>'+f('Makanan/minuman dikonsumsi','caseFood','text','')+f('Waktu konsumsi','caseConsumedAt','datetime-local','')+f('Waktu onset','caseOnsetTime','datetime-local','')+f('Masa inkubasi (jam)','caseIncubation','number','')+f('Gejala utama','caseSymptoms','text','')+f('Sumber pangan','caseFoodSource','text','')+f('Dirawat inap?','caseHospitalized','select','Tidak|Ya')+f('Spesimen klinis','caseClinicalSpecimen','text','')+'</div>':'',qPanel=questionnaireCasePanel({});
    modal('<h2>Tambah Kasus</h2>'+f('ID','cid','text','K'+String(db.cases.length+1).padStart(3,'0'))+f('Nama','cn','text','')+f('Umur','ca','number','')+f('Jenis kelamin','cs','select','Laki-laki|Perempuan')+f('Onset','co',food?'datetime-local':'date','')+f('Status','ct','select','Suspek|Probable|Konfirmasi')+f('Outcome','cu','select','Rawat jalan|Dirawat|Sembuh|Meninggal')+addressFields({})+extraFood+extraPriority+qPanel+'<button class="primary" onclick="saveCase()">Simpan</button>');
  };
  const oldSave=window.saveCase;
  window.saveCase=async function(){
    const answers=collectQ45(); const before=db.cases.length; await oldSave(); const c=db.cases[before]; if(!c)return; c.answers=answers; coreFromAnswers(c,c.answers); c.disease=act()?.disease||db.selectedDisease||c.disease; if(c.lat!==null&&c.lng!==null&&!c.admin&&typeof lookupAdmin==='function'){try{c.admin=await lookupAdmin(c.lat,c.lng)}catch(e){}}
    save();cases();
  };
  const oldEdit=window.editCase;
  window.editCase=function(id){
    const c=db.cases.find(x=>String(x.id)===String(id));if(!c)return;const food=act()?.disease==='keracunan-pangan',diseaseId=act()?.disease,fc=c.foodCase||{},extraPriority=priorityPanel(diseaseId,c.priority||{}),extraFood=food?'<div class="card" style="margin-top:10px"><h4>🍱 Detail Kasus Keracunan Pangan</h4>'+f('Makanan/minuman dikonsumsi','caseFood','text',fc.food||'')+f('Waktu konsumsi','caseConsumedAt','datetime-local',fc.consumedAt||'')+f('Waktu onset','caseOnsetTime','datetime-local',fc.onsetAt||'')+f('Masa inkubasi (jam)','caseIncubation','number',fc.incubationHours??'')+f('Gejala utama','caseSymptoms','text',fc.symptoms||'')+f('Sumber pangan','caseFoodSource','text',fc.foodSource||'')+f('Dirawat inap?','caseHospitalized','select','Tidak|Ya')+f('Spesimen klinis','caseClinicalSpecimen','text',fc.clinicalSpecimen||'')+'</div>':'',qPanel=questionnaireCasePanel(c);
    modal('<h2>Edit '+esc(c.id)+'</h2>'+f('Nama','en','text',c.name)+f('Umur','ea','number',c.age)+f('Jenis kelamin','es','select','Laki-laki|Perempuan')+f('Onset','eo',food?'datetime-local':'date',c.onset)+f('Status','et','select','Suspek|Probable|Konfirmasi')+f('Outcome','eu','select','Rawat jalan|Dirawat|Sembuh|Meninggal')+addressFields(c)+extraFood+extraPriority+qPanel+'<button class="primary" onclick="upd(\''+esc45(c.id)+'\')">Simpan</button>');
    const s=document.getElementById('es'),t=document.getElementById('et'),u=document.getElementById('eu');if(s)s.value=c.sex||'';if(t)t.value=c.status||'Suspek';if(u)u.value=c.outcome||'';if(food&&document.getElementById('caseHospitalized'))caseHospitalized.value=fc.hospitalized||'Tidak';
  };
  const oldUpd=window.upd;
  window.upd=async function(id){
    const a=collectQ45(); const c=db.cases.find(x=>String(x.id)===String(id));if(!c)return; await oldUpd(id); c.answers=a; coreFromAnswers(c,a); c.disease=act()?.disease||c.disease; save();cases();
  };
  const oldLoad=window.loadDiseaseQuestions;
  window.loadDiseaseQuestions=function(){oldLoad();ensureQuestionIds();save();};
  // Make questionnaire inputs usable as an actual case-entry instrument; retain preview behavior.
  const oldRenderQ=window.renderQ;
  window.renderQ=function(){oldRenderQ();ensureQuestionIds();};
  // Disable obsolete v43 open-access overrides and expose admin panel after login.
  window.enforceAccess=function(){return !!window.GORUT_USER};
  // Semua kategori pengguna memiliki hak akses menu yang sama, termasuk menu Admin.
  window.setRoleUI=function(){document.querySelectorAll('nav button').forEach(b=>{b.style.display='block'});const sec=document.getElementById('admin');if(sec)sec.style.display='block'};
  const oldLogout=window.logout;window.logout=v45Logout;
  const oldV29Logout=window.v29Logout;window.v29Logout=v45Logout;
  const oldSubmit=window.submitRegistration;window.submitRegistration=window.v45Register;
  const oldShow=window.showRegister;window.showRegister=window.v45ShowRegister;
  const oldClose=window.closeRegister;window.closeRegister=window.v45CloseRegister;
  const oldRender=window.render;
  window.render=async function(){
    if(!window.GORUT_USER)return;
    const r=await oldRender.apply(this,arguments);try{renderV45Admin();runQuestionnaireAudit();}catch(e){}return r;
  };
  // Install once DOM is ready; restore current-session login if a session exists.
  function start45(){
    // Bersihkan state akses lama v27-v43 agar tidak ada sisa pembayaran/subscription/expiry yang dipakai.
    ['gorut-registrations','gorut-access','gorut-subscription','gorut-payment'].forEach(k=>localStorage.removeItem(k));
    // Kebijakan v57: setiap pembukaan/refresh aplikasi WAJIB kembali ke halaman login.
    // Session lama tidak dipakai untuk auto-login.
    localStorage.removeItem(SESSION_KEY);
    window.GORUT_USER=null; GORUT_USER=null;
    const app=document.getElementById('app');if(app)app.style.display='none';
    const l=document.getElementById('login');if(l)l.style.display='grid';
    installLogin();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start45);else setTimeout(start45,20);
})();

/* ==================== v44 Epidemiological Command Center ==================== */
(function(){
  function esc44(v){return String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));}
  function diseaseName44(id){return diseases?.[id]?.name||id||'Tidak teridentifikasi'}
  function activeDisease44(c){
    return c?.disease || db.investigations?.find(i=>String(i.id)===String(c?.investigationId))?.disease || 'tidak-teridentifikasi';
  }
  function days44(n){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d}
  function validDate44(v){const d=new Date(v);return Number.isNaN(d.getTime())?null:d}
  function calc44(){
    const cases=Array.isArray(db.cases)?db.cases:[], inv=Array.isArray(db.investigations)?db.investigations:[], alerts=Array.isArray(db.alerts)?db.alerts:[], specs=Array.isArray(db.specimens)?db.specimens:[], contacts=Array.isArray(db.contacts)?db.contacts:[], visits=Array.isArray(db.fieldVisits)?db.fieldVisits:[];
    const onset=cases.map(c=>validDate44(c.onset)).filter(Boolean);
    const recentStart=days44(6), prevStart=days44(13), recent=onset.filter(d=>d>=recentStart).length, prev=onset.filter(d=>d>=prevStart&&d<recentStart).length;
    const trend=prev?Math.round((recent-prev)/prev*100):recent?100:0;
    const deaths=cases.filter(c=>/meninggal/i.test(c.outcome||'')).length;
    const pendingSpecs=specs.filter(s=>/pending|menunggu|belum/i.test(String(s.status||''))).length;
    const openInv=inv.filter(x=>!/(selesai|closed|ditutup)/i.test(String(x.status||''))).length;
    const unresolvedAlerts=alerts.filter(a=>/belum|perlu|pending|open|baru/i.test(String(a.result||a.status||''))).length;
    const missingAddress=cases.filter(c=>!String(c.address||'').trim()).length;
    const missingOnset=cases.filter(c=>!String(c.onset||'').trim()).length;
    const missingGeo=cases.filter(c=>!Number.isFinite(Number(c.lat))||!Number.isFinite(Number(c.lng))).length;
    const missingStatus=cases.filter(c=>!String(c.status||'').trim()).length;
    const completeness=cases.length?Math.round(100*(1-(missingAddress+missingOnset+missingGeo+missingStatus)/(cases.length*4))):100;
    const byDisease={};cases.forEach(c=>{const id=activeDisease44(c);byDisease[id]??={n:0,death:0,last:null};byDisease[id].n++;if(/meninggal/i.test(c.outcome||''))byDisease[id].death++;const d=validDate44(c.onset);if(d&&(!byDisease[id].last||d>byDisease[id].last))byDisease[id].last=d});
    const priority=Object.entries(byDisease).map(([id,x])=>{let score=Math.min(6,x.n)+Math.min(4,x.death*2)+(x.last&&x.last>=recentStart?2:0);let level=score>=9?'TINGGI':score>=5?'PERHATIAN':'RENDAH';return{id,x,score,level,name:diseaseName44(id)}}).sort((a,b)=>b.score-a.score);
    const actions=[];
    if(unresolvedAlerts)actions.push({level:'TINGGI',text:`${unresolvedAlerts} alert masih memerlukan verifikasi.`,go:'alerts'});
    if(openInv)actions.push({level:'TINGGI',text:`${openInv} investigasi belum ditutup.`,go:'investigasi'});
    if(pendingSpecs)actions.push({level:'PERHATIAN',text:`${pendingSpecs} spesimen berstatus pending/menunggu.`,go:'spesimen'});
    if(missingGeo)actions.push({level:'PERHATIAN',text:`${missingGeo} kasus belum memiliki koordinat lengkap.`,go:'kasus'});
    if(missingAddress)actions.push({level:'PERHATIAN',text:`${missingAddress} kasus belum memiliki alamat lengkap.`,go:'kasus'});
    if(completeness<80)actions.push({level:'PERHATIAN',text:`Kelengkapan data kasus baru ${completeness}%.`,go:'kasus'});
    if(!actions.length)actions.push({level:'RENDAH',text:'Tidak ada kesenjangan prioritas yang terdeteksi dari data lokal saat ini.',go:'dashboard'});
    const daily=[];for(let i=13;i>=0;i--){const day=days44(i);const key=day.toISOString().slice(0,10);daily.push({key,n:onset.filter(d=>d.toISOString().slice(0,10)===key).length});}
    return{cases,inv,alerts,specs,contacts,visits,recent,prev,trend,deaths,pendingSpecs,openInv,unresolvedAlerts,missingAddress,missingOnset,missingGeo,missingStatus,completeness,priority,actions,daily};
  }
  function card44(label,value,sub){return `<div class="stat"><small>${esc44(label)}</small><b>${esc44(value)}</b><span class="small">${esc44(sub||'')}</span></div>`}
  function render44(){
    const sec=document.getElementById('dashboard');if(!sec)return;
    let el=document.getElementById('v44CommandCard');if(!el){el=document.createElement('div');el.id='v44CommandCard';el.className='card';const old=document.getElementById('v43CommandCard');if(old)old.remove();const anchor=document.getElementById('stats');if(anchor)anchor.parentNode.insertBefore(el,anchor.nextSibling);else sec.prepend(el);}
    const a=calc44();
    const trendLabel=a.trend>0?`Naik ${a.trend}% vs 7 hari sebelumnya`:a.trend<0?`Turun ${Math.abs(a.trend)}% vs 7 hari sebelumnya`:'Stabil/tidak ada pembanding';
    const max=Math.max(1,...a.daily.map(x=>x.n));
    const chart=a.daily.map(x=>`<div class="mini-bar-col"><span class="mini-count">${x.n}</span><div class="mini-bar" style="height:${Math.max(4,Math.round(x.n/max*140))}px"></div><span class="mini-label">${x.key.slice(5)}</span></div>`).join('');
    const top=a.priority.slice(0,8).map(r=>`<tr><td><b>${esc44(r.name)}</b></td><td>${r.x.n}</td><td>${r.x.death}</td><td>${r.score}</td><td><span class="badge">${r.level}</span></td><td>${esc44(r.x.last?`Onset terakhir ${r.x.last.toISOString().slice(0,10)}`:'Tanggal onset belum tersedia')}</td></tr>`).join('');
    const acts=a.actions.map(x=>`<div class="readiness-item ${x.level==='TINGGI'?'risk-high':x.level==='PERHATIAN'?'risk-medium':'risk-low'}"><b>${esc44(x.level)}</b><span>${esc44(x.text)}</span><br><button class="btn-ghost" style="margin-top:7px" onclick="page('${esc44(x.go)}')">Buka modul</button></div>`).join('');
    el.innerHTML=`<div class="card command-hero" style="margin:-17px -17px 16px;border-radius:16px 16px 0 0"><div><div class="eyebrow">V44 · EPIDEMIOLOGICAL COMMAND CENTER</div><h2 style="margin:5px 0">🎯 Pusat Komando Epidemiologi</h2><p style="margin:4px 0">Satu panel untuk memprioritaskan alert, investigasi, kasus, laboratorium, GIS dan kualitas data.</p></div><div><button class="primary" id="v44Refresh">🔄 Perbarui</button></div></div>
      <div class="grid command-stats">${card44('Kasus',a.cases.length,'seluruh investigasi lokal')}${card44('7 hari terakhir',a.recent,trendLabel)}${card44('Meninggal',a.deaths,'berdasarkan outcome kasus')}${card44('Kelengkapan data',a.completeness+'%','alamat, onset, koordinat, status')}</div>
      <div class="grid2"><div class="card"><h3>⏱️ Tren 14 Hari</h3><div class="command-mini-chart">${chart}</div><div class="small">Kurva menggunakan tanggal onset yang valid; kasus tanpa onset tidak masuk grafik.</div></div>
      <div class="card"><h3>🧭 Kesiapan Respons</h3><div class="readiness-list">${card44('Investigasi terbuka',a.openInv,'perlu tindak lanjut/penutupan')}${card44('Alert terbuka',a.unresolvedAlerts,'perlu verifikasi')}${card44('Spesimen pending',a.pendingSpecs,'status belum selesai')}${card44('Tanpa koordinat',a.missingGeo,'perlu geolokasi/RBI')}</div></div></div>
      <div class="card"><h3>🚨 Antrean Tindakan</h3><div class="readiness-list">${acts}</div></div>
      <div class="card"><h3>🦠 Ranking Sinyal Penyakit</h3>${top?`<table><thead><tr><th>Penyakit</th><th>Kasus</th><th>Meninggal</th><th>Skor</th><th>Prioritas</th><th>Recency</th></tr></thead><tbody>${top}</tbody></table>`:'<div class="notice">Belum ada kasus.</div>'}<div class="notice">Skor ini adalah sinyal pendukung untuk prioritas verifikasi, bukan diagnosis, penetapan KLB, sumber penularan, atau prediksi tervalidasi.</div></div>`;
    document.getElementById('v44Refresh').onclick=render44;
  }
  const renderBase=window.render;
  window.render=async function(){const r=await renderBase.apply(this,arguments);render44();return r};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(render44,80));else setTimeout(render44,80);
})();

/* ============================================================
   GORUT-OUTBREAK AI v46 — RISK FACTORS + FIELD/CONTACT DASHBOARDS
   ============================================================ */
(function(){
  'use strict';
  const e46=x=>String(x??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const positive=/^(ya|ada|positif|pernah|lengkap|tidak menggunakan|tidak diolah|terpapar|kontak|sering|tinggi|buruk|tidak lengkap|tidak aman|sakit|tinggal serumah|menyembelih|membersihkan|konsumsi|mengolah|pasar unggas hidup)$/i;
  const negative=/^(tidak|tidak ada|negatif|tidak diketahui|belum diketahui|belum|tidak relevan|tidak dinilai|bukan kasus|discarded|tidak pernah)$/i;
  function deriveRiskFactors(c){
    const answers=c?.answers||{}; const qs=db.questions||[]; const out=[];
    qs.forEach(q=>{
      const v=answers[q.id]; if(v===undefined||v===null||String(v).trim()==='')return;
      const label=String(q.label||'').trim(), val=String(v).trim(); const l=label.toLowerCase();
      const riskWords=/(paparan|riwayat kontak|kontak|perjalanan|aktivitas malam|bermalam|kelambu|repellent|rumah|hunian|kepadatan|air|sanitasi|jamban|makanan|minuman|higiene|penjamah|penyimpanan|unggas|hewan|tikus|banjir|genangan|tanah|pasar|pekerjaan berisiko|imunisasi|vaksinasi|perawatan tali pusat|tempat perindukan|jentik|psn|asap|polusi|daycare|sekolah|tempat kerja|produk hewan|penyembelihan|luka|sumber paparan|paparan bersama)/i.test(l);
      if(!riskWords)return;
      if(negative.test(val))return;
      if(/^(status kasus|outcome|hasil laboratorium|spesimen|tanggal|umur|jenis kelamin|nama|alamat|provinsi|kabupaten|kecamatan|desa|latitude|longitude|demam|batuk|pilek|ruam|mual|muntah|diare|nyeri|sakit|gejala|tanda|hasil pemeriksaan)/i.test(l))return;
      if(/(penggunaan kelambu|penggunaan repellent|psn|vaksinasi|imunisasi|cuci luka|perawatan luka)/i.test(l) && /^(ya|lengkap|dilakukan|ada|menggunakan|sudah)/i.test(val))return;
      if(/(higiene|sanitasi|air|kondisi rumah|penyimpanan|perawatan tali pusat)/i.test(l) && /^(baik|aman|bersih|sesuai|terlindungi|dilakukan dengan baik)/i.test(val))return;
      out.push({question:label,answer:val});
    });
    const seen=new Set(); return out.filter(x=>{const k=x.question+'|'+x.answer;if(seen.has(k))return false;seen.add(k);return true;});
  }
  function applyRisk(c){if(!c)return c;c.riskFactors=deriveRiskFactors(c);return c}
  function riskText(c){const r=Array.isArray(c?.riskFactors)?c.riskFactors:deriveRiskFactors(c);return r.length?r.map(x=>`${e46(x.question)}: <b>${e46(x.answer)}</b>`).join('<br>'):'<span class="small">Belum ada faktor risiko teridentifikasi dari jawaban kuesioner.</span>'}
  window.deriveRiskFactorsV46=deriveRiskFactors;

  const oldSave=window.saveCase;
  window.saveCase=async function(){await oldSave.apply(this,arguments);const c=db.cases[db.cases.length-1];if(c){applyRisk(c);save();}cases();};
  const oldUpd=window.upd;
  window.upd=async function(id){await oldUpd.apply(this,arguments);const c=db.cases.find(x=>String(x.id)===String(id));if(c){applyRisk(c);save();}cases();};
  const oldCases=window.cases;
  window.cases=function(){oldCases.apply(this,arguments);const rows=document.getElementById('caseRows');if(!rows)return;rows.querySelectorAll('tr').forEach((tr,i)=>{const id=tr.cells?.[0]?.textContent?.trim();const c=db.cases.find(x=>String(x.id)===id);if(!c)return;applyRisk(c);if(tr.cells.length>=8){const td=document.createElement('td');td.innerHTML=riskText(c);tr.insertBefore(td,tr.cells[7]||null);}});};

  function fieldCaseOptions(){const inv=db.active;const cs=(db.cases||[]).filter(c=>String(c.investigationId)===String(inv));const el=document.getElementById('fieldCase');if(!el)return;const cur=el.value;el.innerHTML='<option value="">— Tidak terkait kasus tertentu —</option>'+cs.map(c=>`<option value="${e46(c.id)}">${e46(c.id)} — ${e46(c.name||'Tanpa nama')}</option>`).join('');if(cur)el.value=cur;}
  function fieldContactOptions(){const inv=db.active;const cs=(db.contacts||[]).filter(c=>String(c.investigationId)===String(inv));const el=document.getElementById('fieldContact');if(!el)return;const cur=el.value;el.innerHTML='<option value="">— Tidak terkait kontak tertentu —</option>'+cs.map(c=>`<option value="${e46(c.id)}">${e46(c.id)} — ${e46(c.name||'Tanpa nama')}</option>`).join('');if(cur)el.value=cur;}
  function renderFieldDashboard(){
    const m=document.getElementById('fieldMetrics'),a=document.getElementById('fieldActions');if(!m||!a)return;const inv=db.active;const visits=(db.fieldVisits||[]).filter(x=>String(x.investigationId)===String(inv));const cases=(db.cases||[]).filter(x=>String(x.investigationId)===String(inv));const contacts=(db.contacts||[]).filter(x=>String(x.investigationId)===String(inv));
    const linked=visits.filter(x=>x.caseId||x.contactId).length,gps=visits.filter(x=>x.lat&&x.lng).length,findings=visits.filter(x=>String(x.finding||'').trim()).length,pending=visits.filter(x=>x.syncStatus!=='synced').length;
    m.innerHTML=[['Kunjungan',visits.length],['Terhubung kasus/kontak',linked],['GPS tersedia',`${gps}/${visits.length}`],['Temuan tercatat',`${findings}/${visits.length}`],['Menunggu sinkronisasi',pending],['Kasus investigasi',cases.length]].map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');
    const acts=[];if(!visits.length)acts.push('<div class="notice">Belum ada kunjungan. Dashboard Lapangan digunakan untuk mendokumentasikan verifikasi kasus, wawancara kontak, verifikasi lokasi, pengambilan spesimen, dan survei lingkungan.</div>');
    if(visits.length&&linked<visits.length)acts.push(`<div class="notice">${visits.length-linked} kunjungan belum dihubungkan dengan kasus/kontak. Hubungkan bila kegiatan lapangan memang terkait record tertentu agar jejak investigasi lebih kuat.</div>`);
    if(visits.length&&gps<visits.length)acts.push(`<div class="notice">${visits.length-gps} kunjungan belum memiliki GPS. Koordinat membantu integrasi GIS/RBI dan verifikasi lokasi.</div>`);
    if(visits.length&&findings<visits.length)acts.push(`<div class="notice">${visits.length-findings} kunjungan belum memiliki temuan utama. Lengkapi agar dapat dirangkum dalam laporan PE/KLB.</div>`);
    if(pending)acts.push(`<div class="notice">${pending} record lapangan berstatus lokal/pending. Saat backend tersedia, record diarahkan ke antrean sinkronisasi.</div>`);
    a.innerHTML=acts.join('');
  }
  const oldField=window.fieldVisits;
  window.fieldVisits=function(){oldField.apply(this,arguments);fieldCaseOptions();fieldContactOptions();renderFieldDashboard();};
  const oldFieldSave=window.saveFieldVisit;
  window.saveFieldVisit=async function(){
    const before=(db.fieldVisits||[]).length;await oldFieldSave.apply(this,arguments);const v=db.fieldVisits?.[before];if(v){v.caseId=val('fieldCase');v.contactId=val('fieldContact');if(v.caseId){const c=db.cases.find(x=>String(x.id)===String(v.caseId));if(c)v.caseName=c.name||'';}if(v.contactId){const c=db.contacts.find(x=>String(x.id)===String(v.contactId));if(c)v.contactName=c.name||'';}save();}fieldCaseOptions();fieldContactOptions();renderFieldDashboard();};

  function renderContactDashboard(){
    const m=document.getElementById('contactMetrics'),a=document.getElementById('contactActions');if(!m||!a)return;const inv=db.active;const cs=(db.contacts||[]).filter(x=>String(x.investigationId)===String(inv));const cases=(db.cases||[]).filter(x=>String(x.investigationId)===String(inv));
    const monitored=cs.filter(x=>/dipantau|aktif|monitor/i.test(String(x.status||''))).length,sick=cs.filter(x=>/sakit|positif|suspek|probable|konfirmasi/i.test(String(x.status||''))).length,closed=cs.filter(x=>/selesai/i.test(String(x.status||''))).length,unreachable=cs.filter(x=>/tidak dapat dihubungi/i.test(String(x.status||''))).length,linked=cs.filter(x=>x.caseId).length;
    m.innerHTML=[['Total kontak',cs.length],['Sedang dipantau',monitored],['Sakit/perlu evaluasi',sick],['Selesai',closed],['Tidak dapat dihubungi',unreachable],['Terhubung kasus indeks',`${linked}/${cs.length}`]].map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');
    const actions=[];if(!cs.length)actions.push('<div class="notice">Belum ada kontak. Tambahkan kontak dari kasus indeks untuk membangun contact tracing.</div>');
    if(cs.length&&unreachable)actions.push(`<div class="notice">Ada ${unreachable} kontak yang tidak dapat dihubungi. Prioritaskan kunjungan lapangan/penelusuran ulang.</div>`);
    if(cs.length&&sick)actions.push(`<div class="notice">Ada ${sick} kontak dengan status sakit/indikasi evaluasi. Hubungkan dengan kasus bila sudah menjadi kasus dan pertimbangkan pembuatan record kasus baru.</div>`);
    if(cs.length&&linked<cs.length)actions.push(`<div class="notice">${cs.length-linked} kontak belum terhubung ke kasus indeks. Pastikan relasi kasus-kontak benar untuk rantai penularan.</div>`);    actions.push(`<div class="small">Integrasi: kontak → kasus indeks → rantai penularan → analisis → laporan PE/KLB. Kunjungan lapangan dapat ditautkan kembali ke kontak melalui field <b>Terhubung dengan kontak</b>.</div>`);
    a.innerHTML=actions.join('');
  }
  const oldContacts=window.contacts;
  window.contacts=function(){oldContacts.apply(this,arguments);renderContactDashboard();};
  const oldAddContact=window.addContact;
  window.addContact=function(){oldAddContact.apply(this,arguments);};
  const oldSaveContact=window.saveContact;
  window.saveContact=function(){oldSaveContact.apply(this,arguments);renderContactDashboard();};

  const oldRender=window.render;
  window.render=async function(){const r=await oldRender.apply(this,arguments);try{fieldCaseOptions();fieldContactOptions();renderFieldDashboard();renderContactDashboard();}catch(e){console.warn('v46 dashboard',e)}return r;};

  // Upgrade the case table header to explicitly expose risk factors.
  const ct=document.querySelector('#kasus table thead');
  if(ct && !ct.querySelector('.v46-risk-head')){const th=document.createElement('th');th.className='v46-risk-head';th.textContent='Faktor Risiko (dari kuesioner)';ct.querySelector('tr')?.insertBefore(th,ct.querySelector('tr').lastElementChild);}
})();
/* v46 — Case risk-factor integration + Field Response Dashboard + Contact Dashboard */
(function(){
  const esc46=v=>String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const norm46=v=>String(v??'').trim();
  const positive46=v=>{const s=norm46(v).toLowerCase();return s&&!/^(tidak|tidak ada|tidak diketahui|tidak relevan|negatif|bukan|belum|tidak diambil|tidak dilakukan|tidak lengkap)$/.test(s)};
  function qAnswers46(c){return c?.answers||{}}
  function findAnswer46(c,patterns){
    const a=qAnswers46(c), qs=db.questions||[];
    for(const q of qs){
      const label=String(q.label||'').toLowerCase();
      if(patterns.some(p=>p.test(label))){const v=a[q.id]??a[q.label];if(norm46(v))return v}
    }
    return '';
  }
  function deriveRiskFactors46(c){
    const a=qAnswers46(c), qs=db.questions||[], out=[];
    const risk=/riwayat|paparan|kontak|perjalanan|aktivitas|bermalam|menggunakan|penggunaan|konsumsi|makanan|minuman|sumber air|sanitasi|higiene|lingkungan|kepadatan|hunian|jentik|tempat perindukan|unggas|hewan|tikus|banjir|genangan|pekerjaan|sekolah|daycare|pasar|fasilitas kesehatan|imunisasi|kelambu|repellent|penjamah|penyimpanan|isolasi|karantina|perawatan luka|gigitan|penyembelihan|produk hewan|air\/tanah|darah\/cairan|obat/i;
    const symptom=/^demam$|^batuk$|^pilek$|^ruam$|mual|muntah|diare|nyeri|sakit kepala|sesak|gejala|tanda bahaya|pseudomembran|perdarahan|kejang|kaku|saturasi|trombosit|hematokrit/i;
    qs.forEach(q=>{const v=a[q.id]??a[q.label];if(!norm46(v)||!risk.test(String(q.label))||symptom.test(String(q.label)))return;if(positive46(v))out.push({id:q.id,label:q.label,value:v,category:q.cat||'Faktor risiko'});});
    const seen=new Set();return out.filter(x=>{const k=x.label+'|'+x.value;if(seen.has(k))return false;seen.add(k);return true});
  }
  function syncCoreRisk46(c){
    const a=qAnswers46(c);
    const get=(patterns)=>findAnswer46(c,patterns);
    const id=get([/^id( kasus)?$/i]); if(id)c.id=id;
    const name=get([/^nama( lengkap)?$/i]); if(name)c.name=name;
    const age=get([/^umur$/i]); if(age)c.age=Number(age)||c.age||0;
    const sex=get([/^jenis kelamin$/i]); if(sex)c.sex=sex;
    const onset=get([/^tanggal onset/i,/^tanggal pertama.*gejala/i,/^tanggal onset demam/i]); if(onset)c.onset=onset;
    const status=get([/^status kasus$/i,/^klasifikasi kasus$/i,/^klasifikasi akhir/i,/^status kesehatan/i]); if(status)c.status=status;
    const outcome=get([/^outcome$/i,/^keadaan akhir$/i,/^status kesehatan$/i]); if(outcome)c.outcome=outcome;
    const address=get([/^alamat lengkap/i]); if(address)c.address=address;
    const prov=get([/^provinsi$/i]); if(prov)c.prov=prov;
    const kab=get([/^kabupaten(\/kota)?$/i,/^kabupaten$/i]); if(kab)c.kab=kab;
    const kec=get([/^kecamatan$/i]); if(kec)c.kec=kec;
    const desa=get([/^desa(\/kelurahan)?$/i,/^desa$/i,/^kelurahan$/i]); if(desa)c.desa=desa;
    const lat=get([/^latitude$/i]); if(norm46(lat)&&Number.isFinite(Number(lat)))c.lat=Number(lat);
    const lng=get([/^longitude$/i]); if(norm46(lng)&&Number.isFinite(Number(lng)))c.lng=Number(lng);
    c.riskFactors=deriveRiskFactors46(c);
    c.riskFactorText=c.riskFactors.map(x=>`${x.label}: ${x.value}`).join('; ');
    c.questionnaireSummary={status:c.status||'',riskFactors:c.riskFactors,updatedAt:new Date().toISOString()};
    return c;
  }
  window.deriveRiskFactors46=deriveRiskFactors46; window.syncCoreRisk46=syncCoreRisk46;

  function injectCaseRiskSummary46(){
    const oldCases=window.cases;
    window.cases=function(){
      if(typeof oldCases==='function')oldCases();
      const rows=document.getElementById('caseRows'); if(!rows)return;
      const table=rows.closest('table');if(!table)return;
      const hs=table.querySelectorAll('thead th');
      if(hs.length>=9){hs[7].textContent='Status Kasus';hs[8].textContent='Faktor Risiko';hs[9]&&(hs[9].textContent='Outcome');}
      const q=(val('caseSearch')||'').toLowerCase();
      const arr=(db.cases||[]).filter(c=>(!db.active||String(c.investigationId)===String(db.active))&&(!q||`${c.id} ${c.name} ${c.riskFactorText||''}`.toLowerCase().includes(q)));
      if(!arr.length){rows.innerHTML='<tr><td colspan="11">Belum ada kasus.</td></tr>';return;}
      rows.innerHTML=arr.map(c=>{
        const rf=(c.riskFactors||[]).slice(0,4).map(x=>`${x.label}: ${x.value}`).join(' · ');
        return `<tr><td>${esc46(c.id)}</td><td>${esc46(c.name)}</td><td>${esc46(c.address||'-')}</td><td>${esc46(c.desa||c.admin?.desa||'-')}</td><td>${esc46(c.kec||c.admin?.kec||'-')}</td><td>${esc46(c.age)}</td><td>${esc46(c.sex)}</td><td><span class="badge">${esc46(c.status||'-')}</span></td><td title="${esc46(c.riskFactorText||'Belum ada faktor risiko teridentifikasi dari jawaban kuesioner')}">${esc46(rf||'-')}</td><td>${esc46(c.outcome||'-')}</td><td><button onclick="editCase('${esc46(c.id)}')">Edit</button> <button class="danger" data-v30-delete onclick="deleteRecord('cases','${esc46(c.id)}')">Hapus</button></td></tr>`;
      }).join('');
    };
  }

  function enhanceCaseForms46(){
    const oldAdd=window.addCase;
    if(typeof oldAdd==='function'){
      window.addCase=function(){oldAdd();setTimeout(()=>{const m=document.querySelector('#modal .modal-body')||document.querySelector('#modal');if(!m)return;const q=m.querySelector('[id^="v45q_"]');if(!q)return;const box=document.createElement('div');box.className='notice';box.id='v46RiskHint';box.innerHTML='<b>🔎 Faktor Risiko:</b> akan dihitung otomatis dari jawaban paparan/riwayat/kontak/lingkungan pada kuesioner saat disimpan.';const first=m.querySelector('.card');if(first)first.before(box);},20)};
    }
    const oldSave=window.saveCase;
    if(typeof oldSave==='function')window.saveCase=async function(){await oldSave();const c=db.cases[db.cases.length-1];if(c){syncCoreRisk46(c);queueSync&&queueSync('cases');save();}try{cases()}catch(e){}};
    const oldUpd=window.upd;
    if(typeof oldUpd==='function')window.upd=async function(id){await oldUpd(id);const c=db.cases.find(x=>String(x.id)===String(id));if(c){syncCoreRisk46(c);save();}try{cases()}catch(e){}};
  }

  function fieldOptions46(){
    const inv=db.investigations||[], cs=(db.cases||[]).filter(c=>!db.active||String(c.investigationId)===String(db.active)), ct=(db.contacts||[]).filter(c=>!db.active||String(c.investigationId)===String(db.active));
    return {inv,cs,ct};
  }
  function injectFieldControls46(){
    const grid=document.querySelector('#lapangan .grid2');if(!grid||document.getElementById('fieldCaseId'))return;
    const mk=(html)=>{const d=document.createElement('div');d.innerHTML=html;return d.firstElementChild};
    const {cs,ct}=fieldOptions46();
    const caseDiv=mk(`<div class="field"><label>Kasus terkait</label><select id="fieldCaseId"><option value="">Tidak terkait langsung</option>${cs.map(c=>`<option value="${esc46(c.id)}">${esc46(c.id)} — ${esc46(c.name||'-')}</option>`).join('')}</select></div>`);
    const contactDiv=mk(`<div class="field"><label>Kontak terkait</label><select id="fieldContactId"><option value="">Tidak terkait langsung</option>${ct.map(c=>`<option value="${esc46(c.id)}">${esc46(c.id)} — ${esc46(c.name||'-')}</option>`).join('')}</select></div>`);
    const statusDiv=mk(`<div class="field"><label>Status hasil kunjungan</label><select id="fieldVisitStatus"><option>Terencana</option><option>Selesai</option><option>Perlu tindak lanjut</option><option>Subjek tidak ditemukan</option><option>Dirujuk</option><option>Darurat</option></select></div>`);
    const followDiv=mk(`<div class="field"><label>Tindak lanjut / tanggal berikutnya</label><input id="fieldFollowUp" type="text" placeholder="Contoh: kunjungan ulang 7 Oktober 2026"></div>`);
    const idx=grid.children[2]; grid.insertBefore(caseDiv,idx);grid.insertBefore(contactDiv,idx);grid.insertBefore(statusDiv,idx);grid.insertBefore(followDiv,idx);
  }
  function renderFieldDashboard46(){
    const sec=document.getElementById('lapangan');if(!sec)return;let box=document.getElementById('v46FieldDashboard');if(!box){box=document.createElement('div');box.id='v46FieldDashboard';box.className='card';sec.insertBefore(box,sec.firstElementChild)}
    const inv=db.active, visits=(db.fieldVisits||[]).filter(v=>!inv||String(v.investigationId)===String(inv)), today=new Date().toISOString().slice(0,10);
    const todayN=visits.filter(v=>String(v.date||'').slice(0,10)===today).length, pending=visits.filter(v=>/perlu|terencana|pending/i.test(v.visitStatus||v.syncStatus||'')).length, gps=visits.filter(v=>Number.isFinite(Number(v.lat))&&Number.isFinite(Number(v.lng))).length, linked=visits.filter(v=>v.caseId||v.contactId).length;
    const recent=visits.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,8);
    box.innerHTML=`<div class="toolbar" style="justify-content:space-between"><div><div class="eyebrow">FIELD RESPONSE WORKSPACE · V46</div><h2 style="margin:3px 0">📱 Dashboard Lapangan</h2><div class="small">Pusat pencatatan kunjungan, verifikasi kasus/kontak, GPS, temuan, tindakan, dan tindak lanjut. Data kunjungan tetap terhubung ke investigasi aktif.</div></div><button class="primary" onclick="page('lapangan')">+ Kunjungan</button></div><div class="grid">${stat46('Kunjungan',visits.length,'investigasi aktif')}${stat46('Hari ini',todayN,'kunjungan hari ini')}${stat46('Perlu tindak lanjut',pending,'terencana/pending')}${stat46('Dengan GPS',gps,'cakupan lokasi')}${stat46('Terkait kasus/kontak',linked,'integrasi investigasi')}</div><div class="notice"><b>Fungsi operasional:</b> setiap kunjungan dapat ditautkan ke kasus atau kontak, menyimpan temuan/tindakan, koordinat, foto, dan status tindak lanjut. Data ini menjadi bukti kegiatan PE lapangan dan dapat ditampilkan pada GIS/laporan.</div><table><thead><tr><th>Waktu</th><th>Aktivitas</th><th>Subjek</th><th>Kasus/Kontak</th><th>Status</th><th>GPS</th></tr></thead><tbody>${recent.map(v=>`<tr><td>${esc46(v.date||'-')}</td><td>${esc46(v.activity||'-')}</td><td>${esc46(v.subject||'-')}</td><td>${esc46(v.caseId||v.contactId||'-')}</td><td><span class="badge">${esc46(v.visitStatus||v.syncStatus||'-')}</span></td><td>${v.lat&&v.lng?'✓':'-'}</td></tr>`).join('')||'<tr><td colspan="6">Belum ada kunjungan.</td></tr>'}</tbody></table>`;
  }
  function stat46(l,v,s){return `<div class="stat"><small>${esc46(l)}</small><b>${esc46(v)}</b><span class="small">${esc46(s)}</span></div>`}
  const oldSaveFV=window.saveFieldVisit;
  window.saveFieldVisit=async function(){
    const inv=val('fieldInv')||db.active;if(!inv)return alert('Buat/pilih investigasi terlebih dahulu.');
    const photo=typeof readPhoto==='function'?await readPhoto():null;
    const o={id:'FV'+Date.now(),investigationId:inv,activity:val('fieldActivity'),subject:val('fieldSubject'),caseId:val('fieldCaseId')||'',contactId:val('fieldContactId')||'',date:val('fieldDate')||new Date().toISOString().slice(0,16),officer:val('fieldOfficer'),lat:val('fieldLat'),lng:val('fieldLng'),location:val('fieldLocation'),finding:val('fieldFinding'),action:val('fieldAction'),visitStatus:val('fieldVisitStatus')||'Selesai',followUp:val('fieldFollowUp')||'',photo:photo,syncStatus:'pending',createdAt:new Date().toISOString()};
    db.fieldVisits=db.fieldVisits||[];db.fieldVisits.push(o);if(typeof queueSync==='function')queueSync('field_visits');save();fieldVisits();renderFieldDashboard46();clearFieldForm();alert('Kunjungan lapangan tersimpan dan terhubung dengan investigasi.');
  };

  function contactData46(){return (db.contacts||[]).filter(c=>!db.active||String(c.investigationId)===String(db.active));}
  function renderContacts46(){
    const rows=document.getElementById('contactRows');if(!rows)return;const q=(val('contactSearch')||'').toLowerCase(), cs=contactData46().filter(c=>!q||`${c.id} ${c.name} ${c.caseId} ${c.phone||''} ${c.address||''}`.toLowerCase().includes(q));
    const table=rows.closest('table');if(table){const th=table.querySelectorAll('thead th');if(th.length>=8){th[3].textContent='Hubungan/Paparan';th[4].textContent='Kontak terakhir';th[5].textContent='Status';th[6].textContent='Tindak lanjut';}}
    rows.innerHTML=cs.map(c=>`<tr><td>${esc46(c.id)}</td><td>${esc46(c.caseId||c.linkedCaseId||'-')}</td><td><b>${esc46(c.name)}</b><br><small>${esc46(c.phone||'')}</small></td><td>${esc46(c.relation||'-')}<br><small>${esc46(c.exposureType||'')}</small></td><td>${esc46(c.last||'-')}</td><td><span class="badge">${esc46(c.status||'-')}</span><br><small>${esc46(c.symptoms||'')}</small></td><td>${esc46(c.follow||'-')}<br><small>${esc46(c.nextFollowUp||'')}</small></td><td><button onclick="editContact46('${esc46(c.id)}')">Edit</button> <button class="danger" onclick="deleteContact('${esc46(c.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="8">Belum ada kontak.</td></tr>';
    renderContactDashboard46();
  }
  function renderContactDashboard46(){
    const sec=document.getElementById('kontak');if(!sec)return;let box=document.getElementById('v46ContactDashboard');if(!box){box=document.createElement('div');box.id='v46ContactDashboard';box.className='card';sec.insertBefore(box,sec.firstElementChild)}
    const cs=contactData46(), monitored=cs.filter(c=>/dipantau|pemantauan/i.test(c.status||'')).length,sick=cs.filter(c=>/sakit/i.test(c.status||'')||c.symptoms).length,unreachable=cs.filter(c=>/tidak dapat|tidak ditemukan/i.test(c.status||'')).length,follow=cs.filter(c=>c.nextFollowUp).length;
    box.innerHTML=`<div class="eyebrow">CONTACT TRACING WORKSPACE · V46</div><h2 style="margin:3px 0">🔗 Dashboard Kontak</h2><div class="small">Memantau setiap kontak dari kasus indeks: siapa kontaknya, paparan, status kesehatan, jadwal follow-up, gejala, dan keterkaitan dengan rantai penularan.</div><div class="grid">${stat46('Total kontak',cs.length,'investigasi aktif')}${stat46('Dipantau',monitored,'pemantauan aktif')}${stat46('Sakit/gejala',sick,'perlu evaluasi sebagai kasus')}${stat46('Tidak terhubung',unreachable,'perlu pencarian ulang')}${stat46('Ada jadwal follow-up',follow,'tindak lanjut tercatat')}</div><div class="notice"><b>Alur integrasi:</b> kasus indeks → kontak → pemantauan → bila sakit/gejala, evaluasi dan dapat dibuat sebagai kasus → hubungan kontak dapat divisualisasikan di <b>Rantai Penularan</b>. Dashboard ini tidak menyatakan bahwa kontak pasti tertular.</div></div>`;
  }
  function addContact46(){
    if(!act())return alert('Pilih investigasi terlebih dahulu.');const cases=(db.cases||[]).filter(c=>String(c.investigationId)===String(db.active));
    modal(`<h2>Tambah Kontak</h2>${f('Kasus indeks','ccase','select',cases.map(c=>c.id).join('|')||'-')}${f('Nama kontak','cname','text','')}${f('Nomor WhatsApp/telepon','cphone','text','')}${f('Alamat kontak','caddress','text','')}${f('Hubungan','crel','select','Serumah|Keluarga|Teman|Teman sekolah|Rekan kerja|Tetangga|Tenaga kesehatan|Lainnya')}${f('Jenis paparan/kontak','cexposure','select','Kontak erat|Serumah|Percikan/respiratori|Makanan/air|Lingkungan|Hewan|Fasilitas kesehatan|Lainnya')}${f('Tanggal kontak terakhir','clast','date','')}${f('Status pemantauan','cstatus','select','Dipantau|Selesai|Sakit|Tidak dapat dihubungi')}${f('Gejala saat pemantauan','csymptoms','text','')}${f('Tanggal onset bila sakit','conset','date','')}${f('Follow-up berikutnya','cnext','date','')}${f('Tindak lanjut','cfollow','text','')}${f('Isolasi/karantina','cisolation','select','Tidak|Ya|Tidak relevan')}${f('Spesimen/rujukan','cspecimen','text','')}${f('Catatan','cnotes','text','')}<button class="primary" onclick="saveContact()">Simpan</button>`);
  }
  const oldAddContact=window.addContact;window.addContact=addContact46;
  window.saveContact=function(){
    db.contacts=db.contacts||[];const id='C'+String(db.contacts.length+1).padStart(3,'0');const c={id,investigationId:db.active,caseId:val('ccase'),name:val('cname'),phone:val('cphone'),address:val('caddress'),relation:val('crel'),exposureType:val('cexposure'),last:val('clast'),status:val('cstatus'),symptoms:val('csymptoms'),onset:val('conset'),nextFollowUp:val('cnext'),follow:val('cfollow'),isolation:val('cisolation'),specimen:val('cspecimen'),notes:val('cnotes'),disease:db.selectedDisease||act()?.disease||'',createdAt:new Date().toISOString()};db.contacts.push(c);save();close();renderContacts46();renderContactDashboard46();};
  window.editContact46=function(id){const c=(db.contacts||[]).find(x=>String(x.id)===String(id));if(!c)return;modal(`<h2>Edit Kontak ${esc46(c.id)}</h2>${f('Kasus indeks','ccase','select',(db.cases||[]).filter(x=>x.investigationId===db.active).map(x=>x.id).join('|')||'-')}${f('Nama kontak','cname','text',c.name)}${f('Nomor WhatsApp/telepon','cphone','text',c.phone||'')}${f('Alamat kontak','caddress','text',c.address||'')}${f('Hubungan','crel','select','Serumah|Keluarga|Teman|Teman sekolah|Rekan kerja|Tetangga|Tenaga kesehatan|Lainnya')}${f('Jenis paparan/kontak','cexposure','select','Kontak erat|Serumah|Percikan/respiratori|Makanan/air|Lingkungan|Hewan|Fasilitas kesehatan|Lainnya')}${f('Tanggal kontak terakhir','clast','date',c.last||'')}${f('Status pemantauan','cstatus','select','Dipantau|Selesai|Sakit|Tidak dapat dihubungi')}${f('Gejala saat pemantauan','csymptoms','text',c.symptoms||'')}${f('Tanggal onset bila sakit','conset','date',c.onset||'')}${f('Follow-up berikutnya','cnext','date',c.nextFollowUp||'')}${f('Tindak lanjut','cfollow','text',c.follow||'')}${f('Isolasi/karantina','cisolation','select','Tidak|Ya|Tidak relevan')}${f('Spesimen/rujukan','cspecimen','text',c.specimen||'')}${f('Catatan','cnotes','text',c.notes||'')}<button class="primary" onclick="updateContact46('${esc46(c.id)}')">Simpan</button>`);setTimeout(()=>{['ccase','crel','cexposure','cstatus','cisolation'].forEach(id=>{const e=document.getElementById(id);if(e)e.value={ccase:c.caseId,crel:c.relation,cexposure:c.exposureType,cstatus:c.status,cisolation:c.isolation}[id]||e.value})},0)};
  window.updateContact46=function(id){const c=(db.contacts||[]).find(x=>String(x.id)===String(id));if(!c)return;Object.assign(c,{caseId:val('ccase'),name:val('cname'),phone:val('cphone'),address:val('caddress'),relation:val('crel'),exposureType:val('cexposure'),last:val('clast'),status:val('cstatus'),symptoms:val('csymptoms'),onset:val('conset'),nextFollowUp:val('cnext'),follow:val('cfollow'),isolation:val('cisolation'),specimen:val('cspecimen'),notes:val('cnotes')});save();close();renderContacts46()};

  // Extend backend metadata without changing the existing database schema.
  if(typeof window.syncNow==='function'){
    const baseSync=window.syncNow;
    window.syncNow=async function(){
      const r=await baseSync();
      try{const sb=await backendClient();const user=(await sb?.auth?.getUser?.())?.data?.user;if(sb&&user){for(const c of (db.contacts||[])){const row={id:uuidFrom(c.id),owner_id:user.id,investigation_id:uuidFrom(c.investigationId),index_case_id:c.caseId?uuidFrom(c.caseId):null,contact_name:c.name||'',relation:c.relation||null,last_contact_date:c.last||null,monitoring_status:c.status||null,follow_up:c.follow||null,metadata:{local_id:c.id,linked_case_id:c.caseId||null,phone:c.phone||null,address:c.address||null,exposure_type:c.exposureType||null,symptoms:c.symptoms||null,onset:c.onset||null,next_follow_up:c.nextFollowUp||null,isolation:c.isolation||null,specimen:c.specimen||null,notes:c.notes||null}};await sb.from('contacts').upsert(row,{onConflict:'id'})}}}catch(e){console.warn('v46 contact metadata sync',e)}return r;
    };
  }

  const oldRender=window.render;
  window.render=async function(){const r=await oldRender.apply(this,arguments);try{injectCaseRiskSummary46();enhanceCaseForms46();injectFieldControls46();renderFieldDashboard46();renderContacts46();}catch(e){console.warn('v46 render',e)}return r};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{injectCaseRiskSummary46();enhanceCaseForms46();injectFieldControls46();renderFieldDashboard46();renderContacts46()},100));
  else setTimeout(()=>{injectCaseRiskSummary46();enhanceCaseForms46();injectFieldControls46();renderFieldDashboard46();renderContacts46()},100);
})();

/* ===================== v47 — DATA PROVENANCE + COMPLETE REPORTING ===================== */
(function(){
  const V='v47';
  function E(id){return document.getElementById(id)}
  function esc47(s){return typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function active47(){return typeof act==='function'?(act()||{}):{}}
  function cases47(){const a=active47();return (db.cases||[]).filter(c=>String(c.investigationId)===String(a.id||db.active))}
  function answers47(c){return c&&c.answers&&typeof c.answers==='object'?c.answers:{}}
  function qRows47(){return typeof db!=='undefined'&&Array.isArray(db.questions)?db.questions:[]}
  function questionLabel47(key){const q=qRows47().find(x=>String(x.id)===String(key)||String(x.key)===String(key)||String(x.name)===String(key));return q?.label||q?.question||key}
  function appRows47(){return cases47().map(c=>{const o={...c};const a=answers47(c);Object.entries(a).forEach(([k,v])=>{if(o[k]===undefined)o[k]=v;o['answers.'+k]=v});o.__source='GORUT-OUTBREAK AI / Data Kasus';o.__caseId=c.id;return o})}

  /* Research must use application-collected cases by default. Imported datasets remain an explicit, separate option. */
  window.researchAppRows=function(){return appRows47()}
  window.researchDataProvenance=function(){
    const rs=researchState||{};const rows=appRows47();
    return {source:rs.dataSource==='dataset'?'Dataset eksternal (dipilih manual)':'Data kasus yang dikumpulkan melalui aplikasi',investigation:active47().name||active47().id||db.active||'-',disease:rs.researchDisease||'',n:rows.length,caseIds:rows.map(r=>r.id||r.__caseId).filter(Boolean)}
  }

  /* Replace the legacy fallback so statistical routines consume app data unless the researcher explicitly selects external data. */
  window.researchCases=function(){
    const rs=researchState||{};
    if(rs.dataSource==='dataset' && typeof researchDatasetRows==='function' && researchDatasetRows().length) return researchDatasetRows();
    return appRows47();
  };

  function forceResearchSource(){
    const s=E('researchDataSource');
    if(s){
      const cur=s.value||researchState?.dataSource;
      s.innerHTML='<option value="cases">Data kasus dari aplikasi (utama)</option><option value="dataset">Dataset eksternal (opsional)</option>';
      s.value=cur==='dataset'?'dataset':'cases';
    }
    if(researchState) researchState.dataSource=s?.value||'cases';
    const box=E('researchDataStatus');
    if(box){const p=window.researchDataProvenance();box.innerHTML=`<b>Sumber data penelitian:</b> ${esc47(p.source)} · Investigasi: ${esc47(p.investigation)} · n=${p.n}. <small>Data penelitian utama berasal dari kasus yang dikumpulkan melalui aplikasi.</small>`}
  }

  /* Ensure the v41 wrapper filters application rows when the application source is selected. */
  const oldRun47=window.runResearchAnalysis;
  window.runResearchAnalysis=function(){
    forceResearchSource();
    if(researchState) localStorage.setItem('gorut-research-plan',JSON.stringify(researchState));
    return oldRun47?oldRun47():undefined;
  };

  function factorSummary47(cs){
    const q=qRows47();const map={};cs.forEach(c=>Object.entries(answers47(c)).forEach(([k,v])=>{if(v===undefined||v===null||String(v).trim()==='')return;const label=questionLabel47(k);const key=String(k);if(!map[key])map[key]={key,label,values:{}};const sv=Array.isArray(v)?v.join(', '):String(v);map[key].values[sv]=(map[key].values[sv]||0)+1;}));
    return Object.values(map).filter(x=>Object.keys(x.values).length).sort((a,b)=>a.label.localeCompare(b.label,'id')).slice(0,40);
  }
  function caseDistribution47(cs,key){const m={};cs.forEach(c=>{const v=c[key]??answers47(c)[key];if(v!==undefined&&v!==null&&String(v).trim()!=='')m[String(v)]=(m[String(v)]||0)+1});return m}
  function researchResultText47(){
    const p=window.researchDataProvenance(),cs=appRows47(),rs=researchState||{};const age=caseDistribution47(cs,'age'),sex=caseDistribution47(cs,'sex'),status=caseDistribution47(cs,'status');
    const factors=factorSummary47(cs).slice(0,12).map(x=>`${x.label}: ${Object.entries(x.values).map(([v,n])=>`${v}=${n}`).join(', ')}`).join('\n');
    return `SUMBER DATA DAN INTEGRASI\nSumber utama: ${p.source}\nInvestigasi aktif: ${p.investigation}\nJumlah record kasus: ${p.n}\nID kasus: ${p.caseIds.join(', ')||'-'}\n\nDISTRIBUSI DATA APLIKASI\nUmur: ${JSON.stringify(age)}\nJenis kelamin: ${JSON.stringify(sex)}\nStatus kasus: ${JSON.stringify(status)}\n\nFAKTOR/PAPARAN DARI KUESIONER\n${factors||'Belum ada jawaban kuesioner yang dapat diringkas.'}`;
  }

  /* Complete PE/KLB draft: append data provenance, case line-list summary, contact/specimen/field status, and factor summary. */
  const oldPEText=window.reportText;
  window.reportText=function(){
    const base=oldPEText?oldPEText():'';const cs=cases47();const a=active47();const contacts=(db.contacts||[]).filter(x=>String(x.investigationId)===String(db.active));const specs=(db.specimens||[]).filter(x=>String(x.investigationId)===String(db.active));const visits=(db.fieldVisits||[]).filter(x=>String(x.investigationId)===String(db.active));
    const onset=cs.filter(c=>c.onset).map(c=>String(c.onset).slice(0,10)).sort();const peak=Object.entries(cs.reduce((m,d)=>{if(d.onset){const k=String(d.onset).slice(0,10);m[k]=(m[k]||0)+1}return m},{})).sort((x,y)=>y[1]-x[1])[0];
    const factors=factorSummary47(cs).slice(0,20).map(x=>`- ${x.label}: ${Object.entries(x.values).map(([v,n])=>`${v} (${n})`).join(', ')}`).join('\n')||'-';
    const complete={name:cs.filter(c=>c.name).length,age:cs.filter(c=>c.age!==undefined&&c.age!=='').length,sex:cs.filter(c=>c.sex).length,onset:cs.filter(c=>c.onset).length,status:cs.filter(c=>c.status).length,address:cs.filter(c=>c.address).length,gps:cs.filter(c=>Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lng))).length};
    return base+`\n\n========================================\nDRAFT PE/KLB LENGKAP — ${V}\n========================================\n\nA. IDENTITAS KEJADIAN\nNama investigasi: ${a.name||'-'}\nPenyakit/sindrom: ${a.disease||'-'}\nLokasi: ${[a.desa,a.kec,a.kab,a.prov].filter(Boolean).join(', ')||'-'}\n\nB. SUMBER DAN INTEGRITAS DATA\nSumber utama: data kasus, kuesioner, kontak, spesimen/laboratorium dan kegiatan lapangan yang tersimpan pada investigasi aktif di aplikasi.\nKasus: ${cs.length}; Kontak: ${contacts.length}; Spesimen: ${specs.length}; Kunjungan lapangan: ${visits.length}.\nKelengkapan kasus — nama ${complete.name}/${cs.length}; umur ${complete.age}/${cs.length}; jenis kelamin ${complete.sex}/${cs.length}; onset ${complete.onset}/${cs.length}; status ${complete.status}/${cs.length}; alamat ${complete.address}/${cs.length}; GPS ${complete.gps}/${cs.length}.\n\nC. GAMBARAN EPIDEMIOLOGIS\nTanggal onset tersedia: ${onset.length}; puncak onset: ${peak?peak[0]+' ('+peak[1]+' kasus)':'belum dapat ditentukan'}.\n\nD. FAKTOR RISIKO/PAPARAN DARI KUESIONER\n${factors}\nCatatan: distribusi jawaban ini adalah deskriptif dan bukan bukti hubungan kausal.\n\nE. KONTAK DAN RANTAI PENULARAN\nJumlah kontak tercatat: ${contacts.length}. Tinjau status pemantauan, gejala, onset, follow-up dan hubungan dengan kasus indeks sebelum menyimpulkan transmisi.\n\nF. SPESIMEN DAN LABORATORIUM\nJumlah spesimen: ${specs.length}. Status hasil laboratorium harus diverifikasi terhadap hasil pemeriksaan asli sebelum klasifikasi akhir.\n\nG. KEGIATAN LAPANGAN\nJumlah kunjungan: ${visits.length}. Kegiatan lapangan harus dipadankan dengan kasus/kontak, lokasi, temuan, tindakan dan tindak lanjut.\n\nH. PEMBAHASAN\nInterpretasi menggabungkan orang-tempat-waktu, paparan/kuesioner, kontak, spesimen/laboratorium, kegiatan lapangan dan kualitas data. Hindari menyatakan etiologi atau status KLB tanpa bukti dan ketentuan program yang mendukung.\n\nI. KESIMPULAN SEMENTARA\nKesimpulan sementara harus menjawab apakah temuan konsisten dengan dugaan kejadian, seberapa lengkap bukti yang tersedia, dan apa yang masih perlu diverifikasi.\n\nJ. REKOMENDASI OPERASIONAL\n1. Lengkapi field kasus dan jawaban kuesioner yang masih kosong.\n2. Verifikasi kasus dan klasifikasi berdasarkan definisi kasus operasional.\n3. Tindak lanjuti kontak sesuai status pemantauan dan gejala.\n4. Pastikan spesimen dan hasil laboratorium terdokumentasi serta dapat ditelusuri.\n5. Dokumentasikan seluruh kunjungan, temuan, tindakan dan tindak lanjut lapangan.\n6. Perbarui analisis dan draft laporan setelah data baru masuk.`;
  };

  /* Rich PE draft panel */
  function injectPE(){const sec=E('laporan');if(!sec||E('v47PEComplete'))return;const card=document.createElement('div');card.id='v47PEComplete';card.className='card';card.style.marginTop='12px';card.innerHTML=`<div class="eyebrow">REPORTING WORKSPACE · V47</div><h3 style="margin:3px 0">📄 Draft PE/KLB Lengkap</h3><div class="small">Draft ini mengambil data langsung dari investigasi aktif: kasus, jawaban kuesioner, kontak, spesimen/laboratorium dan kegiatan lapangan.</div><div id="v47PEProvenance" class="notice"></div><button class="primary" onclick="window.generateAutomatedPEReport&&window.generateAutomatedPEReport();window.report&&window.report()">🔄 Bangun/Ulang Draft dari Data Terbaru</button>`;sec.insertBefore(card,sec.firstElementChild);updatePEProv()}
  function updatePEProv(){const b=E('v47PEProvenance');if(!b)return;const p=researchDataProvenance();b.innerHTML=`<b>Sumber:</b> data investigasi aplikasi · ${p.n} kasus aktif · ${esc47(p.investigation)}`}

  /* Rich research report preview with full application-data provenance and sections. */
  const oldPreview47=window.researchReportPreview;
  window.researchReportPreview=function(){
    forceResearchSource();
    const r=oldPreview47?oldPreview47():null;const box=E('researchReport');if(!box)return r;const p=window.researchDataProvenance();const rs=researchState||{};const cs=appRows47();
    const existing=box.querySelector('.report-doc');if(existing){
      existing.insertAdjacentHTML('afterbegin',`<div class="notice"><b>Provenance data:</b> ${esc47(p.source)} · Investigasi: ${esc47(p.investigation)} · n=${p.n}. Analisis penelitian menggunakan record kasus aplikasi ketika sumber “Data kasus dari aplikasi” dipilih.</div>`);
      existing.insertAdjacentHTML('beforeend',`<h2>10. Sumber Data dan Integrasi Aplikasi</h2><p>Dataset analisis berasal dari record kasus yang tersimpan pada investigasi aktif, termasuk jawaban kuesioner pada <code>case.answers</code>. ID kasus yang masuk analisis: ${esc47(p.caseIds.join(', ')||'-')}.</p><h2>11. Ringkasan Data yang Dikumpulkan</h2><p>Total record: <b>${cs.length}</b>. Data dapat mencakup identitas, demografi, onset, status kasus, outcome, lokasi, faktor/paparan dan variabel penyakit-spesifik dari kuesioner.</p><h2>12. Kualitas dan Kelengkapan Data</h2><p>Peneliti wajib memeriksa missing data, duplikasi, validitas rentang, konsistensi definisi operasional, kemungkinan bias informasi/seleksi dan kesesuaian data dengan protokol.</p><h2>13. Hasil dan Interpretasi</h2><p>${esc47(rs.analysis?.text||'Hasil statistik ditampilkan pada bagian Hasil Analisis. Interpretasi harus mengikuti desain, estimasi, interval kepercayaan, p-value bila relevan, asumsi model dan keterbatasan.')}</p><h2>14. Implikasi Epidemiologis dan Program</h2><p>Jelaskan implikasi berdasarkan bukti yang dihasilkan, tanpa mengubah hubungan statistik menjadi klaim kausal bila desain penelitian tidak mendukungnya.</p><h2>15. Rekomendasi</h2><p>Rekomendasi harus diturunkan dari hasil penelitian, kualitas data, konteks epidemiologi dan kebutuhan program.</p>`)
    }
    return r;
  };

  /* Export a complete research draft as HTML, always carrying provenance. */
  window.exportResearchCompleteReport=function(){
    const rs=researchState||{},p=researchDataProvenance(),cs=appRows47(),title=rs.title||'Laporan Penelitian Epidemiologi';
    const tables=rs.publicationTables?.html||'',analysis=rs.analysis?.html||'<p>Belum ada analisis.</p>',adv=rs.advanced?.result?`<h2>Analisis Lanjutan</h2><pre>${esc47(JSON.stringify(rs.advanced.result,null,2))}</pre>`:'';
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>${esc47(title)}</title><style>body{font-family:Arial,sans-serif;max-width:1000px;margin:30px auto;line-height:1.55;color:#222}h1,h2,h3{color:#17324d}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #bbb;padding:7px;text-align:left}th{background:#eee}.note{padding:12px;background:#f5f7fa;border-left:4px solid #496}</style></head><body><h1>${esc47(title)}</h1><div class="note"><b>Sumber data:</b> ${esc47(p.source)}<br><b>Investigasi:</b> ${esc47(p.investigation)}<br><b>n:</b> ${p.n}<br><b>ID kasus:</b> ${esc47(p.caseIds.join(', ')||'-')}</div><h2>1. Pendahuluan</h2><p>${esc47(rs.question||'Lengkapi latar belakang, besaran masalah, gap pengetahuan dan rasional penelitian.')}</p><h2>2. Tujuan dan Hipotesis</h2><p><b>Tujuan umum:</b> ${esc47(rs.generalObjective||'-')}</p><p><b>Tujuan khusus:</b><br>${esc47(rs.specificObjectives||'-').replace(/\n/g,'<br>')}</p><p><b>Hipotesis:</b> ${esc47(rs.hypothesis||'-')}</p><h2>3. Metode Penelitian</h2><p><b>Desain:</b> ${esc47(researchPlans[rs.design]?.label||rs.design||'-')}<br><b>Populasi:</b> ${esc47(rs.population||'-')}<br><b>Setting:</b> ${esc47(rs.setting||'-')}<br><b>Periode:</b> ${esc47(rs.period||'-')}<br><b>Sampling:</b> ${esc47(rs.sampling||'-')}<br><b>Target n:</b> ${esc47(rs.sampleTarget||'-')}</p><h3>Variabel</h3><p><b>Outcome:</b> ${esc47(rs.outcome||'-')} — ${esc47(rs.outcomeDefinition||'-')}<br><b>Exposure:</b> ${esc47(rs.exposure||'-')} — ${esc47(rs.exposureDefinition||'-')}<br><b>Kovariat:</b> ${esc47(rs.covariates||'-')}</p><h2>4. Sumber Data dan Integrasi</h2><p>Data analisis berasal dari data yang dikumpulkan melalui aplikasi GORUT-OUTBREAK AI. Jawaban kuesioner tersimpan pada record kasus dan digunakan sebagai variabel analitik sesuai pemetaan variabel/protokol.</p><h2>5. Kualitas Data</h2><p>Periksa missing data, duplikasi, coding, outlier, konsistensi temporal/spasial dan kesesuaian definisi operasional.</p><h2>6. Hasil</h2>${analysis}${adv}<h2>7. Tabel Penelitian</h2>${tables||'<p>Belum dibuat.</p>'}<h2>8. Pembahasan</h2><p>Interpretasikan hasil dengan mempertimbangkan desain, bias, confounding, ketidakpastian, literatur dan konteks epidemiologis.</p><h2>9. Keterbatasan</h2><p>Jelaskan keterbatasan desain, sumber data aplikasi, missing data, kualitas pengukuran, selection/information bias dan generalisasi.</p><h2>10. Kesimpulan</h2><p>Kesimpulan harus menjawab tujuan penelitian dan tidak melampaui bukti yang tersedia.</p><h2>11. Rekomendasi</h2><p>${esc47(rs.recommendations||'Turunkan rekomendasi dari hasil penelitian dan kebutuhan program.')}</p><h2>12. Etik dan Pendanaan</h2><p><b>Etik:</b> ${esc47(rs.ethics||'-')}<br><b>Pendanaan:</b> ${esc47(rs.funding||'-')}</p><p class="note">Draft ini dihasilkan dari GORUT-OUTBREAK AI ${V}. Validasi metodologi dan hasil statistik tetap diperlukan sebelum digunakan untuk keputusan resmi atau publikasi.</p></body></html>`;
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));a.download='GORUT-Laporan-Penelitian-Lengkap-v47.html';a.click();
  };

  function injectResearch(){const sec=E('penelitian')||E('research');if(!sec||E('v47ResearchReportTools'))return;const box=document.createElement('div');box.id='v47ResearchReportTools';box.className='card';box.style.marginTop='12px';box.innerHTML=`<div class="eyebrow">RESEARCH REPORTING · V47</div><h3 style="margin:3px 0">📑 Draft Laporan Penelitian Lengkap</h3><div id="v47ResearchProv" class="notice"></div><div class="toolbar"><button class="primary" onclick="window.researchReportPreview()">👁 Pratinjau Draft Lengkap</button><button class="primary" onclick="window.exportResearchCompleteReport()">⬇ Unduh Draft HTML Lengkap</button></div>`;sec.appendChild(box);updateResearchProv()}
  function updateResearchProv(){const b=E('v47ResearchProv');if(!b)return;const p=researchDataProvenance();b.innerHTML=`<b>Sumber data:</b> ${esc47(p.source)} · <b>n=${p.n}</b> · Investigasi: ${esc47(p.investigation)}`}

  const oldPage47=window.page;window.page=function(id,b){oldPage47(id,b);setTimeout(()=>{if(id==='laporan'){injectPE();updatePEProv()}if(id==='penelitian'||id==='research'){forceResearchSource();injectResearch();updateResearchProv()}},80)};
  setTimeout(()=>{try{forceResearchSource();injectPE();injectResearch()}catch(e){console.warn('v47 init',e)}},800);
})();
/* ===================== v48 — APPLICATION DATA → RESEARCH AUTOMATION ===================== */
(function(){
  const V='v48';
  const esc48=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const E=id=>document.getElementById(id);
  const appRows=()=>typeof window.researchAppRows==='function'?window.researchAppRows():((typeof currentCases==='function'?currentCases():[]));
  const answers=c=>(c&&c.answers&&typeof c.answers==='object'?c.answers:{});
  const val48=(c,key)=>{if(!key)return null; if(key.startsWith('answers.')){let v=answers(c);for(const k of key.slice(8).split('.'))v=v?.[k];return v} if(key.includes('.')){let v=c;for(const k of key.split('.'))v=v?.[k];return v} return c[key]};
  const qLabel=k=>{const qs=(typeof db!=='undefined'&&Array.isArray(db.questions))?db.questions:[];const q=qs.find(x=>String(x.id)===String(k)||String(x.key)===String(k)||String(x.name)===String(k));return q?.label||q?.question||String(k)};
  const isMissing=v=>v===null||v===undefined||String(v).trim()==='';
  function rows(){return appRows().filter(r=>r&&typeof r==='object')}
  function uniqValues(key){return [...new Set(rows().map(r=>val48(r,key)).filter(v=>!isMissing(v)).map(v=>String(v)))];}
  function typeOf(key){const vs=uniqValues(key), nums=vs.map(Number);if(vs.length&&nums.every(Number.isFinite))return 'numeric';return vs.length<=2?'binary':'categorical'}
  function buildDict(){
    const cs=rows(), map=new Map();
    const core=['id','name','age','sex','onset','status','outcome','address','prov','kab','kec','desa','lat','lng'];
    core.forEach(k=>map.set(k,{name:k,label:k==='id'?'ID kasus':k==='name'?'Nama':k==='age'?'Umur':k==='sex'?'Jenis kelamin':k==='onset'?'Tanggal onset':k==='status'?'Status kasus':k==='outcome'?'Outcome':k==='address'?'Alamat':k==='prov'?'Provinsi':k==='kab'?'Kabupaten/Kota':k==='kec'?'Kecamatan':k==='desa'?'Desa/Kelurahan':k==='lat'?'Latitude':k==='lng'?'Longitude':k,type:typeOf(k),role:k==='status'?'outcome':'covariate'}));
    cs.forEach(c=>Object.keys(answers(c)).forEach(k=>{const n='answers.'+k;if(!map.has(n))map.set(n,{name:n,label:qLabel(k),type:typeOf(n),role:'covariate'})}));
    return [...map.values()].filter(x=>rows().some(r=>!isMissing(val48(r,x.name))));
  }
  function saveState(){localStorage.setItem('gorut-research-plan',JSON.stringify(researchState))}
  function populateSelects(){
    const dict=buildDict(), y=E('v48Outcome'), x=E('v48Exposure'), cov=E('v48Covariates');
    if(!y||!x)return;
    const oldY=y.value||researchState.v48?.outcome||researchState.outcome||'status', oldX=x.value||researchState.v48?.exposure||researchState.exposure||'';
    const opts=dict.filter(d=>d.type==='binary'||d.name==='status'||d.name==='outcome');
    y.innerHTML=opts.map(d=>`<option value="${esc48(d.name)}">${esc48(d.label)} [${esc48(d.name)}]</option>`).join('');
    x.innerHTML=dict.filter(d=>d.name!=='id'&&d.name!==oldY).map(d=>`<option value="${esc48(d.name)}">${esc48(d.label)} [${esc48(d.name)}]</option>`).join('');
    if(opts.some(d=>d.name===oldY))y.value=oldY; else if(opts.some(d=>d.name==='status'))y.value='status';
    if(dict.some(d=>d.name===oldX))x.value=oldX; else if(dict.some(d=>d.name==='answers.contact'))x.value='answers.contact';
    if(cov){cov.innerHTML=dict.filter(d=>!['id',y.value].includes(d.name)).map(d=>`<label style="display:inline-block;margin:3px 8px 3px 0"><input type="checkbox" value="${esc48(d.name)}"> ${esc48(d.label)}</label>`).join('');}
    researchState.v48={...(researchState.v48||{}),outcome:y.value,exposure:x.value};saveState();
    const p=window.researchDataProvenance?window.researchDataProvenance():{n:rows().length};
    const st=E('v48Source');if(st)st.innerHTML=`<b>Sumber analisis:</b> Data kasus yang dikumpulkan melalui aplikasi · <b>n=${p.n||rows().length}</b> · <b>${dict.length} variabel terdeteksi</b>.`;
    const vd=E('v48Dictionary');if(vd)vd.innerHTML=`<table class="report-table"><tr><th>Variabel</th><th>Label</th><th>Tipe</th><th>Peran awal</th><th>Terisi</th></tr>${dict.map(d=>{const n=rows().filter(r=>!isMissing(val48(r,d.name))).length;return `<tr><td><code>${esc48(d.name)}</code></td><td>${esc48(d.label)}</td><td>${d.type}</td><td>${esc48(d.role)}</td><td>${n}/${rows().length}</td></tr>`}).join('')}</table>`;
  }
  function binary(v){if(isMissing(v))return null;const s=String(v).trim().toLowerCase();if(['1','ya','yes','y','true','positif','positive','konfirmasi','confirmed','sakit','meninggal'].includes(s))return 1;if(['0','tidak','no','n','false','negatif','negative','bukan','sembuh','selesai'].includes(s))return 0;return null}
  function ybin(v,key){if(key==='status')return String(v||'').toLowerCase().includes('konfirmasi')?1:0;if(key==='outcome')return String(v||'').toLowerCase().includes('meninggal')?1:0;return binary(v)}
  function xbin(v){return binary(v)}
  function pChi(a,b,c,d){const n=a+b+c+d,den=(a+b)*(c+d)*(a+c)*(b+d);if(!den)return NaN;const chi=n*(a*d-b*c)**2/den;return typeof chi2p1==='function'?chi2p1(chi):NaN}
  function oneBi(key,yKey){let a=0,b=0,c=0,d=0,miss=0;rows().forEach(r=>{const y=ybin(val48(r,yKey),yKey),x=xbin(val48(r,key));if(y===null||x===null){miss++;return}if(x&&y)a++;else if(x&&!y)b++;else if(!x&&y)c++;else d++;});const n=a+b+c+d;if(n<2)return null;const or=(a*d)/(Math.max(b*c,.5));const se=Math.sqrt(1/Math.max(a,.5)+1/Math.max(b,.5)+1/Math.max(c,.5)+1/Math.max(d,.5));return {key,label:qLabel(key.replace(/^answers\./,'')),a,b,c,d,n,missing:miss,or,lo:Math.exp(Math.log(Math.max(or,1e-12))-1.96*se),hi:Math.exp(Math.log(Math.max(or,1e-12))+1.96*se),p:pChi(a,b,c,d)}}
  function runBiv(){
    const y=E('v48Outcome')?.value||'status';const x=E('v48Exposure')?.value||'';const res=[];if(x){const r=oneBi(x,y);if(r)res.push(r)}
    const checks=[...document.querySelectorAll('#v48Covariates input:checked')].map(e=>e.value);checks.forEach(k=>{const r=oneBi(k,y);if(r)res.push(r)});
    const box=E('v48Results');if(!box)return;researchState.v48={...(researchState.v48||{}),outcome:y,exposure:x,covariates:checks,bivariate:res,generatedAt:new Date().toISOString()};saveState();
    let h=`<h4>Analisis bivariat dari data aplikasi</h4><p>Outcome: <b>${esc48(qLabel(y.replace(/^answers\./,'')))}</b> · n lengkap dihitung per variabel.</p><table class="report-table"><tr><th>Exposure</th><th>a</th><th>b</th><th>c</th><th>d</th><th>OR</th><th>95% CI</th><th>p</th><th>Missing</th></tr>`;
    res.forEach(r=>h+=`<tr><td>${esc48(r.label)}</td><td>${r.a}</td><td>${r.b}</td><td>${r.c}</td><td>${r.d}</td><td>${Number.isFinite(r.or)?r.or.toFixed(2):'—'}</td><td>${Number.isFinite(r.lo)?r.lo.toFixed(2)+'–'+r.hi.toFixed(2):'—'}</td><td>${Number.isFinite(r.p)?r.p.toFixed(4):'—'}</td><td>${r.missing}</td></tr>`);
    h+='</table><div class="notice">OR/CI di atas adalah analisis 2×2 screening. Pastikan coding binary, desain penelitian, sampling, confounding, matching/cluster, dan asumsi statistik sesuai protokol sebelum digunakan dalam laporan resmi.</div>';box.innerHTML=h;return res;
  }
  function forest(){const rs=researchState.v48?.bivariate||runBiv()||[],box=E('v48Forest');if(!box||!rs.length){if(box)box.innerHTML='Belum ada hasil bivariat.';return}const w=760,rowH=44,h=Math.max(150,rs.length*rowH+70),min=Math.max(.1,Math.min(...rs.map(r=>r.lo).filter(Number.isFinite),1)/2),max=Math.max(10,...rs.map(r=>r.hi).filter(Number.isFinite)*1.5);const lx=220,rx=710,scale=v=>lx+(Math.log(Math.max(v,min))-Math.log(min))/(Math.log(max)-Math.log(min))*(rx-lx);let svg=`<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Forest plot OR">`;const sx=scale(1);svg+=`<line x1="${sx}" y1="35" x2="${sx}" y2="${h-20}" stroke="#888" stroke-dasharray="5 4"/>`;rs.forEach((r,i)=>{const y=60+i*rowH,x1=scale(r.lo),x2=scale(r.hi),xm=scale(r.or);svg+=`<text x="5" y="${y+5}" font-size="12">${esc48(r.label).slice(0,30)}</text><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#333" stroke-width="2"/><circle cx="${xm}" cy="${y}" r="5"/><text x="${rx+5}" y="${y+5}" font-size="11">${Number.isFinite(r.or)?r.or.toFixed(2):'—'}</text>`});svg+=`<text x="${lx}" y="${h-5}" font-size="11">OR = 1</text></svg>`;box.innerHTML=`<h4>Forest Plot — Odds Ratio</h4>${svg}<div class="notice">Visualisasi deskriptif hasil 2×2. Tidak menggantikan model multivariat atau pemeriksaan asumsi.</div>`}
  function table1(){const dict=buildDict().filter(d=>!['id','name','address','lat','lng'].includes(d.name));const n=rows().length;let h=`<h4>Table 1. Karakteristik data penelitian dari aplikasi</h4><table class="report-table"><tr><th>Variabel</th><th>Tipe</th><th>Terisi</th><th>Missing</th><th>Distribusi/Ringkasan</th></tr>`;dict.forEach(d=>{const vals=rows().map(r=>val48(r,d.name)).filter(v=>!isMissing(v)),missing=n-vals.length;let sum='';if(d.type==='numeric'){const z=vals.map(Number).filter(Number.isFinite);if(z.length){const m=z.reduce((a,b)=>a+b,0)/z.length;sum=`mean ${m.toFixed(2)}; min ${Math.min(...z)}; max ${Math.max(...z)}`}}else{const f={};vals.forEach(v=>f[String(v)]=(f[String(v)]||0)+1);sum=Object.entries(f).slice(0,12).map(([k,c])=>`${esc48(k)}: ${c} (${(100*c/Math.max(vals.length,1)).toFixed(1)}%)`).join('<br>')}h+=`<tr><td>${esc48(d.label)}<br><code>${esc48(d.name)}</code></td><td>${d.type}</td><td>${vals.length}</td><td>${missing}</td><td>${sum||'—'}</td></tr>`});h+='</table>';const box=E('v48Table1');if(box)box.innerHTML=h;researchState.v48={...(researchState.v48||{}),table1:h};saveState()}
  function reportText(){const rs=researchState.v48||{},p=window.researchDataProvenance?window.researchDataProvenance():{n:rows().length,source:'Data kasus aplikasi'};return `<h2>Hasil Analisis Otomatis Berbasis Data Aplikasi</h2><p><b>Sumber:</b> ${esc48(p.source)} · <b>n:</b> ${p.n} · <b>Investigasi:</b> ${esc48(p.investigation||'-')}</p>${rs.table1||''}<h3>Analisis Bivariat</h3>${rs.bivariate?.length?`<table class="report-table"><tr><th>Exposure</th><th>OR</th><th>95% CI</th><th>p</th></tr>${rs.bivariate.map(r=>`<tr><td>${esc48(r.label)}</td><td>${Number.isFinite(r.or)?r.or.toFixed(2):'—'}</td><td>${Number.isFinite(r.lo)?r.lo.toFixed(2)+'–'+r.hi.toFixed(2):'—'}</td><td>${Number.isFinite(r.p)?r.p.toFixed(4):'—'}</td></tr>`).join('')}</table>`:'<p>Belum ada analisis bivariat.</p>'}<p><b>Catatan Bab Hasil:</b> Sajikan karakteristik subjek, distribusi outcome, paparan utama, estimasi asosiasi dan 95% CI. Jangan menyimpulkan kausalitas hanya dari hasil bivariat.</p>`}
  window.v48RefreshResearch=function(){populateSelects();table1()};window.v48RunBiv=runBiv;window.v48Forest=forest;window.v48Table1=table1;
  window.v48ResearchResultsText=reportText;
  function inject(){const sec=E('penelitian');if(!sec||E('v48ResearchAutomation'))return;const card=document.createElement('div');card.id='v48ResearchAutomation';card.className='card';card.style.marginTop='14px';card.innerHTML=`<div class="eyebrow">RESEARCH AUTOMATION · V48</div><h3 style="margin:3px 0">📊 Analisis Otomatis dari Data Aplikasi</h3><div id="v48Source" class="notice"></div><div class="grid2"><div class="field"><label>Outcome penelitian (Y)</label><select id="v48Outcome"></select></div><div class="field"><label>Exposure utama (X)</label><select id="v48Exposure"></select></div></div><div class="field"><label>Faktor/kandidat confounder untuk analisis bivariat</label><div id="v48Covariates" class="notice" style="max-height:180px;overflow:auto"></div></div><div class="toolbar"><button class="primary" onclick="v48Table1();v48RunBiv()">📊 Buat Table 1 + Bivariat</button><button onclick="v48Forest()">🌲 Forest Plot</button><button onclick="v48RefreshResearch()">🔄 Sinkronkan Variabel dari Kuesioner</button></div><div id="v48Table1" class="report-preview"></div><div id="v48Results" class="report-preview"></div><div id="v48Forest" class="report-preview"></div><div id="v48Dictionary" class="report-preview"></div><div class="notice">Semua keluaran v48 menggunakan record kasus investigasi aktif dan jawaban kuesioner yang tersimpan pada <code>case.answers</code>. Dataset eksternal tidak digunakan oleh mesin v48.</div></div>`;sec.insertBefore(card,sec.lastElementChild);populateSelects();table1()}
  const oldPage=window.page;window.page=function(id,b){const r=oldPage?.apply(this,arguments);setTimeout(()=>{if(id==='penelitian'){inject();populateSelects();table1()}},100);return r};
  const oldReport=window.exportResearchCompleteReport;window.exportResearchCompleteReport=function(){const r=oldReport?.apply(this,arguments);setTimeout(()=>{},0);return r};
  setTimeout(()=>{try{inject()}catch(e){console.warn('v48 init',e)}},900);
})();
/* v48 report integration: append automated application-data results to the research draft preview. */
(function(){
  const oldPreview=window.researchReportPreview;
  window.researchReportPreview=function(){
    const r=oldPreview?.apply(this,arguments);setTimeout(()=>{
      try{
        const box=document.getElementById('researchReport');
        if(!box||!window.v48ResearchResultsText)return;
        let marker=box.querySelector('#v48ReportBlock');
        if(marker)marker.remove();
        const doc=box.querySelector('.report-doc')||box;
        const div=document.createElement('div');div.id='v48ReportBlock';div.innerHTML=window.v48ResearchResultsText();doc.appendChild(div);
      }catch(e){console.warn('v48 report integration',e)}
    },80);return r;
  };
})();

/* ===================== v49 — DEMOGRAPHY MASTER + PUSKESMAS MAP + IR REPORTING ===================== */
(function(){
 const DEMO_KEY='gorut-demography-v49';
 const pkmMaster=[
  {name:'Puskesmas Anggrek',desa:'Anggrek',kec:'Anggrek'},{name:'Puskesmas Atinggola',desa:'Atinggola',kec:'Atinggola'},
  {name:'Puskesmas Biau',desa:'Biau',kec:'Biau'},{name:'Puskesmas Buloila',desa:'Buloila',kec:'Sumalata'},
  {name:'Puskesmas Dambalo',desa:'Dambalo',kec:'Tomilito'},{name:'Puskesmas Dulukapa',desa:'Dulukapa',kec:'Sumalata Timur'},
  {name:'Puskesmas Gentuma',desa:'Gentuma',kec:'Gentuma Raya'},{name:'Puskesmas Ilangata',desa:'Ilangata',kec:'Anggrek'},
  {name:'Puskesmas Kwandang',desa:'Kwandang',kec:'Kwandang'},{name:'Puskesmas Limbato',desa:'Limbato',kec:'Tolinggula'},
  {name:'Puskesmas Molingkapoto',desa:'Molingkapoto',kec:'Kwandang'},{name:'Puskesmas Monano',desa:'Monano',kec:'Monano'},
  {name:'Puskesmas Ponelo',desa:'Ponelo',kec:'Ponelo Kepulauan'},{name:'Puskesmas Sumalata',desa:'Sumalata',kec:'Sumalata'},
  {name:'Puskesmas Tolinggula',desa:'Tolinggula',kec:'Tolinggula'}
 ];
 const E=id=>document.getElementById(id);
 const esc49=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 function loadDemo(){try{return JSON.parse(localStorage.getItem(DEMO_KEY)||'null')||{years:{},meta:{}}}catch(e){return {years:{},meta:{}}}}
 function saveDemo(x){localStorage.setItem(DEMO_KEY,JSON.stringify(x));return x}
 function years(){const d=loadDemo(),now=new Date().getFullYear(),y=Object.keys(d.years).map(Number).filter(Number.isFinite);return [...new Set([now,...y])].sort((a,b)=>b-a)}
 function selectedYear(){return Number(E('demoYearV49')?.value)||new Date().getFullYear()}
 function rowsFor(y){const d=loadDemo(),rows=d.years[String(y)]||{};return pkmMaster.map(p=>Object.assign({puskesmas:p.name,kec:p.kec,desa:p.desa,population:'',male:'',female:'',households:'',areaKm2:'',lat:'',lng:'',note:'',source:''},rows[p.name]||{}))}
 function metaFor(y){return loadDemo().meta[String(y)]||{source:'',updated:'',note:''}}
 
window.openDemographyTableV68=function(btn){
  try{
    if(typeof window.page==='function') window.page('demografi',btn);
    if(typeof window.renderDemographyV49==='function') window.renderDemographyV49();
    const el=document.getElementById('demoMasterV66')||document.getElementById('demoTableV49');
    if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(e){console.warn('openDemographyTableV68',e)}
};
window.renderDemographyV49=function(){
  const ys=years(),sel=E('demoYearV49'); if(sel){sel.innerHTML=ys.map(y=>`<option value="${y}">${y}</option>`).join('');if(!ys.includes(Number(sel.value)))sel.value=String(ys[0]);}
  const y=selectedYear(),m=metaFor(y);if(E('demoSourceV49'))E('demoSourceV49').value=m.source||'';if(E('demoUpdatedV49'))E('demoUpdatedV49').value=m.updated||'';if(E('demoNoteV49'))E('demoNoteV49').value=m.note||'';
  const rows=rowsFor(y),tot=rows.reduce((s,r)=>s+(Number(r.population)||0),0),male=rows.reduce((s,r)=>s+(Number(r.male)||0),0),female=rows.reduce((s,r)=>s+(Number(r.female)||0),0),filled=rows.filter(r=>Number(r.population)>0).length;
  if(E('demoSummaryV49'))E('demoSummaryV49').innerHTML=`<div class="stat"><small>Wilayah Puskesmas</small><b>${rows.length}</b></div><div class="stat"><small>Populasi terisi</small><b>${tot.toLocaleString('id-ID')}</b></div><div class="stat"><small>Laki-laki</small><b>${male.toLocaleString('id-ID')}</b></div><div class="stat"><small>Perempuan</small><b>${female.toLocaleString('id-ID')}</b></div><div class="stat"><small>Denominator tersedia</small><b>${filled}/${rows.length}</b></div>`;
  if(E('demoTableV49'))E('demoTableV49').innerHTML=`<table><thead><tr><th>Puskesmas</th><th>Kecamatan</th><th>Desa acuan</th><th>Penduduk</th><th>Laki-laki</th><th>Perempuan</th><th>KK</th><th>Lat</th><th>Lng</th><th>Catatan</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td><b>${esc49(r.puskesmas)}</b></td><td>${esc49(r.kec)}</td><td>${esc49(r.desa)}</td><td><input data-demo="population" data-i="${i}" type="number" min="0" value="${esc49(r.population)}"></td><td><input data-demo="male" data-i="${i}" type="number" min="0" value="${esc49(r.male)}"></td><td><input data-demo="female" data-i="${i}" type="number" min="0" value="${esc49(r.female)}"></td><td><input data-demo="households" data-i="${i}" type="number" min="0" value="${esc49(r.households)}"></td><td><input data-demo="lat" data-i="${i}" type="number" step="any" value="${esc49(r.lat)}"></td><td><input data-demo="lng" data-i="${i}" type="number" step="any" value="${esc49(r.lng)}"></td><td><input data-demo="note" data-i="${i}" value="${esc49(r.note)}"></td></tr>`).join('')}</tbody></table>`;
  renderDemoDiseaseOptions();
 };
 function renderDemoDiseaseOptions(){const s=E('demoDiseaseV49');if(!s)return;const active=typeof act==='function'?act():null,current=s.value;const opts=Object.entries(typeof diseases!=='undefined'?diseases:{}).map(([k,v])=>`<option value="${esc49(k)}">${esc49(v.name||k)}</option>`).join('');s.innerHTML='<option value="">Penyakit investigasi aktif</option>'+opts;if(current)s.value=current;else if(active?.disease)s.value=active.disease;}
 window.addDemographyYearV49=function(){const d=loadDemo(),y=prompt('Masukkan tahun demografi, misalnya 2027:',String(new Date().getFullYear()+1));if(!y)return;const n=Number(y);if(!Number.isInteger(n)||n<2000||n>2100)return alert('Tahun tidak valid.');d.years[String(n)] ||= {};saveDemo(d);renderDemographyV49();E('demoYearV49').value=String(n);renderDemographyV49();}
 window.saveDemographyV49=function(){const y=selectedYear(),d=loadDemo(),rows=rowsFor(y);document.querySelectorAll('[data-demo]').forEach(inp=>{const i=Number(inp.dataset.i);if(rows[i])rows[i][inp.dataset.demo]=inp.value});d.years[String(y)]={};rows.forEach(r=>d.years[String(y)][r.puskesmas]=r);d.meta[String(y)]={source:E('demoSourceV49')?.value||'',updated:E('demoUpdatedV49')?.value||'',note:E('demoNoteV49')?.value||''};saveDemo(d);renderDemographyV49();alert(`Master demografi ${y} tersimpan.`);}
 window.exportDemographyV49=function(){const y=selectedYear(),rows=rowsFor(y),m=metaFor(y),head=['tahun','puskesmas','kecamatan','desa_acuan','penduduk','laki_laki','perempuan','kk','luas_km2','latitude','longitude','sumber','tanggal_update','catatan'];const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const csv=[head.join(',')].concat(rows.map(r=>[y,r.puskesmas,r.kec,r.desa,r.population,r.male,r.female,r.households,r.areaKm2,r.lat,r.lng,m.source,m.updated,r.note].map(q).join(','))).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`GORUT-demografi-${y}.csv`;a.click();}
 window.importDemographyV49=function(){const inp=document.createElement('input');inp.type='file';inp.accept='.csv,text/csv';inp.onchange=()=>{const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const lines=String(r.result).split(/\r?\n/).filter(Boolean);if(lines.length<2)return alert('CSV kosong.');const split=x=>x.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(v=>v.replace(/^\"|\"$/g,'').replace(/\"\"/g,'\"'));const h=split(lines[0]).map(x=>x.toLowerCase().trim()),idx=k=>h.indexOf(k),d=loadDemo();lines.slice(1).forEach(line=>{const a=split(line),y=Number(a[idx('tahun')]||new Date().getFullYear()),name=a[idx('puskesmas')];if(!name)return;d.years[String(y)] ||= {};d.years[String(y)][name]={puskesmas:name,kec:a[idx('kecamatan')]||'',desa:a[idx('desa_acuan')]||'',population:a[idx('penduduk')]||'',male:a[idx('laki_laki')]||'',female:a[idx('perempuan')]||'',households:a[idx('kk')]||'',areaKm2:a[idx('luas_km2')]||'',lat:a[idx('latitude')]||'',lng:a[idx('longitude')]||'',note:a[idx('catatan')]||'',source:a[idx('sumber')]||''};d.meta[String(y)]={source:a[idx('sumber')]||'',updated:a[idx('tanggal_update')]||'',note:''}});saveDemo(d);renderDemographyV49();alert('CSV demografi berhasil diimpor.');};r.readAsText(f)};inp.click();}
 function activeCases(){const a=typeof act==='function'?act():{};const sel=E('demoDiseaseV49')?.value;return (db.cases||[]).filter(c=>String(c.investigationId)===String(db.active)).filter(c=>!sel||String(c.disease||a.disease)===String(sel))}
 function casePkm(c){const a=c.answers||{};return c.pkm||c.puskesmas||a.pkm||a.Puskesmas||a.puskesmas||''}
 function calcRates(){const y=selectedYear(),rows=rowsFor(y),cs=activeCases();return rows.map(r=>{const p=String(r.puskesmas).toLowerCase(),short=p.replace(/^puskesmas\s+/i,'');const n=cs.filter(c=>{const v=String(casePkm(c)||'').toLowerCase();return v===p||v===short}).length,pop=Number(r.population)||0;return {...r,cases:n,ir:pop?n/pop*100000:null}})}
 window.renderDemographyMapV49=function(){if(!window.L){const e=E('demoMapV49');if(e)e.innerHTML='<div class="notice">Peta memerlukan koneksi internet untuk memuat Leaflet.</div>';return}const el=E('demoMapV49');if(!el)return;if(window.__demoMap49)window.__demoMap49.remove();window.__demoMap49=L.map(el).setView([0.8,122.5],9);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(window.__demoMap49);const metric=E('demoMetricV49')?.value||'cases',rates=calcRates(),cs=activeCases().filter(c=>Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lng)));cs.forEach(c=>L.circleMarker([+c.lat,+c.lng],{radius:6,weight:1}).addTo(window.__demoMap49).bindPopup(`<b>${esc49(c.id||'-')}</b><br>${esc49(c.name||'-')}<br>Puskesmas: ${esc49(casePkm(c)||'-')}<br>Status: ${esc49(c.status||'-')}`));if(window.L?.esri){try{window.__demoRbi49=L.esri.dynamicMapLayer({url:'https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer',layers:[8,9,10,11],opacity:.35,useCors:true}).addTo(window.__demoMap49)}catch(e){}}rates.filter(r=>Number(r.lat)&&Number(r.lng)).forEach(r=>{const radius=metric==='ir'?Math.max(250,Math.min(2500,(r.ir||0)*5)):Math.max(200,Math.min(1800,(r.cases||0)*90));L.circle([+r.lat,+r.lng],{radius,fillOpacity:.20,weight:1}).addTo(window.__demoMap49).bindPopup(`<b>${esc49(r.puskesmas)}</b><br>Kasus: ${r.cases}<br>IR: ${r.ir==null?'NA':r.ir.toFixed(2)}/100.000`)});if(cs.length){const b=L.latLngBounds(cs.map(c=>[+c.lat,+c.lng]));window.__demoMap49.fitBounds(b.pad(.15))}if(E('demoMapTableV49'))E('demoMapTableV49').innerHTML=`<table><thead><tr><th>Puskesmas</th><th>Kasus</th><th>Penduduk ${selectedYear()}</th><th>IR/100.000</th><th>Denominator</th></tr></thead><tbody>${rates.map(r=>`<tr><td>${esc49(r.puskesmas)}</td><td>${r.cases}</td><td>${Number(r.population||0).toLocaleString('id-ID')}</td><td>${r.ir==null?'—':r.ir.toFixed(2)}</td><td>${r.population?'Siap':'Belum ada'}</td></tr>`).join('')}</tbody></table><p class="small">Kasus tanpa pemetaan Puskesmas: ${activeCases().filter(c=>!casePkm(c)).length}. Kasus berkoordinat: ${cs.length}/${activeCases().length}.</p>`}
 function reportMapHtml(d){
 const y=Number(E('repDemographyYearV49')?.value)||selectedYear(),old=E('demoYearV49')?.value;
 if(E('demoYearV49'))E('demoYearV49').value=String(y);
 const rates=calcRates();
 if(E('demoYearV49')&&old)E('demoYearV49').value=old;
 const valid=rates.filter(r=>r.ir!=null).sort((a,b)=>b.ir-a.ir);
 const cs=d.cs.filter(c=>Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lng)));
 /* RBI BIG: batas administrasi nasional edisi Juni 2026. Bbox difokuskan ke Kabupaten Gorontalo Utara. */
 const bbox=[122.05,0.15,123.55,1.55],W=900,H=560;
 const px=x=>40+(x-bbox[0])/(bbox[2]-bbox[0])*(W-80),py=v=>H-40-(v-bbox[1])/(bbox[3]-bbox[1])*(H-80);
 const dots=cs.filter(c=>+c.lng>=bbox[0]&&+c.lng<=bbox[2]&&+c.lat>=bbox[1]&&+c.lat<=bbox[3]).map(c=>`<circle cx="${px(+c.lng).toFixed(1)}" cy="${py(+c.lat).toFixed(1)}" r="7" fill="#d64545" stroke="#fff" stroke-width="2"><title>${esc49(c.id||'Kasus')} — ${esc49(casePkm(c)||'Puskesmas belum diisi')}</title></circle>`).join('');
 const exportUrl='https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/export?bbox='+bbox.join('%2C')+'&bboxSR=4326&imageSR=4326&size='+W+'%2C'+H+'&format=png32&transparent=false&dpi=96&f=image&layers=show%3A13%2C14%2C15';
 const fallback=`<div class="rbi-map-fallback"><b>Peta RBI BIG tidak dapat dimuat saat pratinjau/cetak.</b><br>Pastikan perangkat terhubung internet. Laporan tetap mencantumkan sumber resmi RBI BIG edisi Juni 2026.</div>`;
 const map=`<div class="rbi-map" style="position:relative;width:100%;max-width:${W}px;margin:auto;border:1px solid #bfc7d1;background:#eef2f7;overflow:hidden"><img src="${exportUrl}" alt="Peta RBI Kabupaten Gorontalo Utara — BIG edisi Juni 2026" style="display:block;width:100%;height:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div style="display:none;padding:35px;text-align:center">${fallback}</div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">${dots}</svg><div style="position:absolute;left:10px;bottom:10px;background:rgba(255,255,255,.92);padding:6px 9px;font-size:10px;border:1px solid #bbb"><b>● Kasus</b> &nbsp; Batas administrasi: RBI BIG</div></div>`;
 return `<div class="chart-box"><h4>Peta Sebaran Kasus — RBI Kabupaten Gorontalo Utara</h4>${map}<p class="muted">Peta laporan menggunakan RBI/BIG sebagai peta dasar dan batas administrasi. Titik merah menunjukkan kasus yang memiliki koordinat dan berada dalam extent peta. Sumber: Badan Informasi Geospasial, Geodatabase batas wilayah administrasi nasional edisi Juni 2026.</p></div><div class="chart-box"><h4>Insiden Rate per Wilayah Kerja Puskesmas — Denominator ${y}</h4>${valid.length?`<table class="report-table compact"><thead><tr><th>Puskesmas</th><th>Kasus</th><th>Penduduk</th><th>IR/100.000</th></tr></thead><tbody>${valid.map(r=>`<tr><td>${esc49(r.puskesmas)}</td><td>${r.cases}</td><td>${Number(r.population).toLocaleString('id-ID')}</td><td>${r.ir.toFixed(2)}</td></tr>`).join('')}</tbody></table>`:'<div class="notice">IR belum dapat dihitung. Isi master demografi tahun yang sesuai dan pastikan kasus memiliki Puskesmas.</div>'}</div>`;
}
 window.v49ReportMapHtml=reportMapHtml;
 const oldReportHtml=window.reportHtml;if(oldReportHtml)window.reportHtml=function(){const s=oldReportHtml();try{const d=reportData(),block=reportMapHtml(d),needle='<h4>3.5 Deskripsi Kontak';return s.includes(needle)?s.replace(needle,`<h4>3.4A Peta Sebaran Kasus dan Insiden Rate</h4>${block}${needle}`):s+block}catch(e){console.warn('v49 report map',e);return s}};
 const oldReportText=window.reportText;
 if(oldReportText)window.reportText=function(){
  const base=oldReportText();
  try{
   const d=reportData(),y=Number(E('repDemographyYearV49')?.value)||selectedYear(),old=E('demoYearV49')?.value;
   if(E('demoYearV49'))E('demoYearV49').value=String(y);
   const rates=calcRates().filter(r=>r.ir!=null).sort((a,b)=>b.ir-a.ir);
   if(E('demoYearV49')&&old)E('demoYearV49').value=old;
   const lines=rates.slice(0,15).map(r=>'- '+r.puskesmas+': '+r.cases+' kasus; penduduk '+r.population+'; IR '+r.ir.toFixed(2)+'/100.000').join('\n')||'-';
   return base+'\n\n3.4A PETA SEBARAN KASUS DAN INSIDEN RATE\nDenominator tahun: '+y+'\nKasus berkoordinat: '+d.cs.filter(c=>c.lat&&c.lng).length+'/'+d.cs.length+'\nIR dapat dihitung pada '+rates.length+'/15 wilayah Puskesmas.\n'+lines+'\nCatatan: peta laporan PE/KLB menggunakan RBI/BIG sebagai sumber peta dan batas administrasi; peta wilayah kerja Puskesmas tidak digunakan sebagai peta laporan.';
  }catch(e){return base}
 };


 /* ==================== V50 RBI EPIDEMIOLOGICAL CHOROPLETH ==================== */
 const V50_RBI_KEC='https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/14';
 const V50_CLASSES=[
  {max:0,label:'0',cls:'ir0'},
  {max:10,label:'>0–10',cls:'ir1'},
  {max:50,label:'>10–50',cls:'ir2'},
  {max:100,label:'>50–100',cls:'ir3'},
  {max:250,label:'>100–250',cls:'ir4'},
  {max:Infinity,label:'>250',cls:'ir5'}
 ];
 function norm50(v){return String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
 function irClass50(v){const n=Number(v)||0;return V50_CLASSES.find(x=>n<=x.max)||V50_CLASSES[V50_CLASSES.length-1]}
 function aggregateKec50(){
  const y=selectedYear(),rows=rowsFor(y),cs=activeCases(),pop={};
  rows.forEach(r=>{const k=norm50(r.kec);if(k)pop[k]=(pop[k]||0)+(Number(r.population)||0)});
  const cases={};
  cs.forEach(c=>{const k=norm50(c.district||c.kecamatan||c.kec||c.answers?.district||c.answers?.kecamatan||c.answers?.Kecamatan||'');if(k)cases[k]=(cases[k]||0)+1});
  const names={};rows.forEach(r=>{const k=norm50(r.kec);if(k&&!names[k])names[k]=r.kec});
  return Object.keys({...pop,...cases}).map(k=>({key:k,name:names[k]||k,cases:cases[k]||0,population:pop[k]||0,ir:pop[k]?(cases[k]||0)/pop[k]*100000:null}));
 }
 async function loadRbiKec50(){
  const url=V50_RBI_KEC+'/query?where='+encodeURIComponent("wadmkk='Gorontalo Utara'")+'&outFields='+encodeURIComponent('namobj,wadmkc,wadmkk,wadmpr,kdcbps')+'&returnGeometry=true&outSR=4326&f=geojson';
  const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('RBI HTTP '+r.status);return await r.json();
 }
 function color50(v){const c=irClass50(v);return ({ir0:'#eef2f7',ir1:'#e8f5e9',ir2:'#c8e6c9',ir3:'#fff3cd',ir4:'#ffd8a8',ir5:'#f8b4b4'})[c.cls]||'#eef2f7'}
 function legend50(){return `<div class="v50-legend"><b>Kelas IR / 100.000</b>${V50_CLASSES.map(c=>`<span><i class="v50-swatch" style="background:${color50(c.max===0?0:(c.max===Infinity?251:c.max))}"></i>${c.label}</span>`).join('')}</div>`}
 window.renderRbiEpiMapV50=async function(){
  const el=E('demoMapV49');if(!el)return;
  if(!window.L){el.innerHTML='<div class="notice">Peta memerlukan koneksi internet untuk memuat Leaflet dan RBI BIG.</div>';return}
  if(window.__demoMap49)window.__demoMap49.remove();
  window.__demoMap49=L.map(el).setView([0.82,122.85],9);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(window.__demoMap49);
  const metric=E('demoMetricV49')?.value||'ir',agg=aggregateKec50();
  let gj;try{gj=await loadRbiKec50()}catch(e){el.insertAdjacentHTML('beforeend',`<div class="notice" style="position:absolute;z-index:1000;top:10px;left:10px;background:#fff">RBI BIG belum dapat dimuat. Periksa koneksi internet.</div>`);return}
  const byName={};agg.forEach(x=>byName[norm50(x.name)]=x);
  const layer=L.geoJSON(gj,{style:f=>{const p=f.properties||{},k=norm50(p.wadmkc||p.namobj||'');const a=byName[k];const val=metric==='ir'?(a?.ir||0):(a?.cases||0);return {fillColor:metric==='ir'?color50(val):color50(val?Math.min(251,val*10):0),weight:1,color:'#555',fillOpacity:.62}},onEachFeature:(f,l)=>{const p=f.properties||{},k=norm50(p.wadmkc||p.namobj||''),a=byName[k];l.bindPopup(`<b>${esc49(p.wadmkc||p.namobj||'-')}</b><br>Kasus: ${a?.cases||0}<br>Penduduk ${selectedYear()}: ${Number(a?.population||0).toLocaleString('id-ID')}<br>IR: ${a?.ir==null?'Belum tersedia':a.ir.toFixed(2)+' / 100.000'}`)}}).addTo(window.__demoMap49);
  const cs=activeCases().filter(c=>Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lng)));cs.forEach(c=>L.circleMarker([+c.lat,+c.lng],{radius:5,weight:1,fillOpacity:.9}).addTo(window.__demoMap49).bindPopup(`<b>${esc49(c.id||'-')}</b><br>${esc49(c.name||'-')}<br>${esc49(c.district||c.kecamatan||'-')}`));
  try{window.__demoMap49.fitBounds(layer.getBounds().pad(.03))}catch(e){}
  const legend=L.control({position:'bottomright'});legend.onAdd=()=>{const d=document.createElement('div');d.innerHTML=metric==='ir'?legend50():`<div class="v50-legend"><b>Jumlah kasus</b><span><i class="v50-swatch" style="background:#eef2f7"></i>0</span><span><i class="v50-swatch" style="background:#c8e6c9"></i>1–5</span><span><i class="v50-swatch" style="background:#fff3cd"></i>6–10</span><span><i class="v50-swatch" style="background:#ffd8a8"></i>11–25</span><span><i class="v50-swatch" style="background:#f8b4b4"></i>>25</span></div>`;return d};legend.addTo(window.__demoMap49);
  if(E('demoMapTableV49'))E('demoMapTableV49').innerHTML=`<table><thead><tr><th>Kecamatan RBI</th><th>Kasus</th><th>Penduduk ${selectedYear()}</th><th>IR/100.000</th><th>Kelas IR</th></tr></thead><tbody>${agg.sort((a,b)=>(b.ir??-1)-(a.ir??-1)).map(a=>`<tr><td>${esc49(a.name)}</td><td>${a.cases}</td><td>${Number(a.population||0).toLocaleString('id-ID')}</td><td>${a.ir==null?'—':a.ir.toFixed(2)}</td><td>${a.ir==null?'Belum tersedia':irClass50(a.ir).label}</td></tr>`).join('')}</tbody></table><p class="small">Peta poligon: RBI/BIG, layer administrasi kecamatan. Titik: kasus yang memiliki koordinat. Kelas IR adalah klasifikasi tampilan aplikasi, bukan ambang resmi KLB.</p>`;
 };
 const oldRenderDemoMap49=window.renderDemographyMapV49;window.renderDemographyMapV49=window.renderRbiEpiMapV50;
 const oldReportMapHtmlV50=reportMapHtml;
 function reportMapHtmlV50(d){
  const base=oldReportMapHtmlV50(d);const y=Number(E('repDemographyYearV49')?.value)||selectedYear(),old=E('demoYearV49')?.value;if(E('demoYearV49'))E('demoYearV49').value=String(y);const agg=aggregateKec50().sort((a,b)=>(b.ir??-1)-(a.ir??-1));if(E('demoYearV49')&&old)E('demoYearV49').value=old;
  const tbl=agg.length?`<div class="chart-box"><h4>Kelas Insiden Rate Berdasarkan Kecamatan RBI — Denominator ${y}</h4><table class="report-table compact"><thead><tr><th>Kecamatan</th><th>Kasus</th><th>Penduduk</th><th>IR/100.000</th><th>Kelas</th></tr></thead><tbody>${agg.map(a=>`<tr><td>${esc49(a.name)}</td><td>${a.cases}</td><td>${Number(a.population||0).toLocaleString('id-ID')}</td><td>${a.ir==null?'—':a.ir.toFixed(2)}</td><td>${a.ir==null?'Belum tersedia':irClass50(a.ir).label}</td></tr>`).join('')}</tbody></table><p class="muted">Kelas IR digunakan untuk visualisasi epidemiologis dalam aplikasi dan bukan merupakan ambang resmi penetapan KLB.</p>${legend50()}</div>`:'';
  return base+tbl;
 }
 window.v49ReportMapHtml=reportMapHtmlV50;window.v50ReportMapHtml=reportMapHtmlV50;
 if(oldReportHtml)window.reportHtml=function(){const s=oldReportHtml();try{const block=reportMapHtmlV50(reportData()),needle='<h4>3.5 Deskripsi Kontak';return s.includes(needle)?s.replace(needle,`<h4>3.4A Peta Sebaran Kasus dan Insiden Rate</h4>${block}${needle}`):s+block}catch(e){console.warn('v50 report map',e);return s}};
 if(oldReportText)window.reportText=function(){const base=oldReportText();try{const y=Number(E('repDemographyYearV49')?.value)||selectedYear(),a=aggregateKec50().filter(x=>x.ir!=null).sort((x,y)=>y.ir-x.ir);return base+'\n\n3.4B KLASIFIKASI INSIDEN RATE BERDASARKAN KECAMATAN RBI\nDenominator tahun: '+y+'\n'+(a.map(x=>'- '+x.name+': '+x.cases+' kasus; penduduk '+x.population+'; IR '+x.ir.toFixed(2)+'/100.000; kelas '+irClass50(x.ir).label).join('\n')||'-')+'\nCatatan: kelas IR adalah klasifikasi tampilan aplikasi, bukan ambang resmi KLB.'}catch(e){return base}};
 window.V50_RBI={service:V50_RBI_KEC,source:'Badan Informasi Geospasial',edition:'Geodatabase batas wilayah administrasi nasional edisi Juni 2026',classes:V50_CLASSES};
 window.V49_RBI={service:'https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer',edition:'Batas Wilayah Administrasi nasional — edisi Juni 2026',source:'Badan Informasi Geospasial'};
 const oldPage=window.page;window.page=function(id,b){oldPage(id,b);setTimeout(()=>{if(id==='demografi'){renderDemographyV49();renderDemographyMapV49()}if(id==='laporan'){injectReportDemoField()}},100)};
 function injectReportDemoField(){const sec=E('laporan');if(!sec||E('v49ReportDemoField'))return;const grid=sec.querySelector('.grid2');if(!grid)return;const w=document.createElement('div');w.id='v49ReportDemoField';w.className='field';w.innerHTML='<label>Tahun denominator demografi untuk laporan</label><select id="repDemographyYearV49"></select><div class="small">Pilih tahun penduduk yang menjadi denominator IR pada laporan ini.</div>';grid.appendChild(w);E('repDemographyYearV49').innerHTML=years().map(y=>`<option value="${y}">${y}</option>`).join('');E('repDemographyYearV49').value=localStorage.getItem('gorut-report-demo-year')||String(new Date().getFullYear())}
 function init(){try{injectReportDemoField();renderDemographyV49()}catch(e){console.warn('v49 init',e)}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,300));else setTimeout(init,300);
})();


/* ==================== V51 EPIDEMIOLOGY INTELLIGENCE INTEGRATION ==================== */
(function(){
  const RBI='https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/14';
  const CLASSES=[{max:0,label:'0',cls:'ir0'},{max:10,label:'>0–10',cls:'ir1'},{max:50,label:'>10–50',cls:'ir2'},{max:100,label:'>50–100',cls:'ir3'},{max:250,label:'>100–250',cls:'ir4'},{max:Infinity,label:'>250',cls:'ir5'}];
  const norm=v=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const cls=v=>CLASSES.find(x=>(Number(v)||0)<=x.max)||CLASSES[5];
  const col=v=>({ir0:'#eef2f7',ir1:'#e8f5e9',ir2:'#c8e6c9',ir3:'#fff3cd',ir4:'#ffd8a8',ir5:'#f8b4b4'})[cls(v).cls];
  function year(){return Number(E('repDemographyYearV49')?.value||E('demoYearV49')?.value)||new Date().getFullYear()}
  function disease(){return E('demoDiseaseV49')?.value||''}
  function rows(y){return rowsFor(y)}
  function aggregate(d,y){
    const pop={}; rows(y).forEach(r=>{const k=norm(r.kec);if(k)pop[k]=(pop[k]||0)+(Number(r.population)||0)});
    const cases={}; (db.cases||[]).filter(c=>String(c.investigationId)===String(db.active)).filter(c=>!d||String(c.disease||'')===String(d)).forEach(c=>{const k=norm(c.district||c.kecamatan||c.kec||c.answers?.district||c.answers?.kecamatan||c.answers?.Kecamatan||'');if(k)cases[k]=(cases[k]||0)+1});
    const names={}; rows(y).forEach(r=>{const k=norm(r.kec);if(k&&!names[k])names[k]=r.kec});
    return Object.keys({...pop,...cases}).map(k=>({key:k,name:names[k]||k,cases:cases[k]||0,population:pop[k]||0,ir:pop[k]?(cases[k]||0)/pop[k]*100000:null}));
  }
  async function geo(){const u=RBI+'/query?where='+encodeURIComponent("wadmkk='Gorontalo Utara'")+'&outFields='+encodeURIComponent('namobj,wadmkc,wadmkk,wadmpr,kdcbps')+'&returnGeometry=true&outSR=4326&f=geojson';const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw Error('RBI '+r.status);return r.json()}
  window.V51_EPI={version:'v51',rbi:RBI,source:'Badan Informasi Geospasial',edition:'Geodatabase batas wilayah administrasi nasional edisi Juni 2026'};

  function flow(){
    const cs=(db.cases||[]).filter(c=>String(c.investigationId)===String(db.active));
    const inv=(db.investigations||[]).filter(i=>String(i.id)===String(db.active));
    const contacts=(db.contacts||[]).filter(x=>String(x.investigationId)===String(db.active));
    const specimens=(db.specimens||[]).filter(x=>String(x.investigationId)===String(db.active));
    const coords=cs.filter(c=>c.lat&&c.lng).length;
    const onset=cs.filter(c=>c.onset).length;
    const lab=cs.filter(c=>c.status&&/konfirmasi|probable|suspek/i.test(c.status)).length;
    return {investigations:inv.length,cases:cs.length,contacts:contacts.length,specimens:specimens.length,coords,onset,lab};
  }
  function renderFlow(){
    const el=E('v51Flow');if(!el)return;const f=flow();
    const items=[['Investigasi',f.investigations,'investigasi'],['Kasus',f.cases,'kasus'],['Kontak',f.contacts,'kontak'],['Spesimen',f.specimens,'spesimen'],['Koordinat',f.coords,'GIS'],['Onset',f.onset,'P-T-W']];
    el.innerHTML=items.map(x=>`<div class="v51-flow-item"><small>${x[0]}</small><b>${x[1]}</b><span>${x[1]>0?'Tersedia':'Belum ada data'}</span></div>`).join('');
    const q=E('v51Quality');if(q){const pct=f.cases?Math.round((f.coords+f.onset)/(2*f.cases)*100):0;q.innerHTML=`Kelengkapan inti kasus (koordinat + onset): <b>${pct}%</b>. ${f.cases&&pct<70?'Lengkapi data sebelum menarik kesimpulan spasial/tren.':'Data inti cukup untuk analisis eksploratif.'}`}
  }
  function injectIntel(){const p=E('intel');if(!p||E('v51IntegrationCard'))return;const card=document.createElement('div');card.id='v51IntegrationCard';card.className='card';card.innerHTML=`<div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">🔗 v51 — Epidemiology Data Integration</h3><div class="small">Satu sumber data kasus mengalir ke investigasi, kontak, spesimen, P-T-W, GIS, IR, PE/KLB, dan Research Studio.</div></div><button class="primary" onclick="renderV51Integration()">🔄 Sinkronkan Tampilan</button></div><div id="v51Flow" class="v51-flow"></div><div id="v51Quality" class="notice" style="margin-top:10px"></div><div class="toolbar" style="margin-top:10px"><button onclick="page('demografi')">🗺️ Peta & IR</button><button onclick="page('adminEpi');renderAdminEpiDashboard()">🏘️ Administratif</button><button onclick="page('penelitian')">🔬 Research Studio</button><button onclick="page('laporan')">📄 PE/KLB</button></div></div>`;p.insertBefore(card,p.children[1]||null);renderFlow()}
  window.renderV51Integration=renderFlow;

  const oldRenderMap=window.renderRbiEpiMapV50;
  window.renderRbiEpiMapV51=async function(){
    const el=E('demoMapV49');if(!el)return;if(!window.L){el.innerHTML='<div class="notice">Peta memerlukan koneksi internet untuk Leaflet dan RBI BIG.</div>';return}
    if(window.__demoMap49)window.__demoMap49.remove();
    const map=L.map(el).setView([0.82,122.85],9);window.__demoMap49=map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
    const y=Number(E('demoYearV49')?.value)||new Date().getFullYear(),d=disease(),metric=E('demoMetricV49')?.value||'ir',agg=aggregate(d,y),by={};agg.forEach(a=>by[norm(a.name)]=a);
    let gj;try{gj=await geo()}catch(e){el.innerHTML='<div class="notice">RBI BIG belum dapat dimuat. Periksa koneksi internet.</div>';return}
    const poly=L.geoJSON(gj,{style:f=>{const p=f.properties||{},a=by[norm(p.wadmkc||p.namobj)];const v=metric==='ir'?(a?.ir||0):(a?.cases||0);return {fillColor:metric==='ir'?col(v):col(v*10),color:'#555',weight:1,fillOpacity:.68}},onEachFeature:(f,l)=>{const p=f.properties||{},a=by[norm(p.wadmkc||p.namobj)];l.bindPopup(`<b>${esc49(p.wadmkc||p.namobj||'-')}</b><br>Kasus: ${a?.cases||0}<br>Penduduk ${y}: ${Number(a?.population||0).toLocaleString('id-ID')}<br>IR: ${a?.ir==null?'Belum tersedia':a.ir.toFixed(2)+' / 100.000'}`)}}).addTo(map);
    (db.cases||[]).filter(c=>String(c.investigationId)===String(db.active)).filter(c=>!d||String(c.disease||'')===String(d)).filter(c=>Number.isFinite(+c.lat)&&Number.isFinite(+c.lng)).forEach(c=>L.circleMarker([+c.lat,+c.lng],{radius:5,weight:1,fillOpacity:.9}).addTo(map).bindPopup(`<b>${esc49(c.id||'-')}</b><br>${esc49(c.name||'-')}<br>${esc49(c.district||c.kecamatan||'-')}`));
    try{map.fitBounds(poly.getBounds().pad(.03))}catch(e){}
    const lc=L.control({position:'bottomright'});lc.onAdd=()=>{const z=document.createElement('div');z.className='v51-legend';z.innerHTML=metric==='ir'?'<b>IR / 100.000</b>'+CLASSES.map(x=>`<span><i style="background:${col(x.max===Infinity?251:x.max)}"></i>${x.label}</span>`).join(''):'<b>Jumlah kasus (visual)</b><span><i style="background:#eef2f7"></i>0</span><span><i style="background:#c8e6c9"></i>1–5</span><span><i style="background:#fff3cd"></i>6–10</span><span><i style="background:#ffd8a8"></i>11–25</span><span><i style="background:#f8b4b4"></i>>25</span>';return z};lc.addTo(map);
    const t=E('demoMapTableV49');if(t)t.innerHTML=`<table><thead><tr><th>Kecamatan RBI</th><th>Kasus</th><th>Penduduk ${y}</th><th>IR/100.000</th><th>Kelas</th></tr></thead><tbody>${agg.sort((a,b)=>(b.ir??-1)-(a.ir??-1)).map(a=>`<tr><td>${esc49(a.name)}</td><td>${a.cases}</td><td>${Number(a.population||0).toLocaleString('id-ID')}</td><td>${a.ir==null?'—':a.ir.toFixed(2)}</td><td>${a.ir==null?'Belum tersedia':cls(a.ir).label}</td></tr>`).join('')}</tbody></table><p class="small">Peta: RBI/BIG, layer administrasi kecamatan. Titik: kasus berkoordinat. Kelas IR adalah klasifikasi visual aplikasi dan bukan ambang resmi KLB.</p>`;
  };
  window.renderDemographyMapV49=window.renderRbiEpiMapV51;

  const oldIntel=window.runDiseaseIntelligence;
  window.runDiseaseIntelligence=function(){if(oldIntel)oldIntel();setTimeout(()=>{injectIntel();renderFlow()},30)};
  const oldPage=window.page;
  window.page=function(id,b){oldPage(id,b);setTimeout(()=>{if(id==='intel'){injectIntel();renderFlow()}if(id==='demografi')window.renderRbiEpiMapV51();if(id==='laporan')injectReportDemoField()},120)};
  setTimeout(()=>{try{injectIntel();renderFlow()}catch(e){}},900);
})();
(function(){
  const E=id=>document.getElementById(id), esc53=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const cs53=()=>db.cases.filter(c=>String(c.investigationId)===String(db.active));
  const get53=(c,k)=>k.startsWith('answers.')?(c.answers||{})[k.slice(8)]:c[k];
  const bin53=v=>{if(v===true||v===1)return 1;if(v===false||v===0)return 0;if(v==null||v==='')return null;const s=String(v).trim().toLowerCase();if(['ya','yes','y','true','1','positif','positive','sakit','terpapar','makan','consumed'].includes(s))return 1;if(['tidak','no','n','false','0','negatif','negative','sehat','tidak terpapar','tidak makan','not consumed'].includes(s))return 0;return null};
  const label53=k=>k.startsWith('answers.')?k.slice(8).replace(/[_-]+/g,' '):({status:'Status kasus',outcome:'Outcome',sex:'Jenis kelamin',age:'Umur',onset:'Tanggal onset'}[k]||k);
  function fields53(){const keys=new Set(['status','outcome']);cs53().forEach(c=>Object.keys(c.answers||{}).forEach(k=>keys.add('answers.'+k)));return [...keys]}
  function table53(x,y){let a=0,b=0,c=0,d=0,miss=0;cs53().forEach(r=>{let xv=bin53(get53(r,x)),yv=bin53(get53(r,y));if(y==='status')yv=/konfirmasi|confirmed/i.test(String(get53(r,y)||''))?1:0;if(y==='outcome')yv=/meninggal|died|death/i.test(String(get53(r,y)||''))?1:0;if(x==='sex')xv=/^l|male|pria/i.test(String(get53(r,x)||''))?1:0;if(xv==null||yv==null){miss++;return}if(xv&&yv)a++;else if(xv&&!yv)b++;else if(!xv&&yv)c++;else d++});return{a,b,c,d,n:a+b+c+d,missing:miss}}
  function logFact53(n){if(n<0)return NaN;let s=0;for(let i=2;i<=n;i++)s+=Math.log(i);return s}
  function fisher53(t){const{a,b,c,d}=t,n=a+b+c+d,r=a+b,c1=a+c; if(!n)return NaN;const lp=(x)=>logFact53(r)-logFact53(x)-logFact53(r-x)+logFact53(n-r)-logFact53(c1-x)-logFact53(n-r-c1+x)-logFact53(n)+logFact53(n);const lo=Math.max(0,r+c1-n),hi=Math.min(r,c1),obs=lp(a);let p=0;for(let x=lo;x<=hi;x++){const q=lp(x);if(q<=obs+1e-12)p+=Math.exp(q)}return Math.min(1,p)}
  function chi53(t){const{a,b,c,d}=t,n=a+b+c+d,den=(a+b)*(c+d)*(a+c)*(b+d);if(!den)return NaN;return n*(a*d-b*c)**2/den}
  function pchi53(x){if(!isFinite(x))return NaN;const z=Math.sqrt(x);return Math.erf?1-Math.erf(z/Math.sqrt(2)):NaN}
  function rr53(t){return (t.a+t.b&&t.c+t.d&&t.c)?(t.a/(t.a+t.b))/(t.c/(t.c+t.d)):NaN}
  function or53(t){return t.b*t.c? t.a*t.d/(t.b*t.c):NaN}
  function ci53(est,se){if(!isFinite(est)||est<=0||!isFinite(se))return null;const l=Math.log(est);return [Math.exp(l-1.96*se),Math.exp(l+1.96*se)]}
  function calc53(){const x=E('v53Exposure')?.value,y=E('v53Outcome')?.value,design=E('v53Design')?.value||'cohort';if(!x||!y){E('v53Result').innerHTML='<div class="notice">Pilih outcome dan paparan.</div>';return}const t=table53(x,y),rr=rr53(t),or=or53(t),seRR=(t.a&&t.c&&t.a+t.b&&t.c+t.d)?Math.sqrt(1/t.a-1/(t.a+t.b)+1/t.c-1/(t.c+t.d)):NaN,seOR=(t.a&&t.b&&t.c&&t.d)?Math.sqrt(1/t.a+1/t.b+1/t.c+1/t.d):NaN;const rci=ci53(rr,seRR),oci=ci53(or,seOR),pF=fisher53(t),pC=pchi53(chi53(t));let arE=t.a+t.b?t.a/(t.a+t.b):NaN,arU=t.c+t.d?t.c/(t.c+t.d):NaN,rd=isFinite(arE)&&isFinite(arU)?arE-arU:NaN;window.v53Stats={design,exposure:x,outcome:y,table:t,attackRateExposed:arE,attackRateUnexposed:arU,riskDifference:rd,RR:rr,RR_CI95:rci,OR:or,OR_CI95:oci,chiSquare:chi53(t),chiSquareP:pC,fisherExactP:pF,generatedAt:new Date().toISOString()};let measure=design==='case-control'?`OR <b>${isFinite(or)?or.toFixed(3):'NA'}</b> (95% CI ${oci?oci.map(z=>z.toFixed(3)).join('–'):'NA'})`: `RR <b>${isFinite(rr)?rr.toFixed(3):'NA'}</b> (95% CI ${rci?rci.map(z=>z.toFixed(3)).join('–'):'NA'})`;E('v53Result').innerHTML=`<h3>Hasil Statistical Engine</h3><table class="report-table"><tr><th></th><th>Outcome +</th><th>Outcome −</th><th>Total</th></tr><tr><th>Paparan +</th><td>${t.a}</td><td>${t.b}</td><td>${t.a+t.b}</td></tr><tr><th>Paparan −</th><td>${t.c}</td><td>${t.d}</td><td>${t.c+t.d}</td></tr></table><div class="grid"><div class="stat"><small>${design==='case-control'?'Odds Ratio':'Relative Risk'}</small><b>${measure}</b></div><div class="stat"><small>Attack Rate exposed</small><b>${isFinite(arE)?(100*arE).toFixed(2)+'%':'NA'}</b></div><div class="stat"><small>Attack Rate unexposed</small><b>${isFinite(arU)?(100*arU).toFixed(2)+'%':'NA'}</b></div><div class="stat"><small>Risk Difference</small><b>${isFinite(rd)?(100*rd).toFixed(2)+' pp':'NA'}</b></div><div class="stat"><small>Fisher exact p</small><b>${isFinite(pF)?pF.toFixed(4):'NA'}</b></div><div class="stat"><small>Chi-square p</small><b>${isFinite(pC)?pC.toFixed(4):'NA'}</b></div></div><div class="notice"><b>Interpretasi:</b> ${design==='outbreak-retro-cohort'?'Retrospective cohort outbreak: utamakan Attack Rate, RR dan Risk Difference.':design==='case-control'?'Case-control: ukuran asosiasi utama adalah OR.':'Cohort: ukuran asosiasi utama adalah Attack Rate dan RR.'} Fisher exact ditampilkan sebagai alternatif ketika frekuensi sel kecil. Hasil tetap memerlukan pemeriksaan desain, definisi variabel, missing data, confounding dan validitas coding.</div>`}
  function inject53(){const b=E('biv');if(!b||E('v53Card'))return;const card=document.createElement('div');card.id='v53Card';card.className='card';card.style.marginTop='14px';card.innerHTML=`<div class="eyebrow">OUTBREAK STATISTICAL ENGINE · V53</div><h3 style="margin:3px 0">🧮 Analisis 2×2 berbasis variabel kuesioner</h3><div class="small">Engine membaca variabel nyata pada <code>case.answers</code>. Untuk KLB keracunan pangan tersedia mode retrospective cohort.</div><div class="grid3"><div class="field"><label>Desain analisis</label><select id="v53Design"><option value="outbreak-retro-cohort">Retrospective cohort outbreak</option><option value="cohort">Cohort</option><option value="case-control">Case-control</option></select></div><div class="field"><label>Outcome (Y)</label><select id="v53Outcome"></select></div><div class="field"><label>Exposure (X)</label><select id="v53Exposure"></select></div></div><button class="primary" onclick="runV53Stats()">🔬 Hitung Statistik</button><button onclick="exportV53Stats()">Ekspor JSON</button><div id="v53Result" class="report-preview"><div class="notice">Pilih variabel untuk memulai.</div></div>`;b.appendChild(card);populate53()}
  function populate53(){const f=fields53(),y=E('v53Outcome'),x=E('v53Exposure');if(!y||!x)return;const outs=f.filter(k=>['status','outcome'].includes(k));y.innerHTML=(outs.length?outs:f).map(k=>`<option value="${esc53(k)}">${esc53(label53(k))}</option>`).join('');x.innerHTML=f.filter(k=>k!==y.value&&k!=='id'&&k!=='age'&&k!=='onset').map(k=>`<option value="${esc53(k)}">${esc53(label53(k))}</option>`).join('');}
  window.runV53Stats=calc53;window.exportV53Stats=()=>{if(!window.v53Stats){calc53()}if(window.v53Stats){const blob=new Blob([JSON.stringify(window.v53Stats,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='GORUT-OUTBREAK-v53-2x2-analysis.json';a.click();URL.revokeObjectURL(a.href)}};
  const oldPage=window.page;window.page=function(id,b){const r=oldPage?.apply(this,arguments);setTimeout(()=>{if(id==='analisis'){inject53();populate53()}},100);return r};setTimeout(()=>{try{inject53()}catch(e){}},1000);
})();

/* ========================= V54 — ADVANCED OUTBREAK ANALYSIS ========================= */
(function(){
  const E54=id=>document.getElementById(id), esc54=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const cases54=()=>((db&&db.cases)||[]).filter(c=>String(c.investigationId)===String(db.active));
  const val54=(c,k)=>k.startsWith('answers.')?(c.answers||{})[k.slice(8)]:c[k];
  const norm54=v=>String(v??'').trim().toLowerCase();
  const bin54=v=>{
    if(v===true||v===1)return 1;if(v===false||v===0)return 0;if(v==null||v==='')return null;
    const s=norm54(v);if(['ya','yes','y','true','1','positif','positive','sakit','terpapar','makan','consumed','laki laki','laki-laki','male','pria'].includes(s))return 1;
    if(['tidak','no','n','false','0','negatif','negative','sehat','tidak terpapar','tidak makan','not consumed','perempuan','female','wanita'].includes(s))return 0;
    return null;
  };
  const label54=k=>k.startsWith('answers.')?k.slice(8).replace(/[_-]+/g,' '):({status:'Status kasus',outcome:'Outcome',sex:'Jenis kelamin',age:'Umur',onset:'Tanggal onset'}[k]||k);
  const allFields54=()=>{const s=new Set(['status','outcome']);cases54().forEach(c=>Object.keys(c.answers||{}).forEach(k=>s.add('answers.'+k)));return [...s]};
  function cat54(v){if(v==null||v==='')return null;return String(v).trim()}
  function table54(rows,x,y){let a=0,b=0,c=0,d=0,missing=0;rows.forEach(r=>{let xv=bin54(val54(r,x)),yv=bin54(val54(r,y));if(y==='status')yv=/konfirmasi|confirmed/i.test(String(val54(r,y)||''))?1:0;if(y==='outcome')yv=/meninggal|died|death/i.test(String(val54(r,y)||''))?1:0;if(x==='sex')xv=/^(l|male|pria)/i.test(String(val54(r,x)||''))?1:0;if(xv==null||yv==null){missing++;return}if(xv&&yv)a++;else if(xv&&!yv)b++;else if(!xv&&yv)c++;else d++});return{a,b,c,d,n:a+b+c+d,missing}};
  function mhStrata54(rows,x,y,z){const map={};rows.forEach(r=>{const sv=cat54(val54(r,z));if(sv==null)return;(map[sv]??=[]).push(r)});return Object.entries(map).map(([stratum,rs])=>({stratum,...table54(rs,x,y)})).filter(s=>s.n>0)}
  function or54(t){return t.b*t.c?t.a*t.d/(t.b*t.c):null}
  function rr54(t){const e=t.a+t.b,u=t.c+t.d;return e&&u&&t.c?((t.a/e)/(t.c/u)):null}
  function ciLog54(est,se){if(!(est>0)&&est!==0)return null;if(!isFinite(est)||!isFinite(se)||est<=0)return null;const l=Math.log(est);return [Math.exp(l-1.96*se),Math.exp(l+1.96*se)]}
  function ciOR54(t){if([t.a,t.b,t.c,t.d].some(v=>v<=0))return null;return ciLog54(or54(t),Math.sqrt(1/t.a+1/t.b+1/t.c+1/t.d))}
  function ciRR54(t){if([t.a,t.c].some(v=>v<=0))return null;const e=t.a+t.b,u=t.c+t.d;return ciLog54(rr54(t),Math.sqrt(1/t.a-1/e+1/t.c-1/u))}
  function mhOR54(ss){let num=0,den=0;ss.forEach(s=>{num+=s.a*s.d/s.n;den+=s.b*s.c/s.n});return den?num/den:null}
  function mhRR54(ss){let num=0,den=0;ss.forEach(s=>{const n1=s.a+s.b,n0=s.c+s.d;num+=s.a*n0/s.n;den+=s.c*n1/s.n});return den?num/den:null}
  function crude54(rows,x,y){const t=table54(rows,x,y);return{t,or:or54(t),rr:rr54(t),orCI:ciOR54(t),rrCI:ciRR54(t)}}
  function pctChange54(crude,adj){if(!(crude>0)||!(adj>0))return null;return (adj-crude)/crude*100}
  function pFisher54(t){
    const lf=n=>{let s=0;for(let i=2;i<=n;i++)s+=Math.log(i);return s};const n=t.a+t.b+t.c+t.d;if(!n)return null;const r=t.a+t.b,c=t.a+t.c;
    const lp=x=>lf(r)-lf(x)-lf(r-x)+lf(n-r)-lf(c-x)-lf(n-r-c+x)-lf(n)+lf(n);const lo=Math.max(0,r+c-n),hi=Math.min(r,c),obs=lp(t.a);let p=0;for(let x=lo;x<=hi;x++){const q=lp(x);if(q<=obs+1e-12)p+=Math.exp(q)}return Math.min(1,p);
  }
  function getSelected54(){return{design:E54('v54Design')?.value||'outbreak-retro-cohort',outcome:E54('v54Outcome')?.value,exposure:E54('v54Exposure')?.value,strata:E54('v54Strata')?.value||'',threshold:Number(E54('v54ConfThreshold')?.value)||10}}
  function runMH54(){
    const q=getSelected54(),rows=cases54();if(!q.outcome||!q.exposure||!q.strata){E54('v54Result').innerHTML='<div class="notice">Pilih outcome, exposure, dan variabel strata.</div>';return}
    const ss=mhStrata54(rows,q.exposure,q.outcome,q.strata),cr=crude54(rows,q.exposure,q.outcome),adjOR=mhOR54(ss),adjRR=mhRR54(ss),chosen=q.design==='case-control'?'OR':'RR',adj=chosen==='OR'?adjOR:adjRR,crude=chosen==='OR'?cr.or:cr.rr,change=pctChange54(crude,adj);
    const summary={design:q.design,outcome:q.outcome,exposure:q.exposure,strata:q.strata,strataResults:ss,crude,adjustedOR:adjOR,adjustedRR:adjRR,primaryMeasure:chosen,percentChange:change,confoundingScreen:change!=null&&Math.abs(change)>=q.threshold};
    window.v54MH=summary;
    E54('v54Result').innerHTML=`<h3>Hasil Mantel–Haenszel</h3><div class="grid"><div class="stat"><small>${chosen} crude</small><b>${crude==null?'—':crude.toFixed(3)}</b></div><div class="stat"><small>${chosen} adjusted (MH)</small><b>${adj==null?'—':adj.toFixed(3)}</b></div><div class="stat"><small>Perubahan estimasi</small><b>${change==null?'—':change.toFixed(1)+'%'}</b></div><div class="stat"><small>Strata valid</small><b>${ss.length}</b></div></div><table class="report-table"><tr><th>Strata</th><th>a</th><th>b</th><th>c</th><th>d</th><th>n</th><th>OR</th><th>RR</th></tr>${ss.map(s=>`<tr><td>${esc54(s.stratum)}</td><td>${s.a}</td><td>${s.b}</td><td>${s.c}</td><td>${s.d}</td><td>${s.n}</td><td>${or54(s)==null?'—':or54(s).toFixed(3)}</td><td>${rr54(s)==null?'—':rr54(s).toFixed(3)}</td></tr>`).join('')}</table><div class="notice">${summary.confoundingScreen?`<b>Skrining confounding:</b> perubahan estimasi ${Math.abs(change).toFixed(1)}% memenuhi ambang ${q.threshold}% yang dipilih. Ini adalah aturan skrining, bukan bukti kausalitas.`:'<b>Skrining confounding:</b> perubahan estimasi belum mencapai ambang yang dipilih. Confounding tetap perlu dinilai berdasarkan kerangka konsep/DAG dan pengetahuan substantif.'}</div>`;
  }
  function exposureCandidates54(){const f=allFields54();return f.filter(k=>!['status','outcome','age','onset'].includes(k));}
  function runMulti54(){
    const q=getSelected54(),rows=cases54(),fields=exposureCandidates54(),out=[];fields.forEach(x=>{const t=table54(rows,x,q.outcome),or=or54(t),rr=rr54(t);out.push({exposure:x,label:label54(x),...t,ARex:t.a+t.b?t.a/(t.a+t.b):null,ARun:t.c+t.d?t.c/(t.c+t.d):null,RR:rr,OR:or,fisher:pFisher54(t),missing:t.missing})});
    out.sort((a,b)=>((b.RR??-Infinity)-(a.RR??-Infinity)));window.v54Multi={outcome:q.outcome,design:q.design,results:out};
    E54('v54MultiResult').innerHTML=`<h3>Multi-Exposure Screening</h3><table class="report-table"><tr><th>Exposure</th><th>n</th><th>AR +</th><th>AR −</th><th>RR</th><th>OR</th><th>Fisher p</th><th>Missing</th></tr>${out.map(r=>`<tr><td>${esc54(r.label)}</td><td>${r.n}</td><td>${r.ARex==null?'—':(100*r.ARex).toFixed(1)+'%'}</td><td>${r.ARun==null?'—':(100*r.ARun).toFixed(1)+'%'}</td><td>${r.RR==null?'—':r.RR.toFixed(3)}</td><td>${r.OR==null?'—':r.OR.toFixed(3)}</td><td>${r.fisher==null?'—':r.fisher.toFixed(4)}</td><td>${r.missing}</td></tr>`).join('')}</table><div class="small">Screening seluruh variabel binary yang dapat dikodekan. Variabel dengan coding ambigu tidak akan menghasilkan estimasi yang valid. Hasil bukan pengganti analisis a priori atau multivariat.</div>`;
  }
  function runDose54(){
    const q=getSelected54(),rows=cases54(),field=E54('v54Dose')?.value;if(!field){E54('v54DoseResult').innerHTML='<div class="notice">Pilih variabel ordinal/numerik untuk analisis dose-response.</div>';return}
    const vals=rows.map(r=>({r,v:Number(val54(r,field))})).filter(x=>Number.isFinite(x.v));const cats=[...new Set(vals.map(x=>x.v))].sort((a,b)=>a-b);const out=cats.map(v=>{const rs=vals.filter(x=>x.v===v).map(x=>x.r),t=table54(rs,'__dose__',q.outcome);return{value:v,...t,AR:t.n?t.a/t.n:null}});
    // Recompute outcome directly because __dose__ is not a real field.
    const result=cats.map(v=>{const rs=vals.filter(x=>x.v===v).map(x=>x.r),yes=rs.filter(r=>bin54(val54(r,q.outcome))===1).length,no=rs.filter(r=>bin54(val54(r,q.outcome))===0).length;return{value:v,n:yes+no,events:yes,AR:yes+no?yes/(yes+no):null,missing:rs.length-yes-no}});
    window.v54Dose={field,outcome:q.outcome,results:result};
    E54('v54DoseResult').innerHTML=`<h3>Dose-response / kategori paparan</h3><table class="report-table"><tr><th>${esc54(label54(field))}</th><th>n</th><th>Outcome +</th><th>Attack rate</th><th>Missing outcome</th></tr>${result.map(r=>`<tr><td>${r.value}</td><td>${r.n}</td><td>${r.events}</td><td>${r.AR==null?'—':(100*r.AR).toFixed(1)+'%'}</td><td>${r.missing}</td></tr>`).join('')}</table><div class="notice">Pola kategori ditampilkan sebagai skrining dose-response. Tidak dinyatakan sebagai tren bermakna secara statistik karena uji tren formal belum diterapkan pada modul ini.</div>`;
  }
  function narrative54(){
    const m=window.v54MH,multi=window.v54Multi,d=window.v54Dose;if(!m)return 'Belum ada analisis stratifikasi Mantel–Haenszel yang dijalankan.';
    const measure=m.primaryMeasure,cr=m.crude?.[measure==='OR'?'or':'rr'],ad=measure==='OR'?m.adjustedOR:m.adjustedRR;let s=`Analisis ${m.design==='case-control'?'case-control':'kohort/retrospektif kohort'} menunjukkan estimasi ${measure} crude sebesar ${cr==null?'NA':cr.toFixed(2)} dan estimasi ${measure} Mantel–Haenszel setelah stratifikasi menurut ${label54(m.strata)} sebesar ${ad==null?'NA':ad.toFixed(2)} pada ${m.strataResults.length} strata valid.`;
    if(m.percentChange!=null)s+=` Perubahan estimasi dari crude ke adjusted adalah ${m.percentChange.toFixed(1)}%; ${m.confoundingScreen?'nilai ini memenuhi ambang skrining confounding yang dipilih dan perlu ditelaah lebih lanjut.':'nilai ini belum mencapai ambang skrining confounding yang dipilih.'}`;
    if(multi?.results?.length){const top=multi.results.filter(x=>x.RR!=null).slice(0,3);if(top.length)s+=` Screening multi-exposure menempatkan ${top.map(x=>label54(x.exposure)).join(', ')} sebagai paparan dengan RR tertinggi yang dapat dihitung.`}
    if(d?.results?.length>1)s+=' Analisis kategori paparan ditampilkan sebagai pola dose-response eksploratif dan belum merupakan uji tren formal.';
    return s;
  }
  function inject54(){
    const b=E54('biv');if(!b||E54('v54Card'))return;
    const card=document.createElement('div');card.id='v54Card';card.className='card';card.style.marginTop='14px';
    card.innerHTML=`<div class="eyebrow">ADVANCED OUTBREAK ANALYSIS · V54</div><h3 style="margin:3px 0">🧬 Stratifikasi, Confounding & Multi-Exposure</h3><div class="small">Analisis lanjutan menggunakan data investigasi aktif dan jawaban kuesioner. Hasil statistik adalah alat bantu dan harus divalidasi terhadap desain, definisi operasional, coding, missing data, dan kerangka kausal.</div><div class="grid2"><div class="field"><label>Desain</label><select id="v54Design"><option value="outbreak-retro-cohort">Retrospective cohort outbreak</option><option value="cohort">Cohort</option><option value="case-control">Case-control</option></select></div><div class="field"><label>Outcome (Y)</label><select id="v54Outcome"></select></div><div class="field"><label>Exposure utama (X)</label><select id="v54Exposure"></select></div><div class="field"><label>Stratifier / confounder</label><select id="v54Strata"></select></div><div class="field"><label>Ambang skrining confounding (%)</label><input id="v54ConfThreshold" type="number" value="10" min="0" step="1"></div><div class="field"><label>Variabel numerik/ordinal dose-response</label><select id="v54Dose"></select></div></div><div class="toolbar"><button class="primary" onclick="runMHAnalysisV54()">🔬 Mantel–Haenszel</button><button onclick="runMultiExposureV54()">🧪 Multi-Exposure</button><button onclick="runDoseResponseV54()">📈 Dose-Response</button><button onclick="exportV54Analysis()">⬇️ Ekspor JSON</button></div><div id="v54Result" class="report-preview"><div class="notice">Pilih variabel dan jalankan Mantel–Haenszel.</div></div><div id="v54MultiResult" class="report-preview"></div><div id="v54DoseResult" class="report-preview"></div><div class="card" style="margin-top:12px;background:#f8fafc"><h4>📝 Narasi otomatis untuk PE/KLB</h4><div id="v54Narrative" class="notice">Jalankan analisis untuk menghasilkan narasi.</div><button onclick="copyV54Narrative()">Salin Narasi</button></div></div>`;
    b.appendChild(card);populate54();
  }
  function populate54(){
    const f=allFields54(),y=E54('v54Outcome'),x=E54('v54Exposure'),z=E54('v54Strata'),dose=E54('v54Dose');if(!y||!x)return;
    const outs=f.filter(k=>['status','outcome'].includes(k));y.innerHTML=(outs.length?outs:f).map(k=>`<option value="${esc54(k)}">${esc54(label54(k))}</option>`).join('');
    const ex=f.filter(k=>!['status','outcome','age','onset'].includes(k));x.innerHTML=ex.map(k=>`<option value="${esc54(k)}">${esc54(label54(k))}</option>`).join('');
    z.innerHTML=f.filter(k=>!['status','outcome','age','onset'].includes(k)).map(k=>`<option value="${esc54(k)}">${esc54(label54(k))}</option>`).join('');
    dose.innerHTML=f.map(k=>`<option value="${esc54(k)}">${esc54(label54(k))}</option>`).join('');
  }
  function after54(){E54('v54Narrative').innerHTML=`${esc54(narrative54())}`}
  window.runMHAnalysisV54=()=>{runMH54();after54()};
  window.runMultiExposureV54=()=>{runMulti54();after54()};
  window.runDoseResponseV54=()=>{runDose54();after54()};
  window.exportV54Analysis=()=>{const data={generatedAt:new Date().toISOString(),MH:window.v54MH||null,multiExposure:window.v54Multi||null,doseResponse:window.v54Dose||null,narrative:narrative54()};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='GORUT-OUTBREAK-AI-v54-advanced-outbreak-analysis.json';a.click();URL.revokeObjectURL(a.href)};
  window.copyV54Narrative=()=>{const s=narrative54();if(navigator.clipboard)navigator.clipboard.writeText(s);else{const t=document.createElement('textarea');t.value=s;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}};

  // Add v54 summary automatically to the PE/KLB HTML/TXT report without replacing the existing report engine.
  const oldRH54=window.reportHtml,oldRT54=window.reportText;
  window.reportHtml=function(){const base=oldRH54?oldRH54.apply(this,arguments):'';if(!window.v54MH&&!window.v54Multi&&!window.v54Dose)return base;return base+`<div class="page-break"></div><h3>Analisis Statistik Lanjutan v54</h3><div class="exec"><b>Narasi statistik:</b><br>${esc54(narrative54())}</div>${window.v54MH?`<h4>Mantel–Haenszel</h4><table class="report-table"><tr><th>Ukuran</th><th>Crude</th><th>Adjusted MH</th><th>Perubahan</th></tr><tr><td>${window.v54MH.primaryMeasure}</td><td>${(window.v54MH.crude?.[window.v54MH.primaryMeasure==='OR'?'or':'rr']??NaN).toFixed?window.v54MH.crude[window.v54MH.primaryMeasure==='OR'?'or':'rr'].toFixed(3):'—'}</td><td>${(window.v54MH.primaryMeasure==='OR'?window.v54MH.adjustedOR:window.v54MH.adjustedRR)?.toFixed?.(3)||'—'}</td><td>${window.v54MH.percentChange==null?'—':window.v54MH.percentChange.toFixed(1)+'%'}</td></tr></table>`:''}<p class="muted">Catatan: v54 merupakan analisis pendukung berbasis data investigasi aktif; interpretasi akhir harus mempertimbangkan desain studi, confounding, bias, missing data, dan validitas coding.</p>`};
  window.reportText=function(){const base=oldRT54?oldRT54.apply(this,arguments):'';return base+'\n\nANALISIS STATISTIK LANJUTAN v54\n'+narrative54()+'\nCatatan: analisis v54 merupakan analisis pendukung dan perlu validasi metodologis.'};

  const oldPage54=window.page;window.page=function(id,b){const r=oldPage54?.apply(this,arguments);setTimeout(()=>{if(id==='analisis'){inject54();populate54()}},120);return r};
  setTimeout(()=>{try{inject54();populate54()}catch(e){console.warn('v54 init',e)}},1200);
})();

/* ========================= V55 — AUTOMATED PE/KLB INTELLIGENCE ========================= */
(function(){
  const E55=id=>document.getElementById(id), esc55=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const inv55=()=>((db&&db.investigations)||[]).find(x=>String(x.id)===String(db.active));
  const cases55=()=>((db&&db.cases)||[]).filter(c=>String(c.investigationId)===String(db.active));
  const contacts55=()=>((db&&db.contacts)||[]).filter(c=>String(c.investigationId)===String(db.active));
  const specs55=()=>((db&&db.specimens)||[]).filter(c=>String(c.investigationId)===String(db.active));
  const visits55=()=>((db&&db.fieldVisits)||[]).filter(c=>String(c.investigationId)===String(db.active));
  const norm55=v=>String(v??'').trim().toLowerCase();
  const outcome55=c=>/meninggal|died|death/i.test(String(c.outcome||''));
  const conf55=c=>/konfirmasi|confirmed/i.test(String(c.status||''));
  const status55=c=>String(c.status||'').trim();
  function build55(){
    const o=inv55(),cs=cases55(),ct=contacts55(),sp=specs55(),fv=visits55();
    if(!o)return null;
    const onset=cs.filter(c=>c.onset); const geo=cs.filter(c=>Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lng)));
    const byDate={};onset.forEach(c=>{const d=String(c.onset).slice(0,10);byDate[d]=(byDate[d]||0)+1});
    const dates=Object.keys(byDate).sort(); const peak=dates.length?dates.reduce((a,b)=>byDate[b]>byDate[a]?b:a):null;
    const total=cs.length, deaths=cs.filter(outcome55).length, confirmed=cs.filter(conf55).length, probable=cs.filter(c=>/probable/i.test(status55(c))).length;
    const completeness={onset:total?onset.length/total*100:null,coordinates:total?geo.length/total*100:null,lab:sp.length?sp.filter(s=>s.result&& !/belum|pending/i.test(String(s.result))).length/sp.length*100:null,contacts:ct.length};
    const alerts=[];
    if(!total)alerts.push({level:'critical',text:'Belum ada kasus pada investigasi aktif.'});
    if(total&&completeness.onset<80)alerts.push({level:'warning',text:`Kelengkapan tanggal onset ${completeness.onset.toFixed(1)}%; lengkapi untuk analisis waktu.`});
    if(total&&completeness.coordinates<80)alerts.push({level:'warning',text:`Kelengkapan koordinat ${completeness.coordinates.toFixed(1)}%; peta kasus belum lengkap.`});
    if(sp.length&&completeness.lab<80)alerts.push({level:'warning',text:`Hasil laboratorium tersedia pada ${completeness.lab.toFixed(1)}% spesimen.`});
    if(total&&deaths>0)alerts.push({level:'high',text:`Terdapat ${deaths} kematian; evaluasi CFR dan faktor risiko keparahan.`});
    if(!ct.length)alerts.push({level:'warning',text:'Belum ada kontak tercatat pada investigasi aktif.'});
    if(!fv.length)alerts.push({level:'info',text:'Belum ada kunjungan lapangan tercatat.'});
    const qualityScore=Math.max(0,Math.min(100,Math.round((
      (total?Math.min(100,completeness.onset||0):0)*.30+
      (total?Math.min(100,completeness.coordinates||0):0)*.20+
      (sp.length?Math.min(100,completeness.lab||0):100)*.15+
      (total?100:0)*.20+
      (ct.length?100:0)*.15
    ))));
    let signal='Deskriptif';
    if(total>=2&&peak&&dates.length>=2)signal='Ada pola temporal yang dapat dianalisis lebih lanjut';
    if(total>=2&&deaths>0)signal+='; terdapat sinyal keparahan';
    const result={version:'v55',investigationId:db.active,disease:o.disease,name:o.name,total,confirmed,probable,deaths,CFR_percent:total?deaths/total*100:null,onsetCoverage_percent:completeness.onset,coordinateCoverage_percent:completeness.coordinates,labCoverage_percent:completeness.lab,contacts:ct.length,specimens:sp.length,fieldVisits:fv.length,peakOnset:peak,peakCases:peak?byDate[peak]:null,temporalDates:dates,temporalCounts:byDate,dataQualityScore:qualityScore,alerts,signal,generatedAt:new Date().toISOString()};
    return result;
  }
  function report55(){
    const r=window.V55_Intelligence||build55();if(!r)return 'Belum ada investigasi aktif.';
    const disease=(typeof diseases!=='undefined'&&diseases[r.disease])?diseases[r.disease].name:r.disease||'-';
    let s=`Investigasi ${r.name||'-'} (${disease}) memiliki ${r.total} kasus, terdiri dari ${r.confirmed} kasus konfirmasi dan ${r.probable} probable, dengan ${r.deaths} kematian`;
    if(r.CFR_percent!=null)s+=` (CFR ${r.CFR_percent.toFixed(1)}%)`;
    s+='.';
    if(r.peakOnset)s+=` Puncak onset tercatat pada ${r.peakOnset} sebanyak ${r.peakCases} kasus.`;
    s+=` Kelengkapan onset ${r.onsetCoverage_percent==null?'belum dapat dihitung':r.onsetCoverage_percent.toFixed(1)+'%'}, koordinat ${r.coordinateCoverage_percent==null?'belum dapat dihitung':r.coordinateCoverage_percent.toFixed(1)+'%'}`;
    if(r.labCoverage_percent!=null)s+=`, dan hasil spesimen ${r.labCoverage_percent.toFixed(1)}% tersedia`;
    s+='.';
    if(r.alerts.length)s+=` Prioritas tindak lanjut: ${r.alerts.filter(x=>x.level!=='info').map(x=>x.text).join(' ')} `;
    s+=` Skor kualitas data operasional ${r.dataQualityScore}/100. Hasil ini merupakan ringkasan berbantuan aturan/data aplikasi dan bukan penetapan KLB otomatis.`;
    if(window.v54MH){const m=window.v54MH,measure=m.primaryMeasure,cr=m.crude?.[measure==='OR'?'or':'rr'],ad=measure==='OR'?m.adjustedOR:m.adjustedRR;if(cr!=null||ad!=null)s+=` Analisis stratifikasi v54 menghasilkan ${measure} crude ${cr==null?'NA':cr.toFixed(2)} dan adjusted Mantel–Haenszel ${ad==null?'NA':ad.toFixed(2)}.`;}
    return s.trim();
  }
  function render55(){
    const el=E55('v55Result');if(!el)return;const r=build55();window.V55_Intelligence=r;if(!r){el.innerHTML='<div class="notice">Pilih investigasi aktif terlebih dahulu.</div>';return;}
    const alertHtml=r.alerts.map(a=>`<div class="notice ${a.level==='critical'?'danger':''}"><b>${a.level.toUpperCase()}</b> — ${esc55(a.text)}</div>`).join('')||'<div class="notice">Tidak ada alert kualitas/kelengkapan utama dari indikator yang diperiksa.</div>';
    const timeline=r.temporalDates.map(d=>`<div class="epi-col"><span class="epi-count">${r.temporalCounts[d]}</span><div class="epi-bar" style="height:${Math.max(5,r.temporalCounts[d]/Math.max(...r.temporalDates.map(x=>r.temporalCounts[x]))*150)}px"></div><span class="epi-date">${esc55(d)}</span></div>`).join('');
    el.innerHTML=`<div class="grid"><div class="stat"><small>Total kasus</small><b>${r.total}</b></div><div class="stat"><small>Konfirmasi</small><b>${r.confirmed}</b></div><div class="stat"><small>Probable</small><b>${r.probable}</b></div><div class="stat"><small>CFR</small><b>${r.CFR_percent==null?'—':r.CFR_percent.toFixed(1)+'%'}</b></div><div class="stat"><small>Kualitas data</small><b>${r.dataQualityScore}/100</b></div><div class="stat"><small>Kontak</small><b>${r.contacts}</b></div></div>
      <div class="grid2"><div class="chart-box"><h4>⏱️ Sinyal temporal</h4>${timeline?`<div class="epi-chart">${timeline}</div>`:'<div class="notice">Belum tersedia onset yang cukup untuk kurva.</div>'}<p class="small">Puncak: <b>${r.peakOnset||'—'}</b>${r.peakCases!=null?` (${r.peakCases} kasus)`:''}</p></div><div class="chart-box"><h4>🧭 Prioritas tindak lanjut</h4>${alertHtml}</div></div>
      <div class="grid2"><div class="chart-box"><h4>📊 Kelengkapan data</h4><table><tr><th>Indikator</th><th>Nilai</th></tr><tr><td>Onset</td><td>${r.onsetCoverage_percent==null?'—':r.onsetCoverage_percent.toFixed(1)+'%'}</td></tr><tr><td>Koordinat</td><td>${r.coordinateCoverage_percent==null?'—':r.coordinateCoverage_percent.toFixed(1)+'%'}</td></tr><tr><td>Hasil spesimen</td><td>${r.labCoverage_percent==null?'—':r.labCoverage_percent.toFixed(1)+'%'}</td></tr><tr><td>Kontak tercatat</td><td>${r.contacts}</td></tr><tr><td>Kunjungan lapangan</td><td>${r.fieldVisits}</td></tr></table></div><div class="chart-box"><h4>📝 Kesimpulan otomatis</h4><p>${esc55(report55())}</p><p class="small">Gunakan narasi ini sebagai draft; validasi definisi kasus, denominator, bias, confounding, dan konteks lapangan sebelum laporan resmi.</p></div></div>`;
  }
  function inject55(){
    const b=E55('biv');if(!b||E55('v55Card'))return;const card=document.createElement('div');card.id='v55Card';card.className='card';card.style.marginTop='14px';
    card.innerHTML=`<div class="eyebrow">AUTOMATED PE/KLB INTELLIGENCE · V55</div><h3 style="margin:3px 0">🧠 Ringkasan Intelijen Epidemiologi Otomatis</h3><div class="small">Menggabungkan deskriptif v52, analisis 2×2 v53, stratifikasi v54, kelengkapan data, kontak, spesimen, kunjungan lapangan, dan indikator GIS/IR yang tersedia. Modul ini membantu menyusun prioritas, bukan menetapkan KLB secara otomatis.</div><div class="toolbar"><button class="primary" onclick="runV55Intelligence()">🔄 Jalankan Intelligence</button><button onclick="copyV55Narrative()">📋 Salin Narasi PE/KLB</button><button onclick="exportV55Intelligence()">⬇️ Ekspor JSON</button></div><div id="v55Result" class="report-preview"><div class="notice">Klik “Jalankan Intelligence” untuk membaca investigasi aktif.</div></div>`;
    b.appendChild(card);
  }
  window.runV55Intelligence=()=>{render55();if(E55('v55Result'))E55('v55Result').scrollIntoView({behavior:'smooth',block:'nearest'});};
  window.copyV55Narrative=()=>{const s=report55();if(navigator.clipboard)navigator.clipboard.writeText(s);else{const t=document.createElement('textarea');t.value=s;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}};
  window.exportV55Intelligence=()=>{const r=build55();if(!r)return alert('Pilih investigasi aktif terlebih dahulu.');const data={intelligence:r,narrative:report55(),v52:window.V52_AdvancedEpi||null,v53:window.v53Stats||null,v54MH:window.v54MH||null,v54Multi:window.v54Multi||null,v54Dose:window.v54Dose||null};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='GORUT-OUTBREAK-AI-v55-PE-KLB-INTELLIGENCE.json';a.click();URL.revokeObjectURL(a.href)};
  const oldRH55=window.reportHtml,oldRT55=window.reportText;
  window.reportHtml=function(){const base=oldRH55?oldRH55.apply(this,arguments):'';const r=window.V55_Intelligence||build55();if(!r)return base;return base+`<div class="page-break"></div><h3>Analisis Intelijen Epidemiologi Otomatis v55</h3><div class="exec"><b>Ringkasan:</b><br>${esc55(report55())}</div><h4>Indikator investigasi</h4><table class="report-table"><tr><th>Indikator</th><th>Hasil</th></tr><tr><td>Total kasus</td><td>${r.total}</td></tr><tr><td>Konfirmasi</td><td>${r.confirmed}</td></tr><tr><td>Probable</td><td>${r.probable}</td></tr><tr><td>Kematian</td><td>${r.deaths}</td></tr><tr><td>CFR</td><td>${r.CFR_percent==null?'—':r.CFR_percent.toFixed(1)+'%'}</td></tr><tr><td>Kelengkapan onset</td><td>${r.onsetCoverage_percent==null?'—':r.onsetCoverage_percent.toFixed(1)+'%'}</td></tr><tr><td>Kelengkapan koordinat</td><td>${r.coordinateCoverage_percent==null?'—':r.coordinateCoverage_percent.toFixed(1)+'%'}</td></tr><tr><td>Skor kualitas data</td><td>${r.dataQualityScore}/100</td></tr></table><h4>Prioritas tindak lanjut</h4><ul>${r.alerts.map(a=>`<li>${esc55(a.text)}</li>`).join('')||'<li>Tidak ada alert utama.</li>'}</ul><p class="muted">Catatan: v55 merupakan ringkasan berbantuan aturan dan data aplikasi. Penetapan KLB, interpretasi kausal, dan rekomendasi final tetap memerlukan validasi epidemiologis.</p>`};
  window.reportText=function(){const base=oldRT55?oldRT55.apply(this,arguments):'';const r=window.V55_Intelligence||build55();return r?base+'\n\nANALISIS INTELIJEN EPIDEMIOLOGI OTOMATIS v55\n'+report55()+'\nSkor kualitas data: '+r.dataQualityScore+'/100\n':base};
  const oldPage55=window.page;window.page=function(id,b){const r=oldPage55?.apply(this,arguments);setTimeout(()=>{if(id==='analisis'){inject55();render55()}},120);return r};
  setTimeout(()=>{try{inject55()}catch(e){console.warn('v55 init',e)}},1400);
})();


/* ==================== v56 Integrated Epidemiological Decision Support ==================== */
(function(){
  const esc56=v=>String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const E56=id=>document.getElementById(id);
  function active56(){return typeof act==='function'?act():null}
  function cases56(){const a=active56();return a?db.cases.filter(c=>c.investigationId===a.id):[]}
  function contacts56(){const a=active56();return a?db.contacts.filter(c=>c.investigationId===a.id):[]}
  function inv56(){const a=active56();return a?db.investigations.find(i=>i.id===a.id):null}
  function outcome56(c){return c.status==='Konfirmasi'||c.status==='Probable'||c.outcome==='Meninggal'||c.healthStatus==='Sakit'||c.sick===true}
  function bin56(v){const x=String(v??'').trim().toLowerCase();if(['1','ya','yes','true','positif','positive','sakit','kasus','terpapar','exposed','makan'].includes(x))return 1;if(['0','tidak','no','false','negatif','negative','sehat','kontrol','tidak terpapar','unexposed','tidak makan'].includes(x))return 0;return null}
  function qValue56(c,key){if(key==='status')return c.status;if(key==='outcome')return c.outcome;if(key==='sex')return c.sex;if(key==='age')return c.age;if(key==='disease')return c.disease;if(c.answers&&key in c.answers)return c.answers[key];if(key.startsWith('answers.')&&c.answers)return c.answers[key.slice(8)];return c[key]}
  function table56(rows){let a=0,b=0,c=0,d=0;rows.forEach(r=>{if(r.x===1&&r.y===1)a++;else if(r.x===1&&r.y===0)b++;else if(r.x===0&&r.y===1)c++;else if(r.x===0&&r.y===0)d++});return {a,b,c,d,n:a+b+c+d}}
  function measures56(t){const arE=t.a/(t.a+t.b||1),arU=t.c/(t.c+t.d||1),rr=(t.c+t.d)>0?arE/arU:null,or=(t.b*t.c)>0?(t.a*t.d)/(t.b*t.c):null;return {arE,arU,rr,or,rd:arE-arU}}
  function intelligence56(){const cs=cases56(),ct=contacts56(),o=inv56();if(!o)return null;const deaths=cs.filter(c=>c.outcome==='Meninggal').length;const confirmed=cs.filter(c=>c.status==='Konfirmasi').length;const coords=cs.filter(c=>Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lng))).length;const onset=cs.filter(c=>c.onset).length;const exposedCandidates={};cs.forEach(c=>Object.entries(c.answers||{}).forEach(([k,v])=>{if(bin56(v)!==null)(exposedCandidates[k]??={valid:0,one:0,zero:0});const b=bin56(v);if(b!==null){exposedCandidates[k].valid++;exposedCandidates[k][b?'one':'zero']++}}));const dataQuality=Math.round((cs.length?onset/cs.length*.25:0)+(cs.length?coords/cs.length*.25:0)+(cs.length?confirmed/cs.length*.15:0)+(ct.length?1*.15:0)+(cs.length?1*.20:0)*100);let readiness='Siap dianalisis';if(cs.length<2)readiness='Data kasus belum cukup';else if(dataQuality<60)readiness='Perlu perbaikan kualitas data';return {version:'v56',investigationId:o.id,name:o.name,disease:o.disease,total:cs.length,confirmed,deaths,CFR:cs.length?deaths/cs.length:null,contacts:ct.length,onsetCoverage:cs.length?onset/cs.length:null,coordinateCoverage:cs.length?coords/cs.length:null,dataQuality:Math.max(0,Math.min(100,dataQuality)),readiness,exposures:exposedCandidates,generatedAt:new Date().toISOString()}}
  function render56(){const el=E56('v56Result');if(!el)return;const r=intelligence56();window.V56_Decision=r;if(!r){el.innerHTML='<div class="notice">Pilih investigasi aktif terlebih dahulu.</div>';return}const risk=r.dataQuality<60?'Perlu perbaikan data':(r.deaths?'Perlu evaluasi keparahan dan kematian':'Tidak ada sinyal keparahan dari indikator dasar');const exp=Object.keys(r.exposures).map(k=>{const rows=cases56().map(c=>({x:bin56(qValue56(c,k)),y:outcome56(c)?1:0})).filter(x=>x.x!==null);const t=table56(rows),m=measures56(t);return {k,n:t.n,rr:m.rr,or:m.or,arE:m.arE,arU:m.arU}}).filter(x=>x.n>=4).sort((a,b)=>(b.rr||-1)-(a.rr||-1)).slice(0,8);el.innerHTML=`<div class="grid"><div class="stat"><small>Kesiapan keputusan</small><b>${esc56(r.readiness)}</b></div><div class="stat"><small>Kualitas data</small><b>${r.dataQuality}/100</b></div><div class="stat"><small>Kasus</small><b>${r.total}</b></div><div class="stat"><small>Kontak</small><b>${r.contacts}</b></div></div><div class="grid2"><div class="chart-box"><h4>🧭 Decision Pathway</h4><ol><li>Verifikasi definisi kasus dan line listing.</li><li>Lengkapi onset, lokasi, laboratorium, dan kontak.</li><li>Gunakan AR/RR untuk cohort/retrospective cohort.</li><li>Gunakan OR untuk case-control.</li><li>Gunakan stratifikasi/MH bila confounding atau effect modification perlu dinilai.</li><li>Validasi rekomendasi dengan temuan lapangan sebelum respons resmi.</li></ol></div><div class="chart-box"><h4>⚠️ Prioritas</h4><div class="notice">${esc56(risk)}</div><div class="notice">Kelengkapan onset: ${(r.onsetCoverage*100).toFixed(1)}% · koordinat: ${(r.coordinateCoverage*100).toFixed(1)}% · CFR: ${r.CFR==null?'—':(r.CFR*100).toFixed(1)+'%'}</div></div></div><div class="chart-box"><h4>📊 Paparan kandidat</h4>${exp.length?`<table class="report-table"><tr><th>Variabel</th><th>n valid</th><th>AR exposed</th><th>AR unexposed</th><th>RR</th><th>OR</th></tr>${exp.map(x=>`<tr><td>${esc56(x.k)}</td><td>${x.n}</td><td>${(x.arE*100).toFixed(1)}%</td><td>${(x.arU*100).toFixed(1)}%</td><td>${x.rr==null?'—':x.rr.toFixed(2)}</td><td>${x.or==null?'—':x.or.toFixed(2)}</td></tr>`).join('')}</table>`:'<div class="notice">Belum ada variabel binary dengan jumlah observasi memadai untuk screening otomatis.</div>'}</div>`}
  function inject56(){const d=E56('dashboard');if(!d||E56('v56Card'))return;const card=document.createElement('div');card.id='v56Card';card.className='card';card.style.marginTop='14px';card.innerHTML=`<div class="eyebrow">INTEGRATED EPIDEMIOLOGICAL DECISION SUPPORT · V56</div><h3 style="margin:3px 0">🧠 Decision Support PE/KLB</h3><div class="small">Menghubungkan kesiapan data, hasil analisis v52–v55, paparan prioritas, GIS/IR, rantai penularan, dan rekomendasi respons. Sistem tidak menetapkan KLB atau kausalitas secara otomatis.</div><div class="toolbar"><button class="primary" onclick="runV56DecisionSupport()">🔄 Jalankan Decision Support</button><button onclick="exportV56DecisionSupport()">⬇️ Ekspor JSON</button></div><div id="v56Result" class="report-preview"><div class="notice">Klik “Jalankan Decision Support” untuk memproses investigasi aktif.</div></div>`;d.appendChild(card)}
  window.runV56DecisionSupport=()=>{render56();E56('v56Result')?.scrollIntoView({behavior:'smooth',block:'nearest'})};
  window.exportV56DecisionSupport=()=>{const r=intelligence56();if(!r)return alert('Pilih investigasi aktif terlebih dahulu.');const data={v56:r,v55:window.V55_Intelligence||null,v54MH:window.v54MH||null,v54Multi:window.v54Multi||null,v54Dose:window.v54Dose||null,v53:window.v53Stats||null,v52:window.V52_AdvancedEpi||null};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='GORUT-OUTBREAK-AI-v56-DECISION-SUPPORT.json';a.click();URL.revokeObjectURL(a.href)};
  const oldRH=window.reportHtml,oldRT=window.reportText;window.reportHtml=function(){const base=oldRH?oldRH.apply(this,arguments):'';const r=intelligence56();if(!r)return base;return base+`<div class="page-break"></div><h3>Integrated Epidemiological Decision Support v56</h3><div class="exec"><b>Kesiapan:</b> ${esc56(r.readiness)} · <b>Skor kualitas:</b> ${r.dataQuality}/100<br><b>Prioritas:</b> ${esc56(r.deaths?'Evaluasi keparahan/kematian dan faktor risiko.':'Lengkapi verifikasi kasus, onset, lokasi, laboratorium, dan kontak sesuai kebutuhan.')}</div><h4>Alur keputusan</h4><ol><li>Validasi definisi kasus dan line listing.</li><li>Lengkapi variabel kritis orang-tempat-waktu.</li><li>Pilih ukuran asosiasi sesuai desain studi.</li><li>Gunakan stratifikasi bila diperlukan.</li><li>Validasi rekomendasi dengan hasil lapangan.</li></ol><p class="muted">v56 adalah decision-support berbasis aturan dan data aplikasi; bukan penetapan KLB otomatis dan bukan pengganti keputusan epidemiologis.</p>`};window.reportText=function(){const base=oldRT?oldRT.apply(this,arguments):'';const r=intelligence56();return r?base+'\n\nINTEGRATED EPIDEMIOLOGICAL DECISION SUPPORT v56\nKesiapan: '+r.readiness+'\nSkor kualitas data: '+r.dataQuality+'/100\nPrioritas: '+(r.deaths?'Evaluasi keparahan/kematian dan faktor risiko.':'Lengkapi verifikasi kasus, onset, lokasi, laboratorium, dan kontak sesuai kebutuhan.')+'\n':base};
  const oldPage=window.page;window.page=function(id,b){const r=oldPage?.apply(this,arguments);setTimeout(()=>{if(id==='dashboard'){inject56();render56()}},80);return r};setTimeout(()=>{try{inject56();render56()}catch(e){console.warn('v56 init',e)}},1200);

  /* Remove legacy payment/subscription UI and make v45 login the sole access gate. */
  function removePayment56(){
    document.querySelectorAll('#v27AccessAdmin,#v28AccessAdmin,[id*="Payment"],[id*="payment"],[id*="Subscription"],[id*="subscription"]').forEach(e=>e.remove());
    document.querySelectorAll('.v30-receipt-note,.v30-access-banner').forEach(e=>{if(/bayar|pembayaran|payment|premium|tarif|BNI|Rp30/i.test(e.textContent||''))e.remove()});
    const txt=/pembayaran|konfirmasi pembayaran|verifikasi pembayaran|tarif|Rp30\.000|masa akses 7 hari|akses Premium/i;
    document.querySelectorAll('body *').forEach(e=>{if(e.children.length===0&&txt.test(e.textContent||''))e.style.display='none'});
  }
  function forceLogin56(){
    try{localStorage.removeItem(SESSION_KEY)}catch(e){}
    try{const sb=window.GORUT_BACKEND?.enabled?backendClient():null;if(sb&&sb.then)sb.then(x=>x?.auth?.signOut?.()).catch(()=>{})}catch(e){}
    window.GORUT_USER=null; if(typeof GORUT_USER!=='undefined')GORUT_USER=null;
    const app=E56('app');if(app)app.style.display='none';
    const login=E56('login');if(login){login.style.display='grid';if(typeof showLogin==='function')showLogin()}
    removePayment56();
  }
  /* Every full application load starts at the login gate. Successful login occurs later via the login form. */
  setTimeout(forceLogin56,60)
  document.addEventListener('DOMContentLoaded',()=>setTimeout(removePayment56,100));
  setTimeout(removePayment56,1800);
})();

/* ==================== v57 LOGIN/PAYMENT RETIREMENT GUARD ==================== */
(function(){
  const legacyIds=['v27AccessAdmin','v28AccessAdmin','v27RegList','v28RegList'];
  function purge(){legacyIds.forEach(id=>document.getElementById(id)?.remove());
    const admin=document.getElementById('admin');
    if(admin){
      admin.querySelectorAll('.access-card,.v30-access-banner,.v30-receipt-note').forEach(el=>el.remove());
      admin.querySelectorAll('.card').forEach(card=>{
        if(card.id==='v30AdminPanel')return;
        const t=(card.textContent||'').toLowerCase();
        if(/registrasi\s*&\s*pembayaran|registrasi.*pembayaran|subscription server-side|manajemen akses premium|biaya.*rp|tarif.*rp|premium aktif/.test(t)) card.remove();
      });
      const v30=document.getElementById('v30AdminPanel');
      if(v30)v30.querySelectorAll('.card').forEach(card=>{
        const t=(card.textContent||'').toLowerCase();
        if(/registrasi\s*&\s*pembayaran|registrasi.*pembayaran|subscription|premium|biaya.*rp|tarif.*rp|bn[iı]|pembayaran/.test(t))card.remove();
      });
    }
    document.querySelectorAll('[id*=Payment],[id*=payment],[id*=Subscription],[id*=subscription],[id*=Premium],[id*=premium]').forEach(el=>el.remove());
  }
  window.GORUT_V57={version:'v57',loginRequiredOnEveryOpen:true,paymentUiRetired:true};
  document.addEventListener('DOMContentLoaded',()=>{purge();setTimeout(purge,100);setTimeout(purge,500)});
})();

/* ==================== v59 CASE LIST + DEMOGRAPHY MASTER ==================== */
(function(){
  const e59=v=>String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const n59=v=>String(v??'').trim();
  const positive59=v=>{const s=n59(v).toLowerCase();return s&&!/^(tidak|tidak ada|tidak diketahui|tidak relevan|negatif|bukan|belum|tidak diambil|tidak dilakukan|tidak lengkap|0|no)$/.test(s)};
  function riskItems59(c){
    if(typeof window.deriveRiskFactors46==='function'){try{const fresh=window.deriveRiskFactors46(c);if(Array.isArray(fresh))c.riskFactors=fresh}catch(e){console.warn('risk derive v59',e)}}
    const items=Array.isArray(c?.riskFactors)?c.riskFactors:[];const seen=new Set();
    return items.filter(x=>{const label=n59(x.label||x.question||''),value=n59(x.value??x.answer??'');if(!label||!value||!positive59(value))return false;const key=(label+'|'+value).toLowerCase();if(seen.has(key))return false;seen.add(key);return true});
  }
  function firstAnswer59(c,keys){const a=c?.answers||{};for(const k of keys){if(n59(c?.[k]))return c[k];if(n59(a?.[k]))return a[k]}return ''}
  function symptoms59(c){return firstAnswer59(c,['symptoms','symptom','gejala','gejalaUtama','mainSymptoms','caseSymptoms','keluhanUtama'])||'-'}
  function onset59(c){return c?.onset||firstAnswer59(c,['onset','dateOnset','tanggalOnset','Date Onset','Tanggal Pertama Kali mengalami Gejala'])||'-'}
  function riskCell59(c){
    const items=riskItems59(c);if(!items.length)return '<span class="risk-none">Belum teridentifikasi</span>';
    const shown=items.slice(0,3),chips=shown.map(x=>`<span class="risk-chip" title="${e59(x.label||'')} — ${e59(x.value??'')}"><span>${e59((x.label||'').replace(/\s+/g,' ').slice(0,55))}</span><b>${e59(x.value??'')}</b></span>`).join('');
    const more=items.length>3?`<button class="risk-more" onclick="showCaseRiskFactors59('${e59(c.id)}')">+${items.length-3} lainnya</button>`:'';
    return `<div class="risk-cell"><div class="risk-chips">${chips}</div><div class="risk-footer">${more}<button class="risk-detail" onclick="showCaseRiskFactors59('${e59(c.id)}')">Lihat detail</button></div></div>`;
  }
  window.showCaseRiskFactors59=function(id){const c=(db.cases||[]).find(x=>String(x.id)===String(id));if(!c)return;const items=riskItems59(c),groups={};items.forEach(x=>{const cat=n59(x.category)||'Faktor risiko';(groups[cat]??=[]).push(x)});const body=Object.entries(groups).map(([cat,arr])=>`<div class="risk-group"><h4>${e59(cat)}</h4>${arr.map(x=>`<div class="risk-detail-row"><div>${e59(x.label||'')}</div><strong>${e59(x.value??'')}</strong></div>`).join('')}</div>`).join('');modal(`<h2>🔎 Faktor Risiko — ${e59(c.id)}</h2><div class="small">Sumber: jawaban kuesioner pada <code>case.answers</code>. Tampilan ini adalah ringkasan paparan/faktor risiko, bukan penetapan hubungan kausal.</div>${body||'<div class="notice">Belum ada faktor risiko yang teridentifikasi.</div>'}<div style="margin-top:12px"><button onclick="close()">Tutup</button></div>`)};
  window.cases=function(){
    const q=(val('caseSearch')||'').toLowerCase();const all=(db.cases||[]).filter(c=>!db.active||String(c.investigationId)===String(db.active));
    const r=all.filter(c=>{const rf=riskItems59(c).map(x=>`${x.label} ${x.value}`).join(' ');return !q||`${c.id} ${c.name||''} ${c.address||''} ${c.desa||c.admin?.desa||''} ${c.kec||c.admin?.kec||''} ${symptoms59(c)} ${rf}`.toLowerCase().includes(q)});
    const rows=document.getElementById('caseRows');if(!rows)return;const th=rows.closest('table')?.querySelector('thead tr');
    if(th)th.innerHTML='<th>ID</th><th>Nama</th><th>Alamat</th><th>Desa/Kel.</th><th>Kecamatan</th><th>Umur</th><th>JK</th><th>Tanggal Onset</th><th>Gejala Utama</th><th>Status</th><th>Faktor Risiko (Kuesioner)</th><th>Outcome</th><th>Aksi</th>';
    rows.innerHTML=r.map(c=>`<tr><td>${e59(c.id)}</td><td><b>${e59(c.name||'-')}</b></td><td>${e59(c.address||'-')}</td><td>${e59(c.desa||c.admin?.desa||'-')}</td><td>${e59(c.kec||c.admin?.kec||'-')}</td><td>${e59(c.age??'-')}</td><td>${e59(c.sex||'-')}</td><td>${e59(onset59(c))}</td><td class="symptom-cell" title="${e59(symptoms59(c))}">${e59(symptoms59(c))}</td><td><span class="badge">${e59(c.status||'-')}</span></td><td>${riskCell59(c)}</td><td>${e59(c.outcome||'-')}</td><td class="table-actions"><button onclick="editCase('${e59(c.id)}')">Edit</button> <button class="danger" data-v30-delete onclick="deleteRecord('cases','${e59(c.id)}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="13"><div class="notice">Belum ada kasus.</div></td></tr>';
  };
  const oldExportCSV59=window.exportCSV;
  window.exportCSV=function(){const cs=(db.cases||[]).filter(c=>c.investigationId===db.active);const cols=['ID','Nama','Alamat','Provinsi','Kabupaten/Kota','Kecamatan','Desa/Kelurahan','Latitude','Longitude','Tanggal Onset','Gejala Utama','Status','Faktor Risiko (dari kuesioner)','Outcome','Sumber Wilayah'];const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;const lines=[cols.join(','),...cs.map(c=>{const rf=riskItems59(c).map(x=>`${x.label}: ${x.value}`).join(' | ');return [c.id,c.name,c.address,c.prov,c.kab,c.kec,c.desa,c.lat,c.lng,onset59(c),symptoms59(c),c.status,rf,c.outcome,c.admin?.source||''].map(q).join(',' )})];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}));a.download='kasus-KLB-lengkap-onset-gejala-faktor-risiko.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};

  const master59=[
    {kec:'Atinggola',pkm:['Puskesmas Atinggola']},{kec:'Gentuma Raya',pkm:['Puskesmas Gentuma']},{kec:'Tomilito',pkm:['Puskesmas Dambalo']},{kec:'Ponelo Kepulauan',pkm:['Puskesmas Ponelo']},{kec:'Kwandang',pkm:['Puskesmas Kwandang','Puskesmas Molingkapoto']},{kec:'Anggrek',pkm:['Puskesmas Anggrek','Puskesmas Ilangata']},{kec:'Monano',pkm:['Puskesmas Monano']},{kec:'Sumalata Timur',pkm:['Puskesmas Dulukapa']},{kec:'Sumalata',pkm:['Puskesmas Sumalata','Puskesmas Buloila']},{kec:'Biau',pkm:['Puskesmas Biau']},{kec:'Tolinggula',pkm:['Puskesmas Tolinggula','Puskesmas Limbato']}
  ];
  function demoRows59(y){const d=JSON.parse(localStorage.getItem('gorut-demography-v49')||'{"years":{},"meta":{}}');const src=d.years?.[String(y)]||{};return master59.flatMap(g=>g.pkm.map(p=>Object.assign({puskesmas:p,kec:g.kec,desa:'',population:'',male:'',female:'',households:'',areaKm2:'',lat:'',lng:'',note:'',source:''},src[p]||{})))}
  function num59(v){const n=Number(v);return Number.isFinite(n)?n:0}
  function renderDemoTable59(){
    const y=Number(document.getElementById('demoYearV49')?.value)||new Date().getFullYear();
    const rows=demoRows59(y),el=document.getElementById('demoTableV49'); if(!el)return;
    const n59=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
    const totalPop=rows.reduce((s,r)=>s+(n59(r.population)||0),0);
    const totalMale=rows.reduce((s,r)=>s+(n59(r.male)||0),0);
    const totalFemale=rows.reduce((s,r)=>s+(n59(r.female)||0),0);
    const totalKK=rows.reduce((s,r)=>s+(n59(r.households)||0),0);
    const filled=rows.filter(r=>(n59(r.population)||0)>0).length;
    const completeSex=rows.filter(r=>n59(r.population)!=null&&n59(r.male)!=null&&n59(r.female)!=null).length;
    const validSex=rows.filter(r=>{const p=n59(r.population),m=n59(r.male),f=n59(r.female);return p!=null&&m!=null&&f!=null&&Math.abs((m+f)-p)<0.001}).length;
    const malePct=totalPop?totalMale/totalPop*100:0, femalePct=totalPop?totalFemale/totalPop*100:0;
    const bpsRef=y===2025?134852:null;
    let html='<div class="notice"><b>Master denominator '+y+'</b> · 11 kecamatan · 15 wilayah kerja Puskesmas. Angka Puskesmas diisi/diimpor oleh pengguna; sistem tidak mengalokasikan penduduk kabupaten secara otomatis.</div>';
    html+='<div class="grid" style="margin:10px 0"><div class="stat"><small>Penduduk terisi</small><b>'+totalPop.toLocaleString('id-ID')+'</b></div><div class="stat"><small>Laki-laki</small><b>'+totalMale.toLocaleString('id-ID')+' ('+malePct.toFixed(1)+'%)</b></div><div class="stat"><small>Perempuan</small><b>'+totalFemale.toLocaleString('id-ID')+' ('+femalePct.toFixed(1)+'%)</b></div><div class="stat"><small>KK</small><b>'+totalKK.toLocaleString('id-ID')+'</b></div><div class="stat"><small>Denominator siap</small><b>'+filled+'/15</b></div><div class="stat"><small>L+P valid</small><b>'+validSex+'/'+completeSex+'</b></div></div>';
    if(bpsRef!=null) html+='<div class="notice"><b>Referensi eksternal BPS 2025:</b> 134.852 jiwa. Angka ini hanya pembanding tingkat kabupaten dan <b>tidak</b> digunakan otomatis sebagai denominator Puskesmas.</div>';
    html+='<table class="demo-master-table"><thead><tr><th>No.</th><th>Kecamatan</th><th>Wilayah Kerja Puskesmas</th><th>Penduduk</th><th>Laki-laki</th><th>Perempuan</th><th>KK</th><th>Luas km²<br><small>opsional</small></th><th>Kepadatan<br><small>jiwa/km²</small></th><th>Validasi</th><th>Latitude</th><th>Longitude</th><th>Catatan</th></tr></thead><tbody>';
    let no=1;
    for(const g of master59){
      const gr=rows.filter(r=>r.kec===g.kec);
      const tot=gr.reduce((s,r)=>s+(n59(r.population)||0),0),tm=gr.reduce((s,r)=>s+(n59(r.male)||0),0),tf=gr.reduce((s,r)=>s+(n59(r.female)||0),0);
      html+='<tr class="demo-kec-head"><td colspan="13"><b>'+e59(g.kec)+'</b> — '+g.pkm.length+' wilayah kerja Puskesmas · Penduduk: <b>'+tot.toLocaleString('id-ID')+'</b> · L: '+tm.toLocaleString('id-ID')+' · P: '+tf.toLocaleString('id-ID')+'</td></tr>';
      for(const r of gr){
        const i=rows.indexOf(r),p=n59(r.population),m=n59(r.male),f=n59(r.female),kk=n59(r.households),area=n59(r.areaKm2),density=area>0&&p!=null?p/area:null;
        let issues=[];
        if(p==null&&((m||0)>0||(f||0)>0)) issues.push('Penduduk kosong');
        if(p!=null&&m!=null&&f!=null&&Math.abs((m+f)-p)>0.001) issues.push('L+P ≠ penduduk');
        if(p!=null&&m==null) issues.push('Laki-laki kosong');
        if(p!=null&&f==null) issues.push('Perempuan kosong');
        if(kk!=null&&p!=null&&kk>p) issues.push('KK > penduduk');
        if(area===0) issues.push('Luas belum diisi');
        const badge=issues.length?'<span class="badge" title="'+e59(issues.join('; '))+'">⚠ '+issues.length+' masalah</span>':'<span class="badge">✓ Valid</span>';
        html+='<tr><td>'+(no++)+'</td><td>'+e59(r.kec)+'</td><td><b>'+e59(r.puskesmas)+'</b></td><td><input data-demo="population" data-i="'+i+'" type="number" min="0" value="'+e59(r.population)+'"></td><td><input data-demo="male" data-i="'+i+'" type="number" min="0" value="'+e59(r.male)+'"></td><td><input data-demo="female" data-i="'+i+'" type="number" min="0" value="'+e59(r.female)+'"></td><td><input data-demo="households" data-i="'+i+'" type="number" min="0" value="'+e59(r.households)+'"></td><td><input data-demo="areaKm2" data-i="'+i+'" type="number" min="0" step="0.01" value="'+e59(r.areaKm2)+'"></td><td>'+(density==null?'—':density.toLocaleString('id-ID',{maximumFractionDigits:1}))+'</td><td>'+badge+'</td><td><input data-demo="lat" data-i="'+i+'" type="number" step="any" value="'+e59(r.lat)+'"></td><td><input data-demo="lng" data-i="'+i+'" type="number" step="any" value="'+e59(r.lng)+'"></td><td><input data-demo="note" data-i="'+i+'" value="'+e59(r.note)+'"></td></tr>';
      }
    }
    const overallDiff=totalPop-(totalMale+totalFemale);
    const overallStatus=Math.abs(overallDiff)<0.001?'Konsisten':'Perlu pemeriksaan';
    html+='</tbody></table><div class="notice" style="margin-top:10px"><b>Validasi Kabupaten:</b> Laki-laki + perempuan = '+(totalMale+totalFemale).toLocaleString('id-ID')+'; penduduk = '+totalPop.toLocaleString('id-ID')+'; selisih = '+overallDiff.toLocaleString('id-ID')+'. Status: <b>'+overallStatus+'</b>. <br><b>Aturan:</b> data tidak dianggap siap sebagai denominator bila penduduk belum diisi atau komposisi L+P belum konsisten. Kepadatan hanya dihitung jika luas wilayah diisi.</div>';
    el.innerHTML=html;
  }
  const oldRenderDemo=window.renderDemographyV49;window.renderDemographyV49=function(){if(typeof oldRenderDemo==='function')oldRenderDemo.apply(this,arguments);setTimeout(renderDemoTable59,0)};
  window.GORUT_V60={version:'v60',caseList:['tanggal onset','gejala utama','outcome'],demographyMaster:'11 kecamatan / 15 puskesmas',features:['rekap kecamatan','persentase jenis kelamin','kepadatan opsional','denominator IR']};
  setTimeout(()=>{try{cases();renderDemoTable59()}catch(e){console.warn('v59 init',e)}},1700);
})();

/* ===================== v62 — AUTOMATED IR PUSKESMAS → KECAMATAN → KABUPATEN ===================== */
(function(){
  const esc62=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num62=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  function activeCases62(){
    const activeId=window.db?.active;
    const disease=document.getElementById('demoDiseaseV49')?.value||'';
    return (window.db?.cases||[]).filter(c=>String(c.investigationId)===String(activeId)).filter(c=>!disease||String(c.disease||'')===String(disease));
  }
  function pkm62(c){const a=c.answers||{};return String(c.pkm||c.puskesmas||a.pkm||a.Puskesmas||a.puskesmas||'').trim();}
  function kec62(c){const a=c.answers||{};return String(c.kec||c.kecamatan||c.admin?.kec||a.kec||a.kecamatan||'').trim();}
  function getRows62(y){
    const rows=typeof demoRows59==='function'?demoRows59(y):[];
    return rows.map(r=>{
      const p=num62(r.population),m=num62(r.male),f=num62(r.female);
      const valid=p!=null&&p>0&&m!=null&&f!=null&&Math.abs((m+f)-p)<0.001;
      return {...r,popNum:p,maleNum:m,femaleNum:f,validDen:valid};
    });
  }
  function renderIR62(){
    const host=document.getElementById('demoTableV49');if(!host)return;
    const y=Number(document.getElementById('demoYearV49')?.value)||new Date().getFullYear();
    const rows=getRows62(y), cases=activeCases62();
    const byP={}; rows.forEach(r=>byP[r.puskesmas]={...r,cases:0});
    const byK={}; rows.forEach(r=>{byK[r.kec] ||= {kec:r.kec,rows:[],cases:0};byK[r.kec].rows.push(r)});
    let unmapped=0;
    cases.forEach(c=>{
      const p=pkm62(c), k=kec62(c);
      if(p){const hit=Object.keys(byP).find(x=>x.toLowerCase()===p.toLowerCase()||x.replace(/^puskesmas\s+/i,'').toLowerCase()===p.replace(/^puskesmas\s+/i,'').toLowerCase());if(hit){byP[hit].cases++;if(byK[byP[hit].kec])byK[byP[hit].kec].cases++;return;}}
      if(k){const hit=Object.keys(byK).find(x=>x.toLowerCase()===k.toLowerCase());if(hit){byK[hit].cases++;return;}}
      unmapped++;
    });
    const pRows=Object.values(byP), kRows=Object.values(byK);
    const totalPop=pRows.reduce((s,r)=>s+(r.validDen?r.popNum:0),0), totalCases=cases.length;
    const kabIR=totalPop>0?totalCases/totalPop*100000:null;
    const validP=pRows.filter(r=>r.validDen).length;
    const validK=kRows.filter(g=>g.rows.length&&g.rows.every(r=>r.validDen)).length;
    document.getElementById('v62IRCard')?.remove();
    const old=host.innerHTML;
    let extra='<div class="card" id="v62IRCard" style="margin-top:16px">';
    extra+='<div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">📊 v62 — Insiden Rate Otomatis</h3><div class="small">Kasus aktif → Puskesmas → Kecamatan → Kabupaten. Denominator hanya digunakan jika data penduduk dan L+P tervalidasi.</div></div><span class="badge">IR / 100.000</span></div>';
    extra+='<div class="grid" style="margin:10px 0"><div class="stat"><small>Kasus aktif</small><b>'+totalCases+'</b></div><div class="stat"><small>Puskesmas denominator valid</small><b>'+validP+'/15</b></div><div class="stat"><small>Kecamatan denominator lengkap</small><b>'+validK+'/11</b></div><div class="stat"><small>IR Kabupaten</small><b>'+(kabIR==null?'—':kabIR.toFixed(2))+'</b></div><div class="stat"><small>Kasus belum terpetakan</small><b>'+unmapped+'</b></div></div>';
    extra+='<h4>IR per Wilayah Kerja Puskesmas</h4><table><thead><tr><th>Puskesmas</th><th>Kecamatan</th><th>Kasus</th><th>Penduduk</th><th>IR/100.000</th><th>Status denominator</th></tr></thead><tbody>';
    pRows.sort((a,b)=>String(a.kec).localeCompare(String(b.kec),'id')).forEach(r=>{extra+='<tr><td><b>'+esc62(r.puskesmas)+'</b></td><td>'+esc62(r.kec)+'</td><td>'+r.cases+'</td><td>'+(r.validDen?r.popNum.toLocaleString('id-ID'):'—')+'</td><td>'+(r.validDen?(r.cases/r.popNum*100000).toFixed(2):'—')+'</td><td>'+(r.validDen?'<span class="badge">✓ Siap</span>':'<span class="badge">⚠ Periksa data</span>')+'</td></tr>'});
    extra+='</tbody></table>';
    extra+='<h4 style="margin-top:16px">IR per Kecamatan</h4><table><thead><tr><th>Kecamatan</th><th>Puskesmas</th><th>Kasus</th><th>Penduduk</th><th>IR/100.000</th><th>Status</th></tr></thead><tbody>';
    kRows.sort((a,b)=>String(a.kec).localeCompare(String(b.kec),'id')).forEach(g=>{const complete=g.rows.every(r=>r.validDen),pop=g.rows.reduce((s,r)=>s+(complete?r.popNum:0),0);extra+='<tr><td><b>'+esc62(g.kec)+'</b></td><td>'+g.rows.length+'</td><td>'+g.cases+'</td><td>'+(complete?pop.toLocaleString('id-ID'):'—')+'</td><td>'+(complete&&pop?(g.cases/pop*100000).toFixed(2):'—')+'</td><td>'+(complete?'<span class="badge">✓ Lengkap</span>':'<span class="badge">⚠ Belum lengkap</span>')+'</td></tr>'});
    extra+='</tbody></table><div class="notice" style="margin-top:10px"><b>Catatan metodologis:</b> IR = kasus / penduduk × 100.000. Kasus tanpa Puskesmas/kecamatan tidak dipaksakan ke wilayah tertentu. Untuk perbandingan tahunan, gunakan tahun denominator yang sesuai dengan periode kasus.</div></div>';
    host.innerHTML=old+extra;
  }
  const oldR=window.renderDemographyV49;
  window.renderDemographyV49=function(){if(typeof oldR==='function')oldR.apply(this,arguments);setTimeout(renderIR62,30)};
  window.GORUT_V62={version:'v62',features:['IR otomatis Puskesmas','IR otomatis Kecamatan','IR Kabupaten','validasi denominator','kasus belum terpetakan']};
  setTimeout(()=>{try{renderIR62()}catch(e){console.warn('v62 IR',e)}},1900);
})();


/* ===================== v63 — EPIDEMIOLOGICAL RANKING & ALERT ===================== */
(function(){
  const esc63=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num63=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  function cases63(){
    const activeId=window.db?.active, disease=document.getElementById('demoDiseaseV49')?.value||'';
    return (window.db?.cases||[]).filter(c=>String(c.investigationId)===String(activeId)).filter(c=>!disease||String(c.disease||'')===String(disease));
  }
  function pkm63(c){const a=c.answers||{};return String(c.pkm||c.puskesmas||a.pkm||a.Puskesmas||a.puskesmas||'').trim()}
  function kec63(c){const a=c.answers||{};return String(c.kec||c.kecamatan||c.admin?.kec||a.kec||a.kecamatan||'').trim()}
  function date63(c){const a=c.answers||{};const v=c.onset||c.dateOnset||c.tanggalOnset||a.onset||a.dateOnset||a.tanggalOnset||a['Tanggal Pertama Kali mengalami Gejala'];const d=v?new Date(v):null;return d&&Number.isFinite(d.getTime())?d:null}
  function norm63(v){return String(v||'').replace(/^puskesmas\s+/i,'').trim().toLowerCase()}
  function percentile63(rows,key,reverse=false){
    const vals=rows.map(r=>Number(r[key])||0), sorted=[...vals].sort((a,b)=>a-b);
    return rows.map(r=>{const v=Number(r[key])||0, idx=sorted.lastIndexOf(v), pct=sorted.length<=1?1:(idx/(sorted.length-1));return reverse?1-pct:pct})
  }
  function renderRanking63(){
    const host=document.getElementById('demoTableV49'); if(!host)return;
    document.getElementById('v63RankingCard')?.remove();
    const year=Number(document.getElementById('demoYearV49')?.value)||new Date().getFullYear();
    const demo=typeof demoRows59==='function'?demoRows59(year):[];
    const cases=cases63();
    const byP={}; demo.forEach(r=>{const p=Number(r.population),m=Number(r.male),f=Number(r.female);const valid=Number.isFinite(p)&&p>0&&Number.isFinite(m)&&Number.isFinite(f)&&Math.abs((m+f)-p)<.001;byP[norm63(r.puskesmas)]={...r,popNum:p,validDen:valid,cases:0}});
    const mapped=[];let unmapped=0;
    cases.forEach(c=>{const key=norm63(pkm63(c));const hit=byP[key];if(hit){hit.cases++;mapped.push(c)}else unmapped++});
    const pRows=Object.values(byP);
    const onsetDates=cases.map(date63).filter(Boolean).sort((a,b)=>a-b);
    const latest=onsetDates.length?onsetDates[onsetDates.length-1]:null;
    const periodMs=28*86400000;
    pRows.forEach(r=>{
      r.latest28=0;r.previous28=0;
      if(latest){
        cases.forEach(c=>{if(norm63(pkm63(c))!==norm63(r.puskesmas))return;const d=date63(c);if(!d)return;const age=latest-d;if(age>=0&&age<periodMs)r.latest28++;else if(age>=periodMs&&age<2*periodMs)r.previous28++})
      }
      r.trendPct=r.previous28>0?((r.latest28-r.previous28)/r.previous28*100):(r.latest28>0?100:0);
      r.ir=r.validDen?(r.cases/r.popNum*100000):null;
      r.completeness=r.validDen?1:0;
    });
    const irMax=Math.max(0,...pRows.filter(r=>r.ir!=null).map(r=>r.ir));
    const caseMax=Math.max(0,...pRows.map(r=>r.cases));
    pRows.forEach(r=>{
      const irScore=r.ir==null?0:(irMax?40*(r.ir/irMax):0);
      const caseScore=caseMax?25*(r.cases/caseMax):0;
      const trendScore=Math.max(0,Math.min(20,(r.trendPct/100)*10+10*(r.latest28>r.previous28?1:0)));
      const completeness=15*r.completeness;
      r.score=Math.round((irScore+caseScore+trendScore+completeness)*10)/10;
    });
    const ranked=[...pRows].sort((a,b)=>b.score-a.score||b.cases-a.cases);
    const n=ranked.length||1;
    ranked.forEach((r,i)=>{r.rank=i+1;r.priority=i<Math.max(1,Math.ceil(n*.2))?'Prioritas Tinggi':i<Math.max(2,Math.ceil(n*.5))?'Prioritas Sedang':'Monitor'});
    const validCount=pRows.filter(r=>r.validDen).length;
    const high=ranked.filter(r=>r.priority==='Prioritas Tinggi').length;
    let html='<div class="card" id="v63RankingCard" style="margin-top:16px">';
    html+='<div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">🚨 v63 — Epidemiological Ranking & Alert</h3><div class="small">Pemeringkatan wilayah kerja berdasarkan IR, jumlah kasus, tren kasus, dan kelengkapan denominator. Ini adalah <b>sinyal prioritas</b>, bukan penetapan KLB.</div></div><span class="badge">Priority signal</span></div>';
    html+='<div class="grid" style="margin:10px 0"><div class="stat"><small>Puskesmas dianalisis</small><b>'+pRows.length+'</b></div><div class="stat"><small>Denominator valid</small><b>'+validCount+'/'+pRows.length+'</b></div><div class="stat"><small>Prioritas tinggi</small><b>'+high+'</b></div><div class="stat"><small>Kasus belum terpetakan</small><b>'+unmapped+'</b></div><div class="stat"><small>Periode tren</small><b>28 vs 28 hari</b></div></div>';
    html+='<div class="toolbar"><button class="primary" onclick="exportRanking63()">⬇️ Ekspor Ranking & Alert CSV</button><button onclick="renderEpiRanking63()">🔄 Perbarui Ranking</button></div>';
    html+='<h4>Peringkat Wilayah Kerja Puskesmas</h4><div style="overflow:auto"><table><thead><tr><th>Rank</th><th>Puskesmas</th><th>Kecamatan</th><th>Kasus</th><th>IR/100.000</th><th>Tren 28 hari</th><th>Denominator</th><th>Skor</th><th>Status</th></tr></thead><tbody>';
    ranked.forEach(r=>{const trend=r.previous28===0?(r.latest28>0?'Baru / +100%':'Stabil 0%'):(r.trendPct>=0?'+'+r.trendPct.toFixed(1)+'%':r.trendPct.toFixed(1)+'%');const cls=r.priority==='Prioritas Tinggi'?'badge':r.priority==='Prioritas Sedang'?'badge':'badge';html+='<tr><td><b>'+r.rank+'</b></td><td><b>'+esc63(r.puskesmas)+'</b></td><td>'+esc63(r.kec)+'</td><td>'+r.cases+'</td><td>'+(r.ir==null?'—':r.ir.toFixed(2))+'</td><td>'+trend+' <span class="small">('+r.latest28+' vs '+r.previous28+')</span></td><td>'+(r.validDen?'✓ Valid':'⚠ Tidak valid')+'</td><td><b>'+r.score.toFixed(1)+'</b></td><td><span class="'+cls+'">'+r.priority+'</span></td></tr>'});
    html+='</tbody></table></div>';
    const kecMap={};pRows.forEach(r=>{kecMap[r.kec] ||= {kec:r.kec,pop:0,cases:0,valid:true,latest28:0,previous28:0};const g=kecMap[r.kec];g.valid=g.valid&&r.validDen;if(r.validDen)g.pop+=r.popNum;g.cases+=r.cases;g.latest28+=r.latest28;g.previous28+=r.previous28});
    const kRank=Object.values(kecMap).map(g=>{g.ir=g.valid&&g.pop>0?g.cases/g.pop*100000:null;g.trendPct=g.previous28>0?(g.latest28-g.previous28)/g.previous28*100:(g.latest28>0?100:0);return g});
    const kIrMax=Math.max(0,...kRank.filter(g=>g.ir!=null).map(g=>g.ir)),kCaseMax=Math.max(0,...kRank.map(g=>g.cases));
    kRank.forEach(g=>{const a=g.ir==null?0:(kIrMax?40*g.ir/kIrMax:0),b=kCaseMax?25*g.cases/kCaseMax:0,c=Math.max(0,Math.min(20,(g.trendPct/100)*10+10*(g.latest28>g.previous28?1:0))),d=g.valid?15:0;g.score=Math.round((a+b+c+d)*10)/10});
    kRank.sort((a,b)=>b.score-a.score||b.cases-a.cases);const kn=kRank.length||1;kRank.forEach((g,i)=>g.priority=i<Math.max(1,Math.ceil(kn*.2))?'Prioritas Tinggi':i<Math.max(2,Math.ceil(kn*.5))?'Prioritas Sedang':'Monitor');
    html+='<h4 style="margin-top:18px">Peringkat Kecamatan</h4><div style="overflow:auto"><table><thead><tr><th>Rank</th><th>Kecamatan</th><th>Kasus terpetakan</th><th>Penduduk</th><th>IR/100.000</th><th>Tren 28 hari</th><th>Denominator</th><th>Skor</th><th>Status</th></tr></thead><tbody>';
    kRank.forEach((g,i)=>{const trend=g.previous28===0?(g.latest28>0?'Baru / +100%':'Stabil 0%'):(g.trendPct>=0?'+'+g.trendPct.toFixed(1)+'%':g.trendPct.toFixed(1)+'%');html+='<tr><td><b>'+(i+1)+'</b></td><td><b>'+esc63(g.kec)+'</b></td><td>'+g.cases+'</td><td>'+(g.valid?g.pop.toLocaleString('id-ID'):'—')+'</td><td>'+(g.ir==null?'—':g.ir.toFixed(2))+'</td><td>'+trend+' <span class="small">('+g.latest28+' vs '+g.previous28+')</span></td><td>'+(g.valid?'✓ Lengkap':'⚠ Belum lengkap')+'</td><td><b>'+g.score.toFixed(1)+'</b></td><td><span class="badge">'+g.priority+'</span></td></tr>'});
    html+='</tbody></table></div><div class="notice" style="margin-top:10px"><b>Metode v63:</b> skor gabungan 40% sinyal IR relatif, 25% jumlah kasus relatif, 20% tren kasus 28 hari, dan 15% kelengkapan denominator. Kasus yang belum dapat dipetakan ke Puskesmas tidak dipaksakan masuk ke ranking. Status prioritas adalah <b>sinyal operasional</b>, bukan diagnosis atau penetapan KLB.</div></div>';
    host.insertAdjacentHTML('beforeend',html);
    window.__GORUT_V63_RANKING=ranked;
  }
  window.renderEpiRanking63=renderRanking63;
  window.exportRanking63=function(){
    const rows=window.__GORUT_V63_RANKING||[];if(!rows.length){renderRanking63();return exportRanking63()}
    const cols=['Rank','Puskesmas','Kecamatan','Kasus','IR per 100.000','Kasus 28 Hari Terakhir','Kasus 28 Hari Sebelumnya','Tren %','Denominator Valid','Penduduk','Skor Prioritas','Status'];
    const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
    const lines=[cols.join(','),...rows.map(r=>[r.rank,r.puskesmas,r.kec,r.cases,r.ir==null?'':r.ir.toFixed(2),r.latest28,r.previous28,r.trendPct.toFixed(1),r.validDen?'Ya':'Tidak',r.validDen?r.popNum:'',r.score.toFixed(1),r.priority].map(q).join(','))];
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}));a.download='gorut-epidemiological-ranking-alert-v63.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);  };
  const oldR63=window.renderDemographyV49;
  window.renderDemographyV49=function(){if(typeof oldR63==='function')oldR63.apply(this,arguments);setTimeout(()=>{try{renderRanking63()}catch(e){console.warn('v63 ranking',e)}},60)};
  window.GORUT_V63={version:'v63',features:['ranking IR','ranking kasus','tren 28 hari','denominator completeness','priority signal','CSV export']};
  setTimeout(()=>{try{renderRanking63()}catch(e){console.warn('v63 init',e)}},2100);
})();


/* ===================== v64 — DEMOGRAPHY INPUT + EPIDEMIOLOGICAL TREND & EARLY WARNING ===================== */
(function(){
 const esc64=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const DKEY='gorut-demography-v49';
 const master64=[
  {kec:'Atinggola',pkm:['Puskesmas Atinggola']},{kec:'Gentuma Raya',pkm:['Puskesmas Gentuma']},{kec:'Tomilito',pkm:['Puskesmas Dambalo']},{kec:'Ponelo Kepulauan',pkm:['Puskesmas Ponelo']},
  {kec:'Kwandang',pkm:['Puskesmas Kwandang','Puskesmas Molingkapoto']},{kec:'Anggrek',pkm:['Puskesmas Anggrek','Puskesmas Ilangata']},{kec:'Monano',pkm:['Puskesmas Monano']},{kec:'Sumalata Timur',pkm:['Puskesmas Dulukapa']},
  {kec:'Sumalata',pkm:['Puskesmas Sumalata','Puskesmas Buloila']},{kec:'Biau',pkm:['Puskesmas Biau']},{kec:'Tolinggula',pkm:['Puskesmas Tolinggula','Puskesmas Limbato']}
 ];
 const rows64=(y)=>{let d={};try{d=JSON.parse(localStorage.getItem(DKEY)||'{}')}catch(e){};const src=d.years?.[String(y)]||{};return master64.flatMap(g=>g.pkm.map(p=>Object.assign({puskesmas:p,kec:g.kec,desa:'',population:'',male:'',female:'',households:'',areaKm2:'',lat:'',lng:'',note:'',source:''},src[p]||{})));};
 const selected64=()=>Number(document.getElementById('demoYearV49')?.value)||new Date().getFullYear();
 function valid64(r){const p=Number(r.population),m=Number(r.male),f=Number(r.female);return p>0&&m>=0&&f>=0&&Math.abs((m+f)-p)<.001}
 function renderInput64(){
  const host=document.getElementById('demoTableV49');if(!host)return;const y=selected64(),rows=rows64(y);
  const valid=rows.filter(valid64).length,filled=rows.filter(r=>Number(r.population)>0).length;
  let html='<div class="notice" style="margin-bottom:10px"><b>Tabel Isian Master Demografi '+y+'</b> — isi denominator berdasarkan wilayah kerja Puskesmas. Terdapat <b>11 Kecamatan</b> dan <b>15 Puskesmas</b>. Angka tidak diisi otomatis agar tidak terjadi pembagian penduduk kabupaten ke Puskesmas tanpa dasar resmi.</div>';
  html+='<div style="overflow:auto"><table><thead><tr><th>No.</th><th>Puskesmas</th><th>Kecamatan</th><th>Desa Acuan</th><th>Penduduk</th><th>Laki-laki</th><th>Perempuan</th><th>KK</th><th>Luas km²</th><th>Latitude</th><th>Longitude</th><th>Status Denominator</th><th>Catatan</th></tr></thead><tbody>';
  rows.forEach((r,i)=>{const ok=valid64(r);const status=ok?'<span class="badge">✓ Valid</span>':Number(r.population)>0?'<span class="badge">⚠ Periksa L+P</span>':'<span class="badge">Belum diisi</span>';html+='<tr><td>'+(i+1)+'</td><td><b>'+esc64(r.puskesmas)+'</b></td><td>'+esc64(r.kec)+'</td><td><input data-demo64="desa" data-i="'+i+'" value="'+esc64(r.desa)+'" placeholder="Desa acuan"></td><td><input data-demo64="population" data-i="'+i+'" type="number" min="0" value="'+esc64(r.population)+'"></td><td><input data-demo64="male" data-i="'+i+'" type="number" min="0" value="'+esc64(r.male)+'"></td><td><input data-demo64="female" data-i="'+i+'" type="number" min="0" value="'+esc64(r.female)+'"></td><td><input data-demo64="households" data-i="'+i+'" type="number" min="0" value="'+esc64(r.households)+'"></td><td><input data-demo64="areaKm2" data-i="'+i+'" type="number" min="0" step="any" value="'+esc64(r.areaKm2)+'"></td><td><input data-demo64="lat" data-i="'+i+'" type="number" step="any" value="'+esc64(r.lat)+'"></td><td><input data-demo64="lng" data-i="'+i+'" type="number" step="any" value="'+esc64(r.lng)+'"></td><td>'+status+'</td><td><input data-demo64="note" data-i="'+i+'" value="'+esc64(r.note)+'"></td></tr>'});
  html+='</tbody></table></div>';
  html+='<div class="notice" style="margin-top:10px">Terisi populasi: <b>'+filled+'/'+rows.length+'</b> · Denominator valid (Penduduk = Laki-laki + Perempuan): <b>'+valid+'/'+rows.length+'</b>. <b>Simpan Demografi Tahun Ini</b> menyimpan semua baris yang diisi.</div>';
  host.innerHTML=html;
 }
 window.saveDemographyV64=function(){const y=selected64(),rows=rows64(y);document.querySelectorAll('[data-demo64]').forEach(el=>{const i=Number(el.dataset.i);if(rows[i])rows[i][el.dataset.demo64]=el.value});let d={};try{d=JSON.parse(localStorage.getItem(DKEY)||'{}')}catch(e){};d.years ||= {};d.meta ||= {};d.years[String(y)]={};rows.forEach(r=>d.years[String(y)][r.puskesmas]=r);d.meta[String(y)]={source:document.getElementById('demoSourceV49')?.value||'',updated:document.getElementById('demoUpdatedV49')?.value||'',note:document.getElementById('demoNoteV49')?.value||''};localStorage.setItem(DKEY,JSON.stringify(d));renderInput64();if(typeof renderDemographyV49==='function')setTimeout(()=>renderDemographyV49(),20);alert('Tabel master demografi '+y+' berhasil disimpan.');};
 const oldRender64=window.renderDemographyV49;
 window.renderDemographyV49=function(){if(typeof oldRender64==='function')oldRender64.apply(this,arguments);setTimeout(renderInput64,30)};

 function cases64(){const active=window.db?.active,disease=document.getElementById('demoDiseaseV49')?.value||'';return (window.db?.cases||[]).filter(c=>String(c.investigationId)===String(active)).filter(c=>!disease||String(c.disease||'')===String(disease));}
 function pkm64(c){const a=c.answers||{};return String(c.pkm||c.puskesmas||a.pkm||a.Puskesmas||a.puskesmas||'').trim().toLowerCase().replace(/^puskesmas\s+/,'')}
 function onset64(c){const a=c.answers||{};const v=c.onset||c.dateOnset||c.tanggalOnset||a.onset||a.dateOnset||a.tanggalOnset||a['Tanggal Pertama Kali mengalami Gejala'];const d=v?new Date(v):null;return d&&Number.isFinite(d.getTime())?d:null}
 function renderEW64(){const host=document.getElementById('demoTableV49');if(!host)return;document.getElementById('v64EWCard')?.remove();const rows=rows64(selected64()),cs=cases64(),map={};rows.forEach(r=>map[String(r.puskesmas).toLowerCase().replace(/^puskesmas\s+/,'')]={...r,cases:0});cs.forEach(c=>{const k=pkm64(c);if(map[k])map[k].cases++});const dates=cs.map(onset64).filter(Boolean).sort((a,b)=>a-b),end=dates[dates.length-1]||new Date(),w7=7*86400000,w28=28*86400000;const out=Object.values(map).map(r=>{let a=0,b=0;cs.forEach(c=>{if(pkm64(c)!==String(r.puskesmas).toLowerCase().replace(/^puskesmas\s+/,''))return;const d=onset64(c);if(!d)return;const age=end-d;if(age>=0&&age<w7)a++;else if(age>=w7&&age<w28)b++});const prevDaily=b/21,latestDaily=a/7,change=prevDaily>0?(latestDaily-prevDaily)/prevDaily*100:(a>0?100:0);let level='Monitor';if(a>=5&&change>=100)level='Prioritas Tinggi';else if(a>=3&&change>=50)level='Waspada';return {...r,last7:a,prev21:b,change,level}}).sort((a,b)=>b.change-a.change||b.last7-a.last7);let html='<div class="card" id="v64EWCard" style="margin-top:16px"><div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">📈 v64 — Epidemiological Trend & Early Warning</h3><div class="small">Perbandingan laju kasus 7 hari terakhir dengan 21 hari sebelumnya berdasarkan tanggal onset. Ini adalah <b>sinyal early warning operasional</b>, bukan penetapan KLB.</div></div><span class="badge">Early warning</span></div><div class="notice"><b>Parameter default dapat dianggap sebagai ambang operasional awal:</b> Prioritas Tinggi bila ≥5 kasus dalam 7 hari dan kenaikan laju ≥100%; Waspada bila ≥3 kasus dan kenaikan ≥50%. Ambang ini bukan kriteria KLB dan perlu disesuaikan dengan penyakit/setting.</div><div style="overflow:auto"><table><thead><tr><th>Rank</th><th>Puskesmas</th><th>Kecamatan</th><th>7 Hari</th><th>21 Hari Sebelumnya</th><th>Perubahan Laju</th><th>Denominator</th><th>Sinyal</th></tr></thead><tbody>';out.forEach((r,i)=>{html+='<tr><td><b>'+(i+1)+'</b></td><td><b>'+esc64(r.puskesmas)+'</b></td><td>'+esc64(r.kec)+'</td><td>'+r.last7+'</td><td>'+r.prev21+'</td><td>'+(r.change===100&&r.prev21===0?'Baru / +100%':(r.change>=0?'+':'')+r.change.toFixed(1)+'%')+'</td><td>'+(valid64(r)?'✓ Valid':'⚠ Belum valid')+'</td><td><span class="badge">'+r.level+'</span></td></tr>'});html+='</tbody></table></div><div class="small" style="margin-top:10px">Jika tanggal onset belum tersedia pada sebagian kasus, kasus tersebut tidak digunakan dalam analisis tren.</div></div>';host.insertAdjacentHTML('beforeend',html);window.__GORUT_V64_EW=out}
 const oldCases64=window.cases;window.cases=function(){if(typeof oldCases64==='function')oldCases64.apply(this,arguments);const th=document.querySelector('#caseRows')?.closest('table')?.querySelector('thead tr');if(th)th.innerHTML='<th>ID</th><th>Nama</th><th>Alamat</th><th>Desa/Kel.</th><th>Kecamatan</th><th>Umur</th><th>JK</th><th>Tanggal Onset</th><th>Gejala Utama</th><th>Status</th><th>Faktor Risiko (Kuesioner)</th><th>Outcome</th><th>Aksi</th>';};
 window.renderEpidemiologicalEarlyWarning64=renderEW64;window.GORUT_V64={version:'v64',features:['master demografi 11 kecamatan/15 puskesmas','field daftar kasus final','trend 7 vs 21 hari','early warning operasional']};
 const oldPage64=window.page;window.page=function(id,b){if(typeof oldPage64==='function')oldPage64(id,b);setTimeout(()=>{if(id==='demografi'){renderInput64();renderEW64()}if(id==='kasus'){try{window.cases()}catch(e){}}},120)};
 setTimeout(()=>{try{renderInput64();renderEW64()}catch(e){console.warn('v64 init',e)}},2400);
})();

/* ===================== v65 — AUTOMATED OUTBREAK DETECTION ===================== */
(function(){
 const DKEY='gorut-demography-v49';
 const E=id=>document.getElementById(id);
 const esc65=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const master=[
  {kec:'Atinggola',pkm:['Puskesmas Atinggola']},{kec:'Gentuma Raya',pkm:['Puskesmas Gentuma']},{kec:'Tomilito',pkm:['Puskesmas Dambalo']},{kec:'Ponelo Kepulauan',pkm:['Puskesmas Ponelo']},
  {kec:'Kwandang',pkm:['Puskesmas Kwandang','Puskesmas Molingkapoto']},{kec:'Anggrek',pkm:['Puskesmas Anggrek','Puskesmas Ilangata']},{kec:'Monano',pkm:['Puskesmas Monano']},{kec:'Sumalata Timur',pkm:['Puskesmas Dulukapa']},
  {kec:'Sumalata',pkm:['Puskesmas Sumalata','Puskesmas Buloila']},{kec:'Biau',pkm:['Puskesmas Biau']},{kec:'Tolinggula',pkm:['Puskesmas Tolinggula','Puskesmas Limbato']}
 ];
 const norm=s=>String(s??'').toLowerCase().replace(/^puskesmas\s+/,'').replace(/\s+/g,' ').trim();
 const demo=(y)=>{let d={};try{d=JSON.parse(localStorage.getItem(DKEY)||'{}')}catch(e){};return d.years?.[String(y)]||{}};
 const year=()=>Number(E('demoYearV49')?.value)||new Date().getFullYear();
 const rows=()=>{const d=demo(year());return master.flatMap(g=>g.pkm.map(p=>Object.assign({puskesmas:p,kec:g.kec,population:'',male:'',female:''},d[p]||{})));};
 const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
 const validDen=r=>{const p=num(r.population),m=num(r.male),f=num(r.female);return p!==null&&p>0&&m!==null&&f!==null&&m>=0&&f>=0&&Math.abs(m+f-p)<.001};
 function cases(){const active=window.db?.active,disease=E('demoDiseaseV49')?.value||'';return (window.db?.cases||[]).filter(c=>String(c.investigationId)===String(active)).filter(c=>!disease||String(c.disease||'')===String(disease));}
 function pkm(c){const a=c.answers||{};return norm(c.pkm||c.puskesmas||a.pkm||a.Puskesmas||a.puskesmas||a['Puskesmas']||'');}
 function kec(c){const a=c.answers||{};return String(c.kec||c.kecamatan||a.kec||a.kecamatan||a['Kecamatan']||'').trim().toLowerCase().replace(/\s+/g,' ');}
 function onset(c){const a=c.answers||{};const v=c.onset||c.dateOnset||c.tanggalOnset||a.onset||a.dateOnset||a.tanggalOnset||a['Tanggal Pertama Kali mengalami Gejala'];const d=v?new Date(v):null;return d&&Number.isFinite(d.getTime())?d:null;}
 function pkmKec(name){const n=norm(name);for(const g of master)if(g.pkm.some(p=>norm(p)===n))return g.kec;return ''}
 function pct(x){return Number.isFinite(x)?(x>=0?'+':'')+x.toFixed(1)+'%':'—'}
 function signal(r){
   if(r.obs<2)return {level:'Monitor',reason:'Belum cukup kasus pada jendela 7 hari'};
   if(r.baseline===0 && r.obs>=3)return {level:'Sinyal kuat',reason:'≥3 kasus baru dengan baseline 56 hari = 0'};
   if(r.z>=2.5 || (r.rr>=3 && r.obs>=3))return {level:'Sinyal kuat',reason:'Anomali statistik kuat (z ≥ 2,5 atau RR ≥ 3)'};
   if(r.z>=1.5 || (r.rr>=2 && r.obs>=2))return {level:'Sinyal sedang',reason:'Kenaikan melebihi baseline (z ≥ 1,5 atau RR ≥ 2)'};
   return {level:'Monitor',reason:'Belum melewati ambang sinyal otomatis'};
 }
 function classify(r){const s=signal(r);return {...r,...s};}
 function aggregate(){
   const cs=cases().map(c=>({...c,_d:onset(c),_pkm:pkm(c),_kec:kec(c)||pkmKec(pkm(c))})).filter(c=>c._d);
   if(!cs.length)return {end:null,pkm:[],kec:[],n:0,dated:0};
   const end=cs.reduce((a,c)=>c._d>a?c._d:a,new Date(0));
   const ms=86400000, latestStart=new Date(end.getTime()-6*ms), baseStart=new Date(end.getTime()-62*ms), priorEnd=new Date(end.getTime()-7*ms);
   const dr=rows();
   const pMap={};dr.forEach(r=>pMap[norm(r.puskesmas)]={name:r.puskesmas,kec:r.kec,pop:num(r.population),valid:validDen(r),obs:0,base:0});
   cs.forEach(c=>{const k=c._pkm;if(!pMap[k])return;if(c._d>=latestStart&&c._d<=end)pMap[k].obs++;else if(c._d>=baseStart&&c._d<priorEnd)pMap[k].base++});
   const pkmOut=Object.values(pMap).map(r=>{const baseline=r.base/8,exp=Math.max(baseline,0),z=(r.obs-exp)/Math.sqrt(exp+.5),rr=(exp>0?r.obs/exp:(r.obs>0?Infinity:1)),ir7=r.valid?(r.obs/r.pop*100000):null;return classify({unit:r.name,kec:r.kec,obs:r.obs,base:r.base,baseline,expected:exp,z,rr,ir7,valid:r.valid,pop:r.pop});}).sort((a,b)=>({ 'Sinyal kuat':0,'Sinyal sedang':1,Monitor:2}[a.level]-({'Sinyal kuat':0,'Sinyal sedang':1,Monitor:2}[b.level])||b.z-a.z||b.obs-a.obs));
   const kMap={};master.forEach(g=>kMap[g.kec.toLowerCase()]={name:g.kec,pop:0,valid:true,obs:0,base:0,hasDen:false});dr.forEach(r=>{const k=String(r.kec).toLowerCase();if(!kMap[k])kMap[k]={name:r.kec,pop:0,valid:true,obs:0,base:0,hasDen:false};if(validDen(r)){kMap[k].pop+=num(r.population)||0;kMap[k].hasDen=true}else{kMap[k].valid=false;}});cs.forEach(c=>{const k=c._kec;if(!kMap[k])return;if(c._d>=latestStart&&c._d<=end)kMap[k].obs++;else if(c._d>=baseStart&&c._d<priorEnd)kMap[k].base++;});
   const kecOut=Object.values(kMap).map(r=>{const baseline=r.base/8,exp=Math.max(baseline,0),z=(r.obs-exp)/Math.sqrt(exp+.5),rr=(exp>0?r.obs/exp:(r.obs>0?Infinity:1)),ir7=(r.hasDen&&r.pop>0)?r.obs/r.pop*100000:null;return classify({unit:r.name,obs:r.obs,base:r.base,baseline,expected:exp,z,rr,ir7,valid:r.hasDen&&r.valid,pop:r.pop});}).sort((a,b)=>({'Sinyal kuat':0,'Sinyal sedang':1,Monitor:2}[a.level]-({'Sinyal kuat':0,'Sinyal sedang':1,Monitor:2}[b.level])||b.z-a.z||b.obs-a.obs));
   return {end,latestStart,baseStart,priorEnd,pkm:pkmOut,kec:kecOut,n:cs.length,dated:cs.length};
 }
 function render(){
   const sec=E('demografi');if(!sec)return;
   let card=E('v65AutoOutbreak');if(!card){card=document.createElement('div');card.id='v65AutoOutbreak';card.className='card';card.style.marginTop='16px';const anchor=E('demoTableV49')?.parentElement;sec.insertBefore(card,anchor?.nextSibling||sec.firstChild);}
   const d=aggregate();
   if(!d.end){card.innerHTML='<div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">🚨 v65 — Automated Outbreak Detection</h3><div class="small">Deteksi anomali berbasis data kasus bertanggal onset.</div></div><span class="badge">Belum cukup data</span></div><div class="notice">Belum ada kasus dengan <b>tanggal onset</b> yang dapat dianalisis untuk investigasi aktif.</div>';return;}
   const strong=[...d.pkm,...d.kec].filter(r=>r.level==='Sinyal kuat').length,medium=[...d.pkm,...d.kec].filter(r=>r.level==='Sinyal sedang').length;
   const top=[...d.pkm,...d.kec].filter(r=>r.level!=='Monitor').slice(0,8);
   let h='<div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">🚨 v65 — Automated Outbreak Detection</h3><div class="small">Deteksi anomali otomatis menggunakan kasus 7 hari terakhir dibandingkan baseline 56 hari sebelumnya. Titik akhir mengikuti tanggal onset terbaru pada dataset terpilih.</div></div><span class="badge">Automated anomaly detection</span></div>';
   h+='<div class="notice"><b>Interpretasi:</b> sistem membandingkan observasi 7 hari dengan rerata mingguan dari 56 hari sebelumnya. <b>z</b> mengukur deviasi dari baseline; <b>rasio Obs/Baseline</b> adalah perbandingan kasus aktual terhadap baseline. Sinyal ini bukan diagnosis dan <b>bukan penetapan KLB</b>.</div>';
   h+='<div class="grid"><div class="card"><b>'+strong+'</b><div class="small">Sinyal kuat</div></div><div class="card"><b>'+medium+'</b><div class="small">Sinyal sedang</div></div><div class="card"><b>'+d.n+'</b><div class="small">Kasus bertanggal onset</div></div><div class="card"><b>'+new Date(d.end).toLocaleDateString('id-ID')+'</b><div class="small">Onset terbaru</div></div></div>';
   h+='<div class="toolbar"><button class="primary" onclick="renderAutomatedOutbreakDetection65()">🔄 Analisis Ulang</button><button onclick="exportAutomatedOutbreakDetection65()">⬇️ Ekspor CSV</button></div>';
   h+='<h4>Prioritas Investigasi</h4>';
   if(!top.length)h+='<div class="notice">Tidak ada wilayah yang melewati ambang sinyal otomatis.</div>';else{h+='<div style="overflow:auto"><table><thead><tr><th>Prioritas</th><th>Wilayah</th><th>Level</th><th>7 Hari</th><th>Baseline/minggu</th><th>Rasio Obs/Baseline</th><th>z</th><th>IR 7 hari</th><th>Denominator</th><th>Alasan</th></tr></thead><tbody>';top.forEach((r,i)=>{h+='<tr><td><b>'+(i+1)+'</b></td><td><b>'+esc65(r.unit)+'</b>'+(r.kec?'<div class="small">'+esc65(r.kec)+'</div>':'')+'</td><td><span class="badge">'+esc65(r.level)+'</span></td><td>'+r.obs+'</td><td>'+r.baseline.toFixed(2)+'</td><td>'+(r.rr===Infinity?'∞':r.rr.toFixed(2))+'</td><td>'+r.z.toFixed(2)+'</td><td>'+ (r.ir7==null?'—':r.ir7.toFixed(2)+'/100.000')+'</td><td>'+(r.valid?'✓ Valid':'⚠ Tidak lengkap')+'</td><td>'+esc65(r.reason)+'</td></tr>'});h+='</tbody></table></div>'}
   h+='<h4 style="margin-top:18px">Seluruh Puskesmas</h4><div style="overflow:auto"><table><thead><tr><th>Puskesmas</th><th>Kecamatan</th><th>7 Hari</th><th>Baseline/minggu</th><th>Rasio Obs/Baseline</th><th>z</th><th>Sinyal</th></tr></thead><tbody>';d.pkm.forEach(r=>{h+='<tr><td>'+esc65(r.unit)+'</td><td>'+esc65(r.kec)+'</td><td>'+r.obs+'</td><td>'+r.baseline.toFixed(2)+'</td><td>'+(r.rr===Infinity?'∞':r.rr.toFixed(2))+'</td><td>'+r.z.toFixed(2)+'</td><td><span class="badge">'+esc65(r.level)+'</span></td></tr>'});h+='</tbody></table></div>';
   h+='<div class="small" style="margin-top:10px">Catatan: kasus tanpa tanggal onset tidak masuk mesin anomali. Denominator hanya digunakan untuk IR; deteksi sinyal tetap dapat berjalan bila denominator belum tersedia. Threshold statistik adalah parameter operasional awal dan perlu ditinjau oleh epidemiolog/program.</div>';
   card.innerHTML=h;window.__GORUT_V65=d;
 }
 window.renderAutomatedOutbreakDetection65=render;
 window.exportAutomatedOutbreakDetection65=function(){const d=window.__GORUT_V65||aggregate();const q=s=>`"${String(s??'').replace(/"/g,'""')}"`;const lines=['Level,Wilayah,Kecamatan,Kasus_7_Hari,Baseline_Mingguan,RR,z,IR_7_Hari_per_100000,Denominator,Alasan'];[...(d.pkm||[]),...(d.kec||[])].forEach(r=>lines.push([r.level,r.unit,r.kec||'',r.obs,r.baseline.toFixed(3),r.rr===Infinity?'Infinity':r.rr.toFixed(3),r.z.toFixed(3),r.ir7==null?'':r.ir7.toFixed(3),r.valid?'Valid':'Tidak lengkap',r.reason].map(q).join(',')));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}));a.download='gorut-automated-outbreak-detection-v65.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
 window.GORUT_V65={version:'v65',features:['automated anomaly detection','7-day vs 56-day baseline','z-score','observed-to-baseline ratio','Puskesmas & Kecamatan','prioritas investigasi','CSV export'],note:'Sinyal operasional, bukan penetapan KLB.'};
 const oldPage65=window.page;window.page=function(id,b){const r=typeof oldPage65==='function'?oldPage65.apply(this,arguments):undefined;setTimeout(()=>{if(id==='demografi')render()},180);return r};
 setTimeout(()=>{try{render()}catch(e){console.warn('v65 init',e)}},2700);
})();


/* ==================== v66 — FINAL DEMOGRAPHY TABLE + FINAL CASE LINE LIST ==================== */
(function(){
  const E66=id=>document.getElementById(id);
  const esc66=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const DKEY='gorut-demography-v49';
  const master66=[
    {puskesmas:'Puskesmas Atinggola',kec:'Atinggola',desa:'Atinggola'},
    {puskesmas:'Puskesmas Gentuma',kec:'Gentuma Raya',desa:'Gentuma'},
    {puskesmas:'Puskesmas Dambalo',kec:'Tomilito',desa:'Dambalo'},
    {puskesmas:'Puskesmas Ponelo',kec:'Ponelo Kepulauan',desa:'Ponelo'},
    {puskesmas:'Puskesmas Kwandang',kec:'Kwandang',desa:'Kwandang'},
    {puskesmas:'Puskesmas Molingkapoto',kec:'Kwandang',desa:'Molingkapoto'},
    {puskesmas:'Puskesmas Anggrek',kec:'Anggrek',desa:'Anggrek'},
    {puskesmas:'Puskesmas Ilangata',kec:'Anggrek',desa:'Ilangata'},
    {puskesmas:'Puskesmas Monano',kec:'Monano',desa:'Monano'},
    {puskesmas:'Puskesmas Dulukapa',kec:'Sumalata Timur',desa:'Dulukapa'},
    {puskesmas:'Puskesmas Sumalata',kec:'Sumalata',desa:'Sumalata'},
    {puskesmas:'Puskesmas Buloila',kec:'Sumalata',desa:'Buloila'},
    {puskesmas:'Puskesmas Biau',kec:'Biau',desa:'Biau'},
    {puskesmas:'Puskesmas Tolinggula',kec:'Tolinggula',desa:'Tolinggula'},
    {puskesmas:'Puskesmas Limbato',kec:'Tolinggula',desa:'Limbato'}
  ];
  function load66(){try{return JSON.parse(localStorage.getItem(DKEY)||'null')||{years:{},meta:{}}}catch(e){return {years:{},meta:{}}}}
  function years66(){const d=load66(),now=new Date().getFullYear(),ys=Object.keys(d.years||{}).map(Number).filter(Number.isFinite);return [...new Set([now,...ys])].sort((a,b)=>b-a)}
  function y66(){return Number(E66('demoYearV49')?.value)||new Date().getFullYear()}
  function desaAcuan66(puskesmas){
    const groups=window.GORUT_VILLAGE_MASTER_V69?.data||[];
    const g=groups.find(x=>x.puskesmas===puskesmas);
    return g && Array.isArray(g.desa) ? g.desa.join('\n') : '';
  }
  function rows66(y){const d=load66(),saved=d.years?.[String(y)]||{};return master66.map(m=>({...m,desa:desaAcuan66(m.puskesmas),population:'',male:'',female:'',households:'',areaKm2:'',lat:'',lng:'',note:'',...(saved[m.puskesmas]||{}),desa: desaAcuan66(m.puskesmas)}))}
  function valid66(r){const p=Number(r.population),m=Number(r.male),f=Number(r.female);return p>0&&m>=0&&f>=0&&Math.abs((m+f)-p)<0.001}
  function render66(){
    const host=E66('demoMasterV66'); if(!host)return;
    const ys=years66(), sel=E66('demoYearV49'); if(sel){sel.innerHTML=ys.map(y=>`<option value="${y}">${y}</option>`).join('');if(!ys.includes(Number(sel.value)))sel.value=String(ys[0]);}
    const y=y66(), rows=rows66(y), d=load66(), meta=d.meta?.[String(y)]||{};
    if(E66('demoSourceV49'))E66('demoSourceV49').value=meta.source||'';
    if(E66('demoUpdatedV49'))E66('demoUpdatedV49').value=meta.updated||'';
    if(E66('demoNoteV49'))E66('demoNoteV49').value=meta.note||'';
    const total=rows.reduce((s,r)=>s+(Number(r.population)||0),0), male=rows.reduce((s,r)=>s+(Number(r.male)||0),0), female=rows.reduce((s,r)=>s+(Number(r.female)||0),0), valid=rows.filter(valid66).length, filled=rows.filter(r=>Number(r.population)>0).length;
    let h=`<div class="card" id="v66DemographyCard" style="margin-top:12px;border:2px solid #1769aa"><div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">👥 TABEL ISIAN DEMOGRAFI — ${y}</h3><div class="small">Master denominator resmi per wilayah kerja Puskesmas. <b>Isi langsung pada tabel di bawah, lalu klik Simpan Demografi Tahun Ini.</b></div></div><span class="badge">11 Kecamatan · 15 Puskesmas</span></div><div class="notice"><b>Validasi denominator:</b> Penduduk harus > 0 dan <b>Laki-laki + Perempuan = Penduduk</b>. Angka penduduk tidak diisi otomatis agar tidak terjadi pembagian penduduk kabupaten ke wilayah Puskesmas tanpa dasar resmi.</div>`;
    h+=`<div class="notice" style="margin-top:10px"><b>Desa Acuan:</b> daftar desa di bawah diisi otomatis berdasarkan <b>Master Pembagian Desa per Puskesmas</b> yang Anda berikan. Kolom ini bersifat referensi wilayah kerja dan tidak perlu diketik ulang.</div>`;
    h+=`<div class="grid"><div class="stat"><small>Puskesmas</small><b>15</b></div><div class="stat"><small>Penduduk terisi</small><b>${total.toLocaleString('id-ID')}</b></div><div class="stat"><small>Laki-laki</small><b>${male.toLocaleString('id-ID')}</b></div><div class="stat"><small>Perempuan</small><b>${female.toLocaleString('id-ID')}</b></div><div class="stat"><small>Denominator valid</small><b>${valid}/15</b></div></div>`;
    h+=`<div style="overflow:auto"><table class="report-table"><thead><tr><th>No.</th><th>Puskesmas</th><th>Kecamatan</th><th>Desa Acuan</th><th>Penduduk</th><th>Laki-laki</th><th>Perempuan</th><th>KK</th><th>Luas km²</th><th>Latitude</th><th>Longitude</th><th>Status Denominator</th><th>Catatan</th></tr></thead><tbody>`;
    rows.forEach((r,i)=>{const ok=valid66(r), status=ok?'<span class="badge">✓ Valid</span>':Number(r.population)>0?'<span class="badge">⚠ Periksa L+P</span>':'<span class="badge">Belum diisi</span>';h+=`<tr><td>${i+1}</td><td><b>${esc66(r.puskesmas)}</b></td><td>${esc66(r.kec)}</td><td><textarea data-demo66="desa" data-i="${i}" readonly rows="${Math.min(8, Math.max(3, String(r.desa||'').split('\n').length))}" style="min-width:260px;line-height:1.35;background:#f6f8fa;border:1px solid #d6dde5" title="Daftar desa wilayah kerja Puskesmas">${esc66(r.desa)}</textarea><div class="small" style="margin-top:4px"><b>${String(r.desa||'').split('\n').filter(Boolean).length}</b> desa acuan</div></td><td><input data-demo66="population" data-i="${i}" type="number" min="0" value="${esc66(r.population)}"></td><td><input data-demo66="male" data-i="${i}" type="number" min="0" value="${esc66(r.male)}"></td><td><input data-demo66="female" data-i="${i}" type="number" min="0" value="${esc66(r.female)}"></td><td><input data-demo66="households" data-i="${i}" type="number" min="0" value="${esc66(r.households)}"></td><td><input data-demo66="areaKm2" data-i="${i}" type="number" min="0" step="any" value="${esc66(r.areaKm2)}"></td><td><input data-demo66="lat" data-i="${i}" type="number" step="any" value="${esc66(r.lat)}"></td><td><input data-demo66="lng" data-i="${i}" type="number" step="any" value="${esc66(r.lng)}"></td><td>${status}</td><td><input data-demo66="note" data-i="${i}" value="${esc66(r.note)}"></td></tr>`});
    h+='</tbody></table></div></div>';host.innerHTML=h;
    if(E66('demoSummaryV49'))E66('demoSummaryV49').style.display='none';
  }
  window.saveDemographyV66=function(){const y=y66(), rows=rows66(y);document.querySelectorAll('[data-demo66]').forEach(el=>{const i=Number(el.dataset.i);if(rows[i])rows[i][el.dataset.demo66]=el.value});const d=load66();d.years=d.years||{};d.meta=d.meta||{};d.years[String(y)]={};rows.forEach(r=>d.years[String(y)][r.puskesmas]=r);d.meta[String(y)]={source:E66('demoSourceV49')?.value||'',updated:E66('demoUpdatedV49')?.value||'',note:E66('demoNoteV49')?.value||''};localStorage.setItem(DKEY,JSON.stringify(d));render66();if(typeof renderDemographyV49==='function')setTimeout(()=>{try{renderDemographyV49()}catch(e){};render66()},50);alert(`Tabel Isian Demografi ${y} berhasil disimpan.`)};
  function renderCases66(){const rows=E66('caseRows');if(!rows)return;const q=(E66('caseSearch')?.value||'').toLowerCase();const all=(db.cases||[]).filter(c=>!db.active||String(c.investigationId)===String(db.active));const getSymptoms=c=>c.symptoms||c.answers?.symptoms||c.answers?.symptom||c.answers?.gejala||c.answers?.gejalaUtama||c.foodCase?.symptoms||c.caseSymptoms||'-';const risk=typeof window.showCaseRiskFactors59==='function'?null:null;const esc=esc66;const arr=all.filter(c=>`${c.id||''} ${c.name||''} ${c.address||''} ${c.desa||c.admin?.desa||''} ${c.kec||c.admin?.kec||''} ${getSymptoms(c)}`.toLowerCase().includes(q));rows.innerHTML=arr.map(c=>{let rf=[];try{if(typeof window.deriveRiskFactors46==='function')rf=window.deriveRiskFactors46(c)||[];else rf=c.riskFactors||[]}catch(e){};const positive=rf.filter(x=>{const v=String(x.value??x.answer??'').trim().toLowerCase();return v&&!/^(tidak|tidak ada|tidak diketahui|tidak relevan|negatif|bukan|belum|0|no)$/.test(v)});const riskHtml=positive.length?positive.slice(0,3).map(x=>`<span class="risk-chip"><span>${esc(x.label||x.question||'')}</span><b>${esc(x.value??x.answer??'')}</b></span>`).join('')+(positive.length>3?` <button onclick="showCaseRiskFactors59('${esc(c.id)}')">+${positive.length-3} lainnya</button>`:''):'<span class="risk-none">Belum teridentifikasi</span>';return `<tr><td>${esc(c.id||'-')}</td><td><b>${esc(c.name||'-')}</b></td><td>${esc(c.address||'-')}</td><td>${esc(c.desa||c.admin?.desa||'-')}</td><td>${esc(c.kec||c.admin?.kec||'-')}</td><td>${esc(c.age??'-')}</td><td>${esc(c.sex||'-')}</td><td>${esc(c.onset||'-')}</td><td class="symptom-cell">${esc(getSymptoms(c))}</td><td><span class="badge">${esc(c.status||'-')}</span></td><td><div class="risk-chips">${riskHtml}</div></td><td>${esc(c.outcome||'-')}</td><td class="table-actions"><button onclick="editCase('${esc(c.id)}')">Edit</button> <button class="danger" onclick="deleteRecord('cases','${esc(c.id)}')">Hapus</button></td></tr>`}).join('')||'<tr><td colspan="13"><div class="notice">Belum ada kasus.</div></td></tr>';
    const th=rows.closest('table')?.querySelector('thead tr');if(th)th.innerHTML='<th>ID</th><th>Nama</th><th>Alamat</th><th>Desa/Kel.</th><th>Kecamatan</th><th>Umur</th><th>JK</th><th>Tanggal Onset</th><th>Gejala Utama</th><th>Status</th><th>Faktor Risiko (Kuesioner)</th><th>Outcome</th><th>Aksi</th>';
  }
  window.renderFinalDemographyAndCases66=function(){render66();renderCases66()};
  const oldPage66=window.page;window.page=function(id,b){const r=typeof oldPage66==='function'?oldPage66.apply(this,arguments):undefined;setTimeout(()=>{if(id==='demografi')render66();if(id==='kasus')renderCases66()},220);return r};
  const oldCases66=window.cases;window.cases=function(){const r=typeof oldCases66==='function'?oldCases66.apply(this,arguments):undefined;setTimeout(renderCases66,10);return r};
  setTimeout(()=>{try{render66();renderCases66()}catch(e){console.warn('v66 init',e)}},3200);
  window.GORUT_V66={version:'v66',features:['dedicated demography input table','15 Puskesmas mapped to 11 Kecamatan','denominator validation','final case line list','main symptoms field','risk-factor summary','onset and outcome']};
})();

try{installBrandingV67();}catch(e){}

/* ==================== v69 — MASTER PEMBAGIAN DESA PER PUSKESMAS ==================== */
(function(){
  const V69=[
    {puskesmas:'Puskesmas Atinggola',kec:'Atinggola',desa:['Imana','Bintana','Buata','Pinontoyonga','Monggupo','Kotajin','Ilomata','Iloheluma','Wapalo','Posono','Sigaso','Tombulilato','Kotajin Utara','Oluhuta']},
    {puskesmas:'Puskesmas Gentuma',kec:'Gentuma Raya',desa:['Gentuma','Dumolodo','Molonggota','Ipilo','Langke','Pasalae','Nanati Jaya','Ketapang','Motomingo','Durian','Bohusami']},
    {puskesmas:'Puskesmas Dambalo',kec:'Tomilito',desa:['Dambalo','Milango','Jembatan Merah','Bubode','Leyao','Molantadu','Huidu Melito','Bulango Raya','Tanjung Karang','Mutiara Laut']},
    {puskesmas:'Puskesmas Ponelo',kec:'Ponelo Kepulauan',desa:['Ponelo Pusat','Malambe','Otiola','Tihengo']},
    {puskesmas:'Puskesmas Kwandang',kec:'Kwandang',desa:['Posso','Bualemo','Titidu','Moluo','Masuru','Cisadane','Katialada']},
    {puskesmas:'Puskesmas Molingkapoto',kec:'Kwandang',desa:['Botuwombato','Pontolo Atas','Ombulodata','Pontolo','Molingkapoto Selatan','Molingkapoto','Botungobungo','Mootinelo','Leboto','Alata Karya','Bulalo']},
    {puskesmas:'Puskesmas Anggrek',kec:'Anggrek',desa:['Motilango','Helumo','Tolongio','Tutuwoto','Langge','Ilodulunga','Popalo','Putiana','Hiyalo Oyile']},
    {puskesmas:'Puskesmas Ilangata',kec:'Anggrek',desa:['Ilangata','Ibarat','Datahu','Tolango','Iloheluma','Dudepo']},
    {puskesmas:'Puskesmas Monano',kec:'Monano',desa:['Monano','Tudi','Monas','Dunu','Garapia','Sogu','Pilohulata','Mokonow','Tolitehuyu','Zuriyati']},
    {puskesmas:'Puskesmas Dulukapa',kec:'Sumalata Timur',desa:['Deme 1','Buluwatu','Dulukapa','Deme 2','Buladu','Hulawa','Wubudu','Bubalango','Mootihelumo','Koluwoka']},
    {puskesmas:'Puskesmas Sumalata',kec:'Sumalata',desa:['Bulontio Timur','Bulontio Barat','Mebongo','Pulahenti','Hutokalo']},
    {puskesmas:'Puskesmas Buloila',kec:'Sumalata',desa:['Buloila','Kasia','Kikia','Tumba','Lelato','Puncak Mandiri']},
    {puskesmas:'Puskesmas Biau',kec:'Biau',desa:['Biau','Omuto','Luhuto','Windu','Topi','Sembihingan','Didingga','Bualo','Potanga','Bohulo']},
    {puskesmas:'Puskesmas Tolinggula',kec:'Tolinggula',desa:['Tolinggula Tengah','Tolinggula Pantai','Tolinggula Ulu','Molangga','Tolite Jaya','Ilomangga','Ilotunggula']},
    {puskesmas:'Puskesmas Limbato',kec:'Tolinggula',desa:['Limbato','Papualangi','Cempaka Putih']}
  ];
  const esc69=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const flat69=V69.flatMap(g=>g.desa.map(d=>({puskesmas:g.puskesmas,kec:g.kec,desa:d})));
  function render69(){
    const host=document.getElementById('gorutVillageMasterV69');if(!host)return;
    const total=flat69.length;
    let h=`<div class="card" id="v69VillageCard" style="margin-top:14px;border:2px solid #2e7d32">
      <div class="toolbar" style="justify-content:space-between;align-items:center"><div><h3 style="margin:0">🏘️ MASTER PEMBAGIAN DESA PER PUSKESMAS</h3><div class="small">Daftar wilayah kerja desa berdasarkan pembagian yang Anda tetapkan. Data ini menjadi referensi administratif aplikasi.</div></div><span class="badge">15 Puskesmas · ${total} Desa</span></div>
      <div class="notice"><b>Sumber:</b> pembagian desa yang diberikan pada 6 Oktober 2026. Berdasarkan daftar ini terdapat <b>${total} desa</b>. Sistem tidak mengubah atau menambahkan desa secara otomatis.</div>
      <div class="grid"><div class="stat"><small>Puskesmas</small><b>15</b></div><div class="stat"><small>Kecamatan</small><b>11</b></div><div class="stat"><small>Total desa</small><b>${total}</b></div><div class="stat"><small>Status</small><b>Master aktif</b></div></div>
      <div class="toolbar"><input id="v69VillageSearch" placeholder="Cari Puskesmas / Kecamatan / Desa..." oninput="renderVillageMasterV69()"><select id="v69KecFilter" onchange="renderVillageMasterV69()"><option value="">Semua Kecamatan</option>${[...new Set(V69.map(x=>x.kec))].map(k=>`<option value="${esc69(k)}">${esc69(k)}</option>`).join('')}</select><button onclick="exportVillageMasterV69()">⬇️ Ekspor CSV</button></div>
      <div style="overflow:auto;max-height:620px"><table class="report-table"><thead><tr><th>No.</th><th>Kecamatan</th><th>Puskesmas</th><th>Desa/Kelurahan</th></tr></thead><tbody id="v69VillageRows"></tbody></table></div>
    </div>`;
    host.innerHTML=h;renderVillageMasterV69();
  }
  window.renderVillageMasterV69=function(){
    const body=document.getElementById('v69VillageRows');if(!body)return;
    const q=(document.getElementById('v69VillageSearch')?.value||'').toLowerCase().trim();const k=document.getElementById('v69KecFilter')?.value||'';
    const arr=flat69.filter(r=>(!k||r.kec===k)&&(!q||`${r.puskesmas} ${r.kec} ${r.desa}`.toLowerCase().includes(q)));
    body.innerHTML=arr.map((r,i)=>`<tr><td>${i+1}</td><td>${esc69(r.kec)}</td><td><b>${esc69(r.puskesmas)}</b></td><td>${esc69(r.desa)}</td></tr>`).join('')||'<tr><td colspan="4"><div class="notice">Tidak ada desa yang sesuai filter.</div></td></tr>';
  };
  window.exportVillageMasterV69=function(){
    const q=s=>`"${String(s??'').replace(/"/g,'""')}"`;const lines=['No,Kecamatan,Puskesmas,Desa/Kelurahan'];flat69.forEach((r,i)=>lines.push([i+1,r.kec,r.puskesmas,r.desa].map(q).join(',')));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}));a.download='master-pembagian-desa-puskesmas-gorontalo-utara-v69.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  };
  window.GORUT_VILLAGE_MASTER_V69={version:'v69',totalDesa:flat69.length,puskesmas:V69.length,kecamatan:[...new Set(V69.map(x=>x.kec))].length,data:V69};
  function installDatalist69(){
    let dl=document.getElementById('gorutVillageDatalistV69');if(!dl){dl=document.createElement('datalist');dl.id='gorutVillageDatalistV69';document.body.appendChild(dl)}dl.innerHTML=[...new Set(flat69.map(x=>x.desa))].map(d=>`<option value="${esc69(d)}">`).join('');
    const e=document.getElementById('cdesa');if(e)e.setAttribute('list','gorutVillageDatalistV69');
  }
  const oldPage69=window.page;window.page=function(id,b){const r=typeof oldPage69==='function'?oldPage69.apply(this,arguments):undefined;setTimeout(()=>{if(id==='demografi'){render69();installDatalist69()}if(id==='kasus')installDatalist69()},250);return r};
  setTimeout(()=>{try{render69();installDatalist69()}catch(e){console.warn('v69 init',e)}},3400);
})();

/* ==================== v70 — OTOMATISASI DESA → PUSKESMAS → KECAMATAN ==================== */
(function(){
  const M=window.GORUT_VILLAGE_MASTER_V69?.data||[];
  const flat=M.flatMap(g=>(g.desa||[]).map(d=>({desa:d,puskesmas:g.puskesmas,kec:g.kec})));
  const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const byDesa=new Map(flat.map(x=>[norm(x.desa),x]));
  const esc70=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function mapping(desa){return byDesa.get(norm(desa))||null}
  function field(id){return document.getElementById(id)}
  function ensurePkmField(current=''){
    const desa=field('cdesa'), kec=field('ckec');
    if(!desa)return;
    let p=field('cpkm');
    if(!p){
      const wrap=desa.closest('.field');
      if(wrap){
        const div=document.createElement('div');div.className='field';div.innerHTML='<label>Puskesmas (otomatis dari Desa)</label><input id="cpkm" readonly style="background:#f3f6f8;font-weight:600">';
        wrap.parentNode.insertBefore(div,wrap.nextSibling);p=field('cpkm');
      }
    }
    const apply=()=>{
      const m=mapping(desa.value);
      if(m){ if(kec)kec.value=m.kec; if(p)p.value=m.puskesmas; desa.style.borderColor='#2e7d32'; }
      else { if(p)p.value=''; desa.style.borderColor=''; }
    };
    desa.onchange=apply; desa.oninput=()=>{const m=mapping(desa.value);if(m){if(kec)kec.value=m.kec;if(p)p.value=m.puskesmas;}};
    if(current)desa.value=current;
    apply();
    const note=document.createElement('div');note.className='small';note.style.marginTop='5px';note.innerHTML='Pilih desa dari daftar master. <b>Kecamatan dan Puskesmas akan terisi otomatis.</b>';
    const old=desa.parentNode.querySelector('.v70-village-help');if(!old){note.className+=' v70-village-help';desa.parentNode.appendChild(note)}
  }
  function injectVillageSelect(){
    const desa=field('cdesa'); if(!desa)return;
    const current=desa.value||'';
    const sel=document.createElement('select');sel.id='cdesa';sel.name=desa.name||'';sel.innerHTML='<option value="">Pilih Desa/Kelurahan...</option>'+flat.map(x=>`<option value="${esc70(x.desa)}">${esc70(x.desa)} — ${esc70(x.puskesmas)}</option>`).join('');
    sel.value=current;desa.replaceWith(sel);ensurePkmField(current);
    sel.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function injectEditVillageSelect(){
    const desa=field('cdesa'); if(!desa)return;
    const current=desa.value||'';
    const sel=document.createElement('select');sel.id='cdesa';sel.name=desa.name||'';sel.innerHTML='<option value="">Pilih Desa/Kelurahan...</option>'+flat.map(x=>`<option value="${esc70(x.desa)}">${esc70(x.desa)} — ${esc70(x.puskesmas)}</option>`).join('');
    sel.value=current;desa.replaceWith(sel);ensurePkmField(current);
  }
  function setCaseMapping(c){
    const m=mapping(c?.desa);
    if(m){c.desa=m.desa;c.kec=m.kec;c.pkm=m.puskesmas;c.puskesmas=m.puskesmas;c.wilayahKerja={desa:m.desa,puskesmas:m.puskesmas,kecamatan:m.kec,source:'Master Desa/Puskesmas v69'};}
    return c;
  }
  const oldAdd=window.addCase;
  window.addCase=function(){
    if(typeof oldAdd==='function')oldAdd.apply(this,arguments);
    setTimeout(()=>{injectVillageSelect();},40);
  };
  const oldEdit=window.editCase;
  window.editCase=function(id){
    if(typeof oldEdit==='function')oldEdit.apply(this,arguments);
    setTimeout(()=>{injectEditVillageSelect();},40);
  };
  const oldSave=window.saveCase;
  window.saveCase=async function(){
    const desa=field('cdesa')?.value||'';const m=mapping(desa);
    if(m){if(field('ckec'))field('ckec').value=m.kec;}
    const before=(db.cases||[]).length;
    const r=typeof oldSave==='function'?await oldSave.apply(this,arguments):undefined;
    const c=(db.cases||[])[before];
    if(c){setCaseMapping(c);save();if(typeof cases==='function')cases();}
    return r;
  };
  const oldUpd=window.upd;
  window.upd=async function(id){
    const desa=field('cdesa')?.value||'';const m=mapping(desa);
    if(m&&field('ckec'))field('ckec').value=m.kec;
    const r=typeof oldUpd==='function'?await oldUpd.apply(this,arguments):undefined;
    const c=(db.cases||[]).find(x=>String(x.id)===String(id));
    if(c){setCaseMapping(c);save();if(typeof cases==='function')cases();}
    return r;
  };
  function renderCaseMappingBanner(){
    const rows=document.getElementById('caseRows');if(!rows)return;
    const page=rows.closest('.page');if(!page)return;
    let b=document.getElementById('v70CaseMappingInfo');
    if(!b){b=document.createElement('div');b.id='v70CaseMappingInfo';b.className='notice';b.style.marginTop='10px';const card=page.querySelector('.card');if(card)card.appendChild(b)}
    b.innerHTML='<b>🔗 Pemetaan wilayah aktif:</b> Desa/Kelurahan menggunakan Master Desa v69. Saat input kasus, Desa → <b>Puskesmas → Kecamatan</b> diisi otomatis. Master saat ini: <b>'+flat.length+' desa · 15 Puskesmas · 11 Kecamatan</b>.';
  }
  const oldPage=window.page;window.page=function(id,b){const r=typeof oldPage==='function'?oldPage.apply(this,arguments):undefined;setTimeout(()=>{if(id==='kasus')renderCaseMappingBanner();},180);return r};
  window.GORUT_V70={version:'v70',totalDesa:flat.length,puskesmas:15,kecamatan:11,features:['desa select from master','automatic puskesmas mapping','automatic kecamatan mapping','case wilayahKerja persistence']};
  setTimeout(()=>{try{renderCaseMappingBanner()}catch(e){}},3600);
})();


/* ==================== v72 — DEMOGRAPHY ONE ROW PER VILLAGE ==================== */
(function(){
  const KEY='gorut-demography-v72-village';
  const E=id=>document.getElementById(id);
  const esc72=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const master=window.GORUT_VILLAGE_MASTER_V69?.data||[];
  const villages=master.flatMap(g=>(g.desa||[]).map(d=>({puskesmas:g.puskesmas,kec:g.kec,desa:d})));
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null')||{years:{},meta:{}}}catch(e){return {years:{},meta:{}}}}
  function years(){const d=load(),now=new Date().getFullYear(),ys=Object.keys(d.years||{}).map(Number).filter(Number.isFinite);return [...new Set([now,...ys])].sort((a,b)=>b-a)}
  function year(){return Number(E('demoYearV49')?.value)||new Date().getFullYear()}
  function id(r){return `${r.puskesmas}||${r.desa}`}
  function rows(y){const d=load(),saved=d.years?.[String(y)]||{};return villages.map(r=>({...r,population:'',male:'',female:'',households:'',areaKm2:'',lat:'',lng:'',note:'',...(saved[id(r)]||{}),puskesmas:r.puskesmas,kec:r.kec,desa:r.desa}))}
  function valid(r){const p=Number(r.population),m=Number(r.male),f=Number(r.female);return p>0&&m>=0&&f>=0&&Math.abs(m+f-p)<0.001}
  function render(){
    const host=E('demoMasterV66');if(!host)return;
    const ys=years(), sel=E('demoYearV49'); if(sel){sel.innerHTML=ys.map(y=>`<option value="${y}">${y}</option>`).join('');if(!ys.includes(Number(sel.value)))sel.value=String(ys[0])}
    const y=year(), rs=rows(y), d=load(), meta=d.meta?.[String(y)]||{};
    if(E('demoSourceV49'))E('demoSourceV49').value=meta.source||'';
    if(E('demoUpdatedV49'))E('demoUpdatedV49').value=meta.updated||'';
    if(E('demoNoteV49'))E('demoNoteV49').value=meta.note||'';
    const total=rs.reduce((s,r)=>s+(Number(r.population)||0),0), male=rs.reduce((s,r)=>s+(Number(r.male)||0),0), female=rs.reduce((s,r)=>s+(Number(r.female)||0),0), filled=rs.filter(r=>Number(r.population)>0).length, val=rs.filter(valid).length;
    let h=`<div class="card" id="v72DemographyCard" style="margin-top:12px;border:2px solid #1769aa"><div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">👥 TABEL ISIAN DEMOGRAFI DESA — ${y}</h3><div class="small">Struktur baru: <b>1 desa = 1 baris data</b>. Semua denominator di sebelahnya melekat langsung pada desa tersebut.</div></div><span class="badge">11 Kecamatan · 15 Puskesmas · ${rs.length} Desa</span></div><div class="notice"><b>Pengisian:</b> masukkan Penduduk, Laki-laki, Perempuan, KK, Luas, Latitude, Longitude, dan Catatan untuk <b>setiap desa</b>. Validasi: Laki-laki + Perempuan = Penduduk. Data tidak diisi otomatis.</div>`;
    h+=`<div class="grid"><div class="stat"><small>Desa</small><b>${rs.length}</b></div><div class="stat"><small>Penduduk terisi</small><b>${total.toLocaleString('id-ID')}</b></div><div class="stat"><small>Laki-laki</small><b>${male.toLocaleString('id-ID')}</b></div><div class="stat"><small>Perempuan</small><b>${female.toLocaleString('id-ID')}</b></div><div class="stat"><small>Baris terisi</small><b>${filled}/${rs.length}</b></div><div class="stat"><small>Denominator valid</small><b>${val}/${rs.length}</b></div></div>`;
    h+=`<div class="toolbar"><input id="v72Search" placeholder="Cari Desa / Puskesmas / Kecamatan..." oninput="renderDemographyVillageV72()"><select id="v72Kec" onchange="renderDemographyVillageV72()"><option value="">Semua Kecamatan</option>${[...new Set(rs.map(r=>r.kec))].map(k=>`<option value="${esc72(k)}">${esc72(k)}</option>`).join('')}</select><select id="v72Pkm" onchange="renderDemographyVillageV72()"><option value="">Semua Puskesmas</option>${[...new Set(rs.map(r=>r.puskesmas))].map(k=>`<option value="${esc72(k)}">${esc72(k)}</option>`).join('')}</select><button onclick="exportDemographyVillageV72()">⬇️ Ekspor CSV</button></div>`;
    h+=`<div class="v80-demo-table-shell"><table class="report-table"><thead><tr><th>No.</th><th>Kecamatan</th><th>Puskesmas</th><th>Desa</th><th>Penduduk</th><th>Laki-laki</th><th>Perempuan</th><th>KK</th><th>Luas km²</th><th>Latitude</th><th>Longitude</th><th>Status Denominator</th><th>Catatan</th></tr></thead><tbody id="v72Rows"></tbody></table></div></div>`;
    host.innerHTML=h;renderDemographyVillageV72();
  }
  window.renderDemographyVillageV72=function(){
    const body=E('v72Rows');if(!body)return;const y=year(),rs=rows(y),q=(E('v72Search')?.value||'').toLowerCase().trim(),k=E('v72Kec')?.value||'',p=E('v72Pkm')?.value||'';
    const arr=rs.map((r,i)=>({...r,_i:i})).filter(r=>(!k||r.kec===k)&&(!p||r.puskesmas===p)&&(!q||`${r.kec} ${r.puskesmas} ${r.desa}`.toLowerCase().includes(q)));
    body.innerHTML=arr.map((r,n)=>{const ok=valid(r),filled=Number(r.population)>0;const status=ok?'<span class="badge">✓ Valid</span>':filled?'<span class="badge">⚠ Periksa L+P</span>':'<span class="badge">Belum diisi</span>';return `<tr><td>${n+1}</td><td>${esc72(r.kec)}</td><td><b>${esc72(r.puskesmas)}</b></td><td><b>${esc72(r.desa)}</b></td><td><input data-v72="population" data-i="${r._i}" type="number" min="0" value="${esc72(r.population)}"></td><td><input data-v72="male" data-i="${r._i}" type="number" min="0" value="${esc72(r.male)}"></td><td><input data-v72="female" data-i="${r._i}" type="number" min="0" value="${esc72(r.female)}"></td><td><input data-v72="households" data-i="${r._i}" type="number" min="0" value="${esc72(r.households)}"></td><td><input data-v72="areaKm2" data-i="${r._i}" type="number" min="0" step="any" value="${esc72(r.areaKm2)}"></td><td><input data-v72="lat" data-i="${r._i}" type="number" step="any" value="${esc72(r.lat)}"></td><td><input data-v72="lng" data-i="${r._i}" type="number" step="any" value="${esc72(r.lng)}"></td><td>${status}</td><td><input data-v72="note" data-i="${r._i}" value="${esc72(r.note)}"></td></tr>`}).join('')||'<tr><td colspan="13"><div class="notice">Tidak ada desa yang cocok dengan filter.</div></td></tr>';
  };
  window.saveDemographyV72=function(){const y=year(),rs=rows(y);document.querySelectorAll('[data-v72]').forEach(el=>{const i=Number(el.dataset.i);if(rs[i])rs[i][el.dataset.v72]=el.value});const d=load();d.years=d.years||{};d.meta=d.meta||{};d.years[String(y)]={};rs.forEach(r=>d.years[String(y)][id(r)]={...r});d.meta[String(y)]={source:E('demoSourceV49')?.value||'',updated:E('demoUpdatedV49')?.value||'',note:E('demoNoteV49')?.value||'',structure:'1 baris per desa'};localStorage.setItem(KEY,JSON.stringify(d));render();alert(`Demografi desa ${y} berhasil disimpan: ${rs.length} baris desa.`)};
  window.exportDemographyVillageV72=function(){const y=year(),rs=rows(y),q=s=>`"${String(s??'').replace(/"/g,'""')}"`;const lines=['Tahun,Kecamatan,Puskesmas,Desa,Penduduk,Laki-laki,Perempuan,KK,Luas_km2,Latitude,Longitude,Status,Catatan'];rs.forEach(r=>lines.push([y,r.kec,r.puskesmas,r.desa,r.population,r.male,r.female,r.households,r.areaKm2,r.lat,r.lng,valid(r)?'Valid':Number(r.population)>0?'Periksa L+P':'Belum diisi',r.note].map(q).join(',')));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}));a.download=`gorut-demografi-desa-${y}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
  const oldSave=window.saveDemographyV66;window.saveDemographyV66=window.saveDemographyV72;
  const oldPage=window.page;window.page=function(id,b){const r=typeof oldPage==='function'?oldPage.apply(this,arguments):undefined;setTimeout(()=>{if(id==='demografi')render()},260);return r};
  setTimeout(()=>{try{render()}catch(e){console.warn('v72 init',e)}},3600);
  window.GORUT_V72={version:'v72',features:['one row per village','123 village denominator rows','village-level population/sex/households/area/coordinates','filters','CSV export'],storage:KEY,villages:rs=>rs?.length||villages.length};
})();
/* ==================== v73 — CASE + QUESTIONNAIRE DATA INTEGRITY ==================== */
(function(){
  const VERSION='v73';
  const DRAFT_PREFIX='gorut-case-draft-v73-';
  const SHEET_KEY='gorut-google-sheet-v73-config';
  const e=id=>document.getElementById(id);
  const esc73=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const safe=v=>v==null?'':v;
  const activeId=()=>String(window.db?.active||'');
  const draftKey=(id='new')=>DRAFT_PREFIX+activeId()+'-'+String(id||'new');
  const questions=()=>Array.isArray(window.db?.questions)?window.db.questions:[];
  const qLabel=(id)=>{const q=questions().find(x=>String(x.id)===String(id));return q?.label||String(id)};
  function collectAllAnswers(){
    const a={};
    questions().forEach((q,i)=>{
      if(!q.id)q.id='Q_'+String(i+1).padStart(3,'0');
      const id='v45q_'+String(q.id).replace(/[^a-zA-Z0-9_]/g,'_')+'_'+i;
      const el=e(id); if(el)a[q.id]=el.value;
    });
    return a;
  }
  function applyAnswers(a){
    questions().forEach((q,i)=>{
      const id='v45q_'+String(q.id).replace(/[^a-zA-Z0-9_]/g,'_')+'_'+i;
      const el=e(id); if(el&&a&&Object.prototype.hasOwnProperty.call(a,q.id))el.value=a[q.id];
    });
  }
  function collectForm(){
    const ids=['cid','cn','ca','cs','co','ct','cu','caddress','cprov','ckab','ckec','cdesa','clat','clng','caseMainSymptoms','caseFood','caseConsumedAt','caseOnsetTime','caseIncubation','caseSymptoms','caseFoodSource','caseHospitalized','caseClinicalSpecimen'];
    const out={};ids.forEach(id=>{const x=e(id);if(x)out[id]=x.value});out.answers=collectAllAnswers();out.savedAt=new Date().toISOString();return out;
  }
  function applyForm(d){if(!d)return;Object.entries(d).forEach(([id,v])=>{if(id==='answers')return;const x=e(id);if(x&&v!=null)x.value=v});applyAnswers(d.answers||{})}
  function saveDraft(id='new'){try{localStorage.setItem(draftKey(id),JSON.stringify(collectForm()))}catch(err){console.warn('v73 draft',err)}}
  function loadDraft(id='new'){try{return JSON.parse(localStorage.getItem(draftKey(id))||'null')}catch(e){return null}}
  function clearDraft(id='new'){try{localStorage.removeItem(draftKey(id))}catch(e){}}
  function bindDraft(id='new'){
    const modalBox=e('modal'); if(!modalBox)return;
    const draft=loadDraft(id);
    if(draft){
      const bar=document.createElement('div');bar.className='notice';bar.id='v73DraftNotice';bar.innerHTML='<b>💾 Draft ditemukan.</b> Data pengisian terakhir tersedia di perangkat ini. <button type="button" id="v73RestoreDraft">Pulihkan</button> <button type="button" id="v73DiscardDraft">Buang draft</button>';
      modalBox.insertBefore(bar,modalBox.firstChild);
      e('v73RestoreDraft').onclick=()=>{applyForm(draft);bar.remove();};
      e('v73DiscardDraft').onclick=()=>{clearDraft(id);bar.remove();};
    }
    modalBox.querySelectorAll('input,select,textarea').forEach(x=>x.addEventListener('input',()=>saveDraft(id)));
    modalBox.querySelectorAll('input,select,textarea').forEach(x=>x.addEventListener('change',()=>saveDraft(id)));
  }
  function questionnaireVersion(){
    const qs=questions();
    return {version:qs[0]?.version||'lokal',questionCount:qs.length,questionIds:qs.map(q=>q.id),capturedAt:new Date().toISOString()};
  }
  function answerCount(a){return Object.keys(a||{}).filter(k=>String(a[k]??'')!=='').length}
  function detailCase(id){
    const c=(window.db?.cases||[]).find(x=>String(x.id)===String(id));if(!c)return;
    const a=c.answers||{};const qs=questions();
    const keys=qs.length?qs.map(q=>q.id):Object.keys(a);
    const rows=keys.map((k,i)=>`<tr><td>${i+1}</td><td>${esc73(qLabel(k))}</td><td><code>${esc73(k)}</code></td><td>${esc73(typeof a[k]==='object'?JSON.stringify(a[k]):safe(a[k]))}</td></tr>`).join('');
    const meta=c.questionnaireMeta||{};
    modal(`<h2>📋 Jawaban Kuesioner — ${esc73(c.id)}</h2><div class="grid"><div class="stat"><small>Nama</small><b>${esc73(c.name||'-')}</b></div><div class="stat"><small>Jawaban terisi</small><b>${answerCount(a)}/${keys.length}</b></div><div class="stat"><small>Versi instrumen</small><b>${esc73(meta.version||'-')}</b></div><div class="stat"><small>Terakhir diperbarui</small><b>${esc73(c.updatedAt||c.createdAt||'-')}</b></div></div><div class="notice">Seluruh jawaban mentah tersimpan pada <code>case.answers</code>. Tabel Daftar Kasus hanya menampilkan variabel ringkas agar tetap mudah dibaca.</div><div style="overflow:auto;max-height:65vh"><table class="report-table"><thead><tr><th>No.</th><th>Pertanyaan</th><th>Field</th><th>Jawaban</th></tr></thead><tbody>${rows||'<tr><td colspan="4">Belum ada jawaban kuesioner.</td></tr>'}</tbody></table></div><div class="toolbar"><button onclick="exportCaseQuestionnaireV73('${esc73(c.id)}')">⬇️ Ekspor Kasus Ini</button><button onclick="close()">Tutup</button></div>`);
  }
  window.showCaseQuestionnaireV73=detailCase;
  window.exportCaseQuestionnaireV73=function(id){
    const c=(window.db?.cases||[]).find(x=>String(x.id)===String(id));if(!c)return;
    const a=c.answers||{},q=s=>`"${String(s??'').replace(/"/g,'""')}"`,lines=['Case_ID,Pertanyaan,Field,Jawaban'];
    Object.keys(a).forEach(k=>lines.push([c.id,qLabel(k),k,typeof a[k]==='object'?JSON.stringify(a[k]):a[k]].map(q).join(',')));
    const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),x=document.createElement('a');x.href=url;x.download=`${c.id}-kuesioner-lengkap.csv`;x.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  window.exportCompleteCasesV73=function(){
    const cs=(window.db?.cases||[]).filter(c=>!window.db?.active||String(c.investigationId)===String(window.db.active));
    const q=s=>`"${String(s??'').replace(/"/g,'""')}"`,keys=[...new Set(cs.flatMap(c=>Object.keys(c.answers||{})))];
    const fixed=['id','investigationId','disease','name','age','sex','onset','status','outcome','address','prov','kab','kec','desa','pkm','puskesmas','lat','lng','createdAt','updatedAt'];
    const cols=[...fixed,...keys.map(k=>'answers.'+k)];
    const lines=[cols.map(q).join(',')];cs.forEach(c=>lines.push(cols.map(k=>k.startsWith('answers.')?(c.answers||{})[k.slice(8)]:c[k]).map(v=>q(typeof v==='object'?JSON.stringify(v):v)).join(',')));
    const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),x=document.createElement('a');x.href=url;x.download=`gorut-dataset-kasus-lengkap-${new Date().toISOString().slice(0,10)}.csv`;x.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  window.exportCasesJSONV73=function(){const cs=(window.db?.cases||[]).filter(c=>!window.db?.active||String(c.investigationId)===String(window.db.active));const payload={format:'GORUT-OUTBREAK-AI Case Backup',version:VERSION,exportedAt:new Date().toISOString(),investigationId:window.db?.active||null,cases:cs};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),x=document.createElement('a');x.href=url;x.download=`gorut-case-backup-${new Date().toISOString().slice(0,10)}.json`;x.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
  function sheetCfg(){try{return JSON.parse(localStorage.getItem(SHEET_KEY)||'{}')}catch(e){return {}}}
  function saveSheetCfg(){const url=(e('v73SheetUrl')?.value||'').trim();localStorage.setItem(SHEET_KEY,JSON.stringify({webAppUrl:url,updatedAt:new Date().toISOString()}));return url}
  async function sendCaseToSheet(c){
    const url=sheetCfg().webAppUrl;if(!url)return {ok:false,reason:'not-configured'};
    const payload={event:'case_upsert',version:VERSION,sentAt:new Date().toISOString(),case:c};
    try{await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});c.syncStatus='sheet-queued';c.sheetLastAttemptAt=new Date().toISOString();save();return {ok:true}}catch(err){c.syncStatus='sheet-error';c.sheetError=String(err);save();return {ok:false,reason:String(err)}}
  }
  window.syncActiveCasesToGoogleSheetV73=async function(){const url=saveSheetCfg();if(!url)return alert('Masukkan URL Google Apps Script Web App terlebih dahulu.');const cs=(window.db?.cases||[]).filter(c=>!window.db?.active||String(c.investigationId)===String(window.db.active));let ok=0;for(const c of cs){const r=await sendCaseToSheet(c);if(r.ok)ok++}alert(`Pengiriman ke Google Sheet diproses untuk ${ok}/${cs.length} kasus. Karena mode no-cors, status HTTP dari Google tidak dapat diverifikasi dari browser.`);cases();}
  function injectCasesTools(){
    const rows=e('caseRows');if(!rows)return;const page=rows.closest('.page');if(!page)return;
    let box=e('v73CaseDataTools');if(!box){box=document.createElement('div');box.id='v73CaseDataTools';box.className='card';box.style.marginTop='12px';rows.closest('.card')?.parentElement?.insertBefore(box,rows.closest('.card').nextSibling);}
    const cfg=sheetCfg();
    box.innerHTML=`<div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">🛡️ Manajemen Data Kasus & Kuesioner — v73</h3><div class="small">Satu Case ID menyimpan identitas, wilayah, data klinis, dan <b>seluruh jawaban kuesioner mentah</b>. Data dapat diekspor sebagai CSV/JSON.</div></div><span class="badge">Integritas data aktif</span></div><div class="toolbar"><button onclick="exportCompleteCasesV73()">⬇️ Dataset Lengkap CSV</button><button onclick="exportCasesJSONV73()">🗄️ Backup JSON</button></div><details><summary><b>☁️ Google Sheets — sinkronisasi opsional</b></summary><p class="small">Masukkan URL Web App Google Apps Script yang Anda deploy sendiri. Aplikasi tidak mengirim data ke Google sebelum URL ini diisi.</p><input id="v73SheetUrl" placeholder="https://script.google.com/macros/s/.../exec" value="${esc73(cfg.webAppUrl||'')}"><div class="toolbar"><button onclick="saveSheetCfg();alert('Konfigurasi Google Sheet disimpan di perangkat ini.')">Simpan URL</button><button onclick="syncActiveCasesToGoogleSheetV73()">☁️ Kirim Kasus Aktif ke Sheet</button></div></details>`;
  }
  const oldAdd=window.addCase;
  if(typeof oldAdd==='function')window.addCase=function(){const r=oldAdd.apply(this,arguments);setTimeout(()=>{bindDraft('new')},80);return r};
  const oldEdit=window.editCase;
  if(typeof oldEdit==='function')window.editCase=function(id){const r=oldEdit.apply(this,arguments);setTimeout(()=>{bindDraft(id)},80);return r};
  const oldSave=window.saveCase;
  if(typeof oldSave==='function')window.saveCase=async function(){const before=(window.db?.cases||[]).length;const r=await oldSave.apply(this,arguments);const c=(window.db?.cases||[])[before];if(c){c.questionnaireMeta=questionnaireVersion();c.answerCount=answerCount(c.answers||{});c.dataIntegrity={allQuestionnaireAnswersStored:true,storageField:'answers',version:VERSION};c.updatedAt=new Date().toISOString();save();clearDraft('new');try{await sendCaseToSheet(c)}catch(e){}}return r};
  const oldUpd=window.upd;
  if(typeof oldUpd==='function')window.upd=async function(id){const r=await oldUpd.apply(this,arguments);const c=(window.db?.cases||[]).find(x=>String(x.id)===String(id));if(c){c.questionnaireMeta=questionnaireVersion();c.answerCount=answerCount(c.answers||{});c.dataIntegrity={allQuestionnaireAnswersStored:true,storageField:'answers',version:VERSION};c.updatedAt=new Date().toISOString();save();clearDraft(id);try{await sendCaseToSheet(c)}catch(e){}}return r};
  const oldCases=window.cases;
  if(typeof oldCases==='function')window.cases=function(){const r=oldCases.apply(this,arguments);setTimeout(()=>{injectCasesTools();const rows=e('caseRows');if(!rows)return;rows.querySelectorAll('tr').forEach(tr=>{const id=tr.cells?.[0]?.textContent?.trim();if(!id||tr.querySelector('[data-v73-q]'))return;const cell=tr.cells?.[tr.cells.length-1];if(cell){const b=document.createElement('button');b.setAttribute('data-v73-q','1');b.textContent='📋 Kuesioner';b.onclick=()=>detailCase(id);cell.appendChild(document.createTextNode(' '));cell.appendChild(b)}})},30);return r};
  const oldPage=window.page;
  window.page=function(id,b){const r=typeof oldPage==='function'?oldPage.apply(this,arguments):undefined;setTimeout(()=>{if(id==='kasus')injectCasesTools()},180);return r};
  window.GORUT_V73={version:VERSION,features:['Case ID','full questionnaire answer retention','draft autosave','questionnaire detail viewer','complete CSV export','JSON backup','optional Google Sheets webhook'],sheetConfigKey:SHEET_KEY};
  setTimeout(()=>{try{if(e('caseRows'))injectCasesTools()}catch(err){}},2500);
})();

/* ==================== v74 — VILLAGE IR + PUBLIC SURVEY INTEGRITY ==================== */
(function(){
  const VERSION='v74';
  const DEMO_KEY='gorut-demography-v72-village';
  const E=id=>document.getElementById(id);
  const esc74=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const norm=v=>String(v??'').trim().toLowerCase().replace(/^(desa|kelurahan)\s+/,'').replace(/\s+/g,' ');
  const master=window.GORUT_VILLAGE_MASTER_V69?.data||[];
  const villages=master.flatMap(g=>(g.desa||[]).map(d=>({puskesmas:g.puskesmas,kec:g.kec,desa:d})));
  function loadDemo(){try{return JSON.parse(localStorage.getItem(DEMO_KEY)||'null')||{years:{},meta:{}}}catch(e){return {years:{},meta:{}}}}
  function year(){return Number(E('demoYearV49')?.value)||new Date().getFullYear()}
  function demoRows(y){const d=loadDemo(),saved=d.years?.[String(y)]||{};return villages.map(r=>{const k=`${r.puskesmas}||${r.desa}`;return {...r,...(saved[k]||{}),puskesmas:r.puskesmas,kec:r.kec,desa:r.desa}})}
  function valid(r){const p=Number(r.population),m=Number(r.male),f=Number(r.female);return p>0&&m>=0&&f>=0&&Math.abs(m+f-p)<0.001}
  function activeCases(){return (window.db?.cases||[]).filter(c=>!window.db?.active||String(c.investigationId)===String(window.db.active))}
  function mappingForCase(c){
    const desa=norm(c.desa||c.admin?.desa||c.village||c.answers?.desa||c.answers?.desa_kelurahan||'');
    let m=villages.find(x=>norm(x.desa)===desa);
    if(!m){const p=String(c.puskesmas||c.pkm||c.facility||'').toLowerCase();const k=String(c.kec||c.admin?.kec||'').toLowerCase();m=villages.find(x=>(!p||x.puskesmas.toLowerCase()===p)&&(!k||x.kec.toLowerCase()===k)&&desa&&norm(x.desa)===desa)}
    return m||null;
  }
  function renderVillageIR(){
    const host=E('v74VillageIR');if(!host)return;
    const y=year(),rs=demoRows(y),cases=activeCases(),q=(E('v74IRSearch')?.value||'').toLowerCase().trim(),k=E('v74IRKec')?.value||'',p=E('v74IRPkm')?.value||'';
    const by=new Map(rs.map(r=>[`${r.puskesmas}||${r.desa}`,{...r,cases:0}]));let unmapped=0;
    cases.forEach(c=>{const m=mappingForCase(c);if(m){const row=by.get(`${m.puskesmas}||${m.desa}`);if(row)row.cases++}else unmapped++});
    const arr=[...by.values()].filter(r=>(!k||r.kec===k)&&(!p||r.puskesmas===p)&&(!q||`${r.kec} ${r.puskesmas} ${r.desa}`.toLowerCase().includes(q))).map(r=>({...r,valid:valid(r),ir:valid(r)?r.cases/Number(r.population)*100000:null}));
    arr.sort((a,b)=>(b.cases-a.cases)||(String(a.desa).localeCompare(String(b.desa))));
    const totalCases=cases.length, validRows=rs.filter(valid).length, villageWithCases=arr.filter(r=>r.cases>0).length;
    host.innerHTML=`<div class="card" style="margin-top:12px;border:2px solid #1769aa"><div class="toolbar" style="justify-content:space-between"><div><h3 style="margin:0">📊 IR KASUS PER DESA — ${y}</h3><div class="small">Kasus aktif dipetakan ke <b>Desa → Puskesmas → Kecamatan</b> menggunakan Master Desa resmi aplikasi. IR = kasus / penduduk × 100.000.</div></div><span class="badge">Analitik denominator desa</span></div><div class="notice"><b>Penting:</b> IR hanya dihitung jika denominator desa valid (Penduduk > 0 dan Laki-laki + Perempuan = Penduduk). Sistem <b>tidak menetapkan KLB otomatis</b>; tabel ini adalah alat pemantauan epidemiologis.</div><div class="grid"><div class="stat"><small>Kasus aktif</small><b>${totalCases}</b></div><div class="stat"><small>Desa dengan kasus</small><b>${villageWithCases}</b></div><div class="stat"><small>Denominator valid</small><b>${validRows}/${rs.length}</b></div><div class="stat"><small>Kasus belum terpetakan</small><b>${unmapped}</b></div></div><div class="toolbar"><input id="v74IRSearch" placeholder="Cari Desa / Puskesmas / Kecamatan..." value="${esc74(q)}" oninput="renderVillageIRV74()"><select id="v74IRKec" onchange="renderVillageIRV74()"><option value="">Semua Kecamatan</option>${[...new Set(rs.map(r=>r.kec))].map(x=>`<option value="${esc74(x)}" ${x===k?'selected':''}>${esc74(x)}</option>`).join('')}</select><select id="v74IRPkm" onchange="renderVillageIRV74()"><option value="">Semua Puskesmas</option>${[...new Set(rs.map(r=>r.puskesmas))].map(x=>`<option value="${esc74(x)}" ${x===p?'selected':''}>${esc74(x)}</option>`).join('')}</select><button onclick="exportVillageIRV74()">⬇️ Ekspor IR Desa</button></div><div style="overflow:auto;max-height:620px"><table class="report-table"><thead><tr><th>No.</th><th>Kecamatan</th><th>Puskesmas</th><th>Desa</th><th>Kasus</th><th>Penduduk</th><th>IR/100.000</th><th>Status Denominator</th></tr></thead><tbody>${arr.map((r,i)=>`<tr><td>${i+1}</td><td>${esc74(r.kec)}</td><td>${esc74(r.puskesmas)}</td><td><b>${esc74(r.desa)}</b></td><td>${r.cases}</td><td>${Number(r.population||0).toLocaleString('id-ID')}</td><td>${r.ir==null?'<span class="muted">-</span>':r.ir.toFixed(2)}</td><td>${r.valid?'<span class="badge">✓ Valid</span>':Number(r.population)>0?'<span class="badge">⚠ Periksa L+P</span>':'<span class="badge">Belum diisi</span>'}</td></tr>`).join('')||'<tr><td colspan="8"><div class="notice">Tidak ada data yang cocok dengan filter.</div></td></tr>'}</tbody></table></div></div>`;
  }
  window.renderVillageIRV74=renderVillageIR;
  window.exportVillageIRV74=function(){const y=year(),rs=demoRows(y),cases=activeCases(),by=new Map(rs.map(r=>[`${r.puskesmas}||${r.desa}`,{...r,cases:0}]));cases.forEach(c=>{const m=mappingForCase(c);if(m){const r=by.get(`${m.puskesmas}||${m.desa}`);if(r)r.cases++}});const q=s=>`"${String(s??'').replace(/"/g,'""')}"`;const head=['Tahun','Kecamatan','Puskesmas','Desa','Kasus','Penduduk','IR_per_100000','Denominator_Valid'];const lines=[head.map(q).join(',')];[...by.values()].forEach(r=>lines.push([y,r.kec,r.puskesmas,r.desa,r.cases,r.population,valid(r)?(r.cases/Number(r.population)*100000).toFixed(4):'',valid(r)?'Ya':'Tidak'].map(q).join(',')));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}));a.download=`gorut-ir-desa-${y}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
  function inject(){const host=E('demoMasterV66');if(!host)return;let card=E('v74VillageIR');if(!card){card=document.createElement('div');card.id='v74VillageIR';host.parentElement?.appendChild(card)}renderVillageIR()}
  const oldPage=window.page;window.page=function(id,b){const r=typeof oldPage==='function'?oldPage.apply(this,arguments):undefined;setTimeout(()=>{if(id==='demografi'){try{inject()}catch(e){console.warn('v74 IR',e)}}if(id==='kasus'){try{const rows=E('caseRows');if(rows&&!E('v74CaseMappingNotice')){const n=document.createElement('div');n.id='v74CaseMappingNotice';n.className='notice';n.style.marginTop='8px';n.innerHTML='<b>📍 Pemetaan IR desa aktif:</b> kasus akan dihitung pada desa berdasarkan Master Desa v69. Kasus tanpa Desa yang cocok ditandai sebagai belum terpetakan.';rows.closest('.card')?.appendChild(n)}}catch(e){}}},320);return r};
  const oldCases=window.cases;if(typeof oldCases==='function')window.cases=function(){const r=oldCases.apply(this,arguments);setTimeout(()=>{if(E('v74VillageIR'))renderVillageIR()},120);return r};
  setTimeout(()=>{try{if(E('demoMasterV66'))inject()}catch(e){}},4200);
  window.GORUT_V74={version:VERSION,features:['village-level incidence rate','denominator validation','unmapped-case count','village IR CSV export','public survey idempotency support']};
})();

/* ==================== v75 — DASHBOARD EPIDEMIOLOGI DESA & EARLY WARNING ==================== */
(function(){
  const VERSION='v75';
  const DEMO_KEY='gorut-demography-v72-village';
  const E=id=>document.getElementById(id);
  const esc75=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const norm=v=>String(v??'').trim().toLowerCase().replace(/^(desa|kelurahan)\s+/,'').replace(/\s+/g,' ');
  const master=window.GORUT_VILLAGE_MASTER_V69?.data||[];
  const villages=master.flatMap(g=>(g.desa||[]).map(d=>({puskesmas:g.puskesmas,kec:g.kec,desa:d})));
  function loadDemo(){try{return JSON.parse(localStorage.getItem(DEMO_KEY)||'null')||{years:{},meta:{}}}catch(e){return {years:{},meta:{}}}}
  function demoRows(y){const d=loadDemo(),saved=d.years?.[String(y)]||{};return villages.map(r=>{const k=`${r.puskesmas}||${r.desa}`;return {...r,...(saved[k]||{}),puskesmas:r.puskesmas,kec:r.kec,desa:r.desa}})}
  function valid(r){const p=Number(r.population),m=Number(r.male),f=Number(r.female);return p>0&&m>=0&&f>=0&&Math.abs(m+f-p)<0.001}
  function activeCases(){return (window.db?.cases||[]).filter(c=>!window.db?.active||String(c.investigationId)===String(window.db.active))}
  function dateOf(c){const a=c.onset||c.onsetAt||c.tanggalOnset||c.answers?.['Tanggal onset']||c.answers?.['Tanggal onset demam']||c.answers?.['Tanggal onset demam']||'';const d=new Date(a);return isNaN(d)?null:d}
  function mapCase(c){const desa=norm(c.desa||c.admin?.desa||c.village||c.answers?.desa||c.answers?.desa_kelurahan||c.answers?.['Desa/Kelurahan']||'');if(!desa)return null;const p=String(c.puskesmas||c.pkm||c.answers?.puskesmas||c.answers?.Puskesmas||'').trim().toLowerCase();const k=String(c.kec||c.answers?.kec||c.answers?.Kecamatan||'').trim().toLowerCase();let candidates=villages.filter(x=>norm(x.desa)===desa);if(p)candidates=candidates.filter(x=>x.puskesmas.toLowerCase()===p);if(k)candidates=candidates.filter(x=>x.kec.toLowerCase()===k);return candidates[0]||null}
  function diseaseName(c){return String(c.disease||window.db?.investigations?.find(i=>String(i.id)===String(c.investigationId))?.disease||'Tidak diketahui')}
  function daysAgo(d,n){const x=new Date(d);x.setDate(x.getDate()-n);return x}
  function signal(r){if(r.recent>=2&&r.z>=2)return ['PRIORITAS TINGGI','priority'];if(r.recent>=1&&(r.recent>r.prior||r.z>=1.5))return ['WASPADA','warning'];if(r.recent>0)return ['MONITOR','monitor'];return ['NORMAL','normal']}
  function compute(){
    const now=new Date(),start28=daysAgo(now,28),start56=daysAgo(now,56),rs=demoRows(new Date().getFullYear()),cases=activeCases();
    const by=new Map(rs.map(r=>[`${r.puskesmas}||${r.desa}`,{...r,recent:0,prior:0,undated:0}]));let mapped=0,dated=0;
    cases.forEach(c=>{const m=mapCase(c);const d=dateOf(c);if(!m)return;if(d)dated++;if(m){const r=by.get(`${m.puskesmas}||${m.desa}`);if(!r)return;mapped++;if(d>=start28&&d<=now)r.recent++;else if(d>=start56&&d<start28)r.prior++;else if(!d)r.undated++}});
    const rows=[...by.values()].map(r=>{const base=r.prior/4;const z=(r.recent-base)/Math.sqrt(Math.max(base,1));const ir=valid(r)?r.recent/Number(r.population)*100000:null;const prevIr=valid(r)?r.prior/Number(r.population)*100000:null;const [label,cls]=signal({recent:r.recent,prior:r.prior,z});return {...r,base,z,ir,prevIr,label,cls,change:r.prior?((r.recent-r.prior)/r.prior*100):r.recent?100:0}});
    rows.sort((a,b)=>(b.recent-a.recent)||(b.z-a.z)||(b.ir??-1)-(a.ir??-1));
    const totalRecent=rows.reduce((s,r)=>s+r.recent,0),totalPrior=rows.reduce((s,r)=>s+r.prior,0),validCount=rows.filter(valid).length,withRecent=rows.filter(r=>r.recent>0).length,priority=rows.filter(r=>r.cls==='priority').length,warning=rows.filter(r=>r.cls==='warning').length;
    const diseases={};cases.forEach(c=>{const d=dateOf(c);if(d&&d>=start28&&d<=now){const k=diseaseName(c);diseases[k]=(diseases[k]||0)+1}});
    const trend=[];for(let i=7;i>=0;i--){const end=new Date(now);end.setDate(end.getDate()-i*7);const st=new Date(end);st.setDate(st.getDate()-7);const n=cases.filter(c=>{const d=dateOf(c);return d&&d>=st&&d<end}).length;trend.push({label:`M-${i===0?'0':i}`,n})}
    return {rows,cases,totalRecent,totalPrior,validCount,withRecent,priority,warning,mapped,dated,trend,diseases};
  }
  function render(){const host=E('v75VillageDashboard');if(!host)return;const x=compute(),top=x.rows.filter(r=>r.recent>0).slice(0,10),maxTrend=Math.max(1,...x.trend.map(t=>t.n));const disease=Object.entries(x.diseases).sort((a,b)=>b[1]-a[1]).slice(0,6);const pct=x.cases.length?Math.round(x.mapped/x.cases.length*100):100;const change=x.totalPrior?((x.totalRecent-x.totalPrior)/x.totalPrior*100):x.totalRecent?100:0;
    host.innerHTML=`<div class="card" style="border:2px solid #1769aa;margin-top:14px"><div class="toolbar" style="justify-content:space-between"><div><h2 style="margin:0">🛰️ v75 — DASHBOARD EPIDEMIOLOGI DESA</h2><div class="small">Early warning operasional berbasis kasus aktif, waktu onset, Master Desa, dan denominator penduduk. <b>Bukan definisi KLB dan bukan prediksi tervalidasi.</b></div></div><span class="badge">28 hari vs 28 hari sebelumnya</span></div><div class="grid" style="margin-top:12px"><div class="stat"><small>Kasus 28 hari</small><b>${x.totalRecent}</b><div class="small">${change>=0?'+':''}${change.toFixed(1)}% vs periode sebelumnya</div></div><div class="stat"><small>Desa dengan kasus</small><b>${x.withRecent}</b></div><div class="stat"><small>Prioritas tinggi</small><b>${x.priority}</b></div><div class="stat"><small>Waspada</small><b>${x.warning}</b></div><div class="stat"><small>Pemetaan desa</small><b>${pct}%</b></div><div class="stat"><small>Denominator valid</small><b>${x.validCount}/${x.rows.length}</b></div></div><div class="grid2" style="margin-top:12px"><div class="chart-box"><h3>📈 Tren Kasus Mingguan</h3><div style="display:flex;align-items:end;gap:7px;height:150px;padding:10px 4px;border-bottom:1px solid #ddd">${x.trend.map(t=>`<div style="flex:1;text-align:center;height:100%;display:flex;flex-direction:column;justify-content:end"><div class="small">${t.n}</div><div title="${t.n} kasus" style="height:${Math.max(6,Math.round(t.n/maxTrend*110))}px;background:#1769aa;border-radius:5px 5px 0 0"></div><div class="small" style="margin-top:4px">${t.label}</div></div>`).join('')}</div><div class="small" style="margin-top:7px">Delapan minggu terakhir berdasarkan tanggal onset yang dapat dibaca sistem.</div></div><div class="chart-box"><h3>🦠 Distribusi Penyakit/Sindrom — 28 Hari</h3>${disease.length?`<table class="report-table compact"><thead><tr><th>Penyakit/Sindrom</th><th>Kasus</th></tr></thead><tbody>${disease.map(([k,n])=>`<tr><td>${esc75(k)}</td><td><b>${n}</b></td></tr>`).join('')}</tbody></table>`:'<div class="notice">Belum ada kasus dengan tanggal onset dalam 28 hari terakhir.</div>'}</div></div><div class="toolbar" style="margin-top:12px"><button class="primary" onclick="page('demografi')">🗺️ Buka IR Desa</button><button onclick="renderVillageEWV75()">🔄 Perbarui</button><button onclick="exportVillageEWV75()">⬇️ Ekspor Early Warning</button></div><div class="notice" style="margin-top:10px"><b>Interpretasi:</b> PRIORITAS TINGGI berarti sinyal statistik-operasional perlu diverifikasi lebih dahulu; WASPADA berarti ada peningkatan/aktivitas yang perlu dipantau; MONITOR berarti terdapat kasus tanpa sinyal peningkatan kuat. Ambang ini adalah <b>screening internal aplikasi</b> dan harus dikonfirmasi dengan definisi kasus, kualitas data, verifikasi lapangan, serta kriteria KLB yang berlaku.</div><div style="overflow:auto;max-height:520px;margin-top:10px"><table class="report-table"><thead><tr><th>No.</th><th>Desa</th><th>Puskesmas</th><th>Kecamatan</th><th>28 hari</th><th>28 hari sebelumnya</th><th>IR 28 hari</th><th>Sinyal</th><th>Perubahan</th></tr></thead><tbody>${top.map((r,i)=>`<tr><td>${i+1}</td><td><b>${esc75(r.desa)}</b></td><td>${esc75(r.puskesmas)}</td><td>${esc75(r.kec)}</td><td>${r.recent}</td><td>${r.prior}</td><td>${r.ir==null?'-':r.ir.toFixed(2)}</td><td><span class="badge">${r.label}</span></td><td>${r.prior?`${r.change>=0?'+':''}${r.change.toFixed(0)}%`:'Baru'}</td></tr>`).join('')||'<tr><td colspan="9">Belum ada kasus 28 hari terakhir.</td></tr>'}</tbody></table></div></div>`;
  }
  window.renderVillageEWV75=render;
  window.exportVillageEWV75=function(){const x=compute(),q=v=>`"${String(v??'').replace(/"/g,'""')}"`,head=['Tahun','Desa','Puskesmas','Kecamatan','Kasus_28_hari','Kasus_28_hari_sebelumnya','IR_28_hari_per_100000','Baseline_mingguan','Z_operasional','Perubahan_persen','Sinyal','Denominator_valid'];const lines=[head.map(q).join(',')];x.rows.forEach(r=>lines.push([new Date().getFullYear(),r.desa,r.puskesmas,r.kec,r.recent,r.prior,r.ir==null?'':r.ir.toFixed(4),r.base.toFixed(2),r.z.toFixed(3),r.prior? r.change.toFixed(2):'',r.label,valid(r)?'Ya':'Tidak'].map(q).join(',')));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}));a.download=`GORUT-early-warning-desa-${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
  function inject(){const d=E('dashboard');if(!d||E('v75VillageDashboard'))return;const c=document.createElement('div');c.id='v75VillageDashboard';d.appendChild(c);render()}
  const oldPage=window.page;window.page=function(id,b){const r=typeof oldPage==='function'?oldPage.apply(this,arguments):undefined;setTimeout(()=>{if(id==='dashboard')try{inject()}catch(e){console.warn('v75 dashboard',e)}},250);return r};
  const oldCases=window.cases;if(typeof oldCases==='function')window.cases=function(){const r=oldCases.apply(this,arguments);setTimeout(()=>{if(E('v75VillageDashboard'))render()},120);return r};
  setTimeout(()=>{try{inject()}catch(e){}},1500);
  window.GORUT_V75={version:VERSION,features:['village epidemiology dashboard','28-day comparison','operational early warning','weekly trend','disease distribution','village CSV export','data quality coverage']};
})();

/* ==================== v76 — FINAL EPIDEMIOLOGY MAP + DATA QUALITY ==================== */
(function(){
  const VERSION='v76';
  const E=id=>document.getElementById(id);
  const esc76=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const master=window.GORUT_VILLAGE_MASTER_V69?.data||[];
  const villages=master.flatMap(g=>(g.desa||[]).map(d=>({puskesmas:g.puskesmas,kec:g.kec,desa:d})));
  function norm(v){return String(v??'').trim().toLowerCase().replace(/\s+/g,' ')}
  function activeCases(){return Array.isArray(window.db?.cases)?window.db.cases.filter(c=>!window.db?.active||String(c.investigationId)===String(window.db.active)):[]}
  function demoRows(){
    try{
      const raw=JSON.parse(localStorage.getItem('gorut-demography-v72-village')||'null')||{};
      const y=String(new Date().getFullYear()); const saved=raw.years?.[y]||{};
      return villages.map(v=>({...v,...(saved[`${v.puskesmas}||${v.desa}`]||{})}));
    }catch(e){return villages.map(v=>({...v}))}
  }
  function valid(r){const p=Number(r.population),m=Number(r.male),f=Number(r.female);return p>0&&m>=0&&f>=0&&Math.abs(m+f-p)<0.001}
  function mapCase(c){
    const desa=norm(c.desa||c.admin?.desa||c.village||c.answers?.desa||c.answers?.desa_kelurahan||c.answers?.['Desa/Kelurahan']||'');
    if(!desa)return null;
    const p=norm(c.puskesmas||c.pkm||c.answers?.puskesmas||c.answers?.Puskesmas||''),k=norm(c.kec||c.answers?.kec||c.answers?.Kecamatan||'');
    let a=villages.filter(x=>norm(x.desa)===desa); if(p)a=a.filter(x=>norm(x.puskesmas)===p); if(k)a=a.filter(x=>norm(x.kec)===k); return a[0]||null;
  }
  function dateOf(c){const v=c.onset||c.onsetAt||c.tanggalOnset||c.answers?.['Tanggal onset']||c.answers?.['Tanggal onset demam']||'';const d=new Date(v);return isNaN(d)?null:d}
  function disease(c){return String(c.disease||window.db?.investigations?.find(i=>String(i.id)===String(c.investigationId))?.disease||'Tidak diketahui')}
  function compute(){
    const now=new Date(), cut=new Date(now);cut.setDate(cut.getDate()-28), rows=demoRows(), cases=activeCases();
    const map=new Map(rows.map(r=>[`${r.puskesmas}||${r.desa}`,{...r,cases:0,diseases:{}}])); let mapped=0, dated=0;
    cases.forEach(c=>{const m=mapCase(c),d=dateOf(c);if(d)dated++;if(!m||!map.has(`${m.puskesmas}||${m.desa}`))return;if(d&&d>=cut&&d<=now){const r=map.get(`${m.puskesmas}||${m.desa}`);r.cases++;r.diseases[disease(c)]=(r.diseases[disease(c)]||0)+1;}mapped++;});
    rows.forEach(r=>{const x=map.get(`${r.puskesmas}||${r.desa}`);if(x){r.cases=x.cases;r.diseases=x.diseases}});
    rows.forEach(r=>{r.ir=valid(r)?r.cases/Number(r.population)*100000:null;r.quality=valid(r)?'VALID':Number(r.population)>0?'PERIKSA L+P':'BELUM DIISI';r.signal=r.cases>=5?'PRIORITAS':r.cases>=2?'WASPADA':r.cases===1?'MONITOR':'NORMAL'});
    return {rows,cases,mapped,dated};
  }
  function colorSignal(s){return s==='PRIORITAS'?'#b91c1c':s==='WASPADA'?'#c2410c':s==='MONITOR'?'#a16207':'#64748b'}
  function renderMap(){
    const host=E('v76RiskMap');if(!host)return; const x=compute();
    host.innerHTML=`<div class="card" style="margin-top:14px;border:2px solid #334155"><div class="toolbar" style="justify-content:space-between"><div><h2 style="margin:0">🗺️ v76 — PETA RISIKO EPIDEMIOLOGI DESA</h2><div class="small">Kasus 28 hari terakhir · IR per 100.000 · sinyal operasional. <b>Bukan penetapan KLB.</b></div></div><span class="badge">${x.rows.length} desa</span></div><div id="v76Map" style="height:430px;border-radius:10px;margin-top:12px;background:#eef2f7"></div><div class="grid" style="margin-top:10px"><div class="stat"><small>Kasus 28 hari</small><b>${x.rows.reduce((s,r)=>s+r.cases,0)}</b></div><div class="stat"><small>Desa berkasus</small><b>${x.rows.filter(r=>r.cases>0).length}</b></div><div class="stat"><small>Prioritas</small><b>${x.rows.filter(r=>r.signal==='PRIORITAS').length}</b></div><div class="stat"><small>Waspada</small><b>${x.rows.filter(r=>r.signal==='WASPADA').length}</b></div><div class="stat"><small>Denominator valid</small><b>${x.rows.filter(r=>r.quality==='VALID').length}/${x.rows.length}</b></div><div class="stat"><small>Kasus terpetakan</small><b>${x.mapped}/${x.cases.length}</b></div></div><div class="notice" style="margin-top:10px"><b>Legenda:</b> 🔴 PRIORITAS (≥5 kasus/28 hari) · 🟠 WASPADA (2–4) · 🟡 MONITOR (1) · ⚪ NORMAL (0). Ambang ini adalah <b>screening operasional internal</b>, bukan kriteria KLB.</div><div style="overflow:auto;max-height:430px;margin-top:10px"><table class="report-table"><thead><tr><th>No.</th><th>Desa</th><th>Puskesmas</th><th>Kecamatan</th><th>Kasus</th><th>IR/100.000</th><th>Denominator</th><th>Sinyal</th></tr></thead><tbody>${x.rows.filter(r=>r.cases>0).sort((a,b)=>b.cases-a.cases).map((r,i)=>`<tr><td>${i+1}</td><td><b>${esc76(r.desa)}</b></td><td>${esc76(r.puskesmas)}</td><td>${esc76(r.kec)}</td><td>${r.cases}</td><td>${r.ir==null?'—':r.ir.toFixed(2)}</td><td>${r.quality}</td><td><b>${r.signal}</b></td></tr>`).join('')||'<tr><td colspan="8">Belum ada kasus terpetakan dalam 28 hari terakhir.</td></tr>'}</tbody></table></div></div>`;
    if(!window.L){E('v76Map').innerHTML='<div class="notice" style="margin:20px">Peta memerlukan koneksi internet untuk memuat Leaflet/OpenStreetMap. Tabel risiko tetap dapat digunakan.</div>';return}
    try{
      if(window.__gorutV76Map)window.__gorutV76Map.remove();
      const map=L.map('v76Map').setView([0.82,122.85],9);window.__gorutV76Map=map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
      const pts=[];
      x.rows.filter(r=>r.cases>0&&Number.isFinite(Number(r.lat))&&Number.isFinite(Number(r.lng))).forEach(r=>{const p=[+r.lat,+r.lng];pts.push(p);L.circleMarker(p,{radius:Math.min(18,6+r.cases),color:colorSignal(r.signal),fillColor:colorSignal(r.signal),fillOpacity:.55,weight:2}).addTo(map).bindPopup(`<b>${esc76(r.desa)}</b><br>${esc76(r.puskesmas)} · ${esc76(r.kec)}<br>Kasus 28 hari: <b>${r.cases}</b><br>IR: ${r.ir==null?'—':r.ir.toFixed(2)+'/100.000'}<br>Sinyal: <b>${r.signal}</b>`)});
      if(pts.length)map.fitBounds(L.latLngBounds(pts).pad(.15));
    }catch(e){E('v76Map').innerHTML='<div class="notice">Peta tidak dapat dirender pada browser ini. Gunakan tabel risiko di bawah sebagai alternatif.</div>';}
  }
  function renderQuality(){
    const host=E('v76Quality');if(!host)return;const x=compute(),n=x.cases.length, withOnset=x.dated, pct=n?Math.round(withOnset/n*100):100, mapped=n?Math.round(x.mapped/n*100):100, validD=x.rows.filter(valid).length;
    host.innerHTML=`<div class="card" style="margin-top:14px"><h3>🧪 KUALITAS DATA UNTUK EARLY WARNING</h3><div class="grid"><div class="stat"><small>Kasus aktif</small><b>${n}</b></div><div class="stat"><small>Tanggal onset terbaca</small><b>${withOnset} (${pct}%)</b></div><div class="stat"><small>Kasus terpetakan desa</small><b>${x.mapped} (${mapped}%)</b></div><div class="stat"><small>Denominator valid</small><b>${validD}/${x.rows.length}</b></div></div><div class="notice" style="margin-top:10px">Early warning paling dapat dipercaya jika tanggal onset, Desa/Kelurahan, Puskesmas/Kecamatan, dan denominator penduduk lengkap. Data yang belum lengkap <b>tidak boleh dianggap sebagai nol kasus</b>.</div></div>`;
  }
  function inject(){const d=E('dashboard');if(!d)return;if(!E('v76RiskMap')){const c=document.createElement('div');c.id='v76RiskMap';d.appendChild(c)}if(!E('v76Quality')){const c=document.createElement('div');c.id='v76Quality';d.appendChild(c)}renderMap();renderQuality()}
  const oldPage=window.page;window.page=function(id,b){const r=typeof oldPage==='function'?oldPage.apply(this,arguments):undefined;setTimeout(()=>{if(id==='dashboard')try{inject()}catch(e){console.warn('v76 final',e)}},300);return r};
  setTimeout(()=>{try{inject()}catch(e){}},1800);
  window.renderGORUTFinal=inject;
  window.GORUT_FINAL={version:VERSION,status:'final-candidate',features:['village risk map','data quality panel','28-day village IR','operational risk screening','123-village master']};
})();

/* ==================== v77 — PREMIUM DASHBOARD + DATA ENTRY UX ==================== */
(function(){
  const V='v77';
  function E(id){return document.getElementById(id)}
  function injectDashboardWorkspace(){
    const dash=E('dashboard'); if(!dash || E('v77Workspace')) return;
    const card=document.createElement('div'); card.id='v77Workspace'; card.className='card';
    card.innerHTML=`<div class="toolbar" style="justify-content:space-between;align-items:center">
      <div><div class="eyebrow">EPIDEMIOLOGY WORKSPACE</div><h3 style="margin:3px 0">Pusat Analisis & Pengambilan Keputusan</h3><div class="small">Akses langsung ke seluruh modul utama tanpa harus mencari di menu.</div></div>
      <span class="badge">GORUT-OUTBREAK AI · ${V}</span></div>
      <div class="quick-grid" id="v77WorkspaceGrid">
        <button onclick="page('analisis')">📈 <b>Analisis Epidemiologi</b><br><span class="small">Person–place–time, bivariat, multivariat</span></button>
        <button onclick="page('penelitian')">🔬 <b>Research Studio</b><br><span class="small">Rancangan, variabel, analisis & draft</span></button>
        <button onclick="page('gis')">🗺️ <b>GIS Kasus</b><br><span class="small">Peta kasus & sebaran spasial</span></button>
        <button onclick="page('demografi')">👥 <b>Demografi & IR</b><br><span class="small">Denominator desa dan insiden rate</span></button>
        <button onclick="page('intel')">🧠 <b>Disease Intelligence</b><br><span class="small">Sinyal dan ringkasan penyakit</span></button>
        <button onclick="page('adminEpi')">🏘️ <b>Dashboard Administratif</b><br><span class="small">Ringkasan wilayah & prioritas</span></button>
        <button onclick="page('laporan')">📄 <b>Laporan PE/KLB</b><br><span class="small">Pratinjau, cetak & paket laporan</span></button>
        <button onclick="page('audit')">🧪 <b>Audit Workflow</b><br><span class="small">Kualitas dan kelengkapan proses</span></button>
      </div>`;
    const quick=dash.querySelector('.quick-grid');
    const legacyQuick=quick?.closest('.card');
    if(legacyQuick){ legacyQuick.style.display='none'; legacyQuick.setAttribute('aria-hidden','true'); }
    if(legacyQuick) legacyQuick.after(card); else dash.appendChild(card);
  }
  function enhanceDemography(){
    const host=E('demoMasterV66'); if(!host) return;
    const card=E('v72DemographyCard'); if(!card || card.dataset.v77==='1') return;
    card.dataset.v77='1';
    const wrap=card.querySelector('div[style*="overflow:auto"]');
    if(wrap){wrap.setAttribute('role','region');wrap.setAttribute('aria-label','Tabel isian demografi per desa');}
  }
  const oldPage=window.page;
  window.page=function(id,b){
    const r=typeof oldPage==='function'?oldPage.apply(this,arguments):undefined;
    if(id==='dashboard') setTimeout(()=>{injectDashboardWorkspace();enhanceDemography()},80);
    if(id==='demografi') setTimeout(enhanceDemography,120);
    return r;
  };
  setTimeout(()=>{injectDashboardWorkspace();enhanceDemography()},1200);
  window.GORUT_V77={version:V,features:['premium dashboard workspace','visible analytics/research shortcuts','logos retained on login only','wide demography numeric inputs','sticky demography header','responsive navigation']};
})();


/* ==================== v78 — COMPACT DEMOGRAPHY + MOBILE FIELD FORM ==================== */
(function(){
  const V='v80';
  const E=id=>document.getElementById(id);
  const esc78=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const KEY='gorut-demography-v72-village';
  const DRAFT='gorut-field-mobile-draft-v78';
  const master=window.GORUT_VILLAGE_MASTER_V69?.data||[];
  const villages=master.flatMap(g=>(g.desa||[]).map(d=>({puskesmas:g.puskesmas,kec:g.kec,desa:d})));
  const vByName=name=>villages.find(x=>String(x.desa).toLowerCase()===String(name||'').toLowerCase());
  function year(){return Number(E('demoYearV49')?.value)||new Date().getFullYear()}
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null')||{years:{},meta:{}}}catch(e){return {years:{},meta:{}}}}
  function rows(y){const d=load(),saved=d.years?.[String(y)]||{};return villages.map(r=>({...r,population:'',male:'',female:'',households:'',areaKm2:'',lat:'',lng:'',note:'',...(saved[`${r.puskesmas}||${r.desa}`]||{}),puskesmas:r.puskesmas,kec:r.kec,desa:r.desa}))}
  function valid(r){const p=Number(r.population),m=Number(r.male),f=Number(r.female);return p>0&&m>=0&&f>=0&&Math.abs(m+f-p)<0.001}
  function renderCompact(){
    const host=E('demoMasterV66');if(!host)return;
    const card=E('v72DemographyCard');if(!card)return;
    const table=card.querySelector('.report-table');if(!table)return;
    const wrap=table.closest('div[style*="overflow:auto"]');if(wrap){wrap.style.overflow='visible';wrap.style.overflowX='visible';wrap.style.overflowY='visible';wrap.style.maxHeight='none'}
    const thead=table.querySelector('thead tr');
    if(thead){thead.innerHTML='<th>No.</th><th>Kecamatan</th><th>Puskesmas</th><th>Desa</th><th>Penduduk</th><th>Laki-laki</th><th>Perempuan</th><th>KK</th><th>Luas<br>km²</th><th>Latitude</th><th>Longitude</th>';}
    const body=E('v72Rows');if(!body)return;
    const oldRows=rows(year());
    const q=(E('v72Search')?.value||'').toLowerCase().trim(),k=E('v72Kec')?.value||'',p=E('v72Pkm')?.value||'';
    const arr=oldRows.map((r,i)=>({...r,_i:i})).filter(r=>(!k||r.kec===k)&&(!p||r.puskesmas===p)&&(!q||`${r.kec} ${r.puskesmas} ${r.desa}`.toLowerCase().includes(q)));
    body.innerHTML=arr.map((r,n)=>`<tr><td>${n+1}</td><td>${esc78(r.kec)}</td><td><b>${esc78(r.puskesmas)}</b></td><td><b>${esc78(r.desa)}</b></td><td><input aria-label="Penduduk ${esc78(r.desa)}" data-v72="population" data-i="${r._i}" type="number" min="0" inputmode="numeric" value="${esc78(r.population)}"></td><td><input aria-label="Laki-laki ${esc78(r.desa)}" data-v72="male" data-i="${r._i}" type="number" min="0" inputmode="numeric" value="${esc78(r.male)}"></td><td><input aria-label="Perempuan ${esc78(r.desa)}" data-v72="female" data-i="${r._i}" type="number" min="0" inputmode="numeric" value="${esc78(r.female)}"></td><td><input aria-label="KK ${esc78(r.desa)}" data-v72="households" data-i="${r._i}" type="number" min="0" inputmode="numeric" value="${esc78(r.households)}"></td><td><input aria-label="Luas km2 ${esc78(r.desa)}" data-v72="areaKm2" data-i="${r._i}" type="number" min="0" step="any" inputmode="decimal" value="${esc78(r.areaKm2)}"></td><td><input aria-label="Latitude ${esc78(r.desa)}" data-v72="lat" data-i="${r._i}" type="number" step="any" inputmode="decimal" value="${esc78(r.lat)}"></td><td><input aria-label="Longitude ${esc78(r.desa)}" data-v72="lng" data-i="${r._i}" type="number" step="any" inputmode="decimal" value="${esc78(r.lng)}"></td></tr>`).join('')||'<tr><td colspan="11"><div class="notice">Tidak ada desa yang cocok dengan filter.</div></td></tr>';
    if(!card.querySelector('.v78-no-scroll-note')){const n=document.createElement('div');n.className='v78-no-scroll-note';n.innerHTML='✓ <span>Mode ringkas aktif. Catatan dan status denominator tidak ditampilkan; validasi denominator tetap dihitung otomatis oleh sistem.</span>';table.parentElement.appendChild(n)}
  }
  function saveCompact(){
    const y=year(),rs=rows(y);
    document.querySelectorAll('[data-v72]').forEach(el=>{const i=Number(el.dataset.i);if(rs[i])rs[i][el.dataset.v72]=el.value});
    const d=load();d.years=d.years||{};d.meta=d.meta||{};d.years[String(y)]={};rs.forEach(r=>d.years[String(y)][`${r.puskesmas}||${r.desa}`]={...r});d.meta[String(y)]={...(d.meta?.[String(y)]||{}),structure:'1 baris per desa · v78 compact'};
    localStorage.setItem(KEY,JSON.stringify(d));
    if(typeof window.renderDemographyV49==='function'){try{window.renderDemographyV49()}catch(e){}}
    renderCompact();
    alert(`Demografi desa ${y} berhasil disimpan: ${rs.length} desa.`);
  }
  window.renderDemographyVillageV72=renderCompact;
  window.saveDemographyV72=saveCompact;
  window.saveDemographyV66=saveCompact;

  function optionList(){return villages.map(v=>`<option value="${esc78(v.desa)}">${esc78(v.desa)} — ${esc78(v.puskesmas)}</option>`).join('')}
  function caseOptions(){return (db.cases||[]).filter(c=>!db.active||String(c.investigationId)===String(db.active)).map(c=>`<option value="${esc78(c.id)}">${esc78(c.id)} — ${esc78(c.name||'Tanpa nama')}</option>`).join('')}
  function contactOptions(){return (db.contacts||[]).filter(c=>!db.active||String(c.investigationId)===String(db.active)).map(c=>`<option value="${esc78(c.id)}">${esc78(c.id)} — ${esc78(c.name||'Tanpa nama')}</option>`).join('')}
  function getDraft(){try{return JSON.parse(localStorage.getItem(DRAFT)||'null')}catch(e){return null}}
  function setVal(id,v){const e=E(id);if(e)e.value=v??''}
  function renderMobileField(){
    const sec=E('lapangan');if(!sec)return;
    let host=E('v78MobileField');if(!host){host=document.createElement('div');host.id='v78MobileField';host.className='v78-mobile-field';sec.insertBefore(host,sec.firstElementChild)}
    const investigations=(db.investigations||[]);
    host.innerHTML=`<div class="mobile-form-shell"><div class="mobile-hero"><div class="eyebrow">FIELD RESPONSE · MOBILE</div><h2>📱 Formulir Lapangan</h2><p>Pengisian cepat untuk petugas di HP. Data disimpan di perangkat terlebih dahulu dan dapat dilanjutkan saat koneksi tersedia.</p><div style="margin-top:10px"><span class="status-pill" id="v78NetStatus">● Memeriksa koneksi…</span></div></div>
      <div class="mobile-card"><div class="mobile-step"><span>1</span> Kegiatan lapangan</div>
        <div class="mobile-field"><label class="required">Investigasi aktif</label><select id="mFieldInv"><option value="">Pilih investigasi</option>${investigations.map(i=>`<option value="${esc78(i.id)}">${esc78(i.name||i.id)} — ${esc78(diseases[i.disease]?.name||i.disease||'')}</option>`).join('')}</select></div>
        <div class="mobile-field"><label class="required">Jenis kegiatan</label><select id="mFieldActivity"><option>Kunjungan kasus</option><option>Wawancara kontak</option><option>Verifikasi lokasi</option><option>Pengambilan spesimen</option><option>Survei lingkungan</option><option>Investigasi aktif</option><option>Pelacakan kontak</option></select></div>
        <div class="mobile-field"><label class="required">Tanggal & waktu</label><input id="mFieldDate" type="datetime-local"></div>
        <div class="mobile-field"><label>Petugas</label><input id="mFieldOfficer" placeholder="Nama/inisial petugas"></div>
      </div>
      <div class="mobile-card"><div class="mobile-step"><span>2</span> Lokasi</div>
        <div class="mobile-field"><label class="required">Desa/Kelurahan</label><select id="mFieldVillage"><option value="">Pilih desa</option>${optionList()}</select></div>
        <div class="mobile-field"><label>Puskesmas</label><input id="mFieldPkm" readonly placeholder="Otomatis dari desa"></div>
        <div class="mobile-field"><label>Kecamatan</label><input id="mFieldKec" readonly placeholder="Otomatis dari desa"></div>
        <div class="mobile-field"><label>Koordinat GPS</label><div class="gps-row"><input id="mFieldLat" inputmode="decimal" placeholder="Latitude"><input id="mFieldLng" inputmode="decimal" placeholder="Longitude"></div><button class="gps-btn" type="button" style="margin-top:8px" onclick="getMobileGPS()">📍 Ambil lokasi GPS</button><div id="mFieldGpsStatus" class="small" style="margin-top:6px">GPS belum diambil.</div></div>
        <div class="mobile-field"><label>Alamat/lokasi detail</label><textarea id="mFieldLocation" placeholder="Dusun, rumah, sekolah, pasar, fasilitas kesehatan, atau lokasi kejadian"></textarea></div>
      </div>
      <div class="mobile-card"><div class="mobile-step"><span>3</span> Subjek & keterkaitan</div>
        <div class="mobile-field"><label>Nama/ID subjek</label><input id="mFieldSubject" placeholder="Gunakan ID/inisial bila perlu"></div>
        <div class="mobile-field"><label>Kasus terkait</label><select id="mFieldCase"><option value="">Tidak terkait kasus tertentu</option>${caseOptions()}</select></div>
        <div class="mobile-field"><label>Kontak terkait</label><select id="mFieldContact"><option value="">Tidak terkait kontak tertentu</option>${contactOptions()}</select></div>
      </div>
      <div class="mobile-card"><div class="mobile-step"><span>4</span> Temuan & respons</div>
        <div class="mobile-field"><label class="required">Temuan utama</label><textarea id="mFieldFinding" placeholder="Apa yang ditemukan di lapangan?"></textarea></div>
        <div class="mobile-field"><label>Tindakan/intervensi</label><textarea id="mFieldAction" placeholder="Edukasi, isolasi, rujukan, pengambilan spesimen, PSN, komunikasi risiko, dll."></textarea></div>
        <div class="mobile-field"><label>Foto lapangan</label><input id="mFieldPhoto" type="file" accept="image/*" capture="environment"><img id="mFieldPreview" class="photo-preview" alt="Pratinjau foto lapangan"></div>
      </div>
      <div class="mobile-card"><div class="mobile-step"><span>5</span> Simpan</div><div class="offline-note">💾 <b>Offline-first:</b> jika internet tidak tersedia, data tetap disimpan di perangkat. Sinkronisasi dapat dilakukan setelah koneksi tersedia.</div><div style="display:grid;gap:9px;margin-top:12px"><button class="save-btn" type="button" onclick="saveMobileFieldVisit()">✓ Simpan Kunjungan Lapangan</button><button class="draft-btn" type="button" onclick="saveMobileFieldDraft()">📝 Simpan sebagai Draft</button><button class="draft-btn" type="button" onclick="clearMobileFieldForm()">↺ Bersihkan Formulir</button></div><div id="mFieldSaveStatus" class="small" style="margin-top:10px"></div></div></div>`;
    const inv=E('mFieldInv');if(inv&&db.active)inv.value=db.active;
    const dt=E('mFieldDate');if(dt&&!dt.value)dt.value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
    const draft=getDraft();if(draft)fillDraft(draft);
    E('mFieldVillage')?.addEventListener('change',()=>{const v=vByName(E('mFieldVillage').value);setVal('mFieldPkm',v?.puskesmas||'');setVal('mFieldKec',v?.kec||'');});
    E('mFieldPhoto')?.addEventListener('change',()=>{const f=E('mFieldPhoto')?.files?.[0],img=E('mFieldPreview');if(!f||!img){if(img)img.style.display='none';return}const u=URL.createObjectURL(f);img.src=u;img.style.display='block';img.onload=()=>URL.revokeObjectURL(u)});
    updateNetStatus();
  }
  function readMobilePhoto(){return new Promise(resolve=>{const f=E('mFieldPhoto')?.files?.[0];if(!f)return resolve(null);const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>resolve(null);r.readAsDataURL(f)})}
  function mobileData(){const v=vByName(E('mFieldVillage')?.value||'');return {investigationId:E('mFieldInv')?.value||db.active||'',activity:E('mFieldActivity')?.value||'',subject:E('mFieldSubject')?.value||'',caseId:E('mFieldCase')?.value||'',contactId:E('mFieldContact')?.value||'',date:E('mFieldDate')?.value||new Date().toISOString().slice(0,16),officer:E('mFieldOfficer')?.value||'',desa:v?.desa||'',puskesmas:v?.puskesmas||'',kec:v?.kec||'',lat:E('mFieldLat')?.value||'',lng:E('mFieldLng')?.value||'',location:E('mFieldLocation')?.value||'',finding:E('mFieldFinding')?.value||'',action:E('mFieldAction')?.value||''}}
  function fillDraft(d){Object.entries(d||{}).forEach(([k,v])=>setVal(k,v));const v=E('mFieldVillage')?.value? vByName(E('mFieldVillage').value):null;if(v){setVal('mFieldPkm',v.puskesmas);setVal('mFieldKec',v.kec)}}
  window.saveMobileFieldDraft=function(){const d=mobileData();localStorage.setItem(DRAFT,JSON.stringify(d));if(E('mFieldSaveStatus'))E('mFieldSaveStatus').textContent='✓ Draft tersimpan di perangkat.'}
  window.clearMobileFieldForm=function(){localStorage.removeItem(DRAFT);renderMobileField();if(E('mFieldSaveStatus'))E('mFieldSaveStatus').textContent='Formulir dibersihkan.'}
  window.getMobileGPS=function(){const s=E('mFieldGpsStatus');if(!navigator.geolocation){if(s)s.textContent='GPS tidak didukung perangkat ini.';return}if(s)s.textContent='GPS sedang mengambil lokasi…';navigator.geolocation.getCurrentPosition(pos=>{setVal('mFieldLat',pos.coords.latitude.toFixed(6));setVal('mFieldLng',pos.coords.longitude.toFixed(6));if(s)s.textContent=`✓ GPS diperoleh · akurasi ±${Math.round(pos.coords.accuracy||0)} m`},e=>{if(s)s.textContent='GPS gagal: '+e.message},{enableHighAccuracy:true,timeout:15000,maximumAge:30000})}
  window.saveMobileFieldVisit=async function(){
    const d=mobileData();
    if(!d.investigationId)return alert('Pilih investigasi aktif terlebih dahulu.');
    if(!d.desa)return alert('Pilih Desa/Kelurahan terlebih dahulu.');
    if(!d.finding)return alert('Isi Temuan utama terlebih dahulu.');
    const photo=await readMobilePhoto();
    const o={id:'MFV'+Date.now(),...d,photo,syncStatus:'pending',source:'mobile-field-v80',createdAt:new Date().toISOString()};
    db.fieldVisits=db.fieldVisits||[];db.fieldVisits.push(o);
    if(typeof queueSync==='function')queueSync('field_visits');
    save();localStorage.removeItem(DRAFT);
    if(E('mFieldSaveStatus'))E('mFieldSaveStatus').textContent='✓ Kunjungan tersimpan di perangkat dan masuk antrean sinkronisasi.';
    if(typeof fieldVisits==='function')try{fieldVisits()}catch(e){}
    renderMobileField();
    if(E('mFieldSaveStatus'))E('mFieldSaveStatus').textContent='✓ Kunjungan tersimpan. Siap untuk kunjungan berikutnya.';
  };
  function updateNetStatus(){const e=E('v78NetStatus');if(!e)return;e.textContent=navigator.onLine?'● Online · data tetap disimpan lokal':'● Offline · data disimpan di perangkat';e.style.background=navigator.onLine?'#e8f7ef':'#fff4e5';e.style.color=navigator.onLine?'#176b45':'#8a4b08'}
  window.addEventListener('online',updateNetStatus);window.addEventListener('offline',updateNetStatus);
  function inject(){renderCompact()}
  const oldPage=window.page;window.page=function(id,b){const r=typeof oldPage==='function'?oldPage.apply(this,arguments):undefined;setTimeout(()=>{if(id==='demografi')renderCompact()},180);return r};
  setTimeout(inject,1800);
  window.GORUT_V81={version:'v81',features:['compact demography without horizontal scroll','removed Catatan and Status Denominator from visible table','larger numeric inputs','v76 field layout restored','standalone mobile field app retained','GPS capture','village-to-puskesmas-kecamatan mapping','offline draft','offline-first field visit storage','photo capture']};
})();

/* v85 — Clinical/Epidemiology Workflow QA
   Read-only integrity checker for the active investigation. It never declares KLB and never mutates case/contact/specimen data. */
(function(){
  function E85(id){return document.getElementById(id)}
  function esc85(s){return typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function active85(){return typeof act==='function'?(act()||{}):((db.investigations||[]).find(x=>String(x.id)===String(db.active))||{})}
  function qa85(){
    const a=active85(), inv=!!a?.id, cs=(db.cases||[]).filter(x=>String(x.investigationId)===String(a.id||db.active)), ct=(db.contacts||[]).filter(x=>String(x.investigationId)===String(a.id||db.active)), sp=(db.specimens||[]).filter(x=>String(x.investigationId)===String(a.id||db.active)), fv=(db.fieldVisits||[]).filter(x=>String(x.investigationId)===String(a.id||db.active));
    const isFood=/keracunan/i.test(String(a.type||''))||String(a.disease||'')==='keracunan-pangan';
    const checks=[];
    const add=(id,label,ok,detail,level)=>checks.push({id,label,status:ok?'PASS':(level||'WARN'),detail});
    add('INV','Investigasi aktif',inv,inv?`${a.name||a.id} · ${a.disease||'-'}`:'Belum ada investigasi aktif.','WARN');
    add('CASE','Kasus terhubung',cs.length>0,`${cs.length} kasus pada investigasi aktif.`,'WARN');
    add('CONTACT','Pelacakan kontak',ct.length>0,`${ct.length} kontak tercatat.${cs.length&&!ct.length?' Periksa kebutuhan contact tracing.':''}`,'WARN');
    add('SPEC','Spesimen',sp.length>0,`${sp.length} spesimen tercatat. Verifikasi hasil terhadap dokumen laboratorium asli.`,'WARN');
    add('FIELD','Kegiatan lapangan',fv.length>0,`${fv.length} kunjungan lapangan tercatat.`,'WARN');
    const onset=cs.filter(c=>c.onset).length, status=cs.filter(c=>c.status).length, coords=cs.filter(c=>Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lng))).length;
    add('ONSET','Onset kasus',cs.length?onset>0:true,`${onset}/${cs.length} kasus memiliki onset.`,'WARN');
    add('STATUS','Status kasus',cs.length?status===cs.length:true,`${status}/${cs.length} kasus memiliki status.`,'WARN');
    add('GPS','Koordinat kasus',cs.length?coords>0:true,`${coords}/${cs.length} kasus memiliki koordinat valid.`,'WARN');
    const linkedCt=ct.filter(c=>c.caseId||c.linkedCaseId).length;
    add('LINK_CT','Kontak ↔ kasus',ct.length?linkedCt===ct.length:true,`${linkedCt}/${ct.length} kontak tertaut ke kasus.`,'WARN');
    const linkedSp=sp.filter(s=>s.caseId||s.case).length;
    add('LINK_SP','Spesimen ↔ kasus',sp.length?linkedSp===sp.length:true,`${linkedSp}/${sp.length} spesimen memiliki tautan kasus.`,'WARN');
    const linkedF=fv.filter(v=>v.caseId||v.contactId).length;
    add('LINK_FV','Kunjungan ↔ kasus/kontak',fv.length?linkedF>0:true,`${linkedF}/${fv.length} kunjungan tertaut ke kasus atau kontak.`,'WARN');
    if(isFood){
      const food=a.foodInvestigation||{};
      add('FOOD_DEN','Denominator keracunan pangan',Number(food.exposed)>0,`Terpapar=${Number(food.exposed)||0}; sakit=${Number(food.ill)||0}; meninggal=${Number(food.dead)||0}.`,'WARN');
      add('FOOD_AR','Attack Rate',Number(food.exposed)>0 && Number(food.ill)>=0 && Number(food.ill)<=Number(food.exposed),Number(food.exposed)>0?`AR ${(Number(food.ill)||0)/(Number(food.exposed)||1)*100 .toFixed(1)}%`:'Belum dapat dihitung karena denominator belum tersedia.','WARN');
      add('FOOD_SOURCE','Sumber pangan',!!food.suspectedFood||!!food.foodSource,food.suspectedFood||food.foodSource||'Belum diisi.','WARN');
    }
    const pass=checks.filter(x=>x.status==='PASS').length, warn=checks.length-pass;
    return {version:'v85',generatedAt:new Date().toISOString(),investigation:{id:a.id||null,name:a.name||'',type:a.type||'',disease:a.disease||'',location:[a.desa,a.kec,a.kab,a.prov].filter(Boolean).join(', ')},counts:{cases:cs.length,contacts:ct.length,specimens:sp.length,fieldVisits:fv.length},summary:{pass,warn,total:checks.length},checks};
  }
  function render85(){
    const host=E85('v85WorkflowQA'); if(!host)return;
    const r=qa85();
    host.innerHTML=`<div class="toolbar" style="justify-content:space-between"><div><div class="eyebrow">CLINICAL / EPIDEMIOLOGY WORKFLOW QA · V85</div><h3 style="margin:3px 0">🔗 Pemeriksaan Alur End-to-End</h3><div class="small">Pemeriksaan read-only untuk memastikan hubungan Investigasi → Kasus → Kontak → Spesimen → Lapangan → Analisis/GIS → Laporan. Sistem hanya memberi sinyal kualitas workflow dan <b>tidak menetapkan KLB otomatis</b>.</div></div><div><button class="primary" onclick="runEpiWorkflowQA()">🔄 Jalankan QA</button> <button onclick="exportEpiWorkflowQA()">⬇ Ekspor JSON</button></div></div><div class="grid" style="margin-top:12px"><div class="stat"><small>PASS</small><b>${r.summary.pass}</b><span class="small">komponen terpenuhi</span></div><div class="stat"><small>WARN</small><b>${r.summary.warn}</b><span class="small">perlu ditinjau</span></div><div class="stat"><small>Kasus</small><b>${r.counts.cases}</b><span class="small">investigasi aktif</span></div><div class="stat"><small>Kontak</small><b>${r.counts.contacts}</b><span class="small">tercatat</span></div><div class="stat"><small>Spesimen</small><b>${r.counts.specimens}</b><span class="small">tercatat</span></div><div class="stat"><small>Lapangan</small><b>${r.counts.fieldVisits}</b><span class="small">kunjungan</span></div></div><div class="notice" style="margin-top:12px"><b>Investigasi:</b> ${esc85(r.investigation.name||'-')} · <b>Penyakit:</b> ${esc85(r.investigation.disease||'-')} · <b>Lokasi:</b> ${esc85(r.investigation.location||'-')}</div><div style="overflow:auto;margin-top:10px"><table><thead><tr><th>Komponen</th><th>Status</th><th>Temuan</th></tr></thead><tbody>${r.checks.map(x=>`<tr><td><b>${esc85(x.label)}</b></td><td><span class="badge">${esc85(x.status)}</span></td><td>${esc85(x.detail)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  window.runEpiWorkflowQA=function(){render85();return qa85()}
  window.exportEpiWorkflowQA=function(){const r=qa85();const blob=new Blob([JSON.stringify(r,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`GORUT-Epi-Workflow-QA-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
  function inject85(){const sec=E85('audit');if(!sec||E85('v85WorkflowQA'))return;const card=document.createElement('div');card.id='v85WorkflowQA';card.className='card';card.style.marginTop='14px';sec.insertBefore(card,sec.firstElementChild);render85()}
  const oldPage85=window.page;window.page=function(id,b){const r=typeof oldPage85==='function'?oldPage85.apply(this,arguments):undefined;setTimeout(()=>{if(id==='audit')render85()},100);return r};
  setTimeout(inject85,1200);
})();