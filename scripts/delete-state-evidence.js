import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {digest} from './save-state-evidence.js';
import {approvedDeletePinHash} from './delete-pin-amendments.js';
import {verifyTrace} from './sdd-trace.js';

export function verifyDeletePins() {
 const baseline=JSON.parse(readFileSync('specs/008-borrado-fiable/evidence/baseline.json'));
 assert.equal(baseline.previousPins.length,108);assert.equal(baseline.pins.length,8);
 let amended=0;
 // previousPins ya contiene las firmas efectivas 006/007; aplicar solo la adenda 008.
 for(const pin of baseline.previousPins){const actual=digest(pin.file);if(actual!==pin.sha256){amended++;assert.equal(pin.file,'test/data-delete.test.js');}assert.equal(actual,approvedDeletePinHash(pin.file,pin.sha256),pin.file);}
 assert.equal(amended,1);for(const pin of baseline.pins)assert.equal(digest(pin.file),pin.sha256,pin.file);
 return {historicalIntact:107,amended,newIntact:8};
}
export function verifyDeleteTrace(manifest,ids,results,options={}) {
 const report=verifyTrace(manifest,ids,results,options);
 if(manifest.spec!=='008-borrado-fiable')report.errors.push('Spec 008 incorrecta');
 for(const row of manifest.requirements){
  if(!Array.isArray(row.plannedTests)||!row.plannedTests.length)report.errors.push('Sin oráculo previsto: '+row.id);
  else if(row.status!=='pending'&&JSON.stringify(row.tests)!==JSON.stringify(row.plannedTests))report.errors.push('Oráculo diferente del plan: '+row.id);
 }
 return report;
}
