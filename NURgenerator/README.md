# Alwi Modular

Struktur sebelumnya (1 file server.ts raksasa + 1 file index.html raksasa)
sudah dipisah jadi modul-modul kecil biar gampang di-maintain.

## Struktur

```
server/
  server.js            <- entry point, cuma merakit semua route
  config.js             <- semua path & konstanta (PORT, LOG_DIR, dst)
  middleware/cors.js
  routes/
    memory.routes.js    <- GET/POST/DELETE /api/memory
    logs.routes.js       <- POST /api/log, GET /api/logs
    search.routes.js     <- POST /api/search, POST /api/fetch-url
    backup.routes.js     <- POST /api/backup-drive (rclone)
    ollama.routes.js     <- GET /api/tags, POST /api/chat
  utils/
    math.js               <- solveMath()
    contextBuilder.js     <- suntik waktu/matematika/URL/pencarian ke prompt

public/
  index.html             <- cuma struktur HTML, tanpa logika
  css/style.css
  js/
    main.js               <- merakit semua modul frontend
    memory.js             <- load/save/clear memori
    chat.js                <- logika kirim pesan & panggil Ollama
    websearch.js           <- deteksi & fetch pencarian web / URL
    speech.js               <- text-to-speech
    canvas-bg.js            <- animasi partikel latar (dekoratif)
```

## Jalankan

```
npm install
npm start
```

Server jalan di `http://localhost:3000` (atau `$PORT`).

## Rclone backup

`POST /api/backup-drive` akan menjalankan:
```
rclone copy "logs/" gdrive:Folder_Indramayu/logs
```
Rclone remote `gdrive` harus sudah dikonfigurasi duluan di VPS lewat `rclone config`.
Nama remote bisa diganti lewat environment variable `RCLONE_REMOTE`.

Untuk backup otomatis berkala (bukan cuma saat endpoint dipanggil manual),
tambahkan cron job di VPS, misalnya tiap jam:
```
0 * * * * curl -X POST http://localhost:3000/api/backup-drive
```

## Env yang bisa diatur

- `PORT` (default 3000)
- `OLLAMA_HOST` (default http://localhost:11434)
- `OLLAMA_MODEL` (default AlwiSultan:latest)
- `RCLONE_REMOTE` (default gdrive:Folder_Indramayu/logs)
