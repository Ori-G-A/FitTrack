import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo peso conserva regresion tendencia y callbacks de objetivos",async()=>{
const h=await mountBody();try{const a=h.modules.app;assert.equal(a.slopePerDay([]),null);assert.equal(a.slopePerDay([{x:0,y:1}]),null);assert.equal(a.slopePerDay([{x:1,y:1},{x:1,y:2}]),null);assert.equal(a.slopePerDay([{x:0,y:1},{x:2,y:5}]),2);
 const weights=[weight('a','2026-09-27',70),weight('b','2026-10-04','69'),weight('c',today,67),weight('future','2026-10-19',100),weight('zero',today,0),weight('negative',today,-1),weight('before','2026-09-26',100)];const t=a.weightTrendHighlight(weights,today);assert.equal(t.days,21);assert.equal(t.from,70);assert.equal(t.to,67);assert.deepEqual(plain(t.series),[70,69,67]);assert.equal(t.perWeek,-1);assert.equal(a.weightTrendHighlight(weights.slice(0,2),today),null);assert.equal(a.weightTrendHighlight(weights,today,1),null);
 const settings=h.modules.settings;assert.equal(typeof settings.weightVsExpected,'function');assert.equal(settings.weightVsExpected([],{weeklyChange:-.5},today),null);
assert(Number.isNaN(a.weightTrendHighlight([weight('a','2026-10-01',70),weight('b','2026-10-10',69),weight('c',today,Infinity)],today).perWeek));
 }finally{h.close();}
});
