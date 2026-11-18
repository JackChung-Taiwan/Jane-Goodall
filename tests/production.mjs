import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('.'),dist=path.join(root,'dist'),out=path.join(root,'screenshots');
const prefix='/classroom/goodall/';
const server=createServer(async(req,res)=>{
 let file=decodeURIComponent(req.url.split('?')[0]);
 if(!file.startsWith(prefix)){res.writeHead(404);res.end();return;}
 file=file.slice(prefix.length)||'index.html';
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 try{const b=await readFile(path.join(dist,file));res.writeHead(200,{'content-type':({'.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.html':'text/html'})[path.extname(file)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+prefix+'?debug=1';
let browser=await chromium.launch({executablePath:process.env.CHROME,headless:true,args:['--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(url);await page.waitForFunction(()=>!!window.forest);await page.screenshot({path:path.join(out,'home.png')});
 await page.locator('#start-btn').click();await page.locator('#dialog-actions button').click();
 const pose=async(x,y,z,targetX,targetZ)=>{
  await page.evaluate(([x,y,z,tx,tz])=>{const g=window.forest;g.player.set(x,y,z);g.yaw=Math.atan2(x-tx,z-tz);g.pitch=-.1;},[x,y,z,targetX,targetZ]);await page.waitForTimeout(250);
 };
 await pose(-27,5,40,-27,27);await page.screenshot({path:path.join(out,'conservation-before.png')});
 await page.evaluate(()=>window.forest.world.showCorridor());
 await page.screenshot({path:path.join(out,'conservation-after.png')});
 await pose(-64,8,-15,-117,-15);await page.screenshot({path:path.join(out,'lake.png')});
 await pose(0,7,18,0,0);await page.screenshot({path:path.join(out,'valley.png')});
 await pose(25,4.13,-20,25,-23);
 await page.keyboard.press('f');await page.locator('#dialog-actions button:first-child').click();
 await page.waitForTimeout(500);await page.screenshot({path:path.join(out,'observation.png')});
 await page.locator('#close-dialog').click();
 await pose(26,2.35,29,26,26);
 await page.keyboard.press('f');await page.screenshot({path:path.join(out,'tools.png')});
 await page.locator('#close-dialog').click();
 await page.locator('#settings-btn').click();await page.locator('#reset-game').click();await page.locator('#dialog-actions button').click();
 assert.equal(await page.evaluate(()=>window.forest.finished.size),0);
 assert.equal(await page.evaluate(()=>window.forest.world.planted.length),0);
 assert.deepEqual(errors,[]);
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.goto(url);await mobile.waitForFunction(()=>!!window.forest);
 await mobile.locator('#start-btn').tap();await mobile.locator('#dialog-actions button').tap();
 await mobile.evaluate(()=>window.forest.world.setQuality('low'));
 const performance=await mobile.evaluate(()=>new Promise(resolve=>{
 const start=performance.now(),times=[];let last=start;
 function frame(now){times.push(now-last);last=now;if(now-start<3000){requestAnimationFrame(frame);return;}times.sort((a,b)=>a-b);resolve({device:'Chrome mobile emulation on RTX 4060 Ti',width:390,height:844,quality:'low',fps:times.length*1000/(now-start),p95:times[Math.floor(times.length*.95)]});}
 requestAnimationFrame(frame);
 }));
 await writeFile(path.join(out,'final-checks.json'),JSON.stringify({subpath:prefix,errors,reset:true,performance},null,2));
 await browser.close();
 browser=await chromium.launch({executablePath:process.env.EDGE || process.env.CHROME,headless:true});
 const edge=await browser.newPage();await edge.goto(url);await edge.waitForFunction(()=>!!window.forest);assert(await edge.locator('#world').isVisible());await browser.close();
 browser=await chromium.launch({executablePath:process.env.CHROME,headless:true,args:['--disable-webgl']});
 const fallback=await browser.newPage();await fallback.goto(url);await fallback.getByRole('heading',{name:'無法啟動 3D 森林探索'}).waitFor();await fallback.screenshot({path:path.join(out,'webgl-fallback.png')});
 console.log('Production nested-path Chrome/Edge render, reset, scene screenshots and WebGL fallback passed; '+JSON.stringify(performance));
}finally{await browser.close();server.close();}
