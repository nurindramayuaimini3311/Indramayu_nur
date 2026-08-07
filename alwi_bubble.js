!function(){
if(window.__ALWI)return;window.__ALWI=1;
let WA="6282147573665";
let isDragging=false, startX, startY, vx=0, vy=0, x=window.innerWidth-90, y=window.innerHeight-150;
let ball=document.createElement('div');
ball.id="ALWI_BOLA";
ball.style.cssText=`position:fixed;left:${x}px;top:${y}px;z-index:999999999;width:68px;height:68px;background:radial-gradient(circle at 30% 30%,#2aff7a,#128C7E);border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:36px;cursor:grab;box-shadow:0 0 0 3px #25D366,0 10px 30px #000;user-select:none;touch-action:none;transition:box-shadow 0.1s`;
ball.innerHTML="⛑️";
document.body.appendChild(ball);

let box=document.createElement('div');
box.id="ALWI_BOX";
box.style.cssText="display:none;position:fixed;bottom:100px;right:10px;width:352px;max-height:540px;background:#0a0a0a;border:2px solid #25D366;border-radius:16px;z-index:999999998;overflow:hidden;flex-direction:column;font-family:sans-serif;box-shadow:0 10px 40px #000";
box.innerHTML=`<div style="background:linear-gradient(135deg,#128C7E,#25D366);color:#fff;padding:11px;text-align:center;font-weight:900;display:flex;justify-content:space-between;align-items:center"><span>⛑️ ALWI PUSAT • WA: 0821-4757-3665</span><span onclick="document.getElementById('ALWI_BOX').style.display='none'" style="cursor:pointer;background:rgba(0,0,0,0.3);padding:2px 8px;border-radius:50%">✕</span></div><div id="ALWI_CHAT" style="height:320px;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:8px;background:#ece5dd"></div><div style="padding:7px;background:#1a1a1a;display:grid;grid-template-columns:1fr 1fr;gap:6px"><button onclick="ALWI_MENU(1)" style="padding:9px;background:#222;color:#FFD700;border:1px solid #333;border-radius:8px;font-size:11px;font-weight:800">📚 NUR 1-3</button><button onclick="ALWI_MENU(2)" style="padding:9px;background:#222;color:#FFD700;border:1px solid #333;border-radius:8px;font-size:11px;font-weight:800">🌍 NUR 4-6</button><button onclick="ALWI_MENU(3)" style="padding:9px;background:#222;color:#FFD700;border:1px solid #333;border-radius:8px;font-size:11px;font-weight:800">👑 NUR 7-10</button><button onclick="ALWI_MENU(4)" style="padding:9px;background:#222;color:#FFD700;border:1px solid #333;border-radius:8px;font-size:11px;font-weight:800">🎬 NURFLIX</button></div><div style="padding:8px;background:#000;border-top:1px solid #222"><a id="ALWI_WA" href="https://wa.me/${WA}?text=Halo%20Alwi%20mau%20upgrade" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#25D366;color:#fff;padding:12px;border-radius:10px;text-decoration:none;font-weight:900;font-size:13px;animation:pulse 1.5s infinite">💬 CHAT OPERATOR VIA WHATSAPP</a><div style="text-align:center;margin-top:5px"><a href="https://drive.google.com/drive/folders/1nM6UeY60YU0-WTynteXVjKw9W-s3F-7I" target="_blank" style="color:#FFD700;font-size:10px">📁 Drive</a> • <a href="tel:+6282147573665" style="color:#25D366;font-size:10px">📞 Telp</a> • <a href="/index.html" style="color:#fff;font-size:10px">🏠 Home 4 Menu</a></div></div><style>@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}</style>`;
document.body.appendChild(box);
let chat=box.querySelector('#ALWI_CHAT');

function add(t,who){let d=document.createElement('div');let me=who=='user'; d.style.cssText=me?'background:#dcf8c6;color:#000;margin-left:auto;max-width:78%;padding:8px 11px;border-radius:12px 12px 2px 12px;font-size:12px;box-shadow:0 1px 1px #000':'background:#fff;color:#000;max-width:86%;padding:8px 11px;border-radius:12px 12px 12px 2px;font-size:12px;box-shadow:0 1px 1px #000'; d.innerHTML=t; chat.appendChild(d); chat.scrollTop=9999;}

let open=0;
function toggleBox(){open=!open; box.style.display=open?'flex':'none'; if(open&&chat.innerHTML==''){add('Halo Batur! Isun Alwi ⛑️<br>Bola ini bisa ditendang lho! Coba geser / tendang! ⚽<br><br>Pilih menu dibawah ya!','bot');}}

// === FISIKA BOLA TENDANG ===
ball.addEventListener('pointerdown',e=>{isDragging=true; ball.setPointerCapture(e.pointerId); startX=e.clientX; startY=e.clientY; vx=0; vy=0; ball.style.cursor='grabbing'; ball.style.transition='none';});
ball.addEventListener('pointermove',e=>{if(!isDragging)return; let dx=e.clientX-startX, dy=e.clientY-startY; x+=dx; y+=dy; vx=dx; vy=dy; startX=e.clientX; startY=e.clientY; ball.style.left=x+'px'; ball.style.top=y+'px'; if(Math.abs(vx)>1) ball.style.transform=`rotate(${vx*3}deg)`;});
ball.addEventListener('pointerup',e=>{
 isDragging=false; ball.style.cursor='grab'; ball.style.transition='left 0.8s cubic-bezier(0.2,0.8,0.2,1), top 0.8s cubic-bezier(0.2,0.8,0.2,1), transform 0.8s';
 // tendangan!
 let power=Math.sqrt(vx*vx+vy*vy);
 if(power>2){
   x+=vx*12; y+=vy*12;
   // pantulan dinding
   if(x<5) x=5, vx*=-0.7; if(x>window.innerWidth-75) x=window.innerWidth-75, vx*=-0.7;
   if(y<5) y=5, vy*=-0.7; if(y>window.innerHeight-75) y=window.innerHeight-75, vy*=-0.7;
   ball.style.left=x+'px'; ball.style.top=y+'px';
   ball.style.transform=`rotate(${vx*20}deg) scale(1.15)`;
   setTimeout(()=>ball.style.transform='rotate(0deg) scale(1)',800);
   if(navigator.vibrate) navigator.vibrate(50);
 }else{
   // klik biasa = buka chat
   if(power<2) toggleBox();
 }
});
window.addEventListener('resize',()=>{if(x>window.innerWidth-80) x=window.innerWidth-80; if(y>window.innerHeight-80) y=window.innerHeight-80; ball.style.left=x+'px'; ball.style.top=y+'px';});

window.ALWI_MENU=function(n){
 let txt=["","📚 NUR 1-3: Variable, Cahaya, Batik Sopan","🌍 NUR 4-6: Loop Petualangan, Hantu, Wali, Keluarga Alwi","👑 NUR 7-10: Nur jadi Raja, perang besar, Gareng Petruk Bagong","🎬 NURFLIX: Film pendek Nur horor komedi"];
 add("Mau "+txt[n].split(':')[0],'user');
 setTimeout(()=>{
  add(txt[n]+'<br><br><b>Mau full / upgrade?</b><br>Klik hijau WA dibawah Batur! 👇','bot');
  box.querySelector('#ALWI_WA').href=`https://wa.me/${WA}?text=Halo%20Alwi%20${encodeURIComponent(txt[n].split(':')[0])}%20Mau%20upgrade%20di%20${encodeURIComponent(location.pathname)}`;
 },400);
};
console.log("⚽ BOLA ALWI SIAP DITENDANG!");
}();
