import {test,expect} from '@playwright/test';
import {buildInterface} from '../test-support/interface-build.js';
import {mountUi,today} from '../test-support/interface-browser.js';
test.use({timezoneId:'America/Bogota'});let bundle;
test.beforeAll(async()=>bundle=await buildInterface());

async function checkCycle(page,opener,name){
 await opener.click();const dialog=page.getByRole('dialog',{name,exact:true});
 await expect(dialog,'el overlay debe exponer un diálogo con nombre').toBeVisible();
 await expect.poll(()=>dialog.evaluate(el=>el.contains(document.activeElement)),{message:'el foco inicial debe entrar al diálogo'}).toBe(true);
 const first=dialog.getByRole('button').first(),last=dialog.getByRole('button').last();await first.focus();await page.keyboard.press('Shift+Tab');await expect(last).toBeFocused();await page.keyboard.press('Tab');await expect(first).toBeFocused();await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(opener).toBeFocused();
 await opener.click();await page.locator('.ft-sheet-panel').click({position:{x:100,y:12}});await expect(dialog).toBeVisible();await dialog.getByRole('button',{name:'Cerrar',exact:true}).click();await expect(opener).toBeFocused();await opener.click();await page.locator('.ft-sheet').click({position:{x:2,y:2}});await expect(dialog).toHaveCount(0);await expect(opener).toBeFocused();
}
test('interfaz cambio Registrar teclado y foco',async({page})=>{
 await mountUi(page,bundle);const opener=page.locator('.ft-nav-add');await checkCycle(page,opener,'Registrar');
 await opener.click();await page.locator('.ft-sheet-row').filter({hasText:'báscula del día'}).click();await expect(page.getByRole('heading',{name:'Cuerpo',exact:true})).toBeVisible();await expect(page.locator('input[type=date]').first()).toHaveValue(today);await expect(page.locator('.ft-sheet')).toHaveCount(0);
 await opener.click();await page.setViewportSize({width:390,height:900});await page.keyboard.press('Escape');await expect(page.locator('.ft-sheet')).toHaveCount(0);expect(await opener.evaluate(el=>document.activeElement===el)).toBe(false);
});
test('interfaz cambio DetailSheet teclado y foco',async({page})=>{
 await mountUi(page,bundle,{mode:'detail'});await page.getByRole('button',{name:'Cerrar',exact:true}).click();const opener=page.locator('#detail-trigger');await checkCycle(page,opener,'Desglose sintético');
 await page.addStyleTag({content:'.ft-sheet button{display:none !important;}'});await opener.click();const dialog=page.getByRole('dialog',{name:'Desglose sintético'});await expect(dialog).toBeFocused();await page.keyboard.press('Tab');await expect(dialog).toBeFocused();await opener.evaluate(el=>el.remove());await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);expect(await page.evaluate(()=>document.activeElement.isConnected)).toBe(true);
});
test('interfaz cambio campo Peso en kg',async({page})=>{
 await mountUi(page,bundle,{mode:'body'});const field=page.getByLabel('Peso en kg',{exact:true});await expect(field,'el input de peso debe tener nombre accesible inequívoco').toHaveCount(1);await field.focus();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.type('64,2');await page.getByRole('button',{name:'Guardar pesaje',exact:true}).click();expect(await page.evaluate(()=>__interfaceState.weights.find(w=>w.date==='2026-10-18').kg)).toBe(64.2);
});
for(const [name,type]of [['Correo electrónico','email'],['Contraseña','password']])test('interfaz cambio campo '+name,async({page})=>{
 await mountUi(page,bundle,{mode:'auth'});const field=page.getByLabel(name,{exact:true});await expect(field,'el input '+name+' debe tener nombre accesible inequívoco').toHaveCount(1);await page.evaluate(()=>{__interfaceFixture.onAuthenticate=(mode,credentials)=>{__interfaceFixture.submitted={mode,credentials};return {error:null};};});await field.focus();await page.keyboard.type(type==='email'?'ana@example.test':'clave-sintetica-006');await page.locator('input[type='+ (type==='email'?'password':'email')+']').fill(type==='email'?'clave-sintetica-006':'ana@example.test');await page.locator('input[type=password]').press('Enter');await expect.poll(()=>page.evaluate(()=>__interfaceFixture.submitted?.mode)).toBe('login');expect(await page.evaluate(()=>__interfaceFixture.submitted.credentials)).toEqual({email:'ana@example.test',password:'clave-sintetica-006'});
});
