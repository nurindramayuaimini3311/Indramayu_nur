from flask import Flask, send_from_directory
from pathlib import Path
BASE_DIR = Path(__file__).parent
app = Flask(__name__, static_folder=".", static_url_path="")

@app.route("/")
def root(): return send_from_directory(".", "index.html")
@app.route("/<path:fp>")
def serve(fp):
    full=BASE_DIR/fp
    if full.is_file(): return send_from_directory(".", fp)
    if full.is_dir() and (full/"index.html").exists(): return send_from_directory(str(full), "index.html")
    return send_from_directory(".", "index.html")

if __name__=="__main__":
    print("🚀 ALWI WHATSAPP MODE - WA: +62 821-4757-3665")
    print("✅ Bot hanya menu, upgrade via WhatsApp")
    app.run(host="0.0.0.0", port=5000, debug=False)
