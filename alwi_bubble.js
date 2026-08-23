!function(){
if(window.__ALWI)return;window.__ALWI=1;

// Deteksi apakah sedang berada di dalam subfolder atau root
let isInSubfolder = window.location.pathname.split('/').filter(Boolean).length > 1;
let prefix = isInSubfolder ? "../" : "./";

// 1. Buat Bola Helm ⛑️
let isDragging=false, startX, startY, vx=0, vy=0, x=window.innerWidth-80, y=window.innerHeight-120;
let ball=document.createElement('div');
ball.id="ALWI_BOLA";
ball.style.cssText=`position:fixed;left:${x}px;top:${y}px;z-index:999999999;width:60px;height:60px;background:radial-gradient(circle at 30% 30%,#2aff7a,#128C7E);border-radius:50%;border:3px solid #FFD700;box-shadow:0 0 20px rgba(42,255,122,0.5),0 0 40px rgba(42,255,122,0.3);font-size:32px;display:flex;align-items:center;justify-content:center;cursor:grab;user-select:none;transition:transform 0.1s;will-change:transform,left,top;`;
ball.innerHTML=`<img src="${prefix}img/icon_512.png" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">`;
document.body.appendChild(ball);

// 1b. Tombol HOME di atas bola (index utama)
let homeBtn=document.createElement('div');
homeBtn.id="ALWI_HOME_BTN";
homeBtn.style.cssText=`position:fixed;left:${x-5}px;top:${y-50}px;z-index:999999998;width:70px;height:36px;background:#25D366;color:#fff;border:none;border-radius:18px;font-weight:800;font-size:11px;cursor:pointer;box-shadow:0 4px 15px rgba(37,211,102,0.4);transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:4px;`;
homeBtn.innerHTML="🏠 HOME";
homeBtn.onclick=function(){ window.goToPage(prefix+'index.html'); };
homeBtn.onpointerdown=function(e){ e.stopPropagation(); };
document.body.appendChild(homeBtn);

// 2. Buat Drop-Up Menu Navigasi Ringkas dengan Path Dinamis (Tanpa garis miring di depan)
let menu=document.createElement('div');
menu.id="ALWI_DROPUP";
menu.style.cssText="display:none;position:fixed;bottom:90px;right:15px;width:260px;background:#0a0a0a;border:2px solid #25D366;border-radius:14px;z-index:999999998;padding:8px;box-shadow:0 10px 30px rgba(37,211,102,0.3);flex-direction:column;gap:6px;max-height:70vh;overflow-y:auto;";
menu.innerHTML=`
  <div style="color:#25D366;font-size:12px;font-weight:800;padding:8px 8px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:#0a0a0a;z-index:10;">
    <span>📍 NAVIGASI</span>
    <span onclick="document.getElementById('ALWI_DROPUP').style.display='none'" style="cursor:pointer;color:#888;font-weight:bold;font-size:16px;">✕</span>
  </div>
  <button onclick="bukaIframe('${prefix}Facebook_pusat/index.html')" style="padding:9px 8px;background:linear-gradient(135deg,#b31217,#e52d27);color:#fff;border:1px solid #ffb199;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🎮 ALWI GAME CENTER</button>
  <button onclick="bukaIframe('http://34.170.37.50:3000/index.html')" style="padding:9px 8px;background:#0284c7;color:#fff;border:1px solid #38bdf8;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🖥️ VPS Ollama Direct</button>
  <button onclick="bukaIframe('${prefix}pusat.html')" style="padding:9px 8px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🔴 AI ALWI PUSAT</button>
  <button onclick="bukaIframe('${prefix}index2.html')" style="padding:9px 8px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">👥 TANYA META AI</button>
  <button onclick="bukaIframe('${prefix}qa_lite.html')" style="padding:9px 8px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">❓ Q&A Lite</button>
  <button onclick="bukaIframe('${prefix}pasarGAIB.html')" style="padding:9px 8px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🛒 Pasar Gaib</button>
  <button onclick="bukaIframe('http://34.170.37.50:3000/meta/video-drive.html')" style="padding:9px 8px;background:#7f1d1d;color:#fff;border:1px solid #f00;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🎬 VIDEO DRIVE (ALWI Tube)</button>
  <button onclick="bukaIframe('${prefix}alwiSD/kalkulator.html')" style="padding:9px 8px;background:#0a3a5a;color:#00f0ff;border:1px solid #00f0ff;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🧮 Kalkulator Suara</button>
  <button onclick="bukaIframe('${prefix}privacy.html')" style="padding:9px 8px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🔒 Privacy Policy</button>
  <button onclick="bukaIframe('${prefix}setting/')" style="padding:9px 8px;background:#FFD700;color:#000;border:none;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">⚙️ SETTING</button>
`;
document.body.appendChild(menu);

// 3. Modal Popup Fullscreen untuk Iframe
let modal=document.createElement('div');
modal.id="ALWI_MODAL";
modal.style.cssText="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.95);z-index:999999997;flex-direction:column;";
modal.innerHTML=`
  <div style="height:44px;background:#111;display:flex;align-items:center;justify-content:space-between;padding:0 12px;border-bottom:1px solid #222;">
    <span id="ALWI_MODAL_TITLE" style="color:#25D366;font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">📍 Loading...</span>
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

// === FITUR BOLA KARTUN LUCU UNTUK ANAK SD ===
let rotation=0, spinSpeed=0, gravity=0.3, bounce=0.7, friction=0.99;
let vyPhysical=0, vxPhysical=0, isAnimating=false;
let squishX=1, squishY=1;

function updateBallPosition(){
  ball.style.left=x+'px';
  ball.style.top=y+'px';
  ball.style.transform=`rotate(${rotation}deg) scale(${squishX},${squishY})`;
  homeBtn.style.left=(x-5)+'px';
  homeBtn.style.top=(y-50)+'px';
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
      ball.innerHTML=`<img src="${prefix}img/icon_512.png" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">`;
    },800);
  }
}

