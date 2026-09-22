// ===== RAMBO PANJANG v2 — engine bersama 3 level =====
// Tiap level set window.GAME sebelum memuat game.js ini:
//   soldierVolley/soldierCd = jumlah & kecepatan tembakan musuh (prajurit)
//   bossVolley/bossCd/bossSpeed = jumlah & kecepatan tembakan boss
const G = window.GAME || {};
const CFG = {
  title: G.title || 'ALWI - LEVEL 3',
  sub:   G.sub   || 'ALWI CONTRA WAR',
  durSec: G.durSec || 1500,                 // 25 menit = 1500 detik
  soldierVolley: G.soldierVolley || 1,
  soldierCd:     G.soldierCd     || 1500,
  bossVolley:    G.bossVolley    || 3,
  bossCd:        G.bossCd        || 300,
  bossSpeed:     G.bossSpeed     || 3
};

const canvas=document.getElementById('c'), ctx=canvas.getContext('2d');
const W=960,H=540;
const GROUND_Y=H-64;
let keys={}, gameState='menu', score=0,kills=0,lives=3,power=100, rapidTimer=0;
let player,bullets=[],eBullets=[],enemies=[],particles=[],powerups=[],camX=0;
let spawnTimer=0, difficulty=0;
let waveCd=500, waveNo=0, waveQueue=0, waveTimer=0, trickleCd=200, boss=null, detikMain=0;
let bossPhase='idle', bossTimer=0, bossNextFrame=0, bossSeen=0, bossNo=0;
let blocks=[],floatTexts=[],koin=0,blockTimer=0;

function resetGame(){
  score=0;kills=0;lives=9;power=100;rapidTimer=0;
  bullets=[];eBullets=[];enemies=[];particles=[];powerups=[];
  blocks=[];floatTexts=[];koin=0;blockTimer=120;
  waveCd=600;waveNo=0;waveQueue=0;waveTimer=0;trickleCd=900;boss=null;detikMain=0;
  bossPhase='idle';bossTimer=0;bossNextFrame=0;bossSeen=0;bossNo=0;
  spawnTimer=0;difficulty=0;camX=0;
  player={x:80,y:GROUND_Y-62,w:30,h:62,vx:0,vy:0,dir:1,onGround:true,shootCd:0,invul:0,frame:0};
  document.getElementById('killTxt').textContent='0/40';
  document.getElementById('koinTxt').textContent='0';
  document.getElementById('scoreTxt').textContent='00000';
}

const heroImg = new Image();
let heroImgOk = false;
heroImg.onload = () => { heroImgOk = true; };
heroImg.onerror = () => { heroImgOk = false; };
heroImg.src = 'hero-alwi.png';

const bossImg = new Image();
let bossImgOk = false;
bossImg.onload = () => { bossImgOk = true; };
bossImg.onerror = () => { bossImgOk = false; };
bossImg.src = 'laba.jpg';

function spawnEnemy(forceType){
  const y = GROUND_Y-36;
  const r=Math.random();
  const type = (forceType!==undefined) ? forceType : (r<0.3?0 : r<0.5?1 : r<0.65?2 : r<0.8?3 : r<0.93?4 : 0);
  const e={x:camX+W+40+Math.random()*200,y:y,w:26,h:36,vx:-(0.8+Math.random()*1.0+difficulty*0.15),type:type,shootCd:1500+Math.random()*600,alive:true,hp: type?1:2,state:'run',t:0,emoji:'👹'};
  if(type===1){ e.w=32;e.h=38;e.vx=0;e.state='hide';e.hideTime=60;e.emoji='👾'; }
  if(type===2){ e.w=28;e.h=30;e.vy=0;e.vx=0;e.onGround=false;e.hp=1;e.emoji='🥷'; }
  if(type===3){ e.w=30;e.h=32;e.vy=0;e.vx=-(0.8+Math.random()*0.6);e.hp=1;e.emoji='👻';e.baseY=y; }
  if(type===4){ e.w=30;e.h=34;e.vx=-(0.7+Math.random()*0.4);e.hp=4;e.emoji='💀'; }
  if(type===5){ e.w=24;e.h=32;e.vx=-(3.2+Math.random()*1.2);e.hp=1;e.emoji='☠️';e.shootCd=9999; }
  enemies.push(e);
}
function spawnPower(){
  if(powerups.length<2 && Math.random()<0.35){
    powerups.push({x:camX+W+100,y:GROUND_Y-60-Math.random()*120,w:24,h:24,vx:-1.5,t:0});
  }
}
function rectCol(a,b){return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;}
function addExplosion(x,y,scale=1,color='#ff4400'){
  for(let i=0;i<12*scale;i++){
    particles.push({x:x,y:y,vx:(Math.random()-0.5)*8*scale,vy:(Math.random()-0.8)*6*scale,life:20+Math.random()*18,t:0,color: i%3==0?'#ffff00':i%3==1?'#ff4400':'#ff8844',size:2+Math.random()*4*scale});
  }
}
function addMuzzle(x,y,dir){
  for(let i=0;i<4;i++) particles.push({x:x,y:y,vx:dir*(2+Math.random()*4)+ (Math.random()-0.5),vy:(Math.random()-0.5)*2,life:6,t:0,color:'#ffff88',size:2});
}
function updKill(){
  const t=document.getElementById('killTxt');
  t.textContent = boss? 'BOSS!' : (bossNo>0? '🕷️'+bossNo+' • '+kills : kills+'/40');
}

