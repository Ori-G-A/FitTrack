import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const directory='specs/009-reloj-pruebas/evidence/';
export const clockPinTargets=[
 {id:'PIN-009-001',file:'test-support/interface-browser.js',before:'94989d588f5af8a6e8c12cd06b27983bb27f8935275562b2521e0204fd84ad63'},
 {id:'PIN-009-002',file:'change-tests/save-state.spec.js',before:'30c03f1dcf64591ff7b93e9e7baaacbcb49ea4cea6e0fcca68dc4a4232afcfea'},
 {id:'PIN-009-003',file:'test-support/delete-state-browser.js',before:'755aa4c3d12ffc970e59767f8437865a625fa1ea60cd76d50b8f41c5fb8d6894'},
];
export const clockDigestText=text=>createHash('sha256').update(text.replace(/\r\n/g,'\n')).digest('hex');
export function canonicalClockSource(file,source){
 assert(clockPinTargets.some(p=>p.file===file),'archivo no autorizado');
 let text=source.replace(/\r\n/g,'\n');
 const replace=(from,to)=>{assert.equal(text.split(from).length,2,'ancla única '+file);text=text.replace(from,to);};
 const relative=file.startsWith('change-tests/')?'../test-support/paused-clock.js':'./paused-clock.js';
 assert(!text.includes('preparePausedClock'),'no reaplicar protocolo');
 if(file==='test-support/interface-browser.js'){
  replace("await page.clock.install({time:new Date('2026-10-18T12:00:00Z')});","await preparePausedClock(page,new Date('2026-10-18T12:00:00Z'));");
  replace(" await page.clock.pauseAt(new Date('2026-10-18T12:00:00Z'));\n",'');
 }else if(file==='change-tests/save-state.spec.js'){
  replace("await page.clock.install({time:new Date('2026-10-21T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-21T12:00:00Z'));","await preparePausedClock(page,new Date('2026-10-21T12:00:00Z'));");
 }else replace('await page.clock.install({time});await page.clock.pauseAt(time);','await preparePausedClock(page,time);');
 return `import {preparePausedClock} from '${relative}';\n`+text;
}
export function validateClockPinAmendment(amendment,baseline,expected,original){
 const target=clockPinTargets.find(p=>p.id===amendment.id&&p.file===amendment.file);assert(target,'archivo/enmienda no autorizados');
 assert.equal(baseline.passed,true);assert.equal(baseline.approvedPlan,amendment.approvedPlan);assert.match(baseline.approvedPlan,/^[a-f0-9]{40}$/);
 assert.equal(expected,target.before);assert.equal(amendment.before,expected);
 assert.equal(baseline.previousPins.find(p=>p.file===target.file)?.sha256,expected);
 assert.equal(clockDigestText(original),expected);assert.equal(amendment.after,clockDigestText(canonicalClockSource(target.file,original)));
 assert.deepEqual(amendment.fr,['FR-004','FR-005','FR-007']);assert.equal(amendment.patchVersion,'clock-public-v1');
 assert.equal(amendment.originalProof.sourceHash,baseline.sourceHash);assert.equal(amendment.originalProof.nodeTests,370);assert.equal(amendment.originalProof.browserTests,30);
 assert.equal(baseline.red.failed,2);assert.deepEqual([...baseline.red.fixtures].sort(),['borrado','guardado','interfaz']);
 assert.equal(amendment.candidateTargeted.passed,true);assert.equal(amendment.candidateTargeted.browserTests,5);assert.equal(amendment.candidateTargeted.combinations,9);
 assert.equal(amendment.assertionsChanged,false);assert.equal(amendment.datesChanged,false);assert.equal(amendment.businessTimeoutsChanged,false);
 return amendment.after;
}
export function approvedClockPinHash(file,expected){
 const target=clockPinTargets.find(p=>p.file===file);if(!target)return expected;
 const path=directory+target.id.toLowerCase()+'.json';if(!existsSync(path))return expected;
 return validateClockPinAmendment(JSON.parse(readFileSync(path)),JSON.parse(readFileSync(directory+'baseline.json')),expected,readFileSync(directory+'original-files/'+file+'.txt','utf8'));
}
