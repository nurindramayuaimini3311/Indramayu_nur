function doGet(e) {
  var page = (e.parameter.page || 'kamus').toLowerCase();
  
  if (page === 'webkit' || page === 'google') {
    return HtmlService.createHtmlOutputFromFile('webkit')
      .setTitle('WebKit Alwi - KAMUS PY + Google FIX')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  if (page === 'bot' || page === 'google_bot') {
    return HtmlService.createHtmlOutputFromFile('google_bot')
      .setTitle('Google Bot');
  }
  // ... kode kamus kamu yang lama ...
  if (page === 'kamus') {
    return HtmlService.createHtmlOutputFromFile('kamus')
      .setTitle('KAMUS PY - DKOHAR011');
  }
}

const CONFIG = {
  SHEET_ID: '10FFp-0p3GoSGiyWl-rDhv7pNOmOQmgHXQOrjZU8NFDQ',
  SHEET_MEMBER: 'members',
  SHEET_TRANSAKSI: 'transaksi',
  SHEET_KAMUS_ANTOLOGI: 'alwi_antologi',
  SECRET_KEY: 'alwi_rahasia_2024',
  MAX_VVIP: 100
};

const TIER = {
  BRONZE:{badge:'🥉 BRONZE',warna:'#cd7f32'},
  SILVER:{badge:'🥈 SILVER',warna:'#c0c0c0'},
  GOLD:{badge:'🥇 GOLD',warna:'#FFD700'},
  VVIP:{badge:'💎 VVIP',warna:'#00ffcc'}
};

const KAMUS_CLASP = {
"isun":{indonesia:"saya",kategori:"Kata Ganti",contoh:"Isun arep lunga pasar"},
"sira":{indonesia:"kamu",kategori:"Kata Ganti",contoh:"Sira lagi apa batur?"},
"kula":{indonesia:"saya (halus)",kategori:"Kata Ganti",contoh:"Kula nyuwun pangapura"},
"priben":{indonesia:"bagaimana",kategori:"Kata Tanya",contoh:"Priben kabare batur?"},
"nang":{indonesia:"di",kategori:"Penunjuk",contoh:"Nang endi sira?"},
"batur":{indonesia:"teman",kategori:"Umum",contoh:"Batur isun akeh pisan"},
"dolan":{indonesia:"main",kategori:"Kata Kerja",contoh:"Ayo dolan bareng nang alun-alun"},
"enak":{indonesia:"enak",kategori:"Kata Sifat",contoh:"Enak pisan rasane sego"},
"bagea":{indonesia:"bagus",kategori:"Kata Sifat",contoh:"Bagea temen klambine"},
"pisan":{indonesia:"sangat",kategori:"Partikel",contoh:"Enak pisan!"},
"sugeng":{indonesia:"selamat",kategori:"Umum",contoh:"Sugeng enjing sedulur"},
"enjing":{indonesia:"pagi",kategori:"Waktu",contoh:"Sugeng enjing"},
"ndalu":{indonesia:"malam",kategori:"Waktu",contoh:"Sugeng ndalu batur"},
"arep":{indonesia:"akan / mau",kategori:"Kata Kerja",contoh:"Isun arep lunga"},
"lunga":{indonesia:"pergi",kategori:"Kata Kerja",contoh:"Arep lunga endi?"},
"mangan":{indonesia:"makan",kategori:"Kata Kerja",contoh:"Ayo mangan bareng"},
"banyu":{indonesia:"air",kategori:"Umum",contoh:"Banyu mili terus"},
"geni":{indonesia:"api",kategori:"Umum",contoh:"Ati kaya geni"},
"srengenge":{indonesia:"matahari",kategori:"Umum",contoh:"Srengenge padang"},
"rembulan":{indonesia:"bulan",kategori:"Umum",contoh:"Rembulan bengi"},
"sega":{indonesia:"nasi",kategori:"Umum",contoh:"Sega goreng enak"},
"klambi":{indonesia:"baju",kategori:"Umum",contoh:"Klambine bagea"},
"umah":{indonesia:"rumah",kategori:"Umum",contoh:"Umah isun gede"},
"dalane":{indonesia:"jalannya",kategori:"Umum",contoh:"Dalane alus"},
"wong":{indonesia:"orang",kategori:"Umum",contoh:"Wong Indramayu"}
};

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page)? e.parameter.page : 'home';
  page = page.toLowerCase();
  if (page == 'api') return handleApi(e);
  if (page == 'kamus') return HtmlService.createHtmlOutput(getKamusHtml(e)).setTitle('Kamus PY');
  return HtmlService.createHtmlOutput(getKamusHtml(e)).setTitle('KAMUS PY - DKOHAR011 4');
}

