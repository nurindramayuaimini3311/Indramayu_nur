let q=0,ok=0;const KL=21.4225,KLN=39.8262;
function cq(l,g){return(Math.atan2(Math.sin((KLN-g)*Math.PI/180),Math.cos(l*Math.PI/180)*Math.tan(KL*Math.PI/180)-Math.sin(l*Math.PI/180)*Math.cos((KLN-g)*Math.PI/180))*180/Math.PI+360)%360}
function si(l,g){q=cq(l,g);$('info').textContent='Kiblat: '+q.toFixed(1)+'°'}
navigator.geolocation.getCurrentPosition(p=>si(p.coords.latitude,p.coords.longitude),()=>si(-6.2,106.8),{timeout:10000});
function rc(){if(DeviceOrientationEvent.requestPermission){DeviceOrientationEvent.requestPermission().then(s=>s==='granted'&&sc())}else sc()}
function sc(){status('Kompas aktif');window.addEventListener('deviceorientationabsolute',ho,1);window.addEventListener('deviceorientation',ho,1)}
function ho(e){ok=1;let h=null;if(typeof e.webkitCompassHeading=='number')h=e.webkitCompassHeading;else if(typeof e.alpha=='number')h=360-e.alpha;if(h==null)return;h=(h+360)%360;$('r').style.transform='rotate('+(-h)+'deg)';$('a').style.transform='translate(-50%,-100%) rotate('+(q-h)+'deg)';status(Math.abs(((q-h+540)%360)-180)<5?'🎯 Kiblat!':'Putar ke panah')}
