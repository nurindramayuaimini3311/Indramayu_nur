!function(){
if(window.__ALWI_POIN)return;window.__ALWI_POIN=1;

// ===== CONFIG =====
const API='http://34.170.37.50:8000';
const TARGET=1000;         // poin untuk tukar
const NILAI=10000;         // 1000 poin = Rp 10.000
const WA_ADMIN='6282147573665';

// ===== UID & POIN lokal (localStorage) =====
function uid(){
  let u=localStorage.getItem('alwi_uid');
  if(!u){u='U'+Date.now().toString(36)+Math.random().toString(36).substr(2,4);localStorage.setItem('alwi_uid',u);}
  return u;
}
function poin(){return parseInt(localStorage.getItem('alwi_poin')||'0',10)||0;}
function setPoin(n){localStorage.setItem('alwi_poin',String(n));}

function notif(msg){
  let d=document.createElement('div');
  d.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#00BFFF,#00BFFF);color:#000;padding:14px 28px;border-radius:30px;font-weight:900;font-size:14px;z-index:999999999;box-shadow:0 4px 20px rgba(255,215,0,0.6);animation:alwiPop .3s ease;white-space:nowrap;';
  d.textContent='⭐ '+msg;
  document.body.appendChild(d);
  setTimeout(()=>{d.style.opacity='0';d.transition='.3s';},2000);
  setTimeout(()=>d.remove(),2500);
}
let st=document.createElement('style');
st.textContent='@keyframes alwiPop{from{transform:translateX(-50%) scale(0)}to{transform:translateX(-50%) scale(1)}}';
document.head.appendChild(st);

function cekPoinWA(){
  let p=poin(),sisa=Math.max(0,TARGET-p);
  let m='⭐ *POIN ALWI* ⭐\n\n💰 Poin: *'+p+'*\n🎯 Target: '+TARGET+'\n📊 Progress: '+Math.round(p/TARGET*100)+'%\n';
  m+=p>=TARGET?'\n✅ *Siap tukar!*':'\n🔄 Kurang '+sisa+' poin';
  window.open('https://wa.me/'+WA_ADMIN+'?text='+encodeURIComponent(m),'_blank');
}
function tukarPoinWA(){
  let p=poin();
  if(p<TARGET){notif('Belum cukup! Minimal '+TARGET);return;}
  let m='🎉 *TUKAR POIN → BANK BRI*\n\n👤 User: '+uid()+'\n💰 Ditukar: '+TARGET+' poin\n💵 Nilai: Rp '+NILAI.toLocaleString()+'\n\nKlaim hadiah ke admin!';
  window.open('https://wa.me/'+WA_ADMIN+'?text='+encodeURIComponent(m),'_blank');
}
window.cekPoinWA=cekPoinWA;
window.tukarPoinWA=tukarPoinWA;
window.infoPoin=function(){return{uid:uid(),poin:poin(),target:TARGET,progress:Math.round(poin()/TARGET*100)+'%'};};

// ===== Sinkron ke server (bila online) =====
function sync(cb){
  try{
    fetch(API+'/api/poin/sync',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({uid:uid(),poin:poin(),name:'Player',account_no:''})})
      .then(r=>r.json()).then(d=>{if(cb)cb(d);}).catch(()=>{});
  }catch(e){}
}
function cekServer(cb){
  try{
    fetch(API+'/api/poin?uid='+encodeURIComponent(uid()))
      .then(r=>r.json()).then(d=>{if(cb)cb(d);}).catch(()=>{});
  }catch(e){}
}

// ===== Bola + Badge =====
let isDrag=false,sx=0,sy=0,x=window.innerWidth-80,y=window.innerHeight-120;
let ball=document.createElement('div');
ball.id='ALWI_POIN_BALL';
ball.style.cssText=`position:fixed;left:${x}px;top:${y}px;z-index:999999999;width:60px;height:60px;background:radial-gradient(circle at 30% 30%,#7ec8ff,#0e7490);border-radius:50%;border:3px solid #00BFFF;box-shadow:0 0 20px rgba(0,191,255,0.5),0 0 40px rgba(0,191,255,0.3);font-size:32px;display:flex;align-items:center;justify-content:center;cursor:grab;user-select:none;transition:transform .1s;will-change:transform,left,top;`;
ball.innerHTML=`<img src="./img/icon-72.png" onerror="this.outerHTML='⛑️'" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">`;
document.body.appendChild(ball);

