import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNutrition,plain} from '../test-support/nutrition-dom.js';
import {today} from '../test-support/nutrition-fixtures.js';
import {addDays} from '../src/date-utils.js';
test('nutricion alertas conservan mantenimiento proteina y otras metricas',async()=>{
 const a=await mountNutrition();try{
  const {alertMetrics:metrics,buildAlerts:alerts}=a.modules.alerts;
  const nutrition=Array.from({length:10},(_,i)=>({date:addDays(today,-i),kcal:2000,protein:84}));
  const weights=[{date:'2026-10-01',kg:70},{date:today,kg:70}];
  const m=metrics({nutrition,weights});assert.equal(m.trend,0);assert.deepEqual(plain(m.maintenance),{maint:2000,days:10,avgKcal:2000});assert.equal(m.protAvg7,84);
  assert.equal(metrics({nutrition:nutrition.slice(1),weights}).maintenance,null);assert.equal(metrics({nutrition}).maintenance,null);
  const bound=[...nutrition,{date:'2026-09-20',kcal:50,protein:1000},{date:'2026-09-19',kcal:99999,protein:999},{date:'2026-10-19',kcal:2200,protein:120}];
  assert.deepEqual(plain(metrics({nutrition:bound,weights}).maintenance),{maint:2018,days:11,avgKcal:2018});assert.equal(metrics({nutrition:bound,weights}).protAvg7,88);
  bound[10].kcal=51;assert.equal(metrics({nutrition:bound,weights}).maintenance.days,12);
  const warning=plain(alerts(m,{proteinTarget:100,weeklyChange:0,kcalTarget:2000}).find(x=>x.card==='macros'));assert.deepEqual(warning,{type:'warn',card:'macros',title:'Proteína por debajo del objetivo',body:'Media de 84 g/día la última semana frente a tu meta de 100 g.',key:'macros:proteina-por-debajo-del-objetivo'});
  assert(!alerts({...m,protAvg7:85},{proteinTarget:100,weeklyChange:0,kcalTarget:2000}).some(x=>x.card==='macros'));
  const changed=metrics({nutrition:bound,weights});for(const key of ['trend','currentMA','cycle','lastTrain','projection','lowEnergyDays'])assert.deepEqual(plain(changed[key]),plain(m[key]));
  const baseAlerts=alerts(m,{weeklyChange:0,kcalTarget:2000});assert.deepEqual(plain(alerts({...m,protAvg7:null},{weeklyChange:0,kcalTarget:2000})),plain(baseAlerts));
 }finally{a.close();}
});
