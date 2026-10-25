import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,symlinkSync,unlinkSync,rmSync,realpathSync} from 'node:fs';
import {join,relative,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
// Al promover este borrador a scripts/, la ruta sigue resolviendo el helper.
import {sourceHash} from '../scripts/save-state-evidence.js';

const root=realpathSync(process.cwd()),out=join(root,'test-results');mkdirSync(out,{recursive:true});
const shadow=mkdtempSync(join(out,'delete008-mutation-')),nonce=randomUUID(),before=sourceHash();writeFileSync(join(shadow,'.sdd-owner'),nonce);
const report={passed:false,generatedAt:new Date().toISOString(),sourceHash:before,positiveControls:0,mutations:[]};
const groups={core:'test/delete-state-core-change.test.js',app:'test/delete-state-app-change.test.js',coordinator:'test/delete-state-coordinator.test.js'};
function run(group,label){const r=spawnSync(process.execPath,['--test','--test-isolation=none','--test-reporter=tap',groups[group]],{cwd:shadow,encoding:'utf8',maxBuffer:32*1024*1024,windowsHide:true,timeout:180000});writeFileSync(join(out,'delete008-mutation-'+label+'.tap'),r.stdout||'');if(r.error)throw r.error;assert.match(r.stdout,/# skipped 0/);assert.match(r.stdout,/# cancelled 0/);return {code:r.status,text:r.stdout};}
const cases=[
 {name:'ignore-signout-error',group:'core',patches:[['src/app-data-lifecycle.js','  if (result?.error) throw result.error;','  // Mutación: ignorar error devuelto.']],reason:/FR-005: ambos resultados rechazan/},
 {name:'resume-after-failure',group:'core',patches:[['src/app-data-lifecycle.js','deleteUserPhotos, deleteAppData, signOut, setLoaded,','deleteUserPhotos, deleteAppData, signOut, setLoaded, resumeUserSaves,'],['src/app-data-lifecycle.js','  await deleteAppData(userId);','  try { await deleteAppData(userId); } catch (error) { resumeUserSaves(userId); setLoaded(true); throw error; }']],reason:/FR-007\/010: resultado incierto no reabre/},
 {name:'obsolete-actor-continues',group:'app',patches:[['src/app-data-lifecycle.js','if (!isCurrent()) throw new Error','if (false) throw new Error']],reason:/FR-011: resultado A no despacha signOut/},
 {name:'ordinary-recovery-bypass',group:'app',patches:[['src/FitTrack.jsx','if (!deleteFlow.matches(actor) || deleteFlow.isBlocked()) return;','if (!deleteFlow.matches(actor)) return;'],['src/FitTrack.jsx','if (actor.userId !== userId || deleteFlow.isBlocked()) return;','if (actor.userId !== userId) return;']],reason:/FR-008: recuperación ordinaria no carga/},
 {name:'resume-before-commit',group:'coordinator',patches:[['src/delete-coordinator.js',"      publish({phase: 'ready', recoveryId: token});","      effects.resumeUserSaves(item.actor.userId); publish({phase: 'ready', recoveryId: token});"]],reason:/FR-009: resolver lectura no libera guardados/},
];
try{
 for(const folder of ['src','test-support'])cpSync(join(root,folder),join(shadow,folder),{recursive:true,filter:p=>!basename(p).startsWith('.env')});mkdirSync(join(shadow,'test'));for(const file of Object.values(groups))cpSync(join(root,file),join(shadow,file));cpSync(join(root,'package.json'),join(shadow,'package.json'));symlinkSync(join(root,'node_modules'),join(shadow,'node_modules'),'junction');
 for(const mutation of cases){
  const positive=run(mutation.group,mutation.name+'-positive');assert.equal(positive.code,0,mutation.name+' control positivo');assert.match(positive.text,/# fail 0/);report.positiveControls++;
  const originals=new Map();
  try{
   for(const [file,from,to] of mutation.patches){const path=join(shadow,file);if(!originals.has(path))originals.set(path,readFileSync(path,'utf8'));const text=readFileSync(path,'utf8');assert.equal(text.split(from).length,2,mutation.name+' ancla única');writeFileSync(path,text.replace(from,to));}
   const bad=run(mutation.group,mutation.name);assert.equal(bad.code,1,mutation.name+' debe fallar');assert.match(bad.text,mutation.reason);assert.doesNotMatch(bad.text,/TypeError|ReferenceError|SyntaxError|Timeout:|ERR_MODULE_NOT_FOUND/);report.mutations.push({name:mutation.name,detected:true,positiveControlPassed:true,group:mutation.group,reason:mutation.reason.source,patches:mutation.patches.map(([file])=>file)});
  }finally{for(const [path,text] of originals)writeFileSync(path,text);}
 }
 assert.equal(sourceHash(),before);report.passed=true;
}finally{
 const actual=realpathSync(shadow),rel=relative(realpathSync(out),actual);assert(rel.startsWith('delete008-mutation-')&&!rel.includes('..')&&!rel.includes('/')&&!rel.includes('\\'));assert.equal(readFileSync(join(actual,'.sdd-owner'),'utf8'),nonce);
 try{unlinkSync(join(actual,'node_modules'));}catch(error){if(error.code!=='ENOENT')throw error;}
 rmSync(actual,{recursive:true});report.cleanupPassed=true;writeFileSync(join(out,'delete008-mutations.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify(report));
