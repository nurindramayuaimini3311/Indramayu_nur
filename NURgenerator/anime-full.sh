#!/bin/bash
# MODE FULL ANIME - ALWI & NARUTO - by Alwi Online
# Butuh: alwi.jpg + naruto.jpg + musik.mp3 di folder ini
echo "🎌 MODE FULL ANIME ALWI x NARUTO"

mkdir -p netflix/anime-full

# 1. ALWI SOLO - anime filter cartoon + slow zoom
ffmpeg -y -loop 1 -t 8 -i alwi.jpg -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,eq=saturation=1.8:contrast=1.2:brightness=0.05, tblend=all_mode=lighten, unsharp=5:5:1.0, zoompan=d=1:s=1280x720:fps=25, format=yuv420p" -c:v libx264 -pix_fmt yuv420p netflix/anime-full/alwi_anime.mp4

# 2. NARUTO SOLO - style orange chakra
ffmpeg -y -loop 1 -t 8 -i naruto.jpg -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,eq=saturation=2.0:contrast=1.3:gamma_b=0.8, colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131, zoompan=d=1:s=1280x720:fps=25, format=yuv420p" -c:v libx264 -pix_fmt yuv420p netflix/anime-full/naruto_anime.mp4

# 3. FULL COLLAB ALWI + NARUTO - side by side + glitch anime
ffmpeg -y -loop 1 -t 10 -i alwi.jpg -loop 1 -t 10 -i naruto.jpg -i musik.mp3 -filter_complex "[0:v]scale=640:720:force_original_aspect_ratio=increase,crop=640:720,eq=saturation=1.9[al];[1:v]scale=640:720:force_original_aspect_ratio=increase,crop=640:720,eq=saturation=1.9:contrast=1.2[nr];[al][nr]hstack=inputs=2, tblend=all_mode=lighten, unsharp=5:5:1.2, drawtext=fontcolor=white:fontsize=48:fontfile=/system/fonts/DroidSans-Bold.ttf:text='ALWI x NARUTO':x=(w-text_w)/2:y=50:shadowcolor=black:shadowx=3:shadowy=3, format=yuv420p[v]" -map "[v]" -map 2:a -c:v libx264 -c:a aac -shortest netflix/anime-full/alwi_naruto_FULL_ANIME.mp4

echo "✅ SELESAI! Hasil di netflix/anime-full/"
ls -lh netflix/anime-full/