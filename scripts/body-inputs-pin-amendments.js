import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const bodyInputDirectory='specs/010-entradas-cuerpo/evidence/';
export const bodyInputPinTargets=[
 ['PIN-010-001','test/body-weight.test.js','c58489431bdd25014f2510b92fe965eba65c5be8c235e0dd90988f2e23114972'],
 ['PIN-010-002','test/body-measurements.test.js','0a40deaede9b030d0335756d15247bb00ecbf7e666f1cb498051643a30d920e9'],
 ['PIN-010-003','test/body-wellness.test.js','cee5bc7581aa789758291741b6b95f96ec8765786bfe783b5240b273a91b6ff3'],
 ['PIN-010-004','test-support/body-build.js','45d8c14efa2b918c9982b783fee694118754812c8370596ab77020aa340d9d9d'],
 ['PIN-010-005','scripts/clock-state-evidence.js','6554a02e10881c10e580a496b161d670bf2db44ed09d74285fe80e26c642fea9'],
 ['PIN-010-006','test/clock-state-pins.test.js','74c2dcd4c946a51e78661e72118b83358f374eb1652fa59806013262ff08dd9f'],
].map(([id,file,before])=>({id,file,before}));
export const bodyInputOriginalHash='e4e98de0fa1bced3a4372dab58e63172257ed8003eafad8febe306260312b377';
export const bodyInputDigest=text=>createHash('sha256').update(text.replace(/\r\n/g,'\n')).digest('hex');
const json=file=>JSON.parse(readFileSync(file,'utf8'));
const digestFile=file=>bodyInputDigest(readFileSync(file,'utf8'));
const originalFile=file=>bodyInputDirectory+'original-files/'+file+'.txt';

export function canonicalBodyInputSource(file,source){
 assert(bodyInputPinTargets.some(p=>p.file===file),'archivo congelado no autorizado');
 let text=source.replace(/\r\n/g,'\n');
 const replace=(from,to)=>{assert.equal(text.split(from).length,2,'ancla canónica única '+file);text=text.replace(from,to);};
 if(file==='test/body-weight.test.js'){
  replace("for(const [v,n]of [['-1',-1],['Infinity',Infinity]]){await h.call(h.b.setKg,v);await h.call(h.b.addW);assert.equal(h.state.weights.at(-1).kg,n);}","for(const v of ['-1','Infinity']){const before=plain(h.state.weights);await h.call(h.b.setKg,v);await h.call(h.b.addW);assert.deepEqual(plain(h.state.weights),before);assert.equal(h.b.kg,v);}");
 }else if(file==='test/body-measurements.test.js'){
  replace("await h.call(h.b.setMeas,{cintura:'0',cadera:'1,2',pecho:'-1',brazo:'2.5',muslo:''});await h.call(h.b.addM);const m=h.state.measurements[0];assert.equal(m.cintura,0);assert(Number.isNaN(m.cadera));assert.equal(m.pecho,-1);", "const before=plain(h.state.measurements),invalid={cintura:'0',cadera:'1,2',pecho:'-1',brazo:'2.5',muslo:''};await h.call(h.b.setMeas,invalid);await h.call(h.b.addM);assert.deepEqual(plain(h.state.measurements),before);assert.deepEqual(plain(h.b.meas),invalid);await h.call(h.b.setMeas,{cintura:'70',cadera:'1,2',pecho:'1',brazo:'2.5',muslo:''});await h.call(h.b.addM);const m=h.state.measurements[0];assert.equal(m.cintura,70);assert.equal(m.cadera,1.2);assert.equal(m.pecho,1);");
 }else if(file==='test/body-wellness.test.js'){
  replace('assert(Number.isNaN(r.restingHr))','assert.equal(r.restingHr,1.2)');
 }else if(file==='test-support/body-build.js'){
  replace('|toast\\.jsx$/','|toast\\.jsx$|body-inputs\\.js$/');
  replace(" if(mutation==='weight-zero')s=s.replace('if (!value) return;','if (Number.isNaN(value)) return;');\n",'');
  replace(" if(path.endsWith('PerfilScreen.jsx'))", " if(mutation==='weight-zero'&&path.endsWith('body-inputs.js')){const from='weight: { required: true, allowZero: false }';if(s.split(from).length!==2)throw Error('Mutación weight-zero no aplicable');s=s.replace(from,'weight: { required: true, allowZero: true }');}\n if(path.endsWith('PerfilScreen.jsx'))");
 }else if(file==='scripts/clock-state-evidence.js'){
  text="import {approvedBodyInputPinHash,bodyInputPinTargets,verifyBodyInputSourceTransition} from './body-inputs-pin-amendments.js';\n"+text;
  const start=text.indexOf('export function verifyClockPins(){'),end=text.indexOf('\nexport function verifyClockTrace',start);assert(start>=0&&end>start);
  text=text.slice(0,start)+`export function verifyClockPins(){
 const baseline=JSON.parse(readFileSync(clockDirectory+'baseline.json'));assert.equal(baseline.previousPins.length,116);assert.equal(new Set(baseline.previousPins.map(p=>p.file)).size,116);assert.equal(baseline.pins.length,7);
 let amended=0,newAmended=0;
 for(const pin of baseline.previousPins){const actual=digest(pin.file);if(actual!==pin.sha256){amended++;assert([...clockPinTargets,...bodyInputPinTargets].some(t=>t.file===pin.file));}assert.equal(actual,approvedBodyInputPinHash(pin.file,approvedClockPinHash(pin.file,pin.sha256)),pin.file);}
 for(const pin of baseline.pins){const actual=digest(pin.file);if(actual!==pin.sha256)newAmended++;assert.equal(actual,approvedBodyInputPinHash(pin.file,pin.sha256),pin.file);}
 verifyBodyInputSourceTransition({sourceHash:sourceHash(),verificationHash:verificationHash(),historicalSourceHash:baseline.sourceHash});
 return {previousVerified:116,intact:116-amended,amended,newIntact:7-newAmended,newAmended};
}
`+text.slice(end);
 }else{
  replace('assert.equal(report.newIntact,7);','assert.equal(report.newIntact,5);assert.equal(report.newAmended,2);');
 }
 return text;
}

