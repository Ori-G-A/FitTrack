import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {mountApp,waitFor} from '../../../test-support/app-dom.js';
import {deferred} from '../../../test-support/clock.js';
import {sourceHash} from '../../../scripts/save-state-evidence.js';
assert.equal(process.version,'v24.21.0');
const before=sourceHash(),observations=[];
const pause=()=>new Promise(r=>setTimeout(r,30));
async function use(seed,run){const a=await mountApp(seed);try{await a.ready();await run(a);}finally{a.close();}}
const userA='sdd-user-001',userB={id:'sdd-user-002',email:'b@example.test'};
await use({onSignOut:()=>({error:Error('fallo retorno sintético')})},async a=>{
 await a.account();await a.button('Eliminar todos mis datos');await waitFor(()=>a.fixture.events.includes('signOut'));await pause();
 assert.equal(a.current.state.loaded,false);assert(a.w.document.body.textContent.includes('Cargando tus datos'));
 observations.push({id:'D008-01',finding:'DATA-004',signOutReturnedError:true,loaded:false,errorVisible:false,events:[...a.fixture.events]});
});
{
 const gate=deferred();await use({onStorage:k=>k==='listPhotos'?gate.promise:undefined},async a=>{
  try{await a.account();await a.button('Eliminar todos mis datos');await waitFor(()=>a.w.document.body.textContent.includes('Cargando tus datos'));gate.reject(Error('fallo visible sintético'));await a.ready();await pause();
   const errorVisible=a.w.document.body.textContent.includes('fallo visible sintético');assert.equal(errorVisible,false);
   observations.push({id:'D008-02',finding:'DATA-005',settingsUnmountedWhilePending:true,loadedAfterFailure:true,errorVisible,events:[...a.fixture.events]});
  }finally{gate.resolve({data:[],error:null});}
 });
}
{
 let a;await use({data:{weights:[{id:'peso-A',date:'2026-10-22',kg:70}]},onDelete:()=>{a.fixture.data={};return {error:null};},onSignOut:()=>{throw Error('fallo cierre sintético');}},async app=>{
  a=app;const error=await a.current.actions.deleteAllData().then(()=>null,e=>e);assert.match(error.message,/fallo cierre/);await a.ready();assert.equal(Object.keys(a.fixture.data).length,0);
  await a.clock.advance(600);await waitFor(()=>a.fixture.writes.length===12);assert.equal(a.fixture.data.weights[0].id,'peso-A');
  observations.push({id:'D008-03',finding:'DATA-006',deleteConfirmed:true,signOutRejected:true,automaticWritesAfterDelete:a.fixture.writes.length,previousWeightRestored:true});
 });
}
{
 const gate=deferred();await use({onStorage:k=>k==='listPhotos'?gate.promise:undefined},async a=>{
  let op;try{op=a.current.actions.deleteAllData().then(()=>null,e=>e);await waitFor(()=>a.fixture.events.includes('listPhotos'));const reads=a.fixture.reads.length;
   Object.defineProperty(a.w.document,'visibilityState',{configurable:true,value:'visible'});a.w.document.dispatchEvent(new a.w.Event('visibilitychange'));
   await waitFor(()=>a.fixture.reads.length>reads);await a.ready();await a.w.__sddSync.saveKey(userA,'probe',1);assert.equal(a.fixture.writes.length,1);
   observations.push({id:'D008-04',finding:'DATA-008',deletionStillPending:true,visibilityReloads:a.fixture.reads.length-reads,loadedDuringDelete:true,writeAcceptedDuringDelete:true});
  }finally{gate.resolve({data:[],error:null});await op;}
 });
}
{
 const storage=deferred(),readsB=deferred();await use({data:{weights:[{id:'solo-A',date:'2026-10-22',kg:70}]},onStorage:k=>k==='listPhotos'?storage.promise:undefined},async a=>{
  let op;try{op=a.current.actions.deleteAllData().then(()=>null,e=>e);await waitFor(()=>a.fixture.events.includes('listPhotos'));a.fixture.readGate=readsB.promise;a.fixture.emitSession(userB);
   await waitFor(()=>a.fixture.reads.filter(r=>r.user_id===userB.id).length===12);storage.reject(Error('fallo tardío de A'));await op;await a.ready();
   await a.clock.advance(600);await waitFor(()=>a.fixture.writes.some(w=>w.payload.user_id===userB.id&&w.payload.key==='weights'));
   const write=a.fixture.writes.find(w=>w.payload.user_id===userB.id&&w.payload.key==='weights');assert.equal(write.payload.value[0].id,'solo-A');
   observations.push({id:'D008-05',finding:'DATA-007',loadOfBStillPending:true,failureOfAEnablesLoaded:true,writeToBContainsOldValueOfA:true});
  }finally{readsB.resolve();await pause();storage.resolve({data:[],error:null});await op;}
 });
}
{
 const deleting=deferred();let signedOutUser;await use({onDelete:()=>deleting.promise,onSignOut:()=>{signedOutUser='sdd-user-002';return {error:null};}},async a=>{
  let op;try{op=a.current.actions.deleteAllData().then(()=>null,e=>e);await waitFor(()=>a.fixture.events.includes('deleteData'));a.fixture.emitSession(userB);await waitFor(()=>a.fixture.reads.filter(r=>r.user_id===userB.id).length===12);await a.ready();
   // El doble captura la cuenta que realmente recibe signOut, sin cerrar sesiones reales.
   a.fixture.onSignOut=()=>{signedOutUser=a.fixture.user?.id;return {error:null};};deleting.resolve({error:null});await op;assert.equal(signedOutUser,userB.id);
   observations.push({id:'D008-06',finding:'DATA-007',dataDeleteDispatchedForA:true,activeUserAtSignOut:signedOutUser,signOutDispatchedAfterSwitch:true});
  }finally{deleting.resolve({error:null});await op;}
 });
}
assert.equal(sourceHash(),before);mkdirSync('specs/008-borrado-fiable/evidence',{recursive:true});
const report={diagnosticOnly:true,contractBaseline:false,passed:true,node:process.version,generatedAt:new Date().toISOString(),sourceHash:before,sourceUnchanged:true,realBackendUsed:false,observations};
writeFileSync('specs/008-borrado-fiable/evidence/survey.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

