import {approvedBodyInputPinHash} from './body-inputs-pin-amendments.js';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {approvedDeletePinHash} from './delete-pin-amendments.js';
import {approvedClockPinHash} from './clock-pin-amendments.js';
export const directory='specs/007-guardado-fiable/evidence/';
export const digest=file=>createHash('sha256').update(readFileSync(file,'utf8').replace(/\r\n/g,'\n')).digest('hex');
export function sourceHash(){const h=createHash('sha256');for(const f of execFileSync('git',['ls-files','src'],{encoding:'utf8'}).trim().split(/\r?\n/))h.update(f).update(readFileSync(f));return h.digest('hex');}
export function readBrowser(file){const text=readFileSync(file,'utf8');return JSON.parse(text.slice(text.indexOf('{')));}
export function browserCases(json){const out=[];function visit(suites){for(const s of suites||[]){for(const spec of s.specs||[])for(const t of spec.tests)out.push({name:spec.title,results:t.results});visit(s.suites);}}visit(json.suites);return out;}
export function verifySaveStatePins(){const b=JSON.parse(readFileSync(directory+'baseline.json'));for(const pin of b.pins)assert.equal(digest(pin.file),approvedBodyInputPinHash(pin.file,approvedClockPinHash(pin.file,pin.sha256)),pin.file);return b.pins.length;}
export function markRows(ids){const file='specs/007-guardado-fiable/traceability.json',m=JSON.parse(readFileSync(file));for(const row of m.requirements)if(ids.includes(row.id)){row.status='complete';row.tests=row.plannedTests;}writeFileSync(file,JSON.stringify(m,null,2)+'\n');}
export function approvedSavePinHash(file,originalHash){
 const allowed=[['PIN-007-001','test/data-sync.test.js',3],['PIN-007-003','test-support/interface-cases.js',3],['PIN-007-005','test/body-compatibility.test.js',3],['PIN-007-002','test-support/interface-cases.js',3],['PIN-007-006','browser-tests/interface.spec.js',1]];
 let expected=originalHash;
 for(const [id,target,tests] of allowed){const path=directory+id.toLowerCase()+'.json';if(file!==target||!existsSync(path))continue;
  const a=JSON.parse(readFileSync(path)),b=JSON.parse(readFileSync(directory+'baseline.json'));
  assert.equal(a.id,id);assert.equal(a.file,target);assert.equal(a.before,expected);assert.equal(a.originalHash,b.previousPins.find(p=>p.file===target).sha256);
  assert.equal(a.approvedPlan,'e5df628');assert.ok(a.fr.every(fr=>['FR-005','FR-006','FR-007','FR-008','FR-009'].includes(fr)));assert.equal(a.originalProof.sourceHash,b.sourceHash);assert.equal(a.originalProof.node,314);assert.equal(a.originalProof.browser,27);assert.equal(a.candidateTargeted.passed,true);assert.equal(a.candidateTargeted.tests,tests);
  expected=a.after;
 }
 return approvedBodyInputPinHash(file,approvedClockPinHash(file,approvedDeletePinHash(file,expected)));
}