// TEMBAKAN PRAJURIT/MUSUH: jumlah peluru = CFG.soldierVolley (menyebar)
function enemyShoot(e,spd,dx,dy,bw){
  const vol=CFG.soldierVolley;
  for(let k=0;k<vol;k++){
    const off = (vol===1)? (Math.random()-0.5)*0.8 : (k-(vol-1)/2)*1.6;
    eBullets.push({x:e.x+(dx||0),y:e.y+(dy||14)+off,w:bw||8,h:6,vx:-spd,vy:0});
  }
  e.shootCd=CFG.soldierCd+Math.random()*400;
}
// TEMBAKAN BOSS: ganda menyebar, makin banyak boss makin banyak peluru!
function bossShoot(){
  const vol=CFG.bossVolley + Math.min(4,Math.floor(bossNo/3));
  const spd=CFG.bossSpeed;
  const ang=Math.atan2((player.y+boss.h*0.3)-boss.y, (player.x+boss.w/2)-boss.x);
  const spr=vol>1?0.55:0;
  for(let k=0;k<vol;k++){
    const a = vol>1? ang-spr/2 + (k/(vol-1))*spr : ang;
    eBullets.push({x:boss.x+boss.w/2,y:boss.y+boss.h,w:14,h:14, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd});
  }
  boss.shootCd=CFG.bossCd;
}

