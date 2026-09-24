#!/usr/bin/env python3
"""
server_core.py — Backend Dompet IndramayuCLUB (BRI SNAP BI sandbox).

Membaca config/.env (BRI_CLIENT_ID, BRI_CLIENT_SECRET, BRI_PRIVATE_KEY_PATH).
Menyajikan API JSON sederhana via http.server (tanpa flask).

Jalankan:
    python3 server_core.py                 # port 8000
    python3 server_core.py 8080            # port lain
    BRI_CLIENT_ID=... BRI_CLIENT_SECRET=... python3 server_core.py

Endpoint:
    GET  /                  -> status + produk aktif
    GET  /api/me            -> kredensial (samar)
    GET  /api/token         -> ambil access token baru
    POST /api/balance       -> {account_no} cek saldo
    POST /api/statement     -> {account_no,start_date,end_date} mutasi
    POST /api/transfer/va   -> {customer_no,amount,ref} BRIVA payment (demo)
    GET  /api/poin?uid=     -> saldo poin member
    POST /api/poin/sync     -> {uid,poin,name,account_no} sinkron poin
    POST /api/poin/redeem   -> {uid,name,account_no} tukar 1000 poin->Rp10rb ke BRI

Catatan Jujur:
  - Ini SANDbox: tidak memakai uang asli.
  - Path endpoint produk perlu dikonfirmasi dari dokumentasi dashboard BRI.
"""

import os, sys, json, io, base64, time, uuid, sqlite3, hashlib, hmac
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from datetime import datetime, timezone, timedelta

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding

HERE = os.path.dirname(os.path.abspath(__file__))
LOG_DIR = os.path.join(HERE, "webhook_logs")


