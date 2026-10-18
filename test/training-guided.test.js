import test from 'node:test';
import assert from 'node:assert/strict';
import {mountTraining,waitFor} from '../test-support/training-dom.js';
test('entrenamiento sesion guiada registro correccion y salida',async()=>{
 const exercises=[{id:'done',name:'Remo',primary:'Espalda',sets:[{id:'s0',reps:'8',kg:'20',rpe:'7'}]},
 {id:'e',name:'Press banca',primary:'Pecho',targetReps:'10',targetRpe:'7–8',sets:[{id:'s1',reps:'',kg:'',rpe:''},{id:'s2',reps:'',kg:'',rpe:''}]}];
 const a=await mountTraining({workouts:[{id:'old',date:'2026-10-14',exercises:[{name:'Press banca',sets:[{kg:'30',reps:'6'}]}]},{id:'w',date:'2026-10-15',exercises,durationMin:1,cardio:[]}]});
 try{
  await a.call(a.train.setInSession,true);await waitFor(()=>a.guided);
  assert.equal(a.guided.index,1);assert.equal(a.guided.draft.reps,10);assert.equal(a.guided.draft.kg,30);
  assert.ok(a.w.document.querySelector('.ft-root').classList.contains('ft-focus'));
  await a.call(a.guided.setDraft,{reps:9,kg:40,rpe:'9'});await a.call(a.guided.register);
  assert.equal(a.state.workouts.at(-1).exercises[1].sets[0].reps,'9');assert.equal(a.guided.advice.kind,'backoff');assert.equal(a.guided.draft.kg,37);
  await a.call(a.guided.setEditingSetId,'s1');await a.call(a.guided.setDraft,{reps:7,kg:0,rpe:''});await a.call(a.guided.register);
  assert.equal(a.state.workouts.at(-1).exercises[1].sets[0].kg,'');assert.equal(a.guided.advice,null);
  await a.call(a.guided.setDraft,{reps:8,kg:20,rpe:'8'});await a.call(a.guided.register);
  await a.call(a.guided.addExtraSet);assert.equal(a.state.workouts.at(-1).exercises[1].sets.length,3);
  await a.call(a.guided.goTo,0);assert.equal(a.guided.index,0);
  await a.advance(90000,{ticks:false});assert.equal(a.guided.elapsed,0); // TRAIN-002 conserva ticks.
  await a.advance(30000);await a.button('Salir');assert.equal(a.train.session.durationMin,1);
  assert.ok(!a.w.document.querySelector('.ft-root').classList.contains('ft-focus'));
  await a.call(a.train.setInSession,true);await waitFor(()=>a.w.document.querySelector('.ft-session'));
  await a.advance(90000);await a.button('Salir');assert.equal(a.train.session.durationMin,2);
  assert.equal(a.errors.length,0);
 }finally{a.close();}
 const complete=await mountTraining({workouts:[{id:'w',date:'2026-10-15',exercises:[exercises[0]],durationMin:0,cardio:[]}]});
 try{
  await complete.call(complete.train.setInSession,true);await waitFor(()=>complete.guided);
  assert.equal(complete.guided.index,0);assert.equal(complete.guided.draft.reps,8);assert.equal(complete.guided.draft.kg,20);
  const before=JSON.stringify(complete.state.workouts);
  await complete.call(complete.guided.register);assert.equal(JSON.stringify(complete.state.workouts),before);
  await complete.call(complete.guided.setEditingSetId,'s0');
  assert.equal(complete.guided.draft.rpe,'7');assert.equal(complete.guided.draft.kg,20);
  await complete.call(complete.state.setView,'plan');
  assert.ok(!complete.w.document.querySelector('.ft-root').classList.contains('ft-focus'));
  assert.equal(complete.intervals.size,0);
 }finally{complete.close();}
});
