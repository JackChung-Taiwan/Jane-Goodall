import * as THREE from 'three';
import type {SceneWorld} from './types';
export class PlayerController {
 constructor(private world:SceneWorld){}
 update(dt:number,player:THREE.Vector3,yaw:number,held:Set<string>,stick:{x:number;y:number}){
  const forward=Number(held.has('KeyW')||held.has('ArrowUp'))-Number(held.has('KeyS')||held.has('ArrowDown'))-stick.y;
  const side=Number(held.has('KeyD')||held.has('ArrowRight'))-Number(held.has('KeyA')||held.has('ArrowLeft'))+stick.x;
  const length=Math.hypot(forward,side);
  if(length<.02)return;
  const speed=(held.has('ShiftLeft')||held.has('ShiftRight')?15:8)*dt/Math.max(1,length);
  const x=THREE.MathUtils.clamp(player.x+(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed,-67,67);
  const z=THREE.MathUtils.clamp(player.z+(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed,-67,67);
  if(this.world.canWalk(x,z)){player.x=x;player.z=z;}
  player.y=THREE.MathUtils.lerp(player.y,this.world.eyeHeight(player.x,player.z),Math.min(1,dt*7));
 }
}
