// memori_baru.cjs — Server Memori ALWI (komentar & suka persisten) + Proxy AI Ollama
const http = require('http');
const fs = require('fs');
const path = require('path');

const BERKAS = path.join(__dirname, 'memori.json');
const PORT = process.env.PORT || 4000;
const PALING_BANYAK = 5000; // batas komentar per postingan

function muat() {
  try { return JSON.parse(fs.readFileSync(BERKAS, 'utf8')); }
  catch (e) { return { komentar: {}, suka: {} }; }
}
let db = muat();

function simpan() {
  try { fs.writeFileSync(BERKAS, JSON.stringify(db)); }
  catch (e) { console.error('gagal simpan:', e.message); }
}

function kepalaCORS() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

// ==== MESIN KALKULATOR ====
function evalKalkulator(soalRaw) {
  try {
    let s = String(soalRaw || '').toLowerCase().trim();
    if (!s) return { ok: false, galat: 'soal kosong' };
    s = s.replace(/\bditambah\b|\btambah\b|\bplus\b/g, '+')
         .replace(/\bdikurangi\b|\bdikurang\b|\bkurang\b|\bminus\b/g, '-')
         .replace(/\bdikali\b|\bkali\b/g, '*')
         .replace(/\bdibagi\b|\bbagi\b/g, '/')
         .replace(/\bpangkat\b/g, '**');
    s = s.replace(/[×✕✖]/g, '*').replace(/[÷]/g, '/').replace(/[–—−]/g, '-')
        .replace(/(\d)\s*\^+\s*(\d)/g, '$1**$2')
        .replace(/(\d)\s*[x]\s*(\d)/g, '$1*$2')
        .replace(/=/g, '').trim();
    s = s.replace(/(\d+(?:\.\d+)?)\s*%\s*(?:of|dari)\s*/g, '($1/100)*')
        .replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)');
    if (!/^[\d\s+\-*/().,%]+$/.test(s)) return { ok: false, galat: 'hanya angka & operasi matematika' };
    const nilai = Function('"use strict";return(' + s + ')')();
    if (typeof nilai !== 'number' || !isFinite(nilai)) return { ok: false, galat: 'hasil bukan angka' };
    const hasil = Math.round(nilai * 1e10) / 1e10;
    return { ok: true, soal: soalRaw, hasil: hasil };
  } catch (e) {
    return { ok: false, galat: 'soal tidak bisa dihitung' };
  }
}

const server = http.createServer((req, res) => {
  const K = kepalaCORS();
  if (req.method === 'OPTIONS') { res.writeHead(204, K); return res.end(); }

  let tubuh = '';
  req.on('data', c => { tubuh += c; if (tubuh.length > 1e6) req.destroy(); });

  req.on('end', () => {
    // ==== AMBIL SEMUA MEMORI ====
    if (req.url === '/api/memori' && req.method === 'GET') {
      res.writeHead(200, { ...K, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(db));
    }

    // ==== TAMBAH KOMENTAR ====
    if (req.url === '/api/komentar' && req.method === 'POST') {
      try {
        const d = JSON.parse(tubuh);
        if (!d.postId || !d.teks || !String(d.teks).trim()) {
          res.writeHead(400, { ...K, 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ok: false, galat: 'postId & teks wajib' }));
        }
        const daftar = (db.komentar[d.postId] = db.komentar[d.postId] || []);
        if (daftar.length >= PALING_BANYAK) daftar.shift();
        const k = {
          id: Date.now().toString(36),
          nama: String(d.nama || 'Member ALWI').slice(0, 40),
          teks: String(d.teks).slice(0, 500),
          waktu: new Date().toISOString()
        };
        daftar.push(k);
        simpan();
        res.writeHead(200, { ...K, 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, komentar: k }));
      } catch (e) {
        res.writeHead(400, { ...K, 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false }));
      }
    }

    // ==== SUKA / BATAL SUKA ====
    if (req.url === '/api/suka' && req.method === 'POST') {
      try {
        const d = JSON.parse(tubuh);
        if (!d.postId) {
          res.writeHead(400, { ...K, 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ok: false }));
        }
        const s = (db.suka[d.postId] = db.suka[d.postId] || { jumlah: 0, penyuka: {} });
        let suka;
        if (d.penyuka) { // toggle berdasar ID unik perangkat
          if (s.penyuka[d.penyuka]) { delete s.penyuka[d.penyuka]; s.jumlah--; suka = false; }
          else { s.penyuka[d.penyuka] = 1; s.jumlah++; suka = true; }
        } else {
          s.jumlah += d.arah === 'turun' ? -1 : 1; suka = d.arah !== 'turun';
        }
        if (s.jumlah < 0) s.jumlah = 0;
        simpan();
        res.writeHead(200, { ...K, 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, jumlah: s.jumlah, suka }));
      } catch (e) {
        res.writeHead(400, { ...K, 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false }));
      }
    }

    // ==== PROXY AI -> OLLAMA (tanpa streaming) ====
    if (req.url === '/api/ai' && req.method === 'POST') {
      try {
        const d = JSON.parse(tubuh || '{}');
        const muatan = JSON.stringify({
          model: String(d.model || 'qwen2.5:1.5b'),
          prompt: String(d.prompt || '').slice(0, 12000),
          stream: false,
          options: { num_predict: Math.min(Number(d.maks) || 1024, 4096) }
        });
        const up = http.request({
          host: '127.0.0.1', port: 11434, path: '/api/generate', method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(muatan) },
          timeout: 300000
        }, function (jawab) {
          let buf = '';
          jawab.on('data', c => { buf += c; if (buf.length > 20e6) jawab.destroy(); });
          jawab.on('end', () => {
            res.writeHead(jawab.statusCode || 200, { ...K, 'Content-Type': 'application/json' });
            res.end(buf);
          });
        });
        up.on('timeout', () => { up.destroy(); res.writeHead(504, { ...K, 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok:false, galat:'AI kehabisan waktu' })); });
        up.on('error', e => { res.writeHead(502, { ...K, 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok:false, galat:e.message })); });
        up.end(muatan);
      } catch (e) {
        res.writeHead(400, { ...K, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, galat: 'badan permintaan rusak' }));
      }
      return;
    }

    // ==== KALKULATOR ====
    if (req.url.startsWith('/api/kalkulator')) {
      let soal = '';
      if (req.method === 'GET') {
        try { soal = new URL(req.url, 'http://x').searchParams.get('soal') || ''; } catch {}
      } else {
        try { soal = JSON.parse(tubuh || '{}').soal || ''; } catch {}
      }
      const h = evalKalkulator(soal);
      res.writeHead(h.ok ? 200 : 400, { ...K, 'Content-Type': 'application/json' });
      res.end(JSON.stringify(h));
      return;
    }

    res.writeHead(404, { ...K, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, galat: 'jalur tak dikenal' }));
  });
});

server.listen(PORT, () => console.log('MEMORI ALWI aktif di port', PORT));
