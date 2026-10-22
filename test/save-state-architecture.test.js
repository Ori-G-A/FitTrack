import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {verifySaveStatePins,approvedSavePinHash} from '../scripts/save-state-evidence.js';
import {verifyInterfacePins} from '../scripts/interface-pins.js';
async function check(contents){const r=await build({...(contents?{stdin:{contents,resolveDir:process.cwd(),sourcefile:'save007-layer-fixture.js'}}:{entryPoints:['src/save-coordinator.js']}),bundle:true,write:false,metafile:true,platform:'browser'});for(const file of Object.keys(r.metafile.inputs)){assert.ok(['src/save-coordinator.js','save007-layer-fixture.js'].includes(file),'dependencia impura '+file);const text=file==='save007-layer-fixture.js'?contents:await readFile(file,'utf8');assert.doesNotMatch(text,/\b(?:window|document|localStorage|fetch)\b/,'efecto de navegador '+file);}}
test('guardado007 arquitectura y negativos de dependencia',async()=>{await check();await assert.rejects(check('export * from "react";'),/dependencia impura/);await assert.rejects(check('export const read=()=>document.title;'),/efecto de navegador/);});
test('guardado007 firmas originales y enmiendas explicitas',()=>{assert.equal(verifySaveStatePins(),6);assert.equal(verifyInterfacePins().verified,101);assert.throws(()=>approvedSavePinHash('test/data-sync.test.js','firma falsa'),{name:'AssertionError'});assert.equal(approvedSavePinHash('archivo-no-autorizado','firma original'),'firma original');});
