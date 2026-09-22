/* MISI TIMER — dipakai 5 level rambo5.
   Cara pakai per file: set window.MISI={fase:[[detik,'LABEL'],...],lanjut:'file-berikut.html'}
   Timer tampil kecil di atas-tengah (tidak menutupi game).
   Habis waktu -> tombol LANJUT (tidak paksa, pemain yang tekan). */
(function(){
  var M = window.MISI;
  if(!M || !M.fase || !M.fase.length) return;

  var total = 0, i, batas = [];
  for(i = 0; i < M.fase.length; i++){ total += M.fase[i][0]; batas.push(total); }

  // pil timer (kecil, atas-tengah)
  var pil = document.createElement('div');
  pil.id = 'misiPil';
  pil.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%);'
    + 'z-index:99999;background:rgba(0,0,0,.65);color:#ffd700;'
    + 'font:bold 13px monospace;padding:6px 14px;border-radius:20px;'
    + 'border:1px solid #ffd70088;pointer-events:none;white-space:nowrap;';
  document.body.appendChild(pil);

  // banner fase (hilang sendiri)
  var ban = document.createElement('div');
  ban.style.cssText = 'position:fixed;top:32%;left:0;right:0;z-index:99999;text-align:center;'
    + 'font:bold 26px monospace;color:#fff;text-shadow:0 0 14px #f80,0 2px 4px #000;'
    + 'pointer-events:none;opacity:0;transition:opacity .4s;';
  document.body.appendChild(ban);
  var banT = null;
  function tampilBan(teks){
    ban.textContent = teks;
    ban.style.opacity = '1';
    clearTimeout(banT);
    banT = setTimeout(function(){ ban.style.opacity = '0'; }, 2200);
  }

  function fmt(s){
    s = Math.max(0, s);
    return Math.floor(s/60) + ':' + String(s%60).padStart(2, '0');
  }

  var detik = 0, faseIdx = -1, selesai = false;
  function faseKe(d){
    for(var k = 0; k < batas.length; k++) if(d < batas[k]) return k;
    return batas.length;
  }

  setInterval(function(){
    if(selesai) return;
    var fi = faseKe(detik);
    if(fi >= M.fase.length){
      // MISI SELESAI -> overlay lanjut
      selesai = true;
      pil.textContent = '✅ SELESAI';
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;'
        + 'flex-direction:column;gap:14px;align-items:center;justify-content:center;'
        + 'background:rgba(0,0,0,.85);color:#fff;font-family:monospace;text-align:center;padding:20px;';
      ov.innerHTML = '<div style="font-size:56px">⏱️</div>'
        + '<div style="font-size:22px;color:#ffd700;font-weight:bold">WAKTU HABIS!</div>'
        + '<div style="font-size:13px;opacity:.85">' + (M.nama || 'Level selesai') + '</div>'
        + '<button id="misiLanjut" style="background:#ffd700;color:#3a2800;border:0;'
        + 'font-weight:bold;font-size:17px;padding:14px 32px;border-radius:12px;cursor:pointer;">'
        + (M.tombol || '➜ LANJUT') + '</button>';
      document.body.appendChild(ov);
      document.getElementById('misiLanjut').onclick = function(){ location.href = M.lanjut; };
      return;
    }
    if(fi !== faseIdx){
      faseIdx = fi;
      tampilBan(M.fase[fi][1]);
    }
    var sisaFase = batas[fi] - detik;
    pil.textContent = M.fase[fi][1] + ' ' + fmt(sisaFase) + '  •  ' + fmt(total - detik);
    detik++;
  }, 1000);
})();
