/* ============================================================
   ALWI KOMENTAR v1 — Widget komentar tema PUTIH
   • Sinkron server memori (:4000, JSON persisten)
   • Poin: komentar +5, suka +2, lempar properti +2
   • Tombol properti 💎🌹🔥🚀 dengan animasi terbang
   Pakai: <div id="kotakKomentarAlwi"></div>
          <script>window.KOMENTAR_POSTID='nama-halaman'</script>
          <script src="komentar/komentar.js"></script>
   ============================================================ */
(function(){
  var HOST = location.hostname || '34.170.37.50';
  var PROTOKOL = location.protocol==='file:' ? 'http:' : location.protocol;
  var DAFTAR_API = [
    PROTOKOL + '//' + HOST + ':4000/api'
  ];
  var apiAktif = null;
  function cariAPI(){ return apiAktif || DAFTAR_API[0]; }
  function panggil(jalur, opsi){
    var urutan = apiAktif ? [apiAktif].concat(DAFTAR_API.filter(function(a){return a!==apiAktif;})) : DAFTAR_API.slice();
    return urutan.reduce(function(eksekusi, dasar){
      return eksekusi.then(function(hasil){
        if (hasil) return hasil;
        return fetch(dasar + jalur, opsi).then(function(r){
          if (!r.ok) throw new Error('HTTP '+r.status);
          apiAktif = dasar;
          return r.json();
        }).catch(function(){ return null; });
      });
    }, Promise.resolve(null)).then(function(hasil){
      if (hasil) return hasil;
      throw new Error('semua server API tak terjangkau');
    });
  }

  var POSTID = window.KOMENTAR_POSTID || ('halaman:'+location.pathname);
  var wadah = document.getElementById('kotakKomentarAlwi');
  if (!wadah) { wadah = document.createElement('div'); wadah.id='kotakKomentarAlwi'; document.body.appendChild(wadah); }

  var NAMA = localStorage.getItem('alwi_nama_member') ||
             'Member ALWI (' + new Date().toLocaleDateString('id-ID',{day:'numeric',month:'numeric'}) + ')';
  localStorage.setItem('alwi_nama_member', NAMA);
  var UID = localStorage.getItem('alwi_device_id');
  if (!UID) { UID = 'dev-' + Date.now(); localStorage.setItem('alwi_device_id', UID); }

  function tambahPoin(n){
    var p = parseInt(localStorage.getItem('alwi_poin')||'0',10);
    localStorage.setItem('alwi_poin', String(p+n));
    var el = document.getElementById('APN_ANGKA');
    if (el) el.innerHTML = '&#9733; ' + (p+n);
    var angka = document.createElement('div');
    angka.textContent = '+' + n + ' poin';
    angka.style.cssText = 'position:absolute;right:12px;top:12px;color:#16a34a;font-weight:900;font-size:11px;pointer-events:none;animation:alwiPoinNaik 1s ease-out forwards';
    kotak.appendChild(angka);
    setTimeout(function(){ angka.remove(); }, 1000);
  }

  var st = document.createElement('style');
  st.textContent =
    '@keyframes alwiPoinNaik{to{transform:translateY(-18px);opacity:0}}' +
    '@keyframes alwiPropFly{0%{transform:translate(0,0) scale(1);opacity:1}70%{opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(1.6);opacity:0}}' +
    '#kotakKomentarAlwi .ka-kotak{font-family:Inter,system-ui,sans-serif;background:#fff;border:2px solid #cbd5e1;border-radius:14px;padding:10px;margin:10px 0;box-shadow:0 4px 10px rgba(15,23,42,.06);position:relative}' +
    '#kotakKomentarAlwi .ka-judul{font-size:11px;font-weight:900;color:#1e40af;letter-spacing:1px;border-left:4px solid #f59e0b;padding-left:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}' +
    '#kotakKomentarAlwi .ka-suka{background:#fffbeb;border:1.5px solid #fde68a;color:#92400e;font-size:11px;font-weight:900;border-radius:99px;padding:4px 10px;cursor:pointer;user-select:none}' +
    '#kotakKomentarAlwi .ka-suka.sudah{background:#fef3c7;border-color:#f59e0b}' +
    '#kotakKomentarAlwi .ka-daftar{max-height:190px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:8px}' +
    '#kotakKomentarAlwi .ka-item{display:flex;gap:7px}' +
    '#kotakKomentarAlwi .ka-ava{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#fff;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0}' +
    '#kotakKomentarAlwi .ka-gel{background:#f1f5f9;border-radius:12px;padding:6px 10px;max-width:100%}' +
    '#kotakKomentarAlwi .ka-nm{font-size:11px;font-weight:900;color:#1e40af}' +
    '#kotakKomentarAlwi .ka-tx{font-size:12.5px;color:#0f172a;word-break:break-word;line-height:1.4}' +
    '#kotakKomentarAlwi .ka-wk{font-size:9px;color:#94a3b8;margin-top:1px}' +
    '#kotakKomentarAlwi .ka-baris{display:flex;gap:6px}' +
    '#kotakKomentarAlwi .ka-input{flex:1;padding:9px 11px;border:2px solid #cbd5e1;border-radius:10px;font-family:inherit;font-size:12.5px;font-weight:700;color:#0f172a;outline:none;background:#f8fafc}' +
    '#kotakKomentarAlwi .ka-input:focus{border-color:#3b82f6;background:#fff}' +
    '#kotakKomentarAlwi .ka-kirim{background:linear-gradient(180deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:10px;padding:0 14px;font-weight:900;font-size:12px;cursor:pointer;box-shadow:0 2px 6px rgba(245,158,11,.35)}' +
    '#kotakKomentarAlwi .ka-prop{display:flex;gap:6px;margin-top:8px}' +
    '#kotakKomentarAlwi .ka-pbtn{flex:1;background:linear-gradient(180deg,#ffffff,#f1f5f9);border:2px solid #f59e0b;border-radius:10px;font-size:15px;padding:6px 0;cursor:pointer;text-align:center;box-shadow:0 2px 5px rgba(245,158,11,.22);transition:.12s}' +
    '#kotakKomentarAlwi .ka-pbtn:active{transform:scale(.9)}';
  document.head.appendChild(st);

  kotakHTML();
  function kotakHTML(){
    wadah.innerHTML =
      '<div class="ka-kotak">' +
        '<div class="ka-judul"><span>💬 KOMENTAR LIVE</span>' +
        '<span class="ka-suka" id="kaSuka">👍 <span id="kaJmlSuka">0</span></span></div>' +
        '<div id="kaStatus" style="display:none;font-size:10.5px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:4px 8px;margin-bottom:6px"></div>' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' +
          '<span style="font-size:10px;color:#64748b;font-weight:800">NAMA:</span>' +
          '<input id="kaNama" value="' + String(NAMA).replace(/"/g,'&quot;') + '" style="flex:1;font-size:11px;font-weight:800;color:#1e40af;border:none;border-bottom:1.5px dashed #cbd5e1;background:transparent;outline:none;padding:2px 0">' +
        '</div>' +
        '<div class="ka-daftar" id="kaDaftar"></div>' +
        '<div class="ka-baris">' +
          '<input class="ka-input" id="kaInput" placeholder="Tulis komentar... +5 poin" maxlength="200">' +
          '<button class="ka-kirim" id="kaKirim">KIRIM</button>' +
        '</div>' +
        '<div class="ka-prop">' +
          '<div class="ka-pbtn" data-e="💎">💎</div><div class="ka-pbtn" data-e="🌹">🌹</div>' +
          '<div class="ka-pbtn" data-e="🔥">🔥</div><div class="ka-pbtn" data-e="🚀">🚀</div>' +
        '</div>' +
      '</div>';
    document.getElementById('kaKirim').onclick = kirim;
    document.getElementById('kaNama').addEventListener('change', function(){
      NAMA = this.value.trim() || NAMA; localStorage.setItem('alwi_nama_member', NAMA);
    });
    document.getElementById('kaInput').addEventListener('keydown', function(e){ if(e.key==='Enter') kirim(); });
    document.getElementById('kaSuka').onclick = sukaToggle;
    wadah.querySelectorAll('.ka-pbtn').forEach(function(b){
      b.onclick = function(){ lemparProp(b.dataset.e); };
    });
  }
  var kotak = wadah.querySelector('.ka-kotak');

  function render(daftar){
    var d = document.getElementById('kaDaftar'); if(!d) return;
    d.innerHTML = '';
    (daftar||[]).forEach(function(k){
      var it = document.createElement('div'); it.className='ka-item';
      var av = document.createElement('div'); av.className='ka-ava'; av.textContent=(k.nama||'?').charAt(0).toUpperCase();
      var gel = document.createElement('div'); gel.className='ka-gel';
      var nm = document.createElement('div'); nm.className='ka-nm'; nm.textContent=k.nama||'?';
      var tx = document.createElement('div'); tx.className='ka-tx'; tx.textContent=k.teks||'';
      var wk = document.createElement('div'); wk.className='ka-wk'; wk.textContent=new Date(k.waktu).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
      gel.appendChild(nm); gel.appendChild(tx); gel.appendChild(wk);
      it.appendChild(av); it.appendChild(gel); d.appendChild(it);
    });
    d.scrollTop = d.scrollHeight;
  }

  var cacheKomentar = [];
  function muat(){
    panggil('/memori').then(function(db){
      var s = db.suka && db.suka[POSTID];
      var el = document.getElementById('kaJmlSuka');
      if (el && s) el.textContent = s.jumlah||0;
      var daftar = (db.komentar && db.komentar[POSTID]) || [];
      if (JSON.stringify(daftar)!==JSON.stringify(cacheKomentar)) { cacheKomentar = daftar; render(daftar); }
    }).catch(function(e){ setStatus('⚠️ Server belum terjangkau'); });
  }

  function setStatus(teks){
    var el = document.getElementById('kaStatus'); if(!el) return;
    el.textContent = teks; el.style.display = teks ? 'block' : 'none';
  }

  function kirim(){
    var inp = document.getElementById('kaInput');
    var teks = inp.value.trim();
    if (!teks) return;
    inp.value='';
    cacheKomentar = cacheKomentar.concat([{id:'lokal-'+Date.now(),nama:NAMA,teks:teks,waktu:new Date().toISOString()}]);
    render(cacheKomentar);
    tambahPoin(5);
    panggil('/komentar',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({postId:POSTID,nama:NAMA,teks:teks})})
      .then(function(){ setStatus(''); muat(); })
      .catch(function(){ setStatus('⚠️ Komentar baru di perangkat ini — server belum terjangkau'); });
  }

  var sudahSuka = localStorage.getItem('ka_suka_'+POSTID)==='1';
  function sukaToggle(){
    var b = document.getElementById('kaSuka');
    sudahSuka = !sudahSuka;
    localStorage.setItem('ka_suka_'+POSTID, sudahSuka?'1':'0');
    b.classList.toggle('sudah', sudahSuka);
    panggil('/suka',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({postId:POSTID,penyuka:sudahSuka?UID:null})}).then(muat).catch(function(){});
    if (sudahSuka) tambahPoin(2);
  }
  if (sudahSuka) { var sb=document.getElementById('kaSuka'); if(sb) sb.classList.add('sudah'); }

  function lemparProp(e){
    tambahPoin(2);
    var f = document.createElement('div');
    f.textContent = e;
    f.style.cssText = 'position:fixed;left:30px;bottom:120px;font-size:30px;z-index:99998;pointer-events:none;filter:drop-shadow(0 3px 4px rgba(0,0,0,.25));--tx:'+(Math.random()*160-80)+'px;--ty:-'+(140+Math.random()*120)+'px;animation:alwiPropFly 1.1s cubic-bezier(.25,1,.5,1) forwards';
    document.body.appendChild(f);
    setTimeout(function(){ f.remove(); }, 1150);
    panggil('/komentar',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({postId:POSTID,nama:NAMA,teks:e+' melempar properti!'})}).catch(function(){});
  }

  muat();
  setInterval(muat, 8000);
})();
