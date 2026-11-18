import type * as THREE from 'three';
export interface Hotspot {id:string;label:string;x:number;z:number;radius:number;position:THREE.Vector3;mark:THREE.Group;}
export interface Experience {reset():void;cancelView():void;}
export interface SceneWorld {
 camera:THREE.PerspectiveCamera;
 renderer:THREE.WebGLRenderer;
 hotspots:Hotspot[];
 qualityLevel:'low'|'medium'|'high';
 eyeHeight(x:number,z:number):number;
 canWalk(x:number,z:number):boolean;
 groundHeight(x:number,z:number):number;
 homeView():void;
 applyInspection():void;
 clearInspection():void;
 setQuality(q:'low'|'medium'|'high'):void;
 resize():void;
 update(dt:number):void;
 reset():void;
 dispose():void;
}