export function validateBodyInputPinAmendment(amendment,baseline,expected,original){
 const target=bodyInputPinTargets.find(p=>p.id===amendment.id&&p.file===amendment.file);assert(target,'archivo/enmienda no autorizados');
 assert.equal(expected,target.before);assert.equal(amendment.before,expected);assert.equal(bodyInputDigest(original),expected);
 assert.equal(baseline.passed,true);assert.match(baseline.approvedPlan,/^[a-f0-9]{40}$/);assert.equal(amendment.approvedPlan,baseline.approvedPlan);
 assert.equal(baseline.sourceHash,bodyInputOriginalHash);assert.equal(baseline.previousPins.find(p=>p.file===target.file)?.sha256,expected);
 assert.equal(amendment.after,bodyInputDigest(canonicalBodyInputSource(target.file,original)));assert.equal(amendment.patchVersion,'body-inputs-v1');
 const references=target.id==='PIN-010-001'?['FR-005','FR-006','FR-007']:target.id==='PIN-010-002'?['FR-005','FR-006','FR-007','FR-010']:target.id==='PIN-010-003'?['FR-005','FR-009','FR-010']:target.id==='PIN-010-004'?['FR-006']:['US3-AS4','SC-004','SC-005'];
 assert.deepEqual(amendment.references,references);assert.equal(amendment.originalProof.sourceHash,bodyInputOriginalHash);assert.equal(amendment.originalProof.nodeTests,372);assert.equal(amendment.originalProof.browserTests,35);
 assert.equal(baseline.red.failed,5);assert.equal(baseline.asis.passed,3);assert.equal(amendment.candidateTargeted.passed,true);assert.equal(amendment.candidateTargeted.nodeTests,6);assert.equal(amendment.candidateTargeted.browserTests,8);
 assert.equal(amendment.unrelatedAssertionsChanged,false);assert.equal(amendment.businessTimeoutsChanged,false);
 return amendment.after;
}

