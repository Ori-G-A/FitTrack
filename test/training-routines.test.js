import test from 'node:test';
import assert from 'node:assert/strict';
import {mountTraining,plain} from '../test-support/training-dom.js';
test('entrenamiento rutinas plantillas y biblioteca',async()=>{
 const a=await mountTraining({view:'library'});
 try{
  await a.call(a.w.__library.loadTemplates);
  const count=a.config.ROUTINE_TEMPLATES.length;assert.equal(a.state.routines.length,count);
  await a.call(a.w.__library.loadTemplates);assert.equal(a.state.routines.length,count);
  const mapped=a.config.templateToAppRoutine(a.config.ROUTINE_TEMPLATES[0],()=> 'id');
  assert.equal(mapped.name,a.config.ROUTINE_TEMPLATES[0].name);assert.equal(mapped.exercises[0].targetReps,String(a.config.ROUTINE_TEMPLATES[0].exercises[0].reps));
  assert.ok(a.state.routines.some(r=>r.minimal));assert.equal(a.config.guessPrimaryMuscle('Jalón al pecho'),'Espalda');
  assert.equal(a.config.guessEquipmentLevel('Bisagra sin peso o con banda'),0);assert.equal(a.config.routinePlace({exercises:[{name:'Plancha'},{name:'Prensa'}]}),'gimnasio');
  const original=plain(a.state.routines[0]);
  await a.call(a.w.__library.setOpen,original.id);await a.call(a.w.__library.saveRoutine,{name:'Editada',exercises:original.exercises});
  assert.equal(a.state.routines[0].templateId,original.templateId);assert.deepEqual(plain(a.state.routines[0].minimal),original.minimal);
  await a.call(a.w.__library.setOpen,'nuevo');await a.flush();
  await a.input('input[placeholder="Ej. Día A · Empuje"]','Nueva');
  await a.input('input[placeholder="O escríbelo"]','Remo');await a.button('Añadir');
  await a.button('Guardar rutina');assert.equal(a.state.routines.at(-1).name,'Nueva');assert.equal(a.state.routines.at(-1).exercises[0].targetSets,3);
  await a.call(a.w.__library.setOpen,a.state.routines.at(-1).id);await a.button('Eliminar');
  assert.equal(a.state.routines.length,count);
  await a.call(a.state.setView,'train');await a.call(a.train.loadRoutine,'0');
  const before=a.state.routines.length;a.w.prompt=()=>null;await a.call(a.train.saveDayAsRoutine);assert.equal(a.state.routines.length,before);
  a.w.prompt=()=> ' Guardada ';await a.call(a.train.saveDayAsRoutine);
  const saved=a.state.routines.at(-1);assert.equal(saved.name,'Guardada');assert.equal(saved.exercises[0].targetSets,a.train.exercises[0].sets.length);
  assert.equal(a.errors.length,0);
 }finally{a.close();}
});
