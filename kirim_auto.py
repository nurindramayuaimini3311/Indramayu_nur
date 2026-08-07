import smtplib
from email.mime.text import MIMEText
EMAIL = "dkohar011@gmail.com"
APP_PASS = "girmzfhhxhhaqafn"
msg = MIMEText("ALWI SERVER PY - TEST BERHASIL! 🚀\n\nKamus PY: http://localhost:5000/kamus-py")
msg['Subject'] = "ALWI TEST BERHASIL ✅"
msg['From'] = EMAIL
msg['To'] = EMAIL
try:
    s = smtplib.SMTP('smtp.gmail.com', 587)
    s.starttls()
    s.login(EMAIL, APP_PASS)
    s.send_message(msg)
    s.quit()
    print("✅ BERHASIL TERKIRIM KE dkohar011@gmail.com!")
    print("Cek inbox sekarang!")
except Exception as e:
    print(f"❌ GAGAL: {e}")
