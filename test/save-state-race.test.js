import test from 'node:test';
import assert from 'node:assert/strict';
import {mountInterface} from '../test-support/interface-dom.js';
import {deferred,settle} from '../test-support/clock.js';
test('guardado007 cambio de usuario no pinta error ajeno antes del efecto',async()=>{
 const late=deferred();let delayed=false;
 const app=await mountInterface({}, {mode:'indicator'},{mutation:'save007',entry:'test-support/save-state-entry.jsx',fixture:{onWrite:()=>delayed?late.promise:Promise.resolve({error:{message:'fallo A'}})}});
 try{
  await app.act(()=>app.w.__save007.saveKey('sdd-user-001','a',1));assert.ok(app.text.includes('Error al guardar'));
  const committed=[];app.w.__save007Layout=()=>committed.push(app.text.includes('Error al guardar'));
  await app.act(()=>{app.state.setUserId('b');app.state.setRevision(v=>v+1);});assert.deepEqual(committed,[false],'FR-007: commit de B no pinta error A antes de efectos');
  delayed=true;const pending=app.w.__save007.saveKey('sdd-user-001','a',2);await settle();await app.act(()=>late.resolve({error:{message:'fallo tardío A'}}));await pending;assert.ok(app.text.includes('Sin cambios'));assert.ok(!app.text.includes('Error al guardar'),'FR-007: resultado tardío A no cambia B');
  await app.act(()=>{app.state.setUserId('sdd-user-001');app.state.setRevision(v=>v+1);});assert.equal(committed.at(-1),true);assert.ok(app.text.includes('Error al guardar'));assert.equal(app.fixture.writes.length,2);
 }finally{await app.close();}
});
