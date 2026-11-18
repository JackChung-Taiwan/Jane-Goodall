import * as THREE from 'three';
import {Chimpanzee} from '../scenes/forest/Chimpanzee';
import type {ZoneInfo} from '../themes/types';

import type {Hotspot} from '../core/types';
export type {Hotspot} from '../core/types';

const C=(hex:number)=>new THREE.Color(hex);
const mat=(color:number, roughness=0.94)=>new THREE.MeshStandardMaterial({color,roughness});
const reusable={
 trunk:new THREE.CylinderGeometry(0.22,0.45,1,7),
 crown:new THREE.IcosahedronGeometry(1,1),
 sphere:new THREE.SphereGeometry(1,12,8),
 leaf:new THREE.ConeGeometry(1,2,6),
 plank:new THREE.BoxGeometry(1,1,1),
 marker:new THREE.TorusGeometry(1,.085,7,32)
};
function rand(seed=47){let value=seed|0;return ()=>{value^=value<<13;value^=value>>>17;value^=value<<5;return (value>>>0)/4294967295;};}
function mesh(geo:THREE.BufferGeometry, material:THREE.Material, x=0,y=0,z=0):THREE.Mesh {const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);return m;}
function ellipsoid(group:THREE.Group, material:THREE.Material, x:number,y:number,z:number, sx:number,sy:number,sz:number){const m=mesh(reusable.sphere,material,x,y,z);m.scale.set(sx,sy,sz);group.add(m);return m;}
function beam(group:THREE.Group, a:THREE.Vector3,b:THREE.Vector3,r1:number,r2:number,material:THREE.Material){const d=b.clone().sub(a);const m=mesh(new THREE.CylinderGeometry(r2,r1,d.length(),7),material);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());group.add(m);return m;}

