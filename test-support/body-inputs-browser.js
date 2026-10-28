import {expect} from '@playwright/test';
import {buildInterface} from './interface-build.js';
import {preparePausedClock} from './paused-clock.js';
export const bodyInputDate = '2026-10-18';
export const bodyInputFields = [
  ['peso','kg','Peso en kg','weights'],
  ...['cintura','cadera','pecho','brazo','muslo'].map(key=>['medidas',key,key,'measurements']),
  ['nota','sleep','Horas de sueño','wellness'],
  ['nota','restingHr','Pulso en reposo (ppm)','wellness'],
  ['nota','steps','Pasos','wellness'],
];
let bundle;
export async function withBodyInputs(browser, seed, run, viewport={width:1280,height:900}) {
  bundle ||= buildInterface({entry:'test-support/body-inputs-entry.jsx'});
  const context = await browser.newContext({viewport, timezoneId:'America/Bogota'});
  const page = await context.newPage(), errors=[];
  page.on('pageerror', error=>errors.push(error.message));
  try {
    await page.route('**/*', route=>route.abort());
    await page.route('https://sdd.invalid/',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0"><div id="root"></div></body></html>'}));
    await page.goto('https://sdd.invalid/');
    await preparePausedClock(page,new Date('2026-10-18T12:00:00Z'));
    await page.evaluate(seed=>{globalThis.__bodyInputsSeed=seed;globalThis.__sddFixture={};},seed);
    await page.addScriptTag({content:await bundle});
    await expect(page.getByRole('heading',{name:'Cuerpo',exact:true})).toBeVisible();
    const section=seed.section||'peso';
    const field = label => label==='Peso en kg' ? page.locator('input[inputmode=decimal]').first()
      : page.locator('.ft-field').filter({has:page.locator('label').filter({hasText:new RegExp('^'+label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')})}).locator('input');
    const h={page, errors, field,
      notes:()=>page.getByPlaceholder('Notas del día (dormí mal, viaje, enfermo…)'),
      async type(label,value){const input=field(label);await input.fill('');await input.pressSequentially(String(value));},
      async save(){if(section==='medidas')await page.locator('.ft-row button.ft-btn').click();else await page.getByRole('button',{name:section==='peso'?'Guardar pesaje':'Guardar bienestar',exact:true}).click();},
      snapshot:()=>page.evaluate(()=>({weights:__bodyInputs.weights,measurements:__bodyInputs.measurements,wellness:__bodyInputs.wellness,calls:[...__bodyInputs.calls]})),
      resetCalls:()=>page.evaluate(()=>{__bodyInputs.calls.length=0;}),
      replace:(key,records)=>page.evaluate(async({key,records})=>{await __bodyInputsAct(async()=>__bodyInputs.replace[key](records));},{key,records}),
    };
    await run(h);
    expect(errors,'El instrumental debe montar sin errores de página').toEqual([]);
  } finally { await context.close(); }
}
export function priorBodyRecord(section) {
  const base={id:'prior',date:bodyInputDate};
  return section==='peso'?{...base,kg:70}:section==='medidas'?{...base,cintura:80,cadera:90,pecho:null,brazo:null,muslo:null}:{...base,sleep:7,restingHr:60,steps:8000,energy:3,notes:'previo'};
}
