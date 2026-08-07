/* ALWI CS JAWA FINAL - alwi.Indramayuclub@gmail.com - Indramayu_nur */
(function(){
 if(window.__ALWI_JAWA)return;window.__ALWI_JAWA=1;
 var css=`#alwi-jawa{position:fixed;bottom:18px;right:18px;z-index:2147483647;font-family:Arial}
 #alwi-btn{width:68px;height:68px;border-radius:50%;background:radial-gradient(circle,#FFD700,#c9a84c);display:flex;align-items:center;justify-content:center;font-size:36px;cursor:pointer;box-shadow:0 0 0 3px #FFD700,0 8px 24px rgba(0,0,0,.8);animation:p 2s infinite}
 @keyframes p{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
 #alwi-box{position:absolute;bottom:80px;right:0;width:330px;max-height:480px;background:#111;border:2px solid #FFD700;border-radius:18px;display:none;flex-direction:column;overflow:hidden;box-shadow:0 12px 40px #000}
 #alwi-box.show{display:flex}
.alwi-h{background:linear-gradient(135deg,#7a5c1e,#c9a84c);color:#000;padding:10px;font-weight:900;text-align:center;font-size:13px}
.alwi-chat{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:7px;max-height:280px;background:#0a0a0a}
.msg{padding:8px 11px;border-radius:12px;font-size:12px;max-width:86%;line-height:1.35}
.msg-user{background:#FFD700;color:#000;margin-left:auto;font-weight:700}
.msg-alwi{background:#1e1e1e;color:#e8d5a0;border:1px solid #2a2a2a}
.alwi-inp{display:flex;gap:5px;padding:8px;border-top:1px solid #222;background:#111}
.alwi-inp input{flex:1;background:#000;border:1px solid #333;color:#fff;padding:9px;border-radius:10px;outline:none;font-size:12px}
.alwi-inp button{background:#FFD700;border:none;color:#000;padding:9px 13px;border-radius:10px;font-weight:900;cursor:pointer}
.alwi-mn{display:flex;gap:5px;padding:7px;background:#111;flex-wrap:wrap}
.alwi-mn button{background:#222;border:1px solid #c9a84c;color:#FFD700;padding:5px 9px;border-radius:20px;font-size:10px;cursor:pointer}
 `;
 var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 var w=document.createElement('div');w.id='alwi-jawa';
 w.innerHTML='<div id="alwi-box"><div class="alwi-h">⛑️ ALWI - CS INDRAMAYU CLUB<br><span style="font-size:10px">Takon Bae Batur, Isun Jawab!</span></div><div class="alwi-chat" id="alwi-chat"></div><div class="alwi-mn"><button onclick="alwiQ(\'priben daftar?\')">📝 Daftar</button><button onclick="alwiQ(\'isun artinya apa?\')">🎲 Kamus</button><button onclick="alwiQ(\'bantuan\')">🚨 Bantuan</button></div><div class="alwi-inp"><input id="alwi-in" placeholder="Takon apa Batur..."><button onclick="alwiSend()">➤</button></div></div><div id="alwi-btn">⛑️</div>';
 document.body.appendChild(w);
 var btn=document.getElementById('alwi-btn'),box=document.getElementById('alwi-box'),chat=document.getElementById('alwi-chat'),inp=document.getElementById('alwi-in'),open=false;
 function add(t,who){var d=document.createElement('div');d.className='msg msg-'+who;d.innerHTML=t;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;}
 var K={isun:"Isun = Saya / Kita<br>Conto: Isun arep dolan = Saya mau main",sira:"Sira = Kamu",batur:"Batur = Teman<br>Conto: Batur isun akeh",priben:"Priben = Bagaimana<br>Conto: Priben kabare?",pisan:"Pisan = Banget",dolan:"Dolan = Main",bagea:"Bagea = Bagus",umah:"Umah = Rumah",mangan:"Mangan = Makan"};
 window.alwiQ=function(q){inp.value=q;alwiSend();};
 window.alwiSend=function(){
  var q=inp.value.trim();if(!q)return;
  add(q,'user');inp.value='';
  var ql=q.toLowerCase(),jw=null;
  for(var k in K){if(ql.includes(k)){jw=K[k];break;}}
  if(!jw){
   if(ql.includes('daftar'))jw="Daftar gampang Batur!<br>1. Klik Daftar<br>2. Isi WA<br>3. Isun hubungi via WA / FB<br><br>CS: alwi.Indramayuclub@gmail.com";
   else if(ql.includes('bantuan')||ql.includes('help'))jw="Siap Batur! Tulis keluhanmu, isun terusno ning Admin pusat 🙏<br>Admin asli standby!";
   else if(ql.includes('fb')||ql.includes('facebook'))jw="FB: Indramayu Club<br>Inbox bae Batur! 📘";
   else if(ql.includes('halo')||ql.includes('assalam'))jw="Waalaikumsalam Batur! Priben kabare? Sehat? 😊";
   else jw="Durung paham <b>"+q+"</b> Batur 😅<br>Coba: isun, sira, batur, priben, pisan";
  }
  setTimeout(function(){add("⛑️ Alwi:<br>"+jw,'alwi');},300);
  try{fetch('/api/member/tanya',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pesan:q,halaman:location.pathname})});}catch(e){}
 };
 btn.onclick=function(){open=!open;box.classList.toggle('show',open);btn.textContent=open?'❌':'⛑️';if(open&&chat.children.length==0){add('Halo Batur! Isun Alwi CS Indramayu Club ⛑️<br>Takon bae nganggo Jawa / Indonesia!','alwi');}};
})();
