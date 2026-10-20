import {test,expect} from '@playwright/test';
import {buildInterface} from '../test-support/interface-build.js';
import {mountUi,go} from '../test-support/interface-browser.js';
// Propuesta FR-024: únicamente prueba roja; no autoriza cambiar producto.
test.use({timezoneId:'America/Bogota'});let bundle;
test.beforeAll(async()=>{
 const audit=`{const set=window.setTimeout.bind(window),clear=window.clearTimeout.bind(window);globalThis.__highlightTimers=new Map();window.setTimeout=(fn,ms,...args)=>{let id;id=set(()=>{if(__highlightTimers.has(id))__highlightTimers.get(id).state='fired';fn(...args);},ms);if(ms===2200)__highlightTimers.set(id,{state:'active'});return id;};window.clearTimeout=id=>{if(__highlightTimers.has(id))__highlightTimers.get(id).state='cleared';clear(id);};}\n`;
 bundle=audit+await buildInterface();
});
test('interfaz cambio resaltado temporal tras consumo de focusCard',async({page})=>{
 await mountUi(page,bundle);await go(page,'dashboard');await expect(page.locator('#card-peso')).toBeVisible();await page.evaluate(()=>__interfaceApp.openCard('peso'));
 await expect(page.locator('#card-peso')).toHaveClass(/ft-dc-focus/);await expect.poll(()=>page.evaluate(()=>__interfaceApp.focusCard)).toBe(null);
 await page.clock.runFor(2199);await expect(page.locator('#card-peso')).toHaveClass(/ft-dc-focus/);await page.clock.runFor(1);
 await expect(page.locator('#card-peso'),'FR-024: consumir focusCard no debe dejar el resaltado permanente').not.toHaveClass(/ft-dc-focus/);
});
test('interfaz cambio resaltado reemplazo y desmontaje',async({page})=>{
 await mountUi(page,bundle);await go(page,'dashboard');await expect(page.locator('#card-peso')).toBeVisible();await page.evaluate(()=>__interfaceApp.openCard('peso'));await expect(page.locator('#card-peso')).toHaveClass(/ft-dc-focus/);await page.clock.runFor(1000);
 await page.evaluate(()=>__interfaceApp.openCard('macros'));await expect(page.locator('#card-macros')).toHaveClass(/ft-dc-focus/);
 await expect(page.locator('#card-peso'),'FR-024: una nueva tarjeta debe retirar el resaltado anterior').not.toHaveClass(/ft-dc-focus/);
 await page.clock.runFor(2199);await expect(page.locator('#card-macros')).toHaveClass(/ft-dc-focus/);await page.clock.runFor(1);await expect(page.locator('#card-macros')).not.toHaveClass(/ft-dc-focus/);
 await page.evaluate(()=>__interfaceApp.openCard('macros'));await expect(page.locator('#card-macros')).toHaveClass(/ft-dc-focus/);await page.evaluate(()=>globalThis.__previousCard=document.querySelector('#card-macros'));await go(page,'diario');await expect(page.getByRole('heading',{name:'Diario',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>__previousCard.classList.contains('ft-dc-focus'))).toBe(false);expect(await page.evaluate(()=>[...__highlightTimers.values()].filter(v=>v.state==='active').length)).toBe(0);await page.clock.runFor(5000);await go(page,'dashboard');await expect(page.locator('#card-macros')).not.toHaveClass(/ft-dc-focus/);
});