function update(){
  if(gameState!=='play') return;
  difficulty=kills*0.06;
  camX+=1.0;
  player.frame+=0.2;

  player.vx=0;
  if(keys['a']||keys['arrowleft']) {player.vx=-3.8;player.dir=-1;}
  if(keys['d']||keys['arrowright']) {player.vx=4.6;player.dir=1;}
  player.x+=player.vx;
  if(player.x < camX+10) player.x=camX+10;
  if(player.x > camX+W-120) player.x=camX+W-120;

  if((keys['w']||keys['arrowup']) && player.onGround){player.vy=-14.5;player.onGround=false;}
  player.vy+=0.62; player.y+=player.vy;
  if(player.y+player.h>=GROUND_Y){player.y=GROUND_Y-player.h;player.vy=0;player.onGround=true;}
  if(player.invul>0) player.invul--;
  if(rapidTimer>0){rapidTimer--;if(rapidTimer===0) power=100;}

  if(player.shootCd>0) player.shootCd--;
  if(keys[' '] && player.shootCd<=0){
    const sp= rapidTimer>0?6:14;
    player.shootCd=sp;
    let bx=player.x+(player.dir>0?player.w-2:2), by=player.y+player.h*0.45;
    let bvx=player.dir*8.5, bvy=0;
    if(boss && boss.alive && bossPhase==='active'){
      const dx=boss.x+boss.w/2-(bx+6), dy=boss.y+boss.h/2-(by+2);
      const d=Math.max(1,Math.hypot(dx,dy));
      bvx=dx/d*10; bvy=dy/d*10;
    }
    bullets.push({x:bx,y:by,w:12,h:4,vx:bvx,vy:bvy,dir:player.dir,home:!(bvy===0)});
    addMuzzle(player.x+(player.dir>0?player.w:0),by,Math.sign(bvx)||1);
  }

  waveCd--;
  if(waveCd<=0 && !boss){
    waveCd=1800; waveNo++; waveQueue=3+waveNo; if(waveQueue>12)waveQueue=12;
    waveTimer=0;
    floatTexts.push({x:camX+W/2,y:120,txt:'🌊 GELOMBANG '+waveNo+'! 🌊',t:0});
  }
  if(waveQueue>0){
    waveTimer--;
    if(waveTimer<=0){ waveTimer=48; waveQueue--; spawnEnemy(); }
  }
  trickleCd--;
  if(trickleCd<=0 && !boss){ trickleCd=1800; spawnEnemy(); }
  if(Math.random()<0.008) spawnPower();

  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i]; b.x+=b.vx; b.y+=b.vy||0;
    if(b.home && boss && boss.alive && bossPhase==='active'){
      const dx=boss.x+boss.w/2-b.x, dy=boss.y+boss.h/2-b.y;
      const d=Math.max(1,Math.hypot(dx,dy));
      b.vx=dx/d*10; b.vy=dy/d*10;
    }
    if(b.x>camX+W+30 || b.x<camX-30 || b.y<-40){bullets.splice(i,1);continue;}
    for(let j=enemies.length-1;j>=0;j--){
      const e=enemies[j];
      if(!e.alive) continue;
      if(rectCol(b,e)){
        e.hp--; bullets.splice(i,1);
        if(e.hp<=0){e.alive=false; kills++; score+=100; addExplosion(e.x+e.w/2,e.y+e.h/2,1.4);
          if(Math.random()<0.06) powerups.push({x:e.x,y:e.y,w:24,h:24,vx:-1,t:0,kind:'H'});
          updKill();
          document.getElementById('scoreTxt').textContent=('00000'+score).slice(-5);
        } else {addExplosion(b.x,b.y,0.4,'#ffff00');}
        break;
      }
    }
    if(bullets[i] && boss && boss.alive && rectCol(bullets[i],boss)){
      boss.hp--; bullets.splice(i,1);
      addExplosion(b.x,b.y,0.6,'#ff00ff');
      if(boss.hp<=0){
        boss.alive=false; score+=2000; bossNo++;
        addExplosion(boss.x+boss.w/2,boss.y+boss.h/2,3);
        document.getElementById('scoreTxt').textContent=('00000'+score).slice(-5);
        floatTexts.push({x:camX+W/2,y:150,txt:'🕷️ BOSS '+bossNo+' TUMBANG! 🕷️',t:0});
        boss=null; bossPhase='idle'; bossTimer=0; bossNextFrame=1200;
        updKill();
      }
    }
  }

  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i];
    if(!e.alive){ if(e.t++>30) enemies.splice(i,1); continue;}
    e.t++;
    if(e.type===0){ // runner
      e.x+=e.vx; e.shootCd--;
      if(e.shootCd<=0){ enemyShoot(e,5); }
      if(e.x<camX-60) enemies.splice(i,1);
    } else if(e.type===2){ // jumper
      e.vy+=0.62; e.y+=e.vy;
      e.x+= (player.x>e.x?1.4:-1.4);
      if(e.y+e.h>=GROUND_Y){e.y=GROUND_Y-e.h; e.vy=-10.5; e.x+=(player.x>e.x?14:-14);}
      if(e.x<camX-60) enemies.splice(i,1);
    } else if(e.type===3){ // hantu
      e.x+=e.vx; e.t+=0.06; e.y=e.baseY+Math.sin(e.t)*36;
      e.shootCd--;
      if(e.shootCd<=0 && e.x>camX && e.x<camX+W){ enemyShoot(e,4); }
      if(e.x<camX-60) enemies.splice(i,1);
    } else if(e.type===4){ // tengkorak
      e.x+=e.vx; e.shootCd--;
      if(e.shootCd<=0 && e.x>camX && e.x<camX+W){ enemyShoot(e,3.5); }
      if(e.x<camX-60) enemies.splice(i,1);
    } else if(e.type===5){ // pasukan frenzy
      e.x+=e.vx;
      if(e.x<camX-60) enemies.splice(i,1);
    } else { // cover
      if(e.state==='hide'){e.hideTime--; if(e.hideTime<=0){e.state='shoot'; e.shootCd=10;}}
      else {e.shootCd--; if(e.shootCd<=0){ enemyShoot(e,4.5,-6,16,9); if(e.t>140){e.state='hide'; e.hideTime=80; e.t=0;}}}
    }
    if(e.alive && rectCol(player,e) && player.invul===0){hitPlayer();}
  }

  for(let i=eBullets.length-1;i>=0;i--){
    const b=eBullets[i]; b.x+=b.vx; b.y+=b.vy||0;
    if(b.x<camX-40 || b.x>camX+W+40){eBullets.splice(i,1);continue;}
    if(rectCol(b,{x:player.x+4,y:player.y+4,w:player.w-8,h:player.h-8}) && player.invul===0){
      eBullets.splice(i,1); hitPlayer(); addExplosion(player.x+player.w/2,player.y+player.h/2,0.6);
    }
  }

  for(let i=powerups.length-1;i>=0;i--){
    const p=powerups[i]; p.x+=p.vx; p.t+=0.15;
    if(rectCol(player,p)){
      powerups.splice(i,1);
      if(p.kind==='H'){ // HATI
        if(lives<5){ lives++; document.getElementById('hearts').textContent='♥'.repeat(lives); }
        floatTexts.push({x:p.x,y:p.y-10,txt:'❤️+1'});
        score+=50; addExplosion(p.x,p.y,0.8,'#ff2244');
      } else { rapidTimer=600; power=160; score+=50; addExplosion(p.x,p.y,0.8,'#aa44ff'); }
      continue;
    }
    if(p.x<camX-60) powerups.splice(i,1);
  }

  blockTimer--;
  if(blockTimer<=0){blockTimer=260+Math.random()*200; blocks.push({x:camX+W+60+Math.random()*160,y:GROUND_Y-170,w:34,h:34,used:false});}
  for(let i=blocks.length-1;i>=0;i--){
    const bl=blocks[i];
    if(bl.x<camX-80){blocks.splice(i,1);continue;}
    if(!bl.used && player.vy<0 && player.y<=bl.y+bl.h && player.y+player.h>bl.y+bl.h &&
       player.x+player.w>bl.x+6 && player.x<bl.x+bl.w-6){
      bl.used=true; player.vy=2;
      if(Math.random()<0.25){
        const et=[0,2,3][Math.floor(Math.random()*3)];
        const me={x:bl.x,y:bl.y-34,w:26,h:32,vx:-1.5,type:et,shootCd:80,alive:true,hp:1,state:'run',t:0,vy:0,
          emoji:et===0?'👹':et===2?'🥷':'👻',baseY:bl.y-34};
        enemies.push(me);
        floatTexts.push({x:bl.x+bl.w/2,y:bl.y-10,txt:'AWAS!'});
        addExplosion(bl.x+bl.w/2,bl.y,0.7,'#ff2244');
      } else {
        koin++; score+=200;
        if(koin%12===0 && lives<5){
          lives++;
          document.getElementById('hearts').textContent='♥'.repeat(lives);
          floatTexts.push({x:bl.x+bl.w/2,y:bl.y-34,txt:'❤️ NYAWA+1'});
        }
        floatTexts.push({x:bl.x+bl.w/2,y:bl.y-10,txt:'+200'});
        addExplosion(bl.x+bl.w/2,bl.y,0.7,'#ffd700');
        document.getElementById('koinTxt').textContent=koin;
        document.getElementById('scoreTxt').textContent=('00000'+score).slice(-5);
      }
    }
  }
  for(let i=floatTexts.length-1;i>=0;i--){const ft=floatTexts[i]; ft.y-=1.2; ft.t++; if(ft.t>50) floatTexts.splice(i,1);}

  for(let i=particles.length-1;i>=0;i--){const pr=particles[i]; pr.x+=pr.vx; pr.y+=pr.vy; pr.vy+=0.16; pr.t++; if(pr.t>=pr.life) particles.splice(i,1);}

  if(power>0 && rapidTimer===0) power=Math.max(0,power-0.08);
  document.getElementById('pFill').style.width=Math.min(100, (rapidTimer>0?100:power))+'%';
  document.getElementById('pFill').style.background= rapidTimer>0?'#ffff00':'#00ffff';

  if(lives<=0){gameOver(false);}
  if(bossPhase==='idle'){
    if(!bossSeen && kills>=40){ spawnBoss(); }
    else if(bossSeen && bossNextFrame>0){ bossNextFrame--; if(bossNextFrame<=0) spawnBoss(); }
  } else if(bossPhase==='active'){
    bossTimer++;
    if(bossTimer>=3600){ // 60 detik
      bossPhase='retreat'; bossTimer=0;
      floatTexts.push({x:camX+W/2,y:200,txt:'🕷️ BOSS KABUR! 🕷️',t:0});
      updKill();
    } else {
      updateBoss();
    }
  } else if(bossPhase==='retreat'){
    updateBossRetreat();
  }
  detikMain+=1/60;
  const mm=Math.floor(detikMain/60), ss=Math.floor(detikMain%60);
  const labelW=mm+':'+String(ss).padStart(2,'0');
  const elW=document.getElementById('timeTxt');
  if(elW.textContent!==labelW)elW.textContent=labelW;
  if(detikMain>=CFG.durSec) gameOver(true);
}
function hitPlayer(){lives--; player.invul=90; document.getElementById('hearts').textContent='♥'.repeat(Math.max(0,lives)); if(lives<=0) return; addExplosion(player.x+10,player.y+10,0.5);}

