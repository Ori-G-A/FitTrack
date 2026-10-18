import test from 'node:test';
import assert from 'node:assert/strict';
import {proteinAdherence} from '../src/app-utils.js';
import {mountNutrition,plain} from '../test-support/nutrition-dom.js';
import {today} from '../test-support/nutrition-fixtures.js';
test('nutricion adherencia conserva ventana dias registrados y umbral',async()=>{
 const ns=[{date:'2026-10-11',protein:100},{date:'2026-10-12',protein:44.6},{date:'2026-10-12',protein:45},{date:'2026-10-18',protein:'89.49'},{date:'2026-10-19',protein:200}];
 const wanted={onTarget:1,logged:2,days:7,target:100,avg:90,series:[90,89]};assert.deepEqual(proteinAdherence(ns,'100',today),wanted);
 assert.equal(proteinAdherence(ns,0,today),null);assert.equal(proteinAdherence([],100,today),null);assert.equal(proteinAdherence([{date:today,protein:'x'}],100,today).avg,0);
 assert.deepEqual(proteinAdherence(ns,100,today,1).series,[89]);
 const a=await mountNutrition({nutrition:ns.map((n,i)=>({...n,id:'n'+i,name:'Test',kcal:0})),goals:{proteinTarget:100}});try{assert.deepEqual(plain(a.n.adherence),wanted);await a.call(a.state.setView,'diario');assert.deepEqual(plain(a.w.__paceRead.protein),wanted);}finally{a.close();}
});
