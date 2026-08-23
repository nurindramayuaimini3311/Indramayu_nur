import sys
import urllib.request
from bs4 import BeautifulSoup

def fetch_url(url):
    try:
        # Meniru browser biasa agar tidak diblokir
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
        soup = BeautifulSoup(html, 'html.parser')
        
        # Buang tag script dan style yang tidak perlu
        for script in soup(["script", "style"]):
            script.extract()
            
        text = soup.get_text(separator=' ')
        lines = (line.strip() for line in text.splitlines())
        clean_text = ' '.join(chunk for chunk in lines if chunk)
        
        # Potong 1000 karakter pertama agar sesuai kapasitas Alwi 0.5b
        return clean_text[:1000]
    except Exception as e:
        return f"Gagal membaca link: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(fetch_url(sys.argv[1]))
