import {test,expect} from '@playwright/test';
import {buildHarness} from '../test-support/build-harness.js';
import {food,paceWeights,paceGoals} from '../test-support/nutrition-fixtures.js';
let bundle;
test.beforeAll(async()=>{bundle=await buildHarness();});
test.beforeEach(async({page})=>{
 await page.route('**/*',r=>r.abort());await page.clock.install({time:new Date('2026-10-18T12:00:00Z')});await page.setContent('<div id="root"></div>');
 await page.evaluate(seed=>{globalThis.__sddFixture={data:seed};},{foods:[food],weights:paceWeights(),goals:{...paceGoals,autoMacros:false,sex:'hombre',startWeight:'60'}});
 await page.addScriptTag({content:bundle});await expect(page.locator('button.ft-user')).toBeVisible();
});
async function nutrition(page){await page.locator('.ft-nav-add').click();await page.locator('.ft-sheet-row').filter({hasText:'Comida'}).click();}
async function persisted(page){await page.clock.runFor(700);}
test('nutricion navegador registrar cantidades y corregir dia',async({page})=>{
 await nutrition(page);await page.getByRole('button',{name:'Añadir comida',exact:true}).click();await page.getByRole('button',{name:/Leche por 100 ml/}).click();
 await page.getByLabel('Cantidad en ml').fill('25,5');await page.getByRole('button',{name:'CENA',exact:true}).click();await page.getByLabel('Cantidad en ml').press('Enter');await persisted(page);
 const saved=await page.evaluate(()=>__sddFixture.data.nutrition[0]);expect(saved).toMatchObject({name:'Leche',date:'2026-10-18',grams:25.5,unit:'ml',kcal:15.6,protein:.8,meal:'Cena'});
 await page.getByRole('button',{name:'Añadir comida',exact:true}).click();await page.getByRole('button',{name:'BUSCAR',exact:true}).click();await page.getByLabel('Buscar qué registrar').fill('brócoli');await page.locator('button.ft-dc-row').click();await page.getByLabel('Cantidad en g').fill('100');await page.locator('.ft-dc-cta').click();await persisted(page);
 expect(await page.evaluate(()=>__sddFixture.data.nutrition.length)).toBe(2);
 await page.getByLabel('Día anterior').click();await expect(page.getByText('Sin comidas registradas ese día.')).toBeVisible();await page.getByLabel('Día siguiente').click();
 await page.getByRole('button',{name:'QUITAR',exact:true}).first().click();await persisted(page);expect(await page.evaluate(()=>__sddFixture.data.nutrition.length)).toBe(1);
});
test('nutricion navegador biblioteca recetas y snapshots',async({page})=>{
 await page.locator('.ft-nav button[title="Biblioteca"]').click();await page.getByRole('button',{name:'Nuevo alimento',exact:true}).click();await page.getByPlaceholder('Ej. Pechuga de pollo (cruda)').fill('Avena SDD');
 const nums=page.locator('.ft-lib-nums input');for(const [i,v]of ['100','10','20','5'].entries())await nums.nth(i).fill(v);
 await page.getByRole('button',{name:'Añadir a mi biblioteca',exact:true}).click();await persisted(page);
 const id=await page.evaluate(()=>__sddFixture.data.foods.find(f=>f.name==='Avena SDD').id);
 await page.getByRole('button',{name:/^RECETAS /}).click();await page.getByRole('button',{name:'Nueva receta',exact:true}).click();await page.getByPlaceholder('Ej. Bowl de yogur griego').fill('Bowl SDD');await page.locator('.ft-lib-field input[type=number]').fill('2');
 await page.locator('.ft-lib-add select').selectOption(id);await page.locator('.ft-lib-add input').fill('150');await page.locator('.ft-lib-add').getByRole('button',{name:'Añadir',exact:true}).click();await page.getByRole('button',{name:'Guardar receta',exact:true}).click();await persisted(page);
 const before=await page.evaluate(()=>__sddFixture.data.recipes[0]);expect(before.servings).toBe(2);expect(before.items[0]).toMatchObject({grams:150,kcal:150,protein:15});
 await page.getByRole('button',{name:/^ALIMENTOS /}).click();await page.locator('.ft-lib-list .ft-dc-row').filter({hasText:'Avena SDD'}).click();await page.locator('.ft-lib-nums input').first().fill('900');await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();await persisted(page);expect(await page.evaluate(()=>__sddFixture.data.recipes[0])).toEqual(before);
 await nutrition(page);await page.getByRole('button',{name:'Añadir comida',exact:true}).click();await page.getByRole('button',{name:'RECETAS',exact:true}).click();await page.locator('button.ft-dc-row').filter({hasText:'Bowl SDD'}).click();await page.getByLabel('Porciones').fill('1.5');await page.locator('.ft-dc-cta').click();await persisted(page);expect(await page.evaluate(()=>__sddFixture.data.nutrition[0])).toMatchObject({name:'Bowl SDD',grams:null,kcal:112.5});
 await page.locator('.ft-nav button[title="Biblioteca"]').click();await page.locator('.ft-lib-list .ft-dc-row').filter({hasText:'Avena SDD'}).click();await page.getByRole('button',{name:'Eliminar',exact:true}).click();await persisted(page);expect(await page.evaluate(()=>__sddFixture.data.foods.some(f=>f.name==='Avena SDD'))).toBe(false);expect(await page.evaluate(()=>__sddFixture.data.recipes[0])).toEqual(before);
});
test('nutricion navegador objetivos automaticos y aviso',async({page})=>{
 await page.locator('button.ft-user').click();await page.getByText('Calcular calorías y proteína automáticamente desde mi peso',{exact:true}).click();await persisted(page);expect(await page.evaluate(()=>__sddFixture.data.goals.kcalTarget)).toBe(1480);
 await page.locator('.ft-field').filter({has:page.locator('label').filter({hasText:'Peso inicial (kg)'})}).locator('input').fill('70');await persisted(page);expect(await page.evaluate(()=>__sddFixture.data.goals.kcalTarget)).toBe(1800);
 await page.getByRole('button',{name:'DATOS Y CONFIGURACIÓN',exact:true}).click();await expect(page.getByRole('button',{name:'Exportar copia ahora'})).toBeVisible();
 await page.locator('.ft-nav button[title="Diario"]').click();await page.getByRole('button',{name:/Subir a 2100 kcal/}).click();await persisted(page);expect(await page.evaluate(()=>__sddFixture.data.goals)).toMatchObject({kcalTarget:2100,autoMacros:false,paceCheckedAt:'2026-10-18'});
 await page.getByRole('button',{name:'DESHACER',exact:true}).click();await persisted(page);expect(await page.evaluate(()=>__sddFixture.data.goals)).toMatchObject({kcalTarget:1800,autoMacros:true,paceCheckedAt:''});
 await page.getByRole('button',{name:'Descartar',exact:true}).click();await persisted(page);expect(await page.evaluate(()=>__sddFixture.data.goals.paceCheckedAt)).toBe('2026-10-18');await page.getByRole('button',{name:/Aviso descartado.*DESHACER/}).click();await persisted(page);expect(await page.evaluate(()=>__sddFixture.data.goals.paceCheckedAt)).toBe('');
});
