import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runtimeOracles,missingMutationOracles} from '../scripts/body-inputs-runtime-oracles.js';

test('cuerpo010 agregador conserva nombres reales de contratos historicos',()=>{
 const legacy=JSON.parse(readFileSync('specs/001-datos/traceability.json')).requirements[0];
 assert.deepEqual(runtimeOracles(legacy),['datos lectura y escritura por usuario y clave']);
 assert.notDeepEqual(runtimeOracles(legacy),legacy.plannedTests);
 const candidate=Object.freeze({id:'FR-001',tests:[],plannedTests:['contrato candidato']});
 assert.deepEqual(runtimeOracles(candidate,true),['contrato candidato']);
 assert.throws(()=>runtimeOracles(candidate));assert.throws(()=>runtimeOracles({id:'FR-001',tests:['real'],plannedTests:[]},true));
 assert.deepEqual(missingMutationOracles(['real','mutacion'],new Set(['real']),['mutacion']),['mutacion']);
 assert.throws(()=>missingMutationOracles(['ordinario ausente','mutacion'],new Set(),['mutacion']));
 assert.deepEqual(missingMutationOracles(['real'],new Set(['real']),['mutacion']),[]);
});
