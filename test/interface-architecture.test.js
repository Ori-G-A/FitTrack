import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {build,transform} from 'esbuild';
import {verifyInterfacePins} from '../scripts/interface-pins.js';

function rejectCycles(inputs) {
 const visiting=new Set(),done=new Set();
 function walk(file){assert(!visiting.has(file),'ciclo '+file);if(done.has(file))return;visiting.add(file);for(const edge of inputs[file]?.imports||[])if(inputs[edge.path])walk(edge.path);visiting.delete(file);done.add(file);}
 for(const file of Object.keys(inputs))walk(file);
}

async function pureGraph(contents) {
 const result=await build({stdin:{contents,resolveDir:resolve('.'),sourcefile:'interface-layer-fixture.js'},bundle:true,write:false,metafile:true,format:'esm',platform:'browser',define:{'import.meta.env':'{}'},logLevel:'silent'});
 for(const file of Object.keys(result.metafile.inputs)){
  if(file==='<define:import.meta.env>')continue;
  if(file.startsWith('src/'))assert(['src/app-navigation.js','src/ui-theme.js'].includes(file),'dependencia ajena a datos de interfaz '+file);
  assert.doesNotMatch(file,/node_modules|supabase|app-utils|\.jsx$/,'dependencia impura '+file);
  const source=file==='interface-layer-fixture.js'?contents:await readFile(file,'utf8');
  const {code}=await transform(source,{minifyWhitespace:true,legalComments:'none'});
  assert.doesNotMatch(code,/\b(?:window|document|localStorage|sessionStorage|navigator|fetch|XMLHttpRequest|WebSocket)\b/,'API de navegador '+file);
 }
 rejectCycles(result.metafile.inputs);
}

test('interfaz navegacion pura y negativos transitivos',async()=>{
 await pureGraph('export * from "./src/app-navigation.js"; export * from "./src/ui-theme.js";');
 for(const source of ['export * from "react";','export * from "./src/app-utils.js";','export * from "./src/app-styles.js";','export * from "./src/supabase.js";','export const read=()=>window.localStorage;'])await assert.rejects(()=>pureGraph(source),{name:'AssertionError'});
});

test('interfaz verifica todos los pins congelados de E0',async()=>{
 assert.equal(verifyInterfacePins().verified,101);
});

async function themeGraph(contents) {
 const result=await build({stdin:{contents,resolveDir:resolve('.'),sourcefile:'interface-theme-fixture.js'},bundle:true,write:false,metafile:true,format:'esm',platform:'browser',define:{'import.meta.env':'{}'},logLevel:'silent'});
 for(const file of Object.keys(result.metafile.inputs)){
  if(file.startsWith('src/'))assert(['src/ui-theme.js','src/use-app-theme.js'].includes(file),'dependencia ajena al tema '+file);
  if(file.includes('node_modules'))assert.match(file,/node_modules\/(?:\.pnpm\/react@[^/]+\/node_modules\/)?react\//,'servicio externo al tema '+file);
 }
 rejectCycles(result.metafile.inputs);
}

test('interfaz tema aislado y negativos de dependencias',async()=>{
 await themeGraph('export * from "./src/use-app-theme.js";');
 for(const source of ['export * from "./src/app-utils.js";','export * from "./src/supabase.js";','export * from "./src/body-metrics.js";'])await assert.rejects(()=>themeGraph(source),{name:'AssertionError'});
});

async function shellGraph(contents) {
 const result=await build({stdin:{contents,resolveDir:resolve('.'),sourcefile:'interface-shell-fixture.js'},bundle:true,write:false,metafile:true,format:'esm',platform:'browser',define:{'import.meta.env':'{}'},logLevel:'silent'});
 const allowed=new Set(['src/AppNavigation.jsx','src/app-navigation.js','src/app-styles.js','src/ModalSheet.jsx']);
 for(const file of Object.keys(result.metafile.inputs)){
  if(file.startsWith('src/'))assert(allowed.has(file),'dependencia ajena al shell '+file);
  if(file.includes('node_modules'))assert.match(file,/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:react|lucide-react)\//,'servicio externo al shell '+file);
  if(file.startsWith('src/')||file==='interface-shell-fixture.js'){
   const source=file==='interface-shell-fixture.js'?contents:await readFile(file,'utf8');
   const {code}=await transform(source,{loader:file.endsWith('.jsx')?'jsx':'js',minifyWhitespace:true,legalComments:'none'});
   assert.doesNotMatch(code,/\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage)\b/,'servicio directo en presentación '+file);
  }
 }
 rejectCycles(result.metafile.inputs);
}

test('interfaz shell presenta sin dominio ni servicios y sin ciclos',async()=>{
 await shellGraph('export * from "./src/AppNavigation.jsx"; export * from "./src/app-styles.js"; export { default as ModalSheet } from "./src/ModalSheet.jsx";');
 for(const source of ['export * from "./src/app-utils.js";','export * from "./src/supabase.js";','export * from "./src/body-metrics.js";','export * from "./src/data-sync.js";','export const read=()=>fetch("https://sdd.invalid");','export const read=()=>localStorage;'])await assert.rejects(()=>shellGraph(source),{name:'AssertionError'});
});

test('interfaz detecta ciclos en grafo compilado de fixture',async()=>{
 const result=await build({stdin:{contents:'export * from "cycle:a";',resolveDir:resolve('.'),sourcefile:'cycle-fixture.js'},bundle:true,write:false,metafile:true,format:'esm',logLevel:'silent',plugins:[{name:'ciclo-controlado',setup(b){b.onResolve({filter:/^cycle:/},args=>({path:args.path,namespace:'cycle'}));b.onLoad({filter:/.*/,namespace:'cycle'},args=>({contents:args.path==='cycle:a'?'export { b } from "cycle:b"; export const a=1;':'export { a } from "cycle:a"; export const b=2;',loader:'js'}));}}]});
 assert.throws(()=>rejectCycles(result.metafile.inputs),/ciclo/);
});
