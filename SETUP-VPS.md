# Setup Bot Alwi di VPS (satu mesin, gak perlu Termux lagi)

## 1. Upload file ke VPS
Upload semua file di paket ini ke folder baru, misal:
```bash
mkdir -p ~/bot-alwi-vps
# lalu upload/pindahkan semua file .cjs, .js, .txt, package.json, .env.example ke situ
cd ~/bot-alwi-vps
```

## 2. Install dependencies
```bash
npm install
```
(Ini generate `node_modules` fresh di VPS, gak perlu transfer dari Termux.)

## 3. Siapkan .env
```bash
cp .env.example .env
nano .env
```
Isi `IMAP_PASS` dengan **App Password Gmail yang baru** (yang lama sudah invalid,
itu penyebab bot crash total kemarin). Generate di:
https://myaccount.google.com/apppasswords

`OLLAMA_URL` sudah otomatis pakai `localhost:11434` karena Ollama jalan di
mesin yang sama — jadi lebih cepat & stabil, gak perlu lewat proxy port 3000 lagi.

## 4. Jalankan manual dulu (buat scan QR/pairing baru)
```bash
node bot-alwi.cjs
```
- Tunggu muncul kode pairing di terminal
- Masukkan kode itu di WhatsApp HP kamu (Perangkat Tertaut > Tautkan dengan nomor telepon)
- Setelah muncul "✅ BOT ALWI ALL-IN-ONE ONLINE!", tekan Ctrl+C

## 5. Jalankan permanen pakai PM2
```bash
npm install -g pm2   # kalau belum ada
pm2 start bot-alwi.cjs --name bot-alwi
pm2 save
pm2 startup          # ikuti instruksi yang muncul, biar auto-start kalau VPS reboot
```

## 6. Cek status & log
```bash
pm2 status
pm2 logs bot-alwi
```

## Perubahan yang sudah ditambahkan ke bot-alwi.cjs:
1. **Fallback Ollama** — kalau kamus lokal (`kamus-alwi.cjs`/`agent-alwi-data.cjs`)
   gak nemu jawaban, bot otomatis nanya ke Ollama (model `AlwiSultan:latest`)
   dan balasannya ditandai emoji 🤖.
2. **Fix crash IMAP** — sebelumnya, kalau IMAP gagal login (password salah/expired),
   itu bikin SELURUH bot mati (termasuk WhatsApp). Sekarang error IMAP cuma
   dicatat di log dan dicoba lagi tiap 30 detik, gak ganggu WhatsApp.
3. **Jaring pengaman global** — error tak terduga di bagian mana pun sekarang
   cuma dicatat di log, gak mematikan seluruh proses bot lagi.

## Catatan keamanan
File `memory-server.js` (kalau masih dipakai untuk chat web `index-ollama-backup.html`)
punya `app.use(express.static('.'))` yang nge-expose SEMUA file di foldernya ke
publik, termasuk kalau ada `.env` di folder yang sama. Pastikan `.env` bot ini
ditaruh di folder terpisah dari `memory-server.js`, atau tambahkan middleware
blokir sebelum publish port-nya secara luas.
