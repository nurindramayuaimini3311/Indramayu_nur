from flask import Flask, jsonify, request, send_from_directory, render_template_string
import os, sqlite3, random, datetime, smtplib, threading
from email.mime.text import MIMEText

app = Flask(__name__, static_folder='.', static_url_path='')
BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, 'indramayu_club.db')

EMAIL_FROM = "dkohar011@gmail.com"
EMAIL_TO = "dkohar011@gmail.com"
APP_PASS = "girmzfhhxhhaqafn"

KAMUS = {
"isun":{"indonesia":"saya","kategori":"Kata Ganti","contoh":"Isun arep lunga pasar"},
"sira":{"indonesia":"kamu","kategori":"Kata Ganti","contoh":"Sira lagi apa batur?"},
"kula":{"indonesia":"saya (halus)","kategori":"Kata Ganti","contoh":"Kula nyuwun pangapura"},
"priben":{"indonesia":"bagaimana","kategori":"Kata Tanya","contoh":"Priben kabare batur?"},
"nang":{"indonesia":"di","kategori":"Penunjuk","contoh":"Nang endi sira?"},
"batur":{"indonesia":"teman","kategori":"Umum","contoh":"Batur isun akeh pisan"},
"dolan":{"indonesia":"main","kategori":"Kata Kerja","contoh":"Ayo dolan bareng nang alun-alun"},
"enak":{"indonesia":"enak","kategori":"Kata Sifat","contoh":"Enak pisan rasane sego"},
"bagea":{"indonesia":"bagus","kategori":"Kata Sifat","contoh":"Bagea temen klambine"},
"pisan":{"indonesia":"sangat","kategori":"Partikel","contoh":"Enak pisan!"},
"sugeng":{"indonesia":"selamat","kategori":"Umum","contoh":"Sugeng enjing sedulur"},
"enjing":{"indonesia":"pagi","kategori":"Waktu","contoh":"Sugeng enjing"},
"ndalu":{"indonesia":"malam","kategori":"Waktu","contoh":"Sugeng ndalu batur"},
"arep":{"indonesia":"akan / mau","kategori":"Kata Kerja","contoh":"Isun arep lunga"},
"lunga":{"indonesia":"pergi","kategori":"Kata Kerja","contoh":"Arep lunga endi?"},
"mangan":{"indonesia":"makan","kategori":"Kata Kerja","contoh":"Ayo mangan bareng"},
"banyu":{"indonesia":"air","kategori":"Umum","contoh":"Banyu mili terus"},
"geni":{"indonesia":"api","kategori":"Umum","contoh":"Ati kaya geni"},
"srengenge":{"indonesia":"matahari","kategori":"Umum","contoh":"Srengenge padang"},
"rembulan":{"indonesia":"bulan","kategori":"Umum","contoh":"Rembulan bengi"},
"sega":{"indonesia":"nasi","kategori":"Umum","contoh":"Sega goreng enak"},
"klambi":{"indonesia":"baju","kategori":"Umum","contoh":"Klambine bagea"},
"umah":{"indonesia":"rumah","kategori":"Umum","contoh":"Umah isun gede"},
"dalane":{"indonesia":"jalannya","kategori":"Umum","contoh":"Dalane alus"},
"wong":{"indonesia":"orang","kategori":"Umum","contoh":"Wong Indramayu"},
}

def init_db():
    con=sqlite3.connect(DB); cur=con.cursor()
    cur.execute('CREATE TABLE IF NOT EXISTS alwi_antologi (id INTEGER PRIMARY KEY AUTOINCREMENT, kata TEXT, indonesia TEXT, halaman TEXT, waktu TEXT, level INTEGER)')
    con.commit(); con.close()

def kirim_email_async(subject, body):
    def _kirim():
        try:
            msg = MIMEText(body)
            msg['Subject'] = subject
            msg['From'] = EMAIL_FROM
            msg['To'] = EMAIL_TO
            s = smtplib.SMTP('smtp.gmail.com', 587)
            s.starttls()
            s.login(EMAIL_FROM, APP_PASS)
            s.send_message(msg)
            s.quit()
            print(f"📧 Email terkirim: {subject}")
        except Exception as e:
            print(f"❌ Email gagal: {e}")
    threading.Thread(target=_kirim, daemon=True).start()

