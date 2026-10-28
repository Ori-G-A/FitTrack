import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyDeleteTrace,verifyDeletePins} from '../scripts/delete-state-evidence.js';
import {contractIds} from '../scripts/sdd-contract.js';
test('borrado008 trazabilidad rechaza oraculos falsos duplicados omitidos y parciales',()=>{
 const manifest=JSON.parse(readFileSync('specs/008-borrado-fiable/traceability.json')),ids=contractIds(readFileSync('specs/008-borrado-fiable/spec.md','utf8'));
 const results=[...new Set(manifest.requirements.flatMap(r=>r.plannedTests))].map(name=>({name,status:'passed'}));
 // Control estructural sintético: no se presenta como ejecución de negocio.
 assert.deepEqual(verifyDeleteTrace(manifest,ids,results,{complete:true}).errors,[]);
 function rejects(change){const copy=structuredClone(manifest),runner=structuredClone(results);change(copy,runner);assert(verifyDeleteTrace(copy,ids,runner,{complete:true}).errors.length);}
 rejects(m=>m.requirements[0].tests=['nombre inexistente']);rejects(m=>m.requirements[0].tests=m.requirements[1].tests);
 rejects((m,r)=>r.push(r[0]));rejects((m,r)=>r.shift());rejects(m=>m.requirements.pop());rejects(m=>m.requirements.push(m.requirements[0]));rejects(m=>m.requirements[0].status='partial');rejects((m,r)=>r[0].status='retried');rejects(m=>m.spec='otra');
 assert.deepEqual(verifyDeletePins(),{historicalIntact:105,amended:3,newIntact:7,newAmended:1});
});
