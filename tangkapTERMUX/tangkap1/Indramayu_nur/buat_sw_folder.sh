#!/bin/bash
# buat_sw_folder.sh — generate sw.js per subfolder di Indramayu_nur
# Setiap sw.js hanya cache file di folder itu sendiri (ringan).
cd "$(dirname "$0")"

SKIP_DIRS="backup img node_modules meta meta_bisnis meta_folder pengaturan setting static"

for d in */; do
  d="${d%/}"
  name="$(basename "$d")"
  [ -n "$(echo "$SKIP_DIRS" | grep -w "$name")" ] && continue
  [ ! -d "$d" ] && continue

  # kumpulkan semua file di folder itu
  FILES=$(find "$d" -type f ! -name 'sw.js' ! -name 'offline.html' -printf '%s %p\n' | sort -n | cut -d' ' -f2-)

  # cari file entry (index.html / *.html teratas)
  ENTRY=""
  for f in "$d/index.html" "$d/home.html" "$d/main.html"; do
    if [ -f "$f" ]; then ENTRY="$f"; break; fi
  done
  [ -z "$ENTRY" ] && ENTRY=$(echo "$FILES" | grep -E '\.html$' | head -1)

  SW="$d/sw.js"
  {
    echo "// sw.js otomatis untuk folder '$name' — hanya cache isi folder ini"
    echo "// DIBUAT OTOMATIS oleh buat_sw_folder.sh, jangan edit manual. Jalankan ulang script untuk update."
    echo "const CACHE_NAME='sw-$name-$(date +%Y%m%d)';"
    echo "const ENTRY='./${ENTRY#$d/}';"
    echo "const CACHE_FILES=["
    echo "  './',"
    echo "  ENTRY,"
    while IFS= read -r f; do
      echo "  './${f#$d/}',"
    done <<< "$FILES"
    echo "];"
    echo ""
    echo "// Install: cache semua file folder (kecil, cepat)"
    echo "self.addEventListener('install', e=>{"
    echo "  e.waitUntil((async()=>{"
    echo "    const cache=await caches.open(CACHE_NAME);"
    echo "    for (const url of CACHE_FILES) {"
    echo "      try { await cache.add(url); } catch(err){}"
    echo "    }"
    echo "    await self.skipWaiting();"
    echo "  })());"
    echo "});"
    echo ""
    echo "// Activate: hapus cache lama folder ini saja"
    echo "self.addEventListener('activate', e=>{"
    echo "  e.waitUntil((async()=>{"
    echo "    const keys=await caches.keys();"
    echo "    await Promise.all(keys.filter(k=>k.startsWith('sw-$name')).filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));"
    echo "    await self.clients.claim();"
    echo "  })());"
    echo "});"
    echo ""
    echo "// Fetch: cache-first (offline tetap jalan), fallback ke entry"
    echo "self.addEventListener('fetch', e=>{"
    echo "  const url=new URL(e.request.url);"
    echo "  if (e.request.method!=='GET' || url.origin!==self.location.origin) return;"
    echo "  e.respondWith((async()=>{"
    echo "    const cached=await caches.match(e.request);"
    echo "    if (cached) return cached;"
    echo "    try {"
    echo "      const res=await fetch(e.request);"
    echo "      if (res.ok) { const copy=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)); }"
    echo "      return res;"
    echo "    } catch(err){"
    echo "      const fallback=await caches.match(ENTRY);"
    echo "      if (fallback) return fallback;"
    echo "      return new Response('offline', {status:200, headers:{'Content-Type':'text/html'}});"
    echo "    }"
    echo "  })());"
    echo "});"
  } > "$SW"

  cnt=$(echo "$FILES" | wc -l)
  sz=$(du -sh "$d" | cut -f1)
  echo "$name : $cnt file ($sz) -> $SW"
done