#!/bin/bash
cd ~/hugoNUR8
echo "=== FIX ALWI ALL SERVER ==="

# 1. Ganti kamus.html pakai yang FINAL
if [ -f android/kamus_FINAL_KATA_ACAK_only.html ]; then
  cp android/kamus_FINAL_KATA_ACAK_only.html android/kamus.html
  echo "✅ android/kamus.html = FINAL KATA ACAK ONLY"
fi

# Kalau masih ada yang dari download
if [ -f ~/storage/downloads/kamus_FINAL_ACAK_ONLY.html ]; then
  cp ~/storage/downloads/kamus_FINAL_ACAK_ONLY.html android/kamus.html
  echo "✅ android/kamus.html dari download"
fi

# 2. Bersihin semua bubble yang salah
echo "🧹 Bersihin bubble lama..."
find . -name "*.html" -type f -exec sed -i '/alwi_bubble/d' {} \;
find . -name "*.html" -type f -exec sed -i '/ALWI_grendle.png.*bubble/d' {} \;

# 3. Pasang bubble v3 yang bener di semua HTML utama
echo "📦 Pasang bubble v3 ALL SERVER..."

# Pastikan alwi_bubble.js adalah v3
if [ -f alwi_bubble_v3_ALL.js ]; then
  cp alwi_bubble_v3_ALL.js alwi_bubble.js
  echo "✅ alwi_bubble.js = v3 ALL SERVER"
fi

# List file yang wajib ada bubble
FILES=(
"index.html"
"android/index.html"
"android/kamus.html"
"android/admin_panel.html"
"konten/komentar.html"
"konten/cerita.html"
"netflix/index.html"
"peta/peta.html"
"pencuri/index.html"
"kamera-hantu/kamera_hantu2.html"
"kuis/quiz.html"
"pasar_gaib_fix.html"
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    # Cek ada </body> gak
    if grep -q "</body>" "$f"; then
      # Pasang sebelum </body> dengan path absolute /
      sed -i 's|</body>|<script src="/alwi_bubble.js"></script>\n</body>|' "$f"
      echo "✅ $f"
    else
      echo "⚠️ $f gak ada </body>"
    fi
  else
    echo "❌ $f gak ada"
  fi
done

# 4. Cek
echo ""
echo "=== CEK ==="
grep -l "alwi_bubble.js" android/kamus.html && echo "✅ kamus.html ada bubble" || echo "❌ kamus.html belum ada bubble"
grep "btn-acak" android/kamus.html && echo "✅ kamus.html = KATA ACAK ONLY" || echo "❌ kamus.html masih lama (ada search)"

echo ""
ls -lh alwi_bubble.js app.py android/kamus.html | awk '{print $9, $5}'

echo ""
echo "=== SIAP JALANKAN SERVER ==="
echo "python app.py"

