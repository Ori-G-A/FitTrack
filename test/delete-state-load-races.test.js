import test from 'node:test';
import assert from 'node:assert/strict';
import {withDeleteApp,startDelete,deferred,waitFor,flush,plain,userB,oldWeight,freshWeight} from '../test-support/delete-state-fixtures.js';

// Suplementos posteriores a E0; no sustituyen los casos de negocio congelados.
test('borrado008 carga y guardado propios de B siguen independientes de A',async()=>{
 const storage=deferred();let op;await withDeleteApp({data:{weights:[oldWeight]},dataByUser:{[userB.id]:{weights:[freshWeight]}},onStorage:k=>k==='listPhotos'?storage.promise:undefined},async app=>{
  try{op=startDelete(app);await waitFor(()=>app.fixture.events.includes('listPhotos'));app.fixture.emitSession(userB);await waitFor(()=>app.fixture.reads.some(r=>r.user_id===userB.id));await app.ready();await app.clock.advance(600);await waitFor(()=>app.fixture.writes.some(w=>w.payload.user_id===userB.id&&w.payload.key==='weights'));storage.reject(Error('A tardío'));await op;await flush();assert.equal(app.current.state.loaded,true,'FR-011: A no bloquea a B');const writes=app.fixture.writes.filter(w=>w.payload.user_id===userB.id&&w.payload.key==='weights');assert.deepEqual(plain(writes.map(w=>w.payload.value)),[[freshWeight]],'FR-011: B guarda solo sus valores frescos');assert.equal(app.w.document.querySelector('[aria-label="Estado del borrado"]'),null);}
  finally{storage.resolve({data:[],error:null});await op;}
 });
});
test('borrado008 carga ordinaria pendiente no aplica setters durante borrado',async()=>{
 const reads=deferred(),storage=deferred();let op;await withDeleteApp({data:{weights:[oldWeight]},dataByUser:{[userB.id]:{weights:[freshWeight]}},onStorage:k=>k==='listPhotos'?storage.promise:undefined},async app=>{
  try{app.fixture.readGate=reads.promise;app.fixture.emitSession(userB);await waitFor(()=>app.fixture.reads.filter(r=>r.user_id===userB.id).length===12);op=startDelete(app);await waitFor(()=>app.fixture.events.includes('listPhotos'));reads.resolve();await flush();assert.equal(app.current.state.loaded,false,'FR-008/011: una carga ya iniciada tampoco levanta el bloqueo');assert.deepEqual(plain(app.current.state.weights),[oldWeight],'FR-008: no se aplican setters de esa carga durante el borrado');await app.clock.advance(600);assert.equal(app.fixture.writes.length,0);storage.reject(Error('fallo previo a DELETE'));await op;await flush();assert.ok(app.w.document.querySelector('[role=alert]'));}
  finally{reads.resolve();storage.resolve({data:[],error:null});await op;await flush();}
 });
});
