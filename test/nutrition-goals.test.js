import test from 'node:test';
import assert from 'node:assert/strict';
import {latestWeight,goalDirection,goalSuggestion} from '../src/settings-utils.js';
test('nutricion objetivos conservan referencia actividad direccion y sugerencia',()=>{
 const w=[{date:'2026-10-18',kg:'62'},{date:'2026-10-01',kg:63}];assert.equal(latestWeight(w),'62');assert.equal(w[0].kg,'62');assert.equal(latestWeight([]),null);assert.equal(latestWeight(null),null);
 for(const [s,t,result]of [[60,59,'perder grasa'],['60',61,'ganar músculo'],[60,60,'mantener'],['',60,null],[60,0,null],['x',60,null]])assert.equal(goalDirection(s,t),result);
 assert.deepEqual(goalSuggestion(60,{activity:'missing',weeklyChange:-.4,proteinPerKg:2}),{maintenance:1920,kcal:1480,protein:120,proteinPerKg:2,lowEnd:96,highEnd:144});
 assert.equal(goalSuggestion(60,{activity:'moderado',weeklyChange:0}).kcal,1920);assert.equal(goalSuggestion(60,{activity:'moderado',weeklyChange:.25}).kcal,2200);
 assert.equal(goalSuggestion(60,{activity:'moderado',weeklyChange:-.4,proteinPerKg:3}).protein,144);
 for(const x of ['',0,'x'])assert.equal(goalSuggestion(x,{}),null);
 assert(Number.isNaN(goalSuggestion(60,{weeklyChange:'x'}).kcal));
});
