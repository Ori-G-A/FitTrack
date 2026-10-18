import test from 'node:test';
import assert from 'node:assert/strict';
import { mountTraining, plain } from '../test-support/training-dom.js';

test('entrenamiento sesion por fecha orden y vaciado', async () => {
 const old={id:'old',date:'2026-10-14',exercises:[],durationMin:7,cardio:[]};
 const current={id:'cur',date:'2026-10-15',exercises:[],durationMin:3,cardio:[],extra:'conservar'};
 const a=await mountTraining({workouts:[current,old,{...current,id:'duplicate'}]});
 try {
  await a.call(a.train.writeSession,{durationMin:5});
  assert.deepEqual(plain(a.state.workouts),[old,{...current,durationMin:5}]);
  await a.call(a.train.writeSession,{durationMin:0});
  assert.deepEqual(plain(a.state.workouts),[old]);
  await a.call(a.train.writeSession,{durationMin:2});
  const row=plain(a.state.workouts.at(-1));assert.equal(row.date,'2026-10-15');assert.equal(row.durationMin,2);assert.ok(row.id);assert.deepEqual(row.exercises,[]);
  await a.call(a.train.setDate,'2026-11-01');await a.call(a.train.writeSession,{durationMin:1});
  assert.equal(a.state.workouts.at(-1).date,'2026-11-01');assert.equal(a.state.workouts.length,3);
 } finally {a.close();}
});

test('entrenamiento carga completa minima y calentamiento', async () => {
 const routine={id:'r',name:'Propia',exercises:[{name:'Press banca',targetSets:2,targetReps:8,targetRpe:'7–8',notes:'nota'}],minimal:{durationMin:5,exercises:[{name:'Plancha',targetSets:0}]}};
 const a=await mountTraining({routines:[routine]});
 try{
  await a.call(a.train.loadRoutine,'');assert.equal(a.state.workouts.length,0);
  await a.call(a.train.loadRoutine,'0');await a.call(a.train.loadRoutine,'0');
  const es=a.train.exercises;assert.equal(es.length,2);assert.equal(es[0].primary,'Pecho');assert.equal(es[0].targetReps,'8');assert.equal(es[0].notes,'nota');
  assert.deepEqual(plain(es[0].sets).map(({id,...s})=>s),[{reps:'',kg:'',rpe:''},{reps:'',kg:'',rpe:''}]);
  const ids=es.flatMap(e=>[e.id,...e.sets.map(s=>s.id)]);assert.equal(new Set(ids).size,6);
  await a.call(a.train.loadMinimal,'0');assert.equal(a.train.exercises.at(-1).sets.length,1);
  assert.equal(a.train.session.durationMin,0);assert.equal(a.train.minimalMin(routine),5);
  const tpl=a.config.ROUTINE_TEMPLATES.find(t=>t.minimalVersion);
  assert.equal(a.train.minimalFor({templateId:tpl.id}).length,tpl.minimalVersion.exercises.length);
  assert.equal(a.train.minimalFor({name:'desconocida'}),null);
  assert.equal(a.train.minimalMin({name:'desconocida'}),null);
  await a.call(a.train.loadWarmup);assert.equal(a.train.session.durationMin,a.config.WARMUP.durationMin);
  assert.equal(a.train.exercises.length,3+a.config.WARMUP.exercises.length);
  assert.equal(a.train.exercises.at(-1).targetReps,String(a.config.WARMUP.exercises.at(-1).dose));
 }finally{a.close();}
});

test('entrenamiento edicion series ejercicios y cardio',async()=>{
 const a=await mountTraining({routines:[{id:'r',suggestedDay:4,exercises:[{name:'Press banca'},{name:'Press banca'},{name:'Otra'}]},{id:'r2',suggestedDay:4,exercises:[{name:'Press banca'}]}]});
 try{
  await a.call(a.train.setName,'   ');await a.call(a.train.addExercise);assert.equal(a.train.exercises.length,0);
  await a.call(a.train.setName,' Press banca ');await a.call(a.train.setSecondary,['Pecho','Tríceps']);await a.call(a.train.addExercise);
  let e=a.train.exercises[0];assert.equal(e.name,'Press banca');assert.deepEqual(plain(e.secondary),['Tríceps']);
  await a.call(a.train.delSet,e.id,e.sets[0].id);assert.equal(a.train.exercises[0].sets.length,1);
  await a.call(a.train.addSet,e.id);e=a.train.exercises[0];
  await a.call(a.train.editSet,e.id,e.sets[0].id,'reps','8');await a.call(a.train.editSet,e.id,e.sets[0].id,'kg','20');
  await a.call(a.train.setExerciseLoad,e.id,30);
  assert.equal(a.train.exercises[0].sets[0].kg,'20');assert.equal(a.train.exercises[0].sets[1].kg,'30');
  await a.call(a.train.delSet,e.id,e.sets[1].id);assert.equal(a.train.exercises[0].sets.length,1);
  await a.call(a.train.addCardio);assert.equal(a.train.session.cardio.length,0);
  await a.call(a.train.setCardio,{type:'Bici',minutes:'12',kcal:''});await a.call(a.train.addCardio);
  const cardio=a.train.session.cardio[0];assert.equal(cardio.minutes,12);assert.equal(cardio.kcal,0);
  await a.call(a.train.delExEverywhere,e.id);
  assert.deepEqual(plain(a.state.routines[0].exercises),[{name:'Otra'}]);assert.equal(a.state.routines[1].exercises.length,1);
  assert.equal(a.train.exercises.length,0);await a.call(a.train.delCardio,cardio.id);assert.equal(a.state.workouts.length,0);
 }finally{a.close();}
});
