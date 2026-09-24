#!/usr/bin/env python3
"""
webhook_notify.py — Pendengar notifikasi pembayaran Virtual Account (BRI SNAP).

Alur:
  BRI kirim notifikasi ke URL ini setelah VA dibayar / status berubah.
  Kita verifikasi tanda tangan (X-SIGNATURE, HMAC-SHA512) → simpan log → balas 200.

Cara pakai (di VM1 / server online):
    python3 webhook_notify.py                    # port 5000, semua interface
    python3 webhook_notify.py 5001               # port lain

Test lokal:
    python3 webhook_notify.py 5000 &
    python3 -c "<contoh kirim notifikasi>"       # lihat test_api.py / README

Butuh env (dari config/.env):
    BRI_CLIENT_SECRET  -> untuk verifikasi HMAC-SHA512 X-SIGNATURE
    BRI_PARTNER_ID     -> (opsional) X-PARTNER-ID di header balasan
"""

import os, sys, json, hmac, hashlib, base64, time
from datetime import datetime
from urllib.parse import urlparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))

def load_dotenv(path):
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

load_dotenv(os.path.join(HERE, "config", ".env"))
load_dotenv(os.path.join(HERE, ".env"))

SECRET = os.environ.get("BRI_CLIENT_SECRET", "")
PARTNER_ID = os.environ.get("BRI_PARTNER_ID", os.environ.get("BRI_CLIENT_ID", ""))

LOG_DIR = os.path.join(HERE, "webhook_logs")
if not os.path.isdir(LOG_DIR):
    os.makedirs(LOG_DIR, exist_ok=True)


def log_file():
    return os.path.join(LOG_DIR, time.strftime("%Y-%m-%d") + ".jsonl")


def verify_signature(headers, raw_body):
    sig = headers.get("X-SIGNATURE") or headers.get("x-signature") or ""
    ts = headers.get("X-TIMESTAMP") or headers.get("x-timestamp") or headers.get("BRI-Timestamp") or ""
    if not sig or not SECRET:
        return True  # tanpa secret -> jangan tolak (mode debug)
    # format umum SNAP: stringToSign = timestamp:method:path:token:bodyhash:...
    # di sini verifikasi HMAC atas (ts + ":" + bodyhash) dengan secret
    body_sha = hashlib.sha256(raw_body).hexdigest().lower()
    candidate = hmac.new(SECRET.encode(), f"{ts}:{body_sha}".encode(), hashlib.sha512).digest()
    expect = base64.b64encode(candidate).decode()
    return hmac.compare_digest(expect, sig)


class Handler(BaseHTTPRequestHandler):
    def _reply(self, code, obj):
        data = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in ("/", "/health", "/status"):
            return self._reply(200, {"ok": True, "service": "webhook_notify BRI VA",
                                     "secret_loaded": bool(SECRET)})
        self._reply(404, {"ok": False, "error": "not found"})

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
            raw = self.rfile.read(length) if length else b""
            body = {}
            if raw:
                try:
                    body = json.loads(raw)
                except ValueError:
                    body = {"raw": raw.decode("utf-8", "replace")}
        except Exception as e:
            self._reply(400, {"ok": False, "error": f"read: {e}"})
            return

        ok = verify_signature(dict(self.headers), raw)
        record = {
            "ts": datetime.now().astimezone().isoformat(),
            "path": self.path,
            "headers": {k: v for k, v in self.headers.items()
                        if k.lower().startswith("x-") or k.lower() == "authorization"},
            "body": body,
            "signature_ok": ok,
        }
        with open(log_file(), "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
        sys.stderr.write("WEBHOOK GOT: %s\n" % record["ts"])

        # balasan format khas BRI VA: {"status":"000","message":"Success"}
        if not ok:
            self._reply(401, {"ok": False, "error": "signature invalid"})
            return
        self._reply(200, {"status": "000", "message": "Success"})


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"webhook notify : http://0.0.0.0:{port}")
    print(f"log folder     : {LOG_DIR}")
    print(f"secret loaded  : {'ya' if SECRET else 'tidak (mode debug)'}")
    print(f"partner id     : {PARTNER_ID}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nberhenti.")


if __name__ == "__main__":
    main()