!function(){
if(window.__ALWI)return;window.__ALWI=1;

// Deteksi path → semua link menuju root
let pathParts = window.location.pathname.split('/').filter(Boolean);
let prefix;
let isRoot = pathParts.length <= 1; // true bila di root server (mis. /index.html)
if (pathParts.length <= 1) {
  prefix = './';
} else if (pathParts[0] === 'NURgenerator') {
  prefix = pathParts.length > 2 ? '../' : './';
} else {
  prefix = '/';
}
const CHAT_AI_URL = 'http://35.240.161.189:3000';

// 1. Buat Bola Helm ⛑️
let isDragging=false, startX, startY, vx=0, vy=0, x=window.innerWidth-80, y=window.innerHeight-120;
let ball=document.createElement('div');
ball.id="ALWI_BOLA";
ball.style.cssText=`position:fixed;left:${x}px;top:${y}px;z-index:999999999;width:60px;height:60px;background:radial-gradient(circle at 30% 30%,#7ec8ff,#0e7490);border-radius:50%;border:3px solid #00BFFF;box-shadow:0 0 20px rgba(0,191,255,0.5),0 0 40px rgba(0,191,255,0.3);font-size:32px;display:flex;align-items:center;justify-content:center;cursor:grab;user-select:none;transition:transform 0.1s;will-change:transform,left,top;`;
      ball.innerHTML=`<img src="http://34.170.37.50:8080/NURgenerator/img/icon-72.png" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">`;
document.body.appendChild(ball);

// 1b. Tombol HOME di atas bola (index utama)
let homeBtn=document.createElement('div');
homeBtn.id="ALWI_HOME_BTN";
homeBtn.style.cssText=`position:fixed;top:12px;left:12px;z-index:999999998;width:70px;height:36px;background:#0891b2;color:#fff;border:none;border-radius:18px;font-weight:800;font-size:11px;cursor:pointer;box-shadow:0 4px 15px rgba(0,191,255,0.4);transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:4px;`;
homeBtn.innerHTML="🏠 HOME";
homeBtn.onclick=function(){ goHome(); };
homeBtn.onpointerdown=function(e){ e.stopPropagation(); };
document.body.appendChild(homeBtn);

// 2. Buat Drop-Up Menu Navigasi Ringkas dengan Path Dinamis (Tanpa garis miring di depan)
let menu=document.createElement('div');
menu.id="ALWI_DROPUP";
menu.style.cssText="display:none;position:fixed;bottom:90px;right:15px;width:260px;background:#0a0a0a;border:2px solid #00BFFF;border-radius:14px;z-index:999999998;padding:8px;box-shadow:0 10px 30px rgba(0,191,255,0.3);flex-direction:column;gap:6px;max-height:70vh;overflow-y:auto;";
menu.innerHTML=`
  <div style="color:#00BFFF;font-size:12px;font-weight:800;padding:8px 8px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:#0a0a0a;z-index:10;">
    <span>📍 NAVIGASI</span>
    <span onclick="document.getElementById('ALWI_DROPUP').style.display='none'" style="cursor:pointer;color:#888;font-weight:bold;font-size:16px;">✕</span>
  </div>
  <button onclick="bukaTab('http://35.240.161.189:3000')" style="padding:9px 8px;background:#0284c7;color:#fff;border:1px solid #38bdf8;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🤖 TANYA ALWI (Chat AI)</button>
  `;
// 3. Modal Popup Fullscreen untuk Iframe
let modal=document.createElement('div');
modal.id="ALWI_MODAL";
modal.style.cssText="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.95);z-index:999999997;flex-direction:column;";
modal.innerHTML=`
  <div style="height:44px;background:#111;display:flex;align-items:center;justify-content:space-between;padding:0 12px;border-bottom:1px solid #222;">
    <span id="ALWI_MODAL_TITLE" style="color:#00BFFF;font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">📍 Loading...</span>
    <button onclick="tutupIframe()" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:11px;transition:all 0.2s;">TUTUP ✕</button>
  </div>
  <iframe id="ALWI_IFRAME" style="width:100%;flex:1;border:none;background:#fff;" allow="clipboard-read; clipboard-write; autoplay"></iframe>
`;
document.body.appendChild(modal);

let open=false;
function toggleMenu(){
  open=!open;
  menu.style.display=open?'flex':'none';
  if(open) menu.querySelector('button').focus();
}

window.goToPage=function(url){
  window.location.href=url;
}

window.bukaIframe=function(targetUrl){
  document.getElementById('ALWI_MODAL_TITLE').textContent="📍 " + (targetUrl.split('/').pop() || targetUrl);
  document.getElementById('ALWI_IFRAME').src = targetUrl;
  modal.style.display='flex';
  open=false;
  menu.style.display='none';
}

window.tutupIframe=function(){
  modal.style.display='none';
  document.getElementById('ALWI_IFRAME').src = '';
}

window.bukaTab=function(u){
  window.open(u,'_blank','noopener');
}

// HOME selalu menuju index.html portal (bebas isRoot)
window.goHome=function(){
  window.location.href='http://34.170.37.50:8080/index.html';
}

// === FITUR BOLA KARTUN LUCU UNTUK ANAK SD ===
let rotation=0, spinSpeed=0, gravity=0.35, bounce=0.75, friction=0.985;
let vyPhysical=0, vxPhysical=0, isAnimating=false;
let squishX=1, squishY=1;

// ==== ANIMASI HIDUP (berpikir/bicara) ====
let idleStyle=document.createElement('style');
idleStyle.textContent=`
@keyframes alwiGlow{0%,100%{box-shadow:0 0 18px rgba(0,191,255,.5),0 0 36px rgba(0,191,255,.28)}50%{box-shadow:0 0 30px rgba(0,191,255,.9),0 0 60px rgba(0,191,255,.55)}}
@keyframes alwiRing{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.9);opacity:0}}
@keyframes alwiIdleBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
`;
document.head.appendChild(idleStyle);

let ring=document.createElement('div');
ring.id="ALWI_RING";
ring.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:60px;height:60px;border-radius:50%;border:3px solid #00BFFF;z-index:999999989;pointer-events:none;opacity:0;`;
document.body.appendChild(ring);

function pulseRing(){
  ring.style.left=x+'px';
  ring.style.top=y+'px';
  ring.style.animation='none';
  void ring.offsetWidth;
  ring.style.animation='alwiRing 1.2s ease-out infinite';
}

function findIconImg(){
  var img=ball.querySelector('img');
  if(img) return img;
  var s=ball.querySelector('span');
  return s;
}

// Denyut idle = membuka-tutup cahaya (seperti berpikir)
setInterval(()=>{ if(!isDragging && !isAnimating){ pulseRing(); } },2600);

function updateBallPosition(){
  ball.style.left=x+'px';
  ball.style.top=y+'px';
  ball.style.transform=`rotate(${rotation}deg) scale(${squishX},${squishY})`;
  ring.style.left=x+'px';
  ring.style.top=y+'px';
  if(!isDragging && !isAnimating){
    ball.style.animation='alwiGlow 2.2s ease-in-out infinite';
  } else {
    ball.style.animation='none';
  }
}

function startPhysics(){
  if(isAnimating) return;
  isAnimating=true;
  function animate(){
    if(Math.abs(vxPhysical)<0.1 && Math.abs(vyPhysical)<0.1 && y>=window.innerHeight-65){
      isAnimating=false;
      squishX=1; squishY=1;
      updateBallPosition();
      return;
    }
    vyPhysical+=gravity;
    x+=vxPhysical;
    y+=vyPhysical;
    rotation+=spinSpeed;
    spinSpeed*=0.98;
    vxPhysical*=friction;
    
    // Pantul dari tanah
    if(y>window.innerHeight-60){
      y=window.innerHeight-60;
      vyPhysical*=-bounce;
      vxPhysical*=0.9;
      spinSpeed*=0.8;
      squishX=1.3; squishY=0.7;
      setTimeout(()=>{squishX=1;squishY=1;},100);
    }
    // Pantul dari atas
    if(y<5){
      y=5;
      vyPhysical*=-bounce;
      squishX=0.7; squishY=1.3;
      setTimeout(()=>{squishX=1;squishY=1;},100);
    }
    // Pantul dari kiri
    if(x<5){
      x=5;
      vxPhysical*=-bounce;
      squishX=0.7; squishY=1.3;
      setTimeout(()=>{squishX=1;squishY=1;},100);
    }
    // Pantul dari kanan
    if(x>window.innerWidth-60){
      x=window.innerWidth-60;
      vxPhysical*=-bounce;
      squishX=0.7; squishY=1.3;
      setTimeout(()=>{squishX=1;squishY=1;},100);
    }
    
    updateBallPosition();
    requestAnimationFrame(animate);
  }
  animate();
}

// Efek wajah lucu saat ditendang
let faceEmojis=['😅','🤪','😵‍💫','🫠','_RCC_','🥴','😜','😝'];
function showFunnyFace(){
  let img=ball.querySelector('img');
  if(img){
    let originalSrc=img.src;
    ball.innerHTML='<span style="font-size:40px;">'+faceEmojis[Math.floor(Math.random()*faceEmojis.length)]+'</span>';
    setTimeout(()=>{
ball.innerHTML=`<img src="http://34.170.37.50:8080/NURgenerator/img/icon-72.png" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">`;
    },800);
  }
}

// Efek jejak/ekor saat bergerak cepat
let trails=[];
function createTrail(){
  if(Math.sqrt(vxPhysical*vxPhysical+vyPhysical*vyPhysical)<3) return;
  let trail=document.createElement('div');
  trail.style.cssText=`position:fixed;left:${x+15}px;top:${y+15}px;width:30px;height:30px;background:radial-gradient(circle,rgba(0,191,255,0.4),transparent);border-radius:50%;z-index:999999990;pointer-events:none;transition:all 0.5s;`;
  document.body.appendChild(trail);
  trails.push(trail);
  setTimeout(()=>{trail.style.opacity='0';trail.style.transform='scale(2)';},10);
  setTimeout(()=>{trail.remove();trails.shift();},500);
}

ball.addEventListener('pointerdown',e=>{
  isDragging=true; 
  ball.setPointerCapture(e.pointerId); 
  startX=e.clientX; startY=e.clientY; 
  vx=0; vy=0; 
  vxPhysical=0; vyPhysical=0;
  ball.style.transition='none'; 
  homeBtn.style.transition='none'; 
  ball.style.cursor='grabbing';
  ball.style.transform='scale(1.1)';
});

ball.addEventListener('pointermove',e=>{
  if(!isDragging)return; 
  let dx=e.clientX-startX, dy=e.clientY-startY; 
  x+=dx; y+=dy; 
  vx=dx; vy=dy; 
  startX=e.clientX; 
  startY=e.clientY;
  rotation+=dx*2;
  updateBallPosition();
  createTrail();
});

ball.addEventListener('pointerup',e=>{
  isDragging=false; 
  ball.style.cursor='grab';
  ball.style.transform='scale(1)';
  let power=Math.sqrt(vx*vx+vy*vy);
  
  if(power>5){
    // TENDANG KUAT - bola terbang dan memutar!
    vxPhysical=vx*2.5;
    vyPhysical=vy*2.5-5;
    spinSpeed=vx*8;
    showFunnyFace();
    startPhysics();
  } else if(power>2){
    // Tendang ringan
    vxPhysical=vx*1.5;
    vyPhysical=vy*1.5-3;
    spinSpeed=vx*4;
    startPhysics();
  } else {
    // Klik biasa - di root buka Chat AI langsung, selain itu buka menu
    if (isRoot) { bukaTab(CHAT_AI_URL); }
    else { toggleMenu(); }
  }
});

document.addEventListener('click',e=>{
  if(!ball.contains(e.target) && !menu.contains(e.target) && !homeBtn.contains(e.target) && open){
    open=false;
    menu.style.display='none';
  }
});

window.addEventListener('resize',()=>{
  if(x>window.innerWidth-60) x=window.innerWidth-60;
  if(y>window.innerHeight-60) y=window.innerHeight-60;
  updateBallPosition();
});

// === SISTEM POIN (otomatis aktif di semua halaman) ===
let POIN_CFG={game:1,belajar:5,target:1000,adminWA:'6282147573665'};
function alwiUid(){let u=localStorage.getItem('alwi_uid');if(!u){u='U'+Date.now().toString(36)+Math.random().toString(36).substr(2,4);localStorage.setItem('alwi_uid',u);}return u;}
function alwiGetPoin(){return parseInt(localStorage.getItem('alwi_poin')||'0');}
function alwiNotifPoin(msg){
  let d=document.createElement('div');
  d.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#00BFFF,#00BFFF);color:#000;padding:14px 28px;border-radius:30px;font-weight:900;font-size:14px;z-index:999999999;box-shadow:0 4px 20px rgba(255,215,0,0.6);animation:alwiPopPoin .3s ease;white-space:nowrap;';
  d.textContent='⭐ '+msg;
  document.body.appendChild(d);
  setTimeout(()=>{d.style.opacity='0';d.style.transition='.3s'},2000);
  setTimeout(()=>d.remove(),2500);
}
let _poinStyle=document.createElement('style');
_poinStyle.textContent='@keyframes alwiPopPoin{from{transform:translateX(-50%) scale(0)}to{transform:translateX(-50%) scale(1)}}';
document.head.appendChild(_poinStyle);

function alwiTambahPoin(tipe){
  let n=tipe==='game'?POIN_CFG.game:POIN_CFG.belajar;
  let now=alwiGetPoin()+n;
  localStorage.setItem('alwi_poin',now);
  alwiNotifPoin('+'+n+' Poin! ('+tipe+')');
  alwiUpdateBadgePoin();
  alwiCekTarget();
  return now;
}

// Otomatis redirect ke WA saat poin mencapai target (>=1000)
function alwiCekTarget(){
  let p=alwiGetPoin();
  if(p>=POIN_CFG.target){
    if(localStorage.getItem('alwi_poin_claimed')==='1') return;
    localStorage.setItem('alwi_poin_claimed','1');
    let m='🎉 *SELAMAT! POIN MENCAPAI TARGET!*\n\n👤 User: '+alwiUid()+'\n💰 Poin: *'+p+'*\n🎯 Target: '+POIN_CFG.target+'\n\nSilakan klaim hadiahmu ke admin!';
    alwiNotifPoin('🎉 Target tercapai! Arahkan ke WA...');
    setTimeout(()=>{ window.open('https://wa.me/'+POIN_CFG.adminWA+'?text='+encodeURIComponent(m),'_blank'); },1500);
  }
}

function alwiUpdateBadgePoin(){
  let badge=document.getElementById('ALWI_POIN_BADGE');
  if(badge) badge.textContent='⭐ '+alwiGetPoin();
}

window.poinGame=function(){alwiTambahPoin('game');};
window.poinBelajar=function(){alwiTambahPoin('belajar');};
window.cekPoinWA=function(){
  let p=alwiGetPoin(),sisa=Math.max(0,POIN_CFG.target-p);
  let m='⭐ *POIN ALWI* ⭐\n\n💰 Poin: *'+p+'*\n🎯 Target: '+POIN_CFG.target+'\n📊 Progress: '+Math.round(p/POIN_CFG.target*100)+'%\n';
  m+=p>=POIN_CFG.target?'\n✅ *Siap tukar!*':'\n🔄 Kurang '+sisa+' poin';
  window.open('https://wa.me/'+POIN_CFG.adminWA+'?text='+encodeURIComponent(m),'_blank');
};
window.tukarPoinWA=function(){
  let p=alwiGetPoin();
  if(p<POIN_CFG.target){alwiNotifPoin('Belum cukup! Minimal '+POIN_CFG.target);return;}
  let m='🎉 *TUKAR POIN*\n\n👤 User: '+alwiUid()+'\n💰 Ditukar: '+POIN_CFG.target+' poin\n\nKlaim hadiah ke admin!';
  window.open('https://wa.me/'+POIN_CFG.adminWA+'?text='+encodeURIComponent(m),'_blank');
};
window.infoPoin=function(){return{uid:alwiUid(),poin:alwiGetPoin(),target:POIN_CFG.target,progress:Math.round(alwiGetPoin()/POIN_CFG.target*100)+'%'};};

// Tambahkan badge poin + tombol cek ke menu
let poinBadge=document.createElement('div');
poinBadge.id="ALWI_POIN_BADGE";
poinBadge.style.cssText=`position:fixed;top:12px;right:12px;z-index:999999998;background:#00BFFF;color:#000;padding:4px 12px;border-radius:12px;font-weight:900;font-size:11px;box-shadow:0 2px 10px rgba(255,215,0,0.4);cursor:pointer;transition:all 0.3s;`;
poinBadge.textContent='⭐ '+alwiGetPoin();
poinBadge.onclick=function(e){e.stopPropagation();cekPoinWA();};
document.body.appendChild(poinBadge);

}();
/* ==================== ADZAN OTOMATIS (semua halaman ber-bubble) ==================== */
(function(){
  if (window.__alwiAdzan) return; window.__alwiAdzan = true;
  const AZ = { Subuh:'Adzan-Shubuh-Abu-Hazim.mp3', Dzuhur:'Adzan-Misyari-Rasyid.mp3', Ashar:'Adzan-Misyari-Rasyid.mp3', Maghrib:'Mecca-Adzan-2.mp3', Isya:'Pakistan-Adzan.mp3' };
  const on = () => localStorage.getItem('alwiAdzan') === '1';
  let jadwalAz = null, tglAz = '', audioAz = null;
  const pill = document.createElement('div');
  pill.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000;background:#0a3a5a;color:#ffd700;border:1px solid #ffd700;border-radius:99px;padding:6px 12px;font:600 11px system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4)';
  function setPill(){ pill.textContent = on() ? '\uD83D\uDD14 Adzan ON' : '\uD83D\uDD15 Adzan OFF'; }
  setPill();
  pill.addEventListener('click', () => {
    localStorage.setItem('alwiAdzan', on() ? '0' : '1');
    if (!on() && audioAz) { audioAz.pause(); audioAz = null; } // matikan yang sedang bunyi
    setPill();
    if (on()) { jadwalAz = null; cek(); } // langsung cek saat diaktifkan
  });
  function pasang(){ if (!isRoot) (document.body || document.documentElement).appendChild(pill); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang); else pasang();
  async function ambilJadwal(){
    const d = new Date();
    const key = String(d.getDate()).padStart(2,'0') + '-' + String(d.getMonth()+1).padStart(2,'0');
    if (tglAz === key && jadwalAz) return jadwalAz;
    const r = await fetch('/api/adzan/jadwal');
    const j = await r.json();
    jadwalAz = j.times; tglAz = key;
    return jadwalAz;
  }
  async function cek(){
    try {
      if (!on()) return;
      const t = await ambilJadwal();
      const now = new Date().toLocaleTimeString('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',hour12:false});
      for (const [nama, jam] of Object.entries(t)) {
        const kunci = tglAz + '|' + nama;
        if (jam === now && !terkirim.has(kunci)) {
          terkirim.add(kunci);
          audioAz = new Audio('/ADZAN/' + AZ[nama]);
          audioAz.play().catch(()=>{});
        }
      }
      if (terkirim.size > 10) { const hariIni = [...terkirim].filter(k=>k.startsWith(tglAz)); terkirim.clear(); hariIni.forEach(k=>terkirim.add(k)); }
    } catch(e){}
  }
  setInterval(cek, 15000);
})();
/* ================== AKHIR ADZAN OTOMATIS ==================== */

