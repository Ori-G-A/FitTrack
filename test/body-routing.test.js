import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo conserva seccion fecha montaje y visibilidad",async()=>{
const h=await mountBody({section:'checkin',date:'2026-10-17'});try{
 assert.equal(h.b.section,'checkin');assert.equal(h.b.wDate,'2026-10-17');await h.call(h.state.setGoals,g=>({...g,sex:'hombre'}));assert.equal(h.b.section,'checkin');assert.equal(h.b.SECTIONS.length,3);await h.call(h.state.setSection,'medidas');await h.call(h.state.setDate,'2026-10-01');assert.equal(h.b.wDate,'2026-10-17');assert.equal(h.b.section,'checkin');await h.call(h.state.setMount,x=>x+1);assert.equal(h.b.section,'medidas');assert.equal(h.b.wDate,'2026-10-01');await h.call(h.state.setSection,'invalid');await h.call(h.state.setMount,x=>x+1);assert.equal(h.b.section,'peso');
 for(const sex of ['', 'mujer','otro','hombre'])assert.equal(h.modules.config.tracksCycle({sex}),sex!=='hombre');
 await h.call(h.state.setView,'perfil');assert.equal(h.perfil.tracksCycle,false);assert.match(h.text,/Sin seguimiento/);await h.call(h.state.setGoals,g=>({...g,sex:''}));assert.equal(h.perfil.tracksCycle,false);assert.match(h.text,/Sin datos de ciclo/);await h.call(h.state.setPeriods,periods);assert.equal(h.perfil.tracksCycle,true);
 }finally{h.close();}
});
