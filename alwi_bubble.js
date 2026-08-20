!function(){
if(window.__ALWI)return;window.__ALWI=1;

// 1. Buat Bola Helm ⛑️
let isDragging=false, startX, startY, vx=0, vy=0, x=window.innerWidth-80, y=window.innerHeight-120;
let ball=document.createElement('div');
ball.id="ALWI_BOLA";
ball.style.cssText=`position:fixed;left:${x}px;top:${y}px;z-index:999999999;width:60px;height:60px;background:radial-gradient(circle at 30% 30%,#2aff7a,#128C7E);border-radius:50%;border:3px solid #FFD700;box-shadow:0 0 20px rgba(42,255,122,0.5);font-size:32px;display:flex;align-items:center;justify-content:center;cursor:grab;user-select:none;transition:none;`;
ball.innerHTML="⛑️";
document.body.appendChild(ball);

// 2. Buat Drop-Up Menu Navigasi Ringkas (Termasuk TARGET HOME & VPS Ollama)
let menu=document.createElement('div');
menu.id="ALWI_DROPUP";
menu.style.cssText="display:none;position:fixed;bottom:90px;right:15px;width:260px;background:#0a0a0a;border:2px solid #25D366;border-radius:14px;z-index:999999998;padding:8px;box-shadow:0 10px 30px rgba(37,211,102,0.3);flex-direction:column;gap:6px;max-height:70vh;overflow-y:auto;";
menu.innerHTML=`
  <div style="color:#25D366;font-size:12px;font-weight:800;padding:8px 8px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:#0a0a0a;z-index:10;">
    <span>⛑️ NAVIGASI & HOME</span>
    <span onclick="document.getElementById('ALWI_DROPUP').style.display='none'" style="cursor:pointer;color:#888;font-weight:bold;font-size:16px;">✕</span>
  </div>
  <button onclick="goToPage('index.html')" style="padding:10px 8px;background:#25D366;color:#000;border:none;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;font-size:12px;"><strong>🏠 HOME - Halaman Utama</strong></button>
  <button onclick="bukaIframe('http://34.170.37.50:3000/index.html')" style="padding:9px 8px;background:#0284c7;color:#fff;border:1px solid #38bdf8;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🖥️ VPS Ollama Direct (34.170.37.50)</button>
  <button onclick="bukaIframe('pusat.html')" style="padding:9px 8px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🔴 AI ALWI PUSAT</button>
  <button onclick="bukaIframe('index2.html')" style="padding:9px 8px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">👥 TANYA META AI</button>
  <button onclick="bukaIframe('qa_lite.html')" style="padding:9px 8px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">❓ Q&A Lite</button>
  <button onclick="bukaIframe('pasarGAIB.html')" style="padding:9px 8px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🛒 Pasar Gaib</button>
  <button onclick="bukaIframe('privacy.html')" style="padding:9px 8px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">🔒 Privacy Policy</button>
  <button onclick="bukaIframe('setting/')" style="padding:9px 8px;background:#FFD700;color:#000;border:none;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;transition:all 0.2s;width:100%;">⚙️ SETTING</button>
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

// Fitur Geser/Tendang Bola
ball.addEventListener('pointerdown',e=>{isDragging=true; ball.setPointerCapture(e.pointerId); startX=e.clientX; startY=e.clientY; vx=0; vy=0; ball.style.transition='none'; ball.style.cursor='grabbing';});

ball.addEventListener('pointermove',e=>{
  if(!isDragging)return; 
  let dx=e.clientX-startX, dy=e.clientY-startY; 
  x+=dx; y+=dy; 
  vx=dx; vy=dy; 
  startX=e.clientX; 
  startY=e.clientY; 
  ball.style.left=x+'px';
  ball.style.top=y+'px';
});

ball.addEventListener('pointerup',e=>{
  isDragging=false; 
  ball.style.transition='left 0.4s ease, top 0.4s ease';
  ball.style.cursor='grab';
  let power=Math.sqrt(vx*vx+vy*vy);
  if(power>2){
    x+=vx*6; y+=vy*6;
    if(x<5) x=5; if(x>window.innerWidth-65) x=window.innerWidth-65;
    if(y<5) y=5; if(y>window.innerHeight-65) y=window.innerHeight-65;
    ball.style.left=x+'px'; ball.style.top=y+'px';
  } else {
    toggleMenu();
  }
});

// Event untuk menutup menu saat klik di luar
document.addEventListener('click',e=>{
  if(!ball.contains(e.target) && !menu.contains(e.target) && open){
    open=false;
    menu.style.display='none';
  }
});

// Responsive saat window resize
window.addEventListener('resize',()=>{
  if(x>window.innerWidth-65) x=window.innerWidth-65;
  if(y>window.innerHeight-65) y=window.innerHeight-65;
  ball.style.left=x+'px';
  ball.style.top=y+'px';
});

}();