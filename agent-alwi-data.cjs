'use strict';

const kamusData = require('./kamus-alwi.cjs');
const { muatArtikelDariFile } = require('./artikel-parser.cjs');

/**
 * AgentAlwiData
 * -------------
 * Satu class terpadu buat semua data Agent Alwi: kamus Basa Dermayu + artikel/panduan Nur.
 * Tujuannya: bot-alwi.cjs, website (lewat API kalau nanti dibikin), dan tool lain
 * cukup pakai satu instance ini, nggak perlu import kamusLokal & ARTIKEL_NUR terpisah.
 */
class AgentAlwiData {
  constructor() {
    this.kamus = kamusData;

    // Artikel dibaca langsung dari artikel.txt (bukan hardcode).
    // Kalau mau tambah/ubah isi, cukup edit artikel.txt pakai nano, restart bot.
    this.artikel = muatArtikelDariFile();

    this.portalLink = 'https://alwigrandle-bit.github.io/INDRAMAYU_CLUB/';
  }

  // ---------- KAMUS ----------
  cariKata(kata) {
    const key = kata.toLowerCase().trim();
    return this.kamus[key] ? { kata: key, ...this.kamus[key] } : null;
  }

  jumlahKata() {
    return Object.keys(this.kamus).length;
  }

  kataAcak() {
    const keys = Object.keys(this.kamus);
    const k = keys[Math.floor(Math.random() * keys.length)];
    return { kata: k, ...this.kamus[k] };
  }

  kataPerKategori(kategori) {
    return Object.entries(this.kamus)
      .filter(([, v]) => v.kategori === kategori)
      .map(([k, v]) => ({ kata: k, ...v }));
  }

  // ---------- ARTIKEL ----------
  getArtikel(key) {
    const k = key.toLowerCase().trim();
    return this.artikel[k] || null;
  }

  daftarArtikel() {
    return Object.entries(this.artikel).map(([key, a]) => ({ key, judul: a.judul, ringkasan: a.ringkasan }));
  }

  // Cari artikel berdasarkan kata kunci di judul/ringkasan/detail (bukan cuma key nur1..nur10)
  cariArtikel(keyword) {
    const kw = (keyword || '').toLowerCase().trim();
    if (!kw) return [];
    return Object.entries(this.artikel)
      .filter(([key, a]) =>
        key.includes(kw) ||
        a.judul.toLowerCase().includes(kw) ||
        a.ringkasan.toLowerCase().includes(kw) ||
        a.detail.toLowerCase().includes(kw)
      )
      .map(([key, a]) => ({ key, judul: a.judul, ringkasan: a.ringkasan }));
  }

  // ---------- FORMAT SIAP KIRIM KE WHATSAPP ----------
  formatKataWA(kata) {
    const d = this.cariKata(kata);
    if (!d) return null;
    return `📖 *${d.kata}*\n🏷️ Kategori: ${d.kategori}\n🇮🇩 Indonesia: ${d.indonesia}\n🛒 Basa Pasar: ${d.pasar}\n\n🌐 Kamus lengkap:\n${this.portalLink}nur10_kamus_alwi.html`;
  }

  formatArtikelWA(key) {
    const a = this.getArtikel(key);
    if (!a) {
      return `😕 Artikel "${key}" belum ada di artikel.txt.\n\n🛠️ Tambahkan blok "### ${key}" di file artikel.txt lalu restart bot.\n\n🌐 Sementara buka portal:\n${this.portalLink}`;
    }
    return `==============================\n${a.judul}\n==============================\n\n📌 *Ringkasan:* ${a.ringkasan}\n\n${a.detail}\n\n🌐 Buka Portal:\n${this.portalLink}`;
  }

  formatHasilPencarianWA(keyword) {
    const hasil = this.cariArtikel(keyword);
    if (!hasil.length) {
      return `😕 Gak ketemu artikel yang cocok dengan kata "${keyword}".\n\n💡 Coba ketik *artikel* buat lihat semua daftar, atau kata kunci lain.\n🌐 Portal: ${this.portalLink}`;
    }
    let out = `🔎 *HASIL PENCARIAN: "${keyword}"*\n\n`;
    for (const { key, judul } of hasil) {
      out += `🔹 *${key.toUpperCase()}* : ${judul.replace('ARTIKEL ', '')}\n`;
    }
    out += `\n💡 Ketik key-nya (misal *${hasil[0].key}*) untuk baca detail lengkap.`;
    return out;
  }

  formatDaftarArtikelWA() {
    let out = `📚 *PUSAT ARTIKEL & PANDUAN NUR*\n\n`;
    for (const { key, judul } of this.daftarArtikel()) {
      out += `🔹 *${key.toUpperCase()}* : ${judul.replace('ARTIKEL ', '')}\n`;
    }
    out += `\n💡 Ketik misal: *nur1* atau *baca nur3* untuk detail artikel.\n🌐 Portal: ${this.portalLink}`;
    return out;
  }
}

module.exports = new AgentAlwiData(); // export instance siap pakai (singleton)
