/* ════════════════════════════════════════════════════════════
   live-klien.js — koneksi ke Web Server :8080 (WebSocket /ws)
   Semua halaman pakai ini: frame kamera real-time, komentar
   tersimpan di memori.json + alwi-memory, properti & chat siaran.
   TANPA localStorage — semuanya lewat web server.
   Pakai: LIVE.join(id,nama) · LIVE.kirimFrame(b64) ·
          LIVE.kirimKomentar(room,teks) · LIVE.kirimProperti(emoji,warna)
          LIVE.kirimChat(teks) · LIVE.on(tipe,fn) · LIVE.aktif()
   ════════════════════════════════════════════════════════════ */
window.LIVE = (function(){
  let ws=null, terhubung=false;
  const pendengar={frame:[],komentar:[],properti:[],chat:[],status:[]};
  const antrian=[];

  function urlWS(){ return (location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws'; }
  function emit(tipe,data){ (pendengar[tipe]||[]).forEach(f=>{ try{f(data)}catch(e){} }); }
  function kirimObj(o){
    if(ws && ws.readyState===1){ ws.send(JSON.stringify(o)); return true; }
    antrian.push(o); if(antrian.length>30) antrian.shift();
    return false;
  }
  function sambung(){
    let s;
    try{ s=new WebSocket(urlWS()); }catch(e){ return setTimeout(sambung,3000); }
    ws=s;
    s.onopen=function(){
      terhubung=true;
      emit('status',{aktif:true});
      antrian.splice(0).forEach(o=>{try{s.send(JSON.stringify(o))}catch(e){}});
    };
    s.onmessage=function(ev){
      let d; try{ d=JSON.parse(ev.data); }catch(e){ return; }
      if(d.type==='frame') emit('frame',d);
      else if(d.type==='komentar') emit('komentar',d);
      else if(d.type==='properti') emit('properti',d);
      else if(d.type==='chat') emit('chat',d);
      else if((d.type==='halo'||d.type==='riwayat'||d.type==='live')&&d.live) emit('status',{aktif:true,live:d.live});
    };
    s.onclose=function(){ terhubung=false; emit('status',{aktif:false}); setTimeout(sambung,3000); };
    s.onerror=function(){ try{s.close()}catch(e){} };
  }
  sambung();

  return {
    join:function(id,nama){ return kirimObj({type:'join',id:id||'TAMU',nama:nama||id}); },
    kirimFrame:function(b64){ return kirimObj({type:'frame',frame:b64}); },
    kirimKomentar:function(room,teks,nama){ return kirimObj({type:'komentar',room:room,teks:teks,nama:nama}); },
    kirimProperti:function(emoji,warna){ return kirimObj({type:'properti',emoji:emoji,warna:warna}); },
    kirimChat:function(teks){ return kirimObj({type:'chat',teks:teks}); },
    on:function(tipe,fn){ if(pendengar[tipe])pendengar[tipe].push(fn); },
    aktif:function(){ return terhubung; }
  };
})();
