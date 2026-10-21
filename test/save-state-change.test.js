import test from 'node:test';
import assert from 'node:assert/strict';
import {createSaveCoordinator} from '../src/save-coordinator.js';
import {deferred,settle} from '../test-support/clock.js';
const logger={error(){}};
test('guardado007 error persiste entre claves y nuevos intentos',async()=>{
 for(const order of [['b','c'],['c','b']]){
  const g={a:deferred(),b:deferred(),c:deferred()},events=[];const c=createSaveCoordinator((u,k)=>g[k].promise,logger);c.onSaveStatus(e=>events.push(e),'u');const a=c.saveKey('u','a',1),b=c.saveKey('u','b',2);await settle();g.a.reject(Error('fallo A'));await a;
  assert.equal(events.at(-1).status,'error','FR-005: fallo visible incluso con B pendiente');
  const third=c.saveKey('u','c',3);await settle();assert.equal(events.at(-1).status,'error','FR-005: comenzar C no borra A');for(const k of order){g[k].resolve();await settle();}await Promise.all([b,third]);assert.equal(events.at(-1).status,'error');assert.equal(events.at(-1).error,'fallo A');
  g.a=deferred();const retry=c.saveKey('u','a',4);await settle();assert.equal(events.at(-1).status,'error');g.a.reject(Error('fallo A2'));await retry;assert.equal(events.at(-1).error,'fallo A2');
 }
});
test('guardado007 recuperacion selectiva conserva otros errores',async()=>{
 const bad=new Set(['a','b']),events=[];const c=createSaveCoordinator(async(u,k)=>{if(bad.has(k))throw Error('fallo '+k);},logger);c.onSaveStatus(e=>events.push(e),'u');await c.saveKey('u','a',1);await c.saveKey('u','b',2);bad.delete('a');await c.saveKey('u','a',3);
 assert.equal(events.at(-1).status,'error','FR-006: recuperar A no recupera B');assert.equal(events.at(-1).error,'fallo b');bad.delete('b');await c.saveKey('u','b',4);assert.equal(events.at(-1).status,'saved');assert.equal(events.at(-1).error,null);
 const snapshot=c.getSaveStatus('u');assert.equal(c.getSaveStatus('u'),snapshot);assert.ok(Object.isFrozen(snapshot),'snapshot inmutable');assert.equal(c.getSaveStatus(null).status,'idle');
});
test('guardado007 sesiones y resultados tardios aislados',async()=>{
 const gate=deferred(),a=[],b=[];const c=createSaveCoordinator((u)=>u==='a'?gate.promise:Promise.resolve(),logger);const offA=c.onSaveStatus(e=>a.push(e),'a'),offB=c.onSaveStatus(e=>b.push(e),'b');const pending=c.saveKey('a','x',1);await settle();
 assert.equal(b.length,0,'FR-007: B no recibe el inicio de A');await c.saveKey('b','x',2);assert.equal(b.at(-1).status,'saved');const count=b.length;gate.reject(Error('fallo tardío A'));await pending;assert.equal(b.length,count,'FR-007: A tardío no actualiza B');assert.equal(a.at(-1).status,'error');assert.equal(c.getSaveStatus('b').status,'saved');assert.equal(c.getSaveStatus('a').status,'error');offA();offB();await c.saveKey('b','y',3);assert.equal(b.length,count);
});
