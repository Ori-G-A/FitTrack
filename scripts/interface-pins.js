import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// La baseline original permanece inmutable. Una corrección técnica del harness
// conserva su firma anterior y requiere evidencia renovada sobre el original.
export function verifyInterfacePins() {
 const baseline=JSON.parse(readFileSync('specs/006-interfaz/evidence/baseline.json','utf8'));
 assert.equal(baseline.pins.length,33);assert.equal(baseline.previousPinsVerified.length,68);
 let amendment;
 try{amendment=JSON.parse(readFileSync('specs/006-interfaz/evidence/pin-amendment-001.json','utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
 if(amendment){
  assert.equal(amendment.id,'PIN-006-001');assert.equal(amendment.file,'test-support/interface-browser.js');
  assert.equal(amendment.assertionsChanged,false);assert.equal(amendment.fr,'FR-024');
  assert.equal(amendment.originalProof.passed,true);assert.equal(amendment.originalProof.asis.expected,20);assert.equal(amendment.originalProof.red.unexpected,7);assert.equal(amendment.originalProof.cleanupPassed,true);
  assert.equal(amendment.originalProof.sourceHash,baseline.sourceHash);
  assert.equal(amendment.before,baseline.pins.find(p=>p.file===amendment.file).sha256);
 }
 for(const pin of [...baseline.pins,...baseline.previousPinsVerified]){
  const expected=amendment&&pin.file===amendment.file?amendment.after:pin.sha256;
  assert.equal(createHash('sha256').update(readFileSync(pin.file,'utf8').replace(/\r\n/g,'\n')).digest('hex'),expected,pin.file);
 }
 return {verified:101,originalPins:68,newPins:33,amendments:amendment?1:0};
}