// Efek jejak/ekor saat bergerak cepat
let trails=[];
function createTrail(){
  if(Math.sqrt(vxPhysical*vxPhysical+vyPhysical*vyPhysical)<3) return;
  let trail=document.createElement('div');
  trail.style.cssText=`position:fixed;left:${x+15}px;top:${y+15}px;width:30px;height:30px;background:radial-gradient(circle,rgba(42,255,122,0.4),transparent);border-radius:50%;z-index:999999990;pointer-events:none;transition:all 0.5s;`;
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
    // Klik biasa - buka menu
    toggleMenu();
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
  d.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;padding:14px 28px;border-radius:30px;font-weight:900;font-size:14px;z-index:999999999;box-shadow:0 4px 20px rgba(255,215,0,0.6);animation:alwiPopPoin .3s ease;white-space:nowrap;';
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
  return now;
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
poinBadge.style.cssText=`position:fixed;left:${x-5}px;top:${y-90}px;z-index:999999998;background:#FFD700;color:#000;padding:4px 12px;border-radius:12px;font-weight:900;font-size:11px;box-shadow:0 2px 10px rgba(255,215,0,0.4);cursor:pointer;transition:all 0.3s;`;
poinBadge.textContent='⭐ '+alwiGetPoin();
poinBadge.onclick=function(e){e.stopPropagation();cekPoinWA();};
document.body.appendChild(poinBadge);

// Update badge position saat bola gerak
let _origUpdate=updateBallPosition;
updateBallPosition=function(){
  _origUpdate();
  poinBadge.style.left=(x-5)+'px';
  poinBadge.style.top=(y-90)+'px';
};

// === FITUR MIC & SUARA (BOT HIDUP) ===
let micBtn=document.createElement('div');
micBtn.id="ALWI_MIC";
micBtn.style.cssText=`position:fixed;left:${x+65}px;top:${y+10}px;z-index:999999998;width:42px;height:42px;background:linear-gradient(135deg,#ef4444,#dc2626);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;box-shadow:0 2px 10px rgba(239,68,68,0.5);transition:all 0.3s;border:2px solid #fff;`;
micBtn.innerHTML='🎤';
micBtn.title='Klik untuk bicara';
document.body.appendChild(micBtn);

// Speech Recognition
let recognition=null;
let isListening=false;
let SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;

if(SpeechRecognition){
  recognition=new SpeechRecognition();
  recognition.continuous=false;
  recognition.interimResults=false;
  recognition.lang='id-ID';
  
  recognition.onresult=function(e){
    let transcript=e.results[0][0].transcript.toLowerCase().trim();
    alwiBotRespond(transcript);
  };
  
  recognition.onend=function(){
    isListening=false;
    micBtn.style.background='linear-gradient(135deg,#ef4444,#dc2626)';
    micBtn.innerHTML='🎤';
    micBtn.style.boxShadow='0 2px 10px rgba(239,68,68,0.5)';
  };
  
  recognition.onerror=function(){
    isListening=false;
    micBtn.style.background='linear-gradient(135deg,#ef4444,#dc2626)';
    micBtn.innerHTML='🎤';
    alwiBotSay('Maaf, saya tidak dengar. Coba lagi ya!');
  };
}

// Speech Synthesis
function alwiBotSay(text){
  if('speechSynthesis' in window){
    window.speechSynthesis.cancel();
    let u=new SpeechSynthesisUtterance(text);
    u.lang='id-ID';
    u.rate=1;
    u.pitch=1.1;
    // Cari suara Indonesia
    let voices=window.speechSynthesis.getVoices();
    let idVoice=voices.find(v=>v.lang.startsWith('id'));
    if(idVoice) u.voice=idVoice;
    window.speechSynthesis.speak(u);
  }
  alwiBotShowChat(text);
}

// Tampilkan chat bubble
function alwiBotShowChat(text){
  let chat=document.createElement('div');
  chat.style.cssText='position:fixed;bottom:160px;right:15px;max-width:240px;background:#25D366;color:#fff;padding:12px 16px;border-radius:16px 16px 4px 16px;font-size:12px;font-weight:600;z-index:999999997;box-shadow:0 4px 15px rgba(37,211,102,0.4);animation:alwiPopPoin .3s ease;line-height:1.5;word-wrap:break-word;';
  chat.textContent='🤖 '+text;
  document.body.appendChild(chat);
  setTimeout(()=>{chat.style.opacity='0';chat.style.transition='.5s';},4000);
  setTimeout(()=>chat.remove(),4500);
}

// Respon bot berdasarkan perintah suara
function alwiBotRespond(text){
  alwiBotShowChat('🎤 "'+text+'"');
  
  // KALKULATOR
  if(text.includes('kalkulator')||text.includes('hitung')||text.includes('kalkulasi')){
    alwiBotSay('Oke, saya bukakan kalkulator!');
    setTimeout(()=>{bukaIframe(prefix+'alwiSD/kalkulator.html');},800);
  }
  // POIN
  else if(text.includes('poin')||text.includes('cek poin')){
    let p=alwiGetPoin();
    alwiBotSay('Poin kamu sekarang '+p+' poin. Target seribu poin untuk tukar hadiah.');
  }
  // HOME
  else if(text.includes('home')||text.includes('halaman utama')||text.includes('kembali')){
    alwiBotSay('Kembali ke halaman utama!');
    setTimeout(()=>{window.goToPage(prefix+'index.html');},800);
  }
  // GAME
  else if(text.includes('game')||text.includes('main')){
    alwiBotSay('Ayo main game! Saya bukakan game nya.');
    setTimeout(()=>{bukaIframe(prefix+'game/index.html');},800);
  }
  // BELAJAR
  else if(text.includes('belajar')||text.includes('belajar')){
    alwiBotSay('Semangat belajar! Yuk mulai.');
    setTimeout(()=>{bukaIframe(prefix+'alwiSD/index.html');},800);
  }
  // KUIS
  else if(text.includes('kuis')||text.includes('quiz')){
    alwiBotSay('Siap! Kuis menunggu kamu.');
    setTimeout(()=>{bukaIframe(prefix+'kuis/quiz.html');},800);
  }
  // AI
  else if(text.includes('ai')||text.includes('pusat')||text.includes('tanya')){
    alwiBotSay('AI ALWI Pusat siap membantu!');
    setTimeout(()=>{bukaIframe(prefix+'pusat.html');},800);
  }
  // WHATSAPP
  else if(text.includes('whatsapp')||text.includes('wa')){
    alwiBotSay('Membuka WhatsApp admin!');
    setTimeout(()=>{cekPoinWA();},800);
  }
  // NAMA
  else if(text.includes('siapa namamu')||text.includes('namamu')){
    alwiBotSay('Halo! Nama saya Alwi, bot pintar dari Indramayu Club!');
  }
  // HELLO
  else if(text.includes('halo')||text.includes('hai')||text.includes('hello')){
    let sapa=['Halo! Ada yang bisa saya bantu?','Hai! Senang berkenalan dengan kamu!','Hey! Mau main game atau belajar?'];
    alwiBotSay(sapa[Math.floor(Math.random()*sapa.length)]);
  }
  // DEFAULT
  else {
    alwiBotSay('Maaf, saya belum paham "'+text+'". Coba bilang: kalkulator, game, belajar, kuis, atau poin.');
  }
}

// Toggle mic
micBtn.onclick=function(e){
  e.stopPropagation();
  if(!SpeechRecognition){
    alwiBotSay('Browser kamu tidak support microphone. Coba pakai Chrome ya!');
    return;
  }
  if(isListening){
    recognition.stop();
    isListening=false;
  } else {
    isListening=true;
    micBtn.style.background='linear-gradient(135deg,#22c55e,#16a34a)';
    micBtn.innerHTML='🔴';
    micBtn.style.boxShadow='0 0 20px rgba(34,197,94,0.6)';
    alwiBotSay('Saya dengarkan...');
    recognition.start();
  }
};

// Load voices
if('speechSynthesis' in window){
  window.speechSynthesis.onvoiceschanged=function(){window.speechSynthesis.getVoices();};
}

// Update posisi mic saat bola gerak
let _origUpdate2=updateBallPosition;
updateBallPosition=function(){
  _origUpdate2();
  micBtn.style.left=(x+65)+'px';
  micBtn.style.top=(y+10)+'px';
};

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
  function pasang(){ (document.body || document.documentElement).appendChild(pill); }
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
    b.href = '/NAVIGASI.html';
    b.style.cssText = 'position:fixed;left:12px;bottom:44px;z-index:2147483000;background:#0a3a5a;color:#ffd700;border:1px solid #ffd700;border-radius:99px;padding:6px 12px;font:600 11px system-ui,sans-serif;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.4)';
    b.textContent = '\uD83E\uDDED Navigasi';
    (document.body || document.documentElement).appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang); else pasang();
})();


