import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,copyFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {sourceHash,digest,browserCases} from './save-state-evidence.js';
import {verificationHash,verifyClockPins,verifyClockTrace,validateClockMutationEvidence,mutationCaseName} from './clock-state-evidence.js';
import {bodyInputDirectory,bodyInputPinTargets,canonicalBodyInputSource,bodyInputDigest,validateBodyInputTargetedReceipt} from './body-inputs-pin-amendments.js';
import {verifyBodyInputPins,verifyBodyInputTrace,validateBodyInputMutationEvidence,bodyInputMutationCaseName} from './body-inputs-evidence.js';
import {verifyDeletePins,verifyDeleteTrace} from './delete-state-evidence.js';
import {contractIds} from './sdd-contract.js';
import {verifyTrace} from './sdd-trace.js';
import {validateRlsEvidence,currentRlsHashes} from './rls-evidence.js';
import {emitBodyInputBudgetAmendment} from './body-inputs-budget-amendments.js';
import {runtimeOracles,missingMutationOracles} from './body-inputs-runtime-oracles.js';

assert.equal(process.version,'v24.21.0');
const stage=process.argv[2];assert(['targeted','e1','proofs','verify-proofs','final'].includes(stage));
const directory=bodyInputDirectory,baseline=JSON.parse(readFileSync(directory+'baseline.json')),hash=verificationHash(),src=sourceHash();
let attempt=1;while(existsSync(directory+stage+'-attempt-'+attempt+'.json'))attempt++;
const report={stage,passed:false,attempt,startedAt:new Date().toISOString(),approvedPlan:baseline.approvedPlan,node:process.version,sourceHash:src,verificationHash:hash,receipts:[]};
const json=file=>JSON.parse(readFileSync(file,'utf8'));
function run(label,args,extension='.txt'){
 console.log('Checkpoint010 '+stage+': '+label);assert.equal(verificationHash(),hash);const startedAt=new Date().toISOString();
 const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:60*1024*1024,windowsHide:true}),file=directory+stage+'-attempt-'+attempt+'-'+label+extension;
 writeFileSync(file,r.stdout||'');writeFileSync(file+'.stderr',r.stderr||'');const receipt={label,args,startedAt,finishedAt:new Date().toISOString(),exitCode:r.status,file,sha256:digest(file),beforeHash:hash,afterHash:verificationHash()};report.receipts.push(receipt);writeFileSync(directory+stage+'-attempt-'+attempt+'.json',JSON.stringify(report,null,2)+'\n');
 assert.equal(verificationHash(),hash);if(r.error)throw r.error;if(r.status!==0){console.error((r.stderr||'').slice(-3000));throw Error(label+' falló; revisar '+file);}return r.stdout;
}
function validateProofs(proof){
 assert.equal(proof.passed,true);assert.equal(proof.sourceHash,src);assert.equal(proof.verificationHash,hash);
 assert.deepEqual(proof.receipts.map(r=>r.label),['legacy-proofs','input-proofs']);assert.deepEqual(proof.reports.map(r=>r.file),['test-results/clock009-proof-receipts.json','test-results/body010-mutations.json']);
 for(const [i,r]of proof.receipts.entries()){assert.deepEqual(r.args,i===0?['scripts/run-clock-state-checkpoint.js','proofs']:['scripts/check-body-inputs-mutations.js']);assert.equal(r.exitCode,0);assert.equal(r.beforeHash,hash);assert.equal(r.afterHash,hash);assert.equal(digest(r.file),r.sha256);assert(Number.isFinite(Date.parse(r.startedAt)));assert(Date.parse(r.finishedAt)>=Date.parse(r.startedAt));assert.equal(digest(proof.reports[i].file),proof.reports[i].sha256);}
 const legacy=json(proof.reports[0].file);assert.equal(legacy.passed,true);assert.equal(legacy.sourceHash,src);assert.equal(legacy.verificationHash,hash);assert.deepEqual(legacy.receipts.map(r=>r.label),['interface','save','delete','clock']);assert.deepEqual(legacy.reports.map(r=>r.mutations),[3,3,5,3]);
 for(const r of legacy.receipts){assert.equal(r.exitCode,0);assert.equal(r.beforeHash,hash);assert.equal(r.afterHash,hash);assert.equal(digest(r.output),r.sha256);}
 for(const r of legacy.reports){assert.equal(digest(r.file),r.sha256);const value=json(r.file);assert.equal(value.passed,true);assert.equal(value.cleanupPassed,true);assert.equal(value.sourceHash,src);assert.equal(value.mutations.length,r.mutations);}
 validateClockMutationEvidence(json('test-results/clock009-mutations.json'),hash);
 validateBodyInputMutationEvidence(json(proof.reports[1].file),hash,src);return proof;
}
function parseTap(tap){assert.match(tap,/# fail 0/);assert.match(tap,/# skipped 0/);assert.match(tap,/# cancelled 0/);return [...tap.matchAll(/^(ok|not ok) \d+ - (.+)$/gm)].map(m=>({name:m[2],status:m[1]==='ok'&&!/ # (SKIP|TODO)/.test(m[2])?'passed':'failed'}));}
function browserResults(browser,expected){assert.deepEqual(browser.errors,[]);assert.equal(browser.stats.expected,expected);assert.equal(browser.stats.unexpected,0);assert.equal(browser.stats.skipped,0);assert.equal(browser.stats.flaky,0);return browserCases(browser).map(c=>({name:c.name,status:c.results.length===1?c.results[0].status:'retried'}));}
try{
 if(stage==='targeted'){
  const tap=run('node-targeted',['--test','--test-isolation=none','--test-reporter=tap','test/body-weight.test.js','test/body-measurements.test.js','test/body-wellness.test.js','test/body-inputs-values.test.js','test/body-inputs-architecture.test.js'],'.tap');parseTap(tap);assert.match(tap,/# tests 6/);
  const browser=JSON.parse(run('browser-targeted',['node_modules/@playwright/test/cli.js','test','--config=playwright.body-inputs.config.js','--reporter=json'],'.json'));browserResults(browser,8);
  for(const [i,r]of report.receipts.entries()){r.rawFile=r.file;r.file=directory+(i===0?'candidate-targeted.tap':'candidate-targeted-browser.json');copyFileSync(r.rawFile,r.file);r.sha256=digest(r.file);}
  report.passed=true;validateBodyInputTargetedReceipt(report);writeFileSync(directory+'candidate-targeted.json',JSON.stringify(report,null,2)+'\n');
  const inventory=json(directory+'original-inventory.json'),before=new Map(inventory.sourceInventory.map(p=>[p.file,p.sha256]));
  const files=['src/BodyScreen.jsx','src/body-inputs.js','src/body-records.js'].map(file=>({file,before:before.get(file)||null,after:digest(file)}));
  writeFileSync(directory+'source-transition.json',JSON.stringify({approvedPlan:baseline.approvedPlan,before:baseline.sourceHash,after:src,verificationHash:hash,files,proof:'candidate-targeted.json'},null,2)+'\n');
  for(const target of bodyInputPinTargets){const original=readFileSync(directory+'original-files/'+target.file+'.txt','utf8');assert.equal(digest(target.file),bodyInputDigest(canonicalBodyInputSource(target.file,original)));
   const references=target.id==='PIN-010-001'?['FR-005','FR-006','FR-007']:target.id==='PIN-010-002'?['FR-005','FR-006','FR-007','FR-010']:target.id==='PIN-010-003'?['FR-005','FR-009','FR-010']:target.id==='PIN-010-004'?['FR-006']:['US3-AS4','SC-004','SC-005'];
   writeFileSync(directory+target.id.toLowerCase()+'.json',JSON.stringify({...target,after:digest(target.file),approvedPlan:baseline.approvedPlan,references,patchVersion:'body-inputs-v1',originalProof:{sourceHash:baseline.sourceHash,nodeTests:372,browserTests:35,baseline:'baseline.json'},candidateTargeted:{passed:true,nodeTests:6,browserTests:8,sourceHash:src,verificationHash:hash,proof:'candidate-targeted.json'},unrelatedAssertionsChanged:false,businessTimeoutsChanged:false},null,2)+'\n');}
  emitBodyInputBudgetAmendment(report);report.pins=verifyBodyInputPins();
 }else if(stage==='proofs'){
  run('legacy-proofs',['scripts/run-clock-state-checkpoint.js','proofs']);run('input-proofs',['scripts/check-body-inputs-mutations.js']);
  report.reports=['test-results/clock009-proof-receipts.json','test-results/body010-mutations.json'].map(file=>({file,sha256:digest(file)}));report.passed=true;validateProofs(report);writeFileSync('test-results/body010-proof-receipts.json',JSON.stringify(report,null,2)+'\n');
 }else if(stage==='verify-proofs'){
  validateProofs(json('test-results/body010-proof-receipts.json'));run('legacy-receipts',['scripts/run-clock-state-checkpoint.js','verify-proofs']);report.passed=true;
 }else{
  if(stage==='final'){report.proofs=validateProofs(json('test-results/body010-proof-receipts.json'));run('legacy-receipts',['scripts/run-clock-state-checkpoint.js','verify-proofs']);}
  const tap=run('node',['--test','--test-isolation=none','--test-reporter=tap'],'.tap'),results=parseTap(tap);report.nodeTests=Number(tap.match(/# tests (\d+)/)[1]);
  const browser=JSON.parse(run('browser',['node_modules/@playwright/test/cli.js','test','--reporter=json'],'.json'));results.push(...browserResults(browser,43));report.browser=browser.stats;run('build',['node_modules/vite/bin/vite.js','build']);
  if(stage==='final'){run('rls',['scripts/run-local-rls.js']);const rls=json('test-results/rls-evidence.json');assert(Date.parse(rls.generatedAt)>=Date.parse(report.startedAt));results.push(...validateRlsEvidence(rls,currentRlsHashes()));report.rls=rls;results.push(...validateClockMutationEvidence(json('test-results/clock009-mutations.json'),hash),...validateBodyInputMutationEvidence(json('test-results/body010-mutations.json'),hash,src));}
  const specs=['001-datos','002-identidad-fotos','003-entrenamiento','004-nutricion-objetivos','005-cuerpo-ciclo','006-interfaz','007-guardado-fiable','008-borrado-fiable','009-reloj-pruebas','010-entradas-cuerpo'];report.contracts=[];
  for(const spec of specs){if(stage==='e1'&&spec==='002-identidad-fotos')continue;const manifest=json('specs/'+spec+'/traceability.json'),ids=contractIds(readFileSync('specs/'+spec+'/spec.md','utf8')),ordinary=new Set(results.filter(r=>r.status==='passed').map(r=>r.name));
   const absent=[];for(const row of manifest.requirements){const planned=runtimeOracles(row,spec==='010-entradas-cuerpo');if(stage==='e1'&&!planned.every(name=>ordinary.has(name))){missingMutationOracles(planned,ordinary,[mutationCaseName,bodyInputMutationCaseName]);absent.push(row.id);row.status='pending';row.tests=[];}else if(spec==='010-entradas-cuerpo'){row.status='complete';row.tests=row.plannedTests;}}
   const verify=spec==='010-entradas-cuerpo'?verifyBodyInputTrace:spec==='009-reloj-pruebas'?verifyClockTrace:spec==='008-borrado-fiable'?verifyDeleteTrace:verifyTrace;
   const trace=verify(manifest,ids,results,{complete:stage==='final'});assert.deepEqual(trace.errors,[],spec);report.contracts.push({spec,...trace,awaitingMutationProof:absent});
  }
  report.pins=verifyBodyInputPins();report.clockPins=verifyClockPins();report.deletePins=verifyDeletePins();report.results=results;
  if(stage==='final'){assert.equal(report.contracts.length,10);assert.equal(report.contracts.reduce((n,c)=>n+c.counts.complete,0),274);const file='specs/010-entradas-cuerpo/traceability.json',manifest=json(file);for(const row of manifest.requirements){row.status='complete';row.tests=row.plannedTests;}manifest.note='E2 local: 24 IDs propios y diez contratos/274 IDs completos; RLS fresco, mutaciones y limpieza verificados.';writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');}
  report.passed=true;
 }
 assert.equal(verificationHash(),hash);assert.equal(sourceHash(),src);report.generatedAt=new Date().toISOString();if(stage!=='verify-proofs')writeFileSync(directory+stage+'.json',JSON.stringify(report,null,2)+'\n');
}catch(error){report.passed=false;report.error=error.message;throw error;
}finally{writeFileSync(directory+stage+'-attempt-'+attempt+'.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({stage,passed:report.passed,nodeTests:report.nodeTests,browser:report.browser?.expected,verificationHash:hash,pins:report.pins}));
