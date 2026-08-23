const login = require("facebook-chat-api");
const fs = require("fs");

// Otak Alwi
function jawabLokal(pesan) {
  const p = (pesan || "").toLowerCase();
  if (p.includes("nur1")) return "NUR1: Ini artikel Nur terbaru tentang INDRAMAYU_CLUB 🔥";
  if (p.includes("menu")) return "Menu Alwi:\nnur1 - Artikel\narisan - Info Arisan\nsapa - Salam";
  if (p.includes("sapa")) return "Assalamualaikum Warga INDRAMAYU_CLUB 👋";
  return "Alwi belum ngerti. Ketik 'menu' ya 😄";
}
// Kalkulator via Server Memori ALWI (:4000)
function tanyaKalkulator(pesan) {
  return new Promise((resolve) => {
    let soal = null;
    const mCmd = String(pesan || '').match(/^(?:!hitung|!kalkulator|kalkulator)\s+(.+)$/i);
    if (mCmd) soal = mCmd[1].trim();
    else {
      const t = String(pesan || '').trim();
      if (/^\d[\d\s+\-*/().,%^x:=]*$/.test(t) && /\d/.test(t) && /[+\-*/%^x=]/.test(t)) soal = t;
    }
    if (!soal) return resolve(null);
    require('http').request({
      host: '127.0.0.1', port: 4000, path: '/api/kalkulator', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(JSON.stringify({ soal })) },
      timeout: 8000
    }, (res) => {
      let b = '';
      res.on('data', c => { b += c; });
      res.on('end', () => {
        try {
          const d = JSON.parse(b);
          resolve(d.ok ? ('\u{1F9EE} ' + soal + ' = ' + d.hasil) : null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null)).end(JSON.stringify({ soal }));
  });
}

async function tanyaAlwi(pesan) {
  const h = await tanyaKalkulator(pesan);
  if (h !== null) return h;
  return jawabLokal(pesan);
}

// Opsi A: Login via AppState (Rekomendasi)
let credentials = {};
if (fs.existsSync("appstate.json")) {
  credentials = { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) };
} else {
  // Opsi B: Login via Email/Pass (Risiko Checkpoint)
  credentials = {
    email: "emailkamu@gmail.com",
    password: "passwordfbkamu"
  };
}

login(credentials, (err, api) => {
  if (err) {
    console.error("GAGAL LOGIN:", err);
    return;
  }

  // Simpan appstate untuk login berikutnya tanpa credential
  fs.writeFileSync("appstate.json", JSON.stringify(api.getAppState()));

  api.setOptions({ listenEvents: true, selfListen: false });
  console.log("✅ BOT ALWI FB UDAH ONLINE");

  api.listenMqtt(async (err, event) => {
    if (err) return console.error("Error Listening:", err);

    // Pesan Personal (DM)
    if (event.type === "message" && !event.isGroup) {
      const pesan = event.body;
      const senderID = event.senderID;
      const balasan = await tanyaAlwi(pesan);

      api.sendMessage(balasan, senderID);
      console.log(`[FB DM] ${senderID}: ${pesan} -> ${balasan}`);
    }

    // Pesan Grup
    if (event.type === "message" && event.isGroup) {
      const pesan = event.body;
      const threadID = event.threadID;
      if (pesan && pesan.toLowerCase().includes("alwi")) {
        const balasan = await tanyaAlwi(pesan);
        api.sendMessage(balasan, threadID);
        console.log(`[FB GRUP] ${threadID}: ${pesan} -> ${balasan}`);
      }
    }
  });
});

