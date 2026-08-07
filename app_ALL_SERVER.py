"""
ALWI PUSAT SERVER - ALL IN ONE
Semua project ~/hugoNUR8/ jadi Server Alwi
Fitur: Kata Acak -> Alwi Makin Pintar (Antologi)
"""
from flask import Flask, jsonify, request, g, send_from_directory, redirect
import sqlite3
from datetime import datetime
from pathlib import Path
import random
import json
import os

DB_PATH = Path("indramayu_club.db")
BASE_DIR = Path(__file__).parent

app = Flask(__name__, static_folder=".", static_url_path="")
app.secret_key = "alwi-pusat-server-2026"

# === KAMUS BESAR INDRAMAYU - UNTUK KATA ACAK ===
KAMUS = {
"isun": {"indonesia": "saya", "kategori": "Kata Ganti", "contoh": "Isun arep lunga"},
"sira": {"indonesia": "kamu", "kategori": "Kata Ganti", "contoh": "Sira lagi apa?"},
"kula": {"indonesia": "saya (halus)", "kategori": "Kata Ganti", "contoh": "Kula nyuwun pangapura"},
"priben": {"indonesia": "bagaimana", "kategori": "Kata Tanya", "contoh": "Priben kabare?"},
"nang": {"indonesia": "di", "kategori": "Penunjuk", "contoh": "Nang endi?"},
"batur": {"indonesia": "teman", "kategori": "Umum", "contoh": "Batur isun akeh"},
"dolan": {"indonesia": "main", "kategori": "Kata Kerja", "contoh": "Ayo dolan bareng"},
"enak": {"indonesia": "enak", "kategori": "Kata Sifat", "contoh": "Enak pisan"},
"bagea": {"indonesia": "bagus", "kategori": "Kata Sifat", "contoh": "Bagea temen"},
"pisan": {"indonesia": "sangat", "kategori": "Partikel", "contoh": "Enak pisan!"},
"sugeng": {"indonesia": "selamat", "kategori": "Umum", "contoh": "Sugeng enjing"},
"enjing": {"indonesia": "pagi", "kategori": "Waktu", "contoh": "Sugeng enjing"},
"ndalu": {"indonesia": "malam", "kategori": "Waktu", "contoh": "Sugeng ndalu"},
"arep": {"indonesia": "akan", "kategori": "Kata Kerja", "contoh": "Arep lunga"},
"lunga": {"indonesia": "pergi", "kategori": "Kata Kerja", "contoh": "Lunga endi?"},
"mangan": {"indonesia": "makan", "kategori": "Kata Kerja", "contoh": "Mangan bareng"},
"banyu": {"indonesia": "air", "kategori": "Umum", "contoh": "Banyu mili"},
"geni": {"indonesia": "api", "kategori": "Umum", "contoh": "Ati kaya geni"},
"angin": {"indonesia": "angin", "kategori": "Umum", "contoh": "Angin sore"},
"srengenge": {"indonesia": "matahari", "kategori": "Umum", "contoh": "Srengenge padang"},
"rembulan": {"indonesia": "bulan", "kategori": "Umum", "contoh": "Rembulan bengi"},
"lintang": {"indonesia": "bintang", "kategori": "Umum", "contoh": "Lintang akeh"},
"bumi": {"indonesia": "bumi", "kategori": "Umum", "contoh": "Bumi Indramayu"},
}

