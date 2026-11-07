import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
const lite=innerWidth<900,cv=document.getElementById('bg');
const R=new THREE.WebGLRenderer({canvas:cv,antialias:!lite,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,lite?1.25:1.5));R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.95;
const S=new THREE.Scene();S.environment=new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(),.04).texture;
const tex=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t};
const rr=(x,a,b,w,h,r)=>{x.beginPath();x.roundRect(a,b,w,h,r);x.fill()};
S.background=tex(4,1024,(g)=>{const q=g.createLinearGradient(0,0,0,1024);q.addColorStop(0,'#0f0828');q.addColorStop(.45,'#2a1560');q.addColorStop(.8,'#44278a');q.addColorStop(1,'#6a46b8');g.fillStyle=q;g.fillRect(0,0,4,1024)});
S.fog=new THREE.FogExp2(0x2a1560,.03);
const C=new THREE.PerspectiveCamera(45,1,.1,80);S.add(C);
const L1=new THREE.DirectionalLight(0xe6d6ff,2.2);L1.position.set(3,5,4);const L2=new THREE.DirectionalLight(0xff9ee0,1.6);L2.position.set(-5,-2,3);S.add(L1,L2);
const PAL=[0xc4a8ff,0xff9ee0,0x9fb8ff,0xffffff,0xffd2a8,0xa6f0e0].map(c=>new THREE.Color(c));
const mat=(o={})=>lite?new THREE.MeshStandardMaterial({color:0xffffff,metalness:.25,roughness:.2,envMapIntensity:1.5,...(({iridescence,...r})=>r)(o)}):new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:.2,roughness:.15,clearcoat:1,clearcoatRoughness:.06,iridescence:.6,iridescenceIOR:1.5,iridescenceThicknessRange:[150,700],envMapIntensity:1.5,...o});
const neon=(c=0xffffff)=>new THREE.MeshBasicMaterial({color:c,toneMapped:false,fog:false});
const rnd=(a,b)=>a+Math.random()*(b-a),add=(G,m,x=0,y=0,z=0)=>{m.position.set(x,y,z);G.add(m);return m};
const glowT=tex(128,128,(g)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128)});
const halo=(c,s,o=.8)=>{const p=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));p.scale.setScalar(s);return p};
// ---- geometry ----
const bubG=(()=>{const w=2.4,h=1.5,r=.5,P=Math.PI,s=new THREE.Shape();s.moveTo(-w/2+.7,-h/2);s.lineTo(w/2-r,-h/2);s.absarc(w/2-r,-h/2+r,r,-P/2,0);s.lineTo(w/2,h/2-r);s.absarc(w/2-r,h/2-r,r,0,P/2);s.lineTo(-w/2+r,h/2);s.absarc(-w/2+r,h/2-r,r,P/2,P);s.lineTo(-w/2,-h/2+.1);s.lineTo(-w/2-.15,-h/2-.45);s.lineTo(-w/2+.7,-h/2);
 const g=new THREE.ExtrudeGeometry(s,{depth:.4,bevelEnabled:true,bevelThickness:.12,bevelSize:.12,bevelSegments:4,curveSegments:16});g.center();return g})();
const boltG=(()=>{const s=new THREE.Shape();s.moveTo(.1,.65);s.lineTo(-.3,-.05);s.lineTo(-.02,-.05);s.lineTo(-.12,-.65);s.lineTo(.32,.1);s.lineTo(.04,.1);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.1,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2});g.center();return g})();
const coinG=new THREE.CylinderGeometry(.5,.5,.1,40);coinG.rotateX(Math.PI/2);
const crysG=new THREE.OctahedronGeometry(.4);crysG.scale(.8,1.5,.8);
const headG=new RoundedBoxGeometry(1.7,1.4,1.3,4,.38),faceG=new RoundedBoxGeometry(1.36,.96,.1,3,.3),bodyG=new RoundedBoxGeometry(1,.8,.8,3,.25),
 eyeG=new THREE.CapsuleGeometry(.09,.2,3,10),smileG=new THREE.TorusGeometry(.2,.035,6,20,Math.PI),antG=new THREE.CylinderGeometry(.04,.04,.45,8),tipG=new THREE.SphereGeometry(.13,14,14),earG=new THREE.CylinderGeometry(.24,.24,.2,16),
 armG=new THREE.CapsuleGeometry(.09,.4,3,8),handG=new THREE.SphereGeometry(.13,12,12),ledG=new THREE.SphereGeometry(.05,8,8),cheekG=new THREE.CircleGeometry(.09,14),faceE=new THREE.EdgesGeometry(faceG,25);
