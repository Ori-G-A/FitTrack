import {test,expect} from '@playwright/test';
import {withBodyInputs,bodyInputDate as today} from '../test-support/body-inputs-browser.js';

test('cuerpo010 original conserva reemplazo e historiales',async({browser})=>{
 const historic=Array.from({length:10},(_,i)=>({id:'w'+i,date:'2026-10-'+String(i+1).padStart(2,'0'),kg:60+i}));
 await withBodyInputs(browser,{weights:[...historic,{id:'old',date:today,kg:70},{id:'dup',date:today,kg:71}]},async h=>{
  await h.type('Peso en kg','64,2');await h.page.getByRole('button',{name:'Subir 0,1 kg'}).click();await expect(h.field('Peso en kg')).toHaveValue('64,3');await h.save();
  const state=await h.snapshot();expect(state.calls).toEqual(['weights']);expect(state.weights).toHaveLength(11);expect(state.weights.filter(r=>r.date===today)).toHaveLength(1);expect(state.weights.at(-1)).toMatchObject({date:today,kg:64.3});expect(['old','dup']).not.toContain(state.weights.at(-1).id);expect(state.weights.slice(0,10)).toEqual(historic);expect(state.weights.map(r=>r.date)).toEqual(state.weights.map(r=>r.date).sort());await expect(h.field('Peso en kg')).toHaveValue('');
  await h.page.getByRole('button',{name:'Bajar 0,1 kg'}).click();await expect(h.field('Peso en kg')).toHaveValue('64,2');await h.page.getByRole('button',{name:'64,3',exact:true}).click();await expect(h.field('Peso en kg')).toHaveValue('64,3');
  await expect(h.page.locator('.ft-li')).toHaveCount(8);await h.page.clock.runFor(2000);await expect(h.page.locator('.recharts-line-dots circle')).toHaveCount(11);await h.page.locator('summary').first().click();await h.page.locator('.ft-trash').first().click();expect((await h.snapshot()).weights).toEqual(historic);
 });
 const measurements=Array.from({length:8},(_,i)=>({id:'m'+i,date:'2026-10-'+String(i+1).padStart(2,'0'),cintura:i===0?null:i===1?0:70+i}));
 await withBodyInputs(browser,{section:'medidas',measurements:[...measurements,{id:'old',date:today,cintura:80,unknown:1},{id:'dup',date:today,cintura:81}]},async h=>{
  await h.type('cintura','82.5');await h.save();const state=await h.snapshot();expect(state.calls).toEqual(['measurements']);expect(state.measurements).toHaveLength(9);expect(state.measurements.slice(0,8)).toEqual(measurements);expect(state.measurements.at(-1)).toMatchObject({date:today,cintura:82.5,cadera:null,pecho:null,brazo:null,muslo:null});expect(state.measurements.at(-1).unknown).toBeUndefined();expect(['old','dup']).not.toContain(state.measurements.at(-1).id);await expect(h.field('cintura')).toHaveValue('');await expect(h.page.locator('.ft-li')).toHaveCount(6);await h.page.clock.runFor(2000);await expect(h.page.locator('.recharts-line-dots circle')).toHaveCount(8);await h.page.locator('summary').first().click();await h.page.locator('.ft-trash').first().click();expect((await h.snapshot()).measurements).toEqual(measurements);
 });
});

test('cuerpo010 original conserva bienestar y vacios',async({browser})=>{
 for(const section of ['peso','medidas','nota'])await withBodyInputs(browser,{section},async h=>{if(section==='peso')await expect(h.page.getByRole('button',{name:'Guardar pesaje',exact:true})).toBeDisabled();else await h.save();expect((await h.snapshot()).calls).toEqual([]);});
 const historic=Array.from({length:8},(_,i)=>({id:'n'+i,date:'2026-10-'+String(i+1).padStart(2,'0'),sleep:0,steps:0,energy:0,notes:''}));
 await withBodyInputs(browser,{section:'nota',wellness:[...historic,{id:'old',date:today,sleep:7,notes:'original'}]},async h=>{
  await expect(h.field('Horas de sueño')).toHaveValue('7');await h.notes().fill('borrador');await h.replace('wellness',[...historic,{id:'changed',date:today,sleep:9,notes:'externo'}]);await expect(h.notes()).toHaveValue('borrador');await h.page.locator('input[type=date]').fill('2026-10-17');await expect(h.notes()).toHaveValue('');await h.page.locator('input[type=date]').fill(today);await expect(h.notes()).toHaveValue('externo');
  await h.field('Horas de sueño').fill('');await h.notes().fill('  nota sola  ');await h.resetCalls();await h.save();let state=await h.snapshot();expect(state.calls).toEqual(['wellness']);expect(state.wellness.at(-1)).toMatchObject({date:today,sleep:null,restingHr:null,steps:null,energy:null,notes:'nota sola'});expect(state.wellness.at(-1).id).not.toBe('changed');expect(state.wellness.slice(0,8)).toEqual(historic);await expect(h.notes()).toHaveValue('  nota sola  ');
  await h.notes().fill('');await h.page.getByRole('button',{name:'3',exact:true}).click();await h.resetCalls();await h.save();state=await h.snapshot();expect(state.calls).toEqual(['wellness']);expect(state.wellness.at(-1)).toMatchObject({sleep:null,steps:null,restingHr:null,energy:3,notes:''});await expect(h.page.locator('.ft-li')).toHaveCount(6);await expect(h.page.locator('.ft-li button')).toHaveCount(0);
 });
});
