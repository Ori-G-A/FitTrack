import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {chromium} from '@playwright/test';
import {sourceHash,digest} from '../../../scripts/save-state-evidence.js';
assert.equal(process.version,'v24.21.0');
const before=sourceHash(),files=['test-support/interface-browser.js','change-tests/save-state.spec.js','test-support/delete-state-browser.js'];
const pins=files.map(file=>({file,sha256:digest(file)})),observations=[];
const browser=await chromium.launch({headless:true});
try{
 for(const delayMs of [0,250,1500]){
  const context=await browser.newContext(),page=await context.newPage();
  try{
   const time=new Date('2026-10-18T12:00:00Z'),wait=()=>new Promise(resolve=>setTimeout(resolve,delayMs));
   await page.clock.install({time});await wait();
   await page.clock.setFixedTime(time);await wait();
   await page.clock.pauseAt(time);await wait();
   await page.clock.setSystemTime(time);await wait();
   assert.equal(await page.evaluate(()=>Date.now()),time.getTime());
   await page.evaluate(()=>{globalThis.__clock009Calls=0;setTimeout(()=>__clock009Calls++,10);});await wait();
   assert.equal(await page.evaluate(()=>Date.now()),time.getTime());assert.equal(await page.evaluate(()=>__clock009Calls),0);
   await page.clock.runFor(9);assert.equal(await page.evaluate(()=>__clock009Calls),0);
   await page.clock.runFor(1);assert.equal(await page.evaluate(()=>__clock009Calls),1);
   assert.equal(await page.evaluate(()=>Date.now()),time.getTime()+10);
   observations.push({delayMs,targetExact:true,hostDidNotFireTimer:true,virtualBoundary9Plus1:true});
  }finally{await context.close();}
 }
 assert.equal(sourceHash(),before);for(const pin of pins)assert.equal(digest(pin.file),pin.sha256);
 const proof={passed:true,stage:'investigación de API para plan; no implementación ni G-PIN',generatedAt:new Date().toISOString(),node:process.version,playwright:'1.64.0',chromium:browser.version(),sequence:['install','setFixedTime','pauseAt','setSystemTime'],sourceHash:before,pins,observations,limits:['Solo página vacía y temporizador sintético; falta caracterizar los tres montajes reales y sus oráculos en E0/E1.','El protocolo usa solo APIs públicas; no requiere acceso a internals de Playwright.']};
 writeFileSync(new URL('./api-spike.json',import.meta.url),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
}finally{await browser.close();}
