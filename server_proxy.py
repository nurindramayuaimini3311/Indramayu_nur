import http.server, socketserver, urllib.request, os
PORT=8889
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path.startswith('/ollama'):
            target = 'http://localhost:11434' + self.path.replace('/ollama','')
            length = int(self.headers.get('content-length',0))
            data = self.rfile.read(length)
            req = urllib.request.Request(target, data=data, headers={'Content-Type':'application/json'})
            try:
                with urllib.request.urlopen(req) as r:
                    body=r.read()
                    self.send_response(200)
                    self.send_header('Content-Type','application/json')
                    self.send_header('Access-Control-Allow-Origin','*')
                    self.end_headers()
                    self.wfile.write(body)
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            super().do_POST()
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin','*')
        super().end_headers()
os.chdir(os.path.expanduser('~/NURgenerator'))
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Proxy jalan di port {PORT}")
    httpd.serve_forever()
