#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# pil.py — Utility gambar ALWI (folder game_rahasia)
# Berguna untuk: perbaiki file gambar yang "hilang" padahal ada
#   (mis. isinya WebP/PNG tapi ekstensi .jpg → browser tidak bisa render).
# Cara pakai:
#   python3 pil.py                # perbaiki semua gambar
#   python3 pil.py alwikoin.jpg   # perbaiki 1 file saja
import os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ALL = ["alwikoin.jpg", "alwiLuv.jpg"]

def perbaiki(nama):
    if os.sep not in nama:
        path = os.path.join(HERE, nama)
    else:
        path = nama
    if not os.path.exists(path):
        print("SKIP (tidak ada):", nama)
        return False
    im = Image.open(path)
    rgb = im.convert("RGB")
    tmp = path + ".tmp.jpg"
    rgb.save(tmp, "JPEG", quality=92)
    os.replace(tmp, path)
    print("OK render ulang:", nama, "->", im.size, im.format, "=> JPEG")
    return True

def main():
    targets = sys.argv[1:] if len(sys.argv) > 1 else ALL
    ok = 0
    for t in targets:
        ok += 1 if perbaiki(t) else 0
    print("Selesai. Berhasil:", ok, "/", len(targets))

if __name__ == "__main__":
    main()