// ---- textures (details painted on the surfaces) ----
const bubbleT=tex(512,320,(x,w,h)=>{x.fillStyle='rgba(40,20,90,.55)';x.beginPath();x.arc(95,110,46,0,6.3);x.fill();rr(x,170,66,300,34,17);x.fillStyle='rgba(40,20,90,.42)';rr(x,170,124,240,34,17);x.fillStyle='rgba(40,20,90,.3)';rr(x,170,182,170,34,17);x.fillStyle='#5b3fd0';x.font='700 66px sans-serif';x.textAlign='right';x.fillText('✓✓',w-44,h-36)});
const coinT=tex(256,256,(x)=>{x.translate(128,128);x.strokeStyle='#8a5a10';x.lineWidth=7;x.beginPath();x.arc(0,0,118,0,6.3);x.stroke();x.lineWidth=3;x.beginPath();x.arc(0,0,98,0,6.3);x.stroke();x.fillStyle='#8a5a10';for(let i=0;i<24;i++){x.save();x.rotate(i/24*6.283);x.fillRect(-3,-114,6,10);x.restore()}x.fillStyle='#7a4d08';x.font='900 150px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('V',0,10)});
const phoneT=tex(256,512,(x,w,h)=>{const q=x.createLinearGradient(0,0,0,h);q.addColorStop(0,'#7a5cff');q.addColorStop(1,'#ff9ee0');x.fillStyle=q;rr(x,0,0,w,h,30);x.fillStyle='rgba(255,255,255,.28)';rr(x,0,0,w,60,0);x.fillStyle='rgba(255,255,255,.92)';rr(x,22,92,150,46,23);rr(x,22,222,120,46,23);x.fillStyle='rgba(255,255,255,.5)';rr(x,86,157,148,46,23);rr(x,110,287,124,46,23);x.fillStyle='rgba(255,255,255,.35)';rr(x,20,h-78,w-40,46,23)});
const pill=(txt,col)=>{const p=new THREE.Sprite(new THREE.SpriteMaterial({map:tex(420,110,(x,w,h)=>{x.fillStyle='rgba(30,14,70,.78)';rr(x,4,4,w-8,h-8,50);x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=3;x.beginPath();x.roundRect(4,4,w-8,h-8,50);x.stroke();x.fillStyle=col;x.beginPath();x.arc(52,h/2,13,0,6.3);x.fill();x.fillStyle='#fff';x.font='700 38px sans-serif';x.textBaseline='middle';x.fillText(txt,82,h/2+2)}),transparent:true,fog:false,depthWrite:false}));p.scale.set(1.8,.47,1);return p};
// ---- bot ----
const headM=mat({color:0xc4a8ff,metalness:.3}),bodyM=mat({color:0xb99cff,metalness:.3}),faceM=mat({color:0x120a2e,roughness:.08,metalness:.6}),earM=mat({color:0xff9ee0}),antM=mat({color:0xf0e8ff}),eyeM=neon(0xa6f0ff),tipM=neon(0xffb3d9),edgeM=new THREE.LineBasicMaterial({color:0xb6f5ff,toneMapped:false,fog:false}),cheekM=new THREE.MeshBasicMaterial({color:0xff9ee0,transparent:true,opacity:.8,toneMapped:false});
function bot(full){const W=new THREE.Group(),G=new THREE.Group();W.add(G);G.position.y=full?.5:0;const U=W.userData;
 add(G,new THREE.Mesh(headG,headM));add(G,new THREE.Mesh(faceG,faceM),0,0,.62);add(G,new THREE.LineSegments(faceE,edgeM),0,0,.625);
 U.eyes=[-.33,.33].map(x=>add(G,new THREE.Mesh(eyeG,eyeM),x,.14,.7));add(G,new THREE.Mesh(smileG,eyeM),0,-.08,.7).rotation.z=Math.PI;
 [-.58,.58].forEach(x=>add(G,new THREE.Mesh(cheekG,cheekM),x,-.1,.69));
 add(G,new THREE.Mesh(antG,antM),0,.9,0);add(G,new THREE.Mesh(tipG,tipM),0,1.18,0);if(full)add(G,halo(0xff9ee0,.8),0,1.18,0);
 [-1,1].forEach(s=>add(G,new THREE.Mesh(earG,earM),s*.95,0,0).rotation.z=Math.PI/2);
 if(full){add(G,new THREE.Mesh(bodyG,bodyM),0,-1.2,0);add(G,new THREE.Mesh(new RoundedBoxGeometry(.6,.34,.06,2,.08),faceM),0,-1.15,.41);
  U.leds=[0xff9ee0,0xa6f0ff,0xc4a8ff].map((c,i)=>add(G,new THREE.Mesh(ledG,neon(c)),(i-1)*.15,-1.15,.46));
  U.arms=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.68,-1.0,0);add(p,new THREE.Mesh(armG,earM),s*.1,-.3,0);add(p,new THREE.Mesh(handG,tipM),s*.12,-.62,0);G.add(p);return p});
  add(G,halo(0xb79cff,2.2,.55),0,-1.95,0)}
 return W}
