import sys, subprocess, os, glob

url = sys.argv[1] if len(sys.argv) > 1 else input("🔗 URL YouTube: ").strip()
if not url:
    print("URL kosong")
    sys.exit(1)

tmp_dir = "/tmp/yt"
os.makedirs(tmp_dir, exist_ok=True)

print(f"⬇️ Download: {url}")
# download best
cmd = ["yt-dlp", "-f", "bestvideo+bestaudio/best", "--merge-output-format", "mp4", "-o", f"{tmp_dir}/%(title)s.%(ext)s", url]
subprocess.run(cmd, check=True)

files = glob.glob(f"{tmp_dir}/*")
if not files:
    print("❌ Gagal download")
    sys.exit(1)

print(f"📦 File: {files}")
print("☁️ Upload ke imah:Gambar/Video (remote video:)")

# move ke drive - pake alias video yang udah ada
subprocess.run(["rclone", "move", tmp_dir, "video:", "-v", "--stats-one-line"], check=True)

print("✅ Beres! Cek drive lu")
subprocess.run(["rclone", "ls", "video:"], check=False)
