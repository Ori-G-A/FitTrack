import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cases} from '../test-support/interface-cases.js';
import {verifyTrace} from '../scripts/sdd-trace.js';
import {contractIds} from '../scripts/sdd-contract.js';

test('interfaz mutaciones detectan perdida de fecha tema toast y breakpoint',{timeout:90000},async()=>{
 for(const [name,mutation]of [['routing','date'],['theme','auto'],['toast','toast'],['responsive','breakpoint']]){
  await cases[name]();
  await assert.rejects(()=>cases[name]({mutation}),error=>error.name==='AssertionError',name+' debe detectar la mutación con su propia aserción');
 }
});
test('interfaz trazabilidad rechaza ausentes duplicados omitidos reintentos y parcialidad',async()=>{
 const spec=await readFile('specs/006-interfaz/spec.md','utf8'),ids=contractIds(spec);
 const original=JSON.parse(await readFile('specs/006-interfaz/traceability.json','utf8'));
 const pending=new Set(['FR-021','FR-022','FR-024','US4-AS1','US4-AS2','US1-AS9']);
 // Modelo sintético del verificador: no sustituye resultados reales de E0.
 const manifest={...original,requirements:original.requirements.map(row=>({...row,status:pending.has(row.id)?'pending':'complete',tests:pending.has(row.id)?[]:row.plannedTests}))};
 const names=[...new Set(manifest.requirements.flatMap(r=>r.tests))];const results=names.map(name=>({name,status:'passed'}));
 assert.deepEqual(verifyTrace(manifest,ids,results).counts,{pending:6,partial:0,complete:42});assert.deepEqual(verifyTrace(manifest,ids,results).errors,[]);
 const incomplete=verifyTrace(manifest,ids,results,{complete:true});assert.equal(incomplete.errors.length,6);for(const id of pending)assert(incomplete.errors.includes('Cobertura incompleta: '+id));
 for(const bad of [results.slice(1),[...results,results[0]],results.map((r,i)=>i===0?{...r,status:'skipped'}:r),results.map((r,i)=>i===0?{...r,status:'retried'}:r)])assert(verifyTrace(manifest,ids,bad).errors.length>0);
 const partial=structuredClone(manifest);partial.requirements[0].status='partial';assert(verifyTrace(partial,ids,results,{complete:true}).errors.includes('Cobertura incompleta: FR-001'));
});