// ---- swarm (instanced + painted decor layers) ----
const curve=new THREE.CatmullRomCurve3(Array.from({length:9},(_,i)=>new THREE.Vector3(Math.sin(i*.8)*2.5,-i*1.3,-i*3.4)));
const NP=400,pts=curve.getSpacedPoints(NP),k=lite?.6:1,D=new THREE.Object3D(),M=new THREE.Matrix4(),swarm=[];
const T4=(z,ry=0,s=1)=>new THREE.Matrix4().makeRotationY(ry).scale(new THREE.Vector3(s,s,s)).setPosition(0,0,z);
function inst(geo,m,n,sc,[a,b]=[.5,1.15],decs=[]){n=Math.round(n*k);const mk=(g,mm,col)=>{const q=new THREE.InstancedMesh(g,mm,n);q.frustumCulled=false;if(col)for(let i=0;i<n;i++)q.setColorAt(i,PAL[i%PAL.length]);S.add(q);return q};
 const mesh=mk(geo,m,1),data=Array.from({length:n},()=>{const an=rnd(0,6.283),r=rnd(2.4,5.6);return{pi:Math.floor(rnd(.03,.97)*NP),ox:Math.cos(an)*r,oy:Math.sin(an)*r*.7,oz:rnd(-1.5,1.5),s:rnd(a,b)*sc,rs:rnd(-.8,.8),ph:rnd(0,6.28)}});
 swarm.push({mesh,data,dec:decs.map(d=>({mesh:mk(d.geo,d.mat,d.col),off:d.off}))})}
