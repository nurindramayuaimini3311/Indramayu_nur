from flask import Flask, send_from_directory, request, jsonify
from pathlib import Path
BASE_DIR=Path(__file__).parent
app=Flask(__name__, static_folder=".", static_url_path="")

# === TAMBAHAN UNTUK KARTU MEMBER & LANGGANAN ===
# Simpan data langganan sederhana (nanti bisa ganti pakai file JSON / DB)
MEMBER_DB = {} # contoh: {"IMC-001": {"nama":"Abdul Kohar","status":"aktif"}}

@app.route("/")
def r(): return send_from_directory(".", "index.html")

# Route khusus kartu member biar /kartu bisa diakses
@app.route("/kartu")
def kartu():
    # bisa cek ?id=IMC-001
    # kalau ada templates/kartu_member.html
    if (BASE_DIR/"static"/"kartu_member.html").exists():
        return send_from_directory("static", "kartu_member.html")
    if (BASE_DIR/"templates"/"kartu_member.html").exists():
        return send_from_directory("templates", "kartu_member.html")
    return send_from_directory("static", "kartu_member.html")

@app.route("/api/cek-member")
def cek_member():
    id_member = request.args.get('id','')
    # cek di localStorage + di server (contoh)
    return jsonify({"id":id_member,"status":"aktif","nama":"Member IMC","wa_admin":"6282147573665"})

@app.route("/api/langganan-wa")
def langganan_wa():
    # redirect ke WA admin dengan format
    wa_admin = "6282147573665"
    nama = request.args.get('nama','Calon Member')
    idm = request.args.get('id','-')
    text = f"Halo Alwi mau langganan%0ANama: {nama}%0AID: {idm}"
    from flask import redirect
    return redirect(f"https://wa.me/{wa_admin}?text={text}")

@app.route("/<path:fp>")
def s(fp):
 full=BASE_DIR/fp
 if full.is_file(): return send_from_directory(".", fp)
 if full.is_dir() and (full/"index.html").exists(): return send_from_directory(str(full), "index.html")
 return send_from_directory(".", "index.html")

if __name__=="__main__":
 print("✅ INDEX ASLI AMAN - PUSAT 4 MENU DI /pusat.html")
 print("✅ BOLA TENDANG AKTIF DI SEMUA HALAMAN")
 print("✅ KARTU MEMBER: /kartu atau /static/kartu_member.html")
 print("✅ LOGIN MEMBER: /konten/login_member.html")
 app.run(host="0.0.0.0",port=5000)

