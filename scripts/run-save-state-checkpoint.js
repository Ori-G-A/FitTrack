import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {directory,sourceHash,readBrowser,browserCases,verifySaveStatePins,markRows} from './save-state-evidence.js';
import {verifyInterfacePins} from './interface-pins.js';
import {verifyTrace} from './sdd-trace.js';
import {contractIds} from './sdd-contract.js';
import {validateRlsEvidence,currentRlsHashes} from './rls-evidence.js';
const stage=process.argv[2];assert.ok(['e1','e2','final'].includes(stage));assert.equal(process.version,'v24.21.0');mkdirSync('test-results',{recursive:true});const prefix='test-results/save007-'+stage;
const cli=createRequire(import.meta.url).resolve('@playwright/test/cli');
function run(args,file,expected=0){const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:30*1024*1024});writeFileSync(file,r.stdout||'');if(r.error)throw r.error;if(r.status!==expected){process.stderr.write((r.stderr||'').slice(-5000));if(file.endsWith('.json')){try{const j=readBrowser(file);console.error(JSON.stringify({errors:j.errors,failures:browserCases(j).filter(c=>c.results.some(r=>r.status!=='passed')).map(c=>({name:c.name,error:c.results[0].error}))},null,2));}catch{console.error((r.stdout||'').slice(-8000));}}else console.error((r.stdout||'').slice(-14000));throw Error('Checkpoint '+stage+': '+args.join(' '));}return r.stdout;}
const files=readdirSync('test').filter(f=>f.endsWith('.test.js')&&(stage!=='e1'||f!=='save-indicator.test.js')).map(f=>'test/'+f);
const tap=run(['--test','--test-isolation=none','--test-reporter=tap',...files],prefix+'.tap');assert.match(tap,/# fail 0/);assert.match(tap,/# skipped 0/);
run([cli,'test',...(stage==='e1'?['--config=playwright.save-state-legacy.config.js']:[]),'--reporter=json'],prefix+'-browser.json');const browser=readBrowser(prefix+'-browser.json');assert.deepEqual(browser.errors,[]);assert.equal(browser.stats.expected,stage==='e1'?27:29);assert.equal(browser.stats.unexpected,0);assert.equal(browser.stats.skipped,0);assert.equal(browser.stats.flaky,0);
if(stage==='e1'){
 const red=run(['--test','--test-isolation=none','--test-reporter=tap','test/save-indicator.test.js'],prefix+'-ui-red.tap',1);assert.match(red,/FR-008: remontar/);assert.doesNotMatch(red,/TypeError|ReferenceError/);
 run([cli,'test','--config=playwright.save-state.config.js','--reporter=json'],prefix+'-ui-red.json',1);const j=readBrowser(prefix+'-ui-red.json');assert.equal(j.stats.unexpected,2);assert.equal(j.stats.skipped,0);for(const c of browserCases(j))assert.match(c.results[0].error.message,/FR-009:/);
}
run(['node_modules/vite/bin/vite.js','build'],prefix+'-build.log');
const ids=stage==='e1'?['FR-005','FR-006','FR-007','US1-AS1','US1-AS2','US1-AS3','US1-AS4','US2-AS1','US2-AS2']:JSON.parse(readFileSync('specs/007-guardado-fiable/traceability.json')).requirements.map(r=>r.id);markRows(ids);
const results=[...tap.matchAll(/^(ok|not ok) \d+ - (.+)$/gm)].map(m=>({name:m[2],status:m[1]==='ok'?'passed':'failed'}));for(const c of browserCases(browser)){assert.equal(c.results.length,1);results.push({name:c.name,status:c.results[0].status});}
const hash=sourceHash(),contracts=[];
for(const spec of readdirSync('specs')){if(stage!=='final'&&spec==='002-identidad-fotos')continue;const local=[...results];if(spec==='002-identidad-fotos')local.push(...validateRlsEvidence(JSON.parse(readFileSync('test-results/rls-evidence.json')),currentRlsHashes()));const manifest=JSON.parse(readFileSync('specs/'+spec+'/traceability.json'));const report=verifyTrace(manifest,contractIds(readFileSync('specs/'+spec+'/spec.md','utf8')),local,{complete:!(stage==='e1'&&spec==='007-guardado-fiable')});assert.deepEqual(report.errors,[],spec);contracts.push({spec,sourceHash:hash,...report});}
const report={stage,passed:true,generatedAt:new Date().toISOString(),node:process.version,sourceHash:hash,nodeTests:Number(tap.match(/# tests (\d+)/)[1]),browser:browser.stats,pins:{legacy:verifyInterfacePins(),new:verifySaveStatePins()},contracts,results};writeFileSync(directory+stage+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({stage,passed:true,node:report.nodeTests,browser:browser.stats.expected,contracts:contracts.map(c=>({spec:c.spec,counts:c.counts}))}));
