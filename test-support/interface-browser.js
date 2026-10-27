import {preparePausedClock} from './paused-clock.js';
import {expect} from '@playwright/test';
import {DEFAULT_GOALS} from '../src/app-config.js';
export const today='2026-10-18';
export const uiSeed={goals:{...DEFAULT_GOALS,sex:'hombre',autoMacros:false},weights:[{id:'w',date:today,kg:70},{id:'old',date:'2026-10-17',kg:69}],nutrition:[{id:'n',date:today,name:'Avena',kcal:200,protein:8,carbs:30,fat:4}],wellness:[{id:'s',date:today,sleep:7,steps:8000}],measurements:[{id:'m',date:today,cintura:80}],workouts:[{id:'t',date:today,exercises:[{id:'e',name:'Remo',primary:'Espalda',sets:[{id:'set',reps:8,kg:20,rpe:8}]}]}]};
export async function mountUi(page,bundle,{seed=uiSeed,mode='app',view={},fixture={},pref,gate=false}={}) {
 await page.route('**/*',r=>r.abort());
 await page.route('https://sdd.invalid/',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0"><div id="root"></div></body></html>'}));
 await page.goto('https://sdd.invalid/');await preparePausedClock(page,new Date('2026-10-18T12:00:00Z'));
 // FR-024: runFor mide el plazo desde la petición, sin sumar tiempo entre acciones.
 await page.evaluate(({seed,mode,view,fixture,pref,gate})=>{globalThis.__interfaceSeed=seed;globalThis.__interfaceView={mode,...view};globalThis.__sddFixture={data:seed,...fixture};if(pref)localStorage.setItem('ft-theme',pref);if(gate)globalThis.__interfaceLazyGate=new Promise(r=>globalThis.__releaseInterfaceLazy=r);},{seed,mode,view,fixture,pref,gate});
 await page.addScriptTag({content:bundle});
 if(mode==='app')await expect.poll(()=>page.evaluate(()=>__interfaceApp?.loaded)).toBe(true);
 else await expect.poll(()=>page.evaluate(()=>Boolean(globalThis.__interfaceState))).toBe(true);
}
export async function go(page,tab,date=null){await page.evaluate(({tab,date})=>__interfaceApp.goTo(tab,date),{tab,date});}
