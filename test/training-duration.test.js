import test from 'node:test';
import assert from 'node:assert/strict';
import {mountTraining} from '../test-support/training-dom.js';
test('entrenamiento duracion manual eventos y limpieza',async()=>{
 const a=await mountTraining();
 try{
  assert.equal(a.state.workouts.length,0);
  assert.equal(a.w.__trainingWrites.length,0);
  await a.input('input[aria-label="Minutos de la sesión (editar a mano)"]','12');
  await a.advance(999);assert.equal(a.state.workouts.length,0);
  await a.advance(1);assert.equal(a.train.session.durationMin,12);
  assert.equal(a.w.__trainingWrites.length,1);
  await a.input('input[aria-label="Minutos de la sesión (editar a mano)"]','-2');
  const input=a.w.document.querySelector('input[aria-label="Minutos de la sesión (editar a mano)"]');
  input.focus();input.dispatchEvent(new a.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await a.flush();
  assert.equal(a.train.session.durationMin,-2);
  assert.equal(a.w.__trainingWrites.length,3); // Enter y blur escriben ambos, AS-IS.
  await a.input('input[aria-label="Minutos de la sesión (editar a mano)"]','4');
  input.focus();input.blur();await a.flush();assert.equal(a.train.session.durationMin,4);
  assert.equal(a.w.__trainingWrites.length,4);
  await a.call(a.train.setDurInput,'');await a.advance(1000);assert.equal(a.state.workouts.length,0);
  const writes=a.w.__trainingWrites.length;
  await a.call(a.train.setDurInput,'8');await a.call(a.train.setDate,'2026-10-16');await a.advance(1000);
  assert.equal(a.state.workouts.length,0);
  assert.equal(a.w.__trainingWrites.length,writes);
  await a.call(a.train.setDurInput,'3');await a.call(a.state.setView,'plan');await a.advance(1000);
  assert.equal(a.state.workouts.length,0);assert.equal(a.errors.length,0);
 }finally{a.close();}
});
