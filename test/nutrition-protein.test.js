import test from 'node:test';
import assert from 'node:assert/strict';
import {computeProteinTargets as compute,distributeProtein as split,PROTEIN_CONFIG} from '../src/fase1Config.js';
test('nutricion proteina conserva clamps reparto etiquetas y redondeos',()=>{
 assert.deepEqual(compute('60'),{gPerKg:2,weightKg:60,dailyTarget:120,lowEnd:96,highEnd:144});
 for(const [input,wanted]of [[0,1.6],['x',1.6],[-1,1.6],[1.7,1.7],[3,2.4]])assert.equal(compute(60,{gPerKg:input}).gPerKg,wanted);
 assert.equal(compute('').dailyTarget,0);assert.equal(compute('x').dailyTarget,0);assert.equal(compute(-10).dailyTarget,-20);
 assert.deepEqual(compute(61.3,{minGPerKg:1,maxGPerKg:3,gPerKg:2.5}),{gPerKg:2.5,weightKg:61.3,dailyTarget:153,lowEnd:61,highEnd:184});
 assert.deepEqual(split(151,4),[{label:'Desayuno',grams:30,pct:.2},{label:'Almuerzo',grams:42,pct:.28},{label:'Merienda',grams:36,pct:.24},{label:'Cena',grams:43,pct:.28}]);
 assert.equal(split(151.4,5).reduce((s,m)=>s+m.grams,0),151);assert.equal(split(151.4,5).at(-1).label,'Cena');
 assert.deepEqual(split(100,3),[]);assert.deepEqual(split(11.5,2,{distribution:{2:[.5,.5]},mealLabels:{}}),[{label:'Comida 1',grams:6,pct:.5},{label:'Comida 2',grams:6,pct:.5}]);
 assert.deepEqual(PROTEIN_CONFIG.mealLabels[5],['Desayuno','Media mañana','Almuerzo','Merienda','Cena']);
});
