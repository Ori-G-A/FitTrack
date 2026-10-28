import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {contractIds} from '../scripts/sdd-contract.js';
import {verifyBodyInputTrace,validateBodyInputMutationEvidence} from '../scripts/body-inputs-evidence.js';

test('cuerpo010 trazabilidad rechaza evidencia falsa omitida y parcial',()=>{
 const manifest=JSON.parse(readFileSync('specs/010-entradas-cuerpo/traceability.json'));
 const ids=contractIds(readFileSync('specs/010-entradas-cuerpo/spec.md','utf8'));
 const complete=structuredClone(manifest);for(const row of complete.requirements){row.status='complete';row.tests=row.plannedTests;}
 const results=[...new Set(complete.requirements.flatMap(r=>r.tests))].map(name=>({name,status:'passed'}));
 // Solo valida metadatos; estos nombres no se presentan como ejecutados.
 assert.deepEqual(verifyBodyInputTrace(complete,ids,results,{complete:true}).errors,[]);
 for(const change of [(m,r)=>m.requirements[0].tests=['falsa'],(m,r)=>r.pop(),(m,r)=>r.push(r[0]),m=>m.requirements.pop(),m=>m.requirements.push(m.requirements[0]),m=>m.requirements[0].status='partial',m=>m.requirements[0].status='pending',(m,r)=>r[0].status='retried',m=>m.spec='ajena']){const m=structuredClone(complete),r=structuredClone(results);change(m,r);assert(verifyBodyInputTrace(m,ids,r,{complete:true}).errors.length);}
 const hash='a'.repeat(64),src='b'.repeat(64),proof={passed:true,cleanupPassed:true,verificationHash:hash,sourceHash:src,positiveControls:5,mutations:['syntax','zero','partial','accessible','comma'].map(name=>({name,detected:true,positiveControlPassed:true,error:'FR-007: rechazo obligatorio'}))};
 assert.equal(validateBodyInputMutationEvidence(proof,hash,src).length,1);
 for(const change of [p=>p.passed=false,p=>p.cleanupPassed=false,p=>p.verificationHash='otro',p=>p.sourceHash='otro',p=>p.positiveControls=4,p=>p.mutations.pop(),p=>p.mutations[0].error='TypeError FR-007',p=>p.mutations[0].detected=false]){const bad=structuredClone(proof);change(bad);assert.throws(()=>validateBodyInputMutationEvidence(bad,hash,src));}
});
