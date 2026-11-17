import * as THREE from 'three';
import type {ZoneId, ThemeConfig, Knowledge, Question} from '../themes/types';
import {ForestScene, type Hotspot} from '../scene/ForestScene';

const ids=['camp','observe','tools','protect'] as const;
const missionTitle:Record<ZoneId,string>={camp:'開啟研究筆記',observe:'觀察黑猩猩行為',tools:'破解樹枝取白蟻',protect:'守護森林棲地'};
const $=(id:string)=>document.getElementById(id) as HTMLElement;
export class ForestGame {
 world:ForestScene;
 theme:ThemeConfig;
 private player=new THREE.Vector3(-25,2.35,-23);
 private yaw=Math.PI/2;
 private pitch=-.08;
 private held=new Set<string>();
 private joystick={x:0,y:0};
 private pointerLocked=false;
 private started=false;
 private paused=true;
 private finished=new Set<ZoneId>();
 private planted=new Set<string>();
 private activeZone:ZoneId='camp';
 private activeHotspot:Hotspot|null=null;
 private last=0;
 private fpsTime=0;
 private frames=0;
 private fps=60;
 private modalOpen=false;
 constructor(theme:ThemeConfig){
  this.theme=theme;
  document.title=`${theme.title} | ${theme.course}`;
  document.documentElement.style.setProperty('--accent',theme.primary);
  this.renderInterface();
  const canvas=$('world') as HTMLCanvasElement;
  this.world=new ForestScene(canvas,theme.zones);
  this.world.camera.position.copy(this.player);
  this.attachEvents();
  this.world.resize();
  requestAnimationFrame(this.loop);
 }
 private renderInterface(){
  const a=$('app');
  a.innerHTML=`
    <canvas id="world" aria-label="3D 非洲森林互動場景"></canvas>
    <div class="top-gradient"></div><div class="bottom-gradient"></div>
    <header class="header">
      <div class="brand"><span class="brand-icon">JG<span class="brand-dot"></span></span><div><b>GOMBE FIELD STATION</b><small>《麥塊 AI 科學實驗王 2》</small></div></div>
      <div class="header-actions"><button class="pill only-desktop" id="map-btn">探索區域</button><button class="icon-button" id="book-btn" title="開啟知識圖鑑" aria-label="知識圖鑑">▤</button><button class="icon-button" id="settings-btn" title="設定" aria-label="設定">⚙</button></div>
    </header>
    <aside class="hud-left" id="hud-left"><div class="eyebrow"><span class="dot"></span> FIELD JOURNAL / 野外筆記</div><h2>森林守護任務 <span class="progress-tag" id="progress-count">0 / 4</span></h2>
      <div class="progress-track"><span id="progress-fill"></span></div>
      <div class="mission-list" id="mission-list"></div>
      <div class="hud-footer"><span id="zone-label">01 — 森林研究站</span><span id="coords-label">GOMBE</span></div>
    </aside>
    <nav class="zone-travel" id="zone-travel" aria-label="探索地點快捷導覽">
      ${this.theme.zones.map(z=>`<button class="travel-btn" data-zone="${z.id}"><span>${z.short}</span><b>${z.title}</b></button>`).join('')}
    </nav>
    <div class="crosshair" aria-hidden="true"><span></span><span></span></div>
    <div class="bottom-ui"><div class="interaction" id="interaction" hidden><span class="keycap">F</span><span id="interaction-text">按下 F 互動</span><button id="interact-btn">開始互動</button></div>
      <div class="controls-help" id="controls-help">W A S D 移動 <i>·</i> 滑鼠拖曳轉向 <i>·</i> Shift 加速 <i>·</i> F 互動</div></div>
    <div class="mini-stats" id="stats">60 FPS</div>
    <div class="mobile-controller" id="mobile-controls"><div class="virtual-pad" id="joystick"><div class="joystick-knob" id="joystick-knob"></div></div><button id="mobile-interact">互動</button></div>
    <div class="toast" id="toast" role="status"></div>
    <section class="intro-screen" id="intro-screen"><div class="intro-panel"><div class="intro-kicker"><span></span> FOREST EXPEDITION 001 <span></span></div>
      <p class="intro-course">${this.theme.course}</p><h1>珍古德的<br><em>黑猩猩研究站</em></h1><p class="english">${this.theme.englishTitle}</p>
      <div class="intro-line"></div><p class="intro-description">${this.theme.heroText}<br>從觀察開始，探索森林中的生命與科學。</p>
      <button id="start-btn" class="primary-button">開始森林探險 <span>→</span></button>
      <div class="intro-meta"><span>4 個探索區域</span><span>4 項科學任務</span><span>8 張知識卡</span></div>
      <p class="intro-tip">建議使用電腦 Chrome / Edge，手機也可操作</p></div>
      <div class="intro-index">01 / JANE GOODALL <span>SCROLL TO EXPLORE</span></div>
    </section>
    <div class="dialog-backdrop" id="dialog-backdrop" hidden><section class="dialog" id="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"></section></div>`;
  this.updateMissionUI();
 }
 private attachEvents(){
  $('start-btn').addEventListener('click',()=>{this.started=true;this.paused=false;$('intro-screen').classList.add('hidden');this.guide();});
  $('interact-btn').addEventListener('click',()=>this.interact());
  $('mobile-interact').addEventListener('click',()=>this.interact());
  $('settings-btn').addEventListener('click',()=>this.settings());
  $('book-btn').addEventListener('click',()=>this.openBook());
  $('map-btn').addEventListener('click',()=>{$('zone-travel').classList.toggle('expanded');});
  document.querySelectorAll<HTMLButtonElement>('[data-zone]').forEach(btn=>btn.addEventListener('click',()=>this.travel(btn.dataset.zone as ZoneId)));
  addEventListener('keydown',e=>{
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
   if(['KeyF','Enter'].includes(e.code) && this.started && !this.modalOpen){e.preventDefault();this.interact();}
   if(e.code==='Escape'){if(this.modalOpen)this.closeDialog();else if(this.started)this.settings();}
   this.held.add(e.code);
  });
  addEventListener('keyup',e=>this.held.delete(e.code));
  const canvas=$('world') as HTMLCanvasElement;
  let dragging=false,lastX=0,lastY=0,touchId:number|null=null;
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('pointerdown',e=>{
   if(!this.started||this.modalOpen)return;
   if(e.pointerType==='mouse'&&e.detail===2&&canvas.requestPointerLock){void canvas.requestPointerLock();}
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
  document.addEventListener('pointerlockchange',()=>{this.pointerLocked=document.pointerLockElement===canvas;});
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
 private looking(dx:number,dy:number,s:number){this.yaw+=dx*s;this.pitch=Math.max(-1.1,Math.min(1.1,this.pitch-dy*s));}
 private loop=(ms:number)=>{
  const dt=Math.min(.045,(ms-this.last)/1000||.016);this.last=ms;
  if(!this.paused && !this.modalOpen)this.move(dt);
  this.world.camera.position.copy(this.player);
  this.world.camera.rotation.order='YXZ';this.world.camera.rotation.y=this.yaw;this.world.camera.rotation.x=this.pitch;
  this.world.update(dt);
  this.fpsTime+=dt;this.frames++;
  if(this.fpsTime>.8){this.fps=Math.round(this.frames/this.fpsTime);this.frames=0;this.fpsTime=0;$('stats').textContent=`${this.fps} FPS`;}
  if(this.started&&!this.modalOpen)this.nearby();
  requestAnimationFrame(this.loop);
 };
 private move(dt:number){
  const forward=(this.held.has('KeyW')||this.held.has('ArrowUp')?1:0)-(this.held.has('KeyS')||this.held.has('ArrowDown')?1:0)-this.joystick.y;
  const strafe=(this.held.has('KeyD')||this.held.has('ArrowRight')?1:0)-(this.held.has('KeyA')||this.held.has('ArrowLeft')?1:0)+this.joystick.x;
  let length=Math.hypot(forward,strafe);if(length<.02)return;length=Math.max(1,length);
  const speed=(this.held.has('ShiftLeft')||this.held.has('ShiftRight')?15:8)*dt/length;
  const nx=this.player.x+(-Math.sin(this.yaw)*forward+Math.cos(this.yaw)*strafe)*speed;
  const nz=this.player.z+(-Math.cos(this.yaw)*forward-Math.sin(this.yaw)*strafe)*speed;
  const tx=THREE.MathUtils.clamp(nx,-67,67),tz=THREE.MathUtils.clamp(nz,-67,67);
  // Keep a safe virtual distance from wild chimpanzee habitats.
  const habitats=[[38,-29,7.2],[39,29,6.3]];
  if(!habitats.some(([x,z,r])=>Math.hypot(tx-x,tz-z)<r)){
   this.player.x=tx;this.player.z=tz;
  }
  const onDeck=Math.abs(this.player.x-25)<5.4&&Math.abs(this.player.z+25)<4.2;
  this.player.y=THREE.MathUtils.lerp(this.player.y,onDeck?4.13:2.35,Math.min(1,dt*7));
 }
 private nearby(){
  const point=this.world.hotspots.reduce<Hotspot|null>((best,h)=>{
   if(!h.mark.visible)return best;
   const distance=Math.hypot(this.player.x-h.x,this.player.z-h.z);
   if(distance>h.radius)return best;
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
  this.player.set(z.x,id==='observe'?4.13:2.35,z.z);this.pitch=-.08;this.yaw=id==='camp'?Math.PI/2:id==='observe'?Math.PI/2:id==='tools'?Math.PI/2:0;
  this.activeHotspot=null;this.nearby();$('zone-travel').classList.remove('expanded');
  if(!this.started){this.started=true;this.paused=false;$('intro-screen').classList.add('hidden');}
  this.toast(`抵達：${z.title}`);
 }
 private interact(){if(!this.started||this.modalOpen)return;
  const h=this.activeHotspot;if(!h){this.toast('請先走近發光的探索標記');return;}
  const id=h.id;
  if(id==='journal'){this.dialog('field','珍古德的野外筆記',this.theme.intro,'jane',()=>this.finish('camp'),'完成觀察紀錄');}
  else if(id==='camp-facts'){this.dialog('field','貢貝研究站','長期、仔細且不打擾動物，是珍古德的研究精神。','gombe');}
  else if(id==='observe'){this.dialog('chimp','在遠方觀察黑猩猩','你在觀察平台看到黑猩猩互相整理毛髮。研究者要保持距離，以免干擾牠們。','groom',()=>this.finish('observe'),'記錄理毛行為');}
  else if(id==='behavior'){this.dialog('chimp','黑猩猩的日常','牠們會覓食、休息、理毛，也會與同伴互動。','food');}
  else if(id==='termite'){this.openQuestion(this.theme.questions[0],()=>this.finish('tools'),'termite');}
  else if(id==='tools-facts'){this.dialog('field','黑猩猩製作工具','觀察工具的形狀與用途，想想為什麼要除去樹枝的葉片。','toolmake');}
  else if(id.startsWith('plant')){
   if(this.planted.has(id)){this.toast('這棵樹苗已完成復育');return;}
   this.planted.add(id);this.world.plantTree(id);this.world.activatePlanted();
   this.toast(`種下原生樹苗！${this.planted.size} / 3`);
   if(this.planted.size===3)this.dialog('tree','森林變得更完整了','三棵原生樹苗已經種下。接著完成保育知識挑戰！','habitat');
  }
  else if(id==='forest-quiz'){
   if(this.planted.size<3){this.toast(`請先復育三棵樹苗，目前 ${this.planted.size}/3`);return;}
   this.openQuestion(this.theme.questions[1],()=>this.finish('protect'),'respect');
  }else if(id==='protect-facts')this.dialog('tree','人與野生動物','親近野生動物不等於保護牠們，保持距離才能降低驚擾及疾病風險。','respect');
 }
 private finish(id:ZoneId){if(this.finished.has(id)){this.toast('此任務已完成');return;}
  this.finished.add(id);this.updateMissionUI();this.toast(`任務完成：${missionTitle[id]}`);
  if(this.finished.size===4){setTimeout(()=>this.complete(),500);}
 }
 private updateMissionUI(){
  const list=$('mission-list');if(!list)return;
  list.innerHTML=ids.map((id,i)=>`<div class="mission-row ${this.finished.has(id)?'done':''}"><span class="mission-check">${this.finished.has(id)?'✓':String(i+1).padStart(2,'0')}</span><div><b>${missionTitle[id]}</b><small>${this.theme.zones[i].title}</small></div></div>`).join('');
  $('progress-count').textContent=`${this.finished.size} / 4`;
  ($('progress-fill') as HTMLElement).style.width=`${this.finished.size*25}%`;
 }
 private guide(){this.dialog('mentor','珍古德的研究邀請',this.theme.intro,'jane',undefined,'開始觀察');}
 private showDialog(title:string,body:string,actions:{label:string;run:()=>void;style?:string}[]){
  this.modalOpen=true;const el=$('dialog');$('dialog-backdrop').hidden=false;
  el.innerHTML=`<div class="dialog-top"><span class="eyebrow">GOMBE / FIELD NOTES</span><button id="close-dialog" aria-label="關閉">×</button></div>
    <h2 id="dialog-title"></h2><div class="dialog-body" id="dialog-body"></div><div class="dialog-actions" id="dialog-actions"></div>`;
  $('dialog-title').textContent=title;$('dialog-body').innerHTML=body;
  $('close-dialog').addEventListener('click',()=>this.closeDialog());
  for(const action of actions){const b=document.createElement('button');b.className=action.style||'primary-button';b.textContent=action.label;b.addEventListener('click',action.run);$('dialog-actions').appendChild(b);}
  if(document.pointerLockElement)document.exitPointerLock();
 }
 private closeDialog(){this.modalOpen=false;$('dialog-backdrop').hidden=true;}
 private dialog(_icon:string,title:string,body:string,knowledge:string,onConfirm?:()=>void,confirmLabel='完成閱讀'){
  const card=this.theme.knowledge.find(k=>k.id===knowledge);
  const html=`<p class="dialog-lead">${body}</p>${card?`<article class="knowledge-inline"><small>SCIENCE NOTE / 科學知識</small><h3>${card.title}</h3><p>${card.body}</p><div class="action-tip">觀察建議｜${card.action}</div></article>`:''}`;
  this.showDialog(title,html,[{label:confirmLabel,run:()=>{this.closeDialog();onConfirm?.();}}]);
 }
 private openQuestion(question:Question,correctAction:()=>void,knowledgeId:string){
  const card=this.theme.knowledge.find(k=>k.id===knowledgeId);
  let choices=question.options.map((o,i)=>`<button class="answer" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${o}</button>`).join('');
  choices+=`<p class="answer-feedback" id="answer-feedback" aria-live="polite">請選出正確答案。</p>`;
  this.showDialog('科學觀察挑戰',`<p class="dialog-lead">${question.title}</p><div class="answer-list">${choices}</div>${card?`<p class="question-tip">相關主題：${card.title}</p>`:''}`,[{label:'返回探索',style:'outline-button',run:()=>this.closeDialog()}]);
  document.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(b=>b.addEventListener('click',()=>{
   const n=Number(b.dataset.answer);const feedback=$('answer-feedback');
   if(n===question.correct){feedback.textContent=question.explain;feedback.className='answer-feedback correct';
    document.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(btn=>btn.disabled=true);
    const ok=document.createElement('button');ok.className='primary-button';ok.textContent='完成任務 →';ok.addEventListener('click',()=>{this.closeDialog();correctAction();});$('dialog-actions').prepend(ok);
   }else{feedback.textContent='再想一想：觀察黑猩猩實際如何使用工具、或如何安全保育。';feedback.className='answer-feedback wrong';}
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
  <div class="settings-label">畫質設定</div><div class="quality-group">${q.map(v=>`<button data-quality="${v}" class="quality-btn ${v==='medium'?'active':''}">${v.toUpperCase()}</button>`).join('')}</div>
  <div class="settings-label">快速前往</div><div class="setting-zones">${this.theme.zones.map(z=>`<button data-jump="${z.id}">${z.short} · ${z.title}</button>`).join('')}</div>`,[{label:'繼續探索',run:()=>this.closeDialog()}]);
  document.querySelectorAll<HTMLButtonElement>('[data-quality]').forEach(b=>b.addEventListener('click',()=>{
   this.world.setQuality(b.dataset.quality as 'low'|'medium'|'high');
   document.querySelectorAll('[data-quality]').forEach(n=>n.classList.remove('active'));b.classList.add('active');this.toast('已切換畫質');
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-jump]').forEach(b=>b.addEventListener('click',()=>{this.closeDialog();this.travel(b.dataset.jump as ZoneId);}));
 }
 private complete(){
  const challenge=this.theme.challenges.map((v,i)=>`<div class="challenge"><span>0${i+1}</span>${v}</div>`).join('');
  this.showDialog('恭喜完成森林研究任務！',`<p class="dialog-lead">你完成了四個研究站任務，學會觀察行為、認識工具，以及用行動守護森林。</p>
   <div class="completion-badge">JANE GOODALL · FOREST GUARDIAN<br><strong>森林守護研究員</strong><small>4 / 4 任務完成</small></div>
   <h3 class="end-heading">回到 Minecraft Education 繼續挑戰</h3><div class="challenges">${challenge}</div>`,[
   {label:'重新開始',style:'outline-button',run:()=>{this.closeDialog();this.finished.clear();this.planted.clear();this.updateMissionUI();location.reload();}},
   {label:'繼續自由探索',run:()=>this.closeDialog()}
  ]);
 }
 private toast(msg:string){const e=$('toast');e.textContent=msg;e.classList.add('visible');setTimeout(()=>{if(e.textContent===msg)e.classList.remove('visible');},2600);}
}
