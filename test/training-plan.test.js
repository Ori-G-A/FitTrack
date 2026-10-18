import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mondayOf,planWeek,planCompliance,weekNumber} from '../src/app-utils.js';
import {mountTraining,plain} from '../test-support/training-dom.js';
const session=date=>({date,exercises:[{sets:[{reps:'1'}]}]});
test('entrenamiento semana cumplimiento y asignacion',async()=>{
 assert.equal(mondayOf('2026-01-04'),'2025-12-29');
 const routines=[{id:'a',suggestedDay:1,exercises:[]},{id:'b',suggestedDay:4,exercises:[]}];
 let week=planWeek(routines,[session('2026-10-13')],'2026-10-15');
 assert.deepEqual(week.map(d=>d.state),['perdido','hecho','libre','hoy','libre','libre','libre']);
 assert.equal(planWeek(routines,[],'2026-10-12')[3].state,'previsto');
 assert.equal(planWeek(routines,[{date:'2026-10-12',exercises:[{sets:[{reps:'0'}]}]}],'2026-10-12')[0].state,'hoy');
 const compliance=planCompliance(routines,[session('2026-10-05'),session('2026-10-08'),session('2026-10-13')],'2026-10-15');
 assert.equal(compliance.done,2);assert.equal(compliance.planned,16);assert.equal(compliance.full,1);assert.equal(compliance.adherence,13);
 assert.equal(planCompliance([],[],'2026-10-15').adherence,null);
 const duplicates=[...routines,{id:'c',suggestedDay:1},{id:'extra',suggestedDay:9},{id:'empty',suggestedDay:''}];
 assert.equal(planWeek(duplicates,[],'2026-10-15')[0].routine.id,'a');
 const repeated=planCompliance(duplicates,[session('2026-10-05'),session('2026-10-05')],'2026-10-15');
 assert.equal(repeated.perWeek,4);assert.equal(repeated.done,2);assert.equal(repeated.weeks.length,8);
 assert.equal(planWeek(routines,[{date:'2026-10-12',exercises:[]},session('2026-10-12')],'2026-10-12')[0].sets,0);
 assert.equal(weekNumber([],'2026-10-15'),null);assert.equal(weekNumber([session('2026-10-05')],'2026-10-15'),2);
 for(const tz of ['UTC','America/Bogota','America/New_York']){
  const r=spawnSync(process.execPath,['--input-type=module','-e',"import {addDays,mondayOf,daysBetween} from './src/app-utils.js'; console.log(JSON.stringify([addDays('2026-03-08',1),mondayOf('2026-03-08'),daysBetween('2026-03-08','2026-03-09')]));"],{env:{...process.env,TZ:tz},encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);assert.deepEqual(JSON.parse(r.stdout),['2026-03-09','2026-03-02',1]);
 }
 const a=await mountTraining({view:'plan',routines});
 try{
  await a.call(a.w.__plan.assign,4,'a');assert.deepEqual(plain(a.state.routines).map(r=>[r.id,r.suggestedDay]),[['a',4],['b',null]]);
  await a.call(a.w.__plan.assign,4,'');assert.deepEqual(plain(a.state.routines).map(r=>r.suggestedDay),[null,null]);
  assert.equal(a.errors.length,0);
 }finally{a.close();}
});
