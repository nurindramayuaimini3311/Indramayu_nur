let s=null;
async function st(f){try{if(s)s.getTracks().forEach(t=>t.stop());s=await navigator.mediaDevices.getUserMedia({video:{facingMode:f}});$('v').srcObject=s;status('Kamera '+(f=='user'?'depan':'belakang')+' aktif ✅')}catch(e){status('Error: '+e.message)}}
function cap(){if(!s){status('Nyalakan kamera dulu');return}const v=$('v'),c=$('c');c.width=v.videoWidth||640;c.height=v.videoHeight||480;c.getContext('2d').drawImage(v,0,0);const d=c.toDataURL('image/jpeg',0.85);const p=$('p');p.src=d;p.style.display='block';status('Foto ✅')}
