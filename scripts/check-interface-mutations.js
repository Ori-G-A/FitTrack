import {cpSync,readFileSync,writeFileSync,mkdirSync,mkdtempSync,realpathSync,symlinkSync,unlinkSync,rmSync} from 'node:fs';
import {resolve,join,relative,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';

// Las mutaciones se ejecutan en una copia sin credenciales. No se cambian los
// pins ni el árbol src del checkout y se eliminan únicamente archivos propios.
const root=realpathSync(process.cwd()),out=join(root,'test-results');
mkdirSync(out,{recursive:true});
const require=createRequire(import.meta.url),cli=require.resolve('@playwright/test/cli');
const files=spawnSync('git',['ls-files','src'],{encoding:'utf8'}).stdout.trim().split(/\r?\n/);
const sourceHash=()=>{const h=createHash('sha256');for(const file of files)h.update(file).update(readFileSync(join(root,file)));return h.digest('hex');};
const before=sourceHash(),nonce=randomUUID(),shadow=mkdtempSync(join(out,'interface-mutation-'));
writeFileSync(join(shadow,'.sdd-owner'),nonce);
const report={passed:false,sourceHash:before,generatedAt:new Date().toISOString(),mutations:[]};
writeFileSync(join(out,'interface-postgreen-mutations.json'),JSON.stringify(report));
function run(grep,label){
 const result=spawnSync(process.execPath,[cli,'test','--config=playwright.interface-change.config.js','--grep',grep,'--reporter=json'],{cwd:shadow,encoding:'utf8',maxBuffer:10*1024*1024});
 writeFileSync(join(out,'interface-mutation-'+label+'.json'),result.stdout||'');
 if(result.error)throw result.error;
 const json=JSON.parse(result.stdout);assert.deepEqual(json.errors,[]);assert.equal(json.stats.skipped,0);assert.equal(json.stats.flaky,0);
 return {code:result.status,json};
}
try {
 for(const folder of ['src','test-support','change-tests'])cpSync(join(root,folder),join(shadow,folder),{recursive:true,filter:path=>!basename(path).startsWith('.env')});
 for(const file of ['package.json','playwright.config.js','playwright.interface-change.config.js'])cpSync(join(root,file),join(shadow,file));
 symlinkSync(join(root,'node_modules'),join(shadow,'node_modules'),'junction');
 const mutants=[
  {name:'escape',file:'src/ModalSheet.jsx',from:'event.key === "Escape"',to:'event.key === "Escape-disabled"',test:'interfaz cambio Registrar teclado y foco',reason:/toHaveCount/},
  {name:'label',file:'src/BodyScreen.jsx',from:'htmlFor={weightInputId}',to:'',test:'interfaz cambio campo Peso en kg',reason:/getByLabel\('Peso en kg'/},
  {name:'highlight',file:'src/DashboardScreen.jsx',from:'    }, 2200);',to:'    }, 220000);',test:'interfaz cambio resaltado temporal tras consumo de focusCard',reason:/FR-024: consumir focusCard/},
 ];
 const positive=run(mutants.map(m=>m.test).join('|'),'positive');assert.equal(positive.code,0);assert.equal(positive.json.stats.expected,3);assert.equal(positive.json.stats.unexpected,0);
 report.positiveControls=3;
 for(const m of mutants){
  const path=join(shadow,m.file),original=readFileSync(path,'utf8');assert.equal(original.split(m.from).length,2,m.name+' debe alterar exactamente una cláusula');
  writeFileSync(path,original.replace(m.from,m.to));
  try {
   const bad=run(m.test,m.name);assert.equal(bad.code,1);assert.equal(bad.json.stats.unexpected,1);assert.equal(bad.json.stats.expected,0);
   const results=[];function visit(suites){for(const suite of suites){for(const spec of suite.specs||[])for(const test of spec.tests)results.push({name:spec.title,attempts:test.results});visit(suite.suites||[]);}}visit(bad.json.suites);
   assert.equal(results.length,1);assert.equal(results[0].name,m.test);assert.equal(results[0].attempts.length,1);assert.equal(results[0].attempts[0].status,'failed');
   const error=results[0].attempts[0].error.message.replace(/\u001b\[[0-9;]*m/g,'');assert.match(error,m.reason);
   report.mutations.push({name:m.name,test:m.test,detected:true,error});
  } finally {writeFileSync(path,original);}
 }
 assert.equal(sourceHash(),before,'src original debe permanecer intacto');
 report.passed=true;
} finally {
 const actual=realpathSync(shadow),rel=relative(realpathSync(out),actual);
 assert(rel.startsWith('interface-mutation-')&&!rel.includes('..')&&!rel.includes('\\')&&!rel.includes('/'));
 assert.equal(readFileSync(join(actual,'.sdd-owner'),'utf8'),nonce);
 // Eliminar la unión antes de borrar la copia evita recorrer dependencias.
 try{unlinkSync(join(actual,'node_modules'));}catch(error){if(error.code!=='ENOENT')throw error;}
 rmSync(actual,{recursive:true});report.cleanupPassed=true;
 writeFileSync(join(out,'interface-postgreen-mutations.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({passed:report.passed,positiveControls:report.positiveControls,detected:report.mutations.length,cleanup:report.cleanupPassed,sourceHash:before}));
