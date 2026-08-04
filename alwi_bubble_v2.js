/**
 * ALWI BUBBLE v2 - PERBAIKAN NAVIGASI SEPERTI AGEN ALWI
 * Struktur menu Nur + error handler + international support
 */

(function(){
  if(window.__alwiBubbleV2)return;window.__alwiBubbleV2=true;

  // CONFIG
  const CONFIG = {
    suara: localStorage.getItem('alwi_suara') !== 'off',
    pos: (() => {
      try { return localStorage.getItem('alwi_pos') ? JSON.parse(localStorage.getItem('alwi_pos')) : null; }
      catch(e) { return null; }
    })(),
    lang: document.documentElement.lang === 'en' ? 'en' : 'id',
    personality: 'ramah-sopan'
  };

  // MENU STRUKTUR (sama seperti agen_alwi.js)
  const MENU_NUR = {
    'nur1': { label: '🏠 Nur 1 - PORTAL', desc: 'Main Portal & Homepage', url: 'nur1.html' },
    'nur2': { label: '💬 Nur 2 - DASHBOARD', desc: 'Login & Dashboard Akademi', url: 'nur2.html' },
    'nur3': { label: '📊 Nur 3 - ADMINISTRASI', desc: 'Finance Dashboard', url: 'nur3.html' },
    'nur4': { label: '🎨 Nur 4 - KREATOR', desc: 'Digital Asset Management', url: 'nur4.html' },
    'nur5': { label: '🎯 Nur 5 - GAME ARISAN', desc: 'Main Menu Arisan', url: 'nur5.html' },
    'nur6': { label: '💰 Nur 6 - BANK GAME', desc: 'Vault & Finance', url: 'nur6.html' },
    'nur7': { label: '🔊 Nur 7 - STREAMING', desc: 'Live & Streaming', url: 'nur7.html' },
    'nur8': { label: '🌙 Nur 8 - EMULATOR', desc: 'System & Maintenance', url: 'nur8.html' },
    'nur9': { label: '🎮 Nur 9 - SINKRONISASI', desc: 'Data Sync Protocol', url: 'nur9.html' },
    'nur10': { label: '👑 Nur 10 - KAMUS', desc: 'Alwi Dictionary', url: 'nur10.html' }
  };

  // EDU RESPONSES
  const EDU = {
    'nur1': {indo: "Nur 1 Cahaya = Variable. Contoh: cahaya='Nur'. Simpan di toples batik dengan sopan.",
             en: "Nur 1 Light = Variable. Example: cahaya='Nur'. Store in Batik container."},
    'nur2': {indo: "Nur 2 Angin = If-Else. Jika hujan → pakai payung, jika tidak → main.",
             en: "Nur 2 Wind = If-Else. If rain → use umbrella, if not → play."},
    'nur3': {indo: "Nur 3 Air = Loop. Banyu mili terus. for i in range(10): belajar().",
             en: "Nur 3 Water = Loop. Water flows. for i in range(10): learn()."},
    'nur4': {indo: "Nur 4 Tanah = Function. def rumah(): pondasi kuat. Fungsi yang bermanfaat.",
             en: "Nur 4 Earth = Function. def house(): strong foundation."},
    'nur5': {indo: "Nur 5 Api = Debug. Bug kuwi kanca sinau. Memory Leak = toples kebanyakan isi.",
             en: "Nur 5 Fire = Debug. Bugs are learning friends. Clean memory."},
    'nur6': {indo: "Nur 6 Langit = Array. Kumpulan data seperti awan berjajar.",
             en: "Nur 6 Sky = Array. Data collection like clouds."},
    'nur7': {indo: "Nur 7 Bintang = Class. Struktur sempurna seperti bintang di langit.",
             en: "Nur 7 Star = Class. Perfect structure like stars."},
    'nur8': {indo: "Nur 8 Bulan = API. Cahaya informasi yang menerangi jalan.",
             en: "Nur 8 Moon = API. Information light that guides."},
    'nur9': {indo: "Nur 9 Matahari = Database. Pusat energi data yang kuat.",
             en: "Nur 9 Sun = Database. Powerful data energy center."},
    'nur10': {indo: "Nur 10 Bumi = Deploy. Menanam hasil kerja untuk bermakna.",
              en: "Nur 10 Earth = Deploy. Plant your work to matter."},
    'menu': {indo: "Pilih Nur: nur1, nur2, nur3, nur4, nur5, nur6, nur7, nur8, nur9, nur10",
             en: "Choose Nur: nur1, nur2, nur3, nur4, nur5, nur6, nur7, nur8, nur9, nur10"},
    'halo': {indo: "Waalaikumsalam! Saya Alwi ⛑️ penjaga 10 Nur. Tanya soal Nur atau ketik 'menu'.",
             en: "Assalamu'alaikum! I'm Alwi ⛑️ guardian of 10 Nur. Ask about Nur or type 'menu'."}
  };

  let ac = null;
  
  function beep(f=800, d=0.12){
    if(!CONFIG.suara) return;
    try {
      if(!ac) ac = new(window.AudioContext || window.webkitAudioContext)();
      if(ac.state === 'suspended') ac.resume();
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.3, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + d);
      o.connect(g);
      g.connect(ac.destination);
      o.start(ac.currentTime);
      o.stop(ac.currentTime + d);
    } catch(e) { console.warn('Beep error:', e); }
  }

  function speak(t, lang='id-ID'){
    if(!CONFIG.suara || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      let u = new SpeechSynthesisUtterance(t);
      u.lang = lang;
      u.rate = 0.92;
      u.onend = () => {};
      u.onerror = e => console.warn('Speech error:', e.error);
      let voices = speechSynthesis.getVoices();
      let v = voices.find(v => v.lang.startsWith(lang.split('-')[0])) || voices[0];
      if(v) u.voice = v;
      speechSynthesis.speak(u);
    } catch(e) { console.error('Speak error:', e); }
  }

  const html = `
<div id="alwi-bubble-wrap" style="position:fixed;z-index:9998;touch-action:none;left:${CONFIG.pos ? CONFIG.pos.x+'px' : '20px'};top:${CONFIG.pos ? CONFIG.pos.y+'px' : 'auto'};bottom:${CONFIG.pos ? 'auto' : '20px'};right:auto;">
  <div id="alwi-dropup" style="display:none;position:absolute;bottom:75px;right:0;width:320px;background:linear-gradient(180deg,#0a0a0a,#161616);border:2px solid #c9a84c;border-radius:16px;overflow:hidden;box-shadow:0 0 20px rgba(0,0,0,0.9);z-index:10000;max-height:500px;display:flex;flex-direction:column;">
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#06140b,#0a2e1c);border-bottom:2px solid #c9a84c;padding:12px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
      <div style="display:flex;gap:10px;align-items:center;">
        <div style="font-size:24px;">⛑️</div>
        <div>
          <div style="color:#FFD700;font-weight:900;font-size:13px;">AGEN ALWI</div>
          <div style="color:#c9a84c;font-size:10px;">Navigasi 10 Nur</div>
        </div>
      </div>
      <div style="display:flex;gap:4px;">
        <button id="alwi-sound" style="background:transparent;border:1px solid #c9a84c;color:#FFD700;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:12px;">${CONFIG.suara ? '🔊' : '🔇'}</button>
        <button id="alwi-close" style="background:transparent;border:1px solid #c9a84c;color:#FFD700;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:12px;">✕</button>
      </div>
    </div>
    
    <!-- STATUS -->
    <div style="padding:10px;background:#0a2e1c;border-bottom:1px solid #222;font-size:11px;color:#ffcc00;">
      💬 Status: Online | Siap Melayani
    </div>
    
    <!-- CHAT -->
    <div id="alwi-chat" style="max-height:280px;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px;flex:1;"></div>
    
    <!-- MENU SHORTCUTS -->
    <div style="max-height:200px;overflow-y:auto;padding:8px;border-top:1px solid #222;display:flex;flex-direction:column;gap:4px;font-size:10px;">
      <div style="color:#888;padding:4px;font-weight:bold;">📋 MENU CEPAT</div>
      <button onclick="navigasiNur('nur1')" style="text-align:left;background:#1a1a1a;border:1px solid #333;color:#eee;padding:6px 8px;border-radius:4px;cursor:pointer;font-size:10px;">🏠 Nur 1 - Portal</button>
      <button onclick="navigasiNur('nur2')" style="text-align:left;background:#1a1a1a;border:1px solid #333;color:#eee;padding:6px 8px;border-radius:4px;cursor:pointer;font-size:10px;">💬 Nur 2 - Dashboard</button>
      <button onclick="navigasiNur('nur3')" style="text-align:left;background:#1a1a1a;border:1px solid #333;color:#eee;padding:6px 8px;border-radius:4px;cursor:pointer;font-size:10px;">📊 Nur 3 - Admin</button>
      <button onclick="document.getElementById('alwi-input').value='menu';alwiSend();" style="text-align:left;background:#1a1a1a;border:1px solid #333;color:#eee;padding:6px 8px;border-radius:4px;cursor:pointer;font-size:10px;margin-top:4px;color:#c9a84c;font-weight:bold;">📜 Lihat Semua Menu</button>
    </div>
    
    <!-- INPUT -->
    <div style="border-top:1px solid #222;padding:8px;display:flex;gap:6px;flex-shrink:0;">
      <input id="alwi-input" placeholder="Tanya Nur..." style="flex:1;background:#000;border:1px solid #333;padding:8px;border-radius:6px;color:#eee;font-size:12px;outline:none;" onkeypress="if(event.key==='Enter') alwiSend();">
      <button id="alwi-send" onclick="alwiSend()" style="background:#c9a84c;border:none;color:#000;padding:8px 12px;border-radius:6px;cursor:pointer;font-weight:600;font-size:10px;">Go</button>
    </div>
  </div>
  
  <!-- BUBBLE -->
  <button id="alwi-bubble" style="width:62px;height:62px;border-radius:50%;background:#06140b;border:2px solid #c9a84c;box-shadow:0 0 0 2px #c9a84c,0 6px 18px rgba(0,0,0,.8);cursor:grab;display:flex;align-items:center;justify-content:center;font-size:32px;user-select:none;transition:all 0.2s;" title="Klik untuk buka Alwi Agent">⛑️</button>
</div>

<style>
.alwi-link{display:block;padding:9px 12px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;color:#eee;text-decoration:none;font-size:12px;font-weight:600;transition:all 0.2s}
.alwi-link:hover{border-color:#c9a84c;background:#0a2e1c;color:#FFD700}
.msg{padding:8px 12px;border-radius:8px;font-size:12px;max-width:85%;word-wrap:break-word;line-height:1.4;}
.msg-user{background:#c9a84c;color:#000;margin-left:auto;text-align:right;font-weight:600;}
.msg-alwi{background:#1a1a1a;color:#eee;border:1px solid #2a2a2a;}
.msg-system{background:rgba(201,168,76,0.1);color:#c9a84c;border-left:2px solid #c9a84c;padding-left:10px;}
#alwi-input:focus{outline:none;border-color:#c9a84c;box-shadow:0 0 8px rgba(201,168,76,0.3);}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}
</style>
`;

  document.body.insertAdjacentHTML('beforeend', html);
  
  const wrap = document.getElementById('alwi-bubble-wrap');
  const bubble = document.getElementById('alwi-bubble');
  const drop = document.getElementById('alwi-dropup');
  const chat = document.getElementById('alwi-chat');
  const input = document.getElementById('alwi-input');
  const send = document.getElementById('alwi-send');
  const soundBtn = document.getElementById('alwi-sound');
  const closeBtn = document.getElementById('alwi-close');

  if(!wrap || !bubble || !drop || !chat) { console.error('Alwi: DOM elements not found'); return; }

  // DRAG
  let dragging = false, sx, sy, ox, oy, moved = false;
  function getXY(e) { const t = e.touches ? e.touches[0] : e; return {x: t.clientX, y: t.clientY}; }
  
  bubble.addEventListener('mousedown', sD);
  bubble.addEventListener('touchstart', sD, {passive: false});
  
  function sD(e) {
    e.preventDefault();
    dragging = true;
    moved = false;
    const p = getXY(e);
    sx = p.x; sy = p.y;
    const r = wrap.getBoundingClientRect();
    ox = r.left; oy = r.top;
    wrap.style.transition = 'none';
    document.addEventListener('mousemove', oM);
    document.addEventListener('mouseup', oE);
    document.addEventListener('touchmove', oM, {passive: false});
    document.addEventListener('touchend', oE);
  }
  
  function oM(e) {
    if(!dragging) return;
    e.preventDefault();
    const p = getXY(e);
    let dx = p.x - sx, dy = p.y - sy;
    if(Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    let nx = ox + dx, ny = oy + dy;
    nx = Math.max(0, Math.min(nx, innerWidth - 75));
    ny = Math.max(0, Math.min(ny, innerHeight - 75));
    wrap.style.left = nx + 'px';
    wrap.style.top = ny + 'px';
    wrap.style.bottom = 'auto';
    wrap.style.right = 'auto';
  }
  
  function oE() {
    dragging = false;
    wrap.style.transition = '';
    document.removeEventListener('mousemove', oM);
    document.removeEventListener('mouseup', oE);
    document.removeEventListener('touchmove', oM);
    document.removeEventListener('touchend', oE);
    if(wrap) {
      const r = wrap.getBoundingClientRect();
      try { localStorage.setItem('alwi_pos', JSON.stringify({x: r.left, y: r.top})); }
      catch(e) { console.warn('LocalStorage error:', e); }
    }
  }
  
  function toggle() {
    const isOpen = drop.style.display !== 'none';
    if(isOpen) {
      drop.style.display = 'none';
      beep(400, 0.08);
    } else {
      drop.style.display = 'flex';
      beep(900, 0.1);
      alwiAddMessage(EDU['halo'][CONFIG.lang], 'alwi');
      speak(EDU['halo'][CONFIG.lang], CONFIG.lang === 'en' ? 'en-US' : 'id-ID');
      input.focus();
    }
  }
  
  bubble.addEventListener('click', () => { if(!moved) toggle(); });
  closeBtn.onclick = () => { drop.style.display = 'none'; beep(350, 0.08); };
  soundBtn.onclick = function() {
    CONFIG.suara = !CONFIG.suara;
    try { localStorage.setItem('alwi_suara', CONFIG.suara ? 'on' : 'off'); }
    catch(e) { console.warn('LocalStorage error:', e); }
    this.textContent = CONFIG.suara ? '🔊' : '🔇';
    beep(CONFIG.suara ? 1000 : 300, 0.08);
  };
  
  function alwiAddMessage(t, who) {
    const d = document.createElement('div');
    d.className = 'msg msg-' + who;
    d.textContent = t;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }
  
  function getResponse(q) {
    const lc = q.toLowerCase();
    
    // Match Nur
    for(let i = 1; i <= 10; i++) {
      const key = 'nur' + i;
      if(lc.includes(key)) {
        const resp = EDU[key];
        return resp ? resp[CONFIG.lang] : 'Nur ' + i + ' dimuat...';
      }
    }
    
    // Menu
    if(lc.includes('menu') || lc.includes('list')) {
      return Object.values(MENU_NUR).map(m => m.label).join('\n');
    }
    
    // Default
    return EDU['halo'][CONFIG.lang];
  }
  
  window.alwiSend = function() {
    const v = (input.value || '').trim();
    if(!v) return;
    alwiAddMessage(v, 'user');
    beep(700, 0.08);
    input.value = '';
    
    setTimeout(() => {
      const resp = getResponse(v);
      alwiAddMessage(resp, 'alwi');
      speak(resp, CONFIG.lang === 'en' ? 'en-US' : 'id-ID');
    }, 500);
  };
  
  window.navigasiNur = function(nur) {
    const menu = MENU_NUR[nur];
    if(menu) {
      const msg = CONFIG.lang === 'en' ? 'Navigating to ' + menu.label : 'Mengarahkan ke ' + menu.label;
      alwiAddMessage(msg, 'alwi');
      beep(800, 0.1);
      setTimeout(() => { window.location.href = menu.url; }, 1200);
    }
  };
  
  send.onclick = () => { window.alwiSend(); };
  input.addEventListener('keypress', e => { if(e.key === 'Enter') window.alwiSend(); });

})();