/* ==================== POIN PENJELAJAH NUR ==================== */
/* +5 poin per halaman baru per hari - Reset otomatis saat capai 1000 */
(function(){
  if (window.__alwiPoin) return; window.__alwiPoin = true;
  var K='alwiPoin', LOG='alwiPoinLog', TOT='alwiPoinTotal';
  var hari = new Date().toISOString().slice(0,10);
  var p = parseInt(localStorage.getItem(K)||'0',10);
  var tot = parseInt(localStorage.getItem(TOT)||'0',10);
  var log = {}; try { log = JSON.parse(localStorage.getItem(LOG)||'{}'); } catch(e){}
  for (var d in log){ if (d !== hari && new Date(d) < new Date(Date.now()-7*864e5)) delete log[d]; }

  function pillBuat(){
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:12px;bottom:78px;z-index:2147483000;background:#0a3a5a;color:#ffd700;border:1px solid #ffd700;border-radius:99px;padding:6px 12px;font:700 11px system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.4)';
    el.title = 'Poin Penjelajah NUR - total keseluruhan: '+tot;
    return el;
  }
  var pill = pillBuat();
  function gambar(){ pill.textContent = '\\uD83E\\uDE99 ' + p + ' / 1000'; }
  function simpan(){ localStorage.setItem(K,String(p)); localStorage.setItem(TOT,String(tot)); localStorage.setItem(LOG,JSON.stringify(log)); }
  function rayakan(){
    var o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:#0a1626ee;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px';
    o.innerHTML = '<div style="font-size:52px">\\uD83C\\uDF89</div>' +
      '<div style="color:#ffd700;font-size:20px;font-weight:900;margin:12px 0">SELAMAT! 1000 POIN TERCAPAI!</div>' +
      '<div style="font-size:13px;color:#eaf4ff;max-width:300px">Kamu Penjelajah Sejati NUR!<br>Total poin keseluruhanmu: <b style="color:#ffd700">'+tot+'</b></div>' +
      '<button onclick="this.parentElement.remove()" style="margin-top:18px;background:#ffd700;border:0;border-radius:99px;padding:10px 26px;font-weight:800;cursor:pointer">Lanjut Jelajah \\u27A1</button>';
    document.body.appendChild(o);
  }
  function tambah(n){
    p += n; tot += n;
    if (p >= 1000){ p = 0; simpan(); gambar(); setTimeout(rayakan, 400); return; }
    simpan(); gambar();
  }
  // Poin kunjungan: halaman unik per hari = +5
  if (!log[hari]) log[hari] = {};
  if (!log[hari][location.pathname]){ log[hari][location.pathname] = 1; tambah(5); }
  else { gambar(); }
  function pasang(){ (document.body || document.documentElement).appendChild(pill); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang); else pasang();
})();

