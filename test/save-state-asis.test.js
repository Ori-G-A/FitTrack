import test from 'node:test';
import assert from 'node:assert/strict';
import {createSaveCoordinator} from '../src/save-coordinator.js';
import {deferred,settle} from '../test-support/clock.js';
import {mountApp,waitFor} from '../test-support/app-dom.js';
const logger={error(){}};
test('guardado007 cola mantiene orden concurrencia y referencia',async()=>{
 const gate=deferred(),calls=[];const c=createSaveCoordinator(async(u,k,v)=>{calls.push([u,k,v]);if(v===1)await gate.promise;},logger);
 const first=c.saveKey('a','x',1);await settle();const value={v:2};const next=c.saveKey('a','x',value),other=c.saveKey('a','y',3),user=c.saveKey('b','x',4);await settle();assert.deepEqual(calls.map(x=>x[2]),[1,3,4]);value.v=5;gate.resolve();await Promise.all([first,next,other,user]);assert.equal(calls.at(-1)[2],value);assert.equal(calls.at(-1)[2].v,5);
});
test('guardado007 debounce conserva 600ms y cleanup',async()=>{
 const app=await mountApp({}, {hook:true});try{
  const render=async p=>{app.w.__sddRenderHook(p);await new Promise(r=>setTimeout(r,20));};const p={userId:'sdd-user-001',keyName:'x',value:1,enabled:true};
  await render(p);await app.clock.advance(599);assert.equal(app.fixture.writes.length,0);await render({...p,value:2});await app.clock.advance(599);assert.equal(app.fixture.writes.length,0);await app.clock.advance(1);await waitFor(()=>app.fixture.writes.length===1);assert.equal(app.fixture.writes[0].payload.value,2);
  await render({...p,value:3});await render({...p,enabled:false});await app.clock.advance(600);assert.equal(app.fixture.writes.length,1);await render({...p,value:4});app.w.__sddUnmount();app.w.__sddUnmount=null;await app.clock.advance(600);assert.equal(app.fixture.writes.length,1);
 }finally{app.close();}
});
test('guardado007 promesa conserva resolucion ante fallo',async()=>{
 const events=[],logs=[];const c=createSaveCoordinator(async()=>{throw Error('fallo sintético');},{error(...v){logs.push(v);}});c.onSaveStatus(e=>events.push(e));await assert.doesNotReject(c.saveKey('u','a',1));assert.equal(logs.length,1);assert.equal(events.at(-1).status,'error');assert.equal(events.at(-1).error,'fallo sintético');
});
test('guardado007 conserva ausencia suspension y espera capturada',async()=>{
 const gates=[deferred(),deferred()],calls=[],events=[];const c=createSaveCoordinator((u,k,v)=>{calls.push(v);return gates[v].promise;},logger);c.onSaveStatus(e=>events.push(e));await c.saveKey(null,'x',0);assert.equal(events.at(-1).error,'Sin sesion activa');assert.equal(calls.length,0);
 const first=c.saveKey('u','x',0);await settle();const wait=c.waitForUserSaves('u');const second=c.saveKey('u','x',1);c.suspendUserSaves('u');const count=events.length;await c.saveKey('u','z',0);assert.equal(events.length,count);gates[0].resolve();await first;await wait;await settle();assert.deepEqual(calls,[0,1]);gates[1].resolve();await second;c.resumeUserSaves('u');await c.saveKey('u','z',1);assert.deepEqual(calls,[0,1,1]);assert.equal((await c.waitForUserSaves('other')).length,0);
});
