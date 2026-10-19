import test from 'node:test';
import assert from 'node:assert/strict';
import {weightVsExpected as compare} from '../src/settings-utils.js';
import {paceWeights,today} from '../test-support/nutrition-fixtures.js';
import {addDays} from '../src/date-utils.js';
test('nutricion real esperado conserva ancla direccion y proyeccion',()=>{
 const w=paceWeights(-.6,{from:72});const g={weeklyChange:-.4,targetWeight:68};const v=compare(w,g,today);
 assert.equal(v.expected,70.8);assert.equal(v.real,70.2);assert.equal(v.delta,-.6);assert.equal(v.ahead,true);assert.equal(v.series.length,22);assert(v.projection>today);
 assert.equal(compare(w,{...g,startWeight:'75'},today).expected,73.8);
 const old=[{date:'2025-01-01',kg:90},...w];assert.equal(compare(old,{...g,startWeight:'75'},today).expected,70.8);
 assert.equal(compare([{date:today,kg:70}],g,today),null);assert.equal(compare([{date:'2025-01-01',kg:80},w[0]],g,today),null);
 assert.deepEqual(compare([...w,{date:addDays(today,1),kg:999},{date:today,kg:0}],g,today),v);
 assert.equal(compare(paceWeights(.3,{from:72}),g,today).projection,null);assert.equal(compare(w,{...g,weeklyChange:0},today).ahead,null);
 assert.equal(compare(w,{...g,targetWeight:-1000},today).projection,null);
 const edge=[{date:addDays(today,-84),kg:80},{date:today,kg:70}];assert.equal(compare(edge,g,today).anchorDate,addDays(today,-84));assert.equal(compare([{...edge[0],date:addDays(today,-85)},edge[1]],g,today),null);
 const target=v.real+v.perWeek*104;assert(compare(w,{...g,targetWeight:target},today).projection);assert.equal(compare(w,{...g,targetWeight:target-.1},today).projection,null);
});