const planeM=map=>new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}),bubP=new THREE.PlaneGeometry(1.9,1.2),coinP=new THREE.CircleGeometry(.44,40),ringG=new THREE.TorusGeometry(.5,.04,8,48),ringM=neon();
const rot=(ax,s)=>{const m=new THREE.Matrix4();ax==='x'?m.makeRotationX(Math.PI/2):m.makeRotationY(Math.PI/2);return m.scale(new THREE.Vector3(s,s,s))};
inst(bubG,mat({iridescence:1}),12,.34,[.5,1.15],[{geo:bubP,mat:planeM(bubbleT),off:T4(.328)},{geo:bubP,mat:planeM(bubbleT),off:T4(-.328,Math.PI)}]);
inst(coinG,mat({metalness:.95,roughness:.22,color:0xffc46b}),10,1.1,[.5,1.15],[{geo:coinP,mat:planeM(coinT),off:T4(.053)},{geo:coinP,mat:planeM(coinT),off:T4(-.053,Math.PI)}]);
inst(ringG,ringM,10,1,[.5,1.15],[{geo:ringG,mat:ringM,off:rot('x',.82),col:1},{geo:ringG,mat:ringM,off:rot('y',.66),col:1}]);
inst(new THREE.SphereGeometry(.3,22,22),mat({roughness:0,transparent:true,opacity:.42}),22,1,[.4,1.3],[{geo:new THREE.SphereGeometry(.15,14,14),mat:neon(),off:new THREE.Matrix4(),col:1}]);
inst(crysG,mat({flatShading:true,roughness:.1}),14,1,[.5,1.15],[{geo:crysG,mat:new THREE.MeshBasicMaterial({wireframe:true,color:0xffffff,transparent:true,opacity:.55,fog:false}),off:T4(0,0,1.03)}]);
inst(new RoundedBoxGeometry(.62,1.2,.09,3,.1),mat({color:0x1a0f3a,metalness:.6}),7,.8,[.7,1.1],[{geo:new THREE.PlaneGeometry(.54,1.1),mat:planeM(phoneT),off:T4(.047)}]);
inst(boltG,neon(),8,.8,[.6,1.2]);
const minis=Array.from({length:Math.round(5*k)},()=>{const b=bot(false),a=rnd(0,6.283),r=rnd(2.8,5.6);S.add(b);return{b,pi:Math.floor(rnd(.1,.95)*NP),ox:Math.cos(a)*r,oy:Math.sin(a)*r*.7,oz:rnd(-1,1),ph:rnd(0,6.28)}});
const TXT=[['Online 24/7','#7cf0b0'],['+100 koin','#ffd27a'],['Pairing code','#c4a8ff'],['Terkirim','#a6f0ff'],['OTP 482913','#ff9ee0'],['Bot aktif','#7cf0b0'],['Auto reply','#c4a8ff']].slice(0,lite?5:7);
const tags=TXT.map(([t,c])=>{const s=pill(t,c),a=rnd(0,6.283),r=rnd(3,5.2);S.add(s);return{s,pi:Math.floor(rnd(.05,.95)*NP),ox:Math.cos(a)*r,oy:Math.sin(a)*r*.6,oz:rnd(-1,1),ph:rnd(0,6.28)}});
// ---- atmosphere ----
const glows=[];[0xff9ee0,0xb79cff,0x8fb4ff].forEach((c,j)=>{for(let i=0;i<4;i++){const s=halo(c,rnd(7,11),.13),p=pts[Math.floor((i*.25+j*.08)*NP)];s.position.set(p.x+rnd(-6,6),p.y+rnd(-4,4),p.z-rnd(4,9));s.userData.o=.13;glows.push(s);S.add(s)}});
const dp=[];for(let i=0;i<(lite?260:520);i++){const p=pts[Math.floor(rnd(0,1)*NP)];dp.push(p.x+rnd(-8,8),p.y+rnd(-6,6),p.z+rnd(-6,6))}
const dust=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(dp,3)),new THREE.PointsMaterial({map:glowT,size:.12,color:0xf0e4ff,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));S.add(dust);
// ---- RASI BINTANG: shiny metal stars + sparkle flares + connecting lines ----
const flareT=tex(256,256,(g)=>{const r=g.createRadialGradient(128,128,0,128,128,128);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.07,'rgba(255,255,255,.95)');r.addColorStop(.2,'rgba(230,215,255,.38)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,256,256);
 [[0,3.5,1,1],[Math.PI/2,3.5,1,1],[Math.PI/4,2,.55,.62],[-Math.PI/4,2,.55,.62]].forEach(([a,h,al,len])=>{g.save();g.translate(128,128);g.rotate(a);const L=128*len,l=g.createLinearGradient(-L,0,L,0);l.addColorStop(0,'rgba(255,255,255,0)');l.addColorStop(.5,`rgba(255,255,255,${al})`);l.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=l;g.fillRect(-L,-h/2,L*2,h);g.restore()})});
