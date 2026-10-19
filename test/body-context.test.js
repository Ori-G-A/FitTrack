import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo ciclo conserva comienzos longitudes y contexto",async()=>{
const h=await mountBody();try{const c=h.modules.cycle,a=h.modules.app;
 assert.deepEqual(plain(c.buildCycleStarts([{date:'2026-10-01',duration:1},{date:'2026-10-01',duration:20}],[{date:'2026-10-07',bleedingLevel:'heavy'},{date:'2026-10-09',bleedingLevel:'light'},{date:'2026-10-10',bleedingLevel:'medium'},{date:'2026-10-18',bleedingLevel:'spotting'}])),['2026-10-01','2026-10-09']);
 for(const days of [17,18,45,46]){const p=[{date:'2026-01-01'},{date:a.addDays('2026-01-01',days)}],ctx=c.cycleContext('2026-01-02',p,[]);assert.equal(ctx.samples,days>=18&&days<=45?1:0);assert.equal(ctx.avgCycle,days>=18&&days<=45?days:28);assert.equal(ctx.nextStart,p[1].date);}
 const empty=c.cycleContext(today,[],[]);assert.equal(empty.currentStart,null);assert.equal(empty.daysToNext,null);assert.equal(empty.avgCycle,28);const ctx=c.cycleContext(today,periods,[]);assert.equal(ctx.currentStart,'2026-09-23');assert.equal(ctx.nextPeriod,'2026-10-21');assert.equal(ctx.daysToNext,3);assert.equal(ctx.cycleDay,26);
 }finally{h.close();}
});
