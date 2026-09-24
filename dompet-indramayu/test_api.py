#!/usr/bin/env python3
"""
test_api.py — Pengujian API BRI SNAP sandbox (proyek Dompet IndramayuCLUB).

Alur:
  1. Baca config/.env (BRI_CLIENT_ID, secret, private key).
  2. Ambil Access Token (format portal: stringToSign = client_id|timestamp).
  3. Kirim request tes fitur yang dipilih.

Cara pakai (di Termux, dari folder dompet-indramayu):
    python3 test_api.py token
    python3 test_api.py balance <acc_no>
    python3 test_api.py va-inquiry <customer_no>
    python3 test_api.py va-create <customer_no> <amount> <ref>
    python3 test_api.py statement <acc_no> <dd/mm/yyyy> <dd/mm/yyyy>
    python3 test_api.py interbank <source> <bank_code> <dest> <amount> <ref> [name]
    python3 test_api.py help

Contoh:
    python3 test_api.py va-create 1234567890 50000 VA-TEST-1
"""

import os, sys, json, base64, hashlib, hmac, time, uuid
from datetime import datetime, timezone, timedelta

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding

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

BASE = os.environ.get("BRI_BASE_URL", "https://sandbox.partner.api.bri.co.id")
CLIENT_ID = os.environ.get("BRI_CLIENT_ID", "")
KEY_PATH = os.path.join(HERE, os.environ.get("BRI_PRIVATE_KEY_PATH", "rsa/private.pem"))
JAKARTA = timezone(timedelta(hours=7))


def wib_now():
    return datetime.now(JAKARTA).strftime("%Y-%m-%dT%H:%M:%S+07:00")


def sign(raw: str) -> str:
    with open(KEY_PATH, "rb") as f:
        key = serialization.load_pem_private_key(f.read(), password=None)
    sig = key.sign(raw.encode(), asym_padding.PKCS1v15(), hashes.SHA256())
    return base64.b64encode(sig).decode()


def access_token(force=False, _cache={}):
    if _cache and time.time() - _cache["at"] < 8500 and not force:
        return _cache["token"]
    if not CLIENT_ID:
        raise SystemExit("BRI_CLIENT_ID kosong — cek config/.env")
    ts = wib_now()
    path = "/snap/v1.0/access-token/b2b"
    body = json.dumps({"grantType": "client_credentials", "additionalInfo": {}},
                      separators=(",", ":")).encode()
    headers = {
        "Content-Type": "application/json",
        "X-CLIENT-KEY": CLIENT_ID,
        "X-TIMESTAMP": ts,
        "X-SIGNATURE": sign(f"{CLIENT_ID}|{ts}"),
    }
    r = requests.post(f"{BASE}{path}", data=body, headers=headers, timeout=30)
    if r.status_code != 200:
        raise SystemExit(f"TOKEN GAGAL {r.status_code}: {r.text}")
    d = r.json()
    tok = d.get("accessToken")
    _cache["token"], _cache["at"] = tok, time.time()
    return tok


def post(path, payload, token):
    ts = wib_now()
    body = json.dumps(payload, separators=(",", ":")).encode()
    body_sha = hashlib.sha256(body).hexdigest().lower()
    string_to_sign = f"POST:{path}:{token}:{body_sha}:{ts}"
    secret = os.environ.get("BRI_CLIENT_SECRET", "")
    sig = base64.b64encode(
        hmac.new(secret.encode(), string_to_sign.encode(), hashlib.sha512).digest()
    ).decode()
    external_id = datetime.now(JAKARTA).strftime("%Y%m%d%H%M%S000")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "X-PARTNER-ID": CLIENT_ID,
        "CHANNEL-ID": "00009",
        "X-EXTERNAL-ID": external_id,
        "X-TIMESTAMP": ts,
        "X-SIGNATURE": sig,
    }
    r = requests.post(f"{BASE}{path}", data=body, headers=headers, timeout=30)
    print(f"[POST] {path} -> {r.status_code}")
    try:
        return r.json()
    except ValueError:
        return {"raw": r.text}


def pretty(obj):
    print(json.dumps(obj, ensure_ascii=False, indent=2))


def main():
    args = sys.argv[1:]
    cmd = args[0] if args else "help"

    if cmd == "token":
        t = access_token(force=True)
        print("ACCESS TOKEN OK:", t[:30], "...")
        return

    if cmd == "help":
        print(__doc__)
        return

    try:
        token = access_token()
    except SystemExit as e:
        print(e)
        return

    if cmd == "balance":
        acc = args[1]
        pretty(post("/v1.1/balance-inquiry",
                    {"partnerServiceId": "", "customerNo": acc, "additionalInfo": {}}, token))
    elif cmd == "va-inquiry":
        no = args[1]
        va = args[2] if len(args) > 2 else no
        app_id = os.environ.get("BRI_CLIENT_SECRET", "")
        pretty(post("/snap/v1.0/transfer-va/inquiry",
                    {"partnerServiceId": "   77777", "customerNo": "0000000000001",
                     "virtualAccountNo": va, "trxDateInit": wib_now(),
                     "channelCode": 9, "sourceBankCode": "002",
                     "passApp": app_id, "inquiryRequestId": str(uuid.uuid4()),
                     "additionalInfo": {"idApp": "TEST"}}, token))
    elif cmd == "va-create":
        no, amount, ref = args[1], args[2], args[3]
        pretty(post("/snap/v1.0/transfer-va/payment-intrabank",
                    {"partnerReferenceNo": ref,
                     "amount": {"value": str(amount), "currency": "IDR"},
                     "beneficiaryBankCode": "002", "beneficiaryAccountNo": no,
                     "beneficiaryName": "TESTMEMBER", "sourceAccountNo": "",
                     "additionalInfo": {}}, token))
    elif cmd == "statement":
        acc, start, end = args[1], args[2], args[3]
        pretty(post("/v1.1/statement",
                    {"accountNo": acc, "startDate": start, "endDate": end,
                     "additionalInfo": {}}, token))
    elif cmd == "interbank":
        src, code, dest, amount, ref = args[1], args[2], args[3], args[4], args[5]
        name = args[6] if len(args) > 6 else "TES"
        pretty(post("/v2.0/transfer-interbank",
                    {"partnerReferenceNo": ref,
                     "amount": {"value": str(amount), "currency": "IDR"},
                     "sourceAccountNo": src, "beneficiaryAccountNo": dest,
                     "beneficiaryBankCode": code, "beneficiaryName": name,
                     "additionalInfo": {}}, token))
    else:
        print("Perintah tak dikenal. Pakai: python3 test_api.py help")


if __name__ == "__main__":
    main()