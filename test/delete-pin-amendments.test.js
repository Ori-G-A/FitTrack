import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {approvedDeletePinHash,validateDeletePinAmendment} from '../scripts/delete-pin-amendments.js';
test('borrado008 firmas conservan cadena y rechazan enmiendas invalidas',()=>{
 const dir='specs/008-borrado-fiable/evidence/';const baseline=JSON.parse(readFileSync(dir+'baseline.json')),pin=JSON.parse(readFileSync(dir+'pin-008-001.json'));
 assert.equal(approvedDeletePinHash(pin.file,pin.before),pin.after);assert.equal(approvedDeletePinHash('archivo-desconocido','original'),'original');assert.throws(()=>approvedDeletePinHash(pin.file,'hash falso'),{name:'AssertionError'});
 for(const patch of [{file:'otro'},{approvedPlan:'no aprobado'},{after:pin.before},{fr:['FR-001']},{candidateTargeted:{passed:false,coreCases:3}},{preservedOrderOwnershipAndPartialEffects:false}])assert.throws(()=>validateDeletePinAmendment({...pin,...patch},baseline,pin.before),{name:'AssertionError'});
});
