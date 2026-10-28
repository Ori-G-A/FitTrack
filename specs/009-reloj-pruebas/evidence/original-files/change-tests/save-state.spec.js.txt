import {test,expect} from '@playwright/test';
import {buildInterface} from '../test-support/interface-build.js';
let bundle;test.beforeAll(async()=>{bundle=await buildInterface({entry:'test-support/save-state-entry.jsx'});});
async function mount(page){
 await page.route('**/*',r=>r.abort());await page.route('https://sdd.invalid/',r=>r.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));await page.goto('https://sdd.invalid/');await page.clock.install({time:new Date('2026-10-21T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-21T12:00:00Z'));
 await page.evaluate(()=>{globalThis.__interfaceView={mode:'app'};globalThis.__sddFixture={};});await page.addScriptTag({content:bundle});await expect.poll(()=>page.evaluate(()=>__interfaceApp?.loaded)).toBe(true);await page.clock.runFor(600);await expect.poll(()=>page.evaluate(()=>__sddFixture.writes.length)).toBe(12);
 await page.evaluate(async()=>{__sddFixture.onWrite=async p=>({error:p.key==='weights'?{message:'fallo sintético peso'}:null});await __save007.saveKey('sdd-user-001','weights',[]);});
}
test('guardado007 navegador error visible en movil y escritorio',async({page})=>{
 await mount(page);for(const width of [390,1280]){await page.setViewportSize({width,height:900});const error=page.getByText('Error al guardar',{exact:true});await expect(error,'FR-009: texto de error visible fuera del rail oculto').toBeVisible();const box=await error.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(900);const cut=await error.evaluate(el=>{const r=el.getBoundingClientRect();for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),b=p.getBoundingClientRect();if(['hidden','clip'].includes(s.overflowX)&&r.right>b.right+1)return true;}return false;});expect(cut).toBe(false);}
});
test('guardado007 navegador estado accesible y sin exito falso',async({page})=>{
 await mount(page);await page.evaluate(()=>__save007.saveKey('sdd-user-001','goals',{}));const status=page.getByRole('status');await expect(status,'FR-009: una región accesible conserva el fallo tras otra clave').toHaveCount(1);await expect(status).toHaveText('Error al guardar');await expect(page.getByText('Guardado',{exact:true})).toHaveCount(0);
 await page.evaluate(()=>document.querySelector('.ft-root').classList.add('ft-focus'));await expect(status).toBeHidden();await page.evaluate(()=>document.querySelector('.ft-root').classList.remove('ft-focus'));await expect(status).toBeVisible();
 await page.evaluate(async()=>{__sddFixture.onWrite=async()=>({error:null});await __save007.saveKey('sdd-user-001','weights',[]);});await expect(status).toHaveText('Guardado');
});
