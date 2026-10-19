import {readFile} from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo ciclo conserva guia insights provisionalidad y textos",async()=>{
const h=await mountBody();try{const c=h.modules.cycle;const logs=[{date:today,bleedingLevel:'heavy',crampsLevel:5,cervicalFluid:'watery',breastSensitivity:3}],well=[{date:today,energy:2,sleep:5}];const g=c.dailyGuidance({date:today,menstrualLogs:logs,wellness:well});assert.equal(g.phase,'menstruation');assert.equal(g.provisional,true);assert.equal(g.notes.length,6);assert.match(g.notes[0],/^Registraste sangrado claro/);assert.match(g.notes[1],/^Colicos 5/);assert.match(g.notes[2],/^Flujo acuoso/);assert.match(g.notes[3],/^Sintomas acumulados/);assert.match(g.notes[4],/^Energia 2/);assert.match(g.notes[5],/^Menos de 6/);assert.equal(c.dailyGuidance({periods}).provisional,false);for(const x of [0,3])assert.equal(c.dailyGuidance({date:today,wellness:[{date:today,energy:x,sleep:6}]}).notes.length,0);
 assert.equal(c.getCycleInsights({periods:periods.slice(0,2)})[0].type,'exploratory');assert.equal(c.getCycleInsights({periods})[0].type,'phase_context');
 for(const count of [1,2,4,5]){const wellness=Array.from({length:count},(_,i)=>({date:h.modules.app.addDays('2026-09-23',i),energy:3}));const out=c.getCycleInsights({periods,wellness,startDate:'2026-09-23',endDate:'2026-09-27'});if(count===1)assert.equal(out[0].type,'phase_context');else{assert.equal(out[0].confidence,count>=5?'medium':'low');assert.match(out[0].message,/energia promedio 3.0/);}}
 const outside=[{date:'2026-01-01',sleep:5},{date:'2026-01-02',sleep:5}];const out=c.getCycleInsights({periods,wellness:outside,menstrualLogs:outside.map(x=>({date:x.date,crampsLevel:2})),startDate:today,endDate:today});assert.equal(out[0].type,'sleep_and_symptoms');assert.equal(Object.keys(c.PHASE_GUIDANCE).length,9);
const golden=JSON.parse(await readFile('test-support/body-golden.json','utf8'));assert.deepEqual(plain(c.PHASE_GUIDANCE),golden.guidance);assert.deepEqual(plain(c.dailyGuidance(golden.guideInput)),golden.guideExpected);
assert.equal(c.dailyGuidance({periods:periods.slice(0,2)}).provisional,true);const low=c.dailyGuidance({date:'2026-10-06',periods,menstrualLogs:fertile});assert(low.notes.some(x=>x.startsWith('Flujo seco')));assert.equal(c.dailyGuidance({date:today,menstrualLogs:[{date:today,crampsLevel:4}]}).notes.length,0);
 }finally{h.close();}
});
