import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo avisos conservan fatiga textos umbrales y claves",async()=>{
const h=await mountBody();try{const a=h.modules.alerts;const m=a.alertMetrics({goals:{sex:'hombre'},wellness:[{date:'2026-10-10',energy:1},{date:'2026-10-11',energy:0},{date:today,energy:2},{date:'2027-01-01',energy:1},{date:today,energy:3},{date:today,energy:null}]});assert.equal(m.lowEnergyDays,3);
 const goals={weeklyChange:0,proteinTarget:150};const base={...m,trend:.25};let out=a.buildAlerts(base,goals);assert.equal(out[0].type,'ok');assert.equal(out[0].key,undefined);out=a.buildAlerts({...base,trend:.25001},goals);assert.equal(out[0].type,'warn');out=a.buildAlerts({...base,cycle:true},goals);assert(out.every(x=>x.key===a.alertKey(x)));assert(out.some(x=>x.card==='ciclo'));
 const fatigue={...m,loadRpe:{...m.loadRpe,fatigue:{name:'Press',kg:20,reps:8,from:7,to:9},fatigueCount:2}};assert(a.buildAlerts(fatigue,goals).some(x=>x.title==='Programá una semana de descarga'));assert(!a.buildAlerts({...fatigue,cycleConfound:true},goals).some(x=>x.title==='Programá una semana de descarga'));
 const cyc=a.alertMetrics({periods,menstrualLogs:[{date:today,bleedingLevel:'none',breastSensitivity:3}]});assert.equal(cyc.cycleConfound,true);assert.equal(a.alertMetrics({periods:periods.slice(0,2),menstrualLogs:[{date:today,breastSensitivity:3}]}).cycleConfound,false);
 }finally{h.close();}
});
