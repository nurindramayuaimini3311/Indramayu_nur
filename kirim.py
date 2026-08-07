import smtplib
from email.mime.text import MIMEText
import getpass

print("=== KIRIM EMAIL ALWI ===")
EMAIL = "dkohar011@gmail.com"
print(f"Dari: {EMAIL}")

# Input app password (gak keliatan)
APP_PASS = getpass.getpass("Masukin App Password 16 huruf (dari https://myaccount.google.com/apppasswords): ")

TO = input("Kirim ke (default dkohar011@gmail.com): ") or "dkohar011@gmail.com"
SUBJECT = input("Subject (default ALWI TEST): ") or "ALWI TEST PY GAK PUTUS"
BODY = input("Isi pesan (default Test Alwi): ") or "Test dari ALWI SERVER - Python gak putus! 🚀"

msg = MIMEText(BODY)
msg['Subject'] = SUBJECT
msg['From'] = EMAIL
msg['To'] = TO

try:
    print("⏳ Mengirim...")
    s = smtplib.SMTP('smtp.gmail.com', 587)
    s.starttls()
    s.login(EMAIL, APP_PASS)
    s.send_message(msg)
    s.quit()
    print(f"✅ BERHASIL! Email terkirim ke {TO}")
except Exception as e:
    print(f"❌ GAGAL: {e}")
    print("\nPastikan:")
    print("1. 2-Step Verification aktif")
    print("2. App Password 16 huruf bener (tanpa spasi)")
    print("3. Buat di: https://myaccount.google.com/apppasswords")
