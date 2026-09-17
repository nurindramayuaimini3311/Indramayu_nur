!function(){
if(window.__ALWI3)return;window.__ALWI3=1;
// VERSI 3 - pink terang, ringan, bisa jalan bareng bubble4 + bubble1
let x=180,y=320,vx=0,vy=0,vxp=0,vyp=0,isDrag=false,sx,sy,rot=0;
let b=document.createElement('div');
b.id='ALWI_BOLA3';
b.style.cssText=`position:fixed;left:${x}px;top:${y}px;z-index:999999993;width:60px;height:60px;background:radial-gradient(circle at 30% 30%,#FFD6F5,#FF4DFF 60%,#B300B3);border-radius:50%;border:3px solid #FF8AFF;box-shadow:0 0 20px rgba(255,77,255,.8);font-size:32px;display:flex;align-items:center;justify-content:center;cursor:grab;user-select:none;touch-action:none;`;
b.innerHTML='<span>💖</span>';
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
b.addEventListener('pointerdown',e=>{isDrag=true;b.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;vxp=vyp=0;vx=vy=0;});
b.addEventListener('pointermove',e=>{if(!isDrag)return;let dx=e.clientX-sx,dy=e.clientY-sy;x+=dx;y+=dy;vx=dx;vy=dy;sx=e.clientX;sy=e.clientY;rot+=dx*2;upd();});
b.addEventListener('pointerup',()=>{
 isDrag=false;
 let p=Math.sqrt(vx*vx+vy*vy);
 if(p>4){vxp=vx*2.2;vyp=vy*2.2-4;phys();}
 else if(p>1.5){vxp=vx*1.4;vyp=vy*1.4-2;phys();}
});
setInterval(()=>{if(!isDrag&&!anim){y+=Math.cos(Date.now()/600)*1.2;upd();}},50);
addEventListener('resize',()=>{if(x>innerWidth-60)x=innerWidth-60;if(y>innerHeight-60)y=innerHeight-60;upd();});
}();
