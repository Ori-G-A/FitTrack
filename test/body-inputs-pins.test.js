import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {bodyInputDirectory,bodyInputPinTargets,bodyInputDigest,canonicalBodyInputSource,validateBodyInputPinAmendment,approvedBodyInputPinHash,verifyBodyInputSourceTransition} from '../scripts/body-inputs-pin-amendments.js';
import {sourceHash} from '../scripts/save-state-evidence.js';
import {verificationHash} from '../scripts/clock-state-evidence.js';

test('cuerpo010 firmas y transicion rechazan enmiendas ajenas',()=>{
 const inventory=JSON.parse(readFileSync(bodyInputDirectory+'original-inventory.json'));
 // Controles estructurales sintéticos: no representan verdes de producto.
 const baseline={passed:true,approvedPlan:inventory.approvedPlan,sourceHash:inventory.sourceHash,previousPins:inventory.effectivePins,red:{failed:5},asis:{passed:3}};
 for(const pin of bodyInputPinTargets){
  const original=readFileSync(bodyInputDirectory+'original-files/'+pin.file+'.txt','utf8');
  const references=pin.id==='PIN-010-001'?['FR-005','FR-006','FR-007']:pin.id==='PIN-010-002'?['FR-005','FR-006','FR-007','FR-010']:pin.id==='PIN-010-003'?['FR-005','FR-009','FR-010']:pin.id==='PIN-010-004'?['FR-006']:['US3-AS4','SC-004','SC-005'];
  const amendment={...pin,approvedPlan:baseline.approvedPlan,after:bodyInputDigest(canonicalBodyInputSource(pin.file,original)),references,patchVersion:'body-inputs-v1',originalProof:{sourceHash:baseline.sourceHash,nodeTests:372,browserTests:35},candidateTargeted:{passed:true,nodeTests:6,browserTests:8},unrelatedAssertionsChanged:false,businessTimeoutsChanged:false};
  assert.equal(validateBodyInputPinAmendment(amendment,baseline,pin.before,original),amendment.after);
  for(const change of [a=>a.id='ajena',a=>a.file='otro',a=>a.before='falso',a=>a.after='falso',a=>a.approvedPlan='otro',a=>a.references=['FR-001'],a=>a.unrelatedAssertionsChanged=true,a=>a.businessTimeoutsChanged=true,a=>a.candidateTargeted.browserTests=7]){const bad=structuredClone(amendment);change(bad);assert.throws(()=>validateBodyInputPinAmendment(bad,baseline,pin.before,original));}
  const altered=original+'\nthrow Error("aserción ajena");\n',forged={...amendment,after:bodyInputDigest(canonicalBodyInputSource(pin.file,altered))};assert.throws(()=>validateBodyInputPinAmendment(forged,baseline,pin.before,altered));assert.throws(()=>validateBodyInputPinAmendment(amendment,baseline,amendment.after,original));
 }
 assert.equal(approvedBodyInputPinHash('desconocido','firma'),'firma');assert.throws(()=>canonicalBodyInputSource('desconocido','texto'));
 assert.throws(()=>verifyBodyInputSourceTransition({sourceHash:sourceHash(),verificationHash:verificationHash(),historicalSourceHash:'ajeno'}));
 const current={sourceHash:sourceHash(),verificationHash:verificationHash(),historicalSourceHash:inventory.sourceHash};
 assert.equal(verifyBodyInputSourceTransition(current).mode,existsSync(bodyInputDirectory+'source-transition.json')?'010':'original');
});
