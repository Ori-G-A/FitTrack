import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {sourceHash,digest,browserCases} from './save-state-evidence.js';
import {clockDirectory,verificationHash,verifyClockPins,verifyClockTrace,validateClockMutationEvidence} from './clock-state-evidence.js';
import {contractIds} from './sdd-contract.js';
import {verifyTrace} from './sdd-trace.js';
import {verifyDeleteTrace,verifyDeletePins} from './delete-state-evidence.js';
import {validateRlsEvidence,currentRlsHashes} from './rls-evidence.js';
assert.equal(process.version,'v24.21.0');const stage=process.argv[2];assert(['e1','proofs','final'].includes(stage));mkdirSync('test-results',{recursive:true});
const hash=verificationHash(),src=sourceHash(),startedAt=new Date().toISOString(),cli=createRequire(import.meta.url).resolve('@playwright/test/cli');
const prefix='test-results/clock009-'+stage,receipts=[];
function run(label,args){
 assert.equal(verificationHash(),hash);console.log('Checkpoint009 '+stage+': '+label);const start=new Date().toISOString();
 const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:60*1024*1024,windowsHide:true});const output=prefix+'-'+label+'.txt';writeFileSync(output,r.stdout||'');writeFileSync(output+'.stderr.txt',r.stderr||'');
 assert.equal(verificationHash(),hash);const receipt={label,args,startedAt:start,finishedAt:new Date().toISOString(),verificationHash:hash,exitCode:r.status,output,sha256:digest(output)};receipts.push(receipt);writeFileSync(prefix+'-receipts.json',JSON.stringify(receipts,null,2)+'\n');
 if(r.error)throw r.error;if(r.status!==0){if(label==='browser'){try{const j=JSON.parse(r.stdout);console.error(JSON.stringify({errors:j.errors,failed:browserCases(j).filter(t=>t.results.some(r=>r.status!=='passed')).map(t=>({name:t.name,errors:t.results.map(r=>r.errors)}))}));}catch{}}else console.error((r.stderr||r.stdout||'').slice(-5000));throw Error(label+' falló; reporte '+output);}
 return r.stdout;
}
if(stage==='proofs'){
 const jobs=[['interface','scripts/check-interface-mutations.js','test-results/interface-postgreen-mutations.json'],['save','scripts/check-save-state-mutations.js','test-results/save007-mutations.json'],['delete','scripts/check-delete-state-mutations.js','test-results/delete008-mutations.json'],['clock','scripts/check-clock-state-mutations.js','test-results/clock009-mutations.json']];
 const reports=[];
 for(const [label,script,proof] of jobs){run(label,[script]);const value=JSON.parse(readFileSync(proof));assert.equal(value.passed,true);assert.equal(value.cleanupPassed,true);assert.equal(value.sourceHash,src);reports.push({label,file:proof,sha256:digest(proof),mutations:value.mutations.length});}
 assert.equal(reports.reduce((sum,r)=>sum+r.mutations,0),14);validateClockMutationEvidence(JSON.parse(readFileSync('test-results/clock009-mutations.json')),hash);
 const result={passed:true,startedAt,generatedAt:new Date().toISOString(),sourceHash:src,verificationHash:hash,receipts,reports};writeFileSync('test-results/clock009-proof-receipts.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passed:true,mutations:14,verificationHash:hash}));process.exit(0);
}
let attempt=1;while(existsSync(clockDirectory+stage+'-attempt-'+attempt+'.json'))attempt++;
const report={stage,passed:false,attempt,startedAt,node:process.version,sourceHash:src,verificationHash:hash,receipts};
try{
 let proof;
 if(stage==='final'){
  proof=JSON.parse(readFileSync('test-results/clock009-proof-receipts.json'));assert.equal(proof.passed,true);assert.equal(proof.verificationHash,hash);assert.equal(proof.receipts.length,4);
  for(const receipt of proof.receipts){assert.equal(receipt.exitCode,0);assert.equal(receipt.verificationHash,hash);assert.equal(digest(receipt.output),receipt.sha256);}
  for(const p of proof.reports)assert.equal(digest(p.file),p.sha256);
 }
 const tap=run('node',['--test','--test-isolation=none','--test-reporter=tap']);assert.match(tap,/# fail 0/);assert.match(tap,/# skipped 0/);assert.match(tap,/# cancelled 0/);
 const browser=JSON.parse(run('browser',[cli,'test','--reporter=json']));assert.equal(browser.stats.expected,35);assert.equal(browser.stats.unexpected,0);assert.equal(browser.stats.skipped,0);assert.equal(browser.stats.flaky,0);assert.deepEqual(browser.errors,[]);
 run('build',['node_modules/vite/bin/vite.js','build']);
 const results=[...tap.matchAll(/^(ok|not ok) \d+ - (.+)$/gm)].map(m=>({name:m[2],status:m[1]==='ok'&&!/ # (SKIP|TODO)/.test(m[2])?'passed':'failed'}));
 for(const c of browserCases(browser))results.push({name:c.name,status:c.results.length===1?c.results[0].status:'retried'});
 if(stage==='final'){
  run('rls',['scripts/run-local-rls.js']);const rls=JSON.parse(readFileSync('test-results/rls-evidence.json'));assert(Date.parse(rls.generatedAt)>=Date.parse(startedAt));results.push(...validateRlsEvidence(rls,currentRlsHashes()));report.rls=rls;
  results.push(...validateClockMutationEvidence(JSON.parse(readFileSync('test-results/clock009-mutations.json')),hash));report.proofs=proof;
 }
 const specs=['001-datos','002-identidad-fotos','003-entrenamiento','004-nutricion-objetivos','005-cuerpo-ciclo','006-interfaz','007-guardado-fiable','008-borrado-fiable','009-reloj-pruebas'];
 const contracts=[];
 for(const spec of specs){if(stage==='e1'&&spec==='002-identidad-fotos')continue;const manifest=JSON.parse(readFileSync('specs/'+spec+'/traceability.json'));
  if(stage==='final'&&spec==='009-reloj-pruebas')for(const row of manifest.requirements){row.status='complete';row.tests=row.plannedTests;}
  const ids=contractIds(readFileSync('specs/'+spec+'/spec.md','utf8')),verify=spec==='009-reloj-pruebas'?verifyClockTrace:spec==='008-borrado-fiable'?verifyDeleteTrace:verifyTrace;
  const checked=verify(manifest,ids,results,{complete:stage==='final'||spec!=='009-reloj-pruebas'});assert.deepEqual(checked.errors,[],spec);contracts.push({spec,sourceHash:src,verificationHash:hash,...checked});
 }
 report.nodeTests=Number(tap.match(/# tests (\d+)/)[1]);report.browser=browser.stats;report.contracts=contracts;report.results=results;report.pins=verifyClockPins();report.previousPinCohorts=verifyDeletePins();assert.equal(sourceHash(),src);assert.equal(verificationHash(),hash);report.passed=true;report.generatedAt=new Date().toISOString();
 if(stage==='final'){assert.equal(contracts.length,9);assert.equal(contracts.reduce((n,c)=>n+c.counts.complete,0),250);const file='specs/009-reloj-pruebas/traceability.json',m=JSON.parse(readFileSync(file));for(const row of m.requirements){row.status='complete';row.tests=row.plannedTests;}m.note='E2 local: dieciséis IDs propios y nueve contratos/250 IDs completos; RLS fresco, mutaciones y limpieza verificados.';writeFileSync(file,JSON.stringify(m,null,2)+'\n');}
 writeFileSync(clockDirectory+stage+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({stage,passed:true,node:report.nodeTests,browser:browser.stats.expected,contracts:contracts.map(c=>({spec:c.spec,counts:c.counts})),verificationHash:hash}));
}finally{writeFileSync(clockDirectory+stage+'-attempt-'+attempt+'.json',JSON.stringify(report,null,2)+'\n');}
