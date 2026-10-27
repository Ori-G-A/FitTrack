import {test,expect} from '@playwright/test';
import {buildDeleteBrowser,mountDeleteBrowser} from '../test-support/delete-state-browser.js';
let bundle;test.beforeAll(async()=>{bundle=await buildDeleteBrowser();});
test('borrado008 navegador fallo persiste visible y accesible',async({page})=>{
 const failures=[];
 for(const width of [390,1280])try{await test.step(String(width),async()=>{
  await page.setViewportSize({width,height:900});await mountDeleteBrowser(page,bundle);
  const alert=page.getByRole('alert');await expect(alert,'FR-006: fallo visible y accesible tras desmontar Ajustes').toBeVisible();await expect(alert).toContainText(/borrado/i);await expect(page.getByText('secreto-backend-no-publicar-008',{exact:false})).toHaveCount(0);
  const button=page.getByRole('button',{name:'Recargar datos',exact:true});await expect(button).toBeVisible();await expect(button).toBeEnabled();for(const element of [alert,button]){const box=await element.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(900);}
  await button.focus();await expect(button).toBeFocused();await button.press('Enter');await expect.poll(()=>page.evaluate(()=>__sddFixture.reads.length)).toBeGreaterThan(12);
 });}catch(error){failures.push(error);}
 if(failures.length)throw new AggregateError(failures,'FR-006: feedback accesible pendiente en '+failures.length+' anchos');
});