let ring=document.createElement('div');
ring.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:60px;height:60px;border-radius:50%;border:3px solid #00BFFF;z-index:999999989;pointer-events:none;opacity:0;`;
document.body.appendChild(ring);
let glow=document.createElement('style');
glow.textContent='@keyframes alwiGlow{0%,100%{box-shadow:0 0 18px rgba(0,191,255,.5)}50%{box-shadow:0 0 30px rgba(0,191,255,.9),0 0 60px rgba(0,191,255,.55)}}';
document.head.appendChild(glow);

function upd(){
  ball.style.left=x+'px';ball.style.top=y+'px';
  ring.style.left=x+'px';ring.style.top=y+'px';
  ball.style.animation='alwiGlow 2.2s ease-in-out infinite';
}
upd();

// Badge poin (terpisah, di atas bola)
let badge=document.createElement('div');
badge.id='ALWI_POIN_BADGE';
badge.style.cssText='position:fixed;left:'+(x-5)+'px;top:'+(y-90)+'px;z-index:999999998;background:#00BFFF;color:#000;padding:4px 12px;border-radius:12px;font-weight:900;font-size:11px;box-shadow:0 2px 10px rgba(255,215,0,0.4);cursor:pointer;transition:all .3s;';
badge.textContent='⭐ '+poin();
badge.onclick=e=>{e.stopPropagation();cekPoinWA();};
document.body.appendChild(badge);

function updBadge(){badge.textContent='⭐ '+poin();badge.style.left=(x-5)+'px';badge.style.top=(y-90)+'px';}
window.alwiUpdateBadgePoin=updBadge;
window.alwiGetPoin=poin;
window.alwiUid=uid;
window.alwiTambahPoin=function(tipe){let n=tipe==='belajar'?5:1;setPoin(poin()+n);notif('+'+n+' Poin! ('+tipe+')');updBadge();sync();};
window.poinGame=function(){window.alwiTambahPoin('game');};
window.poinBelajar=function(){window.alwiTambahPoin('belajar');};

// Drag bola
ball.addEventListener('pointerdown',e=>{isDrag=true;sx=e.clientX;sy=e.clientY;ball.setPointerCapture(e.pointerId);});
ball.addEventListener('pointermove',e=>{if(!isDrag)return;let dx=e.clientX-sx,dy=e.clientY-sy;x+=dx;y+=dy;sx=e.clientX;sy=e.clientY;upd();updBadge();});
ball.addEventListener('pointerup',e=>{if(!isDrag)return;isDrag=false;});

// Menu klik kanan / tap (poin + link BRI)
let menu=document.createElement('div');
menu.id='ALWI_POIN_MENU';
menu.style.cssText='display:none;position:fixed;bottom:90px;right:15px;width:280px;background:#0a0a0a;border:2px solid #00BFFF;border-radius:14px;z-index:999999998;padding:8px;box-shadow:0 10px 30px rgba(0,191,255,0.3);flex-direction:column;gap:6px;';
menu.innerHTML=`
  <div style="color:#00BFFF;font-size:12px;font-weight:800;padding:8px 8px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;">
    <span>⭐ POIN ALWI</span>
    <span onclick="document.getElementById('ALWI_POIN_MENU').style.display='none'" style="cursor:pointer;color:#888;font-weight:bold;font-size:16px;">✕</span>
  </div>
  <div style="color:#fff;font-size:13px;padding:8px;">
    💰 Poin: <b style="color:#00BFFF">${poin()}</b> / ${TARGET}<br>
    🎯 Tukar: ${TARGET} poin = Rp ${NILAI.toLocaleString()}<br>
    👤 UID: <span style="color:#888">${uid()}</span>
  </div>
  <button onclick="cekPoinWA()" style="padding:9px 8px;background:#0284c7;color:#fff;border:1px solid #38bdf8;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;">📊 Cek Poin (WA)</button>
  <button onclick="tukarPoinWA()" style="padding:9px 8px;background:#16a34a;color:#fff;border:1px solid #4ade80;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;">🏦 Tukar Poin → Bank BRI</button>
  <button onclick="window.open('http://34.170.37.50:8000/','_blank')" style="padding:9px 8px;background:#7f1d1d;color:#fff;border:1px solid #f00;border-radius:8px;text-align:left;font-weight:700;font-size:11px;cursor:pointer;">💳 Cek Saldo BRI</button>
`;
document.body.appendChild(menu);

ball.addEventListener('contextmenu',e=>{e.preventDefault();menu.style.display='flex';});
ball.addEventListener('dblclick',()=>{menu.style.display='flex';});

// Sync awal & refresh badge
sync();
cekServer(d=>{
  if(d&&d.poin!=null){setPoin(d.poin);updBadge();}
});

console.log('[ALWI] Poin BRI module aktif. uid='+uid()+' poin='+poin());
}();
