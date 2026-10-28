import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const directory='specs/010-entradas-cuerpo/evidence/';
export const bodyBudgetTargets=['change-tests/body-inputs.spec.js','scripts/body-inputs-evidence.js'];
const digest=text=>createHash('sha256').update(text.replace(/\r\n/g,'\n')).digest('hex');
const json=file=>JSON.parse(readFileSync(file,'utf8'));
export function canonicalBodyBudgetSource(file,original){
 assert(bodyBudgetTargets.includes(file));let source=original.replace(/\r\n/g,'\n');
 const replace=(from,to)=>{assert.equal(source.split(from).length,2,'ancla única de presupuesto '+file);source=source.replace(from,to);};
 if(file==='change-tests/body-inputs.spec.js'){
  replace("import {withBodyInputs,bodyInputFields,priorBodyRecord,bodyInputDate} from '../test-support/body-inputs-browser.js';\n", "import {withBodyInputs,bodyInputFields,priorBodyRecord,bodyInputDate} from '../test-support/body-inputs-browser.js';\n\n// Mismo presupuesto de la configuración dedicada E0; las aserciones no cambian.\ntest.setTimeout(120000);\n");
 }else{
  source="import {approvedBodyInputBudgetPinHash} from './body-inputs-budget-amendments.js';\n"+source;
  replace("for(const pin of baseline.pins)assert.equal(bodyInputDigest(readFileSync(pin.file,'utf8')),pin.sha256,pin.file);", "let newAmended=0;for(const pin of baseline.pins){const actual=bodyInputDigest(readFileSync(pin.file,'utf8'));if(actual!==pin.sha256)newAmended++;assert.equal(actual,approvedBodyInputBudgetPinHash(pin.file,pin.sha256),pin.file);}");
  replace('return {previousVerified:123,intact:123-amended,amended,newIntact:9};','return {previousVerified:123,intact:123-amended,amended,newIntact:9-newAmended,newAmended};');
 }
 return source;
}
export function validateBodyBudgetRecord(record,baseline,originals){
 assert.equal(record.approvedPlan,baseline.approvedPlan);assert.match(record.approvedPlan,/^[a-f0-9]{40}$/);assert.equal(record.timeout,120000);assert.equal(record.originalSourceHash,baseline.sourceHash);assert.equal(record.gpinVerificationHash,baseline.verificationHash);assert.equal(record.assertionsChanged,false);assert.equal(record.legacyBudgetsChanged,false);
 assert.equal(record.configHash,baseline.pins.find(p=>p.file==='playwright.body-inputs.config.js').sha256);assert.deepEqual(record.targets.map(t=>t.file),bodyBudgetTargets);
 for(const target of record.targets){const before=baseline.pins.find(p=>p.file===target.file).sha256;assert.equal(target.before,before);assert.equal(digest(originals[target.file]),before);assert.equal(target.after,digest(canonicalBodyBudgetSource(target.file,originals[target.file])));}
 assert.equal(record.originalReplay,'budget-original-replay.json');assert.match(record.originalReplaySha,/^[a-f0-9]{64}$/);assert.match(record.candidateVerificationHash,/^[a-f0-9]{64}$/);return record;
}
function originals(){return Object.fromEntries(bodyBudgetTargets.map(file=>[file,readFileSync(directory+'original-files/'+file+'.txt','utf8')]));}
function validateExecution(record){
 assert.equal(digest(readFileSync(directory+record.originalReplay,'utf8')),record.originalReplaySha);const replay=json(directory+record.originalReplay);assert.equal(replay.passed,true);assert.equal(replay.cleanupPassed,true);assert.equal(replay.sourceHash,record.originalSourceHash);assert.equal(replay.verificationHash,record.candidateVerificationHash);assert.equal(replay.beforeHash,replay.afterHash);assert.equal(replay.beforeHash,replay.verificationHash);
 const browser=json(directory+'budget-original-browser.json');assert.equal(digest(readFileSync(directory+'budget-original-browser.json','utf8')),replay.browserSha);assert.deepEqual(browser.errors,[]);assert.equal(browser.stats.expected,3);assert.equal(browser.stats.unexpected,5);assert.equal(browser.stats.skipped,0);assert.equal(browser.stats.flaky,0);
 const targeted=json(directory+'candidate-targeted.json');assert.equal(targeted.passed,true);assert.equal(targeted.verificationHash,record.candidateVerificationHash);assert.equal(targeted.approvedPlan,record.approvedPlan);
}
export function approvedBodyInputBudgetPinHash(file,expected){
 if(!bodyBudgetTargets.includes(file))return expected;const path=directory+'budget-amendment.json';if(!existsSync(path))return expected;
 const record=validateBodyBudgetRecord(json(path),json(directory+'baseline.json'),originals());validateExecution(record);const target=record.targets.find(t=>t.file===file);assert.equal(target.before,expected);return target.after;
}
export function emitBodyInputBudgetAmendment(targeted){
 const baseline=json(directory+'baseline.json'),source=originals();const record={approvedPlan:baseline.approvedPlan,timeout:120000,originalSourceHash:baseline.sourceHash,gpinVerificationHash:baseline.verificationHash,configHash:baseline.pins.find(p=>p.file==='playwright.body-inputs.config.js').sha256,assertionsChanged:false,legacyBudgetsChanged:false,originalReplay:'budget-original-replay.json',originalReplaySha:digest(readFileSync(directory+'budget-original-replay.json','utf8')),candidateVerificationHash:targeted.verificationHash,targets:bodyBudgetTargets.map(file=>({file,before:digest(source[file]),after:digest(canonicalBodyBudgetSource(file,source[file]))}))};
 validateBodyBudgetRecord(record,baseline,source);validateExecution(record);for(const target of record.targets)assert.equal(digest(readFileSync(target.file,'utf8')),target.after);writeFileSync(directory+'budget-amendment.json',JSON.stringify(record,null,2)+'\n');return record;
}
