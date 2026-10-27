import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceHash} from '../scripts/save-state-evidence.js';
import {contractIds} from '../scripts/sdd-contract.js';
import {verifyClockTrace,validateClockMutationEvidence,mutationCaseName} from '../scripts/clock-state-evidence.js';

test('reloj009 trazabilidad rechaza resultados falsos omitidos y parciales',()=>{
 const manifest=JSON.parse(readFileSync('specs/009-reloj-pruebas/traceability.json')),ids=contractIds(readFileSync('specs/009-reloj-pruebas/spec.md','utf8'));
 const complete=structuredClone(manifest);for(const row of complete.requirements){row.status='complete';row.tests=row.plannedTests;}
 const results=[...new Set(complete.requirements.flatMap(r=>r.tests))].map(name=>({name,status:'passed'}));
 // Solo controla validación de metadatos; no se declara ejecución de negocio.
 assert.deepEqual(verifyClockTrace(complete,ids,results,{complete:true}).errors,[]);
 const bad=change=>{const m=structuredClone(complete),r=structuredClone(results);change(m,r);assert(verifyClockTrace(m,ids,r,{complete:true}).errors.length);};
 bad(m=>m.requirements[0].tests=['inexistente']);bad((m,r)=>r.push(r[0]));bad((m,r)=>r.shift());bad(m=>m.requirements.pop());bad(m=>m.requirements.push(m.requirements[0]));bad(m=>m.requirements[0].status='partial');bad((m,r)=>r[0].status='retried');bad(m=>m.spec='otra');
 const hash='a'.repeat(64),proof={passed:true,cleanupPassed:true,verificationHash:hash,sourceHash:sourceHash(),positiveControls:3,mutations:['interfaz','guardado','borrado'].map(fixture=>({fixture,detected:true,positiveControlPassed:true,scriptsInjectedOnFailure:0,error:'Cannot fast-forward to the past'}))};
 assert.deepEqual(validateClockMutationEvidence(proof,hash),[{name:mutationCaseName,status:'passed'}]);
 for(const change of [p=>p.cleanupPassed=false,p=>p.verificationHash='otro',p=>p.positiveControls=2,p=>p.mutations[0].fixture='borrado',p=>p.mutations[0].scriptsInjectedOnFailure=1,p=>p.mutations[0].error='TypeError Cannot fast-forward to the past']){const copy=structuredClone(proof);change(copy);assert.throws(()=>validateClockMutationEvidence(copy,hash));}
});