def catat(kata, arti, halaman):
    init_db()
    con=sqlite3.connect(DB); cur=con.cursor()
    cur.execute('SELECT COUNT(*) FROM alwi_antologi')
    total=cur.fetchone()[0] or 0
    cur.execute('INSERT INTO alwi_antologi VALUES (NULL,?,?,?,?,?)', (kata, arti, halaman, datetime.datetime.now().strftime('%H:%M:%S'), total+1))
    con.commit(); con.close()
    if (total+1) % 5 == 0:
        kirim_email_async(f"ALWI LVL {(total+1)//5} - {kata} = {arti}", f"Alwi baru baca:\n\n{kata} = {arti}\nHalaman: {halaman}\nTotal baca: {total+1} kata\nLevel: Lv {(total+1)//5}\n\nWaktu: {datetime.datetime.now()}\n\nServer: ~/hugoNUR8/ - 105 HTML\nKamus PY: http://localhost:5000/kamus-py\nEmail: {EMAIL_TO}")
    return total+1

def level_nama(lv):
    levels=["Pemula","Pintar","Suhu","Maha Guru","Dewa"]
    return levels[min(lv//10,4)]

HTML_PAGE = """
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>KAMUS PY + EMAIL - ALWI</title>
<style>body{background:#0d0d0d;color:#e8d5a0;font-family:Arial;margin:0}header{background:#1a1408;border-bottom:3px solid #c9a84c;padding:16px;text-align:center}h1{color:#FFD700}.kartu{background:#1e1608;border:2px solid #3a2c0a;border-radius:16px;padding:18px;margin:12px;max-width:600px;margin-left:auto;margin-right:auto}.btn{width:100%;background:linear-gradient(135deg,#7a5c1e,#c9a84c);color:#000;border:none;padding:20px;border-radius:14px;font-size:22px;font-weight:900;cursor:pointer}.kata{font-size:44px;color:#FFD700;text-align:center;font-weight:900}.arti{font-size:24px;text-align:center;color:#fff}.bubble{position:fixed;bottom:20px;right:20px;width:70px;height:70px;border-radius:50%;background:radial-gradient(circle,#FFD700,#c9a84c);display:flex;align-items:center;justify-content:center;font-size:36px;z-index:9999;box-shadow:0 0 0 3px #FFD700;animation:pulse 2s infinite;text-decoration:none}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}</style></head><body>
<header><h1>🎲 KAMUS PY + EMAIL OK ✅</h1><div style="font-size:11px;color:#9a8050">{{total}} kata • Total baca: {{total_baca}} • Lv{{level}} • {{email}}</div></header>
<div style="max-width:600px;margin:0 auto;padding:12px">
<div class="kartu" style="text-align:center"><form method="GET"><input type="hidden" name="halaman" value="{{halaman}}"><button name="acak" value="1" class="btn">🎲 KATA ACAK (PY + EMAIL)</button></form><div style="font-size:11px;color:#9a8050;margin-top:8px">Tiap 5 kata → Auto email ke {{email}} 📧</div></div>
{% if kata %}
<div class="kartu" style="text-align:center;border-color:#FFD700;box-shadow:0 0 20px rgba(255,215,0,.15)"><div style="font-size:10px;color:#9a8050">{{kategori}}</div><div class="kata">{{kata}}</div><div class="arti">= {{arti}}</div><div style="background:rgba(201,168,76,.1);border-left:4px solid #c9a84c;padding:10px;border-radius:8px;margin-top:10px;font-style:italic">💬 "{{contoh}}"</div><div style="margin-top:10px;font-size:11px;color:#9a8050">Alwi baca {{total_baca}} kata • {{waktu}} • {{level_nama}}</div></div>
{% endif %}
<div class="kartu"><div style="font-size:11px;color:#9a8050">🕐 10 TERAKHIR (DB)</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">{{history|safe}}</div></div>
<div class="kartu" style="background:#111;border-color:#222"><div style="font-size:11px;color:#9a8050">📧 EMAIL LOG - {{email}} OK ✅</div><div style="font-family:monospace;font-size:11px;color:#aaa;margin-top:6px">Status: Aktif<br>Trigger: Tiap 5 kata<br>Server: ALWI PY GAK PUTUS<br>Bubble: ⛑️ di kanan bawah</div></div>
</div><a href="/kamus-py?acak=1&halaman={{halaman}}" class="bubble">⛑️</a><script src="/alwi_bubble_v4_MENU.js"></script></body></html>
"""

@app.route('/kamus-py')
def kamus_py():
    init_db()
    halaman=request.args.get('halaman','kamus-py')
    acak=request.args.get('acak')
    kd=None
    if acak:
        k=random.choice(list(KAMUS.keys()))
        v=KAMUS[k]
        total=catat(k,v['indonesia'],halaman)
        kd={'kata':k,'arti':v['indonesia'],'kategori':v['kategori'],'contoh':v['contoh'],'total':total,'halaman':halaman,'waktu':datetime.datetime.now().strftime('%H:%M:%S'),'level_nama':level_nama(total//5)}
    con=sqlite3.connect(DB); cur=con.cursor()
    cur.execute('SELECT COUNT(*) FROM alwi_antologi'); total_baca=cur.fetchone()[0] or 0
    cur.execute('SELECT kata,indonesia FROM alwi_antologi ORDER BY id DESC LIMIT 10'); hist=cur.fetchall()
    con.close()
    hist_html="".join([f"<span style='background:#222;border:1px solid #c9a84c;color:#FFD700;padding:4px 10px;border-radius:20px;font-size:11px'>{h[0]}={h[1]}</span>" for h in hist]) or "<span style='color:#666'>Belum ada</span>"
    return render_template_string(HTML_PAGE, total=len(KAMUS), total_baca=total_baca, level=total_baca//5, level_nama=level_nama(total_baca//5), halaman=halaman, email=EMAIL_TO, kata=kd['kata'] if kd else None, arti=kd['arti'] if kd else None, kategori=kd['kategori'] if kd else None, contoh=kd['contoh'] if kd else None, waktu=kd['waktu'] if kd else None, history=hist_html)

@app.route('/api/kamus/acak')
def api_acak():
    halaman=request.args.get('halaman','?')
    k=random.choice(list(KAMUS.keys())); v=KAMUS[k]; total=catat(k,v['indonesia'],halaman)
    return jsonify({"status":"ketemu","kata":k,"indonesia":v['indonesia'],"kategori":v['kategori'],"contoh":v['contoh'],"halaman":halaman,"alwi_pinter_level":total,"antologi":f"Alwi baca {total} kata","waktu":datetime.datetime.now().strftime('%H:%M:%S'),"level_nama":level_nama(total//5)})

@app.route('/api/alwi/status')
def api_status():
    con=sqlite3.connect(DB)
    try:
        cur=con.cursor(); cur.execute('SELECT COUNT(*) FROM alwi_antologi'); t=cur.fetchone()[0] or 0
    except:
        t=0
    finally:
        con.close()
    return jsonify({"server":"ALWI PY + EMAIL OK","email":EMAIL_TO,"status":"Aktif","total_antologi":t,"level":f"Lv{t//5}"})

@app.route('/')
def root():
    return send_from_directory(BASE,'index.html')

@app.route('/<path:p>')
def serve(p):
    fp=os.path.join(BASE,p)
    if os.path.isfile(fp):
        return send_from_directory(BASE,p)
    if os.path.isdir(fp):
        idx=os.path.join(fp,'index.html')
        if os.path.isfile(idx):
            return send_from_directory(fp,'index.html')
    return "404 "+p,404

if __name__=='__main__':
    init_db()
    print("="*60)
    print("🚀 ALWI PY + EMAIL OK!")
    print(f"📧 {EMAIL_FROM} -> {EMAIL_TO}")
    print("🌐 http://localhost:5000/kamus-py")
    print("="*60)
    app.run(host='0.0.0.0',port=5000,debug=True)


@app.route('/api/member/bantuan', methods=['POST'])
def member_bantuan():
    data=request.get_json() or {}
    pesan=data.get('pesan','Butuh bantuan')
    halaman=data.get('halaman','?')
    # kirim email
    try:
        from email.mime.text import MIMEText
        import smtplib
        EMAIL_FROM="dkohar011@gmail.com"
        EMAIL_TO="dkohar011@gmail.com"
        APP_PASS="girmzfhhxhhaqafn"
        body=f"""🚨 MEMBER BUTUH BANTUAN!

Pesan: {pesan}
Halaman: {halaman}
Waktu: {data.get('waktu','')}
IP: {request.remote_addr}

Server: ~/hugoNUR8
"""
        msg=MIMEText(body)
        msg['Subject']=f"🚨 MEMBER BUTUH: {pesan[:30]}"
        msg['From']=EMAIL_FROM
        msg['To']=EMAIL_TO
        s=smtplib.SMTP('smtp.gmail.com',587)
        s.starttls()
        s.login(EMAIL_FROM,APP_PASS)
        s.send_message(msg)
        s.quit()
    except Exception as e:
        print(e)
    return jsonify({"status":"ok","pesan":"Terkirim"})
