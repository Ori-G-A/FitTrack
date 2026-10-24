import test from 'node:test';
import assert from 'node:assert/strict';
import {deleteUserData} from '../src/app-data-lifecycle.js';
import {withDeleteApp,waitFor,plain,deferred,flush,userA} from '../test-support/delete-state-fixtures.js';

test('borrado008 confirmacion exacta y cancelacion no producen efectos',async()=>{
 await withDeleteApp({},async app=>{
  await app.account();const before=plain(app.fixture.events);
  for(const response of [null,'','eliminar',' ELIMINAR','ELIMINAR ']){app.w.prompt=()=>response;await app.button('Eliminar todos mis datos');await flush();assert.deepEqual(plain(app.fixture.events),before,'FR-001: solo coincidencia exacta');}
  app.w.prompt=()=> 'ELIMINAR';await app.button('Eliminar todos mis datos');await waitFor(()=>app.fixture.events.includes('signOut'));assert.equal(app.fixture.events.filter(e=>e==='deleteData').length,1);
 });
});
test('borrado008 usuario ausente rechaza antes de efectos',async()=>{
 const calls=[];const effect=()=>calls.push('efecto');
 await assert.rejects(deleteUserData({userId:null,suspendUserSaves:effect,waitForUserSaves:effect,deleteUserPhotos:effect,deleteAppData:effect,signOut:effect,resumeUserSaves:effect,setLoaded:effect}),/sesión activa/);assert.deepEqual(calls,[],'FR-002');
});
test('borrado008 conserva orden cola fotos registros y propietario',async()=>{
 const gate=deferred(),calls=[];let pending;
 try{
  pending=deleteUserData({userId:userA,suspendUserSaves:id=>calls.push(['suspend',id]),setLoaded:v=>calls.push(['loaded',v]),waitForUserSaves:async id=>{calls.push(['wait',id]);await gate.promise;},deleteUserPhotos:async id=>calls.push(['photos',id]),deleteAppData:async id=>calls.push(['data',id]),signOut:async()=>{calls.push(['signOut']);return {error:null};},resumeUserSaves:()=>calls.push(['resume'])});
  await flush();assert.deepEqual(calls,[['suspend',userA],['loaded',false],['wait',userA]]);gate.resolve();await pending;
  assert.deepEqual(calls,[['suspend',userA],['loaded',false],['wait',userA],['photos',userA],['data',userA],['signOut']],'FR-003: no se elimina cuenta auth ni se cambia orden');
 }finally{gate.resolve();await pending;}
});
test('borrado008 conserva efectos parciales sin rollback',async()=>{
 const error=Error('fallo parcial fotos'),effects=[];let photos=['a','b'];
 await assert.rejects(deleteUserData({userId:userA,suspendUserSaves:()=>{},setLoaded:()=>{},waitForUserSaves:async()=>{},deleteUserPhotos:async()=>{photos=['b'];throw error;},deleteAppData:async()=>effects.push('data'),signOut:async()=>effects.push('signOut'),resumeUserSaves:()=>{}}),e=>e===error);
 assert.deepEqual(photos,['b'],'FR-004: no se promete restauración');assert.deepEqual(effects,[],'FR-004: fallo de fotos no continúa al DELETE');
});
