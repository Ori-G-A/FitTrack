import test from 'node:test';
import assert from 'node:assert/strict';
import {createDeleteCoordinator} from '../src/delete-coordinator.js';
import {deferred,settle} from '../test-support/clock.js';
function fixture(patch={}){
 const calls=[];const effects={suspendUserSaves:id=>calls.push(['suspend',id]),setLoaded:v=>calls.push(['loaded',v]),waitForUserSaves:async()=>{},deleteUserPhotos:async()=>calls.push(['photos']),deleteAppData:async()=>calls.push(['DELETE']),signOut:async()=>{calls.push(['close']);return {error:null};},resumeUserSaves:id=>calls.push(['resume',id]),reload:async()=>true,...patch};
 const flow=createDeleteCoordinator(effects);flow.setActor('a');return {flow,calls,effects};
}
test('borrado008 coordinador snapshot estable y exclusion por intento',async()=>{
 const gate=deferred();const {flow}=fixture({waitForUserSaves:()=>gate.promise});const actor=flow.getActor();assert.equal(flow.setActor('a'),actor);const snap=flow.getSnapshot();assert.equal(flow.getSnapshot(),snap);
 const first=flow.start(),second=flow.start();assert.equal(first,second);assert.equal(flow.getSnapshot().blocked,true);gate.resolve();await first;assert.equal(flow.getSnapshot().dataDeleted,true);assert.equal(flow.getSnapshot().blocked,true);
});
test('borrado008 coordinador recarga requiere confirmacion de commit vigente',async()=>{
 const gate=deferred();const {flow,calls}=fixture({deleteUserPhotos:async()=>{throw Error('fotos');},reload:()=>gate.promise});await assert.rejects(flow.start(),/fotos/);
 const first=flow.recover();assert.equal(flow.recover(),first);gate.resolve(true);const token=await first;assert.equal(flow.getSnapshot().phase,'ready');assert.equal(flow.isBlocked(),true);assert.equal(calls.some(c=>c[0]==='resume'),false,'FR-009: resolver lectura no libera guardados');assert.equal(flow.confirmRecovery(token+1),false);assert.equal(flow.confirmRecovery(token),true);assert.equal(flow.isBlocked(),false);assert.equal(flow.confirmRecovery(token),false);assert.deepEqual(calls.filter(c=>c[0]==='resume'),[['resume','a']]);
});
test('borrado008 coordinador lectura fallida y confirmacion obsoleta mantienen aislamiento',async()=>{
 const {flow,calls}=fixture({deleteUserPhotos:async()=>{throw Error('fotos');},reload:async()=>false});await assert.rejects(flow.start());await assert.rejects(flow.recover(),/recargar/);assert.equal(flow.isBlocked(),true);assert.equal(flow.getSnapshot().error,true);assert.equal(calls.some(c=>c[0]==='resume'),false);
 const old=flow.getActor();flow.setActor('b');flow.setActor('a');assert.equal(flow.matches(old),false);assert.equal(flow.confirmRecovery(2),false);
});
test('borrado008 coordinador respuesta tardia no borra intento nuevo',async()=>{
 const a=deferred(),b=deferred();let number=0;const {flow,calls}=fixture({deleteUserPhotos:()=>++number===1?a.promise:b.promise});const first=flow.start();await settle();flow.setActor('b');const second=flow.start();await settle();a.reject(Error('A tardía'));await first;assert.equal(flow.getSnapshot().userId,'b');assert.equal(flow.isBlocked(),true);assert.equal(flow.getSnapshot().busy,true);assert.equal(flow.getSnapshot().error,false);b.resolve();await second;assert.equal(calls.filter(c=>c[0]==='DELETE').length,1);
});
test('borrado008 coordinador cierre manual nunca repite DELETE incierto',async()=>{
 const close=deferred();const {flow,calls}=fixture({deleteAppData:async()=>{calls.push(['DELETE']);throw Error('incierto');},signOut:()=>{calls.push(['close']);return close.promise;}});await assert.rejects(flow.start(),/incierto/);assert.equal(flow.getSnapshot().deleteDispatched,true);assert.equal(flow.getSnapshot().dataDeleted,false);await flow.recover();assert.equal(calls.some(c=>c[0]==='resume'),false);const first=flow.retryClose();assert.equal(flow.retryClose(),first);await settle();assert.equal(calls.filter(c=>c[0]==='DELETE').length,1);flow.setActor('b');close.resolve({error:Error('cierre anterior')});await first;assert.equal(flow.getSnapshot().userId,'b');assert.equal(flow.getSnapshot().error,false);
});
test('borrado008 coordinador montaje limpieza montaje no revive trabajo anterior',async()=>{
 const gate=deferred();const {flow}=fixture({waitForUserSaves:()=>gate.promise});let notifications=0;const unsubscribe=flow.subscribe(()=>notifications++);const first=flow.start();flow.disconnect();flow.connect();flow.setActor('a');const snapshot=flow.getSnapshot();gate.resolve();await first;assert.equal(flow.getSnapshot(),snapshot);unsubscribe();const count=notifications;flow.setActor('b');assert.equal(notifications,count);assert.equal(flow.getSnapshot().blocked,false);await flow.start();assert.equal(flow.getSnapshot().dataDeleted,true);
});
