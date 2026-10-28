import assert from 'node:assert/strict';
import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,symlinkSync,unlinkSync,rmSync,realpathSync} from 'node:fs';
import {join,relative,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {sourceHash,browserCases} from './save-state-evidence.js';
import {verificationHash} from './clock-state-evidence.js';

const root=realpathSync(process.cwd()),out=join(root,'test-results');mkdirSync(out,{recursive:true});
const shadow=mkdtempSync(join(out,'body010-mutation-')),nonce=randomUUID(),hash=verificationHash(),src=sourceHash();
writeFileSync(join(shadow,'.sdd-owner'),nonce);
const report={passed:false,generatedAt:new Date().toISOString(),sourceHash:src,verificationHash:hash,positiveControls:0,mutations:[]};
const mutations=[
 {name:'syntax',file:'src/body-inputs.js',from:"else if (typeof value === 'string' && decimal.test(value.trim()))",to:"else if (typeof value === 'string')",test:'cuerpo010 sintaxis y fronteras rechazan sin reemplazar'},
 {name:'zero',file:'src/body-inputs.js',from:'weight: { required: true, allowZero: false }',to:'weight: { required: true, allowZero: true }',test:'cuerpo010 sintaxis y fronteras rechazan sin reemplazar'},
 {name:'partial',file:'src/BodyScreen.jsx',from:'if (!parsed.valid) { setMeasurementErrors(parsed.errors); return; }',to:'if (!parsed.valid) { setMeasurements((previous) => [...previous, { id: "partial010", date: mDate, cintura: 1 }]); setMeasurementErrors(parsed.errors); return; }',test:'cuerpo010 mezcla invalida conserva borrador sin exito'},
 {name:'accessible',file:'src/BodyScreen.jsx',from:'aria-describedby={measurementErrors[k] ? `${measurementInputId}-error-${k}` : undefined}',to:'aria-describedby={undefined}',test:'cuerpo010 errores asocian campos en movil y escritorio'},
 {name:'comma',file:'src/BodyScreen.jsx',from:'type="text" inputMode="decimal" placeholder="–"',to:'type="number" inputMode="decimal" placeholder="–"',test:'cuerpo010 coma y punto recorren nueve campos'},
];
function run(test,label){
 const result=spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test','--config=playwright.body-inputs.config.js','--grep',test,'--reporter=json'],{cwd:shadow,encoding:'utf8',maxBuffer:50*1024*1024,windowsHide:true});
 writeFileSync(join(out,'body010-mutation-'+label+'.json'),result.stdout||'');if(result.error)throw result.error;
 const json=JSON.parse(result.stdout);assert.deepEqual(json.errors,[]);assert.equal(json.stats.skipped,0);assert.equal(json.stats.flaky,0);return {code:result.status,json};
}
try{
 for(const folder of ['src','test-support','browser-tests','change-tests'])cpSync(join(root,folder),join(shadow,folder),{recursive:true,filter:path=>!basename(path).startsWith('.env')});
 for(const file of ['package.json','playwright.body-inputs.config.js'])cpSync(join(root,file),join(shadow,file));
 symlinkSync(join(root,'node_modules'),join(shadow,'node_modules'),'junction');
 for(const mutation of mutations){
  console.log('Mutación cuerpo010: control '+mutation.name);const positive=run(mutation.test,mutation.name+'-positive');assert.equal(positive.code,0);assert.equal(positive.json.stats.expected,1);assert.equal(positive.json.stats.unexpected,0);report.positiveControls++;
  const path=join(shadow,mutation.file),original=readFileSync(path,'utf8');assert.equal(original.split(mutation.from).length,2,mutation.name+' debe alterar exactamente una regla');writeFileSync(path,original.replace(mutation.from,mutation.to));
  try{
   console.log('Mutación cuerpo010: defecto '+mutation.name);const negative=run(mutation.test,mutation.name);assert.equal(negative.code,1);assert.equal(negative.json.stats.unexpected,1);assert.equal(negative.json.stats.expected,0);
   const cases=browserCases(negative.json);assert.equal(cases.length,1);assert.equal(cases[0].name,mutation.test);assert.equal(cases[0].results.length,1);assert.equal(cases[0].results[0].status,'failed');const error=cases[0].results[0].error.message.replace(/\u001b\[[0-9;]*m/g,'');assert.match(error,/FR-005|FR-006|FR-007|FR-008|FR-010/);assert.doesNotMatch(error,/TypeError|ReferenceError|SyntaxError|ERR_MODULE_NOT_FOUND|Test timeout of/);
   report.mutations.push({name:mutation.name,test:mutation.test,detected:true,positiveControlPassed:true,error});
  }finally{writeFileSync(path,original);}
 }
 assert.equal(verificationHash(),hash);assert.equal(sourceHash(),src);report.passed=true;
}finally{
 const actual=realpathSync(shadow),rel=relative(realpathSync(out),actual);assert(rel.startsWith('body010-mutation-')&&!rel.includes('..')&&!rel.includes('/')&&!rel.includes('\\'));assert.equal(readFileSync(join(actual,'.sdd-owner'),'utf8'),nonce);
 try{unlinkSync(join(actual,'node_modules'));}catch(error){if(error.code!=='ENOENT')throw error;}
 rmSync(actual,{recursive:true});report.cleanupPassed=true;writeFileSync(join(out,'body010-mutations.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({passed:report.passed,positiveControls:report.positiveControls,mutations:report.mutations.length,cleanup:report.cleanupPassed,verificationHash:hash}));
