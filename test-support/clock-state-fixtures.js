import {expect} from '@playwright/test';
import {readFileSync,existsSync} from 'node:fs';
import {buildInterface} from './interface-build.js';
import {mountUi} from './interface-browser.js';
import {buildDeleteBrowser,mountDeleteBrowser} from './delete-state-browser.js';

export const clockFixtures=['interfaz','guardado','borrado'];
export const clockTimes={interfaz:'2026-10-18T12:00:00Z',guardado:'2026-10-21T12:00:00Z',borrado:'2026-10-24T12:00:00Z'};
export const hostWait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let bundles;
export async function clockBundles(){
 if(!bundles)bundles=Promise.all([buildInterface(),buildInterface({entry:'test-support/save-state-entry.jsx'}),buildDeleteBrowser()]).then(values=>Object.fromEntries(clockFixtures.map((name,i)=>[name,values[i]])));
 return bundles;
}
async function saveMount(page,bundle){
 const source=readFileSync('change-tests/save-state.spec.js','utf8').replace(/\r\n/g,'\n'),start=source.indexOf('async function mount(page){'),end=source.indexOf('\ntest(',start);
 if(start<0||end<=start)throw Error('Ancla de montaje original de guardado ausente');
 // En el original no existe el helper: su cuerpo original no lo referencia.
 const candidate=existsSync(new URL('./paused-clock.js',import.meta.url))?await import('./paused-clock.js'):{};
 return new Function('expect','bundle','preparePausedClock','return ('+source.slice(start,end)+');')(expect,bundle,candidate.preparePausedClock)(page);
}
export async function observeClockMount(browser,fixture,{delayMs=0,failAt}={}){
 const context=await browser.newContext({timezoneId:'America/Bogota',viewport:{width:1280,height:900}}),page=await context.newPage();
 const state={fixture,delayMs,stage:'created',ready:false,scriptsInjected:0,clockCalls:[],beforeApp:null};
 const sentinel=Error('centinela de preparación 009');let error;
 for(const method of ['install','setFixedTime','pauseAt','setSystemTime']){
  const native=page.clock[method].bind(page.clock);
  page.clock[method]=async(...args)=>{state.stage='clock.'+method;state.clockCalls.push(method);if(failAt===state.stage)throw sentinel;const value=await native(...args);if(delayMs)await hostWait(delayMs);return value;};
 }
 const inject=page.addScriptTag.bind(page);
 page.addScriptTag=async options=>{state.stage='app.inject';if(failAt===state.stage)throw sentinel;state.beforeApp=await page.evaluate(()=>({date:Date.now(),performance:performance.now()}));const value=await inject(options);state.scriptsInjected++;return value;};
 try{
  const bundle=(await clockBundles())[fixture];
  if(fixture==='interfaz')await mountUi(page,bundle);
  else if(fixture==='guardado')await saveMount(page,bundle);
  else await mountDeleteBrowser(page,bundle);
  state.stage='ready';state.ready=true;
 }catch(reason){error=reason;}
 return {page,context,state,error,sentinel,close:()=>context.close()};
}
