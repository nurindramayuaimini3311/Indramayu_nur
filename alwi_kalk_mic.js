/* alwi_kalk_mic.js — Mic + Suara untuk kalkulator ALWI (:3000)
   🎤 bicara soal (cth: "dua puluh satu tambah dua") -> hasil tampil & dibacakan
   🔊 auto-speak: membacakan setiap perubahan #result */
(function(){
  if (document.getElementById('ALWI_KM_CSS')) return;
  var st = document.createElement('style'); st.id = 'ALWI_KM_CSS';
  st.textContent =
    '#kmMic,#kmSpk{position:fixed;left:14px;width:52px;height:52px;border-radius:50%;display:flex;' +
    'align-items:center;justify-content:center;font-size:23px;cursor:pointer;z-index:999999990;' +
    'border:3px solid #000;user-select:none}' +
    '#kmMic{bottom:84px;background:linear-gradient(135deg,#059669,#25D366);box-shadow:0 4px 14px rgba(37,211,102,.5)}' +
    '#kmSpk{bottom:20px;background:linear-gradient(135deg,#b8860b,#FFD700);box-shadow:0 4px 14px rgba(255,215,0,.4)}' +
    '#kmSpk.off{filter:grayscale(1);opacity:.55}' +
    '#kmMic.dengar{animation:kmPulse 1s infinite}' +
    '@keyframes kmPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}' +
    '#kmBalon{display:none;position:fixed;bottom:146px;left:14px;width:min(300px,86vw);background:#0f172a;' +
    'color:#e2e8f0;border:2px solid #25D366;border-radius:14px;padding:11px;font-size:12.5px;' +
    'font-family:system-ui,sans-serif;z-index:999999991;line-height:1.5}' +
    '#kmBalon b{color:#25D366}';
  document.head.appendChild(st);

  var layar = document.getElementById('result');
  var balon = document.createElement('div'); balon.id = 'kmBalon';
  document.body.appendChild(balon);
  function bilang(html){ balon.innerHTML = html; balon.style.display = 'block';
    clearTimeout(balon._t); balon._t = setTimeout(function(){ balon.style.display='none'; }, 6000); }

  /* --- suara TTS --- */
  var spkOn = true;
  function ucapkan(teks){
    if (!spkOn || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(teks);
      u.lang = 'id-ID'; u.rate = 1;
      var v = speechSynthesis.getVoices().filter(function(v){return /id[-_]ID/i.test(v.lang)})[0];
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch(e){}
  }

  /* --- parser matematika Bahasa Indonesia --- */
  var ANGKA = {nol:0,satu:1,dua:2,tiga:3,empat:4,lima:5,enam:6,tujuh:7,delapan:8,sembilan:9,
    sepuluh:10,sebelas:11,sabelas:11};
  function kataKeAngka(w){
    w = w.replace(/-/g,' ').toLowerCase();
    if (/^\d+([.,]\d+)?$/.test(w)) return parseFloat(w.replace(',','.'));
    if (ANGKA[w] !== undefined && !/ /.test(w)) return ANGKA[w];
    var tok = w.split(/\s+/), total = 0, cur = 0, ok = false;
    for (var i=0;i<tok.length;i++){
      var t = tok[i];
      if (t==='') continue;
      if (ANGKA[t] !== undefined){ cur += ANGKA[t]; ok = true; }
      else if (t==='puluh'){ cur = (cur||1)*10; ok = true; }
      else if (t==='ratus'){ cur = (cur||1)*100; ok = true; }
      else if (t==='ribuan'||t==='ribu'){ total = (total + (cur||1))*1000; cur = 0; ok = true; }
      else if (t==='belas'){ cur = (cur||1)+10; ok = true; }
      else return null;
    }
    return ok ? total+cur : null;
  }
  function parseIndo(teks){
    var s = ' ' + teks.toLowerCase()
      .replace(/[^a-z0-9\s.,+\-*/=:]/g,' ')
      .replace(/\btambah\b|\bplus\b|\+/g,' + ')
      .replace(/\bkurang\b|\bminus\b|-/g,' - ')
      .replace(/\bkali\b|\bdikali\b|\bx\b|\*/g,' * ')
      .replace(/\bbagi\b|\bdibagi\b|\bper\b/g,' / ')
      .replace(/\bsama dengan\b|\bhasilnya?\b|\bbberapa\b|\bsama dgn\b|=/g,' = ')
      .replace(/\bpoin\w*\b/g,' ');
    var out = '', angkaBuf = [], selesai = false;
    s.split(/\s+/).forEach(function(w){
      if (!w) return;
      if ('+-*/'.indexOf(w) > -1 && out.slice(-1) !== '='){ 
        if (angkaBuf.length){ out += kataKeAngka(angkaBuf.join(' ')); angkaBuf = []; }
        out += w;
      } else if (w === '='){ selesai = true; }
      else { angkaBuf.push(w); }
    });
    if (angkaBuf.length){ var n = kataKeAngka(angkaBuf.join(' ')); if (n !== null) out += n; }
    out = out.replace(/[.,]/g,function(m,pos){ return m==='.' ? '.' : ''; }).replace(/\s/g,'');
    if (out.indexOf('=') > -1) out = out.split('=')[0];
    if (!/^[\d+\-*/.()]+$/.test(out) || !/\d/.test(out)) return null;
    return { ekspresi: out, adaOperator: /[+\-*/]/.test(out) };
  }
  function amanHitung(e){
    if (!/^[\d+\-*/.() ]+$/.test(e)) return null;
    try { var h = Function('"use strict";return(' + e + ')')(); 
      return (typeof h === 'number' && isFinite(h)) ? Math.round(h*1e6)/1e6 : null;
    } catch(err){ return null; }
  }

  /* --- mic --- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var mic = document.createElement('div'); mic.id = 'kmMic'; mic.innerHTML = '🎤'; mic.title = 'Bicara soal hitung';
  document.body.appendChild(mic);
  if (!SR) mic.onclick = function(){ bilang('<b>🎤</b> Browser ini tidak mendukung mic (pakai Chrome).'); };
  else mic.onclick = function(){
    if (mic._jalan) return;
    try {
      var r = new SR(); r.lang = 'id-ID'; r.interimResults = false; mic._jalan = true;
      mic.classList.add('dengar'); bilang('<b>🎤 Mendengarkan…</b> (cth: <i>dua puluh satu tambah dua</i>)');
      r.onresult = function(ev){
        var teks = ev.results[0][0].transcript;
        bilang('<b>🎤</b> "' + teks + '"');
        var p = parseIndo(teks);
        if (!p || !p.adaOperator){ bilang('<b>🎤</b> "' + teks + '"<br>⚠️ Soal hitung tidak terdeteksi.'); return; }
        var h = amanHitung(p.ekspresi);
        if (h === null){ bilang('⚠️ Tidak bisa dihitung.'); return; }
        if (layar) layar.textContent = p.ekspresi + ' = ' + h;
        ucapkan('Hasilnya ' + p.ekspresi.replace('*',' kali ').replace('/',' bagi ') + ' sama dengan ' + h);
      };
      r.onerror = function(){ bilang('⚠️ Mic gagal, coba lagi.'); };
      r.onend = function(){ mic._jalan = false; mic.classList.remove('dengar'); };
      r.start();
    } catch(e){ mic._jalan = false; mic.classList.remove('dengar'); }
  };

  /* --- speaker toggle + auto-speak hasil --- */
  var spk = document.createElement('div'); spk.id = 'kmSpk'; spk.innerHTML = '🔊'; spk.title = 'Suara otomatis';
  document.body.appendChild(spk);
  spk.onclick = function(){
    spkOn = !spkOn; spk.classList.toggle('off', !spkOn);
    spk.innerHTML = spkOn ? '🔊' : '🔇';
    if (spkOn) ucapkan('Suara aktif');
  };
  if (window.speechSynthesis) speechSynthesis.getVoices();
  if (layar && window.MutationObserver){
    new MutationObserver(function(){
      if (!spkOn) return;
      var t = (layar.textContent || '').trim();
      if (!t || t === '0' || layar._terakhir === t) return;
      layar._terakhir = t;
      ucapkan(t.replace(/\*/g,' kali ').replace(/\//g,' bagi ').replace(/\+/g,' tambah ').replace(/=/g,' sama dengan '));
    }).observe(layar, { childList:true, characterData:true, subtree:true });
  }
})();