/* ==== SUNTIKAN: KALKULATOR CEPAT (Server Memori ALWI :4000) ==== */
!function(){
  var API = (location.protocol === 'file:' ? 'http:' : location.protocol) + '//' + (location.hostname || '34.170.37.50') + ':8080';
  if (location.hostname === '' || location.hostname === 'localhost') API = 'http://34.170.37.50:8080';

  function buatPanel(){
    var p = document.createElement('div');
    p.id = 'ALWI_KALK';
    p.style.cssText = 'display:none;position:fixed;bottom:90px;right:15px;width:280px;background:#0a0a0a;border:2px solid #FFD700;border-radius:14px;z-index:999999996;padding:10px;box-shadow:0 10px 30px rgba(255,215,0,0.25);font-family:system-ui,sans-serif;';
    p.innerHTML =
      '<div style="color:#FFD700;font-size:12px;font-weight:800;display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;border-bottom:1px solid #222;">' +
      '<span>🧮 KALKULATOR CEPAT</span><span id="ALWI_KALK_X" style="cursor:pointer;color:#888;font-weight:bold;font-size:16px;">✕</span></div>' +
      '<input id="ALWI_KALK_IN" placeholder="cth: 5 kali 3 + (8-2)" autocomplete="off" style="width:100%;margin-top:8px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;padding:9px;font-size:14px;outline:none;" />' +
      '<div id="ALWI_KALK_HASIL" style="min-height:20px;color:#25D366;font-weight:800;font-size:15px;padding:6px 2px;text-align:right;"></div>' +
      '<div style="display:flex;gap:5px;margin-top:4px;">' +
      '<button data-s="20% dari 150" style="flex:1;background:#1a1a1a;color:#aaa;border:1px solid #333;border-radius:6px;font-size:10px;padding:6px 2px;cursor:pointer;">20%×150</button>' +
      '<button data-s="(8+2)*4/5" style="flex:1;background:#1a1a1a;color:#aaa;border:1px solid #333;border-radius:6px;font-size:10px;padding:6px 2px;cursor:pointer;">(8+2)*4÷5</button>' +
      '<button data-s="2 pangkat 10" style="flex:1;background:#1a1a1a;color:#aaa;border:1px solid #333;border-radius:6px;font-size:10px;padding:6px 2px;cursor:pointer;">2^10</button></div>' +
      '<button id="ALWI_KALK_GO" style="width:100%;margin-top:8px;background:linear-gradient(135deg,#f59e0b,#FFD700);border:none;border-radius:8px;color:#000;font-weight:900;padding:10px;font-size:13px;cursor:pointer;">HITUNG = </button>';
    document.body.appendChild(p);
    document.getElementById('ALWI_KALK_X').onclick = function(){ p.style.display = 'none'; };
    document.getElementById('ALWI_KALK_GO').onclick = hitung;
    document.getElementById('ALWI_KALK_IN').addEventListener('keydown', function(e){ if (e.key === 'Enter') hitung(); });
    Array.prototype.forEach.call(p.querySelectorAll('[data-s]'), function(b){
      b.onclick = function(){ document.getElementById('ALWI_KALK_IN').value = b.getAttribute('data-s'); hitung(); };
    });
  }

  function hitung(){
    var soal = document.getElementById('ALWI_KALK_IN').value.trim();
    var out = document.getElementById('ALWI_KALK_HASIL');
    if (!soal) { out.textContent = ''; return; }
    out.style.color = '#888'; out.textContent = 'menghitung...';
    fetch(API + '/api/kalkulator', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soal: soal })
    }).then(function(r){ return r.json(); }).then(function(d){
      if (d.ok) { out.style.color = '#25D366'; out.textContent = '= ' + d.hasil; }
      else { out.style.color = '#ef4444'; out.textContent = '⚠️ ' + (d.galat || 'gagal'); }
    }).catch(function(e){
      out.style.color = '#ef4444'; out.textContent = '⚠️ server tak terjangkau';
    });
  }

  window.bukaKalk = function(){
    var p = document.getElementById('ALWI_KALK');
    if (!p) buatPanel();
    p = document.getElementById('ALWI_KALK');
    var menu = document.getElementById('ALWI_DROPUP');
    if (menu) menu.style.display = 'none';
    p.style.display = p.style.display === 'block' ? 'none' : 'block';
    var i = document.getElementById('ALWI_KALK_IN');
    if (p.style.display === 'block') setTimeout(function(){ i.focus(); }, 50);
  };

  function pasangTombol(){
    var menu = document.getElementById('ALWI_DROPUP');
    if (!menu || menu.getAttribute('data-kalk')) return;
    menu.setAttribute('data-kalk', '1');
    var b = document.createElement('button');
    b.innerHTML = '🧮 KALKULATOR CEPAT';
    b.style.cssText = "padding:9px 8px;background:linear-gradient(135deg,#b8860b,#FFD700);color:#000;border:none;border-radius:8px;text-align:left;font-weight:800;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;";
    b.onclick = window.bukaKalk;
    var suara = null;
    var semua = menu.querySelectorAll('button');
    for (var i = 0; i < semua.length; i++) {
      if (semua[i].textContent.indexOf('Kalkulator Suara') > -1) { suara = semua[i]; break; }
    }
    if (suara) menu.insertBefore(b, suara); else menu.appendChild(b);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(pasangTombol, 300); });
  } else { setTimeout(pasangTombol, 300); }
}();