function spawnBoss(){
  const bp=24+bossNo*6;
  boss={x:camX+W-240,y:110,w:180,h:130,hp:bp,maxhp:bp,alive:true,t:0,shootCd:CFG.bossCd};
  bossPhase='active';bossTimer=0;bossSeen=1;
  floatTexts.push({x:camX+W/2,y:200,txt:bossNo>0?'🕷️ BOSS '+bossNo+' BARU! 🕷️':'🕷️ BOSS LABA-LABA! 🕷️',t:0});
  document.getElementById('killTxt').textContent='BOSS!';
}
function updateBossRetreat(){
  if(!boss){bossPhase='idle';bossNextFrame=25200;return;}
  boss.x+=7; boss.y-=4;
  if(boss.x-camX>W+320){ boss=null; bossPhase='idle'; bossNextFrame=25200; }
}
function updateBoss(){
  if(!boss.alive) return;
  boss.t++;
  const cx=camX+W/2+Math.sin(boss.t*0.02)*(W/2-150);
  boss.x+=(Math.max(camX+20,Math.min(camX+W-190,cx))-boss.x)*0.03;
  boss.y=100+Math.sin(boss.t*0.03)*30;
  boss.shootCd--;
  if(boss.shootCd<=0){ bossShoot(); }
  if(rectCol(player,boss) && player.invul===0){hitPlayer();}
}
function drawBoss(){
  if(!boss || !boss.alive) return;
  const x=boss.x-camX, y=boss.y;
  ctx.fillStyle='#500'; ctx.fillRect(x,y-16,boss.w,10);
  ctx.fillStyle='#f0f'; ctx.fillRect(x,y-16,boss.w*(boss.hp/boss.maxhp),10);
  if(bossImgOk){
    try{ ctx.drawImage(bossImg,x,y,boss.w,boss.h); }catch(e){ bossImgOk=false; }
  }
  if(!bossImgOk){
    ctx.strokeStyle='#3a0a4a'; ctx.lineWidth=6;
    for(let k=0;k<4;k++){
      const yy=y+20+k*22;
      ctx.beginPath();ctx.moveTo(x+boss.w/2-20,yy);ctx.lineTo(x-24,yy-14+k*8);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x+boss.w/2+20,yy);ctx.lineTo(x+boss.w+24,yy-14+k*8);ctx.stroke();
    }
    ctx.fillStyle='#5a1a7a';
    ctx.beginPath();ctx.ellipse(x+boss.w/2,y+boss.h/2,60,44,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#7a2a9a';
    ctx.beginPath();ctx.ellipse(x+boss.w/2,y+18,30,24,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f00';
    for(let e2=0;e2<4;e2++){ctx.beginPath();ctx.arc(x+boss.w/2-18+e2*12,y+12,4,0,Math.PI*2);ctx.fill();}
  }
  ctx.font='44px serif';ctx.textAlign='center';ctx.fillText('🕷️',x+boss.w/2,y-26);
}

function drawBackground(){
  ctx.fillStyle='#5bc8ff'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,0.9)';
  for(let i=0;i<3;i++){let cx=(i*340 - camX*0.2%700); cx=((cx%900)+900)%900; ctx.beginPath(); ctx.arc(cx+80,60+i*18,18,0,Math.PI*2); ctx.arc(cx+100,58+i*18,24,0,Math.PI*2); ctx.arc(cx+125,62+i*18,18,0,Math.PI*2); ctx.fill();}
  const baseX = - (camX*0.5 % 128);
  for(let x=baseX-128;x<W+128;x+=128){
    ctx.fillStyle='#c55b2a'; ctx.fillRect(x, H-220, 110, 120);
    ctx.fillStyle='#8a3d1a'; for(let by=0;by<6;by++) for(let bx=0;bx<4;bx++){ctx.fillRect(x+6+bx*26, H-215+by*18, 20,8);}
    ctx.fillStyle='#a33'; for(let k=0;k<3;k++) ctx.fillRect(x+18+k*28, H-215, 10,10);
  }
  for(let x= - (camX*0.85 % 200)-50; x<W+200; x+=200){
    ctx.fillStyle='#9aa0a8'; ctx.fillRect(x, H-200, 140, 110);
    ctx.fillStyle='#6e7680'; ctx.fillRect(x, H-200, 140, 16);
    ctx.fillStyle='#222'; ctx.fillRect(x+52, H-125, 26, 35);
    ctx.fillStyle='#3a4250'; ctx.fillRect(x+98, H-170, 22, 22); ctx.fillStyle='#000'; ctx.fillRect(x+102, H-166,5,12);
  }
  ctx.fillStyle='#8a8e96'; let tx= 800- (camX*1%900);
  for(let rep=-1;rep<3;rep++){let ax=tx+rep*360; ctx.fillRect(ax, H-260, 22,160); for(let yy=0;yy<8;yy++){ctx.fillRect(ax-6, H-250+yy*20,34,4);} }
  ctx.fillStyle='#7a7a7a'; ctx.fillRect(0,GROUND_Y,W,64);
  ctx.fillStyle='#6a6a6a'; for(let gx= -(camX%32);gx<W;gx+=32) ctx.fillRect(gx,GROUND_Y,16,4);
}

