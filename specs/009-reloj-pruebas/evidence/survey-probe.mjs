import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {mountUi} from '../../../test-support/interface-browser.js';
import {mountDeleteBrowser} from '../../../test-support/delete-state-browser.js';
import {sourceHash,digest} from '../../../scripts/save-state-evidence.js';
assert.equal(process.version,'v24.21.0');
const files=['test-support/interface-browser.js','change-tests/save-state.spec.js','test-support/delete-state-browser.js'];
const before=sourceHash(),pins=files.map(file=>({file,sha256:digest(file)}));
const original=readFileSync(files[1],'utf8').replace(/\r\n/g,'\n');
const start=original.indexOf('async function mount(page){'),end=original.indexOf('\ntest(',start);
assert(start>=0&&end>start);
const mountSave=new Function('expect','bundle','return ('+original.slice(start,end)+');')(expect,'globalThis.__clock009Mounted=true;');
const browser=await chromium.launch({headless:true});const observations=[];
try {
  for(const [name,mount] of [['interfaz',p=>mountUi(p,'globalThis.__clock009Mounted=true;')],['guardado',mountSave],['borrado',p=>mountDeleteBrowser(p,'globalThis.__clock009Mounted=true;')]]){
    const context=await browser.newContext({timezoneId:'America/Bogota'}),page=await context.newPage();let scripts=0;
    const install=page.clock.install.bind(page.clock),addScript=page.addScriptTag.bind(page);
    page.clock.install=async options=>{await install(options);await new Promise(resolve=>setTimeout(resolve,250));};
    page.addScriptTag=async options=>{scripts++;return addScript(options);};
    try {
      let failure;try{await mount(page);}catch(error){failure=error;}
      assert(failure,name+' debe reproducir el fallo de preparación');
      assert.match(failure.message,/Cannot fast-forward to the past/);assert.equal(scripts,0);
      observations.push({fixture:name,hostDelayMs:250,preparationRejected:true,error:'Cannot fast-forward to the past',scriptsInjected:0});
    }finally{await context.close();}
  }
  const context=await browser.newContext(),page=await context.newPage();
  try {
    const time=new Date('2026-10-27T12:00:00Z');await page.clock.install({time});
    await new Promise(resolve=>setTimeout(resolve,250));
    await page.clock.pauseAt(new Date(time.getTime()+10000));
    const paused=await page.evaluate(()=>Date.now());await new Promise(resolve=>setTimeout(resolve,250));
    assert.equal(await page.evaluate(()=>Date.now()),paused);await page.clock.runFor(1);
    assert.equal(await page.evaluate(()=>Date.now()),paused+1);
    observations.push({fixture:'control API, sin aplicación',pauseInFutureMs:10000,hostDelayMs:250,pausedDuringHostDelay:true,explicitAdvanceMs:1});
  }finally{await context.close();}
  assert.equal(sourceHash(),before);for(const pin of pins)assert.equal(digest(pin.file),pin.sha256);
  const report={stage:'survey, no G-PIN',passed:true,generatedAt:new Date().toISOString(),node:process.version,playwright:'1.64.0',chromium:browser.version(),base:'1f6b29d41d05aa3ca9321ab737035a347973f13d',sourceHash:before,pins,observations,limits:['Demora finita impuesta en el retorno de install; no mide frecuencia de fallos naturales.','Los tres fallos preceden a inyectar la aplicación; no demuestran un fallo de producto.','El control de API no implementa una solución en los fixtures.']};
  writeFileSync(new URL('./survey.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
}finally{await browser.close();}
