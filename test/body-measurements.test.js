import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo medidas conservan campos null conversiones y reemplazo",async()=>{
const h=await mountBody({section:'medidas',measurements:[{id:'old',date:today,unknown:1},{id:'dup',date:today,cintura:30}]});try{
 await h.call(h.b.addM);assert.equal(h.state.measurements.length,2);const before=plain(h.state.measurements),invalid={cintura:'0',cadera:'1,2',pecho:'-1',brazo:'2.5',muslo:''};await h.call(h.b.setMeas,invalid);await h.call(h.b.addM);assert.deepEqual(plain(h.state.measurements),before);assert.deepEqual(plain(h.b.meas),invalid);await h.call(h.b.setMeas,{cintura:'70',cadera:'1,2',pecho:'1',brazo:'2.5',muslo:''});await h.call(h.b.addM);const m=h.state.measurements[0];assert.equal(m.cintura,70);assert.equal(m.cadera,1.2);assert.equal(m.pecho,1);assert.equal(m.brazo,2.5);assert.equal(m.muslo,null);assert.equal(m.unknown,undefined);assert.notEqual(m.id,'old');assert.equal(h.b.meas.cintura,'');await h.call(h.b.delM,m.id);assert.equal(h.state.measurements.length,0);
 await h.call(h.state.setMeasurements,Array.from({length:8},(_,i)=>({id:'m'+i,date:'2026-10-'+String(i+1).padStart(2,'0'),cintura:i===0?null:i===1?0:70+i})));assert.equal(h.b.cinturaChart.length,7);assert.equal(h.w.document.querySelectorAll('.ft-li').length,6);assert.equal(h.b.mSorted[0].id,'m7');
 }finally{h.close();}
});
