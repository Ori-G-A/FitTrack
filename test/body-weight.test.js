import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo peso conserva conversiones reemplazo pasos e historial",async()=>{
 const h=await mountBody({weights:[weight('old',today,60),weight('dup',today,61),weight('before','2026-10-01',59)]});try{
 for(const v of ['', '0', 'x']){await h.call(h.b.setKg,v);await h.call(h.b.addW);assert.equal(h.state.weights.length,3);}
 await h.input('input[inputmode="decimal"]','65,4');await h.button('Guardar pesaje');assert.equal(h.state.weights.length,2);assert.equal(h.state.weights[1].kg,65.4);assert.notEqual(h.state.weights[1].id,'old');assert.equal(h.b.kg,'');assert.equal(typeof h.w.__bodyWeightWrite,'function');const replayA=h.w.__bodyWeightWrite([]),replayB=h.w.__bodyWeightWrite([]);assert.notEqual(replayA[0].id,replayB[0].id);
 await h.call(h.b.bumpKg,.1);assert.equal(h.b.kg,'65,5');await h.call(h.b.bumpKg,-.1);assert.equal(h.b.kg,'65,4');for(const v of ['65,0','65,2','65,4','65,6','65,8']){await h.button(v);assert.equal(h.b.kg,v);}
 for(const v of ['-1','Infinity']){const before=plain(h.state.weights);await h.call(h.b.setKg,v);await h.call(h.b.addW);assert.deepEqual(plain(h.state.weights),before);assert.equal(h.b.kg,v);}
 await h.call(h.b.delW,h.state.weights.at(-1).id);assert.equal(h.state.weights.length,1);
 await h.call(h.state.setWeights,Array.from({length:10},(_,i)=>weight('w'+i,'2026-10-'+String(i+1).padStart(2,'0'),60+i)));assert.equal(h.b.wChart.length,10);assert.equal(h.b.wSorted[0].kg,69);assert.equal(h.w.document.querySelectorAll('.ft-li').length,8);
 }finally{h.close();}
});
