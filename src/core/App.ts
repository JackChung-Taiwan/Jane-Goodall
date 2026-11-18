import * as THREE from 'three';
import type {ZoneId, ThemeConfig, Knowledge, Question} from '../themes/types';
import type {Hotspot} from '../scene/ForestScene';
import {createScene,type SceneWorld} from './SceneFactory';
import {MissionManager} from './MissionManager';
import {InteractionRegistry} from './InteractionRegistry';
import type {Experience} from './types';
import {GameUI} from '../ui/GameUI';
import {PlayerController} from './PlayerController';



const $=(id:string)=>document.getElementById(id) as HTMLElement;
export class App {
 world:SceneWorld;
 private registry=new InteractionRegistry();
 private research!:Experience;
 private controller!:PlayerController;
 private endTimer=0;
 private muted=false;
 private audio?:AudioContext;
 theme:ThemeConfig;
 private player=new THREE.Vector3();
 private yaw=Math.PI/2;
 private pitch=-.08;
 private held=new Set<string>();
 private joystick={x:0,y:0};
 private pointerLocked=false;
 private started=false;
 private paused=true;
 private finished=new MissionManager<ZoneId>();

 private activeZone:ZoneId;
 private activeHotspot:Hotspot|null=null;
 private last=0;
 private fpsTime=0;
 private fpsStamp=0;
 private frames=0;
 private fps=60;
 private modalOpen=false;
 constructor(theme:ThemeConfig, install:(app:App)=>Experience){
  this.theme=theme;this.activeZone=theme.zones[0].id;
  this.player.set(theme.spawn.x,2.35,theme.spawn.z);this.yaw=theme.spawn.yaw;
  document.title=`${theme.title} | ${theme.course}`;
  document.documentElement.style.setProperty('--accent',theme.palette.accent);
  new GameUI(theme).render();this.updateMissionUI();
  const canvas=$('world') as HTMLCanvasElement;
  this.world=createScene(canvas,theme);
  this.world.camera.position.copy(this.player);
  this.controller=new PlayerController(this.world);
  this.research=install(this);
  this.attachEvents();
  this.world.resize();
  requestAnimationFrame(this.loop);
 }
 private attachEvents(){
  $('start-btn').addEventListener('click',()=>{this.started=true;this.paused=false;this.startSound();$('intro-screen').classList.add('hidden');this.guide();});
  $('intro-help').addEventListener('click',()=>this.guide());
  $('intro-settings').addEventListener('click',()=>this.settings());
  $('interact-btn').addEventListener('click',()=>this.interact());
  $('mobile-interact').addEventListener('click',()=>this.interact());
  $('settings-btn').addEventListener('click',()=>this.settings());
  $('book-btn').addEventListener('click',()=>this.openBook());
  $('map-btn').addEventListener('click',()=>{$('zone-travel').classList.toggle('expanded');});
  document.querySelectorAll<HTMLButtonElement>('[data-zone]').forEach(btn=>btn.addEventListener('click',()=>this.travel(btn.dataset.zone as ZoneId)));
  addEventListener('keydown',e=>{
   if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement)return;
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
   if(['KeyF','Enter'].includes(e.code) && this.started && !this.modalOpen){e.preventDefault();this.interact();}
   if(e.code==='Escape'){if(this.modalOpen)this.closeDialog();else if(this.started)this.settings();}
   if(!this.modalOpen)this.held.add(e.code);
  });
  addEventListener('blur',()=>{this.held.clear();this.joystick={x:0,y:0};});
  addEventListener('keyup',e=>this.held.delete(e.code));
  const canvas=$('world') as HTMLCanvasElement;
  let dragging=false,lastX=0,lastY=0,touchId:number|null=null;
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('pointerdown',e=>{
   if(!this.started||this.modalOpen)return;
   if(e.pointerType==='mouse'&&e.detail===2&&canvas.requestPointerLock){const request=canvas.requestPointerLock();request?.catch(()=>undefined);}
   else if(e.pointerType==='touch'&&e.clientX<window.innerWidth*.43)return;
   dragging=true;lastX=e.clientX;lastY=e.clientY;touchId=e.pointerId;canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
   if(this.pointerLocked)return;
   if(!dragging||e.pointerId!==touchId)return;
   this.looking(e.clientX-lastX,e.clientY-lastY,e.pointerType==='touch'?.006:.004);
   lastX=e.clientX;lastY=e.clientY;
  });
  canvas.addEventListener('pointerup',()=>dragging=false);
  canvas.addEventListener('pointercancel',()=>dragging=false);
  document.addEventListener('pointerlockchange',()=>{const was=this.pointerLocked;this.pointerLocked=document.pointerLockElement===canvas;if(was&&!this.pointerLocked&&!this.modalOpen)this.settings();});
  document.addEventListener('mousemove',e=>{if(this.pointerLocked&&!this.modalOpen)this.looking(e.movementX,e.movementY,.002);});
  addEventListener('resize',()=>this.world.resize());
  const joy=$('joystick'),knob=$('joystick-knob');let joyId:number|null=null;
  const joystickMove=(e:PointerEvent)=>{
   const rect=joy.getBoundingClientRect();const x=e.clientX-(rect.left+rect.width/2),y=e.clientY-(rect.top+rect.height/2);
   const len=Math.max(1,Math.hypot(x,y)),limit=rect.width*.3;
   this.joystick.x=Math.max(-1,Math.min(1,x/limit));this.joystick.y=Math.max(-1,Math.min(1,y/limit));
   const k=Math.min(limit,len)/len;knob.style.transform=`translate(${x*k}px,${y*k}px)`;
  };
  joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(e.pointerId);joystickMove(e);});
  joy.addEventListener('pointermove',e=>{if(joyId===e.pointerId)joystickMove(e);});
  const joyStop=()=>{joyId=null;this.joystick={x:0,y:0};knob.style.transform='translate(0,0)';};
  joy.addEventListener('pointerup',joyStop);joy.addEventListener('pointercancel',joyStop);
 }
 private startSound(){
  if(this.audio)return;try{this.audio=new AudioContext();const gain=this.audio.createGain();gain.gain.value=.012;gain.connect(this.audio.destination);for(const f of [196,293.66]){const osc=this.audio.createOscillator();osc.frequency.value=f;osc.connect(gain);osc.start();}if(this.muted)void this.audio.suspend();}catch{this.muted=true;}
 }
 private looking(dx:number,dy:number,s:number){this.yaw+=dx*s;this.pitch=Math.max(-1.1,Math.min(1.1,this.pitch-dy*s));}
 private loop=(ms:number)=>{
  const dt=Math.min(.045,(ms-this.last)/1000||.016);this.last=ms;
  if(!this.paused && !this.modalOpen)this.move(dt);
  this.world.camera.position.copy(this.player);
  this.world.camera.rotation.order='YXZ';this.world.camera.rotation.y=this.yaw;this.world.camera.rotation.x=this.pitch;
  if(!this.started)this.world.homeView();else this.world.applyInspection();
  this.world.update(dt);
  this.fpsTime+=(ms-this.fpsStamp)/1000||dt;this.fpsStamp=ms;this.frames++;
  if(this.fpsTime>.8){this.fps=Math.round(this.frames/this.fpsTime);this.frames=0;this.fpsTime=0;$('stats').textContent=`${this.fps} FPS`;}
  if(this.started&&!this.modalOpen)this.nearby();
  requestAnimationFrame(this.loop);
 };
 private move(dt:number){this.controller.update(dt,this.player,this.yaw,this.held,this.joystick);}
 private nearby(){
  const point=this.world.hotspots.reduce<Hotspot|null>((best,h)=>{
   if(!h.mark.visible)return best;
   const distance=Math.hypot(this.player.x-h.x,this.player.z-h.z);
   if(distance>h.radius)return best;
   const projected=h.position.clone().project(this.world.camera);
   if(projected.z>1||Math.abs(projected.x)>1||Math.abs(projected.y)>1)return best;
   if(!best||distance<Math.hypot(this.player.x-best.x,this.player.z-best.z))return h;
   return best;
  },null);
  if(this.activeHotspot?.id!==point?.id){this.activeHotspot=point;
   $('interaction').hidden=!point;
   if(point)$('interaction-text').textContent=point.label;
  }
  const zone=this.theme.zones.reduce((best,z)=>Math.hypot(this.player.x-z.x,this.player.z-z.z)<Math.hypot(this.player.x-best.x,this.player.z-best.z)?z:best,this.theme.zones[0]);
  if(zone.id!==this.activeZone){this.activeZone=zone.id;$('zone-label').textContent=`${zone.short} — ${zone.title}`;}
 }
 private travel(id:ZoneId){
  const z=this.theme.zones.find(v=>v.id===id);if(!z)return;
  this.player.set(z.x,this.world.eyeHeight(z.x,z.z),z.z);this.pitch=-.08;this.yaw=z.yaw??0;
  this.activeHotspot=null;this.nearby();$('zone-travel').classList.remove('expanded');
  if(!this.started){this.started=true;this.paused=false;$('intro-screen').classList.add('hidden');}
  this.toast(`抵達：${z.title}`);
 }
 private interact(){this.nearby();if(!this.started||this.modalOpen)return;
  const h=this.activeHotspot;if(!h){this.toast('請先走近發光的探索標記');return;}
  this.registry.run(h.id);
 }
 register(id:string,action:()=>void){this.registry.register(id,action);}
 getTheme(){return this.theme;}

 finish(id:ZoneId){if(this.finished.has(id)){this.toast('此任務已完成');return;}
  this.finished.complete(id);this.updateMissionUI();this.toast(`任務完成：${this.theme.missions[id]}`);
  if(this.finished.size===this.theme.zones.length){this.endTimer=window.setTimeout(()=>this.complete(),500);}
 }
 private updateMissionUI(){
  const list=$('mission-list');if(!list)return;
  list.innerHTML=this.theme.zones.map((zone,i)=>{const id=zone.id;return `<div class="mission-row ${this.finished.has(id)?'done':''}"><span class="mission-check">${this.finished.has(id)?'✓':String(i+1).padStart(2,'0')}</span><div><b>${this.theme.missions[id]}</b><small>${this.theme.zones[i].title}</small></div></div>`;}).join('');
  $('progress-count').textContent=`${this.finished.size} / ${this.theme.zones.length}`;
  ($('progress-fill') as HTMLElement).style.width=`${this.finished.size*100/this.theme.zones.length}%`;
 }
 private guide(){this.dialog('mentor',this.theme.mentor,this.theme.intro+' 操作：WASD 移動，拖曳轉向，走近可見標記後按 F；手機用左搖桿與右側滑動。','jane',undefined,'開始觀察');}
 showDialog(title:string,body:string,actions:{label:string;run:()=>void;style?:string}[]){
  this.held.clear();this.joystick={x:0,y:0};this.world.clearInspection();
  this.modalOpen=true;const el=$('dialog');$('dialog-backdrop').hidden=false;
  el.innerHTML=`<div class="dialog-top"><span class="eyebrow">${this.theme.station} / FIELD NOTES</span><button id="close-dialog" aria-label="關閉">×</button></div>
    <h2 id="dialog-title"></h2><div class="dialog-body" id="dialog-body"></div><div class="dialog-actions" id="dialog-actions"></div>`;
  $('dialog-title').textContent=title;$('dialog-body').innerHTML=body;
  $('close-dialog').addEventListener('click',()=>this.closeDialog());
  for(const action of actions){const b=document.createElement('button');b.className=action.style||'primary-button';b.textContent=action.label;b.addEventListener('click',action.run);$('dialog-actions').appendChild(b);}
  if(document.pointerLockElement)document.exitPointerLock();
 }
 closeDialog(){this.research?.cancelView();this.world.clearInspection();this.modalOpen=false;$('dialog-backdrop').hidden=true;}
 dialog(_icon:string,title:string,body:string,knowledge:string,onConfirm?:()=>void,confirmLabel='完成閱讀'){
  const card=this.theme.knowledge.find(k=>k.id===knowledge);
  const html=`<p class="dialog-lead">${body}</p>${card?`<article class="knowledge-inline"><small>SCIENCE NOTE / 科學知識</small><h3>${card.title}</h3><p>${card.body}</p><div class="action-tip">觀察建議｜${card.action}</div></article>`:''}`;
  this.showDialog(title,html,[{label:confirmLabel,run:()=>{this.closeDialog();onConfirm?.();}}]);
 }
 openQuestion(question:Question,correctAction:()=>void,knowledgeId:string){
  const card=this.theme.knowledge.find(k=>k.id===knowledgeId);
  let choices=question.options.map((o,i)=>`<button class="answer" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${o}</button>`).join('');
  choices+=`<p class="answer-feedback" id="answer-feedback" aria-live="polite">請選出正確答案。</p>`;
  this.showDialog('科學觀察挑戰',`<p class="dialog-lead">${question.title}</p><div class="answer-list">${choices}</div>${card?`<p class="question-tip">相關主題：${card.title}</p>`:''}`,[{label:'返回探索',style:'outline-button',run:()=>this.closeDialog()}]);
  document.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(b=>b.addEventListener('click',()=>{
   const n=Number(b.dataset.answer);const feedback=$('answer-feedback');
   if(n===question.correct){feedback.textContent=question.explain;feedback.className='answer-feedback correct';
    document.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(btn=>btn.disabled=true);
    const ok=document.createElement('button');ok.className='primary-button';ok.textContent='完成任務 →';ok.addEventListener('click',()=>{this.closeDialog();correctAction();});$('dialog-actions').prepend(ok);
   }else{feedback.textContent=question.hint||'再觀察一次，再試試看。';feedback.className='answer-feedback wrong';}
  }));
 }
 private openBook(){
  const buttons=this.theme.knowledge.map(k=>`<button class="entry" data-card="${k.id}"><span>${k.icon}</span><b>${k.title}</b><small>${this.theme.zones.find(z=>z.id===k.zone)?.title}</small></button>`).join('');
  this.showDialog('野外科學圖鑑',`<p class="dialog-lead">八則研究筆記，探索科學家如何理解黑猩猩與森林。</p><div class="book-grid">${buttons}</div>`,[{label:'繼續探索',run:()=>this.closeDialog()}]);
  document.querySelectorAll<HTMLButtonElement>('[data-card]').forEach(b=>b.addEventListener('click',()=>{
   const card=this.theme.knowledge.find(k=>k.id===b.dataset.card) as Knowledge;
   this.dialog('field',card.title,card.body,card.id,undefined,'回到探索');
  }));
 }
 private settings(){
  const q=['low','medium','high'];
  this.showDialog('探索設定',`<p class="dialog-lead">調整畫質，或快速前往不同研究區。</p>
  <div class="settings-label">畫質設定</div><div class="quality-group">${q.map(v=>`<button data-quality="${v}" class="quality-btn ${v===this.world.qualityLevel?'active':''}">${v.toUpperCase()}</button>`).join('')}</div>
  <button id="mute-toggle" class="outline-button">聲音：${this.muted?'靜音':'開啟'}</button><button id="reset-game" class="outline-button">重新開始</button>
  <div class="settings-label">快速前往</div><div class="setting-zones">${this.theme.zones.map(z=>`<button data-jump="${z.id}">${z.short} · ${z.title}</button>`).join('')}</div>`,[{label:'繼續探索',run:()=>this.closeDialog()}]);
  $('mute-toggle').onclick=()=>{this.muted=!this.muted;if(this.audio){if(this.muted)void this.audio.suspend();else void this.audio.resume();}this.settings();};
  $('reset-game').onclick=()=>this.reset();
  document.querySelectorAll<HTMLButtonElement>('[data-quality]').forEach(b=>b.addEventListener('click',()=>{
   this.world.setQuality(b.dataset.quality as 'low'|'medium'|'high');
   document.querySelectorAll('[data-quality]').forEach(n=>n.classList.remove('active'));b.classList.add('active');this.toast('已切換畫質');
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-jump]').forEach(b=>b.addEventListener('click',()=>{this.closeDialog();this.travel(b.dataset.jump as ZoneId);}));
 }
 private complete(){
  const challenge=this.theme.minecraftChallenges.map((v,i)=>`<div class="challenge"><span>0${i+1}</span>${v}</div>`).join('');
  this.showDialog(this.theme.completion.title,`<p class="dialog-lead">${this.theme.completion.summary}</p>
   <div class="completion-badge">${this.theme.station}<br><strong>${this.theme.completion.badge}</strong><small>4 / 4 任務完成</small></div>
   <h3 class="end-heading">回到 Minecraft Education 繼續挑戰</h3><div class="challenges">${challenge}</div>`,[
   {label:'重新開始',style:'outline-button',run:()=>{this.reset();}},
   {label:'繼續自由探索',run:()=>this.closeDialog()}
  ]);
 }
 reset(){
  window.clearTimeout(this.endTimer);this.closeDialog();this.finished.clear();this.research.reset();this.world.reset();
  this.updateMissionUI();this.travel(this.theme.zones[0].id);this.guide();
 }
 private toast(msg:string){const e=$('toast');e.textContent=msg;e.classList.add('visible');setTimeout(()=>{if(e.textContent===msg)e.classList.remove('visible');},2600);}
}
