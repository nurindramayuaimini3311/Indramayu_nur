'use strict';

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const gTTS = require('gtts');
const ffmpeg = require('fluent-ffmpeg');
const alwi = require('./agent-alwi-data.cjs');

// ---------- Kalkulator Server (memori_baru :4000) ----------
async function hitungViaServer(teks) {
  let soal = null;
  const mCmd = String(teks || '').match(/^(?:!hitung|!kalkulator|kalkulator)\s+(.+)$/i);
  if (mCmd) soal = mCmd[1].trim();
  else {
    const t = String(teks || '').trim();
    if (/^\d[\d\s+\-*/().,%^x:=]*$/.test(t) && /\d/.test(t) && /[+\-*/%^x=]/.test(t)) soal = t;
    else if (/^(berapa|hitung(kan)?)\b/i.test(t) && /\d/.test(t)) soal = t.replace(/^(berapa(kah)?|hitung(kan)?)\s*/i, '').replace(/[?]/g, '').trim();
  }
  if (!soal) return null;
  return await new Promise((resolve) => {
    const payload = JSON.stringify({ soal });
    const req = require('http').request({
      host: '127.0.0.1', port: 4000, path: '/api/kalkulator', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 8000
    }, (res) => {
      let b = '';
      res.on('data', c => { b += c; });
      res.on('end', () => {
        try {
          const d = JSON.parse(b);
          resolve(d.ok ? ('\u{1F9EE} ' + soal + ' = ' + d.hasil) : ('\u26A0\uFE0F ' + (d.galat || 'tidak bisa dihitung')));
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end(payload);
  });
}

// ---------- Helper AI (model tunggal 'Alwi' via :4000 -> Ollama) ----------
async function tanyaAI(teks) {
  const soal = teks.replace(/^(?:!ai|!tanya)\s+/i, '').trim();
  if (!soal) return '\u{1F916} Contoh pakai: *!ai siapa presiden pertama Indonesia*';
  return await new Promise((resolve) => {
    const payload = JSON.stringify({ prompt: 'Jawab singkat padat dalam Bahasa Indonesia: ' + soal, maks: 300 });
    const req = require('http').request({
      host: '127.0.0.1', port: 4000, path: '/api/ai', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 150000
    }, (res) => {
      let b = '';
      res.on('data', c => { b += c; });
      res.on('end', () => {
        try {
          const d = JSON.parse(b);
          resolve(d.response ? ('\u{1F916} *Alwi AI:*\n\n' + d.response.trim()) : ('\u26A0\uFE0F AI belum siap' + (d.galat ? ': ' + d.galat : '')));
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve('\u26A0\uFE0F Server AI tidak merespons'));
    req.on('timeout', () => { req.destroy(); resolve('\u23F3 AI masih memuat model, coba lagi sebentar.'); });
    req.end(payload);
  });
}

// <-- kamus (dari artikel.txt), SINKRON otomatis

// ---------- Konfigurasi dari .env ----------
const CFG = {
  imapHost: process.env.IMAP_HOST || 'imap.gmail.com',
  imapPort: parseInt(process.env.IMAP_PORT || '993', 10),
  imapUser: process.env.IMAP_USER,
  imapPass: process.env.IMAP_PASS,
  waTargetNumber: process.env.WA_TARGET_NUMBER,
  otpSenderFilter: process.env.OTP_SENDER_FILTER || '',
  otpSubjectKeyword: process.env.OTP_SUBJECT_KEYWORD || '',
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '15000', 10),
};

if (!CFG.imapUser || !CFG.imapPass || !CFG.waTargetNumber) {
  console.error('❌ Harap pastikan IMAP_USER, IMAP_PASS, dan WA_TARGET_NUMBER terisi di .env');
  process.exit(1);
}

const OTP_REGEX = /\b(\d[ -]?){4,8}\b/;
const PORTAL_LINK = 'https://indramayu-nur-ep1m-lg7a52t9q-indramayu-calub.vercel.app/';

// ---------- Pilihan Suara & Bahasa ----------
let BAHASA_SUARA_AKTIF = 'id';
const PILIHAN_SUARA = {
  'suara1': { kode: 'id', nama: '🇮🇩 Indonesia (Normal)' },
  'suara2': { kode: 'su', nama: '🌿 Sunda / Aksa Lokal' },
  'suara3': { kode: 'jw', nama: '📜 Jawa / Aksa Lokal' },
  'suara4': { kode: 'en', nama: '🇬🇧 English Sultan VVIP' },
  'suara5': { kode: 'ja', nama: '🇯🇵 Japanese Anime' },
  'suara6': { kode: 'ar', nama: '🕌 Arab / Makrifat' }
};

// ---------- Engine Respon Teks (kamus & artikel SINKRON dari agent-alwi-data.cjs) ----------
function jawabLokal(teksMasuk) {
  const teks = teksMasuk.toLowerCase().trim();

  // 1. Pengaturan Suara
  if (teks.includes('suara')) {
    for (const [key, item] of Object.entries(PILIHAN_SUARA)) {
      if (teks.includes(key)) {
        BAHASA_SUARA_AKTIF = item.kode;
        return {
          teks: `✅ Suara Agen Alwi diganti ke: *${item.nama}*`,
          suara: `Suara Agen Alwi diubah ke ${item.nama}.`
        };
      }
    }
    let daftarSuara = `🎙️ *PILIHAN SUARA AGEN ALWI*\n\n`;
    for (const [key, item] of Object.entries(PILIHAN_SUARA)) {
      daftarSuara += `• Ketik *${key}* : ${item.nama}\n`;
    }
    daftarSuara += `\n📌 *Suara Aktif:* ${BAHASA_SUARA_AKTIF.toUpperCase()}`;
    return { teks: daftarSuara, suara: `Pilih jenis suara yang Anda inginkan.` };
  }

  // 2. Pengenalan Identitas Tokoh
  if (/(siapa (kamu|itu alwi)|kamu siapa)/.test(teks)) {
    return {
      teks: `Saya *Agen Alwi* ⛑️, asisten digital komunitas Indramayu Club. Siap bantu cari kata Basa Dermayu, artikel, atau info komunitas.`,
      suara: `Saya Agen Alwi, asisten digital komunitas Indramayu Club.`
    };
  }
  if (teks.includes('dulkohar')) {
    return {
      teks: `👳 *Pak Dulkohar* adalah tokoh warga senior Indramayu Club — sering ngobrol bareng saya (Alwi) soal gotong royong, transparansi kas, dan kehangatan komunitas.`,
      suara: `Pak Dulkohar adalah tokoh warga senior di komunitas Indramayu Club.`
    };
  }

  // 3. Baca Detail Artikel spesifik (nur1..nur11)
  for (const key of Object.keys(alwi.artikel)) {
    if (teks === key || teks === `baca ${key}`) {
      return {
        teks: alwi.formatArtikelWA(key),
        suara: `Membuka artikel ${key}. Silakan baca panduan lengkapnya.`
      };
    }
  }

  // 4. Pencarian Artikel Otomatis (Baik pakai kata "cari" maupun kata biasa)
  const cariMatch = teks.match(/^(?:cari|baca)?(?: artikel)?\s*(.+)/);
  if (cariMatch && cariMatch[1]) {
    const kw = cariMatch[1].trim();
    const hasilCari = alwi.formatHasilPencarianWA(kw);
    if (hasilCari && !hasilCari.includes('tidak ditemukan')) {
      return {
        teks: hasilCari,
        suara: `Berikut hasil pencarian artikel untuk kata ${kw}.`
      };
    }
  }

  // 5. Cek Kamus Basa Dermayu (Persis & Format "arti/kamus <kata>")
  if (alwi.cariKata(teks)) {
    const d = alwi.cariKata(teks);
    return {
      teks: alwi.formatKataWA(teks),
      suara: `${teks} artinya ${d.indonesia}.`
    };
  }

  const cariKataMatch = teks.match(/^(arti|kamus|apa itu)\s+(.+)/);
  if (cariKataMatch) {
    const kataDicari = cariKataMatch[2].trim();
    if (alwi.cariKata(kataDicari)) {
      const d = alwi.cariKata(kataDicari);
      return {
        teks: alwi.formatKataWA(kataDicari),
        suara: `${kataDicari} artinya ${d.indonesia}.`
      };
    }
  }

  // 6. Pusat Artikel & Panduan Menu
  if (teks === 'artikel' || teks === 'panduan' || teks === 'menu') {
    return {
      teks: alwi.formatDaftarArtikelWA(),
      suara: `Berikut adalah daftar artikel dan panduan sistem Nur.`
    };
  }

  // 7. Sapaan
  if (/^(hallo|halo|hai|assalamu)/.test(teks)) {
    return {
      teks: `Assalamu'alaikum! Saya Agen Alwi ⛑️\n\nKetik:\n• *kata Basa Dermayu* : Cari arti (misal "kula")\n• *menu* : Layanan Nur\n• *suara* : Pilihan Suara\n• *artikel* : Panduan & Artikel\n\n🌐 Portal: ${PORTAL_LINK}`,
      suara: `Assalamu'alaikum! Saya Agen Alwi. Siap melayani Anda.`
    };
  }

  return {
    teks: `Maaf, perintah belum dikenali 🙏\n\nKetik *kata Basa Dermayu*, *menu*, *suara*, atau *artikel* untuk bantuan. Portal:\n${PORTAL_LINK}`,
    suara: `Maaf, perintah belum dikenali. Ketik menu atau artikel.`
  };
}

// ---------- Konversi Suara Ke OGG Opus ----------
function convertTextToOpusAudio(text, outputFileOgg, langCode) {
  return new Promise((resolve, reject) => {
    const tempMp3 = path.join(__dirname, `temp_${Date.now()}.mp3`);
    const speech = new gTTS(text, langCode || BAHASA_SUARA_AKTIF);

    speech.save(tempMp3, (err) => {
      if (err) return reject(err);
      ffmpeg(tempMp3)
        .audioCodec('libopus')
        .audioChannels(1)
        .format('ogg')
        .on('end', () => {
          if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
          resolve(outputFileOgg);
        })
        .on('error', (ffmpegErr) => {
          if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
          reject(ffmpegErr);
        })
        .save(outputFileOgg);
    });
  });
}

// ---------- Setup Baileys ----------
let waSocket = null;
let waReady = false;
let pairingRequested = false;

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth_alwi'));

  waSocket = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
  });

  waSocket.ev.on('creds.update', saveCreds);

  waSocket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !waSocket.authState.creds.registered && !pairingRequested) {
      pairingRequested = true;
      console.log(`\n⏳ Requesting Pairing Code untuk ${CFG.waTargetNumber}...`);
      await delay(5000);
      try {
        const code = await waSocket.requestPairingCode(CFG.waTargetNumber);
        console.log(`\n🔑 KODE PAIRING BOT ALWI ALL-IN-ONE: ${code}\n`);
      } catch (err) {
        console.error('❌ Gagal request pairing:', err.message);
        pairingRequested = false;
      }
    }

    if (connection === 'open') {
      waReady = true;
      console.log(`✅ BOT ALWI ALL-IN-ONE ONLINE! (Kamus: ${alwi.jumlahKata()} kata, Artikel: ${Object.keys(alwi.artikel).length})`);
    }

    if (connection === 'close') {
      waReady = false;
      pairingRequested = false;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        await delay(3000);
        startWhatsApp();
      }
    }
  });

  waSocket.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const remoteJid = msg.key.remoteJid;
      const bodyText = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
      if (!bodyText) return;

      console.log(`💬 Pesan dari ${remoteJid}: ${bodyText}`);

      // ==== PRIORITAS KALKULATOR ====
      const hasilHitung = await hitungViaServer(bodyText);
      if (hasilHitung) {
        await waSocket.sendMessage(remoteJid, { text: hasilHitung }, { quoted: msg });
        return;
      }
      // ==== HELPER AI (Alwi:latest) ====
      if (/^(!ai|!tanya)\b/i.test(bodyText)) {
        await waSocket.sendMessage(remoteJid, { text: '\u{1F916} Alwi sedang berpikir...' }, { quoted: msg });
        const jwbAi = await tanyaAI(bodyText);
        if (jwbAi) await waSocket.sendMessage(remoteJid, { text: jwbAi }, { quoted: msg });
        return;
      }
      const balasan = jawabLokal(bodyText);

      // Kirim Teks
      await waSocket.sendMessage(remoteJid, { text: balasan.teks }, { quoted: msg });

      // Kirim Voice Note Opus
      const audioPathOgg = path.join(__dirname, `alwi_voice_${Date.now()}.ogg`);
      try {
        await convertTextToOpusAudio(balasan.suara, audioPathOgg, BAHASA_SUARA_AKTIF);
        await waSocket.sendMessage(
          remoteJid,
          { audio: { url: audioPathOgg }, mimetype: 'audio/ogg; codecs=opus', ptt: true },
          { quoted: msg }
        );
      } catch (e) {
        console.error('Err suara:', e.message);
      } finally {
        if (fs.existsSync(audioPathOgg)) fs.unlinkSync(audioPathOgg);
      }

    } catch (err) {
      console.error('Error msg:', err.message);
    }
  });
}