function drawPlayer(){
  const x=player.x-camX, y=player.y;
  if(player.invul%6<3||true){
  ctx.save();
  if(player.dir<0){ctx.scale(-1,1); ctx.translate(-x*2 -player.w,0);}
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(x+4,GROUND_Y-4,player.w,6);
  let pakaiFoto=false;
  if(heroImgOk){ try{ ctx.drawImage(heroImg,x-4,y-6,player.w+8,player.h+6); pakaiFoto=true; }catch(e){ heroImgOk=false; } }
  if(pakaiFoto){ ctx.restore(); return; }
  const k=player.h/44;
  ctx.fillStyle='#1e3a5a'; ctx.fillRect(x+4*k,y+28*k,10*k,16*k); ctx.fillRect(x+14*k,y+28*k,10*k,16*k);
  ctx.fillStyle='#4a2d0a'; ctx.fillRect(x+2*k,y+40*k,12*k,6*k); ctx.fillRect(x+14*k,y+40*k,12*k,6*k);
  ctx.fillStyle='#f3c08a'; ctx.fillRect(x+4*k,y+12*k,20*k,18*k);
  ctx.fillStyle='#e7a76a'; ctx.fillRect(x+6*k,y+14*k,8*k,5*k); ctx.fillRect(x+14*k,y+14*k,8*k,5*k);
  ctx.fillStyle='#000'; ctx.fillRect(x+4*k,y+12*k,20*k,2*k);
  ctx.fillStyle='#f3c08a';
  let armX = player.dir>0? x+18*k : x+2*k;
  ctx.fillRect(armX,y+12*k,16*k,8*k);
  ctx.fillRect(x+2*k,y+10*k,8*k,16*k);
  ctx.fillStyle='#e7c28a'; ctx.fillRect(x+8*k,y+0,16*k,16*k);
  ctx.fillStyle='#ff2222'; ctx.fillRect(x+4*k,y+6*k,22*k,5*k);
  ctx.fillStyle='#ff2222'; ctx.fillRect(x-2*k,y+8*k,8*k,3*k);
  ctx.fillStyle='#4b2a0a'; ctx.fillRect(x+8*k,y+2*k,14*k,4*k);
  ctx.fillStyle='#000'; ctx.fillRect(x+18*k,y+10*k,2*k,2*k);
  ctx.fillStyle='#7a4a22'; ctx.fillRect(x+20*k,y+12*k,4*k,2*k);
  ctx.fillStyle='#3a3a44'; ctx.fillRect(x+16*k,y+18*k,28*k,6*k);
  ctx.fillStyle='#6aaaff'; ctx.fillRect(x+24*k,y+19*k,14*k,3*k);
  ctx.fillStyle='#222'; ctx.fillRect(x+38*k,y+16*k,12*k,10*k);
  ctx.fillStyle='#ffff66'; if(Math.random()<0.3 && keys[' ']){ctx.fillRect(x+48*k,y+18*k,10*k,4*k);}
  ctx.restore();
  }
}