/* ================= MIC ALWI + FOLDER NAV v2 ================= */
(function(){
  var prefix = location.pathname.split('/').length > 2 ? '../' : './';

  /* --- deretan tombol SEMUA FOLDER di dropup --- */
  function pasangFolder(){
    var menu = document.getElementById('ALWI_DROPUP');
    if (!menu || menu.getAttribute('data-folder')) return;
    menu.setAttribute('data-folder','1');
    var F=[
      ['Facebook_pusat','\uD83C\uDFAE GAME CENTER'],
      ['game','\uD83D\uDD79\uFE0F GAME'],
      ['testgame','\uD83E\uDDEA TEST GAME'],
      ['kuis','\u2755 KUIS'],
      ['kamera-hantu','\uD83D\uDC7B KAMERA HANTU'],
      ['pencuri','\uD83D\uDD75\uFE0F PENCURI'],
      ['mobil','\uD83D\uDE97 MOBIL'],
      ['netflix','\uD83C\uDFAC NETFLIX'],
      ['konten','\uD83D\uDCDA KONTEN'],
      ['meta_folder','\uD83D\uDCC1 META FOLDER'],
      ['meta_bisnis','\uD83D\uDCBC META BISNIS'],
      ['static','\uD83E\uDEAA MEMBER'],
      ['alwiSD','\uD83E\uDDEE ALWI SD'],
      ['fiturBARU','\u2728 FITUR BARU'],
      ['peta','\uD83D\uDDFA\uFE0F PETA & NASA'],
      ['setting','\u2699\uFE0F SETTING']
    ];
    var frag=document.createDocumentFragment();
    var dv=document.createElement('div');
    dv.textContent='\uD83D\uDCC1 SEMUA FOLDER';
    dv.style.cssText='color:#FFD700;font-size:10px;font-weight:800;padding:6px 8px 2px;letter-spacing:1px;';
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

  /* --- tombol MIC melayang --- */
  var mic=document.createElement('div');
  mic.id='ALWI_MIC_BTN';
  mic.innerHTML='\uD83C\uDFA4';
  mic.title='Tanya Alwi pakai suara';
  mic.style.cssText='position:fixed;bottom:18px;left:14px;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#059669,#25D366);display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;z-index:999999999;border:3px solid #000;box-shadow:0 4px 14px rgba(37,211,102,.5);user-select:none;-webkit-user-select:none;touch-action:manipulation;';
  document.body.appendChild(mic);

  /* --- balon jawaban --- */
  var bal=document.createElement('div');
  bal.id='ALWI_MIC_BALON';
  bal.style.cssText='display:none;position:fixed;bottom:82px;left:12px;width:min(330px,88vw);background:#0a1414;border:2px solid #25D366;border-radius:14px;padding:12px;z-index:999999999;box-shadow:0 10px 30px rgba(37,211,102,.35);font-family:sans-serif;';
  bal.innerHTML='<div id="MIC_HDR" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b style="color:#25D366;font-size:12px">\uD83C\uDFA4 TANYA ALWI</b><span id="MIC_X" style="cursor:pointer;color:#888;font-weight:bold">\u2715</span></div>'+
    '<div id="MIC_Q" style="font-size:11px;color:#FFD700;margin-bottom:6px;display:none"></div>'+
    '<div id="MIC_A" style="font-size:13px;line-height:1.55;color:#e2e8f0;max-height:40vh;overflow-y:auto">Mau tanya apa?</div>'+
    '<button id="MIC_GO" style="display:none;margin-top:8px;padding:9px 12px;border:none;border-radius:8px;background:linear-gradient(135deg,#b8860b,#FFD700);color:#000;font-weight:800;font-size:11px;width:100%;cursor:pointer">\uD83D\uDCD6 BUKA LENGKAP DI KALKULATOR</button>';
  document.body.appendChild(bal);

  var teksTerakhir='';
  function tampil(teksTanya, isi){
    teksTerakhir=teksTanya||'';
    document.getElementById('MIC_Q').textContent=teksTanya?('\u201C'+teksTanya+'\u201D'):'';
    document.getElementById('MIC_Q').style.display=teksTanya?'block':'none';
    document.getElementById('MIC_A').innerHTML=isi;
    document.getElementById('MIC_GO').style.display=teksTanya?'block':'none';
    bal.style.display='block';
  }
  document.getElementById('MIC_X').onclick=function(){ bal.style.display='none'; };
  document.getElementById('MIC_GO').onclick=function(){
    window.goToPage(prefix+'alwi_kalkulator.html?q='+encodeURIComponent(teksTerakhir));
  };

  function tanyaAI(teks){
    tampil(teks,'<span style="color:#94a3b8">\u23F3 Alwi sedang berpikir...</span>');
    fetch(API_BASE()+'/api/ai',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:'Jawab singkat padat dalam Bahasa Indonesia (maks 4 kalimat): '+teks,model:'Alwi',maks:220})
    }).then(function(r){return r.json()})
      .then(function(d){
        if(d&&d.response){ tampil(teks,d.response.trim()); }
        else{ tampil(teks,'\u26A0\uFE0F '+(d&&d.galat||'AI tidak merespons')); }
      })
      .catch(function(){ tampil(teks,'\u26A0\uFE0F Server AI tak terjangkau. Cek koneksi.'); });
  }
  function API_BASE(){
    return (location.protocol==='file:'?'http:':location.protocol)+'//'+(location.hostname||'34.170.37.50')+':8080';
  }

  mic.onclick=function(){
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){
      var t=prompt('\uD83C\uDFA4 Mic tidak didukung browser ini.\nKetik pertanyaanmu:');
      if(t&&t.trim()) tanyaAI(t.trim());
      return;
    }
    var r=new SR();
    r.lang='id-ID'; r.interimResults=false; r.maxAlternatives=1;
    mic.style.boxShadow='0 0 22px 6px rgba(255,0,80,.8)';
    tampil(null,'\uD83C\uDFA4 <i>Dengarkan... silakan bicara!</i>');
    bal.style.display='block';
    r.onresult=function(e){ var t=e.results[0][0].transcript.trim(); if(t) tanyaAI(t); };
    r.onerror=function(e){
      tampil(null, e.error==='not-allowed' ? '\u26D4 Izinkan akses mikrofon di browser.' : '\u26A0\uFE0F Gagal mendengar ('+e.error+'). Coba lagi.');
    };
    r.onend=function(){ mic.style.boxShadow='0 4px 14px rgba(37,211,102,.5)'; };
    try{ r.start(); }catch(e){}
  };
})();
