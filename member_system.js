/**
 * SISTEM POIN MEMBER INDRAMAYU CLUB
 * - Login member → +10 poin
 * - Komentar member → +5 poin
 * - Quiz selesai → +50 poin
 * - Quiz checkpoint → +100 poin
 * - Admin bisa reclone & export ke SQL
 */

const MEMBER_SYSTEM = {
  // Simulasi database localStorage
  storage: 'indramayu_members',
  
  // Inisialisasi sistem
  init() {
    if (!localStorage.getItem(this.storage)) {
      localStorage.setItem(this.storage, JSON.stringify([]));
    }
  },
  
  // LOGIN MEMBER - +10 poin
  loginMember(nama, idMember) {
    this.init();
    const members = JSON.parse(localStorage.getItem(this.storage));
    const existing = members.find(m => m.idMember === idMember);
    
    if (existing) {
      existing.poin += 10;
      existing.lastLogin = new Date().toLocaleString('id-ID');
      existing.loginCount = (existing.loginCount || 0) + 1;
    } else {
      members.push({
        nama,
        idMember,
        poin: 10,
        loginCount: 1,
        komentarCount: 0,
        quizCount: 0,
        lastLogin: new Date().toLocaleString('id-ID'),
        joinDate: new Date().toLocaleString('id-ID'),
        history: [{
          type: 'login',
          poin: 10,
          waktu: new Date().toLocaleString('id-ID')
        }]
      });
    }
    
    localStorage.setItem(this.storage, JSON.stringify(members));
    return { status: 'success', poin: existing ? existing.poin : 10, message: `Login berhasil! +10 🎁` };
  },
  
  // KOMENTAR - +5 poin
  addKomentar(idMember, komentar) {
    this.init();
    const members = JSON.parse(localStorage.getItem(this.storage));
    const member = members.find(m => m.idMember === idMember);
    
    if (member) {
      member.poin += 5;
      member.komentarCount = (member.komentarCount || 0) + 1;
      member.history = member.history || [];
      member.history.push({
        type: 'komentar',
        poin: 5,
        komentar: komentar.substring(0, 50) + '...',
        waktu: new Date().toLocaleString('id-ID')
      });
      
      localStorage.setItem(this.storage, JSON.stringify(members));
      return { status: 'success', poin: member.poin, message: `Komentar ditambah! +5 🎁` };
    }
    return { status: 'error', message: 'Member tidak ditemukan' };
  },
  
  // QUIZ SELESAI - +50 poin
  completeQuiz(idMember, level) {
    this.init();
    const members = JSON.parse(localStorage.getItem(this.storage));
    const member = members.find(m => m.idMember === idMember);
    
    if (member) {
      const poinQuiz = 50;
      member.poin += poinQuiz;
      member.quizCount = (member.quizCount || 0) + 1;
      member.history = member.history || [];
      member.history.push({
        type: 'quiz',
        poin: poinQuiz,
        level: level,
        waktu: new Date().toLocaleString('id-ID')
      });
      
      localStorage.setItem(this.storage, JSON.stringify(members));
      return { status: 'success', poin: member.poin, message: `Quiz Level ${level} selesai! +50 🎁🎉` };
    }
    return { status: 'error', message: 'Member tidak ditemukan' };
  },
  
  // CHECKPOINT - +100 poin
  checkpointReward(idMember, checkpoint) {
    this.init();
    const members = JSON.parse(localStorage.getItem(this.storage));
    const member = members.find(m => m.idMember === idMember);
    
    if (member) {
      const poinCheckpoint = 100;
      member.poin += poinCheckpoint;
      member.history = member.history || [];
      member.history.push({
        type: 'checkpoint',
        poin: poinCheckpoint,
        checkpoint: checkpoint,
        waktu: new Date().toLocaleString('id-ID')
      });
      
      localStorage.setItem(this.storage, JSON.stringify(members));
      return { status: 'success', poin: member.poin, message: `Checkpoint ${checkpoint} dilewati! +100 🏆` };
    }
    return { status: 'error', message: 'Member tidak ditemukan' };
  },
  
  // GET SEMUA MEMBER DATA
  getAllMembers() {
    this.init();
    return JSON.parse(localStorage.getItem(this.storage)) || [];
  },
  
  // GET SATU MEMBER
  getMember(idMember) {
    const members = this.getAllMembers();
    return members.find(m => m.idMember === idMember);
  },
  
  // EXPORT KE CSV/SQL FORMAT
  exportToSQL() {
    const members = this.getAllMembers();
    let sql = "-- INDRAMAYU CLUB MEMBER DATABASE\n";
    sql += "-- Generated: " + new Date().toLocaleString('id-ID') + "\n\n";
    sql += "CREATE TABLE IF NOT EXISTS indramayu_members (\n";
    sql += "  idMember VARCHAR(20) PRIMARY KEY,\n";
    sql += "  nama VARCHAR(100),\n";
    sql += "  poin INT,\n";
    sql += "  loginCount INT,\n";
    sql += "  komentarCount INT,\n";
    sql += "  quizCount INT,\n";
    sql += "  joinDate DATETIME,\n";
    sql += "  lastLogin DATETIME\n";
    sql += ");\n\n";
    
    members.forEach(m => {
      sql += `INSERT INTO indramayu_members VALUES ('${m.idMember}', '${m.nama}', ${m.poin}, ${m.loginCount || 0}, ${m.komentarCount || 0}, ${m.quizCount || 0}, '${m.joinDate}', '${m.lastLogin}');\n`;
    });
    
    return sql;
  },
  
  // EXPORT KE JSON
  exportToJSON() {
    const members = this.getAllMembers();
    return JSON.stringify(members, null, 2);
  },
  
  // CLEAR SEMUA DATA (HATI-HATI!)
  clearAllData() {
    if (confirm('⚠️ Yakin mau hapus SEMUA data member? Tidak bisa di-undo!')) {
      localStorage.removeItem(this.storage);
      return { status: 'success', message: 'Semua data member dihapus!' };
    }
    return { status: 'cancelled', message: 'Dibatalkan' };
  },
  
  // IMPORT DATA DARI JSON
  importFromJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data)) {
        localStorage.setItem(this.storage, JSON.stringify(data));
        return { status: 'success', message: `Import ${data.length} member berhasil!` };
      }
      return { status: 'error', message: 'Format JSON tidak valid' };
    } catch (e) {
      return { status: 'error', message: 'Error parsing JSON: ' + e.message };
    }
  }
};

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MEMBER_SYSTEM;
}
