import * as T from 'three';
const geometry=new T.SphereGeometry(1,16,10);
const fur=new T.MeshStandardMaterial({color:0x292a23,roughness:.95});
const face=new T.MeshStandardMaterial({color:0x997461,roughness:.9});
const eye=new T.MeshStandardMaterial({color:0x15120f});
function part(parent:T.Object3D,material:T.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number){
 const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;
}
export class Chimpanzee {
 readonly group=new T.Group();
 private arms:T.Group[]=[];
 private legs:T.Group[]=[];
 private head:T.Mesh;
 private home:T.Vector3;
 constructor(x:number,z:number,private behavior:'groom'|'receive'|'walk'|'food',scale=1){
  this.home=new T.Vector3(x,0,z);this.group.position.copy(this.home);this.group.scale.setScalar(scale);
  part(this.group,fur,0,1.1,0,.66,.87,.43);
  this.head=part(this.group,fur,0,2.01,.15,.48,.54,.44);
  part(this.head,face,0,-.05,.86,.77,.72,.28);
  part(this.head,face,0,-.4,1.02,.57,.3,.25);
  for(const s of [-1,1]){
   part(this.head,face,s*.96,.05,.18,.22,.35,.2);
   part(this.head,eye,s*.29,.12,1.13,.11,.09,.055);
   const arm=new T.Group();arm.position.set(s*.54,1.55,0);
   part(arm,fur,s*.12,-.52,.07,.23,.65,.23);
   part(arm,fur,s*.16,-1.01,.26,.18,.43,.19);
   part(arm,face,s*.16,-1.36,.31,.21,.18,.25);
   this.group.add(arm);this.arms.push(arm);
   const leg=new T.Group();leg.position.set(s*.36,.68,-.12);
   part(leg,fur,0,-.25,.12,.26,.4,.24);
   part(leg,face,0,-.56,.35,.23,.15,.36);
   this.group.add(leg);this.legs.push(leg);
  }
 }
 update(t:number,height:(x:number,z:number)=>number){
  const walk=this.behavior==='walk',food=this.behavior==='food',groom=this.behavior==='groom';
  if(walk){const a=t*.27;this.group.position.x=this.home.x+Math.sin(a)*1.6;this.group.position.z=this.home.z+Math.cos(a)*1.1;this.group.rotation.y=Math.atan2(Math.cos(a)*1.6,-Math.sin(a)*1.1);}
  this.group.position.y=height(this.group.position.x,this.group.position.z)-(walk?0:.22);
  this.legs.forEach((leg,i)=>leg.rotation.x=walk?Math.sin(t*2.2+i*Math.PI)*.4:-.52);
  this.arms.forEach((arm,i)=>{
   arm.rotation.set(0,0,0);
   if(walk)arm.rotation.x=Math.sin(t*2.2+i*Math.PI+Math.PI)*.28;
   else if(groom){arm.rotation.z=i===1?1.1+Math.sin(t*3)*.12:-.2;arm.rotation.x=i===1?.15+Math.sin(t*2.6)*.08:-.2;}
   else if(food)arm.rotation.x=i===0?-1.1-Math.sin(t*1.9)*.8:-.1;
   else arm.rotation.x=-.25;
  });
  this.head.rotation.x=food?Math.sin(t*1.9)*.12:groom?.1:-.08;
 }
}
