import test from 'node:test';
import assert from 'node:assert/strict';
import {withDeleteApp,startDelete,action,blockedSave,fireRecovery,flush,deferred,waitFor,plain,userA,userB,oldWeight,freshWeight,rawError} from '../test-support/delete-state-fixtures.js';

test('borrado008 intento y recuperacion no se duplican',async()=>{
 const gate=deferred();let first,second;
 await withDeleteApp({onStorage:k=>k==='listPhotos'?gate.promise:undefined},async app=>{
  try{first=startDelete(app);await waitFor(()=>app.fixture.events.includes('listPhotos'));second=startDelete(app);await flush();assert.equal(app.fixture.events.filter(e=>e==='listPhotos').length,1,'FR-013: segundo intento pendiente no despacha otra secuencia');}
  finally{gate.reject(Error(rawError));await Promise.all([first,second]);}
  await flush();const read=deferred();app.fixture.readGate=read.promise;const count=app.fixture.reads.length;
  try{const button=action(app,'Recargar datos','FR-013');await waitFor(()=>app.fixture.reads.length>count);button.click();await flush();assert.equal(app.fixture.reads.length-count,12,'FR-013: una sola recarga pendiente');}
  finally{read.resolve();await flush();}
 });
});
test('borrado008 feedback sobrevive al desmontaje de Ajustes',async()=>{
 const gate=deferred();await withDeleteApp({onStorage:k=>k==='listPhotos'?gate.promise:undefined},async app=>{
  try{await app.account();await app.button('Eliminar todos mis datos');await waitFor(()=>app.fixture.events.includes('listPhotos'));assert.equal(app.w.document.body.textContent.includes('Eliminar todos mis datos'),false);gate.reject(Error(rawError));await flush();
   const alert=app.w.document.querySelector('[role=alert]');assert.ok(alert,'FR-012/007: error persistente fuera de Ajustes');assert.match(alert.textContent,/borrado/i);assert.equal(app.w.document.body.textContent.includes(rawError),false,'FR-006: mensaje backend no expuesto');await blockedSave(app,'FR-008');
  }finally{gate.resolve({data:[],error:null});await flush();}
 });
});
test('borrado008 reintento manual solo cierra sesion',async()=>{
 let appRef;const gate=deferred();let retry=false;
 await withDeleteApp({data:{weights:[oldWeight]},onDelete:()=>{appRef.fixture.data={};return {error:null};},onSignOut:()=>retry?gate.promise:{error:Error(rawError)}},async app=>{
  appRef=app;await startDelete(app);await flush();assert.equal(app.fixture.events.filter(e=>e==='signOut').length,1);
  retry=true;try{const button=action(app,'Cerrar sesión','FR-010');await waitFor(()=>app.fixture.events.filter(e=>e==='signOut').length===2);button.click();await flush();assert.equal(app.fixture.events.filter(e=>e==='signOut').length,2,'FR-013: cierre pendiente no duplicado');assert.equal(app.fixture.events.filter(e=>e==='deleteData').length,1);assert.equal(app.fixture.events.filter(e=>e==='listPhotos').length,1);await blockedSave(app,'FR-010');assert.match(app.w.document.body.textContent,/datos eliminados/i,'FR-007: confirma datos, distingue cierre fallido');}
  finally{gate.resolve({error:null});await flush();}
 });
});
test('borrado008 visibilidad e intervalo no reactivan guardados',async t=>{
 for(const kind of ['visibility','interval'])for(const phase of ['pendiente','fallido'])await t.test(kind+' '+phase,async()=>{
  const gate=deferred();let op;await withDeleteApp({onStorage:k=>k==='listPhotos'?gate.promise:undefined},async app=>{
   try{op=startDelete(app);await waitFor(()=>app.fixture.events.includes('listPhotos'));await flush();if(phase==='fallido'){gate.reject(Error(rawError));await op;await flush();}
    const reads=app.fixture.reads.length;fireRecovery(app,kind);await flush();assert.equal(app.fixture.reads.length,reads,'FR-008: recuperación ordinaria no carga durante '+phase);await blockedSave(app,'FR-008');assert.equal(app.current.state.loaded,false);}
   finally{gate.resolve({data:[],error:null});await op;}
  },{captureIntervals:true});
 });
});
test('borrado008 recarga temprana fallida conserva bloqueo',async()=>{
 await withDeleteApp({onStorage:k=>{if(k==='listPhotos')throw Error(rawError);}},async app=>{
  await startDelete(app);await flush();app.fixture.onRead=()=>({error:Error('fallo recarga'),data:null});const reads=app.fixture.reads.length;
  action(app,'Recargar datos','FR-009');await waitFor(()=>app.fixture.reads.length>reads);await flush();assert.equal(app.current.state.loaded,false,'FR-009: fallo absorbido por loader no se considera éxito');await blockedSave(app,'FR-009');assert.ok(app.w.document.querySelector('[role=alert]'));assert.equal(app.fixture.events.includes('deleteData'),false);
 });
});
test('borrado008 recarga temprana completa precede a nuevos guardados',async()=>{
 let appRef;await withDeleteApp({data:{weights:[oldWeight]},storageFiles:[{name:'a.jpg'}],onStorage:k=>{if(k==='removePhotos'){appRef.fixture.storageFiles=[];throw Error(rawError);}}},async app=>{
  appRef=app;await startDelete(app);await flush();app.fixture.onStorage=undefined;app.fixture.data.weights=[freshWeight];const gate=deferred();app.fixture.readGate=gate.promise;
  const reads=app.fixture.reads.length;try{action(app,'Recargar datos','FR-009');await waitFor(()=>app.fixture.reads.length>reads);await blockedSave(app,'FR-009');assert.equal(app.current.state.loaded,false);gate.resolve();await app.ready();await app.clock.advance(600);await waitFor(()=>app.fixture.writes.some(w=>w.payload.key==='weights'));const weights=app.fixture.writes.filter(w=>w.payload.key==='weights');assert.deepEqual(plain(weights.map(w=>w.payload.value)),[[freshWeight]],'FR-009: primer guardado solo contiene valores frescos ya aplicados');assert.deepEqual(plain(app.fixture.storageFiles),[],'FR-004: recargar no restaura fotos perdidas');assert.equal(app.fixture.events.includes('deleteData'),false);}
  finally{gate.resolve();}
 });
});
test('borrado008 fallo tardio de A no habilita ni escribe B',async()=>{
 const storage=deferred(),reads=deferred();let op;await withDeleteApp({data:{weights:[oldWeight]} ,onStorage:k=>k==='listPhotos'?storage.promise:undefined},async app=>{
  try{op=startDelete(app);await waitFor(()=>app.fixture.events.includes('listPhotos'));app.fixture.readGate=reads.promise;app.fixture.emitSession(userB);await waitFor(()=>app.fixture.reads.filter(r=>r.user_id===userB.id).length===12);storage.reject(Error(rawError));await op;await flush();assert.equal(app.current.state.loaded,false,'FR-011: catch de A no habilita B pendiente');await app.clock.advance(600);assert.equal(app.fixture.writes.filter(w=>w.payload.user_id===userB.id).length,0,'FR-011: valores A no enviados a B');}
  finally{reads.resolve();storage.resolve({data:[],error:null});await op;await flush();}
 });
});
test('borrado008 respuesta de A no cierra ni continua B',async()=>{
 const deleting=deferred();let op;await withDeleteApp({onDelete:()=>deleting.promise},async app=>{
  try{op=startDelete(app);await waitFor(()=>app.fixture.events.includes('deleteData'));app.fixture.emitSession(userB);await waitFor(()=>app.fixture.reads.filter(r=>r.user_id===userB.id).length===12);await app.ready();const count=app.fixture.events.length;deleting.resolve({error:null});await op;await flush();assert.deepEqual(plain(app.fixture.events.slice(count)),[],'FR-011: resultado A no despacha signOut sobre B');assert.equal(app.current.state.loaded,true);}
  finally{deleting.resolve({error:null});await op;}
 });
});
test('borrado008 cambio A B A invalida el intento anterior',async()=>{
 const storage=deferred(),reads=deferred();let op;await withDeleteApp({onStorage:k=>k==='listPhotos'?storage.promise:undefined},async app=>{
  try{op=startDelete(app);await waitFor(()=>app.fixture.events.includes('listPhotos'));const count=app.fixture.reads.filter(r=>r.user_id===userA).length;app.fixture.readGate=reads.promise;const firstUser=app.fixture.user;app.fixture.emitSession(userB);app.fixture.emitSession(firstUser);await flush();assert.equal(app.fixture.reads.filter(r=>r.user_id===userA).length-count,12,'FR-011: generación nueva aunque UID final coincida');storage.reject(Error(rawError));await op;await flush();assert.equal(app.current.state.loaded,false,'FR-011: resultado anterior no habilita nueva sesión A');assert.equal(app.w.document.body.textContent.includes(rawError),false);reads.resolve();await app.ready();assert.equal(app.fixture.events.includes('deleteData'),false);}
  finally{storage.resolve({data:[],error:null});reads.resolve();await op;await flush();}
 });
});
