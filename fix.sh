#!/bin/bash
echo "🧹 Bersihkan folder nyasar..."
# Dari ~/Indramayu_nur
rm -rf img/img
rm -rf img/konten
rm -f img/cp
rm -f img/cp/suster-gaib.jpg 2>/dev/null
rm -rf img/konten/suster-gaib.jpg 2>/dev/null

# Betulkan typo
if [ -f static/kartu_member.htmk ]; then
  mv static/kartu_member.htmk static/kartu_member.html
  echo "✅ Fix typo htmk -> html"
fi

# Pastikan suster-gaib ada di 2 tempat
if [ ! -f img/suster-gaib.jpg ] && [ -f konten/suster-gaib.jpg ]; then
  cp konten/suster-gaib.jpg img/suster-gaib.jpg
  echo "✅ Copy suster ke img/"
fi

if [ ! -f konten/suster-gaib.jpg ] && [ -f img/suster-gaib.jpg ]; then
  cp img/suster-gaib.jpg konten/suster-gaib.jpg
  echo "✅ Copy suster ke konten/"
fi

echo ""
echo "✅ SELESAI - Cek tree:"
tree -I "node_modules|.git" -L 2
echo ""
echo "📁 konten/ harus 14 file:"
ls konten/ | wc -l
ls konten/

