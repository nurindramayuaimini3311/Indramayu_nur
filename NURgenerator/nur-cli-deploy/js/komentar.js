let msgs=JSON.parse(localStorage.getItem('nur_komentar')||'[]');
function show(){const l=$('list');l.innerHTML='';msgs.forEach(m=>{const d=document.createElement('div');d.style.cssText='background:#1b3a24;padding:10px;border-radius:8px;margin:6px 0';d.textContent=m;l.appendChild(d)})}
function kirim(){const v=$('msg').value;if(!v){status('Tulis komentar dulu');return}msgs.unshift(v);localStorage.setItem('nur_komentar',JSON.stringify(msgs));status('Terkirim ✅');$('msg').value='';show()}
show();
