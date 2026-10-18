import test from 'node:test';
import assert from 'node:assert/strict';
import {weightPaceAlert as alert,PACE_ALERT} from '../src/settings-utils.js';
import {addDays} from '../src/date-utils.js';
import {paceWeights,paceGoals,today} from '../test-support/nutrition-fixtures.js';
test('nutricion ritmo conserva guardas ventana limites y redondeos',()=>{
 const w=paceWeights();const a=alert(w,paceGoals,today);assert.equal(a.next,2300);assert.equal(a.limited,'step');assert.equal(a.rawKcal,550);assert.equal(a.days,21);assert.equal(a.points,22);assert.equal(a.from,'2026-09-27');assert.equal(a.to,today);
 for(const goal of [{weeklyChange:'x',kcalTarget:2000},{weeklyChange:0,kcalTarget:0}])assert.equal(alert(w,goal,today),null);
 assert.equal(alert(w.slice(0,7),paceGoals,today),null);assert.equal(alert(w.slice(-17),paceGoals,today),null);assert.notEqual(alert(w.slice(-18),paceGoals,today),null);
 assert.equal(alert(w,{...paceGoals,paceCheckedAt:today},today),null);
 assert.equal(alert(paceWeights(-.54),paceGoals,today),null);assert.equal(alert(paceWeights(-.55),paceGoals,today).drift,-.15);
 const floor=alert(paceWeights(-.1),{...paceGoals,kcalTarget:1600},today);assert.equal(floor.next,1533);assert.equal(floor.limited,'floor');
 const low=alert(paceWeights(-.1,{from:40}),{...paceGoals,kcalTarget:1500},today);assert.equal(low.next,1400);assert.equal(low.floor,1400);
 assert.equal(alert(paceWeights(-.1,{from:40}),{...paceGoals,kcalTarget:1400},today),null);
 const dirty=[...w,{date:addDays(today,1),kg:1},{date:today,kg:0},{date:'2026-09-26',kg:99}];assert.deepEqual(alert(dirty,paceGoals,today),a);
 assert.equal(PACE_ALERT.windowDays,21);assert.equal(PACE_ALERT.minPoints,8);
 const sparse=w.filter((_,i)=>[0,3,6,9,12,15,18,21].includes(i));assert.equal(alert(sparse,paceGoals,today).points,8);
});