export function validateBodyInputTargetedReceipt(report){
 assert.equal(report.passed,true);assert.match(report.approvedPlan,/^[a-f0-9]{40}$/);assert.match(report.sourceHash,/^[a-f0-9]{64}$/);assert.match(report.verificationHash,/^[a-f0-9]{64}$/);
 assert.deepEqual(report.receipts.map(r=>r.label),['node-targeted','browser-targeted']);
 const expectedArgs=[['--test','--test-isolation=none','--test-reporter=tap','test/body-weight.test.js','test/body-measurements.test.js','test/body-wellness.test.js','test/body-inputs-values.test.js','test/body-inputs-architecture.test.js'],['node_modules/@playwright/test/cli.js','test','--config=playwright.body-inputs.config.js','--reporter=json']];
 for(const [i,r]of report.receipts.entries()){assert.deepEqual(r.args,expectedArgs[i]);assert.equal(r.exitCode,0);assert.equal(r.beforeHash,report.verificationHash);assert.equal(r.afterHash,report.verificationHash);assert.equal(r.file,bodyInputDirectory+(i===0?'candidate-targeted.tap':'candidate-targeted-browser.json'));assert.equal(digestFile(r.file),r.sha256);assert(Number.isFinite(Date.parse(r.startedAt)));assert(Date.parse(r.finishedAt)>=Date.parse(r.startedAt));}
 const tap=readFileSync(report.receipts[0].file,'utf8');assert.match(tap,/# tests 6/);assert.match(tap,/# pass 6/);assert.match(tap,/# fail 0/);assert.match(tap,/# skipped 0/);
 const browser=json(report.receipts[1].file);assert.deepEqual(browser.errors,[]);assert.equal(browser.stats.expected,8);assert.equal(browser.stats.unexpected,0);assert.equal(browser.stats.skipped,0);assert.equal(browser.stats.flaky,0);
 return report;
}

export function approvedBodyInputPinHash(file,expected){
 const target=bodyInputPinTargets.find(p=>p.file===file);if(!target)return expected;
 const path=bodyInputDirectory+target.id.toLowerCase()+'.json';if(!existsSync(path))return expected;
 const amendment=json(path),baseline=json(bodyInputDirectory+'baseline.json');
 const after=validateBodyInputPinAmendment(amendment,baseline,expected,readFileSync(originalFile(file),'utf8'));
 const proof=validateBodyInputTargetedReceipt(json(bodyInputDirectory+'candidate-targeted.json'));assert.equal(proof.approvedPlan,amendment.approvedPlan);assert.equal(proof.verificationHash,amendment.candidateTargeted.verificationHash);assert.equal(proof.sourceHash,amendment.candidateTargeted.sourceHash);
 return after;
}

export function verifyBodyInputSourceTransition(current){
 assert.equal(current.historicalSourceHash,bodyInputOriginalHash);
 const path=bodyInputDirectory+'source-transition.json';
 if(!existsSync(path)){assert.equal(current.sourceHash,bodyInputOriginalHash);return {mode:'original',sourceHash:current.sourceHash};}
 const transition=json(path),baseline=json(bodyInputDirectory+'baseline.json'),inventory=json(bodyInputDirectory+'original-inventory.json');
 assert.equal(transition.approvedPlan,baseline.approvedPlan);assert.equal(transition.before,bodyInputOriginalHash);assert.equal(baseline.sourceHash,bodyInputOriginalHash);assert.equal(transition.after,current.sourceHash);
 const proof=validateBodyInputTargetedReceipt(json(bodyInputDirectory+'candidate-targeted.json'));assert.equal(proof.approvedPlan,transition.approvedPlan);assert.equal(proof.sourceHash,transition.after);assert.equal(proof.verificationHash,transition.verificationHash);
 const files=[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','src'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean))].sort();
 const before=new Map(inventory.sourceInventory.map(p=>[p.file,p.sha256]));const changed=[],added=[];
 for(const file of files){if(!before.has(file))added.push(file);else if(digestFile(file)!==before.get(file))changed.push(file);}
 assert.deepEqual(changed,['src/BodyScreen.jsx','src/body-records.js']);assert.deepEqual(added,['src/body-inputs.js']);assert(inventory.sourceInventory.every(p=>files.includes(p.file)),'fuente original omitida');
 assert.deepEqual(transition.files.map(p=>p.file),[...changed,...added].sort());for(const p of transition.files){assert.equal(p.before,before.get(p.file)||null);assert.equal(p.after,digestFile(p.file));}
 // Reconstruir el original con los dos archivos archivados impide aceptar un
 // inventario reescrito para ocultar cambios de fuente ajenos a 010.
 const historical=createHash('sha256');for(const file of [...before.keys()].sort()){historical.update(file);historical.update(readFileSync(changed.includes(file)?originalFile(file):file));}assert.equal(historical.digest('hex'),bodyInputOriginalHash);
 const indexed=execFileSync('git',['ls-files','src'],{encoding:'utf8'}).trim().split(/\r?\n/).sort();assert.deepEqual(indexed,files,'El nuevo módulo debe estar indexado para sourceHash legado');
 return {mode:'010',before:transition.before,after:transition.after,modified:2,added:1};
}
