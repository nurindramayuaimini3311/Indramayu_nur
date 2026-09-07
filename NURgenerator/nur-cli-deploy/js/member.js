let members=JSON.parse(localStorage.getItem('nur_members')||'[]');
function show(){const l=$('list');l.innerHTML='';members.forEach((m,i)=>{const d=document.createElement('div');d.style.cssText='background:#1b3a24;padding:10px;border-radius:8px;margin:6px 0';d.innerHTML='<b>'+m.nama+'</b> '+m.email;l.appendChild(d)})}
function daftar(){const n=$('nama').value,e=$('email').value;if(!n||!e){status('Isi nama & email');return}members.push({nama:n,email:e});localStorage.setItem('nur_members',JSON.stringify(members));status('Terdaftar ✅');$('nama').value='';$('email').value='';show()}
show();
