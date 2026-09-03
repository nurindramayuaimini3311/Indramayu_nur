#!/bin/bash
# aktifkan_sw_folder.sh — inject registrasi sw.js dengan path yang benar
cd "$(dirname "$0")"

inject() {
  local f="$1"
  if grep -q 'navigator.serviceWorker.register' "$f"; then
    echo "skip (sudah): $f"
    return
  fi
  # cari folder terdekat yang punya sw.js di atasnya
  local dir rel="sw.js" n=""
  dir="$(dirname "$f")"
  while [ "$dir" != "/" ] && [ -n "$dir" ]; do
    if [ -f "$dir/sw.js" ]; then
      rel="sw.js"
      n="$(echo "$f" | sed "s#^$dir/##")"
      n="$(dirname "$n")"
      if [ "$n" != "." ]; then
        rel="$(echo "$n" | sed 's#[^/]*#..#g')/sw.js"
      fi
      break
    fi
    dir="$(dirname "$dir")"
    [ "$dir" = "." ] && break
  done
  # backup sekali saja
  [ -f "$f.bak-sw" ] || cp "$f" "$f.bak-sw"
  sed -i "s|</body>|<script>if(\"serviceWorker\" in navigator){navigator.serviceWorker.register(\"$rel\").catch(function(){})}</script></body>|" "$f"
  echo "OK ($rel): $f"
}

while IFS= read -r f; do
  case "$f" in
    */img/*|*/static/*|*/node_modules/*|*/backup/*|*/.git/*|*/promosi-4slot/backup/*) continue ;;
  esac
  inject "$f"
done < <(find . -name '*.html' -type f)