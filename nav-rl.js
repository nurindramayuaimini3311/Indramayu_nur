// NAVIGASI KIRI KANAN - ALWI PUSAT
(function(){
const PAGES = [
  "/", "/setting/", "/alwiSD/", "/fiturBARU/", "/game/",
  "/kamera-hantu/", "/konten/", "/kuis/", "/netflix/", "/pencuri/", "/peta/", "/peta/peta-cod.html"
];
function getIdx(){
  let p = location.pathname;
  let i = PAGES.findIndex(x => p === x || p === x.replace(/\/$/,'') || p+'.html' === x || p === x+'.html');
  if(i===-1) i = PAGES.findIndex(x => p.includes(x.replace(/\//g,'')));
  return i<0?0:i;
}
let style = document.createElement('style');
style.innerHTML = `
#alwi-rl{position:fixed;bottom:20px;left:0;right:0;display:flex;justify-content:space-between;pointer-events:none;z-index:999999;padding:0 12px}
#alwi-rl a{pointer-events:auto;width:52px;height:52px;background:#FFD700;color:#000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;text-decoration:none;box-shadow:0 4px 15px rgba(255,215,0,.6);border:2px solid #000}
#alwi-rl a:active{transform:scale(.9)}
#alwi-rl a.disabled{opacity:.3;pointer-events:none}
`;
document.head.appendChild(style);
let nav = document.createElement('div');
nav.id='alwi-rl';
let idx = getIdx();
let prev = PAGES[(idx-1+PAGES.length)%PAGES.length];
let next = PAGES[(idx+1)%PAGES.length];
nav.innerHTML = `<a href="${prev}" id="rl-prev">←</a><a href="${next}" id="rl-next">→</a>`;
document.body.appendChild(nav);
// swipe
let sx=0;
document.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
document.addEventListener('touchend',e=>{
  let dx = e.changedTouches[0].clientX - sx;
  if(Math.abs(dx)>80){ if(dx>0) location.href=prev; else location.href=next; }
},{passive:true});
document.addEventListener('keydown',e=>{ if(e.key==='ArrowLeft') location.href=prev; if(e.key==='ArrowRight') location.href=next; });
})();
