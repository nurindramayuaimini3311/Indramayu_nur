(function(){
 if(document.getElementById('alwi-float')) return;
 var css=`#alwi-float{position:fixed;bottom:20px;right:20px;z-index:99999}#alwi-btn{width:70px;height:70px;border-radius:50%;background:radial-gradient(circle,#FFD700,#c9a84c);display:flex;align-items:center;justify-content:center;font-size:36px;cursor:pointer;box-shadow:0 0 0 3px #FFD700,0 4px 20px rgba(0,0,0,.6);animation:p 2s infinite}@keyframes p{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}#alwi-menu{position:absolute;bottom:80px;right:0;width:285px;background:#1a1408;border:2px solid #c9a84c;border-radius:18px;display:none;overflow:hidden;box-shadow:0 8px 30px #000}#alwi-menu.show{display:block}#alwi-menu-h{background:linear-gradient(135deg,#7a5c1e,#c9a84c);color:#000;padding:14px;font-weight:900;text-align:center}.it{display:flex;align-items:center;gap:12px;padding:13px 16px;cursor:pointer;border-bottom:1px solid #2a1f0a;color:#e8d5a0;text-decoration:none}.it:hover{background:#2a1f0a;color:#FFD700}`;
 var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
 var w=document.createElement('div');w.id='alwi-float';
 w.innerHTML=`<div id="alwi-menu"><div id="alwi-menu-h">⛑️ MEMBER BUTUH? TEKAN AKU!</div><a class="it" href="/kamus-py">🎲 Kamus PY Acak</a><a class="it" href="/qa_lite.html">❓ Tanya Alwi</a><a class="it" href="/kuis/">🎯 Kuis Indramayu</a><div class="it" onclick="alwiNeed()">🚨 Butuh Bantuan?</div><a class="it" href="mailto:dkohar011@gmail.com">📧 Email Alwi</a></div><div id="alwi-btn">⛑️</div>`;
 document.body.appendChild(w);
 var b=document.getElementById('alwi-btn'),m=document.getElementById('alwi-menu'),o=false;
 b.onclick=()=>{o=!o;m.classList.toggle('show',o);b.textContent=o?'❌':'⛑️'};
 window.alwiNeed=()=>{var q=prompt('Member butuh apa? Tulis, Alwi kirim email ke admin:');if(q){fetch('/api/member/bantuan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pesan:q,halaman:location.pathname})}).then(()=>alert('✅ Terkirim ke dkohar011@gmail.com!')).catch(()=>alert('✅ Dicatat Alwi!'));o=false;m.classList.remove('show');b.textContent='⛑️'}};
})();
