import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo bienestar conserva borrador fecha guardas y guardado",async()=>{
const h=await mountBody({section:'nota',wellness:[{id:'old',date:today,sleep:7,notes:'original'}]});try{
 assert.equal(h.b.wel.sleep,7);await h.call(h.b.setWel,{...blankWell,notes:'borrador'});await h.call(h.state.setWellness,[{id:'changed',date:today,sleep:9,notes:'externo'},{id:'other',date:'2026-10-17',sleep:6}]);assert.equal(h.b.wel.notes,'borrador');await h.call(h.b.setWelDate,'2026-10-17');assert.equal(h.b.wel.sleep,6);await h.call(h.b.setWelDate,today);assert.equal(h.b.wel.notes,'externo');
 await h.call(h.b.setWel,{...blankWell,notes:'  '});await h.call(h.b.saveWel);assert.equal(h.state.wellness.length,2);await h.call(h.b.setWel,{sleep:'0',restingHr:'1,2',steps:'0',energy:0,notes:'  hola  '});h.w.__bodyEvents.length=0;await h.call(h.b.saveWel);assert.deepEqual(plain(h.w.__bodyEvents),['toast','wellness']);const r=h.state.wellness.at(-1);assert.equal(r.sleep,0);assert(Number.isNaN(r.restingHr));assert.equal(r.steps,0);assert.equal(r.energy,null);assert.equal(r.notes,'hola');assert.equal(r.unknown,undefined);assert.notEqual(r.id,'changed');assert.match(h.text,/0h/);assert.doesNotMatch(h.text,/0 pasos/);assert.equal(h.w.document.querySelectorAll('.ft-li button').length,0);await h.call(h.state.setWellness,Array.from({length:8},(_,i)=>({id:'w'+i,date:'2026-10-'+String(i+1).padStart(2,'0'),sleep:0,steps:0,energy:0})));assert.equal(h.w.document.querySelectorAll('.ft-li').length,6);
 }finally{h.close();}
});
