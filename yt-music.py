import sys, subprocess, os
url = sys.argv[1] if len(sys.argv) > 1 else input("🔗 URL Musik: ").strip()
tmp = "/tmp/yt-music"
os.makedirs(tmp, exist_ok=True)
print(f"⬇️ Download MUSIK: {url}")
cmd = ["yt-dlp", "-x", "--audio-format", "mp3", "--audio-quality", "0", "-o", f"{tmp}/%(title)s.%(ext)s", url]
subprocess.run(cmd, check=True)
print("☁️ Upload ke music: (imah:Gambar/Music)")
subprocess.run(["rclone", "move", tmp, "music:", "-v"], check=True)
print("✅ Musik done")
