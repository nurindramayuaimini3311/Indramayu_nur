// static/js/kartu.js - Logic Kartu Member + Kamera Hantu Scanner
console.log('Kartu Member Indramayu Club Loaded');

// Fungsi download kartu jadi PNG (butuh html2canvas)
async function downloadKartuPNG(){
  const kartu = document.getElementById('kartuMember');
  if(typeof html2canvas === 'undefined'){
    // load html2canvas CDN
    const s = document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    document.head.appendChild(s);
    await new Promise(r=>s.onload=r);
  }
  const canvas = await html2canvas(kartu, {scale:2, backgroundColor:null});
  const link = document.createElement('a');
  link.download = `Kartu-${document.getElementById('idMember').textContent}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

// Integrasi dengan kamera-hantu
// Jika di folder kamera-hantu/templates/scan.html, pakai ini untuk scan QR kartu
function initScanner(){
  const video = document.getElementById('video');
  if(!video) return;
  navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(stream=>{
    video.srcObject=stream;
    // Pakai jsQR untuk baca QR (opsional)
  });
}

// Simpan dari login_member.html ke kartu
// Di login_member.html tambahkan:
// localStorage.setItem('imc_nama', nama);
// localStorage.setItem('imc_id', idMember);
// Lalu redirect ke /templates/kartu.html

