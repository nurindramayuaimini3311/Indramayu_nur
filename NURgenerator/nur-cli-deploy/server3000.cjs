// server3000.cjs — Server statis pengganti (root: ~/NURgenerator, port 3000)
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.env.HOME, "nur-cli-deploy");
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.cjs': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.webm': 'audio/webm; codecs=opus',
  '.ogg': 'audio/ogg; codecs=opus',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400).end('URL rusak');
    return;
  }
  // PERBAIKAN: root ("/") sekarang mengarah ke index.html UTAMA
  // di folder NURgenerator (hub navigasi), bukan meta/index.html
  if (urlPath === '/') urlPath = '/index.html';

// ==== PROXY /api/voice → port 8080 ====
if (urlPath.startsWith('/api/voice')) {
  const http = require('http');
  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: 8080,
    path: urlPath,
    method: req.method,
    headers: { ...req.headers, host: 'localhost:8080' }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('API voice tidak aktif');
  });
  req.pipe(proxyReq);
  return;
}


  const target = path.normalize(path.join(ROOT, urlPath));
  if (!target.startsWith(ROOT)) {
    res.writeHead(403).end('Terlarang');
    return;
  }

  fs.stat(target, (err, st) => {
    let file = target;
    if (!err && st.isDirectory()) file = path.join(file, 'index.html');
    fs.readFile(file, (e2, data) => {
     if (e2) {
  fs.readFile(path.join(ROOT, '404.html'), (e3, data404) => {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(e3 ? '404 — tidak ada: ' + urlPath : data404);
  });
  return;
}
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  });
}).listen(PORT, '0.0.0.0', () => console.log(`SERVER ALWI aktif di port ${PORT} -> ${ROOT}`));
