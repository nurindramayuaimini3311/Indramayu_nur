#!/bin/bash
cd ~/NURgenerator
export OLLAMA_ORIGINS="*"
export OLLAMA_HOST="0.0.0.0:11434"

# 1. Ollama
nohup ollama serve > ~/NURgenerator/ollama.log 2>&1 &
sleep 3

# 2. Web (port 8889)
nohup python3 -m http.server 8889 > ~/NURgenerator/server.log 2>&1 &
sleep 2

# 3. Tunnel WEB
nohup cloudflared tunnel --url http://localhost:8889 > ~/NURgenerator/cloudflared.log 2>&1 &
sleep 5

# 4. Tunnel OLLAMA
nohup cloudflared tunnel --url http://localhost:11434 > ~/NURgenerator/ollama_tunnel.log 2>&1 &
sleep 10

echo "=== ALWI CHIBI ON ==="
echo "WEB LOG:"
strings ~/NURgenerator/cloudflared.log | grep trycloudflare
echo "OLLAMA LOG:"
strings ~/NURgenerator/ollama_tunnel.log | grep trycloudflare
echo "OLLAMA CHECK:"
curl -s http://localhost:11434/api/tags | head -c 100
