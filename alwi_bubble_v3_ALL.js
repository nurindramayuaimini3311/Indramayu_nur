<script>
// ALWI BUBBLE v3 - ALL PROJECT SERVER - KATA ACAK ONLY
// Dipasang di semua HTML, Alwi makin pintar tiap halaman!

(function(){
  if(window.__alwiV3) return; window.__alwiV3=true;
  
  const style=document.createElement('style');
  style.innerHTML=`
  #alwi-wrap{position:fixed;z-index:99999;bottom:20px;right:20px;touch-action:none}
  #alwi-bubble{width:64px;height:64px;border-radius:50%;background:#0a1a12;border:2px solid #FFD700;box-shadow:0 0 0 2px #c9a84c,0 6px 20px rgba(0,0,0,.8);cursor:grab;display:flex;align-items:center;justify-content:center;font-size:30px;user-select:none}
  #alwi-panel{display:none;position:absolute;bottom:75px;right:0;width:340px;max-height:520px;background:linear-gradient(180deg,#0a0a0a,#161616);border:2px solid #FFD700;border-radius:16px;overflow:hidden;box-shadow:0 0 30px rgba(0,0,0,.9);flex-direction:column}
  #alwi-panel.show{display:flex}
  .alwi-head{background:linear-gradient(135deg,#06140b,#0a2e1c);border-bottom:2px solid #FFD700;padding:12px;display:flex;justify-content:space-between;align-items:center}
  .alwi-stats{display:flex;gap:6px;padding:8px;background:#111;border-bottom:1px solid #222;font-size:10px}
  .alwi-stat{flex:1;text-align:center;background:#1a1a1a;border-radius:8px;padding:6px}
  .alwi-stat b{color:#FFD700;display:block;font-size:14px}
  .alwi-chat{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px;max-height:280px}
  .msg{padding:8px 12px;border-radius:10px;font-size:12px;max-width:88%;line-height:1.4}
  .msg-user{background:#FFD700;color:#000;margin-left:auto}
  .msg-alwi{background:#1e1e1e;color:#eee;border:1px solid #333}
  .msg-kata{background:linear-gradient(135deg,#1a1408,#2a2008);border:1px solid #c9a84c;color:#FFD700}
  .alwi-tools{display:flex;gap:6px;padding:8px;background:#0a0a0a;border-top:1px solid #222;flex-wrap:wrap}
  .alwi-btn{flex:1;min-width:70px;background:#1a1a1a;border:1px solid #c9a84c;color:#FFD700;padding:7px;border-radius:8px;font-size:11px;cursor:pointer;font-weight:600}
  .alwi-btn:hover{background:#c9a84c;color:#000}
  .alwi-input{display:flex;gap:6px;padding:8px;border-top:1px solid #222;background:#111}
  .alwi-input input{flex:1;background:#000;border:1px solid #333;color:#fff;padding:8px;border-radius:8px;outline:none;font-size:12px}
  .alwi-input button{background:#FFD700;border:none;color:#000;padding:8px 12px;border-radius:8px;cursor:pointer;font-weight:700}
  `;
  document.head.appendChild(style);
  
  const wrap=document.createElement('div'); wrap.id='alwi-wrap';
  wrap.innerHTML=`
    <div id="alwi-panel">
      <div class="alwi-head">
        <div style="display:flex;gap:8px;align-items:center">
          <span style="font-size:22px">⛑️</span>
          <div><div style="color:#FFD700;font-weight:900;font-size:13px">ALWI PUSAT SERVER</div><div style="color:#c9a84c;font-size:10px">All Project • Kata Acak</div></div>
        </div>
        <button onclick="document.getElementById('alwi-panel').classList.remove('show')" style="background:transparent;border:1px solid #FFD700;color:#FFD700;width:26px;height:26px;border-radius:6px;cursor:pointer">✕</button>
      </div>
      <div class="alwi-stats">
        <div class="alwi-stat"><b id="alwi-stat-kata">0</b><span>KAMUS</span></div>
        <div class="alwi-stat"><b id="alwi-stat-baca">0</b><span>DIBACA</span></div>
        <div class="alwi-stat"><b id="alwi-stat-lv">Lv0</b><span>LEVEL</span></div>
      </div>
      <div class="alwi-chat" id="alwi-chat"></div>
      <div class="alwi-tools">
        <button class="alwi-btn" onclick="alwiAcak()">🎲 Kata Acak</button>
        <button class="alwi-btn" onclick="alwiAntologi()">📚 Antologi</button>
        <button class="alwi-btn" onclick="alwiStatus()">📊 Status</button>
        <button class="alwi-btn" onclick="alwiKomen()">💬 Komen</button>
      </div>
      <div class="alwi-input">
        <input id="alwi-in" placeholder="Tanya / ketik kata..." onkeypress="if(event.key==='Enter')alwiSend()">
        <button onclick="alwiSend()">➤</button>
      </div>
    </div>
    <div id="alwi-bubble" title="ALWI PUSAT - All Project Server">⛑️</div>
  `;
  document.body.appendChild(wrap);
  
  const bubble=document.getElementById('alwi-bubble');
  const panel=document.getElementById('alwi-panel');
  const chat=document.getElementById('alwi-chat');
  
  bubble.onclick=()=>{panel.classList.toggle('show'); if(panel.classList.contains('show')){alwiLoadStats(); alwiAdd('Halo Bos! 🤖\nAku ALWI Server All Project!\nSemua halaman di ~/hugoNUR8/ sekarang jadi 1 server!\n\n🎲 Klik Kata Acak biar aku makin pintar!','alwi');}};
  
  function alwiAdd(t,who){
    const d=document.createElement('div'); d.className='msg msg-'+who; d.innerHTML=t.replace(/\n/g,'<br>'); chat.appendChild(d); chat.scrollTop=chat.scrollHeight;
  }
  
  async function alwiLoadStats(){
    try{
      const r=await fetch('/api/alwi/status'); const j=await r.json();
      document.getElementById('alwi-stat-kata').textContent=j.total_html||Object.keys({}).length;
      document.getElementById('alwi-stat-baca').textContent=j.total_antologi||0;
      document.getElementById('alwi-stat-lv').textContent='Lv'+Math.floor((j.total_antologi||0)/5);
    }catch(e){
      // offline
      const hist=JSON.parse(localStorage.getItem('icm_kamus_acak')||'[]');
      document.getElementById('alwi-stat-baca').textContent=hist.length;
      document.getElementById('alwi-stat-lv').textContent='Lv'+Math.floor(hist.length/5);
      document.getElementById('alwi-stat-kata').textContent='25+';
    }
  }
  
  window.alwiAcak=async function(){
    const halaman=location.pathname;
    alwiAdd('🎲 Alwi lagi acak kata dari '+halaman+'...','user');
    try{
      const r=await fetch('/api/kamus/acak?halaman='+encodeURIComponent(halaman)+'&user=web');
      const d=await r.json();
      alwiAdd(`<div style="text-align:center"><div style="font-size:10px;color:#9a8050">${d.kategori}</div><div style="font-size:22px;color:#FFD700;font-weight:800">${d.kata}</div><div style="font-size:14px;color:#fff">= ${d.indonesia}</div><div style="font-size:11px;font-style:italic;margin-top:6px">${d.contoh}</div><div style="font-size:9px;color:#9a8050;margin-top:6px">${d.antologi} • ${d.level_nama}</div></div>`,'kata');
      alwiLoadStats();
      // Kalau di halaman kamus, update juga
      if(window.tampilHasil) tampilHasil(d);
      if(window.simpanHistory) simpanHistory(d.kata);
    }catch(e){
      alwiAdd('Offline - pakai lokal dulu Bos. Jalankan python app.py biar server nyala!','alwi');
      if(window.acakKata && !e.message.includes('fetch')) window.acakKata();
    }
  }
  
  window.alwiAntologi=async function(){
    try{
      const r=await fetch('/api/alwi/antologi'); const j=await r.json();
      let t=`📚 ANTOLOGI ALWI\nTotal baca: ${j.total_baca} kata\n${j.level}\n\nTerakhir:\n`;
      t+=j.kata_terakhir.slice(0,5).map(x=>`• ${x.kata} = ${x.arti} (${x.halaman||''})`).join('\n');
      alwiAdd(t,'alwi');
    }catch(e){
      const hist=JSON.parse(localStorage.getItem('icm_kamus_acak')||'[]');
      alwiAdd(`📚 Antologi Lokal\n${hist.length} kata: ${hist.slice(0,8).join(', ')}`,'alwi');
    }
  }
  
  window.alwiStatus=async function(){
    try{
      const r=await fetch('/api/alwi/status'); const j=await r.json();
      alwiAdd(`📊 STATUS SERVER\n${j.server}\n${j.status}\nHTML: ${j.total_html} files\nKomentar: ${j.total_komentar}\nAntologi: ${j.total_antologi}\nLevel: ${j.level_alwi}\n\nFolders: ${j.folders.join(', ')}`,'alwi');
    }catch(e){
      alwiAdd('📊 Offline - Vercel mode\nJalankan python app.py di Termux biar jadi server full!','alwi');
    }
  }
  
  window.alwiKomen=function(){
    const halaman=location.pathname;
    window.location.href='/konten/komentar.html?halaman='+encodeURIComponent(halaman);
  }
  
  window.alwiSend=async function(){
    const inp=document.getElementById('alwi-in'); const q=inp.value.trim(); if(!q) return;
    alwiAdd(q,'user'); inp.value='';
    if(q.toLowerCase().includes('acak')) return alwiAcak();
    if(q.toLowerCase().includes('antologi')) return alwiAntologi();
    if(q.toLowerCase().includes('status')) return alwiStatus();
    try{
      const r=await fetch('/api/kamus/cari/'+encodeURIComponent(q)); const j=await r.json();
      if(j.status==='ketemu') alwiAdd(`📖 ${j.kata} = ${j.indonesia}\n${j.kategori}\n${j.contoh||''}`,'alwi');
      else if(j.status==='mirip') alwiAdd(`Mirip ${q}:\n`+j.hasil.map(h=>`• ${h.kata} = ${h.indonesia}`).join('\n'),'alwi');
      else alwiAdd(`Gak ketemu ${q}, coba 🎲 Kata Acak!`,'alwi');
    }catch(e){
      alwiAdd('Coba 🎲 Kata Acak dulu Bos!','alwi');
    }
  }
  
  // Auto load stats
  setTimeout(alwiLoadStats,1000);
})();
</script>

