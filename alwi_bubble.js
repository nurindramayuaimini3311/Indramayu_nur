// ALWI COPILOT CLI - versi Bubble Chat untuk Portal
(function(){
  const style = document.createElement('style');
  style.innerHTML = `
  #alwi-bubble-btn{position:fixed;bottom:20px;right:20px;width:60px;height:60px;background:#00ff88;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer;box-shadow:0 0 20px #00ff88;z-index:9999}
  #alwi-chat{position:fixed;bottom:90px;right:20px;width:320px;max-height:450px;background:#111;border:1px solid #00ff88;border-radius:16px;display:none;flex-direction:column;z-index:9999;overflow:hidden}
  #alwi-chat .head{background:#151515;padding:10px;font-weight:bold;color:#00ff88}
  #alwi-msgs{flex:1;overflow-y:auto;padding:10px;font-size:13px}
  .msg{margin:6px 0;padding:8px 10px;border-radius:10px;max-width:80%}
  .user{background:#00ff88;color:#000;margin-left:auto}
  .bot{background:#222;color:#fff;border:1px solid #333}
  #alwi-input{display:flex;border-top:1px solid #333}
  #alwi-input input{flex:1;background:#000;color:#fff;border:none;padding:10px;outline:none}
  #alwi-input button{background:#00ff88;border:none;padding:10px 15px;cursor:pointer;font-weight:bold}
  `;
  document.head.appendChild(style);
  const btn = document.createElement('div'); btn.id='alwi-bubble-btn'; btn.innerHTML='🤖';
  const chat = document.createElement('div'); chat.id='alwi-chat';
  chat.innerHTML=`<div class="head">ALWI Co-Pilot • Ghost Bug Hunter<span style="float:right;cursor:pointer" onclick="document.getElementById('alwi-chat').style.display='none'">✕</span></div><div id="alwi-msgs"><div class="msg bot">Halo! Aku ALWI Co-Pilot 🤖<br>Ketik: cek og / ghost bug / dulkohar</div></div><div id="alwi-input"><input id="alwi-text" placeholder="Ketik kayak co-pilot..."><button id="alwi-send">➤</button></div>`;
  document.body.appendChild(btn); document.body.appendChild(chat);
  btn.onclick=()=> chat.style.display=chat.style.display==='flex'?'none':'flex';
  const msgs=document.getElementById('alwi-msgs');
  function addMsg(t,cls){const d=document.createElement('div');d.className='msg '+cls;d.innerHTML=t;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
  async function coPilot(q){
    q=q.toLowerCase();
    if(q.includes('og')||q.includes('gambar')){return `og:image kamu: https://nurindramayuaimini3311.github.io/Indramayu_nur/ALWI_grendle.png<br>Status: 200 OK ✅`;}
    if(q.includes('ghost bug')||q.includes('hantu')){return `👻 Ghost Bug = Bug yang gak kelihatan errornya.<br>Fix: log sopan + console.log`;}
    if(q.includes('dulkohar')){return `App ALWI_granle 2055539978374338 Aktif ✅`;}
    if(q.includes('fb')||q.includes('ngoning')){return `🤖 FB Scraper robot baca og:image. Bukan co-pilot, tapi bisa jadi co-pilot pakai Webhooks.`;}
    if(q.includes('cli')||q.includes('copilot')){return `Kamu pakai ALWI Co-Pilot CLI web! Ketik: cek og / ghost bug / dulkohar`;}
    return `🤖 Denger: "${q}"<br>Status Active • Coba: ghost bug, cek og, dulkohar`;
  }
  async function send(){const inp=document.getElementById('alwi-text');const t=inp.value.trim();if(!t)return;addMsg(t,'user');inp.value='';addMsg('⏳ mikir...','bot');const r=await coPilot(t);msgs.lastChild.remove();addMsg(r,'bot');}
  document.getElementById('alwi-send').onclick=send;
  document.getElementById('alwi-text').onkeypress=e=>{if(e.key==='Enter')send();};
})();
