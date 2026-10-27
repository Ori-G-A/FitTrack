import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {sourceHash,digest,browserCases,readBrowser} from './save-state-evidence.js';
import {verifyTrace} from './sdd-trace.js';
import {verifyDeleteTrace,verifyDeletePins} from './delete-state-evidence.js';
import {contractIds} from './sdd-contract.js';
import {validateRlsEvidence,currentRlsHashes} from './rls-evidence.js';

const mode=process.argv[2];assert(['local','final'].includes(mode),'Selecciona local o final');assert.equal(process.version,'v24.21.0');
const directory='specs/008-borrado-fiable/evidence/',prefix='test-results/delete008-'+mode,hash=sourceHash();mkdirSync('test-results',{recursive:true});
writeFileSync(directory+mode+'.json',JSON.stringify({passed:false,closurePassed:false,mode,sourceHash:hash}));
const proofs=[['test-results/delete008-mutations.json',5,5],['test-results/interface-postgreen-mutations.json',3,3],['test-results/save007-mutations.json',3,4]].map(([file,count,positive])=>{
 const report=JSON.parse(readFileSync(file));assert.equal(report.passed,true,file);assert.equal(report.cleanupPassed,true,file);assert.equal(report.sourceHash,hash,file);assert.equal(report.mutations.length,count,file);assert.equal(report.positiveControls,positive,file);assert(report.mutations.every(m=>m.detected),file);return {file,count,positive,passed:true};
});
const supplement=JSON.parse(readFileSync(directory+'supplementary-load-races.json'));assert.equal(supplement.passed,true);assert.equal(supplement.sourceHash,hash);assert.equal(digest(supplement.file),supplement.sha256);
let rlsResults=[];
if(mode==='final'){
 const rls=JSON.parse(readFileSync('test-results/rls-evidence.json'));
 rlsResults=validateRlsEvidence(rls,currentRlsHashes());
 const e2=JSON.parse(readFileSync(directory+'e2.json'));assert(Date.parse(rls.generatedAt)>=Date.parse(e2.generatedAt),'RLS debe ser fresco para este cierre');
}
function run(args,file){const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:32*1024*1024,windowsHide:true});writeFileSync(file,r.stdout||'');writeFileSync(file+'.stderr',r.stderr||'');if(r.error||r.status!==0){console.error((r.stdout||'').slice(-6500));throw r.error||Error('Checkpoint '+mode+': '+file);}return r.stdout;}
const tap=run(['--test','--test-isolation=none','--test-reporter=tap'],prefix+'.tap');assert.match(tap,/# fail 0/);assert.match(tap,/# skipped 0/);assert.match(tap,/# cancelled 0/);console.log(tap.slice(-180));
const cli=createRequire(import.meta.url).resolve('@playwright/test/cli');run([cli,'test','--reporter=json'],prefix+'-browser.json');const browser=readBrowser(prefix+'-browser.json');assert.deepEqual(browser.errors,[]);assert.equal(browser.stats.expected,30);assert.equal(browser.stats.unexpected,0);assert.equal(browser.stats.skipped,0);assert.equal(browser.stats.flaky,0);console.log('30 Chromium aprobados');
run(['node_modules/vite/bin/vite.js','build'],prefix+'-build.log');
const results=[...tap.matchAll(/^(ok|not ok) \d+ - (.+)$/gm)].map(m=>({name:m[2],status:m[1]==='ok'?'passed':'failed'}));for(const c of browserCases(browser)){assert.equal(c.results.length,1);results.push({name:c.name,status:c.results[0].status});}
assert.equal(sourceHash(),hash,'src debe conservarse durante el checkpoint');
const contracts=[];
for(const spec of readdirSync('specs').filter(s=>/^\d{3}-/.test(s))){if(mode==='local'&&spec==='002-identidad-fotos')continue;
 const manifest=JSON.parse(readFileSync('specs/'+spec+'/traceability.json')),ids=contractIds(readFileSync('specs/'+spec+'/spec.md','utf8'));
 const verify=spec==='008-borrado-fiable'?verifyDeleteTrace:verifyTrace;
 const report=verify(manifest,ids,[...results,...(spec==='002-identidad-fotos'?rlsResults:[])],{complete:true});assert.deepEqual(report.errors,[],spec);contracts.push({spec,sourceHash:hash,...report});
}
assert.equal(contracts.length,mode==='final'?8:7);
const report={passed:true,closurePassed:mode==='final',mode,generatedAt:new Date().toISOString(),node:process.version,sourceHash:hash,nodeTests:Number(tap.match(/# tests (\d+)/)[1]),browser:browser.stats,contracts,pins:verifyDeletePins(),proofs,supplementary:supplement,results,rlsFresh:mode==='final',rlsOmission:mode==='local'?'002 excluida: exige RLS fresco y limpieza confirmada.':null};
writeFileSync(directory+mode+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,closurePassed:report.closurePassed,mode,node:report.nodeTests,browser:30,contracts:contracts.map(c=>({spec:c.spec,counts:c.counts})),sourceHash:hash}));
