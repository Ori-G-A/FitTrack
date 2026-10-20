import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo metricas y diario conservan selectores y formatos",async()=>{
const weights=[weight('a','2026-10-01',70),weight('b','2026-10-10',69),weight('c',today,68)],measurements=[{id:'a',date:'2026-10-01',cintura:0},{id:'b',date:today,cintura:80,cadera:-1}],wellness=Array.from({length:6},(_,i)=>({id:'b'+i,date:'2026-09-'+String(15+i).padStart(2,'0'),restingHr:60})).concat([{id:'r',date:today,sleep:5,restingHr:70,steps:100},{id:'prev',date:'2026-10-17',steps:200},{id:'zero',date:'2026-10-16',steps:0}]);const h=await mountBody({view:'dashboard',weights,measurements,wellness,goals:{startWeight:'60',weeklyChange:-.7}});try{
 const d=h.dashboard,a=h.modules.app;assert.equal(d.currentW,68);assert.equal(d.change7,-1);assert.equal(d.weightChart[0].objetivo,60);assert.equal(d.weightChart.at(-1).objetivo,58.3);assert.equal(d.measDelta('cintura'),80);assert.equal(d.measDelta('cadera'),null);assert.equal(d.sleep.avg7,5);assert.equal(d.sleep.short,1);assert.equal(d.hr.base,60);assert.equal(d.hr.last,70);
 const steps=a.stepsToday(wellness,today);assert.equal(steps.today,100);assert.equal(steps.avg,200);const feed=a.dayFeed(today,{weights,measurements,wellness});assert.equal(feed.length,3);assert.equal(feed[0].tab,'peso');assert.equal(feed[1].meta,'cintura 80 cm');assert(feed.every(x=>x.date===today));assert.equal(a.dayFeed(today,{wellness:[{date:today,restingHr:60}]}).length,0);assert.equal(a.dayFeed(today,{wellness:[{date:today,sleep:0}]}).length,1);assert(a.searchFeed('cintura',{measurements}).length>=1);
const dupSteps=a.stepsToday([{date:'2026-10-17',steps:200},{date:'2026-10-17',steps:400}],today);assert.equal(dupSteps.avg,300);assert.equal(dupSteps.days,2);await h.call(h.state.setWellness,[...wellness.filter(x=>x.id.startsWith('b')).slice(0,4),{date:today,sleep:5,restingHr:70},{date:'2026-10-19',sleep:9,restingHr:80}]);assert.equal(h.dashboard.hr.base,null);assert.equal(h.dashboard.sleep.avg7,7);
 }finally{h.close();}
});
