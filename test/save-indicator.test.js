import test from 'node:test';
import assert from 'node:assert/strict';
import {mountInterface} from '../test-support/interface-dom.js';
import {waitFor} from '../test-support/app-dom.js';
test('guardado007 indicador recupera estado al remontar',async()=>{
 const app=await mountInterface({}, {mode:'indicator'},{mutation:'save007',entry:'test-support/save-state-entry.jsx',fixture:{onWrite:async()=>({error:{message:'fallo sintético'}})}});
 try{
  await app.act(()=>app.state.setShow(false));await app.w.__save007.saveKey('sdd-user-001','a',1);await app.act(()=>app.state.setShow(true));
  assert.ok(app.text.includes('Error al guardar'),'FR-008: remontar muestra fallo previo sin nueva escritura');
  await app.act(()=>app.state.setUserId('b'));assert.ok(app.text.includes('Sin cambios'));assert.ok(!app.text.includes('Error al guardar'),'FR-007: no pintar error de A en B');
  await app.act(()=>app.state.setUserId('sdd-user-001'));assert.ok(app.text.includes('Error al guardar'));const count=app.fixture.writes.length;
  await app.act(()=>app.state.setShow(false));app.w.__save007Layout=()=>{app.w.__save007Layout=null;void app.w.__save007.saveKey('sdd-user-001','b',2);};await app.act(()=>{app.state.setShow(true);app.state.setRevision(v=>v+1);});await waitFor(()=>app.fixture.writes.length===count+1);assert.ok(app.text.includes('Error al guardar'));
  await app.act(()=>app.state.setShow(false));const before=app.text;await app.w.__save007.saveKey('sdd-user-001','c',3);assert.equal(app.text,before);
 }finally{await app.close();}
});
