import {preparePausedClock} from './paused-clock.js';
import {expect} from '@playwright/test';
import {buildHarness} from './build-harness.js';
export const buildDeleteBrowser=()=>buildHarness({capture:true});
export async function mountDeleteBrowser(page,bundle){
 await page.route('**/*',r=>r.abort());await page.route('https://sdd.invalid/',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0"><div id="root"></div></body></html>'}));
 await page.goto('https://sdd.invalid/');const time=new Date('2026-10-24T12:00:00Z');await preparePausedClock(page,time);
 await page.evaluate(()=>{globalThis.__sddFixture={};globalThis.__sddCapture=v=>globalThis.__delete008App=v;globalThis.prompt=()=> 'ELIMINAR';});await page.addScriptTag({content:bundle});await expect.poll(()=>page.evaluate(()=>__sddCommitted?.loaded)).toBe(true);
 if(page.viewportSize().width<=720)await page.getByRole('button',{name:'Tu cuenta',exact:true}).click();else await page.locator('button.ft-user').click();
 await page.getByRole('button',{name:'DATOS Y CONFIGURACIÓN',exact:true}).click();
 await page.evaluate(()=>{__sddFixture.onStorage=async kind=>{if(kind==='listPhotos')throw Error('secreto-backend-no-publicar-008');};});await page.getByRole('button',{name:'Eliminar todos mis datos',exact:true}).click();
}
