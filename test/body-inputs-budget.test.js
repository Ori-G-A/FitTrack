import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {bodyBudgetTargets,canonicalBodyBudgetSource,validateBodyBudgetRecord,approvedBodyInputBudgetPinHash} from '../scripts/body-inputs-budget-amendments.js';
const directory='specs/010-entradas-cuerpo/evidence/';
const digest=text=>createHash('sha256').update(text.replace(/\r\n/g,'\n')).digest('hex');
test('cuerpo010 presupuesto propio conserva aserciones y rechaza adendas ajenas',()=>{
 const baseline=JSON.parse(readFileSync(directory+'baseline.json')),originals=Object.fromEntries(bodyBudgetTargets.map(file=>[file,readFileSync(directory+'original-files/'+file+'.txt','utf8')]));
 // Control estructural sintético; los replay/verde reales se validan al resolver.
 const record={approvedPlan:baseline.approvedPlan,timeout:120000,originalSourceHash:baseline.sourceHash,gpinVerificationHash:baseline.verificationHash,configHash:baseline.pins.find(p=>p.file==='playwright.body-inputs.config.js').sha256,assertionsChanged:false,legacyBudgetsChanged:false,originalReplay:'budget-original-replay.json',originalReplaySha:'a'.repeat(64),candidateVerificationHash:'b'.repeat(64),targets:bodyBudgetTargets.map(file=>({file,before:digest(originals[file]),after:digest(canonicalBodyBudgetSource(file,originals[file]))}))};
 assert.equal(validateBodyBudgetRecord(record,baseline,originals),record);
 for(const change of [r=>r.timeout=300000,r=>r.approvedPlan='ajeno',r=>r.assertionsChanged=true,r=>r.legacyBudgetsChanged=true,r=>r.originalSourceHash='ajeno',r=>r.targets.pop(),r=>r.targets[0].after='falso',r=>r.targets[0].before='falso',r=>r.configHash='falso']){const bad=structuredClone(record);change(bad);assert.throws(()=>validateBodyBudgetRecord(bad,baseline,originals));}
 const altered={...originals,[bodyBudgetTargets[0]]:originals[bodyBudgetTargets[0]]+'\nthrow Error("aserción ajena");\n'},forged=structuredClone(record);forged.targets[0].after=digest(canonicalBodyBudgetSource(bodyBudgetTargets[0],altered[bodyBudgetTargets[0]]));assert.throws(()=>validateBodyBudgetRecord(forged,baseline,altered));assert.throws(()=>canonicalBodyBudgetSource('archivo-ajeno','texto'));assert.equal(approvedBodyInputBudgetPinHash('archivo-ajeno','original'),'original');
});
