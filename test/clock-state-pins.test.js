import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {clockPinTargets,canonicalClockSource,clockDigestText,validateClockPinAmendment,approvedClockPinHash} from '../scripts/clock-pin-amendments.js';
import {verifyClockPins,clockDirectory} from '../scripts/clock-state-evidence.js';

test('reloj009 firmas y enmiendas rechazan alteraciones no autorizadas',()=>{
 const report=verifyClockPins();assert.equal(report.previousVerified,116);assert.equal(report.newIntact,7);
 // Control de estructura sintético, no evidencia de ejecución de montajes.
 const baseline={...JSON.parse(readFileSync(clockDirectory+'baseline.json')),passed:true,red:{failed:2,fixtures:['interfaz','guardado','borrado']}};
 for(const pin of clockPinTargets){
  const original=readFileSync(clockDirectory+'original-files/'+pin.file+'.txt','utf8');
  const amendment={...pin,approvedPlan:baseline.approvedPlan,after:clockDigestText(canonicalClockSource(pin.file,original)),fr:['FR-004','FR-005','FR-007'],patchVersion:'clock-public-v1',originalProof:{sourceHash:baseline.sourceHash,nodeTests:370,browserTests:30},candidateTargeted:{passed:true,browserTests:5,combinations:9},assertionsChanged:false,datesChanged:false,businessTimeoutsChanged:false};
  assert.equal(validateClockPinAmendment(amendment,baseline,pin.before,original),amendment.after);
  for(const change of [a=>a.id='ajena',a=>a.file='archivo-ajeno',a=>a.before='falso',a=>a.after='falso',a=>a.approvedPlan='otro-plan',a=>a.assertionsChanged=true,a=>a.candidateTargeted.combinations=8,a=>a.fr=['FR-001']]){const copy=structuredClone(amendment);change(copy);assert.throws(()=>validateClockPinAmendment(copy,baseline,pin.before,original));}
  const altered=original+'\nthrow Error("oráculo cambiado");\n',forged={...amendment,after:clockDigestText(canonicalClockSource(pin.file,altered))};
  assert.throws(()=>validateClockPinAmendment(forged,baseline,pin.before,original));assert.throws(()=>validateClockPinAmendment(amendment,baseline,amendment.after,original));
 }
 assert.equal(approvedClockPinHash('desconocido','firma original'),'firma original');assert.throws(()=>canonicalClockSource('desconocido','texto'));
});