const CON=[
 {s:[[-1.6,.5],[-1,.7],[-.4,.55],[.1,.2],[0,-.5],[.9,-.45],[.95,.25]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]]},
 {s:[[-.7,1.2],[.7,1.1],[-.3,0],[0,.05],[.3,.1],[-.6,-1.2],[.7,-1.1],[0,1.35]],e:[[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[0,7],[1,7]]},
 {s:[[-1.2,.4],[-.6,-.3],[0,.35],[.6,-.35],[1.2,.4]],e:[[0,1],[1,2],[2,3],[3,4]]},
 {s:[[1.2,1],[.8,.7],[.5,.4],[.2,0],[0,-.5],[-.2,-1],[-.7,-1.3],[-1.2,-1.1],[-1.4,-.6],[.9,1.35],[1.35,.5]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[9,1],[10,1]]},
 {s:[[-1,.6],[-.9,1.1],[-.5,1.4],[-.1,1.2],[0,.7],[.2,.2],[1,.4],[.7,-.4],[.1,-.4]],e:[[0,1],[1,2],[2,3],[3,4],[4,0],[4,5],[5,6],[6,7],[7,8],[8,5]]},
 {s:[[0,1],[0,-1],[-.7,.05],[.7,.1],[.35,-.7]],e:[[0,1],[2,3],[1,4]]}
].map((c,i)=>({...c,pi:Math.floor((.1+i*.14)*NP),ox:(i%2?-1:1)*rnd(3,5.2),oy:rnd(-2.2,2.2),oz:-rnd(3,6),ph:rnd(0,6.28),sc:rnd(1.1,1.5)}));
const nS=CON.reduce((a,c)=>a+c.s.length,0),NE=CON.reduce((a,c)=>a+c.e.length,0);let nSm=0,nBg=0;
CON.forEach(c=>{c.big=new Set([0,Math.floor(c.s.length/2)]);c.s.forEach((_,j)=>c.big.has(j)?nBg++:nSm++)});
const SP=new Float32Array(nS*3),SC=new Float32Array(nS*3),LP=new Float32Array(NE*6);let ia=0,ib=nSm;CON.forEach(c=>{c.gi=c.s.map((_,j)=>c.big.has(j)?ib++:ia++)});
const pA=new THREE.BufferAttribute(SP,3).setUsage(THREE.DynamicDrawUsage),cA=new THREE.BufferAttribute(SC,3).setUsage(THREE.DynamicDrawUsage);
const starPts=(size,from,count)=>{const g=new THREE.BufferGeometry().setAttribute('position',pA).setAttribute('color',cA);g.setDrawRange(from,count);const p=new THREE.Points(g,new THREE.PointsMaterial({map:flareT,size,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));p.frustumCulled=false;S.add(p);return p};
const starS=starPts(.8,0,nSm),starB=starPts(2.1,nSm,nBg);
const lnG=new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(LP,3).setUsage(THREE.DynamicDrawUsage)),lines=new THREE.LineSegments(lnG,new THREE.LineDashedMaterial({color:0xffffff,transparent:true,opacity:.8,dashSize:.14,gapSize:.1,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));lines.frustumCulled=false;S.add(lines);
const H=bot(true);C.add(H);
const weak=lite&&((navigator.deviceMemory||8)<=4||(navigator.hardwareConcurrency||8)<=4);let q=weak?0:(lite?1:2),acc=0,nF=0,win=0,lastT=performance.now(),skip=0,W0=0,H0=0,base=0,push=0,warp=0,ph=0,dir=1,maxS=0,target=0,cur=0,prev=0,fov=45,mx=0,my=0,cx=0,cy=0,seen=false,ry=0,rx=0,mode='page',narrow=innerWidth<900,frames=0,done;
export const ready=new Promise(r=>done=r);export const kick=()=>{base=Math.random()*.3;push=.22;warp=1;ph=rnd(0,6.28);dir=Math.random()<.5?-1:1};export const setMode=m=>mode=m;export const setProgress=p=>target=p/3;
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;cx=mx*2;cy=-my*2;seen=true},{passive:true});
const lvh=document.createElement('div');lvh.style.cssText='position:fixed;left:0;top:0;width:0;height:100lvh;visibility:hidden;pointer-events:none';document.body.append(lvh);
function size(){narrow=innerWidth<900;const w=innerWidth,h=Math.max(innerHeight,lvh.offsetHeight||0);if(w===W0&&Math.abs(h-H0)<4)return;W0=w;H0=h;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix()} // toolbar show/hide no longer resizes the GL buffer
addEventListener('resize',size);size();
const setQ=l=>{q=l;const d=devicePixelRatio;R.setPixelRatio(l===0?Math.min(d,.75):l===1?Math.min(d,1):Math.min(d,1.5));R.setSize(W0,H0,false);
  const cf=l===0?.35:l===1?.7:1;swarm.forEach(o=>{const n=Math.max(1,Math.round(o.data.length*cf));o.mesh.count=n;o.dec.forEach(x=>x.mesh.count=n)});
  minis.forEach((m,i)=>m.b.visible=l===2||(l===1&&i<2));tags.forEach((g,i)=>g.s.visible=l===2||(l===1&&i<3));dust.visible=l>0;glows.forEach(g=>g.visible=l>0);
  document.documentElement.classList.toggle('lowfx',l===0)};setQ(q);const calcMax=()=>{maxS=Math.max(0,document.documentElement.scrollHeight-innerHeight)};setInterval(calcMax,400);addEventListener('resize',calcMax);
