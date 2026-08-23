'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Parser artikel.txt
 * ------------------
 * Format file (bebas diedit pakai nano):
 *
 * ### nur1
 * JUDUL: judul artikel
 * RINGKASAN: satu baris ringkasan
 * DETAIL:
 * isi lengkap...
 * boleh berbaris-baris...
 *
 * ### nur2
 * ...dst
 *
 * Setiap blok dimulai "### key" dan berakhir saat ketemu "### key" berikutnya atau akhir file.
 */
function muatArtikelDariFile(filePath) {
  const fullPath = filePath || path.join(__dirname, 'artikel.txt');

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  artikel.txt tidak ditemukan di ${fullPath} — artikel kosong.`);
    return {};
  }

  const isi = fs.readFileSync(fullPath, 'utf-8');
  const blokList = isi.split(/^### /m).map(b => b.trim()).filter(Boolean);

  const hasil = {};
  for (const blok of blokList) {
    const baris = blok.split('\n');
    const key = baris[0].trim().toLowerCase();

    const judulMatch = blok.match(/^JUDUL:\s*(.+)$/m);
    const ringkasanMatch = blok.match(/^RINGKASAN:\s*(.+)$/m);
    const detailMatch = blok.match(/^DETAIL:\s*\n([\s\S]*)$/m);

    hasil[key] = {
      judul: judulMatch ? judulMatch[1].trim() : `Artikel ${key.toUpperCase()}`,
      ringkasan: ringkasanMatch ? ringkasanMatch[1].trim() : '-',
      detail: detailMatch ? detailMatch[1].trim() : '(Belum ada detail, silakan isi di artikel.txt)',
    };
  }
  return hasil;
}

module.exports = { muatArtikelDariFile };
