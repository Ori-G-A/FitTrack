import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNutrition,plain} from '../test-support/nutrition-dom.js';
import {today} from '../test-support/nutrition-fixtures.js';
test('nutricion metricas conservan series medias ventanas y macros',async()=>{
 const row=(date,kcal,protein=10)=>({date,kcal,protein,carbs:20,fat:5});
 const workout=(date,cardio=false)=>({date,exercises:cardio?[]:[{name:'Prueba',sets:[]}],cardio:cardio?[{}]:[]});
 const a=await mountNutrition({view:'dashboard',nutrition:[row('2026-10-05',100.4),row(today,200.5),row('2026-10-19',600),row('2026-10-04',900)],workouts:[workout('2026-10-11'),workout('2026-10-11'),workout('2026-10-19',true),{date:today,exercises:[],cardio:[]},workout('2026-10-10')],goals:{kcalTarget:2000,proteinTarget:100}});
 try{
  const d=a.w.__nutDashboard;assert.equal(d.kcalChart.length,14);assert.equal(d.kcalChart[0].kcal,100);assert.equal(d.kcalChart.at(-1).kcal,201);assert.equal(d.kcalAvg,151);
  assert.deepEqual(plain(d.macro14),{p:10,c:20,f:5,k:300.3,days:3});assert.equal(d.trainingDays7,2);assert.equal(d.nutDays7,2);
  assert.equal(d.macroTargets.p,100);assert(Math.abs(d.macroTargets.c-197.14285714285717)<1e-9);assert(Math.abs(d.macroTargets.f-90.15873015873015)<1e-9);
  await a.call(a.state.setWorkouts,Array.from({length:8},(_,i)=>workout('2026-10-'+String(11+i).padStart(2,'0'))));assert.equal(a.w.__nutDashboard.trainingDays7,8);assert.equal(a.w.__nutDashboard.macroTargets.c,240);
  await a.call(a.state.setWorkouts,[]);assert.equal(a.w.__nutDashboard.macroTargets.c,180);
  await a.call(a.state.setGoals,g=>({...g,kcalTarget:200,proteinTarget:100}));assert.deepEqual(plain(a.w.__nutDashboard.macroTargets),{p:100,c:0,f:0});
  await a.call(a.state.setGoals,g=>({...g,kcalTarget:'',proteinTarget:''}));assert.deepEqual(plain(a.w.__nutDashboard.macroTargets),{p:null,c:null,f:null});
  await a.call(a.state.setNutrition,[]);assert.equal(a.w.__nutDashboard.macro14,null);assert.equal(a.w.__nutDashboard.kcalAvg,null);assert.equal(a.w.__nutDashboard.nutDays7,0);
  assert.deepEqual(a.errors,[]);
 }finally{a.close();}
});
