import os
import mysql.connector

# 1. Konfigurasi koneksi ke Database Cloud Gratis (Aiven / MariaDB lokal)
try:
    db = mysql.connector.connect(
        host="localhost",          # Ganti dengan host cloud Anda nanti
        user="root",               # Ganti dengan user database
        password="",               # Ganti dengan password database
        database="indramayu_club"
    )
    cursor = db.cursor()
    print("Successfully connected to Indramayu Club Database!")
except:
    print("Database offline, running local simulation mode.")

# 2. Simulasi input komentar dari member Indramayu Club
member_name = input("Masukkan nama member: ")
komentar = input("Tulis komentar/pertanyaan: ")

# 3. Menyimpan data komentar ke dalam tabel SQL secara otomatis
sql_query = "INSERT INTO komentar_member (nama, isi_komentar) VALUES (%s, %s)"
val = (member_name, komentar)
# cursor.execute(sql_query, val) # Aktifkan baris ini jika database sudah siap
# db.commit()

# 4. Simulasi respons AI (Nanti bagian ini ditembak ke Gemini API Key)
print(f"\n[Bot AI Indramayu Club]: Halo kang {member_name}, komentar Anda sudah disimpan di database database server cloud gratis!")
print(f"[Bot AI Indramayu Club]: Pertanyaan Anda '{komentar}' sedang diproses oleh Otak Gemini...")