export class ForestScene {
 scene=new THREE.Scene(); camera:THREE.PerspectiveCamera;
 renderer:THREE.WebGLRenderer;
 hotspots:Hotspot[]=[]; zones:ZoneInfo[];
 private colliders:{x:number;z:number;r:number}[]=[];
 private rand=rand(30069);
 private animated: {obj:THREE.Object3D;phase:number;amplitude:number}[]=[];
 private chimps:Chimpanzee[]=[];
 private inspection:string|null=null;
 private tool=new THREE.Group();
 private toolLeaves=new THREE.Group();
 private toolAnts=new THREE.Group();
 private toolAnimation=-1;
 private sun!:THREE.DirectionalLight;
 private vegetation:THREE.InstancedMesh[]=[];
 private butterflies:THREE.Group[]=[];
 private particles:THREE.Points|null=null;
 private time=0;
 private shaderTime={value:0};
 private planted:THREE.Group[]=[];
 private quality:'low'|'medium'|'high'='medium';
 private fog=new THREE.FogExp2(0x18392d,.013);
 constructor(canvas:HTMLCanvasElement,zones:ZoneInfo[]){
  this.zones=zones;
  this.scene.background=C(0x668d75);this.scene.fog=this.fog;
  this.camera=new THREE.PerspectiveCamera(72,1,.08,270);
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false});
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
  this.renderer.toneMappingExposure=1.35;
  const sun=this.sun=new THREE.DirectionalLight(0xffe4ab,3.1); sun.position.set(-35,90,-55);
  sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-85;sun.shadow.camera.right=85;sun.shadow.camera.top=85;sun.shadow.camera.bottom=-85;sun.shadow.camera.far=220;sun.shadow.camera.near=1;sun.shadow.bias=-.0001; this.scene.add(sun);
  this.scene.add(new THREE.HemisphereLight(0xc4e8cf,0x3a2e1e,2.25));
  this.scene.add(new THREE.AmbientLight(0x6b916d,.4));
  const groundMaterial=mat(0x6f7043);
  groundMaterial.onBeforeCompile=shader=>{
   shader.uniforms.forestTime=this.shaderTime;
   shader.vertexShader='varying vec3 groundPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ngroundPosition=(modelMatrix*vec4(position,1.)).xyz;');
   shader.fragmentShader='uniform float forestTime; varying vec3 groundPosition;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float grain=sin(groundPosition.x*31.)*sin(groundPosition.z*27.);
    float shade=sin(groundPosition.x*.73+sin(groundPosition.z*.38+forestTime*.12))*sin(groundPosition.z*.82+cos(groundPosition.x*.41-forestTime*.1));
    diffuseColor.rgb*=.55+smoothstep(.03,.65,shade)*.7+grain*.055;`);
  };
  const g=new THREE.PlaneGeometry(240,240,80,80);
  const pos=g.getAttribute('position');
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),z=pos.getY(i);
   const dist=Math.max(Math.abs(x),Math.abs(z));
   const roll=Math.sin(x*.056)*1.1+Math.cos(z*.061)*.92+Math.sin((x+z)*.095)*.38;
   const y=dist<58 ? .08*roll : roll*Math.min(1,(dist-55)/24);
   void y;pos.setZ(i,this.groundHeight(x,-z));
  }
  g.computeVertexNormals();const ground=mesh(g,groundMaterial);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;this.scene.add(ground);
  this.createDistantLandscape();this.createForest();this.createTrails();this.createSunRays();this.createDust();
  this.createCamp();this.createObservation();this.createTermites();this.createProtection();this.createWildlife();
  this.setQuality('medium');
 }
 private add(m:THREE.Object3D){this.scene.add(m);return m;}
 private createForest(){
  const total=360;
  const trunk=new THREE.InstancedMesh(reusable.trunk,mat(0x4b3023),total);
  const foliage=new THREE.InstancedMesh(reusable.crown,mat(0x416b3b),total);
  const foliage2=new THREE.InstancedMesh(reusable.crown,mat(0x638843),total);
  const shadow=mat(0x283b29); const foliage3=new THREE.InstancedMesh(reusable.crown,shadow,total);
  const dummy=new THREE.Object3D();let count=0;
  for(let i=0;i<total*6 && count<total;i++){
   const x=(this.rand()-.5)*218,z=(this.rand()-.5)*218;
   const nearAny=this.zones.some(q=>Math.hypot(q.x-x,q.z-z)<13);
   const onPath=(Math.abs(z+27)<7&&Math.abs(x)<40)||(Math.abs(z-27)<7&&Math.abs(x)<40)||(Math.abs(x+30)<7&&Math.abs(z)<40)||(Math.abs(x-30)<7&&Math.abs(z)<40);
   if(x<-70||nearAny||onPath||Math.abs(x)<5&&Math.abs(z)<5)continue;
   const h=11+this.rand()*16;const w=3.8+this.rand()*3.3;
   dummy.position.set(x,this.groundHeight(x,z)+h*.49,z);dummy.rotation.set(0,this.rand()*Math.PI*2,0);dummy.scale.set(1,h,1);dummy.updateMatrix();trunk.setMatrixAt(count,dummy.matrix);
   for(const [target,yy,scale] of [[foliage,h*.74,1],[foliage2,h*.89,.79],[foliage3,h*.59,.91]] as const){
    dummy.position.set(x,this.groundHeight(x,z)+yy+(this.rand()-.5)*1.3,z);dummy.scale.set(w*scale,w*.69*scale,w*scale);dummy.updateMatrix();target.setMatrixAt(count,dummy.matrix);
   }
   this.colliders.push({x,z,r:.85});count++;
  }
  for(const obj of [trunk,foliage,foliage2,foliage3]){obj.count=count;obj.instanceMatrix.needsUpdate=true;obj.castShadow=true;obj.receiveShadow=true;this.vegetation.push(obj);this.add(obj);}
  const bush=new THREE.InstancedMesh(reusable.crown,mat(0x63814b),780);const d=new THREE.Object3D();let n=0;
  for(let i=0;i<900 && n<780;i++){
   const x=(this.rand()-.5)*198,z=(this.rand()-.5)*198;
   if(x<-70||this.zones.some(q=>Math.hypot(q.x-x,q.z-z)<8))continue;
   const s=.35+this.rand()*1.1;
   d.position.set(x,this.groundHeight(x,z)+s*.56,z);d.scale.set(s,s*.8,s);d.rotation.y=this.rand()*6;d.updateMatrix();bush.setMatrixAt(n++,d.matrix);
  }
  bush.count=n;this.vegetation.push(bush);this.add(bush);
  const fernGeo=new THREE.BufferGeometry();const fernVertices:number[]=[];
  for(let k=0;k<7;k++){const a=k*2.399;for(let j=0;j<6;j++){
   const t=j/6,r=.12+t*.65,y=Math.sin(t*Math.PI)*.65;
   const x=Math.cos(a)*r,z=Math.sin(a)*r;
   fernVertices.push(x,y,z,x+Math.cos(a+.85)*.25*(1-t),y-.12,z+Math.sin(a+.85)*.25*(1-t),x+Math.cos(a)*.18,y+.08,z+Math.sin(a)*.18);
   fernVertices.push(x,y,z,x+Math.cos(a-.85)*.25*(1-t),y-.12,z+Math.sin(a-.85)*.25*(1-t),x+Math.cos(a)*.18,y+.08,z+Math.sin(a)*.18);
  }}
  fernGeo.setAttribute('position',new THREE.Float32BufferAttribute(fernVertices,3));fernGeo.computeVertexNormals();const ferns=new THREE.InstancedMesh(fernGeo,new THREE.MeshStandardMaterial({color:0x88a65f,side:THREE.DoubleSide}),360);n=0;
  for(let i=0;i<520 && n<360;i++){
   const x=(this.rand()-.5)*180,z=(this.rand()-.5)*180;
   if(x<-70||this.zones.some(q=>Math.hypot(q.x-x,q.z-z)<8))continue;
   const s=.45+this.rand()*.7;d.position.set(x,this.groundHeight(x,z)+.8*s,z);d.scale.set(s,s,s);d.rotation.y=this.rand()*6;d.updateMatrix();ferns.setMatrixAt(n++,d.matrix);
  }
  ferns.count=n;this.vegetation.push(ferns);this.add(ferns);
  for(let i=0;i<35;i++){
   const x=(this.rand()-.5)*140,z=(this.rand()-.5)*140;
   if(this.zones.some(q=>Math.hypot(q.x-x,q.z-z)<11))continue;
   const v=mesh(new THREE.CylinderGeometry(.016,.03,6+this.rand()*5,5),mat(0x566838),x,12+this.rand()*4,z);
   v.rotation.z=(this.rand()-.5)*.16;this.add(v);this.animated.push({obj:v,phase:this.rand()*6,amplitude:.035});
  }
 }
 private createTrails(){
  const track=mat(0x876c43), trim=mat(0x3d3926);
  const drawPath=(a:THREE.Vector3,b:THREE.Vector3)=>{
   const dist=a.distanceTo(b);const angle=Math.atan2(b.x-a.x,b.z-a.z);
   for(let t=0;t<dist;t+=1.7){
    const s=t/dist,x=a.x+(b.x-a.x)*s,z=a.z+(b.z-a.z)*s;
    const p=mesh(reusable.plank,track,x,.18,z);p.scale.set(3.7,.23,1.46);p.rotation.y=angle;this.add(p);
    if(Math.round(t*10)%7===0){const nail=mesh(reusable.plank,trim,x,.31,z);nail.scale.set(3,.045,.13);nail.rotation.y=angle;this.add(nail);}
   }
  };
  const z=this.zones;drawPath(new THREE.Vector3(z[0].x,0,z[0].z),new THREE.Vector3(z[1].x,0,z[1].z));
  drawPath(new THREE.Vector3(z[1].x,0,z[1].z),new THREE.Vector3(z[2].x,0,z[2].z));
  drawPath(new THREE.Vector3(z[2].x,0,z[2].z),new THREE.Vector3(z[3].x,0,z[3].z));
  drawPath(new THREE.Vector3(z[3].x,0,z[3].z),new THREE.Vector3(z[0].x,0,z[0].z));
  const hub=new THREE.Group();const circle=mesh(new THREE.CylinderGeometry(6,6,.25,30),mat(0x716344),0,.17,0);hub.add(circle);this.add(hub);
 }
 private createSunRays(){
  const raysMat=new THREE.MeshBasicMaterial({color:0xffeac0,transparent:true,opacity:.065,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const r=rand(842);
  for(let i=0;i<25;i++){
   const x=(r()-.5)*140,z=(r()-.5)*140;
   const radius=1.1+r()*4;const cone=mesh(new THREE.CylinderGeometry(radius*.08,radius,38,8,1,true),raysMat,x+(r()-.5)*5,19,z);
   cone.rotation.z=.15;cone.rotation.x=.12;this.add(cone);
  }
 }
 private createDust(){
  const count=640;const vertices=new Float32Array(count*3);const r=rand(99);
  for(let i=0;i<count;i++){vertices[i*3]=(r()-.5)*145;vertices[i*3+1]=r()*26+1;vertices[i*3+2]=(r()-.5)*145;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(vertices,3));
  this.particles=new THREE.Points(g,new THREE.PointsMaterial({color:0xe6db90,size:.17,transparent:true,opacity:.53,sizeAttenuation:true,depthWrite:false}));this.add(this.particles);
 }
 private woodPlank(x:number,y:number,z:number,sx:number,sy:number,sz:number,color=0x7d5f39){
  const o=mesh(reusable.plank,mat(color),x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;this.add(o);return o;
 }
 private createCamp(){
  const x=-37,z=-31;
  this.woodPlank(x,1.1,z,12,.38,9,0x89663f);
  for(const dx of [-5,5])for(const dz of [-3.6,3.6])this.woodPlank(x+dx,2.6,z+dz,.32,3.0,.32,0x58432b);
  const tarp=new THREE.Mesh(new THREE.ConeGeometry(7.8,4.9,4),mat(0xb7a06d));tarp.position.set(x,5.5,z);tarp.rotation.y=Math.PI/4;this.add(tarp);
  this.woodPlank(x-1,1.8,z+1,3,.3,1.6,0x96764a);
  this.woodPlank(x,2.8,z-4,2.4,1.6,.18,0x765532);
  const scope=new THREE.Group();scope.position.set(x+3,1.4,z-2.5);
  beam(scope,new THREE.Vector3(0,0,0),new THREE.Vector3(0,1.7,0),.12,.12,mat(0x333b38));
  const tube=mesh(new THREE.CylinderGeometry(.25,.32,1.5,12),mat(0x253f3d),0,1.85,0);tube.rotation.z=Math.PI/2+.22;scope.add(tube);this.add(scope);
  this.makeSign(x+8,z+5,'研究站');
  this.addHotspot('journal','閱讀研究筆記',-26,-23,0xdabd7d);
  this.addHotspot('camp-facts','認識貢貝研究',-38,-18,0xaac98a);
 }
 private makeSign(x:number,z:number,label:string){
  const p=this.woodPlank(x,1.7,z,.17,3.1,.17,0x504027);
  p.castShadow=false;
  const board=this.woodPlank(x,3,z,3,.95,.18,0x54422a);
  board.rotation.y=Math.PI/7;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const context=canvas.getContext('2d')!;context.fillStyle='#31442a';context.fillRect(0,0,512,128);context.font='bold 54px sans-serif';context.textAlign='center';context.fillStyle='#eff9d3';context.fillText(label,256,82);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sign=mesh(new THREE.PlaneGeometry(3,.75),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}),x,3,z+.12);sign.rotation.y=board.rotation.y;this.add(sign);
 }
 private createObservation(){
  const x=25,z=-25;
  this.woodPlank(x,2.3,z,11,.35,9,0x766440);
  for(const dx of [-4.8,4.8])for(const dz of [-3.9,3.9])this.woodPlank(x+dx,1.25,z+dz,.42,2.2,.42,0x443524);
  this.woodPlank(x,3.4,z-4,11,.22,.18);this.woodPlank(x-5.2,3.4,z,.18,.22,8.3);
  this.woodPlank(x,3.4,z+4,11,.22,.18);this.woodPlank(x+5.2,3.4,z,.18,.22,8.3);
  for(let i=0;i<6;i++){const p=mesh(reusable.plank,mat(0x9b8159),17.5+i*.5,.25,z+4.8);p.scale.set(1,.3,3.5);p.rotation.z=.1;this.add(p);}
  this.makeSign(18,-15,'黑猩猩觀察區');
  this.addHotspot('observe','使用望遠鏡觀察',25,-23,0x9ad8b0);
  this.addHotspot('behavior','查看行為圖鑑',17,-30,0xd3c186);
 }
 private createTermites(){
  const x=36,z=26;
  const mound=mesh(new THREE.ConeGeometry(2.45,5.3,11),mat(0x97643f),x,2.65,z);this.add(mound);
  for(let i=0;i<7;i++){const r=this.rand()*2,a=this.rand()*Math.PI*2;const lump=mesh(new THREE.DodecahedronGeometry(.5+this.rand()*.5),mat(0x795235),x+Math.cos(a)*r,.5+this.rand(),z+Math.sin(a)*r);this.add(lump);}
  const twig=mesh(new THREE.CylinderGeometry(.07,.09,3.4,7),mat(0x7e5d34),x-1.4,2.5,z);twig.rotation.z=-.45;this.add(twig);
  this.makeSign(20,23,'工具研究區');
  this.addHotspot('termite','觀察取白蟻工具',26,26,0xe7c489);
  this.addHotspot('tools-facts','查看工具知識',20,36,0x91c587);
 }
 private createProtection(){
  const x=-34,z=32;
  for(let i=0;i<15;i++){
   const px=x+(this.rand()-.5)*20,pz=z+(this.rand()-.5)*18;
   const stump=mesh(new THREE.CylinderGeometry(.47,.64,.5,10),mat(0x65503c),px,.25,pz);this.add(stump);
  }
  for(let i=0;i<4;i++){
   const xx=-26+(i%2)*7,zz=22+Math.floor(i/2)*8;
   this.woodPlank(xx,.2,zz,1.4,.18,1.4,0x6d5534);
  }
  this.makeSign(-38,20,'未來復育示意');
  this.addHotspot('plant1','配置森林綠廊',-34,27,0x9cd897);
  this.addHotspot('plant2','配置森林綠廊',-27,27,0x9cd897);
  this.addHotspot('plant3','配置森林綠廊',-20,27,0x9cd897);
  this.addHotspot('forest-quiz','保育知識挑戰',-35,22,0xeac287);
  this.addHotspot('protect-facts','閱讀保育筆記',-16,35,0x9ccf90);
 }
 private addHotspot(id:string,label:string,x:number,z:number,color:number){
  const g=new THREE.Group();g.position.set(x,0,z);
  const circle=mesh(reusable.marker,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.78}),0,.32,0);circle.rotation.x=Math.PI/2;circle.scale.set(.7,.7,.7);g.add(circle);
  const coreMat=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.6,roughness:.25});
  const orb=mesh(reusable.sphere,coreMat,0,2.1,0);orb.scale.set(.29,.29,.29);g.add(orb);
  const glow=mesh(new THREE.SphereGeometry(.63,10,8),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.12}),0,2.1,0);g.add(glow);
  this.add(g);this.hotspots.push({id,label,x,z,radius:5.8,position:new THREE.Vector3(x,1.5,z),mark:g});
 }
 private createWildlife(){
  for(const [x,z,behavior] of [[37,-29,'groom'],[39,-29,'receive'],[43,-33,'walk'],[39,29,'food']] as const){
   const chimp=new Chimpanzee(x,z,behavior);this.chimps.push(chimp);this.add(chimp.group);
  }
  for(let i=0;i<24;i++){
   const g=new THREE.Group();const wingMat=new THREE.MeshBasicMaterial({color:i%2?0xf3d68c:0xa7d7af,side:THREE.DoubleSide});
   const w1=mesh(new THREE.PlaneGeometry(.34,.48),wingMat,.16,0,0);w1.rotation.y=.45;g.add(w1);
   const w2=mesh(new THREE.PlaneGeometry(.34,.48),wingMat,-.16,0,0);w2.rotation.y=-.45;g.add(w2);
   const body=mesh(new THREE.SphereGeometry(.065,6,5),mat(0x342b20));g.add(body);
   g.position.set((this.rand()-.5)*120,1+this.rand()*7,(this.rand()-.5)*120);this.add(g);this.butterflies.push(g);
  }
 }
 setQuality(q:'low'|'medium'|'high'){
  this.quality=q;
  this.vegetation.forEach((mesh,i)=>{mesh.count=Math.floor([360,360,360,360,780,360][i]*(q==='low'?.45:q==='medium'?.75:1));});
  this.sun.shadow.mapSize.set(q==='high'?2048:1024,q==='high'?2048:1024);
  this.sun.shadow.map?.dispose();this.sun.shadow.map=null;const max=Math.min(window.devicePixelRatio||1,q==='high'?2:q==='medium'?1.5:1);
  this.renderer.setPixelRatio(max);
  this.renderer.shadowMap.enabled=q!=='low';this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.renderer.toneMappingExposure=q==='high'?1.45:1.28;
  this.fog.density=q==='low'?.017:.013;
  if(this.particles)this.particles.visible=q!=='low';
  this.resize();
 }
 resize(){const canvas=this.renderer.domElement;const w=canvas.clientWidth,h=canvas.clientHeight;if(w&&h){this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h,false);}}
 update(dt:number){this.time+=Math.min(dt,.1);const t=this.time;this.shaderTime.value=t;
  for(const v of this.animated)v.obj.rotation.z=Math.sin(t*.75+v.phase)*v.amplitude;
  for(const c of this.chimps)c.update(t,(x,z)=>this.groundHeight(x,z));
  if(this.toolAnimation>=0){const age=t-this.toolAnimation;this.tool.position.z=27-Math.sin(Math.min(age/2.4,1)*Math.PI)*1.2;this.toolAnts.visible=age>1.2;}
  for(let i=0;i<this.butterflies.length;i++){
   const g=this.butterflies[i];g.position.y+=Math.sin(t*2+i)*dt*.18;g.position.x+=Math.sin(t*.6+i)*dt*.2;
   g.children[0].rotation.y=Math.sin(t*13+i)*.85;g.children[1].rotation.y=-Math.sin(t*13+i)*.85;
   g.visible=this.quality!=='low'||i<7;
  }
  if(this.particles)this.particles.rotation.y+=dt*.0015;
  for(let i=0;i<this.hotspots.length;i++){
   const h=this.hotspots[i];h.mark.children[1].position.y=2.1+Math.sin(t*2+i)*.25;
   h.mark.children[2].position.y=h.mark.children[1].position.y;
   (h.mark.children[0] as THREE.Mesh).rotation.z=t*.5;
  }
  this.renderer.render(this.scene,this.camera);
 }
 plantTree(id:string){const h=this.hotspots.find(s=>s.id===id);if(!h)return;
  const g=new THREE.Group();g.position.set(h.x,0,h.z);
  const trunk=mesh(new THREE.CylinderGeometry(.15,.2,2.6,7),mat(0x6d5035),0,1.25,0);g.add(trunk);
  ellipsoid(g,mat(0x76ae61),0,3.1,0,1.4,1.55,1.1);ellipsoid(g,mat(0x9abc65),.6,2.55,.3,.83,.9,.75);
  g.scale.set(.32,.32,.32);this.add(g);this.planted.push(g);
  h.mark.visible=false;
 }
 activatePlanted(){for(const g of this.planted)g.scale.setScalar(1.2);}
 eyeHeight(x:number,z:number){return Math.abs(x-25)<5.4&&Math.abs(z+25)<4.2?4.13:this.groundHeight(x,z)+2.35;}
 canWalk(x:number,z:number){return !this.colliders.some(c=>Math.hypot(x-c.x,z-c.z)<c.r)&&![[38,-29,7.2],[39,29,6.3]].some(([cx,cz,r])=>Math.hypot(x-cx,z-cz)<r);}
 homeView(){this.camera.position.set(-13,7,-12);this.camera.lookAt(-33,3,-30);}
 get qualityLevel(){return this.quality;}
 groundHeight(x:number,z:number){
  const valley=-2.4*Math.exp(-(x*x+z*z)/240);
  const outside=Math.max(0,Math.max(Math.abs(x),Math.abs(z))-48);
  return valley-Math.max(0,-x-60)*.35+outside*.10*(1+Math.sin(x*.055)*.3)+Math.sin(x*.07)*Math.cos(z*.07)*Math.min(outside*.04,1.4);
 }
 inspect(mode:string){this.inspection=mode;}
 clearInspection(){this.inspection=null;this.camera.fov=72;this.camera.updateProjectionMatrix();}
 applyInspection(){
  if(!this.inspection)return;
  if(this.inspection==='tools'){this.camera.position.set(24,5,32);this.camera.lookAt(30,2,27);this.camera.fov=42;}
  else{const food=this.inspection==='food';this.camera.position.set(food?26:25,6.3,food?27:-23);this.camera.lookAt(food?39:38,1.3,food?29:-29);this.camera.fov=26;}
  this.camera.updateProjectionMatrix();
 }
 toolStage(stage:number){
  if(stage===0){this.toolLeaves.visible=true;this.toolAnts.visible=false;this.toolAnimation=-1;}
  else{this.tool.visible=true;this.toolLeaves.visible=stage<2;if(stage===3)this.toolAnimation=this.time;}
 }
 showCorridor(){
  for(const id of ['plant1','plant2','plant3'])if(this.hotspots.find(h=>h.id===id)?.mark.visible)this.plantTree(id);
  this.activatePlanted();
 }
 reset(){
  for(const object of this.planted){this.scene.remove(object);object.traverse(node=>{if(node instanceof THREE.Mesh&&node.geometry!==reusable.sphere){node.geometry.dispose();}});}
  this.planted=[];this.hotspots.forEach(h=>h.mark.visible=true);this.toolStage(0);this.clearInspection();
 }
 private createDistantLandscape(){
  const lake=mesh(new THREE.PlaneGeometry(95,240),new THREE.MeshStandardMaterial({color:0x477f85,metalness:.25,roughness:.26}),-117,-1,0);lake.rotation.x=-Math.PI/2;this.add(lake);
  for(let i=0;i<15;i++){const mountain=mesh(new THREE.IcosahedronGeometry(1,2),mat(i%2?0x597c6a:0x6f8d78),-90+i*16,8,-112-Math.sin(i)*18);mountain.scale.set(19,15+Math.sin(i*1.8)*9,30);this.add(mountain);}
  const stream=mesh(new THREE.PlaneGeometry(4,90),mat(0x607f72),0,-2.1,0);stream.rotation.x=-Math.PI/2;this.add(stream);
  this.woodPlank(30,1.3,27,5,.3,3);
  this.tool.position.set(30,2.0,27);
  const branch=mesh(new THREE.CylinderGeometry(.055,.075,2,8),mat(0x8d6039));branch.rotation.x=Math.PI/2;this.tool.add(branch);
  for(let i=0;i<6;i++){const leaf=mesh(reusable.sphere,mat(0x7cad56),(i-3)*.24,.1,0);leaf.scale.set(.19,.035,.12);this.toolLeaves.add(leaf);}
  for(let i=0;i<8;i++){const ant=mesh(reusable.sphere,mat(0x372a19),(i-4)*.12,0,.05);ant.scale.set(.04,.03,.07);this.toolAnts.add(ant);}
  this.tool.add(this.toolLeaves,this.toolAnts);this.toolAnts.visible=false;this.add(this.tool);
  const hole=mesh(new THREE.TorusGeometry(.13,.05,8,16),mat(0x211c12),30,2,26.2);this.add(hole);
  const demo=mesh(new THREE.ConeGeometry(.5,1.2,10),mat(0x9b6d48),30,2,25.7);this.add(demo);
  for(const [x,z] of [[-39,27],[-17,27]]){for(let j=0;j<3;j++){const tree=mesh(reusable.crown,mat(0x3d7946),x+(j-1)*2,5,z+3);tree.scale.set(2.5,3,2.5);this.add(tree);}}
 }
 dispose(){this.renderer.dispose();this.scene.traverse((o:THREE.Object3D)=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const a=Array.isArray(o.material)?o.material:[o.material];for(const m of a)m.dispose();}});}
}
