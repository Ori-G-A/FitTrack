import {test,expect} from '@playwright/test';
import {withBodyInputs,bodyInputFields,priorBodyRecord,bodyInputDate} from '../test-support/body-inputs-browser.js';

test('cuerpo010 coma y punto recorren nueve campos',async({browser})=>{
 for(const [section,key,label,collection]of bodyInputFields)for(const text of ['65,4','65.4'])await withBodyInputs(browser,{section},async h=>{
  await h.type(label,text);expect(await h.field(label).inputValue(),'FR-010: la entrada decimal debe conservarse antes de validar').toBe(text);await h.save();const state=await h.snapshot();expect(state.calls).toEqual([collection]);expect(state[collection][0][key]).toBe(65.4);
 });
});

test('cuerpo010 sintaxis y fronteras rechazan sin reemplazar',async({browser})=>{
 const cases=bodyInputFields.flatMap(field=>[[field,'-1'],...(['sleep','steps'].includes(field[1])?[]:[[field,'0']])]);
 for(const text of ['x','1e2','0x10','1,2.3','1 000','NaN','Infinity','-Infinity'])cases.push([bodyInputFields[0],text]);
 for(const [[section,key,label,collection],text]of cases){const original=priorBodyRecord(section);await withBodyInputs(browser,{section,[collection]:[original]},async h=>{
  await h.type(label,text);await h.save();const state=await h.snapshot();expect.soft(state.calls,`FR-005/006/007: ${key}=${text} no debe escribir`).toEqual([]);expect.soft(state[collection],`FR-007: conservar el registro previo ${key}=${text}`).toEqual([original]);expect.soft(await h.page.getByRole('status').count(),'FR-007: no emitir éxito').toBe(0);
 });}
});

test('cuerpo010 mezcla invalida conserva borrador sin exito',async({browser})=>{
 for(const section of ['medidas','nota']){const collection=section==='medidas'?'measurements':'wellness',original=priorBodyRecord(section);await withBodyInputs(browser,{section,[collection]:[original]},async h=>{
  const inputs=section==='medidas'?[['cintura','72.5'],['cadera','-1']]:[['Horas de sueño','7.5'],['Pulso en reposo (ppm)','-1'],['Pasos','8000']];
  for(const [label,text]of inputs)await h.type(label,text);if(section==='nota'){await h.notes().fill('  conservar nota  ');await h.page.getByRole('button',{name:'4',exact:true}).click();}
  await h.save();const state=await h.snapshot();expect.soft(state.calls,'FR-007: rechazo completo, sin setter').toEqual([]);expect.soft(state[collection]).toEqual([original]);for(const [label,text]of inputs)expect.soft(await h.field(label).inputValue(),'FR-007: conservar borrador').toBe(text);if(section==='nota')await expect(h.notes()).toHaveValue('  conservar nota  ');expect.soft(await h.page.getByRole('status').count(),'FR-007: ningún éxito local').toBe(0);
 });}
});

test('cuerpo010 errores asocian campos en movil y escritorio',async({browser})=>{
 for(const viewport of [{width:390,height:844},{width:1280,height:900}])for(const section of ['peso','medidas','nota'])await withBodyInputs(browser,{section},async h=>{
  const fields=bodyInputFields.filter(f=>f[0]===section);for(const [, ,label]of fields)await h.type(label,'-1');await h.save();
  const alerts=h.page.getByRole('alert');expect.soft(await alerts.count(),'FR-008: error anunciado y visible por formulario').toBe(1);
  if(await alerts.count()){await expect(alerts).toBeVisible();const text=await alerts.innerText();for(const [,,label]of fields)expect.soft(text.toLowerCase(),'FR-008: identificar campo').toContain(label.toLowerCase());}
  for(const [,,label]of fields){const input=h.field(label);expect.soft(await h.page.getByLabel(label,{exact:true}).count(),'FR-008: nombre accesible '+label).toBe(1);expect.soft(await input.getAttribute('aria-invalid'),'FR-008: estado inválido '+label).toBe('true');const ids=(await input.getAttribute('aria-describedby')||'').trim().split(/\s+/).filter(Boolean);expect.soft(ids.length,'FR-008: explicación asociada '+label).toBeGreaterThan(0);for(const id of ids){const description=h.page.locator('[id='+JSON.stringify(id)+']');expect.soft(await description.count()).toBe(1);if(await description.count())expect.soft((await description.innerText()).toLowerCase()).toContain(label.toLowerCase());}}
  expect.soft(await h.page.getByRole('button',{name:section==='peso'?'Guardar pesaje':section==='medidas'?'Guardar medidas':'Guardar bienestar',exact:true}).count(),'FR-008: acción con nombre').toBe(1);
  expect.soft(await h.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'FR-008: formulario utilizable sin desbordamiento horizontal').toBe(true);
 },viewport);
});

test('cuerpo010 corregir permite un unico guardado',async({browser})=>{
 for(const [section,key,label,collection]of [bodyInputFields[0],bodyInputFields[1],bodyInputFields[6]])await withBodyInputs(browser,{section,[collection]:[priorBodyRecord(section)]},async h=>{
  await h.type(label,'-1');await h.save();expect((await h.snapshot()).calls,'FR-009: el intento inválido debe conservarse para corregir').toEqual([]);await expect(h.page.getByRole('alert'),'FR-009: error previo a la corrección').toBeVisible();await expect(h.field(label)).toHaveValue('-1');await h.type(label,'65.4');await h.save();const state=await h.snapshot();expect(state.calls,'FR-009: una única actualización válida').toEqual([collection]);expect(state[collection].filter(r=>r.date===bodyInputDate)).toHaveLength(1);expect(state[collection][0][key]).toBe(65.4);await expect(h.page.getByRole('alert')).toHaveCount(0);await expect(h.field(label)).toHaveValue(section==='nota'?'65.4':'');await expect(h.page.getByRole('status')).toBeVisible();
 });
});

test('cuerpo010 espacios y ceros conservan ausencia y precision',async({browser})=>{
 await withBodyInputs(browser,{section:'peso'},async h=>{await h.type('Peso en kg',' +65.25 ');await h.save();expect((await h.snapshot()).weights[0].kg).toBe(65.25);});
 await withBodyInputs(browser,{section:'medidas'},async h=>{await h.type('cintura','72.25');await h.type('cadera','   ');await h.save();expect((await h.snapshot()).measurements[0]).toMatchObject({cintura:72.25,cadera:null,pecho:null,brazo:null,muslo:null});});
 await withBodyInputs(browser,{section:'nota'},async h=>{await h.type('Horas de sueño',' 0 ');await h.type('Pasos','0');await h.type('Pulso en reposo (ppm)','60.5');await h.save();expect((await h.snapshot()).wellness[0]).toMatchObject({sleep:0,steps:0,restingHr:60.5});await h.type('Pasos','2.5');await h.save();expect((await h.snapshot()).wellness[0].steps).toBe(2.5);});
 await withBodyInputs(browser,{section:'nota'},async h=>{await h.type('Pasos','1000000000000000000000');await h.notes().fill('número finito');await h.save();expect((await h.snapshot()).wellness[0].steps).toBe(1e21);});
});
