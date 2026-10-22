import {approvedSavePinHash} from '../scripts/save-state-evidence.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {build,transform} from 'esbuild';
import {evaluateWeightPace,compareWeightExpected} from '../src/goals-model.js';
import {paceWeights,paceGoals,today} from '../test-support/nutrition-fixtures.js';
const pure=['nutrition-config','nutrition-numbers','nutrition-protein','nutrition-model','nutrition-records','nutrition-metrics','goals-model','goals-operations'];
async function pureGraph(contents){
 const r=await build({stdin:{contents,resolveDir:resolve('.'),sourcefile:'architecture-fixture.js'},bundle:true,write:false,metafile:true,format:'esm',platform:'browser',define:{'import.meta.env':'{}','process.env.NODE_ENV':'"production"'},logLevel:'silent'});
 for(const f of Object.keys(r.metafile.inputs)){
  if(f==='<define:import.meta.env>')continue;
  assert.doesNotMatch(f,/node_modules|supabase|FitTrack|app-utils|\.jsx$/,'dependencia impura: '+f);
  const text=f==='architecture-fixture.js'?contents:await readFile(f,'utf8');const {code}=await transform(text,{minifyWhitespace:true,legalComments:'none'});
  assert.doesNotMatch(code,/\b(?:window|document|localStorage|sessionStorage|navigator|fetch|XMLHttpRequest|WebSocket)\b/,'API de navegador en '+f);
 }
}
test('nutricion capas puras y negativos transitivos',async()=>{
 for(const n of pure)await pureGraph(`export * from './src/${n}.js';`);
 for(const fixture of ["export * from 'react';","export * from './src/app-utils.js';","export * from './src/supabase.js';","export * from './src/FitTrack.jsx';","export const read=()=>window.localStorage;"])await assert.rejects(()=>pureGraph(fixture),{name:'AssertionError'});
});
test('nutricion inferencia se invoca despues de guardas con entradas originales',()=>{
 const fail=()=>{throw Error('inferencia prematura');};assert.equal(evaluateWeightPace([],paceGoals,today,fail),null);assert.equal(compareWeightExpected([],paceGoals,today,fail),null);
 const weights=paceWeights();let calls=0;
 const pace=evaluateWeightPace(weights,paceGoals,today,points=>{calls++;assert.equal(points.length,22);assert.deepEqual(points[0],{x:0,y:70});return -.9/7;});assert.equal(calls,1);assert.equal(pace.next,2300);
 calls=0;const result=compareWeightExpected(weights,{weeklyChange:-.4,targetWeight:65},today,(received,date)=>{calls++;assert.equal(received,weights);assert.equal(date,today);return {perWeek:-.9};});assert.equal(calls,1);assert.equal(result.perWeek,-.9);assert(result.projection>today);
});
test('nutricion mantiene hashes congelados propios y anteriores',async()=>{
 const b=JSON.parse(await readFile('specs/004-nutricion-objetivos/evidence/baseline.json','utf8'));assert.equal(b.pins.length,18);assert.equal(b.previousPinsVerified.length,22);
 for(const p of [...b.pins,...b.previousPinsVerified]){const s=(await readFile(p.file,'utf8')).replace(/\r\n/g,'\n');assert.equal(createHash('sha256').update(s).digest('hex'),approvedSavePinHash(p.file,p.sha256),p.file);}
});
