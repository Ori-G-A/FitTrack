import test from 'node:test';import assert from 'node:assert/strict';import {mountBody} from '../test-support/body-dom.js';import {verifyTrace} from '../scripts/sdd-trace.js';
async function check(mutation,active=true){const h=await mountBody({periods:[{date:'2026-10-17',duration:5}],menstrualLogs:[{date:'2026-10-18',bleedingLevel:'none'}],wellness:[{date:'2026-10-18',notes:'old'}]},{mutation:active?mutation:undefined});try{
 if(mutation==='weight-zero'){await h.call(h.b.setKg,'0');await h.call(h.b.addW);assert.equal(h.state.weights.length,0,'guarda de cero');}
 if(mutation==='wellness-hydrate'){await h.call(h.b.setWel,{...h.b.wel,notes:'draft'});await h.call(h.state.setWellness,[{date:'2026-10-18',notes:'external'}]);assert.equal(h.b.wel.notes,'draft','borrador estable');}
 if(mutation==='bleeding-precedence')assert.equal(h.b.phaseEstimate.phase,'follicular_early','precedencia none');
 if(mutation==='alert-keys'){const a=h.modules.alerts,m=a.alertMetrics({goals:{sex:'hombre'}});assert(a.buildAlerts({...m,trend:.1},{weeklyChange:0}).every(x=>x.key===undefined),'retorno sin keys');}
 }finally{h.close();}}
test('cuerpo pins detectan mutaciones controladas',async()=>{for(const mutation of ['weight-zero','wellness-hydrate','bleeding-precedence','alert-keys']){await check(mutation,false);await assert.rejects(()=>check(mutation),{name:'AssertionError'});}
 for(const status of ['skipped','retried','failed'])assert(verifyTrace({requirements:[{id:'FR-001',status:'complete',tests:['x']}]},['FR-001'],[{name:'x',status}],{complete:true}).errors.length>0);
 assert(verifyTrace({requirements:[{id:'FR-001',status:'complete',tests:['missing']}]},['FR-001'],[],{complete:true}).errors.length>0);for(const status of ['partial','pending'])assert(verifyTrace({requirements:[{id:'FR-001',status,tests:[]}]},['FR-001'],[],{complete:true}).errors.length>0);
});
