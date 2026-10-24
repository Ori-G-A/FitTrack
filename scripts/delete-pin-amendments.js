import {existsSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const directory='specs/008-borrado-fiable/evidence/';
export function validateDeletePinAmendment(amendment,baseline,expected) {
 assert.equal(amendment.id,'PIN-008-001');
 assert.equal(amendment.file,'test/data-delete.test.js');
 assert.equal(amendment.approvedPlan,'2ee8edca15a95012344e0dca3823e8b103b231f3');
 assert.deepEqual(amendment.fr,['FR-005','FR-008','FR-010']);
 assert.equal(amendment.before,expected);
 assert.equal(amendment.before,baseline.previousPins.find(p=>p.file===amendment.file)?.sha256);
 assert.match(amendment.after,/^[a-f0-9]{64}$/);assert.notEqual(amendment.after,amendment.before);
 assert.equal(baseline.passed,true);assert.equal(baseline.asis.passed,4);assert.equal(baseline.red.failed,13);
 assert.equal(amendment.originalProof.sourceHash,baseline.sourceHash);
 assert.equal(amendment.originalProof.nodeTests,325);assert.equal(amendment.originalProof.browserTests,29);
 assert.equal(amendment.candidateTargeted.passed,true);assert.equal(amendment.candidateTargeted.coreCases,3);
 assert.equal(amendment.preservedOrderOwnershipAndPartialEffects,true);
 return amendment.after;
}
export function approvedDeletePinHash(file,expected) {
 // No leer la baseline nueva para archivos desconocidos o antes de la enmienda.
 const path=directory+'pin-008-001.json';
 if(file!=='test/data-delete.test.js'||!existsSync(path))return expected;
 return validateDeletePinAmendment(JSON.parse(readFileSync(path)),JSON.parse(readFileSync(directory+'baseline.json')),expected);
}
