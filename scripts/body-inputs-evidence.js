import {approvedBodyInputBudgetPinHash} from './body-inputs-budget-amendments.js';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyTrace} from './sdd-trace.js';
import {bodyInputDirectory,bodyInputPinTargets,approvedBodyInputPinHash,bodyInputDigest,verifyBodyInputSourceTransition} from './body-inputs-pin-amendments.js';
export const bodyInputMutationCaseName='cuerpo010 reintroducciones detectan cinco defectos de entrada';
export function verifyBodyInputPins(){
 const baseline=JSON.parse(readFileSync(bodyInputDirectory+'baseline.json'));
 assert.equal(baseline.previousPins.length,123);assert.equal(new Set(baseline.previousPins.map(p=>p.file)).size,123);assert.equal(baseline.pins.length,9);
 let amended=0;for(const pin of baseline.previousPins){const actual=bodyInputDigest(readFileSync(pin.file,'utf8'));if(actual!==pin.sha256){amended++;assert(bodyInputPinTargets.some(t=>t.file===pin.file));}assert.equal(actual,approvedBodyInputPinHash(pin.file,pin.sha256),pin.file);}
 let newAmended=0;for(const pin of baseline.pins){const actual=bodyInputDigest(readFileSync(pin.file,'utf8'));if(actual!==pin.sha256)newAmended++;assert.equal(actual,approvedBodyInputBudgetPinHash(pin.file,pin.sha256),pin.file);}
 return {previousVerified:123,intact:123-amended,amended,newIntact:9-newAmended,newAmended};
}
export function verifyBodyInputTrace(manifest,ids,results,options={}){
 const report=verifyTrace(manifest,ids,results,options);if(manifest.spec!=='010-entradas-cuerpo')report.errors.push('Spec 010 incorrecta');
 for(const row of manifest.requirements){if(!Array.isArray(row.plannedTests)||!row.plannedTests.length)report.errors.push('Sin oráculo previsto: '+row.id);else if(row.status!=='pending'&&JSON.stringify(row.tests)!==JSON.stringify(row.plannedTests))report.errors.push('Oráculo diferente del plan: '+row.id);}
 return report;
}
export function validateBodyInputMutationEvidence(report,hash,sourceHash){
 assert.equal(report.passed,true);assert.equal(report.cleanupPassed,true);assert.equal(report.verificationHash,hash);assert.equal(report.sourceHash,sourceHash);assert.equal(report.positiveControls,5);
 assert.deepEqual(report.mutations.map(m=>m.name),['syntax','zero','partial','accessible','comma']);
 for(const m of report.mutations){assert.equal(m.detected,true);assert.equal(m.positiveControlPassed,true);assert.match(m.error,/FR-005|FR-006|FR-007|FR-008|FR-010/);assert.doesNotMatch(m.error,/TypeError|ReferenceError|SyntaxError|ERR_MODULE_NOT_FOUND/);}
 return [{name:bodyInputMutationCaseName,status:'passed'}];
}
export {verifyBodyInputSourceTransition};
