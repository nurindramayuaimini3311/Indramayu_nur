let mr=null,ch=[];
async function rec(){try{const s=await navigator.mediaDevices.getUserMedia({audio:1});ch=[];mr=new MediaRecorder(s);mr.ondataavailable=e=>e.data.size>0&&ch.push(e.data);mr.onstop=()=>{const b=new Blob(ch,{type:'audio/webm'});$('ap').src=URL.createObjectURL(b);$('ap').style.display='block';s.getTracks().forEach(t=>t.stop());status('Rekam selesai ✅')};mr.start();$('b2').disabled=0;status('🎤 Merekam...')}catch(e){status('Error: '+e.message)}}
function stp(){if(mr&&mr.state=='recording'){mr.stop();$('b2').disabled=1}}