async function sendWhatsApp(text) {
  if (!waReady || !waSocket) return;
  const jid = `${CFG.waTargetNumber}@s.whatsapp.net`;
  await waSocket.sendMessage(jid, { text });
  console.log('📤 OTP Terkirim ke WA:', text);
}

// ---------- Setup IMAP OTP ----------
function openInboxAndWatch() {
  const imap = new Imap({
    user: CFG.imapUser,
    password: CFG.imapPass,
    host: CFG.imapHost,
    port: CFG.imapPort,
    tls: true,
    connTimeout: 30000,
    authTimeout: 30000,
    tlsOptions: { rejectUnauthorized: false },
  });

  function checkUnseen() {
    imap.search(['UNSEEN'], (err, results) => {
      if (err || !results || !results.length) return;
      const f = imap.fetch(results, { bodies: '', markSeen: true });
      f.on('message', (msg) => {
        msg.on('body', (stream) => {
          simpleParser(stream, async (err, parsed) => {
            if (err) return;
            const from = (parsed.from?.text || '').toLowerCase();
            const subject = (parsed.subject || '').toLowerCase();

            if (CFG.otpSenderFilter && !from.includes(CFG.otpSenderFilter.toLowerCase())) return;
            if (CFG.otpSubjectKeyword && !subject.includes(CFG.otpSubjectKeyword.toLowerCase())) return;

            const bodyText = parsed.text || '';
            const match = bodyText.match(OTP_REGEX) || subject.match(OTP_REGEX);

            if (match) {
              const kode = match[0].replace(/[\s-]/g, '');
              const pesan = `🔐 Kode OTP Diterima\nDari: ${parsed.from?.text || '-'}\nSubjek: ${parsed.subject || '-'}\nKode: *${kode}*`;
              await sendWhatsApp(pesan);
            }
          });
        });
      });
    });
  }

  imap.once('ready', () => {
    console.log('✅ IMAP OTP Pemantau Email Tersambung!');
    imap.openBox('INBOX', false, (err) => {
      if (!err) {
        checkUnseen();
        setInterval(checkUnseen, CFG.pollIntervalMs);
      }
    });
  });

  imap.once('end', () => setTimeout(openInboxAndWatch, 10000));
  imap.connect();
}

// ---------- Jalankan Bot ----------
(async () => {
  console.log('🚀 Memulai Bot Alwi All-In-One (Sinkron Kamus + Artikel)...');
  await startWhatsApp();
  openInboxAndWatch();
})();

