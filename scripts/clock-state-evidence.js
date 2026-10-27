import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {sourceHash,digest} from './save-state-evidence.js';
import {approvedClockPinHash,clockPinTargets} from './clock-pin-amendments.js';
import {verifyTrace} from './sdd-trace.js';

export const clockDirectory='specs/009-reloj-pruebas/evidence/';
export const mutationCaseName='reloj009 reintroduccion del patron original detecta tres montajes';
export function verificationFiles(){
 const paths=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{encoding:'utf8'}).trim().split(/\r?\n/);
 return [...new Set(paths)].filter(p=>/^(src|test|test-support|browser-tests|change-tests|scripts|rls-tests|supabase\/migrations)\//.test(p)||/^playwright.*\.config\.js$/.test(p)||['package.json','pnpm-lock.yaml','.node-version','.github/workflows/ci.yml'].includes(p)).sort();
}
export function verificationHash(){const hash=createHash('sha256');for(const file of verificationFiles())hash.update(file).update(readFileSync(file,'utf8').replace(/\r\n/g,'\n'));return hash.digest('hex');}
export function verifyClockPins(){
 const baseline=JSON.parse(readFileSync(clockDirectory+'baseline.json'));assert.equal(baseline.previousPins.length,116);assert.equal(new Set(baseline.previousPins.map(p=>p.file)).size,116);assert.equal(baseline.pins.length,7);
 let amended=0;for(const pin of baseline.previousPins){const actual=digest(pin.file);if(actual!==pin.sha256){amended++;assert(clockPinTargets.some(t=>t.file===pin.file));}assert.equal(actual,approvedClockPinHash(pin.file,pin.sha256),pin.file);}
 for(const pin of baseline.pins)assert.equal(digest(pin.file),pin.sha256,pin.file);
 assert.equal(sourceHash(),baseline.sourceHash);
 return {previousVerified:116,intact:116-amended,amended,newIntact:7};
}
export function verifyClockTrace(manifest,ids,results,options={}){
 const report=verifyTrace(manifest,ids,results,options);if(manifest.spec!=='009-reloj-pruebas')report.errors.push('Spec 009 incorrecta');
 for(const row of manifest.requirements){if(!Array.isArray(row.plannedTests)||!row.plannedTests.length)report.errors.push('Sin oráculo previsto: '+row.id);else if(row.status!=='pending'&&JSON.stringify(row.tests)!==JSON.stringify(row.plannedTests))report.errors.push('Oráculo diferente del plan: '+row.id);}
 return report;
}
export function validateClockMutationEvidence(report,expectedHash){
 assert.equal(report.passed,true);assert.equal(report.cleanupPassed,true);assert.equal(report.verificationHash,expectedHash);assert.match(expectedHash,/^[a-f0-9]{64}$/);
 assert.equal(report.sourceHash,sourceHash());assert.equal(report.positiveControls,3);assert.equal(report.mutations.length,3);
 assert.deepEqual(report.mutations.map(m=>m.fixture).sort(),['borrado','guardado','interfaz']);
 for(const m of report.mutations){assert.equal(m.detected,true);assert.equal(m.positiveControlPassed,true);assert.equal(m.scriptsInjectedOnFailure,0);assert.match(m.error,/Cannot fast-forward to the past/);assert.doesNotMatch(m.error,/TypeError|ReferenceError|SyntaxError|ERR_MODULE_NOT_FOUND/);}
 return [{name:mutationCaseName,status:'passed'}];
}
