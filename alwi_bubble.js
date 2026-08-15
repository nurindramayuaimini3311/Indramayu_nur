!function(){
if(window.__ALWI)return;window.__ALWI=1;

// 1. Buat Bola Helm ⛑️
let isDragging=false, startX, startY, vx=0, vy=0, x=window.innerWidth-80, y=window.innerHeight-120;
let ball=document.createElement('div');
ball.id="ALWI_BOLA";
ball.style.cssText=`position:fixed;left:${x}px;top:${y}px;z-index:999999999;width:60px;height:60px;background:radial-gradient(circle at 30% 30%,#2aff7a,#128C7E);border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:grab;box-shadow:0 0 0 3px #25D366,0 10px 25px rgba(0,0,0,0.5);user-select:none;touch-action:none;transition:transform 0.2s`;
ball.innerHTML="⛑️";
document.body.appendChild(ball);

// 2. Buat Drop-Up Menu Navigasi Ringkas (Termasuk Target VPS Ollama)
let menu=document.createElement('div');
menu.id="ALWI_DROPUP";
menu.style.cssText="display:none;position:fixed;bottom:90px;right:15px;width:250px;background:#0a0a0a;border:2px solid #25D366;border-radius:14px;z-index:999999998;padding:8px;box-shadow:0 10px 30px rgba(0,0,0,0.8);flex-direction:column;gap:6px;font-family:system-ui,sans-serif;";
menu.innerHTML=`
  <div style="color:#25D366;font-size:12px;font-weight:800;padding:4px 8px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;">
    <span>⛑️ NAVIGASI FOLDER & VPS</span>
    <span onclick="document.getElementById('ALWI_DROPUP').style.display='none'" style="cursor:pointer;color:#888;">✕</span>
  </div>
  <button onclick="bukaIframe('http://34.170.37.50:3000/index.html')" style="padding:9px;background:#0284c7;color:#fff;border:1px solid #38bdf8;border-radius:8px;text-align:left;font-weight:700;font-size:12px;cursor:pointer;">🤖 VPS Ollama Direct (34.170.37.50)</button>
  <button onclick="bukaIframe('pusat.html')" style="padding:9px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:12px;cursor:pointer;">🏢 Pusat Portal (pusat.html)</button>
  <button onclick="bukaIframe('index2.html')" style="padding:9px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:12px;cursor:pointer;">🚀 Index 2 (index2.html)</button>
  <button onclick="bukaIframe('qa_lite.html')" style="padding:9px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:12px;cursor:pointer;">💡 Q&A Lite (qa_lite.html)</button>
  <button onclick="bukaIframe('pasarGAIB.html')" style="padding:9px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:12px;cursor:pointer;">👻 Pasar Gaib</button>
  <button onclick="bukaIframe('privacy.html')" style="padding:9px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;text-align:left;font-weight:700;font-size:12px;cursor:pointer;">📜 Privacy Policy</button>
`;
document.body.appendChild(menu);

// 3. Modal Popup Fullscreen untuk Iframe
let modal=document.createElement('div');
modal.id="ALWI_MODAL";
modal.style.cssText="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.9);z-index:999999999;flex-direction:column;";
modal.innerHTML=`
  <div style="height:44px;background:#111;display:flex;align-items:center;justify-content:space-between;padding:0 12px;border-bottom:1px solid #222;">
    <span id="ALWI_MODAL_TITLE" style="color:#25D366;font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">📍 Folder</span>
    <button onclick="tutupIframe()" style="background:#ef4444;color:#fff;border:none;padding:5px 12px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:11px;">TUTUP ✕</button>
  </div>
  <iframe id="ALWI_IFRAME" style="width:100%;flex:1;border:none;background:#fff;" allow="clipboard-read; clipboard-write; autoplay"></iframe>
`;
document.body.appendChild(modal);

let open=false;
function toggleMenu(){
  open=!open;
  menu.style.display=open?'flex':'none';
}

window.bukaIframe=function(targetUrl){
  toggleMenu();
  document.getElementById('ALWI_MODAL_TITLE').textContent="📍 Membuka: " + targetUrl;
  document.getElementById('ALWI_IFRAME').src = targetUrl;
  modal.style.display='flex';
}

window.tutupIframe=function(){
  modal.style.display='none';
  document.getElementById('ALWI_IFRAME').src = '';
}

// Fitur Geser/Tendang Bola
ball.addEventListener('pointerdown',e=>{isDragging=true; ball.setPointerCapture(e.pointerId); startX=e.clientX; startY=e.clientY; vx=0; vy=0; ball.style.transition='none';});
ball.addEventListener('pointermove',e=>{if(!isDragging)return; let dx=e.clientX-startX, dy=e.clientY-startY; x+=dx; y+=dy; vx=dx; vy=dy; startX=e.clientX; startY=e.clientY; ball.style.left=x+'px'; ball.style.top=y+'px';});
ball.addEventListener('pointerup',e=>{
  isDragging=false; ball.style.transition='left 0.4s ease, top 0.4s ease';
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
}();

