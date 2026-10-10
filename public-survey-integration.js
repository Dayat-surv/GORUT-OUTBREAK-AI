/* GORUT-OUTBREAK-AI public survey integration
 * Read-only dashboard through an owner-scoped Supabase RPC.
 * Requires migration 20261010_public_survey_dashboard_rpc.sql and Supabase Auth login.
 */
(function(){
  'use strict';
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = v => v ? new Date(v).toLocaleString('id-ID') : '-';
  let rows = [];
  let initialized = false;
  function client(){
    const cfg = window.GORUT_BACKEND || {};
    if (!(cfg.enabled && cfg.url && cfg.anonKey) || !window.supabase) return null;
    if (!window.__gorutSupabase) window.__gorutSupabase = window.supabase.createClient(cfg.url,cfg.anonKey);
    return window.__gorutSupabase;
  }
  function ensureCard(){
    const page = document.getElementById('dashboard');
    if(!page || document.getElementById('publicSurveyIntegration')) return;
    const card=document.createElement('section');
    card.className='card';
    card.id='publicSurveyIntegration';
    card.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
        <div><h2 style="margin:0 0 5px">Integrasi Kuesioner Publik</h2><div class="small">Respons yang tersimpan di Supabase, dibatasi pada investigasi milik akun yang sedang login.</div></div>
        <div class="toolbar"><button type="button" class="primary" id="psRefresh">Muat data server</button><button type="button" id="psReport">Buat draft laporan PE/KLB</button></div>
      </div>
      <div id="psStatus" class="notice">Belum memuat respons server.</div>
      <div id="psStats" class="grid"></div>
      <div class="toolbar" style="margin-top:12px"><input id="psSearch" placeholder="Cari nama, kode kasus, penyakit..." aria-label="Cari respons"><select id="psModule"><option value="">Semua modul</option></select></div>
      <div style="overflow:auto"><table><thead><tr><th>Waktu kirim</th><th>Investigasi</th><th>Kode kasus</th><th>Nama</th><th>Modul</th><th>Status</th><th>Onset</th><th>Jawaban</th></tr></thead><tbody id="psRows"><tr><td colspan="8">Klik “Muat data server”.</td></tr></tbody></table></div>
      <p class="small">Analisis hanya merangkum respons yang dikembalikan server. Draft laporan wajib ditinjau petugas dan tidak otomatis menetapkan KLB.</p>`;
    page.insertBefore(card,page.firstChild);
    document.getElementById('psRefresh').addEventListener('click',load);
    document.getElementById('psSearch').addEventListener('input',renderRows);
    document.getElementById('psModule').addEventListener('change',renderRows);
    document.getElementById('psReport').addEventListener('click',downloadReport);
  }
  function stats(){
    const n=rows.length, confirmed=rows.filter(r=>/konfirmasi/i.test(r.case_status||'')).length;
    const deaths=rows.filter(r=>/meninggal/i.test(r.outcome||'')).length;
    const modules=new Set(rows.map(r=>r.disease_module).filter(Boolean)).size;
    document.getElementById('psStats').innerHTML=[
      ['Respons tersimpan',n],['Konfirmasi (sesuai isian)',confirmed],['Outcome meninggal',deaths],['Modul terisi',modules]
    ].map(x=>'<div class="stat"><small>'+esc(x[0])+'</small><b>'+x[1]+'</b></div>').join('');
    const select=document.getElementById('psModule'),old=select.value;
    const vals=[...new Set(rows.map(r=>r.disease_module).filter(Boolean))].sort();
    select.innerHTML='<option value="">Semua modul</option>'+vals.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');
    if(vals.includes(old))select.value=old;
  }
  function renderRows(){
    const q=(document.getElementById('psSearch')?.value||'').toLowerCase();
    const mod=document.getElementById('psModule')?.value||'';
    const list=rows.filter(r=>(!mod||r.disease_module===mod)&&(!q||[r.investigation_name,r.case_code,r.full_name,r.disease_module,r.case_status].join(' ').toLowerCase().includes(q)));
    const tbody=document.getElementById('psRows');
    tbody.innerHTML=list.map(r=>{
      const payload=r.payload&&typeof r.payload==='object'?r.payload:{};
      const count=Object.values(payload).filter(v=>v!==null&&v!==''&&!(Array.isArray(v)&&!v.length)).length;
      return '<tr><td>'+esc(fmt(r.submitted_at))+'</td><td>'+esc(r.investigation_name||'-')+'</td><td>'+esc(r.case_code||r.case_id||'-')+'</td><td>'+esc(r.full_name||'-')+'</td><td>'+esc(r.disease_module||'-')+'</td><td>'+esc(r.case_status||'-')+'</td><td>'+esc(r.onset_date||'-')+'</td><td><button type="button" data-response="'+esc(r.response_id)+'" class="psDetail">Lihat '+count+' isian</button></td></tr>';
    }).join('')||'<tr><td colspan="8">Tidak ada respons yang cocok dengan filter.</td></tr>';
    tbody.querySelectorAll('.psDetail').forEach(b=>b.addEventListener('click',()=>showDetail(b.dataset.response)));
  }
  function showDetail(id){
    const r=rows.find(x=>String(x.response_id)===String(id)); if(!r)return;
    const payload=r.payload&&typeof r.payload==='object'?r.payload:{};
    const lines=Object.entries(payload).map(([k,v])=>'<tr><th>'+esc(k)+'</th><td>'+esc(Array.isArray(v)?v.join(', '):typeof v==='object'?JSON.stringify(v):v)+'</td></tr>').join('');
    const modal=document.getElementById('modal'),box=document.getElementById('modalbox');
    if(modal&&box){box.innerHTML='<h2>Detail respons kuesioner</h2><p>'+esc(r.case_code||r.response_id)+' · '+esc(r.investigation_name||'')+'</p><div style="max-height:60vh;overflow:auto"><table>'+lines+'</table></div><p><button type="button" onclick="document.getElementById(\'modal\').classList.remove(\'show\')">Tutup</button></p>';modal.classList.add('show');}
    else alert(Object.entries(payload).map(([k,v])=>k+': '+(Array.isArray(v)?v.join(', '):v)).join('\n'));
  }
  async function load(){
    const status=document.getElementById('psStatus'); if(!status)return;
    const sb=client();
    if(!sb){status.textContent='Backend belum aktif atau konfigurasi Supabase belum tersedia.';return;}
    status.textContent='Memeriksa sesi login dan memuat respons…';
    try{
      const userResult=await sb.auth.getUser();
      if(userResult.error||!userResult.data.user){status.textContent='Silakan login menggunakan akun aplikasi yang terhubung ke Supabase Auth, lalu muat ulang data.';rows=[];stats();renderRows();return;}
      const result=await sb.rpc('get_my_public_survey_submissions');
      if(result.error){status.textContent='Belum dapat membaca data server: '+result.error.message+'. Pastikan migration dashboard RPC sudah dijalankan di Supabase SQL Editor.';return;}
      rows=Array.isArray(result.data)?result.data:[];
      status.textContent='Berhasil memuat '+rows.length+' respons milik akun yang sedang login. Sumber: Supabase RPC; waktu muat '+new Date().toLocaleString('id-ID')+'.';
      stats();renderRows();
    }catch(e){status.textContent='Gagal memuat data server: '+(e?.message||'kesalahan tidak diketahui');}
  }
  function downloadReport(){
    if(!rows.length){alert('Belum ada respons server untuk disusun menjadi draft laporan. Muat data server terlebih dahulu.');return;}
    const byModule={}; rows.forEach(r=>{const k=r.disease_module||'Belum dipilih';byModule[k]=(byModule[k]||0)+1;});
    const confirmed=rows.filter(r=>/konfirmasi/i.test(r.case_status||'')).length;
    const deaths=rows.filter(r=>/meninggal/i.test(r.outcome||'')).length;
    const date=new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
    const modRows=Object.entries(byModule).sort((a,b)=>b[1]-a[1]).map(([k,n])=>'<tr><td>'+esc(k)+'</td><td>'+n+'</td></tr>').join('');
    const cases=rows.map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(r.case_code||r.case_id||'-')+'</td><td>'+esc(r.full_name||'-')+'</td><td>'+esc(r.disease_module||'-')+'</td><td>'+esc(r.onset_date||'-')+'</td><td>'+esc(r.case_status||'-')+'</td><td>'+esc(r.outcome||'-')+'</td><td>'+esc(r.investigation_name||'-')+'</td></tr>').join('');
    const html='<!doctype html><html lang="id"><meta charset="utf-8"><title>Draft Laporan PE/KLB</title><style>body{font:14px Arial,sans-serif;line-height:1.5;color:#182230;max-width:1000px;margin:30px auto}h1,h2{text-align:center}table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #aeb8c5;padding:6px;text-align:left;font-size:12px}th{background:#edf2f7}.warn{padding:10px;background:#fff7e6;border:1px solid #f0d79b}section{margin-top:22px}.sign{display:flex;justify-content:space-between;margin-top:60px}</style><h1>DRAFT LAPORAN PENYELIDIKAN EPIDEMIOLOGI</h1><h2>Ringkasan Respons Kuesioner Publik GORUT-OUTBREAK-AI</h2><p><b>Tanggal penyusunan:</b> '+esc(date)+'</p><div class="warn"><b>STATUS DRAFT:</b> Dokumen ini merupakan bahan awal berbasis respons kuesioner yang tersedia di server, bukan laporan final. Verifikasi definisi kasus, duplikasi, kelengkapan, data laboratorium, denominator populasi, kurva epidemi, dan bukti lapangan sebelum ditandatangani. Sistem tidak otomatis menetapkan KLB.</div><section><h3>1. Ringkasan situasi</h3><p>Tercatat <b>'+rows.length+'</b> respons kuesioner publik pada investigasi yang dapat diakses akun saat ini. Sebanyak <b>'+confirmed+'</b> respons berstatus kasus “Konfirmasi” sesuai isian dan <b>'+deaths+'</b> dengan outcome “Meninggal”. Angka ini adalah ringkasan data formulir, bukan angka final surveilans sebelum validasi.</p></section><section><h3>2. Distribusi menurut modul</h3><table><thead><tr><th>Modul penyakit/sindrom</th><th>Jumlah respons</th></tr></thead><tbody>'+modRows+'</tbody></table></section><section><h3>3. Line list awal</h3><table><thead><tr><th>No.</th><th>Kode</th><th>Nama</th><th>Modul</th><th>Onset</th><th>Status kasus</th><th>Outcome</th><th>Investigasi</th></tr></thead><tbody>'+cases+'</tbody></table></section><section><h3>4. Analisis epidemiologi awal</h3><p>Deskripsikan distribusi kasus menurut orang, tempat, dan waktu setelah memastikan variabel lengkap dan konsisten. Susun kurva epidemi berdasarkan tanggal onset; telaah keterkaitan epidemiologis, paparan bersama, faktor risiko, hasil laboratorium, dan status imunisasi jika relevan dengan penyakit.</p><p>Analisis faktor risiko atau attack rate hanya dilakukan bila tersedia definisi paparan dan denominator yang sesuai. Respons kosong, kategori “tidak diketahui”, dan jawaban multi-pilih harus ditangani secara eksplisit.</p></section><section><h3>5. Tindakan respons dan rekomendasi</h3><p>Lengkapi dari catatan tim: verifikasi kasus dan diagnosis, pencarian kasus tambahan, pengambilan/pengiriman spesimen sesuai pedoman, pelacakan kontak, intervensi pengendalian, komunikasi risiko, serta koordinasi lintas program. Cantumkan penanggung jawab dan tenggat setiap tindak lanjut.</p></section><section><h3>6. Keterbatasan dan validasi</h3><ul><li>Dokumen ini hanya menggunakan respons yang dikembalikan RPC untuk investigasi milik akun yang login.</li><li>Variabel yang tidak dikumpulkan atau belum diisi tidak boleh ditafsirkan sebagai tidak ada paparan/kejadian.</li><li>Validasi terhadap line list resmi, laporan fasilitas kesehatan, hasil laboratorium, dan data lapangan wajib dilakukan.</li><li>Kesimpulan KLB mengikuti definisi operasional, baseline, hasil investigasi, serta keputusan pejabat berwenang.</li></ul></section><div class="sign"><div>Disusun oleh,<br><br><br>____________________</div><div>Mengetahui,<br><br><br>____________________</div></div></html>';
    const blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='Draft-Laporan-PE-KLB-GORUT-OUTBREAK-AI.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function init(){
    if(initialized)return;const page=document.getElementById('dashboard');if(!page)return;
    initialized=true;ensureCard();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  const observer=new MutationObserver(init);observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('gorut:auth-changed',()=>{if(document.getElementById('publicSurveyIntegration'))load();});
})();
