import type {ForestScene} from '../scene/ForestScene';
import type {App} from '../core/App';
import type {ZoneId} from '../themes/types';
const el=(id:string)=>document.getElementById(id)!;
export interface ResearchSession {reset():void;cancelView():void;}
export function installResearch(app:App):ResearchSession {
 const theme=app.getTheme();
 const world=app.world as ForestScene;
 let note='';
 const records=new Set<string>();let toolStep=0;let connected=false;const cells=new Set<number>();
 let timer=0;let generation=0;
 const cancelView=()=>{if(toolStep===3){toolStep=2;world.toolStage(2);}generation++;window.clearTimeout(timer);document.body.classList.remove('inspecting');};
 const card=(id:string)=>{const k=theme.knowledge.find(k=>k.id===id)!;app.dialog('field',k.title,k.body,id);};
 const finish=(id:ZoneId)=>{app.closeDialog();app.finish(id);};
 const journal=()=>{
  app.showDialog('任務 1 · 成為研究員',`<p>${note?'研究筆記已蓋章 · '+note:''}</p><p>閱讀歷史紀錄，填寫模擬觀察筆記。珍古德於 1960 年在貢貝開始長期研究。</p>
  <label>觀察時間 <input id="note-time" type="time" value="09:00"></label><label>觀察地點 <select id="note-place"><option value="">請選擇</option><option>貢貝森林觀察台</option></select></label>
  <p>研究紀錄中的畫面：一隻黑猩猩用手指整理同伴的毛髮。</p>
  <fieldset><legend>哪一句可以寫入「看到的行為」？</legend>
  <label><input type="radio" name="evidence" value="guess">牠一定很喜歡牠的朋友。</label>
  <label><input type="radio" name="evidence" value="fact">牠用手指整理另一隻黑猩猩的毛髮。</label></fieldset>
  <p id="note-feedback" role="status"></p>`,[{label:'寫入野外筆記',run:()=>{
   const value=(el('note-time') as HTMLInputElement).value;
   if(!value||!(el('note-place') as HTMLSelectElement).value){el('note-feedback').textContent='請先記錄時間與地點。';return;}
   if((document.querySelector('[name="evidence"]:checked') as HTMLInputElement)?.value!=='fact'){el('note-feedback').textContent='「喜歡」是推測；請選擇能直接看見的動作。';return;}
   note=value+'｜貢貝森林觀察台｜用手指整理同伴毛髮（觀察）';records.add('note');finish('camp');
  }}]);
 };
 const observe=()=>{
  app.showDialog('任務 2 · 遠距觀察兩種行為',`<p>保持在觀察台，用望遠鏡觀看教育示意動畫。每種行為至少觀察 4 秒，再記錄看到的動作。</p>
   <p id="observation-log">已記錄 ${Number(records.has('groom'))+Number(records.has('food'))}/2 種</p>`,[
   {label:'望遠鏡 · 互相理毛',run:()=>view('groom')},
   {label:'望遠鏡 · 覓食',run:()=>view('food')},
   {label:'返回探索',run:()=>app.closeDialog(),style:'outline-button'}]);
 };
 const view=(behavior:'groom'|'food')=>{
  cancelView();const token=generation;
  app.showDialog('望遠鏡 · '+(behavior==='groom'?'互相理毛':'覓食'),`<p>教育示意動畫 · 虛擬觀察距離超過 10 公尺</p><p id="view-clock" role="status">請觀察 4 秒……</p>
  <label><input type="radio" name="behavior" value="rest">黑猩猩靜止休息。</label>
  <label><input type="radio" name="behavior" value="seen">${behavior==='groom'?'一隻用手整理同伴毛髮，另一隻坐著。':'牠伸手取食，再把手移到嘴邊。'}</label><p id="view-feedback" role="status"></p>`,[
   {label:'記錄觀察',run:()=>{
    if(el('view-clock').dataset.ready!=='yes'){el('view-feedback').textContent='先耐心看完，再留下紀錄。';return;}
    if((document.querySelector('[name="behavior"]:checked') as HTMLInputElement)?.value!=='seen'){el('view-feedback').textContent='再比較動畫中手臂與身體的動作，選擇實際看到的行為。';return;}
    records.add(behavior);world.clearInspection();document.body.classList.remove('inspecting');
    if(records.has('groom')&&records.has('food'))finish('observe');else observe();
   }},
   {label:'返回觀察台',style:'outline-button',run:()=>{cancelView();observe();}}]);
  document.body.classList.add('inspecting');world.inspect(behavior);
  timer=window.setTimeout(()=>{if(token!==generation)return;el('view-clock').dataset.ready='yes';el('view-clock').textContent='觀察時間已滿，可以記錄。';},4000);
 };
 const tools=()=>{
  const actions=[
   {label:'選擇細枝',run:()=>{toolStep=1;world.toolStage(1);tools();}},
   {label:'去除葉片',run:()=>{toolStep=2;world.toolStage(2);tools();}},
   {label:'插入示意孔洞',run:()=>{
    toolStep=3;world.toolStage(3);app.showDialog('工具使用動畫', '<p>教學模擬桌上的枝條正伸入孔洞，再帶出白蟻示意點。</p><p id="tool-wait">請觀察動畫……</p>',[]);
    const token=++generation;
    timer=window.setTimeout(()=>{if(token!==generation)return;toolStep=4;tools();},2600);
   }}
  ];
  if(toolStep>=4){app.openQuestion(theme.questions[0],()=>finish('tools'),'termite');return;}
  app.showDialog('任務 3 · 樹枝取白蟻',`<p>這是教學模擬桌。按照順序調整工具，觀察形狀與用途。</p><p>目前步驟 ${toolStep}/3</p>
   <button class="answer" id="wrong-tool">選擇寬大帶葉的枝條</button><p id="tool-feedback" role="status"></p>`,[actions[toolStep],{label:'稍後繼續',style:'outline-button',run:()=>app.closeDialog()}]);
  el('wrong-tool').onclick=()=>{el('tool-feedback').textContent='洞口很小。請使用細枝，再去除葉片。';};
  world.inspect('tools');document.body.classList.add('inspecting');
 };
 const corridor=()=>{
  app.showDialog('任務 4 · 森林連通計畫',`<p>左側森林 → 中間缺口 → 右側森林。選擇三個相鄰位置，連接同一條綠廊。每點代表當地原生植物配置示意。</p>
   <div class="corridor-grid">${Array.from({length:9},(_,i)=>`<button data-cell="${i}" aria-pressed="${cells.has(i)}">${cells.has(i)?'原生苗木':'配置 '+(i+1)}</button>`).join('')}</div><p id="corridor-feedback" role="status">${connected?'未來復育示意已完成。':'兩側森林入口位於中間一排。'}</p>`,[
   {label:'檢查森林連通',run:()=>{
    if(cells.size!==3||![3,4,5].every(i=>cells.has(i))){el('corridor-feedback').textContent='請讓三個點從左到右接上中間一排的兩個入口。可再點一次取消位置。';return;}
    connected=true;world.showCorridor();app.openQuestion(theme.questions[1],()=>finish('protect'),'respect');
   }},
   {label:'返回探索',style:'outline-button',run:()=>app.closeDialog()}]);
  document.querySelectorAll<HTMLButtonElement>('[data-cell]').forEach(button=>button.onclick=()=>{
   const i=Number(button.dataset.cell);
   if(cells.has(i))cells.delete(i);else if(cells.size<3)cells.add(i);else{el('corridor-feedback').textContent='最多配置三點；先取消一點再調整。';return;}
   button.setAttribute('aria-pressed',String(cells.has(i)));button.textContent=cells.has(i)?'原生苗木':'配置 '+(i+1);
  });
 };
 app.register('journal',journal);app.register('observe',observe);app.register('termite',tools);
 for(const id of ['plant1','plant2','plant3','forest-quiz'])app.register(id,corridor);
 for(const [hotspot,knowledge] of [['camp-facts','gombe'],['behavior','food'],['tools-facts','toolmake'],['protect-facts','respect']])app.register(hotspot,()=>card(knowledge));
 return {cancelView,reset:()=>{cancelView();records.clear();note='';toolStep=0;connected=false;cells.clear();}};
}