function handleApi(e) {
  var action = (e.parameter.action || '').toLowerCase();
  var p = e.parameter;
  try {
    if (e.postData && e.postData.contents) {
      var body = JSON.parse(e.postData.contents);
      p = Object.assign({}, p, body);
    }
  } catch(err) {}
  var result = { ok:false, msg:'Action tidak dikenal' };
  if (action == 'cari' || action == 'kamus_acak' || action == 'acak') result = apiCariKamus(p);
  else if (action == 'member_bantuan') result = apiMemberBantuan(p);
  else if (action == 'status') result = apiStatus();
  else if (action == 'stats') result = apiStats();
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function apiCariKamus(p) {
  var kata = (p.kata || '').toLowerCase().trim();
  var mode = p.mode || 'acak';
  var halaman = p.halaman || 'clasp';
  var k, v;
  if (mode === 'cari' && kata && KAMUS_CLASP[kata]) {
    k = kata; v = KAMUS_CLASP[kata];
  } else {
    var keys = Object.keys(KAMUS_CLASP);
    k = keys[Math.floor(Math.random() * keys.length)];
    v = KAMUS_CLASP[k];
  }
  var total = 0;
  try {
    var sheet = getSheet(CONFIG.SHEET_KAMUS_ANTOLOGI);
    sheet.appendRow([new Date(), k, v.indonesia, halaman, p.username || 'anon']);
    total = sheet.getLastRow() - 1;
    if (total % 5 === 0) {
      MailApp.sendEmail('dkohar011@gmail.com', 'ALWI CLASP LVL ' + (total/5) + ' - ' + k + ' = ' + v.indonesia, 'Kata: ' + k + ' = ' + v.indonesia + '\nHalaman: ' + halaman + '\nTotal: ' + total + '\nWaktu: ' + new Date());
    }
  } catch(e) { total = Math.floor(Math.random()*50); }
  return {
    ok:true,
    status:'ketemu',
    kata:k,
    indonesia:v.indonesia,
    kategori:v.kategori,
    contoh:v.contoh,
    halaman:halaman,
    alwi_pinter_level:total,
    antologi:'Alwi baca ' + total + ' kata',
    waktu: new Date().toLocaleString('id-ID'),
    server:'CLASP - KAMUS PY - DKOHAR011 4'
  };
}

function apiMemberBantuan(p){
  try{
    MailApp.sendEmail('dkohar011@gmail.com', 'MEMBER BUTUH: ' + (p.pesan||'').substring(0,30), 'Pesan: ' + p.pesan + '\nHalaman: ' + p.halaman + '\nWaktu: ' + new Date());
    return {ok:true, msg:'Terkirim ke admin'};
  } catch(e){ return {ok:false, msg:e.toString()} }
}

function apiStatus(){
  try{
    var sheet = getSheet(CONFIG.SHEET_KAMUS_ANTOLOGI);
    var total = sheet.getLastRow()-1;
    return {server:'ALWI CLASP + EMAIL OK', email:'dkohar011@gmail.com', sheet_id:CONFIG.SHEET_ID, total_antologi:total, level:'Lv'+Math.floor(total/5)};
  } catch(e){ return {server:'CLASP OK', total:0, error:e.toString()} }
}

function apiStats(){ return apiStatus(); }

function getSheet(name) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === CONFIG.SHEET_KAMUS_ANTOLOGI) {
      sheet.appendRow(['waktu','kata','indonesia','halaman','username']);
      sheet.getRange(1,1,1,5).setFontWeight('bold').setBackground('#FFD700');
    }
    if (name === CONFIG.SHEET_MEMBER) {
      sheet.appendRow(['id','nama','username','password','phone','kota','tier','saldo','diskon','isVvip','nomorUrut','tglDaftar','lastLogin','status']);
    }
  }
  return sheet;
}

function getKamusHtml(e){
  var acak = apiCariKamus({halaman: (e.parameter.halaman||'kamus-clasp')});
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KAMUS CLASP - ALWI</title><style>body{background:#0d0d0d;color:#e8d5a0;font-family:Arial;margin:0}header{background:#1a1408;border-bottom:3px solid #c9a84c;padding:16px;text-align:center}h1{color:#FFD700}.kartu{background:#1e1608;border:2px solid #3a2c0a;border-radius:16px;padding:18px;margin:12px;max-width:600px;margin:0 auto 12px}.btn{width:100%;background:linear-gradient(135deg,#7a5c1e,#c9a84c);color:#000;border:none;padding:20px;border-radius:14px;font-size:22px;font-weight:900;cursor:pointer}.kata{font-size:44px;color:#FFD700;text-align:center;font-weight:900}.arti{font-size:24px;text-align:center;color:#fff}</style></head><body><header><h1>🎲 KAMUS PY - DKOHAR011 4 ✅</h1><div style="font-size:11px;color:#9a8050">${Object.keys(KAMUS_CLASP).length} kata • Total baca: ${acak.alwi_pinter_level} • Server: ${acak.server}</div></header><div style="max-width:600px;margin:0 auto;padding:12px"><div class="kartu" style="text-align:center"><button class="btn" onclick="location.href='?page=kamus&halaman=clasp&t='+Date.now()">🎲 KATA ACAK (CLASP)</button><div style="font-size:11px;color:#9a8050;margin-top:8px">Tiap 5 kata → Auto email ke dkohar011@gmail.com 📧</div></div><div class="kartu" style="text-align:center;border-color:#FFD700"><div style="font-size:10px;color:#9a8050">${acak.kategori}</div><div class="kata">${acak.kata}</div><div class="arti">= ${acak.indonesia}</div><div style="background:rgba(201,168,76,.1);border-left:4px solid #c9a84c;padding:10px;border-radius:8px;margin-top:10px;font-style:italic">💬 "${acak.contoh}"</div><div style="margin-top:10px;font-size:11px;color:#9a8050">Alwi baca ${acak.alwi_pinter_level} kata • ${acak.waktu} • Sheet: KAMUS PY - DKOHAR011 4</div></div></div></body></html>`;
}
