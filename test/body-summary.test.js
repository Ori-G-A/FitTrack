import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo ciclo conserva resumen sangrado segmentos y outliers",async()=>{
const h=await mountBody();try{const c=h.modules.cycle,a=h.modules.app;const logs=Array.from({length:17},(_,i)=>({id:'l'+i,date:a.addDays('2026-10-01',i),bleedingLevel:'heavy'}));const s=c.summarizeCycles([{id:'legacy',date:'2026-09-01',duration:4}],logs,today);assert.equal(s.cycles[0].start,'2026-10-01');assert.equal(s.cycles[0].bleedDays,15);assert.equal(s.cycles[0].length,null);assert.equal(s.cycles[1].bleedDays,4);assert.equal(s.cycles[1].periodId,'legacy');assert.equal(s.avgBleed,9.5);assert.equal(s.samples,1);assert.equal(s.avgCycle,30);
 assert.deepEqual(plain(c.phaseSegments('',today)),[]);assert.deepEqual(plain(c.phaseSegments(today,'2026-01-01')),[]);const seg=c.phaseSegments('2026-10-01','2026-10-03',[],logs);assert.equal(seg.length,1);assert.equal(seg[0].days,3);assert.equal(seg[0].startDay,1);
 const edge=c.summarizeCycles([{date:'2026-01-01'},{date:'2026-01-18'},{date:'2026-02-05'},{date:'2026-03-22'},{date:'2026-05-07'}],[],today);assert.equal(edge.outliers,2);assert.equal(edge.samples,2);assert.equal(edge.avgCycle,32);assert.equal(edge.spread,27);
const dup=c.summarizeCycles([{id:'first',date:today,duration:2},{id:'last',date:today,duration:3}],[{id:'firstLog',date:today,bleedingLevel:'heavy'},{id:'lastLog',date:today,bleedingLevel:'none'}],today);assert.equal(dup.cycles[0].periodId,'last');assert.equal(dup.cycles[0].logId,'lastLog');assert.equal(dup.cycles[0].bleedDays,3);
 }finally{h.close();}
});
