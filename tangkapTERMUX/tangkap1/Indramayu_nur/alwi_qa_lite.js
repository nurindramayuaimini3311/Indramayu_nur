/**
 * ALWI AI SYSTEM - Minimal & Lightweight
 * Untuk M2 Micro VM: fokus Q&A saja
 */

const ALWI_QA = {
  storage: 'alwi_qa_data',
  
  init() {
    if (!localStorage.getItem(this.storage)) {
      localStorage.setItem(this.storage, JSON.stringify([]));
    }
  },
  
  // Respons template (ringan, tidak perlu API)
  responses: {
    nur1: "Nur 1 Cahaya = Variable. Contoh: cahaya='Nur'. Simpan di toples batik dengan sopan.",
    nur2: "Nur 2 Angin = If-Else. Jika hujan → pakai payung, jika tidak → main.",
    nur3: "Nur 3 Air = Loop. Banyu mili terus. for i in range(10): belajar().",
    nur4: "Nur 4 Tanah = Function. def rumah(): pondasi kuat. Fungsi yang bermanfaat.",
    nur5: "Nur 5 Api = Debug. Bug kuwi kanca sinau. Memory Leak = toples kebanyakan isi.",
    nur6: "Nur 6 Langit = Array. Kumpulan data seperti awan berjajar.",
    nur7: "Nur 7 Bintang = Class. Struktur sempurna seperti bintang di langit.",
    nur8: "Nur 8 Bulan = API. Cahaya informasi yang menerangi jalan.",
    nur9: "Nur 9 Matahari = Database. Pusat energi data yang kuat.",
    nur10: "Nur 10 Bumi = Deploy. Menanam hasil kerja untuk bermakna.",
    variable: "Variabel adalah tempat menyimpan data. Kayak kotak atau tas.",
    function: "Function adalah blok kode yang bisa dipakai berkali-kali. Efisien!",
    loop: "Loop: pengulangan. Misal, cuci piring 10x, bukan tulis 1 per 1.",
    debug: "Debug = cari dan perbaiki bug. Seperti detektif cari tahu error.",
    api: "API = interface komunikasi antar program. Misal, WhatsApp → IG.",
    database: "Database = tempat menyimpan data besar. Seperti almari besar.",
    halo: "Waalaikumsalam! Saya Alwi ⛑️ siap membantu. Tanya tentang Nur1-10, coding, atau apapun! 😊"
  },
  
  // Tambah Q&A
  add(question, answer) {
    this.init();
    const data = JSON.parse(localStorage.getItem(this.storage));
    data.push({
      q: question,
      a: answer,
      t: new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})
    });
    localStorage.setItem(this.storage, JSON.stringify(data.slice(-50))); // Keep last 50
  },
  
  // Get respons
  getResponse(question) {
    const q = question.toLowerCase();
    
    if (q.includes('nur1') || q.includes('variable') || q.includes('cahaya')) return this.responses.nur1;
    if (q.includes('nur2') || q.includes('if') || q.includes('else') || q.includes('angin')) return this.responses.nur2;
    if (q.includes('nur3') || q.includes('loop') || q.includes('banyu')) return this.responses.nur3;
    if (q.includes('nur4') || q.includes('function') || q.includes('lemah')) return this.responses.nur4;
    if (q.includes('nur5') || q.includes('debug') || q.includes('bug') || q.includes('geni')) return this.responses.nur5;
    if (q.includes('nur6') || q.includes('array') || q.includes('langit')) return this.responses.nur6;
    if (q.includes('nur7') || q.includes('class') || q.includes('lintang')) return this.responses.nur7;
    if (q.includes('nur8') || q.includes('api') || q.includes('rembulan')) return this.responses.nur8;
    if (q.includes('nur9') || q.includes('database') || q.includes('srengenge')) return this.responses.nur9;
    if (q.includes('nur10') || q.includes('deploy') || q.includes('bumi')) return this.responses.nur10;
    if (q.includes('variable') || q.includes('variabel')) return this.responses.variable;
    if (q.includes('function') || q.includes('fungsi')) return this.responses.function;
    if (q.includes('loop') || q.includes('perulangan')) return this.responses.loop;
    if (q.includes('debug') || q.includes('error')) return this.responses.debug;
    if (q.includes('api')) return this.responses.api;
    if (q.includes('database') || q.includes('data')) return this.responses.database;
    if (q.includes('halo') || q.includes('hai') || q.includes('hello')) return this.responses.halo;
    
    return "Hmm, pertanyaan menarik! Coba tanya lebih spesifik tentang Nur1-10 atau topik coding. 🤔";
  },
  
  // Get all
  getAll() {
    this.init();
    return JSON.parse(localStorage.getItem(this.storage)) || [];
  },
  
  // Clear
  clear() {
    localStorage.removeItem(this.storage);
  }
};

ALWI_QA.init();
