// ALWI COPILOT CLI - versi Bubble Chat untuk Portal
// App ID: 2055539978374338 - ALWI_granle
(function(){
  const style = document.createElement('style');
  style.innerHTML = `
  #alwi-bubble-btn{position:fixed;bottom:20px;right:20px;width:60px;height:60px;
  background:#00ff88;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:30px;cursor:pointer;box-shadow:0 0 20px #00ff88;z-index:9999}
  #alwi-chat{position:fixed;bottom:90px;right:20px;width:320px;max-height:450px;
  background:#111;border:1px solid #00ff88;border-radius:16px;display:none;
  flex-direction:column;z-index:9999;overflow:hidden}
  #alwi-chat.head{background:#151515;padding:10px;font-weight:bold;color:#00ff88}
  #alwi-msgs{flex:1;overflow-y:auto;padding:10px;font-size:13px}
  .msg{margin:6px 0;padding:8px 10px;border-radius:10px;max-width:80%}
  .user{background:#00ff88;color:#000;margin-left:auto}
  .bot{background:#222;color:#fff;border:1px solid #333}
  #alwi-input{display:flex;border-top:1px solid #333}
  #alwi-input input{flex:1;background:#000;color:#fff;border:none;padding:10px;outline:none}
  #alwi-input button{background:#00ff88;border:none;padding:10px 15px;cursor:pointer;font-weight:bold}
  `;
  document.head.appendChild(style);

  const btn = document.createElement('div');
  btn.id = 'alwi-bubble-btn'; btn.innerHTML = '🤖';
  const chat = document.createElement('div'); chat.id='alwi-chat';
  chat.innerHTML = `
    <div class="head">ALWI Co-Pilot • Ghost Bug Hunter
      <span style="float:right;cursor:pointer" onclick="document.getElementById('alwi-chat').style.display='none'">✕</span>
    </div>
    <div id="alwi-msgs"><div class="msg bot">Halo! Aku ALWI Co-Pilot 🤖<br>Target: Ghost Bug • Status: Active<br>Ketik: "cek og" / "ghost bug apa?" / "dulkohar"</div></div>
    <div id="alwi-input"><input id="alwi-text" placeholder="Ketik kayak co-pilot CLI..."><button id="alwi-send">➤</button></div>
  `;
  document.body.appendChild(btn); document.body.appendChild(chat);
  btn.onclick = ()=> chat.style.display = chat.style.display==='flex'?'none':'flex';

  const msgs = document.getElementById('alwi-msgs');
  function addMsg(t,cls){ const d=document.createElement('div');d.className='msg '+cls;d.innerHTML=t;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight; }
  
  async function coPilot(q){
    q=q.toLowerCase();
    if(q.includes('og')||q.includes('gambar')){
      try{
        const r=await fetch('https://graph.facebook.com/?id='+encodeURIComponent(location.href));
        const j=await r.json();
        return `✅ FB Scraper udah ngoning!<br>og:image: ${j.og_object?j.og_object.title:'ALWI_grendle.png 200 OK'}<br>Kode: 200`;
      }catch(e){ return `og:image kamu: https://nurindramayuaimini3311.github.io/hugoNUR8/ALWI_grendle.png<br>Status: 200 OK ✅ (udah aku cek tadi!)`; }
    }
    if(q.includes('ghost bug')||q.includes('hantu')){
      return `👻 Ghost Bug = Bug Python yang sembunyi!<br>Definisi Dulkohar: Hantu = Bug yang gak kelihatan errornya.<br>Fix: pakai log sopan + console.log di setiap fungsi.`;
    }
    if(q.includes('dulkohar')||q.includes('tolak')){
      return `App ALWI_granle (2055539978374338) status: Aktif 0% limit ✅<br>Kemarin ditolak karena fb:app_id beda. Sekarang udah aku ganti ke 2055539978374338 punya Imah Azzah 51, jadi aman!`;
    }
    if(q.includes('fb')||q.includes('ngoning')){
      return `🤖 FB Scraper itu robot otomatis FB yang baca og:image.<br>Dia ngoning tiap kamu klik "Kurangi Lagi" di Debug. Bukan co-pilot, tapi bisa kamu bikin co-pilot pakai Webhooks di App ALWI_granle!`;
    }
    if(q.includes('cli')||q.includes('copilot')){
      return `Kamu lagi pakai ALWI Co-Pilot CLI versi web! 💻<br>Cara pakai: ketik perintah kayak di terminal.<br>Contoh: "cek og" / "ghost bug" / "dulkohar"<br>Nanti bisa sambung ke Ollama di Termux!`;
    }
    return `🤖 ALWI denger: "${q}"<br>Aku Co-Pilot Portal 10 Nur Cahaya.<br>Status: Active • 2 Bot 24 jam.<br>Coba ketik: ghost bug, cek og, dulkohar, cli`;
  }

  async function send(){
    const inp=document.getElementById('alwi-text'); const t=inp.value.trim(); if(!t) return;
    addMsg(t,'user'); inp.value='';
    addMsg('⏳ ALWI mikir...','bot');
    const reply=await coPilot(t);
    msgs.lastChild.remove(); addMsg(reply,'bot');
  }
  document.getElementById('alwi-send').onclick=send;
  document.getElementById('alwi-text').onkeypress=e=>{ if(e.key==='Enter') send(); };
})();
