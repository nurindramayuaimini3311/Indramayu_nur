!function(){
if(window.__ALWI2)return;window.__ALWI2=1;
// VERSI 2 - hijau terang, ringan, bisa jalan bareng bubble lain
// SUARA BAYI (Web Audio, offline): tekan = "outhhh" 👶, lempar = ketawa bayi 😂
function ac(){try{if(!window.__alwiAC)window.__alwiAC=new(window.AudioContext||window.webkitAudioContext)();if(window.__alwiAC.state==='suspended')window.__alwiAC.resume();return window.__alwiAC;}catch(e){return null;}}
function bayiOuth(base){const a=ac();if(!a)return;const t=a.currentTime;
 const o=a.createOscillator(),g=a.createGain(),v=a.createOscillator(),vg=a.createGain();
 o.type='triangle';o.frequency.setValueAtTime(base*.8,t);o.frequency.linearRampToValueAtTime(base*1.3,t+.3);
 v.frequency.value=6;vg.gain.value=base*.015;v.connect(vg);vg.connect(o.frequency);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.14,t+.06);g.gain.exponentialRampToValueAtTime(.001,t+.5);
 o.connect(g);g.connect(a.destination);o.start(t);v.start(t);o.stop(t+.55);v.stop(t+.55);}
function bayiKetawa(base){const a=ac();if(!a)return;const t0=a.currentTime;
 for(let i=0;i<6;i++){const t=t0+i*.11,f=base*(1+Math.sin(i*1.3)*.15+i*.04);
  const o=a.createOscillator(),g=a.createGain();
  o.type='sine';o.frequency.setValueAtTime(f*1.5,t);o.frequency.exponentialRampToValueAtTime(f*.8,t+.09);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.18,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.11);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.13);}}
let x=280,y=130,vx=0,vy=0,vxp=0,vyp=0,isDrag=false,sx,sy,rot=0;
let b=document.createElement('div');
b.id='ALWI_BOLA2';
b.style.cssText=`position:fixed;left:${x}px;top:${y}px;z-index:999999992;width:60px;height:60px;background:radial-gradient(circle at 30% 30%,#D6FFD6,#00FF88 60%,#00994D);border-radius:50%;border:3px solid #8AFFB0;box-shadow:0 0 20px rgba(0,255,136,.8);font-size:32px;display:flex;align-items:center;justify-content:center;cursor:grab;user-select:none;touch-action:none;`;
b.innerHTML='<span>💚</span>';
document.body.appendChild(b);
function upd(){b.style.left=x+'px';b.style.top=y+'px';b.style.transform=`rotate(${rot}deg)`;}
let anim=false;
function phys(){
 if(anim)return;anim=true;
 (function a(){
  if(Math.abs(vxp)<.1&&Math.abs(vyp)<.1&&y>=innerHeight-65){anim=false;upd();return;}
  vyp+=.35;x+=vxp;y+=vyp;rot+=vxp*.5;vxp*=.985;
  if(y>innerHeight-60){y=innerHeight-60;vyp*=-.75;}
  if(y<5){y=5;vyp*=-.75;}
  if(x<5){x=5;vxp*=-.75;}
  if(x>innerWidth-60){x=innerWidth-60;vxp*=-.75;}
  upd();requestAnimationFrame(a);
 })();
}
b.addEventListener('pointerdown',e=>{ac();isDrag=true;b.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;vxp=vyp=0;vx=vy=0;});
b.addEventListener('pointermove',e=>{if(!isDrag)return;let dx=e.clientX-sx,dy=e.clientY-sy;x+=dx;y+=dy;vx=dx;vy=dy;sx=e.clientX;sy=e.clientY;rot+=dx*2;upd();});
b.addEventListener('pointerup',()=>{
 isDrag=false;
 let p=Math.sqrt(vx*vx+vy*vy);
 if(p>4){vxp=vx*2.2;vyp=vy*2.2-4;phys();bayiKetawa(650);}
 else if(p>1.5){vxp=vx*1.4;vyp=vy*1.4-2;phys();bayiKetawa(650);}
 else bayiOuth(460);
});
setInterval(()=>{if(!isDrag&&!anim){y+=Math.sin(Date.now()/700+2)*1.2;upd();}},50);
addEventListener('resize',()=>{if(x>innerWidth-60)x=innerWidth-60;if(y>innerHeight-60)y=innerHeight-60;upd();});
}();
