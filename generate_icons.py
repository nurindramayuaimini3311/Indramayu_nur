from PIL import Image
import sys
src = "img/alwi_ghost_bug.png"
try:
    img = Image.open(src).convert("RGBA")
except FileNotFoundError:
    print("File sumber tidak ditemukan:", src)
    sys.exit(1)

sizes = [512, 192, 180, 72]
for size in sizes:
    out = img.resize((size, size), Image.LANCZOS)
    out.save(f"img/icon-{size}.png", "PNG")
    print(f"Created img/icon-{size}.png")

# overwrite agent icon
img.resize((192, 192), Image.LANCZOS).save("img/agent_alwi_icon.png", "PNG")
print("Updated img/agent_alwi_icon.png")
