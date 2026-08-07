import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional

DB_PATH = Path("indramayu_club.db")

def inisialisasi_db(db_path: Path = DB_PATH) -> Optional[sqlite3.Connection]:
    try:
        conn = sqlite3.connect(str(db_path))
        conn.execute("""
        CREATE TABLE IF NOT EXISTS komentar_member (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama TEXT NOT NULL,
            isi_komentar TEXT NOT NULL,
            kategori TEXT DEFAULT 'Umum',
            waktu DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)
        conn.commit()
        print(f"✅ Database SQLite '{db_path}' siap!")
        return conn
    except Exception as e:
        print(f"⚠️ Gagal menginisialisasi database: {e}")
        return None

def tambah_komentar(conn: sqlite3.Connection, nama: str, isi: str, kategori: str = "Umum"):
    if conn is None:
        print("⚠️ Tidak ada koneksi database. Komentar tidak disimpan.")
        return
    waktu_sekarang = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        sql = "INSERT INTO komentar_member (nama, isi_komentar, kategori, waktu) VALUES (?, ?, ?, ?)"
        conn.execute(sql, (nama, isi, kategori, waktu_sekarang))
        conn.commit()
        print(f"💾 [Log] Komentar dari '{nama}' berhasil disimpan!")
    except Exception as err:
        print(f"❌ Gagal menyimpan komentar: {err}")

if __name__ == "__main__":
    # Behavior backward-compatible: CLI mode
    conn = inisialisasi_db()
    print("\n===========================================")
    print("      LOG KOMENTAR MEMBER INDRAMAYU CLUB    ")
    print("===========================================\n")
    member_name = input("Masukkan nama member: ").strip() or "Member Anonim"
    kategori = input("Kategori (Umum/Pertanyaan/Feedback/Laporan) [Umum]: ").strip() or "Umum"
    komentar = input("Tulis komentar/pertanyaan: ").strip()
    if komentar:
        tambah_komentar(conn, member_name, komentar, kategori)
        # Use alwi ⛑️ as the bot name in CLI feedback
        print(f"\n[alwi ⛑️]: Halo Kang {member_name}, komentar Anda telah dicatat!")
        print(f"[alwi ⛑️]: Pesan '{komentar}' sedang diproses...")
    else:
        print("⚠️ Komentar tidak boleh kosong.")
    if conn:
        conn.close()