/* ==================== TOMBOL NAVIGASI ==================== */
(function(){
  if (window.__alwiNav) return; window.__alwiNav = true;
  function pasang(){
    var b = document.createElement('a');
    b.href = 'navigasi.html';
    b.style.cssText = 'position:fixed;left:12px;bottom:44px;z-index:2147483000;background:#0a3a5a;color:#ffd700;border:1px solid #ffd700;border-radius:99px;padding:6px 12px;font:600 11px system-ui,sans-serif;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.4)';
    b.textContent = '\uD83E\uDDED Navigasi';
    (document.body || document.documentElement).appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang); else pasang();
})();



/* ================= FOLDER NAV + ADZAN v2 ================= */
(function(){
  var pp = location.pathname.split('/').filter(Boolean);
  var prefix = (pp[0]==='NURgenerator') ? (pp.length>2?'../':'./') : (pp.length<=1 ? './' : '/');

  /* --- deretan tombol SEMUA FOLDER di dropup --- */
  function pasangFolder(){
    var menu = document.getElementById('ALWI_DROPUP');
    if (!menu || menu.getAttribute('data-folder')) return;
    menu.setAttribute('data-folder','1');
    var F=[
 
      ['game','\uD83D\uDD79\uFE0F GAME'],
    
      ['kuis','\u2755 KUIS'],
      ['kamera-hantu','\uD83D\uDC7B KAMERA HANTU'],
      ['pencuri','\uD83D\uDD75\uFE0F PENCURI'],
      ['mobil','\uD83D\uDE97 MOBIL'],
      ['netflix','\uD83C\uDFAC NETFLIX'],
      ['konten','\uD83D\uDCDA KONTEN'],
      ['meta_bisnis','\uD83D\uDCBC META BISNIS'],
 
      ['alwiSD','\uD83E\uDDEE ALWI SD'],
      ['fiturBARU','\u2728 FITUR BARU'],
      ['peta','\uD83D\uDDFA\uFE0F PETA & NASA'],
      ['setting','\u2699\uFE0F SETTING']
    ];
    var frag=document.createDocumentFragment();
    var dv=document.createElement('div');
    dv.textContent='\uD83D\uDCC1 SEMUA FOLDER';
    dv.style.cssText='color:#00BFFF;font-size:10px;font-weight:800;padding:6px 8px 2px;letter-spacing:1px;';
    frag.appendChild(dv);
    F.forEach(function(f){
      var x=document.createElement('button');
      x.textContent=f[1];
      x.style.cssText="padding:8px;background:#111;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;width:100%;";
      x.onclick=function(){ bukaIframe(prefix+f[0]+'/index.html'); };
      frag.appendChild(x);
    });
    var head=menu.firstChild;
    if(head){ menu.insertBefore(frag, head.nextSibling); } else { menu.appendChild(frag); }
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',function(){setTimeout(pasangFolder,400);}); }
  else{ setTimeout(pasangFolder,400); }

  // ===== WIDGET TEKS BERJALAN ADZAN (muncul tiap 5 menit, kecil & non-intrusif) =====
  var adzanJam = [
    {nama:'Subuh',jam:'04:31'},{nama:'Dzuhur',jam:'11:48'},{nama:'Ashar',jam:'15:07'},
    {nama:'Maghrib',jam:'17:47'},{nama:'Isya',jam:'18:57'}
  ];
  var adzanW = document.createElement('div');
  adzanW.id='ALWI_ADZAN_WIDGET';
  adzanW.style.cssText="display:none;position:fixed;right:12px;bottom:78px;z-index:999999996;width:260px;background:rgba(0,0,0,.85);border:2px solid #ffd700;border-radius:10px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.5);";
  adzanW.innerHTML='<marquee id="ALWI_ADZAN_WIDGET_MQ" scrollamount="4" style="display:block;font-size:12px;font-weight:800;color:#ffd700;padding:5px 6px;letter-spacing:.3px;">🕌 Memuat jadwal adzan...</marquee>';
  document.body.appendChild(adzanW);

  function adzanDetik(j){
    var p=j.split(':'); return parseInt(p[0],10)*3600+parseInt(p[1],10)*60;
  }
  function adzanMsg(){
    var n=new Date();
    var ds=n.getHours()*3600+n.getMinutes()*60+n.getSeconds();
    var next=null, menit=null;
    for(var i=0;i<adzanJam.length;i++){
      var d0=adzanDetik(adzanJam[i].jam);
      if(d0>ds){ next=adzanJam[i]; menit=d0-ds; break; }
    }
    if(!next){ next=adzanJam[0]; menit=86400-ds+adzanDetik(next.jam); }
    // masa adzan aktif 15 menit
    for(var k=0;k<adzanJam.length;k++){
      var s=adzanDetik(adzanJam[k].jam);
      if(ds>=s && ds<=s+900) return '🔊 ADZAN '+adzanJam[k].nama.toUpperCase()+' BERKUMANDANG — HORMATI WAKTU (15 MENIT). MOHON BERHENTI SEJENAK, KEMBALI KE FITRAH. 🕌';
    }
    if(menit<=120) return '⏰ 2 MENIT MENUJU ADZAN '+next.nama.toUpperCase()+' ('+next.jam+') — PERSIAPKAN DIRI. 🕌 INDRAMAYU';
    return '🕌 ADZAN '+next.nama.toUpperCase()+' ('+next.jam+') MENJELANG — INDRAMAYU. PERSIAPKAN IBADAH ANDA.';
  }
  function adzanTampil(){
    document.getElementById('ALWI_ADZAN_WIDGET_MQ').textContent = adzanMsg();
    adzanW.style.display='block';
    setTimeout(function(){ adzanW.style.display='none'; }, 20000);
  }
  // muncul tiap 5 menit
  setInterval(adzanTampil, 300000);
  // tampil 5 detik setelah halaman load
  setTimeout(adzanTampil, 5000);
})();

/* ==================== BANK BRI DOMPET (alwi_bubble4) ==================== */
(function(){
  if (window.__alwiBri) return; window.__alwiBri=true;
  const API='http://34.170.37.50:8000';
  const defVA='777770000000000001';
  let pnl=document.createElement('div');
  pnl.id='ALWI_BRI_PANEL';
  pnl.style.cssText='display:none;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:350px;max-width:94vw;max-height:84vh;overflow:auto;background:#0a0a0a;border:2px solid #00BFFF;border-radius:14px;z-index:9999999993;padding:14px;color:#e2e8f0;font:13px system-ui,sans-serif;box-shadow:0 12px 50px rgba(0,0,0,.7);';
  pnl.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #222;padding-bottom:8px;margin-bottom:10px">
      <b style="color:#00BFFF;font-size:14px">\uD83C\uDFE6 BANK BRI — DOMPET INDRA MAYU</b>
      <span onclick="briTutup()" style="cursor:pointer;color:#888;font-weight:bold;font-size:18px">\u2715</span></div>
    <div style="font-size:11px;color:#64748b;margin-bottom:8px">Mode sandbox BRI SNAP \u00B7 API 34.170.37.50:8000</div>
    <label style="font-size:11px;color:#94a3b8">\uD83D\uDC64 Nama</label>
    <input id="ALWI_BRI_NAME" value="Player Alwi" style="width:100%;background:#111;border:1px solid #333;color:#fff;border-radius:8px;padding:8px;box-sizing:border-box;margin:2px 0 8px" />
    <label style="font-size:11px;color:#94a3b8">\uD83C\uDFE7 No. VA / Rekening</label>
    <input id="ALWI_BRI_ACC" value="${defVA}" style="width:100%;background:#111;border:1px solid #333;color:#fff;border-radius:8px;padding:8px;box-sizing:border-box;margin:2px 0 8px" />
    <label style="font-size:11px;color:#94a3b8">\uD83D\uDCB5 Nominal (Rp)</label>
    <input id="ALWI_BRI_AMT" value="10000" type="number" style="width:100%;background:#111;border:1px solid #333;color:#fff;border-radius:8px;padding:8px;box-sizing:border-box;margin:2px 0 10px" />
    <button onclick="briSaldo()" style="width:100%;padding:10px;background:linear-gradient(135deg,#0284c7,#0e7490);color:#fff;border:none;border-radius:9px;font-weight:800;cursor:pointer;margin-bottom:6px">\uD83D\uDCB0 CEK SALDO</button>
    <button onclick="briMutasi()" style="width:100%;padding:10px;background:linear-gradient(135deg,#0f766e,#065f46);color:#fff;border:none;border-radius:9px;font-weight:800;cursor:pointer;margin-bottom:6px">\uD83D\uDCDC MUTASI 7 HARI</button>
    <button onclick="briTransfer()" style="width:100%;padding:10px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;border:none;border-radius:9px;font-weight:800;cursor:pointer;margin-bottom:6px">\uD83C\uDFE6 TRANSFER VA</button>
    <button onclick="briPoin()" style="width:100%;padding:10px;background:linear-gradient(135deg,#ca8a04,#d97706);color:#000;border:none;border-radius:9px;font-weight:800;cursor:pointer;margin-bottom:6px">\u2B50 CEK POIN SAYA</button>
    <button onclick="briRedeem()" style="width:100%;padding:10px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;border:none;border-radius:9px;font-weight:800;cursor:pointer;margin-bottom:8px">\uD83C\uDF81 TUKAR 1000 POIN → RP10.000</button>
    <pre id="ALWI_BRI_OUT" style="background:#020617;border:1px solid #334155;border-radius:9px;padding:10px;font:11px/1.45 ui-monospace,monospace;color:#86efac;white-space:pre-wrap;word-break:break-word;max-height:180px;overflow:auto">Hasil akan muncul di sini... \u2B04</pre>`;
  document.body.appendChild(pnl);

  function uid(){
    let u=localStorage.getItem('alwi_uid');
    if(!u){u='U'+Date.now().toString(36)+Math.random().toString(36).substr(2,4);localStorage.setItem('alwi_uid',u);}
    return u;
  }
  function inp(id){let e=document.getElementById(id);return e?e.value.trim():'';}
  function setOut(t){let o=document.getElementById('ALWI_BRI_OUT');if(o)o.textContent=t;}
  function api(path,method,body){
    return fetch(API+path,{method:method||'GET',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined})
      .then(function(r){return r.json().catch(function(){return {ok:false,error:'response-not-json',http:r.status};});});
  }
  function tampil(res){
    let t=res&&res.data?res.data:JSON.stringify(res,null,1);
    try{ if(typeof t==='string') t=JSON.stringify(JSON.parse(t),null,1); }catch(e){}
    setOut('💬 '+(res&&res.ok?'OK ✅':'GAGAL ⚠️')+'\n'+(t||''));
    return res;
  }

  window.briTutup=function(){pnl.style.display='none';};
  window.briBuka=function(){pnl.style.display='block';};
  window.briSaldo=function(){
    let a=inp('ALWI_BRI_ACC')||defVA;
    setOut('⏳ Cek saldo '+a+'...');
    api('/api/balance','POST',{account_no:a}).then(tampil);
  };
  function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  window.briMutasi=function(){
    let a=inp('ALWI_BRI_ACC')||defVA;
    let end=new Date(), start=new Date(end.getTime()-6*864e5);
    setOut('⏳ Ambil mutasi 7 hari...');
    api('/api/statement','POST',{account_no:a,start_date:ymd(start),end_date:ymd(end)}).then(tampil);
  };
  window.briTransfer=function(){
    let a=inp('ALWI_BRI_ACC')||defVA, amt=Math.round(Number(inp('ALWI_BRI_AMT'))||0)||10000;
    setOut('⏳ Transfer VA '+amt+' → '+a+'...');
    api('/api/transfer/va','POST',{customer_no:a,amount:amt,ref:'BUBBLE-'+Date.now().toString(36)}).then(tampil);
  };
  window.briPoin=function(){
    let u=uid();
    setOut('⏳ Cek poin '+u+'...');
    api('/api/poin?uid='+encodeURIComponent(u)).then(function(d){
      if(d&&d.ok){setOut('⭐ Poin: '+d.poin+' / '+d.target+'\nNilai: Rp '+d.nilai_idr+'\nSisa: '+d.sisa+'\nBisa tukar: '+(d.bisa_tukar?'YA 🎉':'belum'));}
      else {setOut('💬 GAGAL ⚠️\n'+JSON.stringify(d,null,1));}
    });
  };
  window.briRedeem=function(){
    let u=uid(), nm=inp('ALWI_BRI_NAME')||'Player', a=inp('ALWI_BRI_ACC')||defVA;
    let p=parseInt(localStorage.getItem('alwi_poin')||'0',10);
    setOut('⏳ Sinkron poin ('+p+') '+u+'...');
    api('/api/poin/sync','POST',{uid:u,poin:p,name:nm,account_no:a}).then(function(s){
      if(!(s&&s.ok)){setOut('💬 GAGAL ⚠️\n'+JSON.stringify(s,null,1));return;}
      setOut('⏳ Tukar poin → BRI (ref berjalan)...');
      api('/api/poin/redeem','POST',{uid:u,name:nm,account_no:a}).then(function(r){
        if(r&&r.ok){
          localStorage.setItem('alwi_poin',String(parseInt(r.poin,10)||0));
          if(window.alwiUpdateBadgePoin)alwiUpdateBadgePoin();
          if(window.__alwiBri_last) alwiNotifPoin('🎁 Tukar berhasil!');
        }
        tampil(r);
      });
    });
  };
  // tombol di drop-up menu (setelah tombol TANYA ALWI)
  function pasang(){
    let m=document.getElementById('ALWI_DROPUP');
    if(!m||m.getAttribute('data-bri'))return;
    m.setAttribute('data-bri','1');
    let b=document.createElement('button');
    b.textContent='\uD83C\uDFE6 BANK BRI (Dompet)';
    b.style.cssText='padding:9px 8px;background:#0e7490;color:#fff;border:1px solid #38bdf8;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;width:100%;';
    b.onclick=function(){m.style.display='none';window.briBuka();};
    let nav=m.querySelector('button');
    if(nav) m.insertBefore(b,nav.nextSibling); else m.appendChild(b);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(pasang,300);});
  else setTimeout(pasang,300);
})();
/* =================== AKHIR BANK BRI DOMPET ==================== */

/* ==================== KARTU MEMBER ALWI (login WA ringan) ==================== */
(function(){
  if (window.__alwiMember) return; window.__alwiMember=true;
  const API='http://34.170.37.50:8000';
  const TARGET=1000, ADMIN_WA='6282147573665';
  let pnl=document.createElement('div');
  pnl.id='ALWI_MEMBER_PANEL';
  pnl.style.cssText='display:none;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:340px;max-width:94vw;max-height:84vh;overflow:auto;background:#0a0a0a;border:2px solid #ffd700;border-radius:14px;z-index:9999999993;padding:14px;color:#e2e8f0;font:13px system-ui,sans-serif;box-shadow:0 12px 50px rgba(0,0,0,.7);';
  pnl.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #222;padding-bottom:8px;margin-bottom:10px">
      <b style="color:#ffd700;font-size:14px">\uD83D\uDCB3 KARTU MEMBER — ALWI CLUB</b>
      <span onclick="memberTutup()" style="cursor:pointer;color:#888;font-weight:bold;font-size:18px">\u2715</span></div>
    <div style="font-size:11px;color:#64748b;margin-bottom:8px">Login ringan via WhatsApp · butuh \u2B50 1000 poin utk tukar</div>
    <label style="font-size:11px;color:#94a3b8">\uD83D\uDC64 Nama</label>
    <input id="ALWI_MEMBER_NAME" style="width:100%;background:#111;border:1px solid #333;color:#fff;border-radius:8px;padding:8px;box-sizing:border-box;margin:2px 0 8px" placeholder="Nama kamu..." />
    <label style="font-size:11px;color:#94a3b8">\uD83D\uDCF1 No. WhatsApp</label>
    <input id="ALWI_MEMBER_WA" inputmode="numeric" style="width:100%;background:#111;border:1px solid #333;color:#fff;border-radius:8px;padding:8px;box-sizing:border-box;margin:2px 0 10px" placeholder="628xxxxxxxxx" />
    <button onclick="memberSimpan()" style="width:100%;padding:10px;background:linear-gradient(135deg,#f59e0b,#b45309);color:#000;border:none;border-radius:9px;font-weight:800;cursor:pointer;margin-bottom:6px">\uD83D\uDCBE SIMPAN MEMBER</button>
    <button onclick="memberStatus()" style="width:100%;padding:10px;background:linear-gradient(135deg,#0e7490,#155e75);color:#fff;border:none;border-radius:9px;font-weight:800;cursor:pointer;margin-bottom:6px">\uD83D\uDCDC POIN & DATA TRANSPARAN (JSON)</button>
    <button onclick="memberChat()" style="width:100%;padding:10px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;border:none;border-radius:9px;font-weight:800;cursor:pointer;margin-bottom:8px">\uD83D\uDCAC CHAT ADMIN</button>
    <div id="ALWI_MEMBER_CARD" style="border:1px solid #ffd700;border-radius:10px;padding:10px;margin-bottom:8px;font-size:12px;line-height:1.7">
      <div style="color:#ffd700;font-weight:800;font-size:13px">\uD83D\uDCB3 KARTU MEMBER</div>
      <div id="ALWI_MEMBER_CARD_ISI">Belum login — isi nama & no WA lalu SIMPAN.</div>
    </div>
    <pre id="ALWI_MEMBER_OUT" style="background:#020617;border:1px solid #334155;border-radius:9px;padding:10px;font:11px/1.45 ui-monospace,monospace;color:#86efac;white-space:pre-wrap;word-break:break-word;max-height:150px;overflow:auto">Data transparan muncul di sini...</pre>`;
  document.body.appendChild(pnl);

  function uid(){
    let u=localStorage.getItem('alwi_uid');
    if(!u){u='U'+Date.now().toString(36)+Math.random().toString(36).substr(2,4);localStorage.setItem('alwi_uid',u);}
    return u;
  }
  function inp(id){let e=document.getElementById(id);return e?e.value.trim():'';}
  function setOut(t){let o=document.getElementById('ALWI_MEMBER_OUT');if(o)o.textContent=t;}
  function cwa(){return localStorage.getItem('alwi_member_wa')||'';}
  function cnama(){return localStorage.getItem('alwi_member_name')||'';}
  function cpoin(){return parseInt(localStorage.getItem('alwi_poin')||'0',10);}
  function api(path,method,body){
    return fetch(API+path,{method:method||'GET',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined})
      .then(function(r){return r.json().catch(function(){return {ok:false,error:'response-not-json',http:r.status};});});
  }

  window.memberTutup=function(){pnl.style.display='none';};
  window.memberBuka=function(){pnl.style.display='block';memberGambar();};
  window.memberSimpan=function(){
    let w=inp('ALWI_MEMBER_WA').replace(/\D/g,'');
    let n=inp('ALWI_MEMBER_NAME')||'Member Alwi';
    if(w.length<9){setOut('❌ Nomor WA tidak valid (min 9 digit).');return;}
    localStorage.setItem('alwi_member_wa',w);
    localStorage.setItem('alwi_member_name',n);
    memberGambar();
    setOut('✅ Member tersimpan!\n📱 '+n+' · '+w+'\n🪪 UID : '+uid()+'\n⭐ Poin : '+cpoin()+' / '+TARGET);
  };
  function memberGambar(){
    let isi=document.getElementById('ALWI_MEMBER_CARD_ISI');
    if(!isi)return;
    if(!cwa()){isi.textContent='Belum login — isi nama & no WA lalu SIMPAN.';return;}
    let p=cpoin(), pr=Math.min(100,Math.round(p/TARGET*100));
    isi.innerHTML='<b>📱 WA:</b> '+cwa()+'<br><b>👤 Nama:</b> '+cnama()+'<br><b>🪪 UID:</b> '+uid()+'<br><b>⭐ Poin:</b> '+p+' / '+TARGET+' ('+pr+'%)<br><div style="background:#1e293b;border-radius:99px;height:9px;overflow:hidden;margin-top:6px"><div style="height:100%;width:'+pr+'%;background:linear-gradient(90deg,#00BFFF,#ffd700)"></div></div>';
  }
  window.memberStatus=function(){
    let u=uid(), p=cpoin();
    setOut('⏳ Ambil data dari server (transparan)...');
    api('/api/poin?uid='+encodeURIComponent(u)).then(function(d){
      let hasil={
        member:{wa:cwa()||'(belum)',nama:cnama()||'(belum)',uid:u,target_poin:TARGET},
        poin_lokal:p,
        server:d&&d.ok?{poin:d.poin,target:d.target,nilai_idr:d.nilai_idr,bisa_tukar:d.bisa_tukar,sisa:d.sisa}:d
      };
      setOut(JSON.stringify(hasil,null,1));
    });
  };
  window.memberChat=function(){
    let u=uid(), p=cpoin();
    let m='💳 *MEMBER ALWI CLUB*\n\n🪪 UID: '+u+'\n📱 WA: '+(cwa()||'-')+'\n👤 Nama: '+(cnama()||'-')+'\n⭐ Poin: '+p+' / '+TARGET+'\n\nHalo admin, ini data member saya.';
    window.open('https://wa.me/'+ADMIN_WA+'?text='+encodeURIComponent(m),'_blank');
  };
  // tombol di drop-up menu (setelah BANK BRI)
  function pasang(){
    let m=document.getElementById('ALWI_DROPUP');
    if(!m||m.getAttribute('data-member'))return;
    m.setAttribute('data-member','1');
    let b=document.createElement('button');
    b.textContent='\uD83D\uDCB3 KARTU MEMBER (WA)';
    b.style.cssText='padding:9px 8px;background:#92400e;color:#fff;border:1px solid #f59e0b;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;width:100%;';
    b.onclick=function(){m.style.display='none';window.memberBuka();};
    let ref=null, bs=m.querySelectorAll('button');
    for(let i=0;i<bs.length;i++){if((bs[i].textContent||'').indexOf('BANK BRI')>=0){ref=bs[i];break;}}
    if(ref&&ref.nextSibling) m.insertBefore(b,ref.nextSibling); else m.appendChild(b);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(pasang,400);});
  else setTimeout(pasang,400);
})();
/* =================== AKHIR KARTU MEMBER ALWI ==================== */
