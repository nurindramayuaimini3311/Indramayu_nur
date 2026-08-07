from flask import Flask, jsonify, request, g, send_from_directory, render_template_string
import sqlite3, os, random, smtplib, threading
from datetime import datetime
from pathlib import Path
from email.mime.text import MIMEText

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "indramayu_club.db"
app = Flask(__name__, static_folder=".", static_url_path="")
app.secret_key = "alwi-jawa-cs-final"

# EMAIL BARU BOS
EMAIL_FROM = "alwi.Indramayuclub@gmail.com"
EMAIL_TO = "dkohar011@gmail.com" # email kamu yang terima
APP_PASS = "girmzfhhxhhaqafn" # GANTI dengan app password alwi.Indramayuclub@gmail.com

KAMUS = {"isun":{"indonesia":"saya","kategori":"Kata Ganti","contoh":"Isun arep dolan"},"sira":{"indonesia":"kamu","kategori":"Kata Ganti","contoh":"Sira lagi apa?"},"batur":{"indonesia":"teman","kategori":"Umum","contoh":"Batur isun akeh"},"priben":{"indonesia":"bagaimana","kategori":"Tanya","contoh":"Priben kabare?"},"pisan":{"indonesia":"sangat","kategori":"Partikel","contoh":"Enak pisan"},"dolan":{"indonesia":"main","kategori":"Kerja","contoh":"Ayo dolan"},"bagea":{"indonesia":"bagus","kategori":"Sifat","contoh":"Bagea temen"}}

def init_db():
    conn=sqlite3.connect(str(DB_PATH));cur=conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS alwi_antologi (id INTEGER PRIMARY KEY, kata TEXT, arti TEXT, kategori TEXT, waktu TEXT, halaman TEXT, user TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS alwi_log (id INTEGER PRIMARY KEY, aksi TEXT, detail TEXT, waktu TEXT, halaman TEXT)")
    conn.commit();conn.close()
init_db()
def get_db():
    if "db" not in g:
        g.db=sqlite3.connect(str(DB_PATH));g.db.row_factory=sqlite3.Row
    return g.db
@app.teardown_appcontext
def close_db(e=None):
    db=g.pop("db",None)
    if db: db.close()
def kirim_email_async(subj, body):
    def _k():
        try:
            msg=MIMEText(body);msg['Subject']=subj;msg['From']=EMAIL_FROM;msg['To']=EMAIL_TO
            s=smtplib.SMTP('smtp.gmail.com',587);s.starttls();s.login(EMAIL_FROM,APP_PASS);s.send_message(msg);s.quit()
            print(f"📧 Email terkirim dari {EMAIL_FROM} -> {EMAIL_TO}: {subj}")
        except Exception as e: print(f"❌ Email gagal: {e}")
    threading.Thread(target=_k,daemon=True).start()

@app.route("/api/member/tanya",methods=["POST"])
def tanya():
    data=request.get_json() or {};pesan=data.get("pesan","")[:500];halaman=data.get("halaman","")[:100]
    waktu=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db=get_db();db.execute("INSERT INTO alwi_log (aksi,detail,waktu,halaman) VALUES (?,?,?,?)",("tanya_member",pesan,waktu,halaman));db.commit()
    kirim_email_async(f"💬 TANYA MEMBER JAWA - {halaman} - {pesan[:30]}", f"Ada member tanya Bos!\n\nPesan: {pesan}\nHalaman: {halaman}\nWaktu: {waktu}\nIP: {request.remote_addr}\n\nJawab via WA/FB ya!\n\n-- Alwi CS Jawa {EMAIL_FROM}")
    return jsonify({"status":"ok"})

@app.route("/api/kamus/acak")
def acak():
    halaman=request.args.get("halaman","?");k=random.choice(list(KAMUS.keys()));v=KAMUS[k]
    db=get_db();db.execute("INSERT INTO alwi_antologi VALUES (NULL,?,?,?,?,?,?)",(k,v["indonesia"],v["kategori"],datetime.now().strftime("%H:%M:%S"),halaman,"web"));db.commit()
    total=db.execute("SELECT COUNT(*) FROM alwi_antologi").fetchone()[0]
    if total%5==0: kirim_email_async(f"ALWI LVL {total//5} - {k}={v['indonesia']}", f"Alwi baca {total} kata: {k}={v['indonesia']} di {halaman}")
    return jsonify({"kata":k,"indonesia":v["indonesia"],"kategori":v["kategori"],"contoh":v["contoh"]})

@app.route("/")
def root(): return send_from_directory(".", "index.html")
@app.route("/<path:fp>")
def serve(fp):
    full=BASE_DIR/fp
    if full.is_file(): return send_from_directory(".", fp)
    if full.is_dir() and (full/"index.html").exists(): return send_from_directory(str(full), "index.html")
    return send_from_directory(".", "index.html")

if __name__=="__main__":
    print(f"🚀 ALWI CS JAWA - {EMAIL_FROM} -> {EMAIL_TO}")
    app.run(host="0.0.0.0",port=5000,debug=True)
