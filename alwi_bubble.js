(function(){
if(window.__alwiBubble)return;window.__alwiBubble=true;

// Improved config loading dengan error handling
const CFG={
  suara: localStorage.getItem('alwi_suara')!=='off',
  pos: (() => {
    try {
      const pos = localStorage.getItem('alwi_pos');
      return pos ? JSON.parse(pos) : null;
    } catch(e) {
      console.warn('Error parsing position:', e);
      return null;
    }
  })()
};

let ac=null;

// Improved beep dengan cleanup dan error handling
function beep(f=800,d=0.12){
  if(!CFG.suara)return;
  try{
    if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();
    if(ac.state === 'suspended') ac.resume();
    const o=ac.createOscillator(),g=ac.createGain();
    o.frequency.value=f;
    g.gain.setValueAtTime(0.3,ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+d);
    o.connect(g);
    g.connect(ac.destination);
    o.start(ac.currentTime);
    o.stop(ac.currentTime+d);
  }catch(e){
    console.error('Beep error:',e);
  }
}

// Improved speak dengan error handling lengkap
function speak(t,lang='id-ID'){
  if(!CFG.suara||!window.speechSynthesis)return;
  try{
    speechSynthesis.cancel();
    let u=new SpeechSynthesisUtterance(t);
    u.lang=lang;
    u.rate=0.92;
    u.onend=()=>{console.log('Speech end')};
    u.onerror=(event)=>{console.warn('Speech error:',event.error)};
    let voices=speechSynthesis.getVoices();
    let v=voices.find(v=>v.lang.startsWith(lang))||voices[0];
    if(v)u.voice=v;
    speechSynthesis.speak(u);
  }catch(e){
    console.error('Speak error:',e);
  }
}

// EDU dengan 10 Nur lengkap
const EDU = {
  'nur1': {indo: "Nur 1 Cahaya = Variable. Contoh: cahaya='Nur'. Kita simpan cahaya di toples batik dengan sopan.", jawa: "Nur 1 Cahya = Variable. Cahya disimpen ning toples batik."},
  'nur2': {indo: "Nur 2 Angin = If-Else. Jika hujan pakai payung, jika tidak main. Keputusan bijak.", jawa: "Nur 2 Angin = If-Else. Nek udan nggo payung, nek ora dolan."},
  'nur3': {indo: "Nur 3 Air = Loop. for i in range(10): belajar(). Air mengalir tekun, seperti belajar terus.", jawa: "Nur 3 Banyu = Loop. Banyu mili terus, koyo sinau terus-terusan."},
  'nur4': {indo: "Nur 4 Tanah = Function. def rumah(): pondasi kuat. Fungsi yang bermanfaat.", jawa: "Nur 4 Lemah = Function. Pondasi omah sing kuat."},
  'nur5': {indo: "Nur 5 Api = Debug. Bug itu teman belajar, bukan hantu. Memory Leak = toples kebanyakan isi, kita bersihkan.", jawa: "Nur 5 Geni = Debug. Bug kuwi kanca sinau, dudu memedi."},
  'nur6': {indo: "Nur 6 Langit = Array. Kumpulan data seperti awan berjajar.", jawa: "Nur 6 Langit = Array. Asemblé data koyo mega rejeng."},
  'nur7': {indo: "Nur 7 Bintang = Class. Struktur sempurna seperti bintang di langit.", jawa: "Nur 7 Lintang = Class. Struktur sempurna koyo lintang ing langit."},
  'nur8': {indo: "Nur 8 Bulan = API. Cahaya informasi yang menerangi jalan.", jawa: "Nur 8 Rembulan = API. Cahya informasi sing menerangi dalan."},
  'nur9': {indo: "Nur 9 Matahari = Database. Pusat energi data yang kuat.", jawa: "Nur 9 Srengenge = Database. Pusat energi data sing kuat."},
  'nur10': {indo: "Nur 10 Bumi = Deploy. Menanam hasil kerja untuk bermakna.", jawa: "Nur 10 Bumi = Deploy. Nanam asil kerja kanggo bermakna."},
  'peta': {indo: "Ini Peta Desa Digital. Rumah Joglo itu server utama.", jawa: "Iki Peta Desa Digital. Omah Joglo kuwi server utama."},
  'gaib': {indo: "Pasar Gaib itu Pasar Data. Ramai transaksi, kita belajar jujur.", jawa: "Pasar Gaib kuwi Pasar Data. Rame transaksi, sinau jujur."},
  'halo': {indo: "Waalaikumsalam! Saya Alwi ⛑️ penjaga 10 Nur yang sopan. Ketik nur1-nur10, peta, gaib.", jawa: "Waalaikumsalam! Aku Alwi ⛑️ penjaga 10 Nur. Ketik nur1-nur10."}
};

const html=`
<div id="alwi-bubble-wrap" style="position:fixed;z-index:9998;touch-action:none;left:${CFG.pos?CFG.pos.x+'px':'20px'};top:${CFG.pos?CFG.pos.y+'px':'auto'};bottom:${CFG.pos?'auto':'20px'};right:auto;">
<div id="alwi-dropup" style="display:none;position:absolute;bottom:75px;right:0;width:310px;background:linear-gradient(180deg,#0a0a0a,#161616);border:2px solid #c9a84c;border-radius:16px;overflow:hidden;box-shadow:0 0 20px rgba(0,0,0,0.9);z-index:10000">
<div style="background:linear-gradient(135deg,#06140b,#0a2e1c);border-bottom:2px solid #c9a84c;padding:12px;display:flex;justify-content:space-between;align-items:center">
<div style="display:flex;gap:10px;align-items:center">
<img src="img/agent_alwi_icon.png" style="width:34px;height:34px;border-radius:50%;border:1px solid #c9a84c;" alt="Alwi">
<div><div style="color:#FFD700;font-weight:900;font-size:13px">AGEN ALWI SOPAN</div><div style="color:#c9a84c;font-size:10px">Nusantara Cyber - Edukasi 14+</div></div>
</div>
<div style="display:flex;gap:4px"><button id="alwi-sound" style="background:transparent;border:1px solid #c9a84c;color:#FFD700;width:28px;height:28px;border-radius:6px;cursor:pointer">${CFG.suara?'🔊':'🔇'}</button><button id="alwi-close" style="background:transparent;border:1px solid #c9a84c;color:#FFD700;width:28px;height:28px;border-radius:6px;cursor:pointer">✕</button></div>
</div>
<div style="padding:10px;background:#0a2e1c;border-bottom:1px solid #222;font-size:11px;color:#ffcc00">Ketik: halo, nur1-nur10, peta, gaib</div>
<div id="alwi-chat" style="max-height:280px;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px"></div>
<div style="max-height:340px;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px;border-top:1px solid #222">
<div style="font-size:10px;color:#888;padding:4px">MENU SOPAN</div>
<a class="alwi-link" href="index.html">🏠 Home Portal</a>
<a class="alwi-link" href="ceritaHOROR.html">📖 Cerita Edukasi</a>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"><a class="alwi-link mini" href="nur1.html">Nur1</a><a class="alwi-link mini" href="nur2.html">Nur2</a><a class="alwi-link mini" href="nur3.html">Nur3</a></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><a class="alwi-link mini" href="netflix/index.html">🎬 NURFLIX</a><a class="alwi-link mini" href="peta.html">🗺️ Peta</a></div>
</div><div style="border-top:1px solid #222;padding:8px;display:flex;gap:6px"><input id="alwi-input" placeholder="tanya: halo, nur1, piye..." style="flex:1;background:#000;border:1px solid #2a2a2a;padding:8px;border-radius:6px;color:#eee;font-size:12px"><button id="alwi-send" style="background:#c9a84c;border:none;color:#000;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600">Kirim</button></div>
</div>
<button id="alwi-bubble" style="width:62px;height:62px;border-radius:50%;background:#06140b;border:2px solid #c9a84c;box-shadow:0 0 0 2px #c9a84c,0 6px 18px rgba(0,0,0,.8);cursor:grab;display:flex;align-items:center;justify-content:center;font-size:32px;user-select:none;position:relative;z-index:9999">⛑️</button>
<style>
.alwi-link{display:block;padding:9px 12px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;color:#eee;text-decoration:none;font-size:12px;font-weight:600;transition:all 0.2s}
.alwi-link:hover{border-color:#c9a84c;background:#0a2e1c}
.alwi-link.mini{font-size:10px;padding:6px 10px}
.msg{padding:8px 12px;border-radius:8px;font-size:12px;max-width:85%;word-wrap:break-word}
.msg-user{background:#c9a84c;color:#000;margin-left:auto;text-align:right}
.msg-alwi{background:#1a1a1a;color:#eee;border:1px solid #2a2a2a}
#alwi-input:focus{outline:none;border-color:#c9a84c}
</style>
`;

document.body.insertAdjacentHTML('beforeend',html);
const wrap=document.getElementById('alwi-bubble-wrap'),bubble=document.getElementById('alwi-bubble'),drop=document.getElementById('alwi-dropup'),chat=document.getElementById('alwi-chat');

// Error handling untuk DOM elements
if(!wrap||!bubble||!drop||!chat){console.error('Alwi: DOM elements not found');return;}

let dragging=false,sx,sy,ox,oy,moved=false;
function getXY(e){const t=e.touches?e.touches[0]:e;return{x:t.clientX,y:t.clientY};}

bubble.addEventListener('mousedown',sD);
bubble.addEventListener('touchstart',sD,{passive:false});

function sD(e){
  e.preventDefault();dragging=true;moved=false;
  const p=getXY(e);sx=p.x;sy=p.y;
  const r=wrap.getBoundingClientRect();ox=r.left;oy=r.top;
  wrap.style.transition='none';
  document.addEventListener('mousemove',oM);
  document.addEventListener('mouseup',oE);
  document.addEventListener('touchmove',oM,{passive:false});
  document.addEventListener('touchend',oE);
}

function oM(e){
  if(!dragging)return;e.preventDefault();
  const p=getXY(e);
  let dx=p.x-sx,dy=p.y-sy;
  if(Math.abs(dx)>3||Math.abs(dy)>3)moved=true;
  let nx=ox+dx,ny=oy+dy;
  nx=Math.max(0,Math.min(nx,innerWidth-75));
  ny=Math.max(0,Math.min(ny,innerHeight-75));
  wrap.style.left=nx+'px';wrap.style.top=ny+'px';wrap.style.bottom='auto';wrap.style.right='auto';
}

function oE(){
  dragging=false;wrap.style.transition='';
  document.removeEventListener('mousemove',oM);
  document.removeEventListener('mouseup',oE);
  document.removeEventListener('touchmove',oM);
  document.removeEventListener('touchend',oE);
  if(wrap){
    const r=wrap.getBoundingClientRect();
    try{localStorage.setItem('alwi_pos',JSON.stringify({x:r.left,y:r.top}));}catch(e){console.warn('LocalStorage error:',e);}
  }
}

function toggle(){
  const o=drop.style.display!=='none';
  if(o){drop.style.display='none';beep(400,0.08);}
  else{drop.style.display='block';beep(900,0.1);addMsg(EDU['halo'].indo,'alwi');speak(EDU['halo'].indo);}
}

bubble.addEventListener('click',()=>{if(!moved)toggle();});

const closeBtn=document.getElementById('alwi-close');
if(closeBtn)closeBtn.onclick=()=>{drop.style.display='none';beep(350,0.08);};

const soundBtn=document.getElementById('alwi-sound');
if(soundBtn)soundBtn.onclick=function(){
  CFG.suara=!CFG.suara;
  try{localStorage.setItem('alwi_suara',CFG.suara?'on':'off');}catch(e){console.warn('LocalStorage error:',e);}
  this.textContent=CFG.suara?'🔊':'🔇';
  beep(CFG.suara?1000:300,0.08);
};

function addMsg(t,who){
  const d=document.createElement('div');
  d.className='msg msg-'+who;
  d.textContent=t;
  chat.appendChild(d);
  chat.scrollTop=chat.scrollHeight;
}

function detectJawa(t){
  return t.match(/(piro|piye|opo|sinau|kowe|aku|ora|sing|nggo|wae|tekan|koyo|becik|wicaksono)/);
}

function send(){
  const i=document.getElementById('alwi-input');
  const v=i.value.toLowerCase().trim();
  if(!v)return;
  addMsg(i.value,'user');beep(700,0.08);
  let isJawa=detectJawa(v);
  let key='halo';
  if(v.includes('nur1'))key='nur1';
  else if(v.includes('nur2'))key='nur2';
  else if(v.includes('nur3'))key='nur3';
  else if(v.includes('nur4'))key='nur4';
  else if(v.includes('nur5'))key='nur5';
  else if(v.includes('nur6'))key='nur6';
  else if(v.includes('nur7'))key='nur7';
  else if(v.includes('nur8'))key='nur8';
  else if(v.includes('nur9'))key='nur9';
  else if(v.includes('nur10'))key='nur10';
  else if(v.includes('peta'))key='peta';
  else if(v.includes('gaib'))key='gaib';
  
  const msg=EDU[key];
  if(msg){
    const text=isJawa?msg.jawa:msg.indo;
    addMsg(text,'alwi');
    speak(text,isJawa?'jv-ID':'id-ID');
  }
  i.value='';
}

const sendBtn=document.getElementById('alwi-send');
if(sendBtn)sendBtn.onclick=send;
const input=document.getElementById('alwi-input');
if(input)input.addEventListener('keypress',e=>{if(e.key==='Enter')send();});

})();