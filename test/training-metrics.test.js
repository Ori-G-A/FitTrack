import test from 'node:test';
import assert from 'node:assert/strict';
import * as u from '../src/app-utils.js';
import {mountTraining,plain} from '../test-support/training-dom.js';
const workout=(date,kg,rpe='7',name='Press banca')=>({date,exercises:[{name,sets:[{kg:String(kg),reps:'6',rpe}]}]});
test('entrenamiento metricas historial y fronteras',async()=>{
 assert.equal(u.canonExercise('Press de pecho con mancuernas (banco plano)'),'Press banca');
 assert.equal(u.canonExercise('Press inclinado con mancuernas'),'Press inclinado');
 assert.equal(u.canonExercise(''), '');
 assert.equal(u.epley(50,6),60);for(const [kg,reps]of [[0,6],[-1,6],[50,0],[50,-2]])assert.equal(u.epley(kg,reps),0);
 const h=[workout('2026-08-20',50),workout('2026-09-01',55),workout('2026-10-15',60)];
 assert.deepEqual(u.loadProgressHighlight(h,'2026-10-15'),{name:'Press banca',from:60,to:72,pct:20,sessions:3,series:[60,66,72]});
 assert.equal(u.loadProgressHighlight(h.slice(1),'2026-10-15'),null);
 assert.equal(u.loadProgressHighlight(h,'2026-10-16'),null);
 assert.equal(u.loadProgressHighlight(h.map(w=>({...w,date:'2026-10-16'})),'2026-10-15'),null);
 assert.equal(u.loadProgressHighlight([workout('2026-09-01',60),workout('2026-09-02',55),workout('2026-09-03',50)],'2026-10-15'),null);
 const tie=h.concat(h.map(w=>({...w,exercises:w.exercises.map(e=>({...e,name:'Remo'}))})));
 assert.equal(u.loadProgressHighlight(tie,'2026-10-15').name,'Press banca');
 assert.deepEqual(u.matchedLoadRpeTrend([workout('2026-10-01',40,'7'),workout('2026-10-02',40,'7.5'),workout('2026-10-03',40,'8')]),{fatigue:{name:'Press banca',kg:40,reps:6,from:7,to:8},fatigueCount:1,progress:null});
 const down=[workout('2026-10-01',40,'9'),workout('2026-10-02',40,'8.5'),workout('2026-10-03',40,'8')];
 assert.equal(u.matchedLoadRpeTrend(down).progress.to,8);
 assert.equal(u.matchedLoadRpeTrend(down.map((w,i)=>({...w,exercises:[{name:'Press banca',sets:[{kg:40+i,reps:6,rpe:9-i}]}]}))).progress,null);
 const now={id:'cur',date:'2026-10-15',durationMin:0,cardio:[],exercises:[{id:'e',name:'Press banca',sets:[{kg:'20',reps:'8',rpe:'7'},{kg:'0',reps:'',rpe:'0'},{kg:'10',reps:'3',rpe:'8'}]}]};
 const history=[workout('2026-10-12',99),{date:'2026-10-14',exercises:[{name:'Press banca',sets:[{kg:'40',reps:'10',rpe:'7'},{kg:'40',reps:'5',rpe:'8'}]}]},now,workout('2026-10-16',120)];
 const a=await mountTraining({workouts:history});
 try{
  assert.deepEqual(plain(a.train.lastPerformance['Press banca']),{kg:40,reps:5,rpe:'8',date:'2026-10-14'});
  assert.equal(a.train.totalVol,190);assert.equal(a.train.totalSets,3);assert.equal(a.train.avgRpe,7.5);
  await a.call(a.train.setDate,'2020-01-01');assert.equal(a.train.avgRpe,null);assert.equal(a.train.totalVol,0);assert.deepEqual(plain(a.train.lastPerformance),{});
 }finally{a.close();}
});
test('entrenamiento consejo y ajustes conservan registros',()=>{
 assert.deepEqual(u.parseRpeTarget('7,5–8,5'),[7.5,8.5]);assert.equal(u.parseRpeTarget('—'),null);assert.deepEqual(u.parseRpeTarget(8),[8,8]);
 const advice=(rpe,targetRpe='7–8',kg=80,muscle='Pecho')=>u.nextSetAdvice({rpe,targetRpe,kg,muscle});
 assert.equal(advice(''),null);assert.equal(advice('8','—'),null);
 assert.equal(advice('9').kg,74.5);assert.equal(advice('8.99').kind,'hold');assert.equal(advice('6').kg,82.5);assert.equal(advice('6.01').kind,'hold');
 assert.equal(advice('9.5','—').kind,'backoff');assert.equal(advice('9.5','8–9').kind,'hold');
 assert.equal(advice('6','7–8',80,'Cuádriceps').kg,85);assert.equal(advice('6','7–8',0).kg,null);
 const logged={id:'s1',reps:'2',kg:'20',rpe:'8'}, pending={id:'s2',reps:'',kg:'20'};
 const exercises=[{id:'e',sets:[logged,pending]},{id:'other',sets:[logged]}];
 const out=u.applyAdjustments(exercises,[{id:'e',kg:0}]);assert.equal(out[0].sets[0],logged);assert.equal(out[0].sets[1].kg,'');assert.equal(out[1],exercises[1]);
 assert.deepEqual(u.applyAdjustments(exercises,[{id:'e',removed:true}]),[exercises[1]]);
 assert.equal(u.applyAdjustments([exercises[1]],[{id:'other',kg:50}])[0],exercises[1]); 
});
