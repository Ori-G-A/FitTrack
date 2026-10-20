import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo peso conserva creatina saturacion y edicion de objetivo",async()=>{
const h=await mountBody({goals:{targetWeight:55,creatineStart:'2026-10-11'}});try{const a=h.modules.app;assert.equal(a.creatineWaterKg('',today),0);assert.equal(a.creatineWaterKg(today,'2026-10-17'),0);assert.equal(a.creatineWaterKg(today,today),0);assert(Math.abs(a.creatineWaterKg('2026-10-11',today)-.9481808382428365)<1e-12);assert(Math.abs(a.creatineWaterKg('2026-10-11',today,7,3)-1.896361676485673)<1e-12);assert.equal(h.b.creaDays,7);assert.equal(h.b.creaSat,63);assert.equal(h.b.creaFull,'2026-11-08');await h.call(h.state.setGoals,g=>({...g,creatineStart:'2026-09-01'}));assert.equal(h.state.goals.targetWeight,55);assert(h.b.creaSat>=98);assert.match(h.text,/Lograda/);
 }finally{h.close();}
});
