import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo ciclo conserva recalculo timeline duplicados y timestamps",async()=>{
const h=await mountBody();try{const c=h.modules.cycle;const logs=[{date:today,bleedingLevel:'none'},{date:today,bleedingLevel:'heavy'}],wellness=[{date:today,energy:1,sleep:3},{date:today,energy:5,sleep:9}];const t=c.buildCycleTimeline({startDate:today,endDate:today,menstrualLogs:logs,wellness});assert.equal(t.length,1);assert.equal(t[0].phase,'follicular_early');assert.equal(t[0].bleedingLevel,'heavy');assert.equal(t[0].energy,5);assert.equal(t[0].sleep,9);assert.equal(t[0].phaseLabel,'folicular temprana');assert.equal(c.buildCycleTimeline({startDate:today,endDate:'2026-10-01'}).length,0);
 const r=c.recalculateCycleEstimates('u','2026-10-17',today,{date:'2026-10-01'});assert.equal(r.length,2);assert.equal(r[0].id,'u:2026-10-17');assert.equal(r[1].date,'2026-10-01');assert.equal(r[0].updatedAt,'2026-10-18T12:00:00.000Z');assert.equal(c.recalculateCycleEstimates('',today,today)[0].id,'local:2026-10-18');assert.equal(c.recalculateCycleEstimates('u',today,'2026-10-01').length,0);assert.equal(logs.length,2);assert.equal(wellness[0].energy,1);
 const a=h.modules.app;assert.equal(a.localISO(new h.w.Date(2026,0,31,23,59)),'2026-01-31');assert.equal(a.addDays('2026-01-31',1),'2026-02-01');assert.equal(a.daysBetween('2026-01-31','2026-02-02'),2);
 }finally{h.close();}
});