def read_history(days=7):
    """Baca seluruh webhook_logs/*.jsonl, agregasi amount per hari (naik-turun grafik)."""
    series, raw = {}, []
    now = datetime.now(timezone.utc)
    for i in range(days):
        day = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        path = os.path.join(LOG_DIR, day + ".jsonl")
        if not os.path.isfile(path):
            continue
        try:
            with open(path, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        rec = json.loads(line)
                    except ValueError:
                        continue
                    key = (str(rec.get("ts") or "")[:10]) or day
                    amt = 0.0
                    body = rec.get("body") or {}
                    if isinstance(body, dict):
                        try:
                            amt = float(body.get("amount") or 0)
                        except (TypeError, ValueError):
                            amt = 0.0
                    s = series.setdefault(key, {"t": key, "amount": 0.0, "count": 0})
                    s["amount"] += amt
                    s["count"] += 1
                    raw.append(rec)
        except OSError:
            continue
    keys = sorted(series)
    return {
        "days": days,
        "total_amount": round(sum(series[k]["amount"] for k in keys), 2),
        "total_events": sum(series[k]["count"] for k in keys),
        "series": [series[k] for k in keys],
        "raw": raw[-50:],
    }

HOME_HTML = """<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<title>Dompet IndramayuCLUB — API</title>
<style>
 *{box-sizing:border-box;font-family:system-ui,Arial,sans-serif}
 body{margin:0;background:#0a0a0a;color:#e2e8f0;padding:16px;min-height:100vh}
 .head{border:2px solid #00BFFF;border-radius:14px;padding:14px;background:#0a0a0a;margin-bottom:14px;box-shadow:0 10px 30px rgba(0,191,255,0.3)}
 .head h1{margin:0;color:#00BFFF;font-size:18px;border-bottom:1px solid #222;padding-bottom:10px}
 .head p{margin:8px 0 0;font-size:12px;color:#94a3b8;line-height:1.6}
 .kartu{background:#020617;border:1px solid #334155;border-radius:12px;padding:12px;margin-bottom:10px;font-size:12.5px}
 .kartu b{color:#ffd700}
 .kin{color:#38bdf8}
 .ep{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:#0a0f1e;border:1px solid #1e2a44;border-radius:8px;margin-bottom:6px}
 .ep code{font:11px ui-monospace,monospace;color:#86efac;word-break:break-all}
 .okp{font-size:10px;font-weight:800;padding:3px 8px;border-radius:99px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;border:1px solid #4ade80}
 .bad{font-size:10px;font-weight:800;padding:3px 8px;border-radius:99px;background:#7f1d1d;color:#fca5a5;border:1px solid #ef4444}
 .tombol{display:block;width:100%;padding:12px;background:linear-gradient(135deg,#0284c7,#0e7490);color:#fff;border:1px solid #38bdf8;border-radius:9px;font-weight:800;font-size:12px;text-align:center;text-decoration:none;margin-top:8px}
 .foot{margin-top:14px;font-size:10.5px;color:#475569;text-align:center;border-top:1px solid #222;padding-top:10px}
</style>
</head>
<body>
 <div class="head">
  <h1>&#128176; DOMPET INDRAMAYU &middot; CLUB API</h1>
  <p>Mode <b class="kin">BRI SNAP sandbox</b> &mdash; tidak memakai uang asli.<br>
     Client ID: <b class="kin">__CID__</b> &middot; RSA Private Key: __KSTAT__</p>
 </div>
 <div class="kartu"><b>&#128273; ENDPOINT API (JSON)</b></div>
 __ENDP__
 <a class="tombol" href="http://34.170.37.50:8080/dompet-indramayu/history.html">&#128200; GRAFIK HISTORY (NAIK-TURUN)</a>
 <a class="tombol" href="http://34.170.37.50:8080/dompet-indramayu/">&#128176; BUKA APLIKASI DOMPET</a>
 <a class="tombol" href="http://34.170.37.50:8080/">&#127757; HALAMAN UTAMA INDRAMAYU</a>
 <div class="foot">Dompet Indramayu &middot; ALWI CLUB &middot; server_core.py (port 8000)</div>
</body>
</html>
"""

# --- Sistem Poin (server-side) ---
POIN_CATEGORY = 95051
POIN_TARGET = 1000           # poin yang dibutuhkan untuk tukar
POIN_VALUE_IDR = 10000       # nilai 1000 poin = Rp 10.000
DB_PATH = os.path.join(HERE, "config", "poin.db")


def db_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def db_init():
    if not os.path.isdir(os.path.join(HERE, "config")):
        return
    conn = db_conn()
    conn.execute("""CREATE TABLE IF NOT EXISTS poin_user(
        uid TEXT PRIMARY KEY,
        poin INTEGER DEFAULT 0,
        name TEXT DEFAULT '',
        account_no TEXT DEFAULT '',
        updated_at INTEGER
    )""")
    conn.execute("""CREATE TABLE IF NOT EXISTS poin_tx(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT,
        tipe TEXT,
        poin INTEGER,
        idr INTEGER,
        status TEXT,
        ref TEXT,
        detail TEXT DEFAULT '',
        created_at INTEGER
    )""")
    conn.commit()
    conn.close()


def poin_get(uid):
    conn = db_conn()
    row = conn.execute("SELECT * FROM poin_user WHERE uid=?", (uid,)).fetchone()
    conn.close()
    return dict(row) if row else {"uid": uid, "poin": 0, "name": "", "account_no": ""}


def poin_set(uid, poin, name="", account_no=""):
    conn = db_conn()
    cur = poin_get(uid)
    new_poin = poin
    cur_name = name or cur.get("name", "")
    cur_acc = account_no or cur.get("account_no", "")
    conn.execute("""INSERT INTO poin_user(uid,poin,name,account_no,updated_at)
                    VALUES(?,?,?,?,?)
                    ON CONFLICT(uid) DO UPDATE SET
                      poin=excluded.poin,
                      name=excluded.name,
                      account_no=excluded.account_no,
                      updated_at=excluded.updated_at""",
                 (uid, new_poin, cur_name, cur_acc, int(time.time())))
    conn.commit()
    conn.close()
    return new_poin


def poin_tx_save(uid, tipe, poin, idr, status, ref, detail=""):
    conn = db_conn()
    conn.execute("""INSERT INTO poin_tx(uid,tipe,poin,idr,status,ref,detail,created_at)
                    VALUES(?,?,?,?,?,?,?,?)""",
                 (uid, tipe, poin, idr, status, ref, detail, int(time.time())))
    conn.commit()
    conn.close()


db_init()


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

BASE_URL = os.environ.get("BRI_BASE_URL", "https://sandbox.partner.api.bri.co.id")
CLIENT_ID = os.environ.get("BRI_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("BRI_CLIENT_SECRET", "")
CHANNEL_ID = os.environ.get("BRI_CHANNEL_ID", "95051")
KEY_PATH = os.path.join(HERE, os.environ.get("BRI_PRIVATE_KEY_PATH", "rsa/private.pem"))
JAKARTA = timezone(timedelta(hours=7))


def wib_now():
    return datetime.now(JAKARTA).strftime("%Y-%m-%dT%H:%M:%S+07:00")


class SnapBackend:
    def __init__(self, base_url=BASE_URL, client_id=CLIENT_ID, secret=CLIENT_SECRET,
                 key_path=KEY_PATH):
        self.base = base_url.rstrip("/")
        self.client_id = client_id
        self.secret = secret
        self.key = None
        if os.path.exists(key_path):
            with open(key_path, "rb") as f:
                self.key = serialization.load_pem_private_key(f.read(), password=None)
        self.token = None
        self.token_at = 0

    def _sign_raw(self, raw: str) -> str:
        sig = self.key.sign(raw.encode(), asym_padding.PKCS1v15(), hashes.SHA256())
        return base64.b64encode(sig).decode()

    def access_token(self, force=False):
        present = self.token and (time.time() - self.token_at) < 8500
        if present and not force:
            return self.token
        if not self.client_id or self.key is None:
            raise RuntimeError("BRI_CLIENT_ID / private key belum dikonfigurasi.")
        ts = wib_now()
        path = "/snap/v1.0/access-token/b2b"
        body = json.dumps({"grantType": "client_credentials",
                           "additionalInfo": {}}, separators=(",", ":")).encode()
        headers = {
            "Content-Type": "application/json",
            "X-CLIENT-KEY": self.client_id,
            "X-TIMESTAMP": ts,
            "X-SIGNATURE": self._sign_raw(f"{self.client_id}|{ts}"),
        }
        r = requests.post(f"{self.base}{path}", data=body, headers=headers, timeout=30)
        if r.status_code != 200:
            raise RuntimeError(f"token HTTP {r.status_code}: {r.text}")
        d = r.json()
        self.token = d.get("accessToken") or d.get("access_token")
        self.token_at = time.time()
        return self.token

    def post_signed(self, path, payload):
        """POST produk BRI SNAP dengan tanda tangan HMAC-SHA512."""
        if not self.secret:
            raise RuntimeError("BRI_CLIENT_SECRET belum dikonfigurasi.")
        token = self.access_token()
        ts = wib_now()
        body = json.dumps(payload, separators=(",", ":")).encode()
        body_sha = hashlib.sha256(body).hexdigest().lower()
        string_to_sign = f"POST:{path}:{token}:{body_sha}:{ts}"
        sig = base64.b64encode(
            hmac.new(self.secret.encode(), string_to_sign.encode(), hashlib.sha512).digest()
        ).decode()
        external_id = datetime.now(JAKARTA).strftime("%Y%m%d%H%M%S000")
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "X-PARTNER-ID": self.client_id,
            "CHANNEL-ID": "00009",
            "X-EXTERNAL-ID": external_id,
            "X-TIMESTAMP": ts,
            "X-SIGNATURE": sig,
        }
        r = requests.post(f"{self.base}{path}", data=body, headers=headers, timeout=30)
        try:
            return r.status_code, r.json()
        except ValueError:
            return r.status_code, {"raw": r.text[:300]}


def build_handler(backend):
    class Handler(BaseHTTPRequestHandler):
        def _send(self, code, obj):
            data = json.dumps(obj, ensure_ascii=False).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def do_OPTIONS(self):
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Content-Length", "0")
            self.end_headers()

        def _read_json(self):
            length = int(self.headers.get("Content-Length") or 0)
            if not length:
                return {}
            raw = self.rfile.read(length)
            try:
                return json.loads(raw)
            except ValueError:
                return {}

        def log_message(self, fmt, *args):
            sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

        def _send_html(self, html):
            data = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            parsed = urlparse(self.path)
            if parsed.path == "/":
                en = ["/api/token", "/api/balance", "/api/statement",
                      "/api/transfer/va", "/api/poin", "/api/poin/sync",
                      "/api/poin/redeem"]
                links_api = "".join(
                    '<div class="ep"><code>%s</code><span class="okp">AKTIF</span></div>' % e for e in en
                )
                kstat = '<span class="okp">TERMUAT</span>' if backend.key is not None else '<span class="bad">TIDAK ADA</span>'
                cid = (backend.client_id[:8] + "..." if backend.client_id else "-")
                return self._send_html(HOME_HTML.replace("__CID__", cid).replace("__KSTAT__", kstat).replace("__ENDP__", links_api))
            if parsed.path == "/api/token":
                try:
                    t = backend.access_token(force=True)
                    return self._send(200, {"ok": True, "access_token": t[:20] + "...",
                                            "expires_in": 899})
                except Exception as e:
                    return self._send(500, {"ok": False, "error": str(e)})
            if parsed.path == "/api/poin":
                q = parse_qs(parsed.query)
                uid = (q.get("uid") or [""])[0]
                if not uid:
                    return self._send(400, {"ok": False, "error": "uid wajib"})
                d = poin_get(uid)
                return self._send(200, {
                    "ok": True, "uid": uid, "poin": d.get("poin", 0),
                    "name": d.get("name", ""), "account_no": d.get("account_no", ""),
                    "target": POIN_TARGET, "nilai_idr": POIN_VALUE_IDR,
                    "bisa_tukar": d.get("poin", 0) >= POIN_TARGET,
                    "sisa": max(0, POIN_TARGET - d.get("poin", 0)),
                })
            if parsed.path == "/api/history":
                q = parse_qs(parsed.query)
                try:
                    days = min(31, max(1, int((q.get("days") or ["7"])[0])))
                except ValueError:
                    days = 7
                return self._send(200, read_history(days))
            self._send(404, {"ok": False, "error": "not found"})

        def do_POST(self):
            parsed = urlparse(self.path)
            body = self._read_json()
            try:
                token = backend.access_token()
            except Exception as e:
                return self._send(500, {"ok": False, "error": str(e)})
            h = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            }
            if parsed.path == "/api/balance":
                acc = body.get("account_no") or body.get("customerNo") or ""
                r = requests.post(
                    f"{backend.base}/v1.1/balance-inquiry",
                    json={"partnerServiceId": "", "customerNo": acc,
                          "additionalInfo": {}},
                    headers=h, timeout=30)
                return self._send(r.status_code, {"ok": r.status_code == 200, "data": r.text[:500]})
            if parsed.path == "/api/statement":
                acc = body.get("account_no") or ""
                r = requests.post(
                    f"{backend.base}/v1.1/statement",
                    json={"accountNo": acc,
                          "startDate": body.get("start_date") or body.get("startDate") or "",
                          "endDate": body.get("end_date") or body.get("endDate") or "",
                          "additionalInfo": {}},
                    headers=h, timeout=30)
                return self._send(r.status_code, {"ok": r.status_code == 200, "data": r.text[:500]})
            if parsed.path == "/api/transfer/va":
                r = requests.post(
                    f"{backend.base}/v1.1/transfer-va/payment",
                    json={"partnerServiceId": "", "customerNo": body.get("customer_no", ""),
                          "virtualAccountNo": body.get("customer_no", ""),
                          "trxId": body.get("ref", str(uuid.uuid4())),
                          "paymentRequestId": str(uuid.uuid4()),
                          "paidAmount": {"value": str(body.get("amount", 0)), "currency": "IDR"},
                          "additionalInfo": {}},
                    headers=h, timeout=30)
                return self._send(r.status_code, {"ok": r.status_code == 200, "data": r.text[:500]})
            if parsed.path == "/api/poin/sync":
                uid = body.get("uid", "")
                poin = int(body.get("poin", 0))
                if not uid:
                    return self._send(400, {"ok": False, "error": "uid wajib"})
                nama = body.get("name", "")
                rek = body.get("account_no", "")
                now = poin_set(uid, poin, nama, rek)
                return self._send(200, {"ok": True, "poin": now,
                                        "target": POIN_TARGET,
                                        "nilai_idr": POIN_VALUE_IDR})
            if parsed.path == "/api/poin/redeem":
                uid = body.get("uid", "")
                nama = body.get("name", "")
                rek = body.get("account_no", "")
                if not uid or not nama or not rek:
                    return self._send(400, {"ok": False,
                                            "error": "uid, name, account_no wajib"})
                d = poin_get(uid)
                if d.get("poin", 0) < POIN_TARGET:
                    return self._send(400, {"ok": False,
                                            "error": f"Poin kurang. Butuh {POIN_TARGET}, "
                                                     f"punya {d.get('poin', 0)}"})
                ref = "REDEEM-" + datetime.now(JAKARTA).strftime("%Y%m%d%H%M%S%f")[-10:]
                poin_skr = d.get("poin", 0)
                # Coba payout ke rekening BRI member via endpoint intrabank.
                try:
                    code, j = backend.post_signed(
                        "/v1.1/transfer-intrabank",
                        {"partnerReferenceNo": ref,
                         "amount": {"value": str(POIN_VALUE_IDR), "currency": "IDR"},
                         "beneficiaryAccountNo": rek,
                         "beneficiaryName": nama,
                         "sourceAccountNo": "",
                         "additionalInfo": {"uid": uid}})
                    ok = code in (200, 201)
                    if ok:
                        poin_set(uid, poin_skr - POIN_TARGET, nama, rek)
                        status = "SUKSES"
                        sisa = poin_skr - POIN_TARGET
                    else:
                        status = "PENDING"
                        sisa = poin_skr
                    poin_tx_save(uid, "tukar", POIN_TARGET, POIN_VALUE_IDR, status,
                                 ref, json.dumps(j, ensure_ascii=False)[:300])
                    return self._send(200, {"ok": ok, "status": status, "ref": ref,
                                            "bri": {"http": code, "resp": j},
                                            "sisa_poin": sisa})
                except Exception as e:
                    poin_tx_save(uid, "tukar", POIN_TARGET, POIN_VALUE_IDR, "PENDING",
                                 ref, str(e)[:300])
                    return self._send(200, {"ok": False, "status": "PENDING", "ref": ref,
                                            "error": str(e),
                                            "sisa_poin": poin_skr})
            self._send(404, {"ok": False, "error": "not found"})

    return Handler


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    backend = SnapBackend()
    server = ThreadingHTTPServer(("0.0.0.0", port), build_handler(backend))
    print(f"Nomor server  : http://0.0.0.0:{port}")
    print(f"Client ID     : {backend.client_id[:8]}... ({len(backend.client_id)} char)")
    print(f"Private key   : {'OK ' + backend.base if backend.key else 'ABSOLUT'} ")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nberhenti.")


if __name__ == "__main__":
    main()