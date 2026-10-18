import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyTrace} from '../scripts/sdd-trace.js';
import {contractIds} from '../scripts/sdd-contract.js';

test('entrenamiento trazabilidad rechaza evidencia incompleta',()=>{
 const ids=contractIds(readFileSync('specs/003-entrenamiento/spec.md','utf8'));
 assert.equal(ids.length,21);
 // Fixtures sintéticos validan el verificador; no certifican cobertura real.
 const base={requirements:ids.map(id=>({id,status:'complete',tests:[`pin ${id}`]}))};
 const results=ids.map(id=>({name:`pin ${id}`,status:'passed'}));
 const check=(m=base,r=results)=>verifyTrace(m,ids,r,{complete:true});
 assert.deepEqual(check().errors,[]);
 const missing=structuredClone(base);missing.requirements[0].tests=['inexistente'];
 assert.ok(check(missing).errors.some(e=>e.includes('Prueba ausente')));
 const skipped=structuredClone(results);skipped[0].status='skipped';
 assert.ok(check(base,skipped).errors.some(e=>e.includes('Prueba no aprobada')));
 const partial=structuredClone(base);partial.requirements[0].status='partial';
 assert.ok(check(partial).errors.some(e=>e.includes('Cobertura incompleta')));
 const absent=structuredClone(base);absent.requirements.pop();
 assert.ok(check(absent).errors.some(e=>e.includes('Requisito sin fila')));
});
