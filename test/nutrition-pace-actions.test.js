import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNutrition,plain} from '../test-support/nutrition-dom.js';
import {paceWeights,paceGoals,today} from '../test-support/nutrition-fixtures.js';
test('nutricion ritmo conserva aplicar descartar snapshot y deshacer',async()=>{
 const a=await mountNutrition({view:'diario',weights:paceWeights(),goals:paceGoals});try{
  const original=plain(a.state.goals);await a.call(a.w.__paceActions.applyPace);assert.equal(a.state.goals.kcalTarget,2300);assert.equal(a.state.goals.autoMacros,false);assert.equal(a.state.goals.paceCheckedAt,today);assert.equal(a.w.__paceRead.alert,null);
  await a.call(a.state.setGoals,g=>({...g,extra:'reciente',targetWeight:50}));await a.call(a.w.__paceActions.undoPace);
  assert.equal(a.state.goals.kcalTarget,original.kcalTarget);assert.equal(a.state.goals.autoMacros,true);assert.equal(a.state.goals.paceCheckedAt,'');assert.equal(a.state.goals.extra,'reciente');assert.equal(a.state.goals.targetWeight,50);
  await a.call(a.w.__paceActions.dismissPace);assert.equal(a.state.goals.kcalTarget,2000);assert.equal(a.state.goals.autoMacros,true);assert.equal(a.state.goals.paceCheckedAt,today);await a.call(a.w.__paceActions.undoPace);assert.equal(a.state.goals.paceCheckedAt,'');assert.equal(a.w.__paceActions.paceDone,null);
 }finally{a.close();}
});
