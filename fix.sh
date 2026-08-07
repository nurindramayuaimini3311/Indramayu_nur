#!/bin/bash
# 1. Ganti kamus pakai FINAL
if [ -f android/kamus_FINAL_KATA_ACAK_only.html ]; then
  cp android/kamus_FINAL_KATA_ACAK_only.html android/kamus.html
  echo "✅ kamus FINAL dipasang dari android/"
fi

# 2. Bersihin bubble lama
find . -name "*.html" -type f -exec sed -i '/alwi_bubble/d' {} \;

# 3. Pastikan bubble v3
if [ -f alwi_bubble_v3_ALL.js ]; then
  cp alwi_bubble_v3_ALL.js alwi_bubble.js
  echo "✅ alwi_bubble.js = v3"
fi

# 4. Pasang bubble
for f in index.html android/index.html android/kamus.html android/admin_panel.html konten/komentar.html netflix/index.html peta/peta.html pencuri/index.html kamera-hantu/kamera_hantu2.html kuis/quiz.html; do
  if [ -f "$f" ] && grep -q "</body>" "$f"; then
    sed -i 's|</body>|<script src="/alwi_bubble.js"></script>\n</body>|' "$f"
    echo "✅ $f"
  fi
done

grep -l "alwi_bubble" android/kamus.html && echo "✅ kamus ada bubble" || echo "❌ belum"
grep "btn-acak" android/kamus.html && echo "✅ kamus KATA ACAK ONLY" || echo "❌ kamus masih lama"
