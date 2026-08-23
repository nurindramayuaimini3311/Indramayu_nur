import sys, subprocess, os, glob
url = sys.argv[1] if len(sys.argv) > 1 else input("🔗 URL Video: ").strip()
tmp = "/tmp/yt-video"
os.makedirs(tmp, exist_ok=True)
print(f"⬇️ Download VIDEO: {url}")
cmd = ["yt-dlp", "-f", "bestvideo+bestaudio/best", "--merge-output-format", "mp4", "-o", f"{tmp}/%(title)s.%(ext)s", url]
subprocess.run(cmd, check=True)
print("☁️ Upload ke video: (imah:Gambar/Video)")
subprocess.run(["rclone", "move", tmp, "video:", "-v"], check=True)
print("✅ Video done")