const calm=matchMedia('(prefers-reduced-motion:reduce)').matches?0:1,clock=new THREE.Clock(),P0=new THREE.Vector3(),P1=new THREE.Vector3(),sm=x=>x*x*(3-2*x);
R.setAnimationLoop(()=>{
  if(document.hidden){lastT=performance.now();return}
  {const n=performance.now();acc+=n-lastT;lastT=n;if(++nF===90){const avg=acc/nF;acc=nF=0;if(++win>=2&&avg>30&&q>0)setQ(q-1)}} // auto quality: drops a tier if < ~33fps
  if(q===0&&(++skip&1))return;
  const t=clock.getElapsedTime(),land=mode==='landing';
  push*=.96;warp*=.95;const sp=maxS>0?Math.min(scrollY/maxS,1):0; // sp: 0 top -> 1 bottom of ANY page
  cur+=((land?target:Math.min(base+.1*(.5+.5*Math.sin(t*.12+ph))+sp*.5+push,.95))-cur)*(land?.06:.05);
  const vel=cur-prev;prev=cur;
  const uu=Math.min(cur,1)*.88;curve.getPointAt(uu,P0);curve.getPointAt(uu+.06,P1);
  C.position.set(P0.x+mx*1.1+Math.sin(t*.18+ph)*(land?.6:.6+sp*.9)*dir*calm,P0.y-my*.7+Math.sin(t*.23+ph)*.3*calm,P0.z);C.lookAt(P1.x+mx*.7,P1.y-my*.4,P1.z);C.rotateZ((P1.x-P0.x)*-.05-mx*.05+Math.sin(t*.25)*.035*calm+Math.max(-.1,Math.min(.1,-vel*10))*dir);
  const bf=(narrow?58:45)+Math.min(Math.abs(vel)*500,9)+warp*14;fov+=(bf-fov)*.1;if(Math.abs(C.fov-fov)>.02){C.fov=fov;C.updateProjectionMatrix()}
  const lat=narrow?.72:1.1,fl=(d)=>Math.sin(t*.8+d.ph)*.15*calm;
  swarm.forEach(({mesh,data,dec})=>{data.forEach((d,i)=>{if(i>=mesh.count)return;const p=pts[d.pi];D.position.set(p.x+d.ox*lat,p.y+d.oy*lat+fl(d),p.z+d.oz);D.rotation.set(d.ph+t*d.rs*.5*calm,d.ph+t*d.rs*calm,0);D.scale.setScalar(d.s);D.updateMatrix();mesh.setMatrixAt(i,D.matrix);dec.forEach(q=>q.mesh.setMatrixAt(i,M.multiplyMatrices(D.matrix,q.off)))});mesh.instanceMatrix.needsUpdate=true;dec.forEach(q=>q.mesh.instanceMatrix.needsUpdate=true)});
  minis.forEach(m=>{if(!m.b.visible)return;const p=pts[m.pi];m.b.position.set(p.x+m.ox*lat,p.y+m.oy*lat+fl(m)*1.3,p.z+m.oz);m.b.rotation.set(0,Math.sin(t*.6+m.ph)*.7*calm+.3,0);m.b.scale.setScalar(.42)});
  tags.forEach(g=>{if(!g.s.visible)return;const p=pts[g.pi];g.s.position.set(p.x+g.ox*lat,p.y+g.oy*lat+fl(g)*1.5,p.z+g.oz)});
  const hh=Math.tan(C.fov*Math.PI/360)*7,hw=hh*C.aspect,hs=(land?(narrow?.55:.66):(narrow?.42:.5))*(land?1-sm(Math.min(cur/.14,1)):1);
  H.visible=hs>.01;H.scale.setScalar(Math.max(hs,.001));H.position.set(narrow?0:(land?.5:.66)*hw,(narrow?.5:0)*hh+Math.sin(t*1.1)*.1*calm,-7);
  const dx=cx*hw-H.position.x,dy=cy*hh-H.position.y,ty=seen?Math.max(-.8,Math.min(.8,Math.atan2(dx,4))):Math.sin(t*.6)*.4*calm,tx=seen?Math.max(-.45,Math.min(.45,-Math.atan2(dy,4))):Math.sin(t*.8)*.08*calm;
  ry+=(ty-ry)*.12;rx+=(tx-rx)*.12;H.rotation.set(rx,ry,0);
  const U=H.userData,bl=(t%4<.12)?.1:1;U.eyes.forEach(e=>e.scale.y=bl);U.arms[1].rotation.z=-.5+Math.sin(t*3)*.4*calm;U.arms[0].rotation.z=.35+Math.sin(t*1.4)*.08*calm;U.leds.forEach((l,i)=>l.scale.setScalar(.8+.5*Math.sin(t*4+i*2)*calm));
  {let li=0;CON.forEach(c=>{const q=pts[c.pi],cxw=q.x+c.ox*lat,cyw=q.y+c.oy*lat,czw=q.z+c.oz,yw=Math.sin(t*.2+c.ph)*.35*calm,cs=Math.cos(yw),sn=Math.sin(yw),sc=c.sc*(narrow?.75:1);
    c.s.forEach((p,j)=>{const x=p[0]*sc,z=Math.sin(j*2.1)*.4*sc,gi=c.gi[j]*3,g=.5+.5*Math.sin(t*2.2+j*1.7+c.ph),b=(.45+.55*g*g*g)*(c.big.has(j)?1.15:.8);
      SP[gi]=cxw+x*cs+z*sn;SP[gi+1]=cyw+p[1]*sc;SP[gi+2]=czw-x*sn+z*cs;SC[gi]=b;SC[gi+1]=b*.95;SC[gi+2]=b});
    c.e.forEach(([a,b])=>{for(const [n,v] of [[a,0],[b,3]]){const o=c.gi[n]*3;LP[li*6+v]=SP[o];LP[li*6+v+1]=SP[o+1];LP[li*6+v+2]=SP[o+2]}li++})});
    pA.needsUpdate=cA.needsUpdate=true;lnG.attributes.position.needsUpdate=true;if(!lines.userData.d){lines.computeLineDistances();lines.userData.d=1}
    starB.material.size=2.1+.3*Math.sin(t*2.3)*calm;starS.material.size=.8+.1*Math.sin(t*3.1)*calm}
  glows.forEach(g=>{const d=g.position.distanceTo(C.position);g.material.opacity=g.userData.o*Math.min(1,Math.max(0,(d-4)/8))}); // no bright flash when the camera flies through a glow
  R.render(S,C);if(++frames===3)done();
});
