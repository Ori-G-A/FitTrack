import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo checkin conserva normalizacion identidad timestamps y legado",async()=>{
const h=await mountBody({section:'checkin',periods:[{id:'legacy',date:today,duration:5}],menstrualLogs:[{id:'old',date:today,bleedingLevel:'none',createdAt:'2020-01-01T00:00:00.000Z',extra:1}]});try{
 const c=h.modules.cycle;const now=new h.w.Date();const base=plain(c.emptyMenstrualLog(today));assert.equal(base.bleedingLevel,'not_logged');assert.equal(base.cervicalFluid,'not_checked');assert.equal(base.hasSpotting,false);
 const n=c.normalizeMenstrualLog({date:today,bleeding_level:'spotting',cervical_fluid:'dry',cramps_level:20,breast_sensitivity:-2,bloating_level:Infinity,acneLevel:2,has_spotting:false,notes:'  texto  ',sleep:8,extra:3},now);assert.equal(n.bleedingLevel,'spotting');assert.equal(n.hasSpotting,false);assert.equal(n.crampsLevel,10);assert.equal(n.breastSensitivity,0);assert.equal(n.bloatingLevel,0);assert.equal(n.acneLevel,2);assert.equal(n.sleep,8);assert.equal(n.extra,3);assert.equal(n.notes,'texto');assert.equal(n.updatedAt,'2026-10-18T12:00:00.000Z');assert.equal(c.normalizeMenstrualLog({bleeding_level:'spotting'},now).hasSpotting,false);assert.equal(c.normalizeMenstrualLog({bleedingLevel:'spotting'},now).hasSpotting,true);
 await h.call(h.b.setCycleLog,{...h.b.cycleLog,notes:'draft'});await h.call(h.state.setMenstrualLogs,[{id:'old',date:today,notes:'external',createdAt:'2020-01-01T00:00:00.000Z'}]);assert.equal(h.b.cycleLog.notes,'external');await h.call(h.b.saveCycleLog);assert.equal(h.state.menstrualLogs[0].id,'old');assert.equal(h.state.menstrualLogs[0].createdAt,'2020-01-01T00:00:00.000Z');assert.equal(h.state.periods.length,1);await h.call(h.b.delCycleLog,'old');assert.equal(h.state.periods.length,1);await h.call(h.b.delPeriod,'legacy');assert.equal(h.state.periods.length,0);
 }finally{h.close();}
});