function drawBlocks(){
  for(let bl of blocks){
    const x=bl.x-camX, y=bl.y;
    if(x<-40||x>W+40) continue;
    ctx.fillStyle= bl.used?'#7a5a2a':'#f4b400';
    ctx.fillRect(x,y,bl.w,bl.h);
    ctx.fillStyle= bl.used?'#4a3515':'#fff2a0';
    ctx.fillRect(x+3,y+3,bl.w-6,4);
    if(!bl.used){
      ctx.fillStyle='#7a4d00'; ctx.font='bold 20px "Press Start 2P",monospace';
      ctx.textAlign='center'; ctx.fillText('?',x+bl.w/2,y+25);
    }
  }
  ctx.fillStyle='#ffd700'; ctx.font='bold 13px "Press Start 2P",monospace'; ctx.textAlign='center';
  for(let ft of floatTexts){const x=ft.x-camX; ctx.fillText(ft.txt, x, ft.y);}
}

function drawEnemies(){
  for(let e of enemies){
    if(!e.alive) continue;
    const x=e.x-camX, y=e.y;
    if(e.type===2){ // kodok ungu pelompat
      ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(x+2,GROUND_Y-4,e.w,5);
      ctx.fillStyle='#8a2be2'; ctx.fillRect(x,y+8,e.w,e.h-8);
      ctx.fillStyle='#5a1a9a'; ctx.fillRect(x+2,y+e.h-6,e.w-4,6);
      ctx.fillStyle='#fff'; ctx.fillRect(x+4,y,10,10); ctx.fillRect(x+e.w-14,y,10,10);
      ctx.fillStyle='#000'; ctx.fillRect(x+7,y+3,4,4); ctx.fillRect(x+e.w-11,y+3,4,4);
      const hop = e.vy<0? -4:0;
      ctx.fillStyle='#5a1a9a'; ctx.fillRect(x-2,y+e.h-2+hop,8,4); ctx.fillRect(x+e.w-6,y+e.h-2+hop,8,4);
      ctx.font='20px serif';ctx.textAlign='center';ctx.fillText('🥷',x+e.w/2,y+22);
      continue;
    }
    ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(x+2,GROUND_Y-4,e.w,5);
    ctx.fillStyle='#3a782a'; ctx.fillRect(x,y,e.w,e.h-12);
    ctx.fillStyle='#2d5f22'; ctx.fillRect(x+2,y+e.h-12,e.w-4,12);
    ctx.fillStyle='#6ab24b'; ctx.fillRect(x+4,y+2,e.w-8,6);
    ctx.fillStyle='#3b2a1a'; ctx.fillRect(x+2,y+e.h-6,e.w-4,6);
    ctx.fillStyle='#2f6a24'; ctx.fillRect(x+4,y-6, e.w-8,8);
    ctx.fillStyle='#000'; ctx.fillRect(x+10,y-2,2,2);
    if(e.type===1 && e.state==='hide'){ctx.fillStyle='#9aa0a8'; ctx.fillRect(x-6,y-10,e.w+12,e.h+6); ctx.fillStyle='#000'; ctx.fillRect(x+2,y-4,8,2);}
    else{
      ctx.fillStyle='#222'; ctx.fillRect(x-12,y+10,12,4);
      if(e.shootCd<10){ctx.fillStyle='#ffff00'; ctx.fillRect(x-16,y+10,6,4);}
    }
    if(e.emoji){ctx.font='20px serif';ctx.textAlign='center';ctx.fillText(e.emoji,x+e.w/2,y+22);}
  }
}

