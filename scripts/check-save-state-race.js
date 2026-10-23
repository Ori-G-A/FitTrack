import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,symlinkSync,unlinkSync,rmSync,realpathSync} from 'node:fs';
import {join,relative} from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {sourceHash,digest,directory} from './save-state-evidence.js';

// Prueba suplementaria de revisión: no sustituye los seis rojos congelados E0.
assert.equal(process.version,'v24.21.0');
const root=realpathSync(process.cwd()),out=join(root,'test-results');mkdirSync(out,{recursive:true});
const shadow=mkdtempSync(join(out,'save007-race-')),nonce=randomUUID(),before=sourceHash();
writeFileSync(join(shadow,'.sdd-owner'),nonce);
const base='4eee59db2efb7ff389acdb5396b4e77ca4094cad',file='test/save-state-race.test.js';
const report={passed:false,generatedAt:new Date().toISOString(),supplementary:true,base,sourceHash:before,file,sha256:digest(file)};
function run(cwd,label){
 const r=spawnSync(process.execPath,['--test','--test-isolation=none','--test-reporter=tap',file],{cwd,encoding:'utf8',maxBuffer:5*1024*1024});
 writeFileSync(join(out,'save007-race-'+label+'.tap'),r.stdout||'');if(r.error)throw r.error;
 assert.match(r.stdout,/# tests 1/);assert.match(r.stdout,/# skipped 0/);return r;
}
try{
 const green=run(root,'candidate');assert.equal(green.status,0,green.stdout);report.candidatePassed=true;
 cpSync(join(root,'test-support'),join(shadow,'test-support'),{recursive:true});mkdirSync(join(shadow,'test'));
 cpSync(join(root,file),join(shadow,file));cpSync(join(root,'package.json'),join(shadow,'package.json'));
 symlinkSync(join(root,'node_modules'),join(shadow,'node_modules'),'junction');
 const files=execFileSync('git',['ls-tree','-r','--name-only',base,'src'],{encoding:'utf8'}).trim().split(/\r?\n/);
 for(const f of files){assert.match(f,/^src\/[a-zA-Z0-9_./-]+$/);assert(!f.includes('..'));const target=join(shadow,f);mkdirSync(join(target,'..'),{recursive:true});writeFileSync(target,execFileSync('git',['show',base+':'+f]));}
 const red=run(shadow,'original');assert.equal(red.status,1);assert.match(red.stdout,/FR-007: commit de B no pinta error A antes de efectos/);assert.doesNotMatch(red.stdout,/TypeError|ReferenceError/);
 report.originalFailedForExpectedReason=true;assert.equal(sourceHash(),before);report.passed=true;
}finally{
 const actual=realpathSync(shadow),rel=relative(realpathSync(out),actual);
 assert(rel.startsWith('save007-race-')&&!rel.includes('..')&&!rel.includes('/')&&!rel.includes('\\'));
 assert.equal(readFileSync(join(actual,'.sdd-owner'),'utf8'),nonce);
 try{unlinkSync(join(actual,'node_modules'));}catch(e){if(e.code!=='ENOENT')throw e;}
 rmSync(actual,{recursive:true});report.cleanupPassed=true;
 writeFileSync(directory+'supplementary-race.json',JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify(report));
