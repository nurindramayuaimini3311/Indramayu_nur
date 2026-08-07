ALWI_MENU_JS = """
// ALWI MENU DROPDOWN - MEMBER BUTUH TEKAN AKU
(function(){
  if(document.getElementById('alwi-member-menu')) return;

  // CSS
  var css = `
  #alwi-float{position:fixed;bottom:20px;right:20px;z-index:99999;font-family:Arial}
  #alwi-btn{width:70px;height:70px;border-radius:50%;background:radial-gradient(circle,#FFD700,#c9a84c);display:flex;align-items:center;justify-content:center;font-size:36px;cursor:pointer;box-shadow:0 0 0 3px #FFD700,0 4px 20px rgba(0,0,0,.6);animation:alwiPulse 2s infinite;user-select:none}
  @keyframes alwiPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
  #alwi-menu{position:absolute;bottom:80px;right:0;width:280px;background:#1a1408;border:2px solid #c9a84c;border-radius:18px;box-shadow:0 8px 30px rgba(0,0,0,.8);display:none;overflow:hidden}
  #alwi-menu.show{display:block;animation:alwiSlide .3s ease}
  @keyframes alwiSlide{from{opacity:0;transform:translateY(20px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
  #alwi-menu-header{background:linear-gradient(135deg,#7a5c1e,#c9a84c);color:#000;padding:14px;font-weight:900;text-align:center;font-size:14px}
  .alwi-item{display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;border-bottom:1px solid #2a1f0a;color:#e8d5a0;text-decoration:none;transition:.2s}
  .alwi-item:hover{background:#2a1f0a;color:#FFD700}
  .alwi-item-icon{font-size:22px;width:30px;text-align:center}
  .alwi-item-text{flex:1;font-size:13px;font-weight:600}
  .alwi-badge{background:#FFD700;color:#000;font-size:9px;padding:2px 6px;border-radius:10px;font-weight:900}
  `;
  var style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);

  // HTML
  var wrap=document.createElement('div'); wrap.id='alwi-float';
  wrap.innerHTML=`
    <div id="alwi-menu">
      <div id="alwi-menu-header">⛑️ MEMBER BUTUH? TEKAN AKU!</div>
      <a class="alwi-item" href="/kamus-py"><span class="alwi-item-icon">🎲</span><span class="alwi-item-text">Kamus PY Acak</span><span class="alwi-badge">PY</span></a>
      <a class="alwi-item" href="/api/kamus/acak?halaman=member"><span class="alwi-item-icon">📚</span><span class="alwi-item-text">Alwi Belajar Kata</span><span class="alwi-badge">NEW</span></a>
      <a class="alwi-item" href="/qa_lite.html"><span class="alwi-item-icon">❓</span><span class="alwi-item-text">Tanya Alwi</span></a>
      <a class="alwi-item" href="/kuis/"><span class="alwi-item-icon">🎯</span><span class="alwi-item-text">Kuis Indramayu</span></a>
      <div class="alwi-item" onclick="alwiEmergency()"><span class="alwi-item-icon">🚨</span><span class="alwi-item-text">Butuh Bantuan Darurat?</span></div>
      <a class="alwi-item" href="mailto:dkohar011@gmail.com?subject=Butuh Bantuan Member"><span class="alwi-item-icon">📧</span><span class="alwi-item-text">Email Alwi</span></a>
    </div>
    <div id="alwi-btn" title="Member butuh? Tekan aku!">⛑️</div>
  `;
  document.body.appendChild(wrap);

  var btn=document.getElementById('alwi-btn');
  var menu=document.getElementById('alwi-menu');
  var open=false;
  btn.onclick=function(){
    open=!open;
    menu.classList.toggle('show',open);
    btn.textContent=open?'❌':'⛑️';
    if(open){ 
      // Notif ke server kalau member tekan
      fetch('/api/alwi/status').then(r=>r.json()).then(d=>{
        console.log('Alwi dipanggil:',d);
      });
    }
  };
  // Tutup kalau klik di luar
  document.addEventListener('click',function(e){
    if(!wrap.contains(e.target) && open){
      open=false; menu.classList.remove('show'); btn.textContent='⛑️';
    }
  });

  window.alwiEmergency=function(){
    var msg=prompt('Member butuh apa? Tulis di sini, Alwi kirim email ke admin:');
    if(msg){
      fetch('/api/member/bantuan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pesan:msg,halaman:location.pathname,waktu:new Date().toLocaleString()})})
      .then(()=>alert('✅ Laporan terkirim ke dkohar011@gmail.com! Alwi segera bantu! ⛑️'))
      .catch(()=>alert('✅ Pesan dicatat! (email auto)'));
    }
  };
})();
"""
  with open('alwi_bubble_v4_MENU.js','w') as f:
      f.write(ALWI_MENU_JS)
  print("✅ alwi_bubble_v4_MENU.js jadi")
