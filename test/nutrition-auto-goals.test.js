import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNutrition} from '../test-support/nutrition-dom.js';
test('nutricion objetivos conservan edicion efecto automatico y montaje',async()=>{
 const a=await mountNutrition({view:'account',weights:[{date:'2026-10-18',kg:60}],goals:{autoMacros:false,extra:'keep',weeklyChange:-.4}});
 try{
  assert.equal(a.settings.referenceWeight,60);await a.call(a.settings.updateGoal,'kcalTarget','2222');assert.equal(a.state.goals.kcalTarget,'2222');
  await a.call(a.settings.updateGoal,'proteinPerKg',2.2);assert.equal(a.state.goals.proteinPerKg,2.2);
  await a.call(a.settings.updateGoal,'autoMacros',true);assert.equal(a.state.goals.kcalTarget,1480);assert.equal(a.state.goals.proteinTarget,132);assert.equal(a.state.goals.extra,'keep');
  const writes=a.w.__nutWrites.length;await a.call(()=>{});assert.equal(a.w.__nutWrites.length,writes);
  await a.button('DATOS Y CONFIGURACIÓN');assert.equal(a.settings.section,'datos');await a.call(a.state.setWeights,[{date:'2026-10-18',kg:70}]);assert.equal(a.state.goals.kcalTarget,1800);assert.equal(a.state.goals.proteinTarget,154);
  await a.call(a.state.setView,'nutrition');await a.call(a.state.setWeights,[{date:'2026-10-18',kg:80}]);assert.equal(a.state.goals.kcalTarget,1800);
  await a.call(a.state.setView,'settings');assert.equal(a.state.goals.kcalTarget,2120);await a.call(a.settings.updateGoal,'startWeight','50');assert.equal(a.settings.referenceWeight,50);assert.equal(a.state.goals.kcalTarget,1160);
  await a.call(a.settings.updateGoal,'weeklyChange',.25);assert.equal(typeof a.state.goals.weeklyChange,'number');
 }finally{a.close();}
 const b=await mountNutrition({view:'settings',section:'datos',goals:{autoMacros:true,startWeight:'',kcalTarget:'1500'}});try{assert.equal(b.state.goals.kcalTarget,'1500');assert.equal(b.w.__nutWrites.length,0);}finally{b.close();}
});