def init_db():
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS komentar_member (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT, isi_komentar TEXT, kategori TEXT, waktu TEXT,
        halaman TEXT, ip TEXT
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS alwi_antologi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kata TEXT, arti TEXT, kategori TEXT, waktu TEXT,
        halaman TEXT, user TEXT
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS alwi_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aksi TEXT, detail TEXT, waktu TEXT, halaman TEXT
    )""")
    conn.commit()
    conn.close()

init_db()

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(str(DB_PATH))
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def log_aksi(aksi, detail, halaman=""):
    try:
        db = get_db()
        db.execute("INSERT INTO alwi_log (aksi, detail, waktu, halaman) VALUES (?,?,?,?)",
                   (aksi, detail, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), halaman))
        db.commit()
    except:
        pass

# === SERVE STATIC - SEMUA FOLDER JADI SERVER ===
@app.route("/")
def root():
    return send_from_directory(".", "index.html")

@app.route("/<path:filepath>")
def serve_all(filepath):
    # Kalau file ada, serve
    full = BASE_DIR / filepath
    if full.is_file():
        return send_from_directory(".", filepath)
    # Kalau folder ada index.html
    if full.is_dir():
        index = full / "index.html"
        if index.exists():
            return send_from_directory(str(full), "index.html")
    # Fallback
    return send_from_directory(".", "index.html")

# === API KATA ACAK - INTI SERVER ALWI PINTAR ===
@app.route("/api/kamus/acak")
def api_acak():
    halaman = request.args.get("halaman", "unknown")
    user = request.args.get("user", "anon")
    kata = random.choice(list(KAMUS.keys()))
    data = KAMUS[kata]
    
    db = get_db()
    waktu = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db.execute("INSERT INTO alwi_antologi (kata, arti, kategori, waktu, halaman, user) VALUES (?,?,?,?,?,?)",
               (kata, data["indonesia"], data.get("kategori","Umum"), waktu, halaman, user))
    db.commit()
    total = db.execute("SELECT COUNT(*) FROM alwi_antologi").fetchone()[0]
    
    log_aksi("kata_acak", f"{kata}={data['indonesia']}", halaman)
    
    return jsonify({
        "status": "ketemu",
        "kata": kata,
        "indonesia": data["indonesia"],
        "kategori": data.get("kategori","Umum"),
        "contoh": data.get("contoh", f"{kata} artinya {data['indonesia']}"),
        "alwi_pinter_level": total,
        "level": f"Lv {total//5}",
        "level_nama": "Pemula" if total<25 else "Pintar" if total<100 else "Suhu" if total<300 else "Maha Guru Indramayu!",
        "antologi": f"Alwi udah baca {total} kata dari {halaman}",
        "waktu": datetime.now().strftime("%H:%M:%S"),
        "halaman": halaman
    })

@app.route("/api/kamus/cari/<kata>")
def api_cari(kata):
    kata = kata.lower().strip()
    if kata in KAMUS:
        return jsonify({"status":"ketemu","kata":kata,**KAMUS[kata]})
    mirip = [{"kata":k,"indonesia":v["indonesia"]} for k,v in KAMUS.items() if kata in k or k in kata][:8]
    if mirip:
        return jsonify({"status":"mirip","kata":kata,"hasil":mirip})
    return jsonify({"status":"tidak_ada","kata":kata})

@app.route("/api/kamus/semua")
def api_semua():
    db = get_db()
    total_baca = db.execute("SELECT COUNT(*) FROM alwi_antologi").fetchone()[0]
    return jsonify({"total_kamus": len(KAMUS), "total_alwi_baca": total_baca, "kamus": KAMUS})

# === API ANTOLOGI ALWI ===
@app.route("/api/alwi/antologi")
def api_antologi():
    db = get_db()
    rows = db.execute("SELECT kata, arti, kategori, waktu, halaman FROM alwi_antologi ORDER BY id DESC LIMIT 30").fetchall()
    total = db.execute("SELECT COUNT(*) FROM alwi_antologi").fetchone()[0]
    per_halaman = db.execute("SELECT halaman, COUNT(*) as c FROM alwi_antologi GROUP BY halaman ORDER BY c DESC").fetchall()
    
    return jsonify({
        "total_baca": total,
        "level": f"Level {total//5} - {'Pemula' if total<25 else 'Pintar' if total<100 else 'Suhu' if total<300 else 'Maha Guru'}",
        "kata_terakhir": [dict(r) for r in rows],
        "per_halaman": [dict(r) for r in per_halaman],
        "pesan": f"Alwi makin pintar! Udah baca {total} kata dari semua halaman project"
    })

@app.route("/api/alwi/status")
def api_status():
    db = get_db()
    total_komen = db.execute("SELECT COUNT(*) FROM komentar_member").fetchone()[0]
    total_antologi = db.execute("SELECT COUNT(*) FROM alwi_antologi").fetchone()[0]
    total_log = db.execute("SELECT COUNT(*) FROM alwi_log").fetchone()[0]
    
    # Hitung file project
    total_files = len(list(BASE_DIR.rglob("*.html")))
    
    return jsonify({
        "server": "ALWI PUSAT SERVER - ALL PROJECT",
        "status": "Aktif ✅",
        "project": str(BASE_DIR),
        "total_html": total_files,
        "total_komentar": total_komen,
        "total_antologi": total_antologi,
        "total_aksi": total_log,
        "level_alwi": f"Lv {total_antologi//5} - {'Pemula' if total_antologi<25 else 'Pintar' if total_antologi<100 else 'Suhu' if total_antologi<300 else 'Maha Guru'}",
        "fitur": ["Kata Acak", "Antologi", "Komentar Global", "Log Aktivitas", "Serve All Folders"],
        "folders": ["android","konten","netflix","peta","pencuri","kamera-hantu","kuis"],
        "waktu": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

# === API KOMENTAR GLOBAL - SEMUA HALAMAN BISA KOMEN ===
@app.route("/api/komentar", methods=["GET"])
def api_get_komen():
    halaman = request.args.get("halaman", "")
    db = get_db()
    if halaman:
        rows = db.execute("SELECT * FROM komentar_member WHERE halaman LIKE ? ORDER BY id DESC LIMIT 50", (f"%{halaman}%",)).fetchall()
    else:
        rows = db.execute("SELECT * FROM komentar_member ORDER BY id DESC LIMIT 50").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/komentar", methods=["POST"])
def api_post_komen():
    data = request.get_json() or request.form
    nama = data.get("nama","Anonim")[:30]
    isi = data.get("teks") or data.get("isi_komentar") or data.get("komentar") or ""
    if not isi.strip():
        return jsonify({"error":"Komentar kosong"}),400
    kategori = data.get("kategori","Umum")
    halaman = data.get("halaman","/")[:100]
    ip = request.remote_addr
    
    db = get_db()
    waktu = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db.execute("INSERT INTO komentar_member (nama, isi_komentar, kategori, waktu, halaman, ip) VALUES (?,?,?,?,?,?)",
               (nama, isi, kategori, waktu, halaman, ip))
    db.commit()
    
    # Alwi juga belajar dari komentar
    db.execute("INSERT INTO alwi_antologi (kata, arti, kategori, waktu, halaman, user) VALUES (?,?,?,?,?,?)",
               (f"komen:{nama}", isi[:40], "Komentar", waktu, halaman, nama))
    db.commit()
    
    log_aksi("komentar", f"{nama}: {isi[:30]}", halaman)
    
    return jsonify({"status":"ok","nama":nama,"waktu":waktu,"poin":"+5","halaman":halaman})

# === API LOG ===
@app.route("/api/log")
def api_log():
    db = get_db()
    rows = db.execute("SELECT * FROM alwi_log ORDER BY id DESC LIMIT 50").fetchall()
    return jsonify([dict(r) for r in rows])

if __name__ == "__main__":
    print("="*60)
    print("🚀 ALWI PUSAT SERVER - SEMUA PROJECT JADI SERVER!")
    print("="*60)
    print(f"📁 Project: {BASE_DIR}")
    print(f"🗄️  DB: {DB_PATH}")
    print(f"📊 HTML files: {len(list(BASE_DIR.rglob('*.html')))}")
    print()
    print("🌐 URL:")
    print("  http://localhost:5000/                    -> ALWI PUSAT")
    print("  http://localhost:5000/android/           -> Android Panel")
    print("  http://localhost:5000/android/kamus.html  -> Kamus Acak Only")
    print("  http://localhost:5000/konten/komentar.html -> Komentar Global")
    print("  http://localhost:5000/netflix/            -> NurFlix")
    print("  http://localhost:5000/peta/              -> Peta")
    print("  http://localhost:5000/pencuri/            -> Pencuri")
    print("  http://localhost:5000/kamera-hantu/       -> Kamera Hantu")
    print("  http://localhost:5000/kuis/               -> Kuis")
    print()
    print("🧠 API Alwi Pintar (Kata Acak):")
    print("  http://localhost:5000/api/kamus/acak?halaman=netflix")
    print("  http://localhost:5000/api/alwi/antologi")
    print("  http://localhost:5000/api/alwi/status")
    print("  http://localhost:5000/api/komentar?halaman=android")
    print("="*60)
    print("Setiap halaman yang pakai /api/kamus/acak -> Alwi makin pintar!")
    print("Semua project sekarang 1 server!")
    print("="*60)
    app.run(host='0.0.0.0', port=5000, debug=True)

