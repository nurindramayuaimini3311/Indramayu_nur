
import sys
import json
from ddgs import DDGS

def search(query):
    results = []
    seen = set()
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=8):
                title = (r.get('title') or '').strip()
                body = (r.get('body') or '').strip()
                # Lewati hasil duplikat/mirip (judul sama atau isi ringkasan sama persis)
                key = (title.lower(), body[:80].lower())
                if not title and not body:
                    continue
                if key in seen:
                    continue
                seen.add(key)
                results.append(f"Judul: {title}\nRingkasan: {body}")
                if len(results) >= 4:
                    break
    except Exception as e:
        print(f"[web_search.py] ERROR: {e}", file=sys.stderr)
        return ""
    if not results:
        print("[web_search.py] Tidak ada hasil ditemukan (kemungkinan rate-limited oleh DuckDuckGo untuk IP ini).", file=sys.stderr)
    return "\n\n".join(results)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        print(search(query))

