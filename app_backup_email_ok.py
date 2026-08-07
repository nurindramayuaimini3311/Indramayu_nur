from flask import Flask, jsonify, request, send_from_directory, render_template_string
import os, sqlite3, random, datetime
app = Flask(__name__, static_folder='.', static_url_path='')
BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, 'indramayu_club.db')
KAMUS = {"isun":{"indonesia":"saya","kategori":"Kata Ganti","contoh":"Isun arep lunga pasar"},"sira":{"indonesia":"kamu","kategori":"Kata Ganti","contoh":"Sira lagi apa?"},"kula":{"indonesia":"saya (halus)","kategori":"Kata Ganti","contoh":"Kula nyuwun pangapura"},"priben":{"indonesia":"bagaimana","kategori":"Kata Tanya","contoh":"Priben kabare?"},"batur":{"indonesia":"teman","kategori":"Umum","contoh":"Batur isun akeh"}}
def init_db():
    con=sqlite3.connect(DB); cur=con.cursor()
    cur.execute('CREATE TABLE IF NOT EXISTS alwi_antologi (id INTEGER PRIMARY KEY AUTOINCREMENT, kata TEXT, indonesia TEXT, halaman TEXT, waktu TEXT, level INTEGER)')
    con.commit(); con.close()
def catat(k,a,h):
    init_db(); con=sqlite3.connect(DB); cur=con.cursor(); cur.execute('SELECT COUNT(*) FROM alwi_antologi'); t=cur.fetchone()[0]; cur.execute('INSERT INTO alwi_antologi VALUES (NULL,?,?,?,?,?)',(k,a,h,datetime.datetime.now().strftime('%H:%M:%S'),t+1)); con.commit(); con.close(); return t+1
@app.route('/kamus-py')
def kamus_py():
    init_db(); halaman=request.args.get('halaman','kamus-py'); acak=request.args.get('acak'); kd=None
    if acak:
        k=random.choice(list(KAMUS.keys())); v=KAMUS[k]; total=catat(k,v['indonesia'],halaman)
        kd={'kata':k,'arti':v['indonesia'],'kategori':v['kategori'],'contoh':v['contoh'],'total':total,'halaman':halaman,'waktu':datetime.datetime.now().strftime('%H:%M:%S')}
    con=sqlite3.connect(DB); cur=con.cursor(); cur.execute('SELECT COUNT(*) FROM alwi_antologi'); total_baca=cur.fetchone()[0] or 0; cur.execute('SELECT kata,indonesia FROM alwi_antologi ORDER BY id DESC LIMIT 10'); hist=cur.fetchall(); con.close()
    html=f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KAMUS PY</title><style>body{{background:#0d0d0d;color:#e8d5a0;font-family:Arial;padding:0;margin:0}}header{{background:#1a1408;border-bottom:3px solid #c9a84c;padding:16px;text-align:center}}h1{{color:#FFD700}}.kartu{{background:#1e1608;border:2px solid #3a2c0a;border-radius:16px;padding:18px;margin:12px;max-width:600px;margin-left:auto;margin-right:auto}}.btn{{width:100%;background:linear-gradient(135deg,#7a5c1e,#c9a84c);color:#000;border:none;padding:20px;border-radius:14px;font-size:22px;font-weight:900;cursor:pointer}}.kata{{font-size:44px;color:#FFD700;text-align:center;font-weight:900}}.arti{{font-size:24px;text-align:center;color:#fff}}.bubble{{position:fixed;bottom:20px;right:20px;width:70px;height:70px;border-radius:50%;background:radial-gradient(circle,#FFD700,#c9a84c);display:flex;align-items:center;justify-content:center;font-size:36px;cursor:pointer;z-index:9999;box-shadow:0 0 0 3px #FFD700}} </style></head><body><header><h1>🎲 KAMUS PY - GAK PUTUS</h1><div style="font-size:11px;color:#9a8050">{len(KAMUS)} kata • Total baca: {total_baca} • Lv{total_baca//5}</div></header><div style="max-width:600px;margin:0 auto;padding:12px"><div class="kartu" style="text-align:center"><form method="GET"><input type="hidden" name="halaman" value="{halaman}"><button name="acak" value="1" class="btn">🎲 KATA ACAK (PY)</button></form><div style="font-size:11px;color:#9a8050;margin-top:8px">Python langsung - gak pakai fetch!</div></div>"""
    if kd:
        html+=f"""<div class="kartu" style="text-align:center;border-color:#FFD700"><div style="font-size:10px;color:#9a8050">{kd['kategori']}</div><div class="kata">{kd['kata']}</div><div class="arti">= {kd['arti']}</div><div style="background:rgba(201,168,76,0.1);border-left:4px solid #c9a84c;padding:10px;border-radius:8px;margin-top:10px;font-style:italic">💬 "{kd['contoh']}"</div><div style="margin-top:10px;font-size:11px;color:#9a8050">Alwi baca {kd['total']} kata • {kd['waktu']}</div></div>"""
    html+=f"""<div class="kartu"><div style="font-size:11px;color:#9a8050">HISTORY</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">{"".join([f"<span style='background:#222;border:1px solid #c9a84c;color:#FFD700;padding:4px 10px;border-radius:20px;font-size:11px'>{k[0]}={k[1]}</span>" for k in hist])}</div></div></div><a href="/kamus-py?acak=1&halaman={halaman}" class="bubble">⛑️</a></body></html>"""
    return html
@app.route('/api/kamus/acak')
def api_acak():
    halaman=request.args.get('halaman','?'); k=random.choice(list(KAMUS.keys())); v=KAMUS[k]; total=catat(k,v['indonesia'],halaman)
    return jsonify({"status":"ketemu","kata":k,"indonesia":v['indonesia'],"kategori":v['kategori'],"contoh":v['contoh'],"halaman":halaman,"alwi_pinter_level":total,"antologi":f"Alwi baca {total} kata","waktu":datetime.datetime.now().strftime('%H:%M:%S'),"level_nama":"Pintar"})
@app.route('/api/alwi/status')
def status():
    con=sqlite3.connect(DB);
    try: cur=con.cursor(); cur.execute('SELECT COUNT(*) FROM alwi_antologi'); t=cur.fetchone()[0]
    except: t=0
    finally: con.close()
    return jsonify({"server":"ALWI PY","status":"Aktif ✅","total_html":len([f for _,_,fs in os.walk(BASE) for f in fs if f.endswith('.html')]),"total_antologi":t})
@app.route('/')
def root(): return send_from_directory(BASE,'index.html')
@app.route('/<path:p>')
def serve(p):
    fp=os.path.join(BASE,p)
    if os.path.isfile(fp): return send_from_directory(BASE,p)
    if os.path.isdir(fp):
        for i in ['index.html']:
            if os.path.isfile(os.path.join(fp,i)): return send_from_directory(fp,i)
    return "404",404
if __name__=='__main__':
    init_db(); print("🚀 ALWI PY - GAK PUTUS!"); app.run(host='0.0.0.0',port=5000,debug=True)
