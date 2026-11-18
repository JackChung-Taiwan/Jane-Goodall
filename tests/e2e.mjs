import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve(process.env.SCREENSHOTS_DIR || 'screenshots');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME,headless:true,args:['--enable-unsafe-swiftshader']});
const report={tests:[],errors:[],performance:[]};
try{
for(const mobile of [false,true]){
 const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile});
 const page=await ctx.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 const shot=async(name)=>page.screenshot({path:path.join(out,(mobile?'mobile-':'')+name+'.png')});
 page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 const click=async(sel)=>mobile?page.locator(sel).tap():page.locator(sel).click();
 await page.goto((process.env.URL || 'http://127.0.0.1:4191/')+'?debug=1&theme=invalid');
 await page.waitForFunction(()=>!!window.forest);
 await page.waitForTimeout(700);
 await shot('home');
 await click('#start-btn');await click('#dialog-actions button');
 const go=async(id)=>{
  await page.evaluate(id=>{
   const g=window.forest,h=g.world.hotspots.find(h=>h.id===id);
   g.player.set(h.x,g.world.eyeHeight(h.x,h.z+3),h.z+3);g.yaw=0;g.pitch=-.22;
  },id);
  await page.waitForTimeout(150);
  if(mobile)await click('#mobile-interact');else await page.keyboard.press('f');
  await page.locator('#dialog-backdrop:not([hidden])').waitFor();
 };
 if(!mobile){
  for(const [x,z] of [[25,-23],[26,26],[-34,24],[-25,-23]]){
   for(let i=0;i<40;i++){
    const distance=await page.evaluate(([x,z])=>{const g=window.forest;const dx=x-g.player.x,dz=z-g.player.z;g.yaw=Math.atan2(-dx,-dz);return Math.hypot(dx,dz);},[x,z]);
    if(distance<3)break;
    await page.keyboard.down('w');await page.waitForTimeout(280);await page.keyboard.up('w');
   }
   assert(await page.evaluate(([x,z])=>Math.hypot(x-window.forest.player.x,z-window.forest.player.z)<3,[x,z]),'walking route '+x+','+z);
  }
  report.tests.push({walk:'A→B→C→D→A',result:'passed'});
 }else{
  const joy=await page.locator('#joystick').boundingBox();
  const cdp=await ctx.newCDPSession(page);
  const before=await page.evaluate(()=>window.forest.player.toArray());
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:joy.x+joy.width/2,y:joy.y+joy.height/2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:joy.x+joy.width/2,y:joy.y+5}]});
  await page.waitForTimeout(350);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert(await page.evaluate(b=>window.forest.player.distanceTo({x:b[0],y:b[1],z:b[2]})>.2,before));
 }
 await go('journal');await shot('camp');
 await page.selectOption('#note-place',{label:'貢貝森林觀察台'});
 await page.check('[value="guess"]');await click('#dialog-actions button');
 assert.match(await page.locator('#note-feedback').innerText(),/推測/);
 await page.check('[value="fact"]');await click('#dialog-actions button');
 assert.match(await page.locator('#progress-count').innerText(),/1 \/ 4/);
 await go('observe');await click('#dialog-actions button:first-child');
 await shot('observation');
 await click('#dialog-actions button:first-child');
 assert.match(await page.locator('#view-feedback').innerText(),/耐心/);
 await page.waitForFunction(()=>document.querySelector('#view-clock')?.dataset.ready==='yes');
 await page.check('[name="behavior"][value="seen"]');await click('#dialog-actions button:first-child');
 await click('#dialog-actions button:nth-child(2)');
 await page.waitForFunction(()=>document.querySelector('#view-clock')?.dataset.ready==='yes');
 await page.check('[name="behavior"][value="seen"]');await click('#dialog-actions button:first-child');
 assert.match(await page.locator('#progress-count').innerText(),/2 \/ 4/);
 await go('termite');await click('#wrong-tool');await shot('tools');
 assert.match(await page.locator('#tool-feedback').innerText(),/細枝/);
 await click('#dialog-actions button:first-child');await click('#dialog-actions button:first-child');
 await click('#dialog-actions button:first-child');
 await click('#close-dialog');
 await go('termite'); // Interrupted insertion must resume from the last safe step.
 await click('#dialog-actions button:first-child');
 await page.locator('[data-answer="1"]').waitFor();
 await click('[data-answer="1"]');
 assert.match(await page.locator('#answer-feedback').innerText(),/再試/);
 await click('[data-answer="0"]');await click('#dialog-actions button:first-child');
 assert.match(await page.locator('#progress-count').innerText(),/3 \/ 4/);
 await go('forest-quiz');await shot('conservation-before');
 for(const id of [0,1,2])await click('[data-cell="'+id+'"]');
 await click('#dialog-actions button:first-child');
 assert.match(await page.locator('#corridor-feedback').innerText(),/中間/);
 for(const id of [0,1,2,3,4,5])await click('[data-cell="'+id+'"]');
 await click('#dialog-actions button:first-child');
 await click('[data-answer="0"]');
 assert.match(await page.locator('#answer-feedback').innerText(),/疾病/);
 await click('[data-answer="1"]');await click('#dialog-actions button:first-child');
 await page.getByRole('heading',{name:'恭喜成為森林研究員！'}).waitFor();
 await shot('complete');await click('#dialog-actions button:last-child');await shot('conservation-after');
 assert.equal(await page.evaluate(()=>window.forest.finished.size),4);
 await click('#book-btn');
 const cards=await page.locator('[data-card]').evaluateAll(nodes=>nodes.map(n=>n.dataset.card));
 for(const id of cards){
  await click('[data-card="'+id+'"]');await click('#close-dialog');await click('#book-btn');
 }
 await click('#close-dialog');
 await click('#settings-btn');await click('#reset-game');await click('#dialog-actions button');
 assert.equal(await page.evaluate(()=>window.forest.finished.size),0);
 assert.equal(await page.evaluate(()=>window.forest.world.planted.length),0);
 report.tests.push({device:mobile?'mobile':'desktop',tasks:'4/4',cards:cards.length,reset:true});
 if(!mobile){
 await page.setViewportSize({width:1920,height:1080});
 for(const q of ['low','medium','high']){
 await page.evaluate(q=>window.forest.world.setQuality(q),q);
 await page.waitForTimeout(500);
 report.performance.push(await page.evaluate(q=>new Promise(resolve=>{
 let stamps=[],start=performance.now(),last=start;
 function sample(now){stamps.push(now-last);last=now;if(now-start<3000){requestAnimationFrame(sample);return;}stamps.sort((a,b)=>a-b);const r=window.forest.world.renderer;const gl=r.getContext(),ex=gl.getExtension('WEBGL_debug_renderer_info');resolve({q,fps:stamps.length*1000/(now-start),p95:stamps[Math.floor(stamps.length*.95)],p99:stamps[Math.floor(stamps.length*.99)],calls:r.info.render.calls,triangles:r.info.render.triangles,width:gl.drawingBufferWidth,height:gl.drawingBufferHeight,gpu:ex?gl.getParameter(ex.UNMASKED_RENDERER_WEBGL):'unknown'});}
 requestAnimationFrame(sample);
 }),q));
 }
 }
 await ctx.close();
}
assert.deepEqual(report.errors,[]);
console.log(JSON.stringify(report));
}finally{await browser.close();await writeFile(path.join(out,'results.json'),JSON.stringify(report,null,2));}