function drawBullets(){
  ctx.fillStyle='#00ffff';
  for(let b of bullets){const x=b.x-camX; ctx.fillStyle='#e0ffff'; ctx.fillRect(x,b.y,b.w,b.h); ctx.fillStyle='#00ddff'; ctx.fillRect(x+6,b.y+1,6,2);}
  for(let b of eBullets){const x=b.x-camX; ctx.fillStyle='#ffff00'; ctx.beginPath(); ctx.arc(x+b.w/2,b.y+3,4.5,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#ff8800'; ctx.fillRect(x,b.y+1,4,4);}
}

function drawPowerups(){
  for(let p of powerups){const x=p.x-camX, y=p.y + Math.sin(p.t)*4;
    if(p.kind==='H'){
      ctx.fillStyle='#e23434'; ctx.fillRect(x,y,p.w,p.h);
      ctx.fillStyle='#fff'; ctx.font='bold 16px monospace'; ctx.fillText('❤️',x+3,y+18);
      continue;
    }
    ctx.fillStyle='#8a2be2'; ctx.fillRect(x,y,p.w,p.h); ctx.fillStyle='#000'; ctx.fillRect(x,y,p.w,p.h); ctx.fillStyle='#8a2be2'; ctx.fillRect(x+2,y+2,p.w-4,p.h-4);
    ctx.fillStyle='#ffff00'; ctx.font='bold 16px Press Start 2P'; ctx.fillText('F',x+6,y+17);
    ctx.fillStyle='rgba(255,255,255,.8)'; ctx.fillRect(x+2,y+2,6,6);
  }
}
function drawParticles(){
  for(let pr of particles){const x=pr.x-camX; ctx.fillStyle=pr.color; ctx.globalAlpha=1-pr.t/pr.life; ctx.fillRect(x,y=pr.y-pr.t*0.1,pr.size,pr.size); }
  ctx.globalAlpha=1;
}
function loop(){
  requestAnimationFrame(loop);
  update();
  drawBackground(); drawBlocks(); drawPowerups(); drawEnemies(); drawBoss(); drawBullets(); drawPlayer(); drawParticles();
}

function gameOver(win){
  gameState='over';
  const ov=document.getElementById('overlay');
  ov.style.display='flex';
  ov.innerHTML= win ? `<h1 style="color:#00ff88">MISI 25 MENIT<br>SELESAI!</h1><p>Kamu bertahan 25 menit & mengalahkan <b>${bossNo} BOSS LABA-LABA 🕷️</b>!<br>Kill: ${kills} • Skor: ${score} • Koin: ${koin}<br><br><span style="color:#ffff00">${CFG.title} CLEARED</span></p><button id="startBtn" onclick="location.reload()">▶ MAIN LAGI</button>`
  : `<h1 style="color:#ff2244">GAME OVER<br>ALWI GUGUR</h1><p>Kill: ${kills}/40<br>Skor: ${score}<br><br>Coba lagi, prajurit!</p><button id="startBtn" onclick="location.reload()">↻ COBA LAGI</button>`;
}

window.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase(); keys[k]=true;
  if(k===' ' ) e.preventDefault();
});
window.addEventListener('keyup',e=> keys[e.key.toLowerCase()]=false);
document.getElementById('startBtn').addEventListener('click',()=>{ document.getElementById('overlay').style.display='none'; gameState='play'; resetGame(); });
document.querySelectorAll('.btn').forEach(b=>{ const kk=b.dataset.k; b.addEventListener('touchstart',ev=>{ev.preventDefault(); keys[kk==='left'?'a':kk==='right'?'d':kk==='up'?'w':' ']=true}); b.addEventListener('touchend',ev=>{keys[kk==='left'?'a':kk==='right'?'d':kk==='up'?'w':' ']=false}); b.addEventListener('mousedown',()=>keys[kk==='left'?'a':kk==='right'?'d':kk==='up'?'w':' ']=true); b.addEventListener('mouseup',()=>keys[kk==='left'?'a':kk==='right'?'d':kk==='up'?'w':' ']=false); });
document.querySelectorAll('.tBtn').forEach(b=>{ const map={left:'a',right:'d',up:'w',fire:' '}; const kk=map[b.dataset.t]; b.addEventListener('touchstart',ev=>{ev.preventDefault(); keys[kk]=true; b.classList.add('active')}); b.addEventListener('touchend',ev=>{keys[kk]=false; b.classList.remove('active')}); });

resetGame();
loop();