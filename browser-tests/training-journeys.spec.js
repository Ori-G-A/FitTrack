import {test,expect} from '@playwright/test';
import {buildHarness} from '../test-support/build-harness.js';
let bundle;
test.beforeAll(async()=>{bundle=await buildHarness();});
test.beforeEach(async({page})=>{
 await page.route('**/*',route=>route.abort());
 await page.clock.install({time:new Date('2026-10-15T12:00:00Z')});
 await page.setContent('<div id="root"></div>');
 await page.evaluate(()=>{globalThis.__sddFixture={data:{goals:{sex:'hombre'},routines:[{id:'routine',name:'Rutina SDD',exercises:[{name:'Press banca',primary:'Pecho',targetSets:2,targetReps:'8',targetRpe:'7–8'}]}]}};});
 await page.addScriptTag({content:bundle});
 await expect(page.locator('button.ft-user')).toBeVisible();
});
async function train(page){await page.locator('.ft-nav-add').click();await page.getByRole('button',{name:'Entreno series y RPE'}).click();}
test('entrenamiento navegador registrar y corregir serie',async({page})=>{
 await train(page);await page.getByLabel('Cargar una rutina completa').selectOption('0');
 await page.getByRole('button',{name:'Empezar sesión',exact:true}).click();
 await page.getByRole('button',{name:'Subir KG',exact:true}).click();
 await page.getByRole('button',{name:'Registrar serie 1',exact:true}).click();
 await page.clock.runFor(700);
 await expect.poll(()=>page.evaluate(()=>__sddFixture.data.workouts?.[0]?.exercises[0].sets[0].kg)).toBe('2.5');
 await page.locator('.ft-dc-row').filter({hasText:'8 reps · 2,5 kg'}).click();
 await page.getByRole('button',{name:'Subir REPS',exact:true}).click();await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();
 await page.clock.runFor(700);
 expect(await page.evaluate(()=>__sddFixture.data.workouts[0].exercises[0].sets[0].reps)).toBe('9');
 await page.getByRole('button',{name:'Salir',exact:true}).click();await expect(page.locator('.ft-root')).not.toHaveClass(/ft-focus/);
});
test('entrenamiento navegador timer y duracion',async({page})=>{
 await train(page);await page.getByRole('button',{name:'Empezar',exact:true}).click();
 await page.clock.runFor(90000);await page.getByRole('button',{name:'Pausar',exact:true}).click();
 await page.getByRole('button',{name:'Guardar (+2 min)',exact:true}).click();await page.clock.runFor(700);
 expect(await page.evaluate(()=>__sddFixture.data.workouts[0].durationMin)).toBe(2);
 await page.getByLabel('Minutos de la sesión (editar a mano)').fill('7');
 await page.clock.runFor(1800);
 expect(await page.evaluate(()=>__sddFixture.data.workouts[0].durationMin)).toBe(7);
 expect(await page.evaluate(()=>__sddFixture.data.timer)).toEqual({running:false,startedAt:null,baseSec:0});
});
test('entrenamiento navegador biblioteca y plan',async({page})=>{
 await page.locator('.ft-nav button[title="Biblioteca"]').click();
 await page.getByRole('button',{name:/^RUTINAS /}).click();
 await page.getByRole('button',{name:'Nueva rutina',exact:true}).click();
 await page.getByPlaceholder('Ej. Día A · Empuje').fill('Nueva SDD');
 await page.getByPlaceholder('O escríbelo').fill('Remo');
 await page.getByRole('button',{name:'Añadir',exact:true}).last().click();
 await page.getByRole('button',{name:'Guardar rutina',exact:true}).click();
 await page.clock.runFor(700);
 const id=await page.evaluate(()=>__sddFixture.data.routines.find(r=>r.name==='Nueva SDD').id);
 await page.locator('.ft-nav button[title="Plan"]').click();
 await page.getByRole('button',{name:'Editar',exact:true}).click();
 await page.locator('.ft-dc-card select').selectOption(id);await page.clock.runFor(700);
 expect(await page.evaluate(id=>__sddFixture.data.routines.find(r=>r.id===id).suggestedDay,id)).toBe(4);
 await expect(page.locator('.ft-plan-week button.sel')).toContainText('NUEVA');
});
