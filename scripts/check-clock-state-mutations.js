import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,symlinkSync,unlinkSync,rmSync,realpathSync} from 'node:fs';
import {join,relative,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {sourceHash} from './save-state-evidence.js';
import {verificationHash} from './clock-state-evidence.js';
const root=realpathSync(process.cwd()),out=join(root,'test-results');mkdirSync(out,{recursive:true});
const shadow=mkdtempSync(join(out,'clock009-mutation-')),nonce=randomUUID(),hash=verificationHash(),source=sourceHash(),cli=createRequire(import.meta.url).resolve('@playwright/test/cli');
writeFileSync(join(shadow,'.sdd-owner'),nonce);
const report={passed:false,generatedAt:new Date().toISOString(),sourceHash:source,verificationHash:hash,positiveControls:0,mutations:[]};
const pairs=[['interfaz','test-support/interface-browser.js'],['guardado','change-tests/save-state.spec.js'],['borrado','test-support/delete-state-browser.js']];
function run(label){
 const r=spawnSync(process.execPath,[cli,'test','--config=playwright.clock-state.config.js','--grep','reloj009 demora de preparacion conserva instante y reloj detenido','--reporter=json'],{cwd:shadow,encoding:'utf8',maxBuffer:50*1024*1024,windowsHide:true});
 writeFileSync(join(out,'clock009-mutation-'+label+'.json'),r.stdout||'');if(r.error)throw r.error;const json=JSON.parse(r.stdout);assert.deepEqual(json.errors,[]);assert.equal(json.stats.skipped,0);assert.equal(json.stats.flaky,0);
 return {code:r.status,json};
}
try{
 for(const folder of ['src','test-support','change-tests'])cpSync(join(root,folder),join(shadow,folder),{recursive:true,filter:p=>!basename(p).startsWith('.env')});
 for(const file of ['package.json','playwright.clock-state.config.js'])cpSync(join(root,file),join(shadow,file));
 symlinkSync(join(root,'node_modules'),join(shadow,'node_modules'),'junction');
 for(const [fixture,file] of pairs){
  console.log('Mutación reloj009: control '+fixture);
  const positive=run(fixture+'-positive');assert.equal(positive.code,0);assert.equal(positive.json.stats.expected,1);assert.equal(positive.json.stats.unexpected,0);report.positiveControls++;
  const current=readFileSync(join(shadow,file),'utf8');writeFileSync(join(shadow,file),readFileSync(join(root,'specs/009-reloj-pruebas/evidence/original-files',file+'.txt')));
  try{
   console.log('Mutación reloj009: patrón original '+fixture);
   const bad=run(fixture);assert.equal(bad.code,1);assert.equal(bad.json.stats.unexpected,1);assert.equal(bad.json.stats.expected,0);
   const rows=JSON.parse(readFileSync(join(shadow,'test-results/clock009-observations-matrix.json'))),failed=rows.filter(r=>!r.passed);
   assert(failed.length>=2);for(const row of failed){assert.equal(row.fixture,fixture);assert.equal(row.scriptsInjected,0);assert.match(row.error,/Cannot fast-forward to the past/);assert.doesNotMatch(row.error,/TypeError|ReferenceError|SyntaxError|ERR_MODULE_NOT_FOUND/);}
   assert(failed.some(r=>r.delayMs===250));assert(failed.some(r=>r.delayMs===1500));
   report.mutations.push({fixture,detected:true,positiveControlPassed:true,scriptsInjectedOnFailure:0,error:failed[0].error,failedCombinations:failed.map(r=>r.delayMs)});
  }finally{writeFileSync(join(shadow,file),current);}
 }
 assert.equal(verificationHash(),hash);assert.equal(sourceHash(),source);report.passed=true;
}finally{
 const actual=realpathSync(shadow),rel=relative(realpathSync(out),actual);assert(rel.startsWith('clock009-mutation-')&&!rel.includes('..')&&!rel.includes('/')&&!rel.includes('\\'));assert.equal(readFileSync(join(actual,'.sdd-owner'),'utf8'),nonce);
 try{unlinkSync(join(actual,'node_modules'));}catch(error){if(error.code!=='ENOENT')throw error;}
 rmSync(actual,{recursive:true});report.cleanupPassed=true;writeFileSync(join(out,'clock009-mutations.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify(report));
