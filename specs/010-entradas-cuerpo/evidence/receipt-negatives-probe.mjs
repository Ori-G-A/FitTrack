// Ejecutar después de proofs; altera únicamente reportes sintéticos de
// test-results y restaura sus bytes en finally. No modifica producto o pins.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {sourceHash} from '../../../scripts/save-state-evidence.js';
import {verificationHash} from '../../../scripts/clock-state-evidence.js';
assert.equal(process.version,'v24.21.0');
const directory='specs/010-entradas-cuerpo/evidence/';
const paths=['test-results/body010-proof-receipts.json','test-results/clock009-proof-receipts.json','test-results/body010-mutations.json'];
const originals=paths.map(path=>readFileSync(path,'utf8')),hash=verificationHash(),src=sourceHash();
const digest=text=>createHash('sha256').update(text.replace(/\r\n/g,'\n')).digest('hex');
const parse=()=>originals.map(text=>JSON.parse(text));
const restore=()=>paths.forEach((path,i)=>writeFileSync(path,originals[i]));
const cases=[
 ['estado-falso',([root])=>root.passed=false],
 ['huella-ajena',([root])=>root.verificationHash='ajena'],
 ['fuente-ajena',([root])=>root.sourceHash='ajena'],
 ['comando-ajeno',([root])=>root.receipts[0].args=['scripts/ajeno.js']],
 ['huella-inicial-ajena',([root])=>root.receipts[1].beforeHash='ajena'],
 ['omitido',([root])=>root.receipts.pop()],
 ['duplicado',([root])=>root.receipts[1]=structuredClone(root.receipts[0])],
 ['digest-falso',([root])=>root.reports[1].sha256='falso'],
 ['fecha-invalida',([root])=>root.receipts[1].finishedAt='no-fecha'],
 ['cleanup-ausente',([root,legacy,own])=>{own.cleanupPassed=false;}],
 ['mutacion-omitida',([root,legacy,own])=>{own.mutations.pop();}],
 ['legado-comando-ajeno',([root,legacy])=>{legacy.receipts[0].args=['scripts/ajeno.js'];}],
 ['legado-recibo-omitido',([root,legacy])=>{legacy.receipts.pop();}],
];
const report={passed:false,generatedAt:new Date().toISOString(),sourceHash:src,verificationHash:hash,positiveControls:0,negatives:[]};
function run(label){const r=spawnSync(process.execPath,['scripts/run-body-inputs-checkpoint.js','verify-proofs'],{encoding:'utf8',maxBuffer:5*1024*1024,windowsHide:true});if(r.error)throw r.error;writeFileSync(directory+'receipt-'+label+'.txt',(r.stdout||'')+(r.stderr||''));return r;}
try{
 assert.equal(run('positive-before').status,0);report.positiveControls++;
 for(const [name,change]of cases){
  const data=parse();change(data);const serialized=data.map(value=>JSON.stringify(value,null,2)+'\n');
  // Recalcular el digest exterior obliga a validar el contenido alterado,
  // en lugar de rechazar solo por una firma de archivo desactualizada.
  if(serialized[1]!==originals[1])data[0].reports[0].sha256=digest(serialized[1]);
  if(serialized[2]!==originals[2])data[0].reports[1].sha256=digest(serialized[2]);
  paths.forEach((path,i)=>writeFileSync(path,JSON.stringify(data[i],null,2)+'\n'));
  try{const r=run(name);assert.equal(r.status,1,name);assert.match(r.stderr,/AssertionError|ERR_ASSERTION|legacy-receipts falló/);assert.doesNotMatch(r.stderr,/TypeError|ReferenceError|SyntaxError|ERR_MODULE_NOT_FOUND/);report.negatives.push({name,rejected:true,exitCode:r.status,output:'receipt-'+name+'.txt'});}finally{restore();}
 }
 assert.equal(run('positive-after').status,0);report.positiveControls++;
 paths.forEach((path,i)=>assert.equal(readFileSync(path,'utf8'),originals[i]));assert.equal(verificationHash(),hash);assert.equal(sourceHash(),src);report.passed=true;report.restored=true;
}finally{restore();writeFileSync(directory+'receipt-negatives.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({passed:report.passed,negativeControls:report.negatives.length,positiveControls:report.positiveControls,restored:report.restored,verificationHash:hash}));
