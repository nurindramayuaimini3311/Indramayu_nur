// voice_cleanup.cjs — Server /api/voice + pembersih otomatis 7 hari + cache-control
// Deploy: jalankan di VM mesin-gratis-saya, root web = ~/Indramayu_nur/NURgenerator
//   node NURgenerator/server/utils/voice_cleanup.cjs
//   VOICE_PORT=4100 node ...  (default 4100, bebas dari 8080/4001/3000)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(process.env.HOME || '', 'Indramayu_nur', 'NURgenerator');
const VOICE_DIR = path.join(ROOT, 'meta', 'upload', 'voice');
const INDEX = path.join(VOICE_DIR, 'voice_index.json');

const PORT = process.env.VOICE_PORT || 4100;
const UMUR_MAKS = 7 * 24 * 60 * 60 * 1000; // 7 hari dalam milidetik

function muatIndeks() {
  try { return JSON.parse(fs.readFileSync(INDEX, 'utf8')); }
  catch (e) { return []; }
}

let db = muatIndeks();

function simpanIndeks() {
  try { fs.mkdirSync(VOICE_DIR, { recursive: true }); fs.writeFileSync(INDEX, JSON.stringify(db)); }
  catch (e) { console.error('gagal simpan indeks:', e.message); }
}

// Hapus entri & file audio yang berumur > 7 hari
// selalu muat ulang dari disk supaya sinkron dgn perubahan di luar server
function bersihkanLama() {
  db = muatIndeks();
  const batas = Date.now() - UMUR_MAKS;
  const sisa = [];
  for (const v of db) {
    const t = new Date(v.createdAt || 0).getTime();
    if (Number.isFinite(t) && t < batas) {
      const p = path.join(VOICE_DIR, v.filename || '');
      fs.unlink(p, () => {}); // hapus file audio
    } else {
      sisa.push(v);
    }
  }
  if (sisa.length !== db.length) {
    db = sisa;
    simpanIndeks();
  }
  return db.length;
}

// Nama file aman berdasar waktu + slot
function buatFilename(slot) {
  const aman = String(slot || 'x').replace(/[^a-zA-Z0-9_-]/g, '');
  return Date.now().toString(36) + '-' + aman + '-' + Math.random().toString(36).slice(2, 6) + '.webm';
}

function kepalaCORS() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

const server = http.createServer((req, res) => {
  const K = kepalaCORS();
  if (req.method === 'OPTIONS') { res.writeHead(204, K); return res.end(); }

  // Cache-control: audio disajikan tanpa cache lama (>7 hari dibuang otomatis)
  if (req.method === 'GET' && req.url.startsWith('/meta/upload/voice/') && !req.url.endsWith('voice_index.json')) {
    berikanFile(req, res, K);
    return;
  }

  let tubuh = '';
  req.on('data', c => { tubuh += c; if (tubuh.length > 4e6) req.destroy(); });

  req.on('end', () => {
    bersihkanLama(); // selalu bersihkan dulu

    // ==== SIMPAN SUARA ====
    if (req.url === '/api/voice' && req.method === 'POST') {
      try {
        const d = JSON.parse(tubuh);
        const audio = String(d.audio || '');
        const m = audio.match(/^data:audio\/[\w.+-]+;base64,(.+)$/s);
        if (!m) { res.writeHead(400, { ...K, 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ ok: false, galat: 'audio base64 tidak valid' })); }
        const buf = Buffer.from(m[1], 'base64');
        const durasiReq = Number(d.durasi) || 0;
        if (durasiReq > 50) {
          res.writeHead(413, { ...K, 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ok: false, galat: 'Rekaman maksimal 50 detik' }));
        }
        const filename = buatFilename(d.slot);
        fs.mkdirSync(VOICE_DIR, { recursive: true });
        fs.writeFileSync(path.join(VOICE_DIR, filename), buf);

        // Normalisasi FFmpeg: isi metadata durasi + codec opus agar .webm
        // langsung bisa dibaca/diputar Chrome (tanpa nunggu parse lama).
        const fileTmp = filename + '.tmp.webm';
        try {
          execFileSync('ffmpeg', ['-y', '-i', path.join(VOICE_DIR, filename),
            '-c:a', 'libopus', '-b:a', '64k', '-ar', '48000', '-f', 'webm',
            path.join(VOICE_DIR, fileTmp)], { stdio: 'ignore', timeout: 8000 });
          fs.renameSync(path.join(VOICE_DIR, fileTmp), path.join(VOICE_DIR, filename));
        } catch (ff) {
          try { fs.unlinkSync(path.join(VOICE_DIR, fileTmp)); } catch (_) {}
        }
        const entri = {
          filename,
          slot: String(d.slot || ''),
          nama: String(d.nama || 'Member').slice(0, 40),
          durasi: durasiReq,
          createdAt: new Date().toISOString()
        };
        db.push(entri);
        simpanIndeks();
        res.writeHead(200, { ...K, 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, url: '/NURgenerator/meta/upload/voice/' + filename, filename }));
      } catch (e) {
        res.writeHead(400, { ...K, 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, galat: e.message }));
      }
    }

    // ==== AMBIL DAFTAR SUARA PER SLOT ====
    if (req.url.startsWith('/api/voice') && req.method === 'GET') {
      const slot = new URL(req.url, 'http://x').searchParams.get('slot') || '';
      const list = db.filter(v => !slot || v.slot === slot).slice(-20);
      res.writeHead(200, { ...K, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify(list));
    }

    // ==== HAPUS MANUAL (opsional) ====
    if (req.url === '/api/voice' && req.method === 'DELETE') {
      try {
        const d = JSON.parse(tubuh);
        db = db.filter(v => v.filename !== d.filename);
        fs.unlink(path.join(VOICE_DIR, d.filename || ''), () => {});
        simpanIndeks();
        res.writeHead(200, { ...K, 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { ...K, 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false }));
      }
    }

    res.writeHead(404, { ...K, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: false, galat: 'jalur tak dikenal' }));
  });
});

function berikanFile(req, res, K) {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const target = path.normalize(path.join(ROOT, urlPath));
  if (!target.startsWith(ROOT) || path.extname(target).toLowerCase() !== '.webm') {
    res.writeHead(403, { ...K }).end('Terlarang');
    return;
  }
  // Cache: 6 jam saja, supaya file yang kelak dibuang 7 hari tidak menumpuk di cache browser
  res.writeHead(200, {
    ...K,
    'Content-Type': 'audio/webm',
    'Cache-Control': 'public, max-age=21600, must-revalidate'
  });
  fs.createReadStream(target).on('error', () => {
    res.writeHead(404).end('Audio tidak ada');
  }).pipe(res);
}

server.listen(PORT, '0.0.0.0', () => {
  bersihkanLama();
  console.log(`VOICE SERVER aktif di port ${PORT} -> ${VOICE_DIR}`);
  // bersihkan rutin tiap menit
  setInterval(bersihkanLama, 60 * 1000);
});
