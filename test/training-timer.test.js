import test from 'node:test';
import assert from 'node:assert/strict';
import {mountTraining,plain,waitFor} from '../test-support/training-dom.js';
test('entrenamiento timer persistencia reloj y transiciones',async()=>{
 const a=await mountTraining({}, {data:{timer:{running:false,baseSec:59,startedAt:null}}});
 try{
  await waitFor(()=>a.train.tSec===59);
  assert.equal([...a.w.document.querySelectorAll('button')].find(b=>b.textContent.includes('Guardar (+')).disabled,true);
  await a.call(a.train.startT);const start=a.fixture.writes.at(-1).payload;
  assert.equal(start.key,'timer');assert.equal(start.user_id,'sdd-user-001');assert.equal(start.value.baseSec,59);assert.equal(start.value.startedAt,a.w.Date.now());
  await a.advance(1000);assert.equal(a.train.tSec,60);
  await a.advance(29000,{ticks:false});assert.equal(a.train.tSec,60);
  await a.advance(1000);assert.equal(a.train.tSec,90);
  await a.call(a.train.pauseT);assert.equal(a.train.tRun,false);
  assert.deepEqual(plain(a.fixture.writes.at(-1).payload.value),{running:false,startedAt:null,baseSec:90});
  await a.call(a.train.commitT);assert.equal(a.train.session.durationMin,2);assert.equal(a.train.tSec,0);
  await a.call(a.train.startT);await a.advance(89000);await a.call(a.train.commitT);assert.equal(a.train.session.durationMin,3);
  await a.call(a.train.startT);await a.call(a.train.resetT);assert.equal(a.train.tSec,0);assert.equal(a.train.tRun,false);
 }finally{a.close();}
 const epoch=Date.parse('2026-10-15T12:00:00Z');
 const active=await mountTraining({}, {data:{timer:{running:true,baseSec:5,startedAt:epoch-6500}}});
 try{await waitFor(()=>active.train.tRun);assert.equal(active.train.tSec,11);}finally{active.close();}
 let release;const pending=new Promise(resolve=>release=resolve);
 const race=await mountTraining({}, {onRead:({user_id})=>user_id==='sdd-user-001'?pending:{data:{value:{running:false,baseSec:2,startedAt:null}},error:null}});
 try{
  await race.call(race.state.setUserId,'other');await waitFor(()=>race.train.tSec===2);
  release({data:{value:{running:false,baseSec:77,startedAt:null}},error:null});
  await waitFor(()=>race.train.tSec===77); // TRAIN-001 observado: respuesta previa sobrescribe timer del nuevo usuario.
 }finally{race.close();}
 const failed=await mountTraining({}, {onRead:()=>({data:null,error:{message:'fallo timer'}})});
 try{await waitFor(()=>failed.loggedErrors.length>0);assert.equal(failed.train.tSec,0);}finally{failed.close();}
});
